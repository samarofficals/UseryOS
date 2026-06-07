import urllib.request
import json

API_KEY = "dtn_47e5dfafb39a2948217b7de8b92d632be81f5efd7fe1058cd049130ef91d82b1"
SANDBOX_ID = "061beffb-263f-4935-bae0-137d6ba0e68f"
PROXY_URL = "https://proxy.app-eu.daytona.io/toolbox"

def main():
    print(f"Testing execution on sandbox {SANDBOX_ID}...")
    url = f"{PROXY_URL}/process/execute"
    
    payload = {
        "command": "uname -a",
        "timeout": 30
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "X-Daytona-Sandbox-Id": SANDBOX_ID,
        "X-Daytona-Organization-ID": "7224e08d-e7f6-4211-8111-4fb0797cd46b",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            print("\n[SUCCESS] Command Executed!")
            print(json.dumps(res_json, indent=2))
    except urllib.error.HTTPError as e:
        print(f"\n[ERROR] HTTP {e.code}: {e.reason}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"\n[ERROR] Request failed: {e}")

if __name__ == "__main__":
    main()
