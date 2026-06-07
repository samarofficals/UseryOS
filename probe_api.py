import urllib.request
import json

API_KEY = "dtn_47e5dfafb39a2948217b7de8b92d632be81f5efd7fe1058cd049130ef91d82b1"
BASE_URL = "https://app.daytona.io"

endpoints = [
    "/api/workspace",
    "/api/workspaces",
    "/api/sandbox",
    "/api/sandboxes",
    "/api/v1/workspace",
    "/api/v1/workspaces",
    "/api/v1/sandbox",
    "/api/v1/sandboxes",
    "/api/docs",
    "/api/swagger.json",
    "/api/openapi.json",
    "/api/v1/docs"
]

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

def probe(endpoint):
    url = f"{BASE_URL}{endpoint}"
    print(f"Probing {url}...", end=" ")
    try:
        # We can try GET first
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req) as res:
            print(f"GET SUCCESS ({res.status})")
            return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print(f"GET returned HTTP {e.code}")
            return
            
    try:
        # If GET is 404, let's try POST
        req = urllib.request.Request(url, data=b"{}", headers=headers, method="POST")
        with urllib.request.urlopen(req) as res:
            print(f"POST SUCCESS ({res.status})")
            return
    except urllib.error.HTTPError as e:
        print(f"Failed (HTTP {e.code})")

def main():
    for ep in endpoints:
        probe(ep)

if __name__ == "__main__":
    main()
