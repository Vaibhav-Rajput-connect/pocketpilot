import urllib.request
import json

try:
    req1 = urllib.request.Request(
        "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/auth/signup", 
        data=json.dumps({"email":"test7@example.com","password":"Testpassword123!","full_name":"Test"}).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    res1 = urllib.request.urlopen(req1)
    cookies = []
    for k, v in res1.info().items():
        if k.lower() == 'set-cookie':
            cookies.append(v.split(';')[0])
except urllib.error.HTTPError as e:
    if e.code == 400: # Already exists? Try login
        req1 = urllib.request.Request(
            "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/auth/login", 
            data=b"username=test7%40example.com&password=Testpassword123!", 
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        res1 = urllib.request.urlopen(req1)
        cookies = []
        for k, v in res1.info().items():
            if k.lower() == 'set-cookie':
                cookies.append(v.split(';')[0])

req2 = urllib.request.Request(
    "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/analytics/intelligent", 
    headers={'Cookie': '; '.join(cookies)}
)
try:
    res2 = urllib.request.urlopen(req2)
    print("Success:", res2.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
