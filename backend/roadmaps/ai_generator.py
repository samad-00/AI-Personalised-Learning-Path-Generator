import json
import requests
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq
from django.conf import settings

# Timeout per individual URL check (seconds)
URL_CHECK_TIMEOUT = 4


def generate_roadmap(goal, experience_level='beginner'):
    prompt = f"""
You are an expert learning coach. Create a structured learning roadmap.
Analyze the user's Goal to determine the requested duration. You can create a roadmap of up to 12 weeks (3 months). If no duration is specified, default to 12 weeks.

Goal: {goal}
Experience Level: {experience_level}

Return ONLY a valid JSON object in this exact format:
{{
  "goal": "{goal}",
  "topics_overview": [
    {{
      "topic": "Core Topic Name",
      "subtopics": ["Subtopic 1", "Subtopic 2"]
    }}
  ],
  "weeks": [
    {{
      "week_number": 1,
      "title": "Week title here",
      "objective": "What the learner will achieve this week",
      "resources": [
        {{
          "title": "Exact resource title",
          "url": "https://exact-url.com",
          "resource_type": "video",
          "description": "Why this resource is useful",
          "duration": "2 hours"
        }}
      ]
    }}
  ]
}}

Rules:
- STRICTLY adapt the content, pacing, and resource difficulty to the user's Experience Level ({experience_level}). 
  * If beginner: Assume zero prior knowledge, focus on fundamentals, basics, and easy introductions.
  * If intermediate: Skip absolute basics, focus on practical applications, building, and intermediate concepts.
  * If advanced: Focus on complex architectures, deep dives, best practices, optimization, and advanced engineering topics.
- For `topics_overview`: Generate a highly EXHAUSTIVE and COMPREHENSIVE chart map. It MUST include EVERY single topic and subtopic needed to master the skill from absolute zero to 100%. Do not skip any foundational or advanced concepts. Break down the subject into deep, detailed subtopics.
- Create the appropriate number of weeks based on the duration specified in the Goal, up to a maximum of 12 weeks. Default to 12 weeks if none is specified.
- Each week has 3-4 resources
- resource_type must be one of: video, article, book, exercise
- Start at the appropriate difficulty for {experience_level} and progressively increase difficulty
- For videos: use ONLY these well-known YouTube videos with real IDs:
  * Python basics: https://www.youtube.com/watch?v=rfscVS0vtbw
  * Use real, famous YouTube tutorial video URLs you are confident exist
  * Format: https://www.youtube.com/watch?v=REAL_VIDEO_ID
- For articles: use ONLY real article URLs from these trusted sites you are confident exist:
  * https://www.freecodecamp.org/news/
  * https://realpython.com/
  * https://www.geeksforgeeks.org/
  * https://developer.mozilla.org/
  * https://www.w3schools.com/
- For books: ONLY recommend free, openly available books. Format: https://openlibrary.org/search?q=BOOK+TITLE
- For exercises: use real URLs from https://www.kaggle.com/learn or https://www.hackerrank.com/domains or https://leetcode.com/problemset/
- Only include URLs you are 100 percent confident exist and are working
- Return ONLY the JSON, no extra text
"""

    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4000,
    )

    content = response.choices[0].message.content.strip()
    content = content.replace('```json', '').replace('```', '').strip()
    roadmap_data = json.loads(content)

    # Collect all resources across all weeks for parallel verification
    all_resources = [
        resource
        for week in roadmap_data['weeks']
        for resource in week['resources']
    ]

    # Verify all URLs in parallel — dramatically faster than sequential
    _fix_resources_parallel(all_resources)

    return roadmap_data


def _fix_resources_parallel(resources):
    """Check all resource URLs in parallel and replace invalid ones with fallbacks."""
    def check_and_fix(resource):
        url = resource.get('url', '')
        is_valid = True

        if not url or not url.startswith('http'):
            is_valid = False
        elif resource.get('resource_type') == 'video' and 'youtube.com' not in url and 'youtu.be' not in url:
            is_valid = False
        elif not verify_url(url):
            is_valid = False

        if not is_valid:
            resource['url'] = get_fallback_url(resource['title'], resource['resource_type'])

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_and_fix, r): r for r in resources}
        for future in as_completed(futures):
            try:
                future.result()
            except Exception:
                # If a single check crashes, leave the resource as-is
                pass


def verify_url(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'}
        if 'youtube.com/watch' in url or 'youtu.be/' in url:
            oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}"
            response = requests.get(oembed_url, timeout=URL_CHECK_TIMEOUT, headers=headers)
            return response.status_code == 200

        response = requests.head(url, timeout=URL_CHECK_TIMEOUT, allow_redirects=True, headers=headers)

        # Some sites block HEAD requests — fallback to a lightweight GET
        if response.status_code in (403, 405):
            response = requests.get(url, timeout=URL_CHECK_TIMEOUT, stream=True, headers=headers)

        return response.status_code < 400
    except Exception:
        return False


def get_fallback_url(title, resource_type):
    query = requests.utils.quote(title)
    if resource_type == 'video':
        return f"https://www.youtube.com/results?search_query={query}+tutorial"
    elif resource_type == 'book':
        return f"https://openlibrary.org/search?q={query}"
    elif resource_type == 'exercise':
        return f"https://leetcode.com/problemset/?search={query}"
    else:
        return f"https://www.freecodecamp.org/news/search/?query={query}"


def regenerate_week(goal, week_number, difficulty_feedback, completed_topics):
    prompt = f"""
You are an expert learning coach adjusting a learning roadmap.

Original goal: {goal}
Week number: {week_number}
User difficulty feedback: {difficulty_feedback} (1=too easy, 3=perfect, 5=too hard)
Topics already covered: {completed_topics}

The user rated this week as {"too difficult - add more foundational resources" if difficulty_feedback > 3 else "too easy - make it more challenging"}.

Return ONLY a valid JSON object for the adjusted week:
{{
  "week_number": {week_number},
  "title": "Adjusted week title",
  "objective": "Updated objective based on feedback",
  "resources": [
    {{
      "title": "Resource title",
      "url": "https://exact-url.com",
      "resource_type": "video",
      "description": "Why this resource helps",
      "duration": "2 hours"
    }}
  ]
}}

Same URL rules as before - only use real, verified URLs you are 100 percent confident exist.
Return ONLY the JSON, no extra text.
"""

    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000,
    )

    content = response.choices[0].message.content.strip()
    content = content.replace('```json', '').replace('```', '').strip()
    week_data = json.loads(content)

    # Verify week resources in parallel too
    _fix_resources_parallel(week_data['resources'])

    return week_data