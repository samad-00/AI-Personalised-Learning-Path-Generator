from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Roadmap, Week, Resource
from .serializers import RoadmapSerializer, WeekSerializer
from .ai_generator import generate_roadmap, regenerate_week
from accounts.badges import check_and_award_badges

XP_REWARDS = {
    'complete_resource': 10,
    'rate_resource': 5,
    'complete_week': 50,
    'complete_roadmap': 200,
    'generate_roadmap': 15,
}

class GenerateRoadmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        goal = request.data.get('goal')
        experience_level = request.data.get('experience_level', 'beginner')
        if not goal:
            return Response({'error': 'Goal is required'}, status=400)
        try:
            roadmap_data = generate_roadmap(goal, experience_level)
            roadmap = Roadmap.objects.create(
                user=request.user, 
                goal=goal, 
                experience_level=experience_level,
                topics_overview=roadmap_data.get('topics_overview', [])
            )
            for week_data in roadmap_data['weeks']:
                week = Week.objects.create(
                    roadmap=roadmap,
                    week_number=week_data['week_number'],
                    title=week_data['title'],
                    objective=week_data['objective']
                )
                for res_data in week_data['resources']:
                    Resource.objects.create(
                        week=week,
                        title=res_data['title'],
                        url=res_data.get('url', ''),
                        resource_type=res_data['resource_type'],
                        description=res_data.get('description', ''),
                        duration=res_data.get('duration', '')
                    )
            request.user.add_xp(XP_REWARDS['generate_roadmap'])
            new_badges = check_and_award_badges(request.user)
            serializer = RoadmapSerializer(roadmap)
            return Response({
                **serializer.data,
                'xp_awarded': XP_REWARDS['generate_roadmap'],
                'new_badges': new_badges
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class RoadmapListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RoadmapSerializer

    def get_queryset(self):
        return Roadmap.objects.filter(user=self.request.user).order_by('-created_at')


class RoadmapDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RoadmapSerializer

    def get_queryset(self):
        return Roadmap.objects.filter(user=self.request.user)


class RateResourceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(
                id=resource_id, week__roadmap__user=request.user
            )
            was_completed = resource.is_completed
            resource.difficulty_rating = request.data.get('difficulty_rating')
            new_completed = request.data.get('is_completed', False)
            resource.is_completed = new_completed
            resource.save()

            xp_awarded = 0
            new_badges = []

            if resource.difficulty_rating:
                request.user.add_xp(XP_REWARDS['rate_resource'])
                xp_awarded += XP_REWARDS['rate_resource']

            if new_completed and not was_completed:
                request.user.add_xp(XP_REWARDS['complete_resource'])
                xp_awarded += XP_REWARDS['complete_resource']
                request.user.total_resources_completed += 1
                request.user.save()

                week = resource.week
                if all(r.is_completed for r in week.resources.all()):
                    request.user.add_xp(XP_REWARDS['complete_week'])
                    xp_awarded += XP_REWARDS['complete_week']
                    request.user.total_weeks_completed += 1
                    request.user.save()

                    roadmap = week.roadmap
                    if all(
                        all(r.is_completed for r in w.resources.all())
                        for w in roadmap.weeks.all()
                    ):
                        request.user.add_xp(XP_REWARDS['complete_roadmap'])
                        xp_awarded += XP_REWARDS['complete_roadmap']
                        request.user.total_roadmaps_completed += 1
                        request.user.save()

                new_badges = check_and_award_badges(request.user)

            avg_difficulty = self._get_week_average(resource.week)
            return Response({
                'message': 'Rating saved',
                'xp_awarded': xp_awarded,
                'new_badges': new_badges,
                'suggest_regenerate': avg_difficulty and avg_difficulty > 3.5,
                'avg_difficulty': avg_difficulty,
                'user_xp': request.user.xp,
                'user_level': request.user.level,
                'user_streak': request.user.streak,
            })
        except Resource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=404)

    def _get_week_average(self, week):
        ratings = week.resources.filter(
            difficulty_rating__isnull=False
        ).values_list('difficulty_rating', flat=True)
        if ratings:
            return sum(ratings) / len(ratings)
        return None


class RegenerateWeekView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, week_id):
        try:
            week = Week.objects.get(id=week_id, roadmap__user=request.user)
            ratings = list(week.resources.filter(
                difficulty_rating__isnull=False
            ).values_list('difficulty_rating', flat=True))
            avg_difficulty = sum(ratings) / len(ratings) if ratings else 3
            completed = list(week.resources.filter(
                is_completed=True
            ).values_list('title', flat=True))
            new_week_data = regenerate_week(
                week.roadmap.goal, week.week_number, avg_difficulty, completed
            )
            week.title = new_week_data['title']
            week.objective = new_week_data['objective']
            week.save()
            week.resources.all().delete()
            for res_data in new_week_data['resources']:
                Resource.objects.create(
                    week=week,
                    title=res_data['title'],
                    url=res_data.get('url', ''),
                    resource_type=res_data['resource_type'],
                    description=res_data.get('description', ''),
                    duration=res_data.get('duration', '')
                )
            serializer = WeekSerializer(week)
            return Response(serializer.data)
        except Week.DoesNotExist:
            return Response({'error': 'Week not found'}, status=404)


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        top_users = User.objects.order_by('-xp')
        data = [
            {
                'rank': i + 1,
                'username': u.username,
                'xp': u.xp,
                'level': u.level,
                'level_title': u.get_level_title(),
                'streak': u.streak,
                'is_me': u.id == request.user.id
            }
            for i, u in enumerate(top_users)
        ]
        return Response(data)


class SaveNotesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(
                id=resource_id, week__roadmap__user=request.user
            )
            resource.notes = request.data.get('notes', '')
            resource.save()
            return Response({'message': 'Notes saved!'})
        except Resource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=404)
class SharedRoadmapView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, share_token):
        try:
            roadmap = Roadmap.objects.get(share_token=share_token)
            serializer = RoadmapSerializer(roadmap)
            return Response(serializer.data)
        except Roadmap.DoesNotExist:
            return Response({'error': 'Roadmap not found'}, status=404)
class ResourceSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import requests as req
        query = request.query_params.get('q', '')
        resource_type = request.query_params.get('type', 'article')

        if not query:
            return Response({'error': 'Query required'}, status=400)

        # Build search query based on type
        if resource_type == 'article':
            search_query = f"{query} tutorial site:freecodecamp.org OR site:geeksforgeeks.org OR site:realpython.com OR site:developer.mozilla.org"
        elif resource_type == 'exercise':
            search_query = f"{query} practice site:hackerrank.com OR site:leetcode.com OR site:kaggle.com OR site:codecademy.com"
        elif resource_type == 'book':
            search_query = f"{query} book site:goodreads.com OR site:amazon.com"
        else:
            search_query = f"{query} tutorial"

        try:
            response = req.post(
                'https://google.serper.dev/search',
                headers={
                    'X-API-KEY': settings.SERPER_API_KEY,
                    'Content-Type': 'application/json'
                },
                json={'q': search_query, 'num': 1}
            )
            data = response.json()
            if data.get('organic') and len(data['organic']) > 0:
                top_url = data['organic'][0]['link']
                return Response({'url': top_url})
            return Response({'url': None})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
class ExportRoadmapPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            from .pdf_generator import generate_roadmap_pdf, upload_to_s3
            import uuid

            roadmap = Roadmap.objects.get(id=pk, user=request.user)
            buffer = generate_roadmap_pdf(roadmap, request.user)

            filename = f"roadmaps/{request.user.id}/{uuid.uuid4()}-{roadmap.goal[:30].replace(' ', '-')}.pdf"
            url = upload_to_s3(buffer, filename)

            return Response({'pdf_url': url, 'filename': filename})
        except Roadmap.DoesNotExist:
            return Response({'error': 'Roadmap not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)