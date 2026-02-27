import json
import http.client
import uuid
from pathlib import Path

sample_path = Path('backend/test_eval.csv')
sample_path.write_text(
    'roll_no,name,department,semester,parent_phone,parent_email,arrears,photo_url\n'
    'SIST2023999,Test Student,CSE,6,+919876543210,parent@example.com,4,\n',
    encoding='utf-8',
)

# health
conn = http.client.HTTPConnection('localhost', 3001, timeout=15)
conn.request('GET', '/api/health')
health_res = conn.getresponse()
health = json.loads(health_res.read().decode())
conn.close()

# multipart upload
file_content = sample_path.read_bytes()
boundary = f'----Boundary{uuid.uuid4().hex}'
head = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="{sample_path.name}"\r\n'
    'Content-Type: text/csv\r\n\r\n'
).encode('utf-8')
body = head + file_content + f'\r\n--{boundary}--\r\n'.encode('utf-8')
headers = {
    'Content-Type': f'multipart/form-data; boundary={boundary}',
    'Content-Length': str(len(body)),
}

conn = http.client.HTTPConnection('localhost', 3001, timeout=45)
conn.request('POST', '/api/evaluation/analyze-document', body=body, headers=headers)
analysis_res = conn.getresponse()
analysis = json.loads(analysis_res.read().decode())
conn.close()

# profile verification
conn = http.client.HTTPConnection('localhost', 3001, timeout=15)
conn.request('GET', '/api/students/SIST2023999')
profile_res = conn.getresponse()
profile = json.loads(profile_res.read().decode())
conn.close()

result = {
    'health': health,
    'analysis': {
        'processedRecords': analysis.get('processedRecords'),
        'alerts': analysis.get('alerts'),
        'usedAI': analysis.get('usedAI'),
        'topFindings': analysis.get('topFindings'),
    },
    'profileSummary': {
        'roll_no': profile.get('student', {}).get('roll_no'),
        'name': profile.get('student', {}).get('name'),
        'arrears_count': profile.get('student', {}).get('arrears_count'),
        'photo_url_present': bool(profile.get('student', {}).get('photo_url')),
        'notifications_count': len(profile.get('notifications', [])),
        'alert_actions_count': len(profile.get('alertActions', [])),
    },
}

print(json.dumps(result, indent=2))
