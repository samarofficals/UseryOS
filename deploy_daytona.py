#!/usr/bin/env python3
import sys
import os
import subprocess
import urllib.request
import json

# Daytona Credentials
DAYTONA_API_KEY = "dtn_47e5dfafb39a2948217b7de8b92d632be81f5efd7fe1058cd049130ef91d82b1"
DAYTONA_API_URL = "https://app.daytona.io/api"

def run_cmd(cmd, cwd=None):
    print(f"Executing: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error: {res.stderr.strip()}")
        return False, res.stdout, res.stderr
    return True, res.stdout, res.stderr

def main():
    if len(sys.argv) < 2:
        print("Usage: python deploy_daytona.py <GIT_REPOSITORY_URL>")
        print("Example: python deploy_daytona.py https://github.com/yourusername/usery-os.git")
        sys.exit(1)

    repo_url = sys.argv[1]
    
    # 1. Initialize and commit files
    print("\n[Step 1] Committing files to git...")
    success, _, _ = run_cmd("git init")
    if not success:
        sys.exit(1)
        
    run_cmd("git add .")
    success, _, _ = run_cmd('git commit -m "Rebrand to Usery OS with Daytona support"')
    if not success:
        print("Note: Nothing to commit or commit failed.")
        
    # 2. Add remote and push
    print("\n[Step 2] Setting remote and pushing to Git...")
    # Remove existing remote if any
    run_cmd("git remote remove origin")
    success, _, _ = run_cmd(f"git remote add origin {repo_url}")
    if not success:
        sys.exit(1)
        
    # Rename branch to main
    run_cmd("git branch -M main")
    
    print("\nPushing to repository... (Authentication prompts may appear)")
    success, _, _ = run_cmd("git push -u origin main")
    if not success:
        print("Failed to push. Please ensure the repository exists and you have write permissions.")
        sys.exit(1)
        
    print("\nCode pushed successfully!")

    # 3. Call Daytona.io API to spin up the workspace/sandbox
    print("\n[Step 3] Triggering Daytona.io Workspace Creation...")
    
    workspace_name = "usery-os-sandbox"
    payload = {
        "name": workspace_name,
        "projects": [
            {
                "name": "usery-os",
                "source": {
                    "repository": {
                        "url": repo_url
                    }
                }
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {DAYTONA_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
    
    req_url = f"{DAYTONA_API_URL}/workspace"
    print(f"Sending request to: {req_url}")
    
    try:
        req = urllib.request.Request(
            req_url, 
            data=json.dumps(payload).encode('utf-8'), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            print("\n\033[1;32m============================================================\033[0m")
            print("\033[1;32m       DAYTONA WORKSPACE CREATION TRIGGERED SUCCESS!\033[0m")
            print("\033[1;32m============================================================\033[0m")
            print(f"Workspace Name: {res_json.get('name', workspace_name)}")
            print(f"Workspace ID:   {res_json.get('id', 'N/A')}")
            print("Check your Daytona Dashboard at https://app.daytona.io to watch the build progress!")
            print("\033[1;32m============================================================\033[0m")
    except urllib.error.HTTPError as e:
        err_content = e.read().decode('utf-8')
        print(f"\n\033[1;31mDaytona API HTTP Error ({e.code}): {e.reason}\033[0m")
        print(f"Response: {err_content}")
    except Exception as e:
        print(f"\n\033[1;31mError communicating with Daytona API: {e}\033[0m")

if __name__ == "__main__":
    main()
