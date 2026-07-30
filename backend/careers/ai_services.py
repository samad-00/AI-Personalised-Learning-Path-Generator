import json
from groq import Groq
from django.conf import settings


def _groq_call(prompt, max_tokens=4000):
    client = Groq(api_key=settings.GROQ_API_KEY)
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content.strip()
    except Exception as e:
        if '429' in str(e) or 'rate limit' in str(e).lower() or 'tokens per day' in str(e).lower():
            print("Rate limit hit on primary model. Falling back to llama-3.1-8b-instant...")
            
            import time
            fallback_success = False
            for attempt in range(5):
                try:
                    response = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.4,
                        max_tokens=min(max_tokens, 2500),
                    )
                    content = response.choices[0].message.content.strip()
                    fallback_success = True
                    break
                except Exception as fallback_e:
                    if '429' in str(fallback_e) or 'rate limit' in str(fallback_e).lower():
                        print(f"Fallback rate limit hit (attempt {attempt+1}/5). Retrying in 3s...")
                        time.sleep(3)
                    else:
                        raise fallback_e
            
            if not fallback_success:
                print("Groq backup model also failed. Falling back to OpenRouter API...")
                import requests
                import os
                or_key = getattr(settings, 'OPENROUTER_API_KEY', os.environ.get('OPENROUTER_API_KEY', ''))
                headers = {
                    "Authorization": f"Bearer {or_key}",
                    "Content-Type": "application/json"
                }
                data = {
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.4,
                    "max_tokens": min(max_tokens, 2500)
                }
                or_response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
                if or_response.status_code == 200:
                    content = or_response.json()['choices'][0]['message']['content'].strip()
                else:
                    raise Exception(f"All backups failed. OpenRouter error: {or_response.text}")
        else:
            raise e
    # Strip markdown code blocks if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()
    return json.loads(content)


