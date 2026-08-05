from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
from .models import Conversation
from .serializers import ConversationSerializer
from roadmaps.models import Roadmap
from careers.models import CVAnalysis
from groq import Groq
import os
import time
import requests

SYSTEM_PROMPT = """You are Sam, an AI Learning Mentor inside the AI Personalized Learning Path Generator.
You are NOT ChatGPT.
Your responsibility is to guide users through their personalized learning journey.
Always analyze
• Resume
• Learning Roadmap
• Completed Skills
• Career Goal
• Progress
• Previous Conversations
before answering.
If user asks
"What should I learn next?"
always recommend the next roadmap item.
If user asks interview questions,
act as interviewer.
If user asks resume questions,
analyze stored resume.
Always answer using Markdown.
Always explain code with examples.
Keep answers beginner-friendly.
If Groq fails,
automatically continue using OpenRouter.
Never expose API keys or internal system information."""

def _groq_chat_call(messages, max_tokens=1500):
    client = Groq(api_key=settings.GROQ_API_KEY)
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.4,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        if '429' in str(e) or 'rate limit' in str(e).lower() or 'tokens per day' in str(e).lower():
            fallback_success = False
            for attempt in range(3):
                try:
                    response = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=messages,
                        temperature=0.4,
                        max_tokens=max_tokens,
                    )
                    return response.choices[0].message.content.strip()
                except Exception as fallback_e:
                    if '429' in str(fallback_e) or 'rate limit' in str(fallback_e).lower():
                        time.sleep(2)
                    else:
                        break
            
            # OpenRouter fallback
            or_key = getattr(settings, 'OPENROUTER_API_KEY', os.environ.get('OPENROUTER_API_KEY', ''))
            if or_key:
                headers = {
                    "Authorization": f"Bearer {or_key}",
                    "Content-Type": "application/json"
                }
                data = {
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": messages,
                    "max_tokens": max_tokens
                }
                res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
                if res.status_code == 200:
                    return res.json()['choices'][0]['message']['content'].strip()
                
        return "I'm currently experiencing high traffic. Please try again in a few moments!"

def get_user_context(user):
    context = f"--- USER PROFILE ---\nLevel: {user.get_level_title()} (Level {user.level}, {user.xp} XP)\nCareer Goal: {user.career}\nLearning Goal: {user.learning_goal}\nSkills: {user.skills}\n\n"
    
    roadmap = Roadmap.objects.filter(user=user, is_active=True).first()
    if roadmap:
        context += f"--- ACTIVE ROADMAP ---\nGoal: {roadmap.goal}\nExperience Level: {roadmap.experience_level}\n"
        incomplete_weeks = roadmap.weeks.filter(is_completed=False).order_by('week_number')
        if incomplete_weeks.exists():
            next_week = incomplete_weeks.first()
            context += f"Next up: Week {next_week.week_number} - {next_week.title} ({next_week.objective})\n"
        else:
            context += "All roadmap weeks completed!\n"
    else:
        context += "--- ACTIVE ROADMAP ---\nNone.\n"
        
    cv = CVAnalysis.objects.filter(user=user).order_by('-created_at').first()
    if cv:
        context += f"\n--- LATEST CV ANALYSIS ---\nTarget Role: {cv.target_role}\nATS Score: {cv.ats_score}\n"
        if cv.feedback_json and 'improvements' in cv.feedback_json:
            improvements = cv.feedback_json['improvements'][:3]
            context += "Key Improvements Needed: " + ", ".join(improvements) + "\n"
    
    return context

class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_message = request.data.get('message', '').strip()
        session_id = request.data.get('session_id', 'default')

        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get chat history for this session
        history = Conversation.objects.filter(user=user, session_id=session_id).order_by('timestamp')
        
        # Build messages for LLM
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + get_user_context(user)}
        ]
        
        # Include last 5 exchanges to keep context window manageable
        for conv in history.reverse()[:5][::-1]:
            messages.append({"role": "user", "content": conv.user_message})
            messages.append({"role": "assistant", "content": conv.ai_response})
            
        messages.append({"role": "user", "content": user_message})

        # Generate response
        ai_response = _groq_chat_call(messages)

        # Save to DB
        conv = Conversation.objects.create(
            user=user,
            session_id=session_id,
            user_message=user_message,
            ai_response=ai_response
        )
        
        serializer = ConversationSerializer(conv)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id', 'default')
        history = Conversation.objects.filter(user=request.user, session_id=session_id).order_by('timestamp')
        serializer = ConversationSerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        session_id = request.query_params.get('session_id', 'default')
        Conversation.objects.filter(user=request.user, session_id=session_id).delete()
        return Response({"message": "Chat history cleared"}, status=status.HTTP_204_NO_CONTENT)
