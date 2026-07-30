import os
import groq

client = groq.Groq()
try:
    r = client.chat.completions.create(model='llama3-8b-8192', messages=[{'role':'user','content':'hi'}], max_tokens=10)
    print("SUCCESS")
except Exception as e:
    print(e)
