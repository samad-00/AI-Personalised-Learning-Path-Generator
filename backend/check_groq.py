import os
from dotenv import load_dotenv
import urllib.request
import json

load_dotenv()
api_key = os.environ.get("GROQ_API_KEY")

if not api_key:
    print("No API key")
else:
    req = urllib.request.Request('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {api_key}'})
    try:
        resp = urllib.request.urlopen(req).read()
        models = [m['id'] for m in json.loads(resp)['data']]
        print(models)
    except Exception as e:
        print("Error:", e)
