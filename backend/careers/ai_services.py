import json
from groq import Groq
from django.conf import settings


def _groq_call(prompt, max_tokens=4000):
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=max_tokens,
    )
    content = response.choices[0].message.content.strip()
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

    base_ctx = f"""Job Role: {job_role}
Skills: {skills or 'General'}
Job Description: {job_description or 'General role requirements'}"""

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
        # For coding, max 10 but respect the count if under 10
        coding_count = min(n, 10)
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

    # ── Full Mock Interview ───────────────────────────────────────────────
    else:
        # Distribute counts proportionally across sections
        mcq_n       = max(5, round(n * 0.40))   # ~40%
        rapid_n     = max(5, round(n * 0.30))   # ~30%
        soft_n      = max(3, round(n * 0.20))   # ~20%
        analytical_n = max(2, round(n * 0.10))  # ~10%
        coding_n    = min(4, max(2, round(n * 0.10)))  # 2-4 problems

        prompt = f"""You are an expert technical recruiter. Generate a full mock interview.

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
  "analytical": [
    {{
      "question": "Situational question?",
      "tips_to_answer": "Use STAR method: Situation, Task, Action, Result"
    }}
  ],
  "coding": [
    {{
      "question": "Write a function that...",
      "language": "Python",
      "starter_code": "# Provide valid python starter function template",
      "hints": "Approach hint",
      "sample_input": "example input",
      "sample_output": "expected output",
      "difficulty": "Medium",
      "time_limit": "30 minutes"
    }}
  ],
  "rapid_fire": [
    {{
      "question": "Short quick question?",
      "ideal_answer": "Concise answer"
    }}
  ],
  "soft_skills": [
    {{
      "question": "How do you handle conflict?",
      "what_to_demonstrate": "Empathy, communication, problem-solving"
    }}
  ]
}}

IMPORTANT — Generate EXACTLY the following counts:
- mcqs: {mcq_n} MCQs on core technical knowledge (each with 4 options + explanation)
- analytical: {analytical_n} situational/behavioral questions (with tips_to_answer)
- coding: {coding_n} coding challenges (with starter_code, sample_input, sample_output, difficulty, time_limit)
- rapid_fire: {rapid_n} quick-fire questions (answerable in 30 seconds)
- soft_skills: {soft_n} behavioral/interpersonal questions (with what_to_demonstrate)

Total questions across all sections: {mcq_n + analytical_n + coding_n + rapid_n + soft_n}
Do NOT omit or truncate any section. Return ONLY the JSON."""

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
