import urllib.request
import json

API_KEY = "dtn_47e5dfafb39a2948217b7de8b92d632be81f5efd7fe1058cd049130ef91d82b1"
BASE_URL = "https://app.daytona.io/api"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

def main():
    print("Listing sandboxes...")
    url = f"{BASE_URL}/sandbox"
    
    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            print("\n[SUCCESS] Sandboxes List:")
            print(json.dumps(res_json, indent=2))
    except urllib.error.HTTPError as e:
        print(f"\n[ERROR] HTTP {e.code}: {e.reason}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"\n[ERROR] Request failed: {e}")

if __name__ == "__main__":
    main()
