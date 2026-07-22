def check_and_award_badges(user):
    awarded = []
    existing = set(user.badges.values_list('name', flat=True))

    all_badges = [
        {
            'name': 'First Step',
            'description': 'Completed your first resource',
            'emoji': '👣',
            'condition': user.total_resources_completed >= 1
        },
        {
            'name': 'Week Warrior',
            'description': 'Completed your first full week',
            'emoji': '⚔️',
            'condition': user.total_weeks_completed >= 1
        },
        {
            'name': 'On Fire',
            'description': 'Maintained a 3-day streak',
            'emoji': '🔥',
            'condition': user.streak >= 3
        },
        {
            'name': 'Dedicated',
            'description': 'Maintained a 7-day streak',
            'emoji': '💪',
            'condition': user.streak >= 7
        },
        {
            'name': 'Resource Hunter',
            'description': 'Completed 10 resources',
            'emoji': '🎯',
            'condition': user.total_resources_completed >= 10
        },
        {
            'name': 'Scholar',
            'description': 'Completed 25 resources',
            'emoji': '📚',
            'condition': user.total_resources_completed >= 25
        },
        {
            'name': 'Roadmap Master',
            'description': 'Completed a full roadmap',
            'emoji': '🗺️',
            'condition': user.total_roadmaps_completed >= 1
        },
        {
            'name': 'Level Up',
            'description': 'Reached level 5',
            'emoji': '⬆️',
            'condition': user.level >= 5
        },
        {
            'name': 'Legend',
            'description': 'Reached level 10',
            'emoji': '👑',
            'condition': user.level >= 10
        },
        {
            'name': 'Speed Learner',
            'description': 'Completed 5 resources in one day',
            'emoji': '⚡',
            'condition': user.total_resources_completed >= 5
        },
    ]

    for badge in all_badges:
        if badge['condition'] and badge['name'] not in existing:
            from accounts.models import Badge
            Badge.objects.create(
                user=user,
                name=badge['name'],
                description=badge['description'],
                emoji=badge['emoji']
            )
            awarded.append(badge)

    return awarded