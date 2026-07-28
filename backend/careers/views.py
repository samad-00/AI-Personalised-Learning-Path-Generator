import io
import os
import sys
import subprocess
import tempfile
import requests as http_requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CVAnalysis, MockInterview
from .ai_services import generate_mock_interview, analyze_cv_with_ai


try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False


class GenerateMockInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_role = request.data.get('job_role', '').strip()
        skills = request.data.get('skills', '').strip()
        job_description = request.data.get('job_description', '').strip()
        test_type = request.data.get('test_type', 'full')
        question_count = int(request.data.get('question_count', 20))
        question_count = max(10, min(50, question_count))  # clamp 10–50

        if not job_role:
            return Response({'error': 'Job role is required'}, status=400)

        try:
            # Scale max_tokens with question count (each question ~150 tokens)
            max_tokens = min(8000, 3000 + question_count * 120)
            questions_json = generate_mock_interview(
                job_role, skills, job_description, test_type, question_count, max_tokens
            )
            interview = MockInterview.objects.create(
                user=request.user,
                job_role=job_role,
                skills=skills,
                job_description=job_description,
                questions_json=questions_json
            )
            return Response({'id': interview.id, 'questions': questions_json, 'job_role': job_role})
        except Exception as e:
            import traceback
            print("Mock interview error:", traceback.format_exc())
            return Response({'error': f'AI generation failed: {str(e)}'}, status=500)


class AnalyzeCVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_role = request.data.get('job_role', '').strip()
        job_description = request.data.get('job_description', '').strip()
        resume_file = request.FILES.get('resume')
        resume_text = request.data.get('resume_text', '').strip()

        if not job_role:
            return Response({'error': 'Job role is required'}, status=400)

        if not resume_file and not resume_text:
            return Response({'error': 'Resume file or text is required'}, status=400)

        try:
            cv_text = resume_text
            if resume_file:
                if resume_file.name.lower().endswith('.pdf') and HAS_PYPDF2:
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(resume_file.read()))
                    extracted = ''
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text:
                            extracted += text + '\n'
                    if extracted.strip():
                        cv_text = extracted + '\n' + cv_text
                else:
                    file_text = resume_file.read().decode('utf-8', errors='ignore')
                    cv_text = file_text + '\n' + cv_text

            if not cv_text.strip():
                return Response({'error': 'Could not extract text from the resume'}, status=400)

            analysis = analyze_cv_with_ai(cv_text, job_role, job_description)

            cv_obj = CVAnalysis.objects.create(
                user=request.user,
                target_role=job_role,
                job_description=job_description,
                ats_score=analysis.get('ats_score', 0),
                feedback_json=analysis
            )
            return Response({'id': cv_obj.id, 'analysis': analysis})
        except Exception as e:
            import traceback
            print("CV analysis error:", traceback.format_exc())
            return Response({'error': f'Analysis failed: {str(e)}'}, status=500)


# ---------------------------------------------------------------------------
# Code Execution — runs on the server side so there are no browser CORS issues
# ---------------------------------------------------------------------------
PISTON_LANG_MAP = {
    'JavaScript': {'language': 'javascript', 'version': '18.15.0', 'ext': 'js'},
    'TypeScript': {'language': 'typescript', 'version': '5.0.3',   'ext': 'ts'},
    'Java':       {'language': 'java',       'version': '15.0.2',  'ext': 'java'},
    'C++':        {'language': 'c++',        'version': '10.2.0',  'ext': 'cpp'},
    'C':          {'language': 'c',          'version': '10.2.0',  'ext': 'c'},
    'Go':         {'language': 'go',         'version': '1.16.2',  'ext': 'go'},
    'Ruby':       {'language': 'ruby',       'version': '3.0.1',   'ext': 'rb'},
    'Rust':       {'language': 'rust',       'version': '1.50.0',  'ext': 'rs'},
    'Kotlin':     {'language': 'kotlin',     'version': '1.8.20',  'ext': 'kt'},
}

PISTON_URLS = [
    'https://emkc.org/api/v2/piston/execute',
    'https://piston.kirillzhosul.ru/api/v2/piston/execute',
]


class ExecuteCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code     = request.data.get('code', '').strip()
        language = request.data.get('language', 'Python')
        stdin    = request.data.get('stdin', '')

        if not code:
            return Response({'output': '', 'error': 'No code provided.', 'status': 'Error'})

        try:
            if language == 'Python':
                result = self._run_python(code, stdin)
            else:
                result = self._run_via_piston(code, language, stdin)
            return Response(result)
        except Exception as e:
            import traceback
            print("Code execution error:", traceback.format_exc())
            return Response({'output': '', 'error': str(e), 'status': 'Error'})

    # ── Python runs natively on the server ──────────────────────────────
    def _run_python(self, code, stdin):
        tmp = None
        try:
            with tempfile.NamedTemporaryFile(
                mode='w', suffix='.py', delete=False, encoding='utf-8'
            ) as f:
                f.write(code)
                tmp = f.name

            proc = subprocess.run(
                [sys.executable, tmp],
                input=stdin or '',
                capture_output=True,
                text=True,
                timeout=10,
            )
            stdout = proc.stdout.strip()
            stderr = proc.stderr.strip()

            if proc.returncode != 0:
                return {'output': stdout, 'error': stderr or 'Runtime error (non-zero exit).', 'status': 'Error'}
            if not stdout:
                return {
                    'output': '(No output)\n💡 Tip: Use print() to display your result.',
                    'error': stderr,
                    'status': 'No Output',
                }
            return {'output': stdout, 'error': stderr, 'status': 'Success'}

        except subprocess.TimeoutExpired:
            return {'output': '', 'error': 'Execution timed out (10s limit).', 'status': 'Error'}
        finally:
            if tmp and os.path.exists(tmp):
                os.unlink(tmp)

    # ── Other languages go through Piston (server-side, no CORS) ────────
    def _run_via_piston(self, code, language, stdin):
        cfg = PISTON_LANG_MAP.get(language)
        if not cfg:
            return {'output': '', 'error': f'Language "{language}" is not supported.', 'status': 'Error'}

        file_name = 'Main.java' if language == 'Java' else f'main.{cfg["ext"]}'
        payload = {
            'language': cfg['language'],
            'version':  cfg['version'],
            'files': [{'name': file_name, 'content': code}],
            'stdin': stdin or '',
            'run_timeout': 8000,
        }

        last_error = 'All execution servers are unavailable.'
        for url in PISTON_URLS:
            try:
                res = http_requests.post(url, json=payload, timeout=15)
                if not res.ok:
                    last_error = f'Piston returned {res.status_code}'
                    continue

                data = res.json()
                run     = data.get('run', {})
                compile_ = data.get('compile', {})

                exit_code = run.get('code') if run.get('code') is not None else (compile_.get('code') or 0)
                stdout = (run.get('stdout') or '').strip()
                stderr = (run.get('stderr') or compile_.get('stderr') or compile_.get('output') or '').strip()

                if exit_code != 0 or (stderr and not stdout):
                    return {'output': stdout, 'error': stderr or 'Execution error.', 'status': 'Error'}
                if stderr:
                    return {'output': stdout, 'error': stderr, 'status': 'Warning'}
                if not stdout:
                    return {
                        'output': '(No output)\n💡 Tip: Use System.out.println() / cout << / fmt.Println() etc.',
                        'error': '',
                        'status': 'No Output',
                    }
                return {'output': stdout, 'error': '', 'status': 'Success'}

            except Exception as exc:
                last_error = str(exc)
                continue

        return {'output': '', 'error': last_error, 'status': 'Error'}

