import requests

url = "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/auth/signup"
data = {"email":"test3@example.com","password":"Testpassword123!","full_name":"Test User"}
res = requests.post(url, json=data)
print("Signup:", res.status_code)
# Get the cookies from the response headers, ignoring 'secure'
cookies = {}
for cookie in res.cookies:
    cookies[cookie.name] = cookie.value

print("Cookies:", cookies)

res2 = requests.get("http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/analytics/summary", cookies=cookies)
print("Analytics Summary:", res2.status_code, res2.text)
