import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

import traceback
from careers.ai_services import generate_mock_interview

try:
    print(generate_mock_interview('Software Engineer', 'Python', '', 'mcq_only', 4, 1100))
except Exception:
    traceback.print_exc()