def generate_mock_interview(
    job_role, skills, job_description,
    test_type='full',
    question_count=20,
    max_tokens=5000
):
    """Generate mode-specific interview questions based on test_type and question_count."""

    n = question_count  # shorthand

    base_ctx = f"""Target Role: {job_role}
Skills: {skills}
Job Description: {job_description or 'None provided'}

CRITICAL INSTRUCTION: Be extremely concise! Keep all explanations, tips, and hints to a MAXIMUM of 1 brief sentence. This is necessary to save tokens."""

    # ── MCQ Only ─────────────────────────────────────────────────────────
    if test_type == 'mcq_only':
        prompt = f"""You are an expert technical recruiter. Generate MCQ-only questions.

{base_ctx}

Return ONLY valid JSON (no markdown):
{{
  "mcqs": [
    {{
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "Why this answer is correct"
    }}
  ],
  "analytical": [],
  "coding": [],
  "rapid_fire": [],
  "soft_skills": []
}}

IMPORTANT: Generate EXACTLY {n} high-quality MCQs testing core technical knowledge for {job_role}.
- Cover a wide range of topics relevant to the role and skills listed.
- Vary difficulty: mix easy, medium, and hard questions.
- Each question must have 4 distinct answer options.
- Explanations should be concise but informative.
Return ONLY the JSON. Do not truncate — include all {n} MCQs."""

    # ── Coding ───────────────────────────────────────────────────────────
    elif test_type == 'coding':
        # For coding, max 5 but respect the count if under 5
        coding_count = min(n, 5)
        prompt = f"""You are a senior software engineer conducting a coding interview.

{base_ctx}

Return ONLY valid JSON (no markdown):
{{
  "mcqs": [],
  "analytical": [],
  "coding": [
    {{
      "question": "Problem statement with clear requirements",
      "language": "Python",
      "starter_code": "# Provide valid python starter function template",
      "hints": "Approach hint",
      "sample_input": "example input",
      "sample_output": "expected output",
      "difficulty": "Medium",
      "time_limit": "30 minutes"
    }}
  ],
  "rapid_fire": [],
  "soft_skills": []
}}

IMPORTANT: Generate EXACTLY {coding_count} coding challenges appropriate for {job_role}.
- Include a starter_code template for each problem
- Vary difficulty: mix Easy, Medium, Hard
- Make problems clearly defined with realistic sample inputs/outputs
Return ONLY the JSON. Include all {coding_count} problems."""

    # ── Rapid Fire ───────────────────────────────────────────────────────
    elif test_type == 'rapid':
        prompt = f"""You are a fast-paced technical interviewer.

{base_ctx}

Return ONLY valid JSON (no markdown):
{{
  "mcqs": [],
  "analytical": [],
  "coding": [],
  "rapid_fire": [
    {{
      "question": "Quick question?",
      "ideal_answer": "Short 1-2 sentence answer"
    }}
  ],
  "soft_skills": []
}}

IMPORTANT: Generate EXACTLY {n} rapid-fire questions for {job_role}.
- Each question must be answerable in 30 seconds or less.
- Cover technical concepts, definitions, and quick problem-solving.
- Vary the difficulty and topic area.
Return ONLY the JSON. Include all {n} rapid-fire questions."""

    # ── Soft Skills ──────────────────────────────────────────────────────
    elif test_type == 'soft_skills':
        prompt = f"""You are an expert behavioral interviewer.

{base_ctx}

Return ONLY valid JSON (no markdown):
{{
  "mcqs": [],
  "analytical": [],
  "coding": [],
  "rapid_fire": [],
  "soft_skills": [
    {{
      "question": "Behavioral question?",
      "what_to_demonstrate": "Skills/qualities to show in the answer"
    }}
  ]
}}

IMPORTANT: Generate EXACTLY {n} behavioral and soft skills questions for {job_role}.
- Cover: teamwork, conflict resolution, leadership, communication, adaptability,
  problem-solving mindset, time management, receiving feedback, initiative.
- Each question should target a distinct competency.
Return ONLY the JSON. Include all {n} soft skills questions."""

    # ── Analytical ───────────────────────────────────────────────────────
    elif test_type == 'analytical':
        prompt = f"""You are an expert interviewer focusing on logical reasoning and analytical thinking.

{base_ctx}

Return ONLY valid JSON (no markdown):
{{
  "mcqs": [],
  "coding": [],
  "rapid_fire": [],
  "analytical": [
    {{
      "question": "Situational or analytical problem?",
      "tips_to_answer": "Use STAR method: Situation, Task, Action, Result",
      "ideal_answer": "A structured, concise example of a good answer"
    }}
  ],
  "soft_skills": []
}}

IMPORTANT: Generate EXACTLY {n} analytical and situational questions for {job_role}.
- Focus on logical reasoning, systemic design thinking, or structured problem solving.
- Provide practical tips on how to answer each question.
Return ONLY the JSON. Include all {n} analytical questions."""

    # ── Full Mock Interview ───────────────────────────────────────────────
    else:
        # Distribute counts so that the total sum equals EXACTLY n
        coding_n     = min(5, max(1, round(n * 0.10)))
        analytical_n = max(1, round(n * 0.15))
        soft_n       = max(1, round(n * 0.20))
        rapid_n      = max(1, round(n * 0.25))
        mcq_n        = n - (coding_n + analytical_n + soft_n + rapid_n)

        import concurrent.futures

        def fetch_section(t_type, count):
            if count == 0: return {}
            # Recursively call generate_mock_interview for the specific section.
            # Distribute max_tokens evenly across the 5 workers.
            sub_tokens = max(1000, max_tokens // 5 + 100)
            try:
                return generate_mock_interview(job_role, skills, job_description, t_type, count, max_tokens=sub_tokens)
            except Exception as e:
                err_str = str(e).lower()
                print(f"Exception in fetch_section ({t_type}): {type(e)} - {err_str}")
                if "on cooldown" in err_str or "429" in err_str or "rate limit" in err_str or "tokens per day" in err_str or "too many requests" in err_str or "exhausted" in err_str or "token limit" in err_str:
                    raise e
                return {}

        merged_result = {
            "mcqs": [], "analytical": [], "coding": [], "rapid_fire": [], "soft_skills": []
        }

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_type = {
                executor.submit(fetch_section, 'mcq_only', mcq_n): 'mcqs',
                executor.submit(fetch_section, 'analytical', analytical_n): 'analytical',
                executor.submit(fetch_section, 'coding', coding_n): 'coding',
                executor.submit(fetch_section, 'rapid', rapid_n): 'rapid_fire',
                executor.submit(fetch_section, 'soft_skills', soft_n): 'soft_skills',
            }
            for future in concurrent.futures.as_completed(future_to_type):
                section_key = future_to_type[future]
                try:
                    res_dict = future.result()
                    # Each sub-mode returns its questions under its own key (e.g. res_dict['mcqs'])
                    if section_key in res_dict and isinstance(res_dict[section_key], list):
                        merged_result[section_key] = res_dict[section_key]
                except Exception as e:
                    err_str = str(e).lower()
                    print(f"Exception in fetch_section loop: {type(e)} - {err_str}")
                    if "on cooldown" in err_str or "429" in err_str or "rate limit" in err_str or "tokens per day" in err_str or "too many requests" in err_str or "exhausted" in err_str or "token limit" in err_str:
                        raise e
                    pass

        return merged_result

    # For all other modes (mcq, coding, analytical, etc), execute the prompt
    return _groq_call(prompt, max_tokens=max_tokens)


def analyze_cv_with_ai(cv_text, job_role, job_description):
    """Analyze CV with ATS scoring and job matching."""
    prompt = f"""You are an expert ATS system and senior recruiter. Analyze this resume comprehensively.

Target Role: {job_role}
Job Description: {job_description or 'General analysis requested'}

Resume Text:
{cv_text[:4000]}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "ats_score": 72,
  "job_match_score": 68,
  "strengths": ["Strong Python skills", "Good project experience"],
  "weaknesses": ["Missing Docker experience", "No cloud certifications"],
  "suggestions": ["Add keywords: Kubernetes, CI/CD", "Quantify achievements with numbers"],
  "skills_found": ["Python", "React", "SQL"],
  "skills_missing": ["Docker", "AWS", "Kubernetes"],
  "recommended_roles": [
    {{"role": "Full Stack Developer", "match": 85}},
    {{"role": "Backend Engineer", "match": 80}},
    {{"role": "Software Engineer", "match": 75}}
  ],
  "projects_analysis": "Good project variety but lacks scale/impact metrics",
  "overall_feedback": "Strong technical foundation. Focus on adding cloud and DevOps skills."
}}

Guidelines:
- ats_score: 0-100 based on keyword matching, formatting, and content
- job_match_score: 0-100 for how well CV matches the specific role
- Be specific and actionable in suggestions
- recommended_roles: suggest 3-5 roles based on the actual CV content
"""
    return _groq_call(prompt, max_tokens=2000)
