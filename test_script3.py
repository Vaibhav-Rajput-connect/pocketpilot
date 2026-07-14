import urllib.request
import json

try:
    req1 = urllib.request.Request(
        "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/auth/signup", 
        data=json.dumps({"email":"test8@example.com","password":"Testpassword123!","full_name":"Test"}).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    res1 = urllib.request.urlopen(req1)
    cookies = []
    for k, v in res1.info().items():
        if k.lower() == 'set-cookie':
            cookies.append(v.split(';')[0])
except urllib.error.HTTPError as e:
    pass # Assume cookies are retrieved on login later if needed, but for now we rely on a clean test user

req2 = urllib.request.Request(
    "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/analytics/summary", 
    headers={'Cookie': '; '.join(cookies)}
)
try:
    res2 = urllib.request.urlopen(req2)
    print("Summary Success:", res2.read().decode('utf-8'))
except Exception as e:
    print("Summary Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
