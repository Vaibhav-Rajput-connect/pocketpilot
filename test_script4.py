import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req1 = urllib.request.Request(
        "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/auth/signup", 
        data=json.dumps({"email":"test9@example.com","password":"Testpassword123!","full_name":"Test"}).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    res1 = urllib.request.urlopen(req1, context=ctx)
    cookies = []
    for k, v in res1.info().items():
        if k.lower() == 'set-cookie':
            cookies.append(v.split(';')[0])
except urllib.error.HTTPError as e:
    pass # Try login if already exists...

req2 = urllib.request.Request(
    "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/analytics/intelligent", 
    headers={'Cookie': '; '.join(cookies)}
)
try:
    res2 = urllib.request.urlopen(req2, context=ctx, timeout=30)
    print("Intelligent Success:", res2.read().decode('utf-8'))
except Exception as e:
    print("Intelligent Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
