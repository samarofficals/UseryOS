#!/usr/bin/env python3
import time
import sys

try:
    from daytona import Daytona, DaytonaConfig
except ImportError:
    print("Error: Daytona SDK is not installed yet. Please wait for pip install to finish.")
    sys.exit(1)

# Daytona Cloud Configuration
API_KEY = "dtn_47e5dfafb39a2948217b7de8b92d632be81f5efd7fe1058cd049130ef91d82b1"

def main():
    print("Initializing Daytona Client...")
    config = DaytonaConfig(api_key=API_KEY)
    daytona = Daytona(config)
    
    print("Creating Daytona Sandbox...")
    try:
        # Create a new sandbox instance
        sandbox = daytona.create()
        print(f"\n[SUCCESS] Sandbox created successfully!")
        print(f"Sandbox ID: {sandbox.id}")
        
        # Clone our repository
        repo_url = "https://github.com/samarofficals/UseryOS.git"
        dest_dir = "/workspace"
        print(f"\nCloning Git repository: {repo_url} into {dest_dir}...")
        
        # Execute clone
        clone_cmd = f"git clone {repo_url} {dest_dir}"
        print(f"Running command: {clone_cmd}")
        res = sandbox.process.exec(clone_cmd)
        
        if res.exit_code == 0:
            print("\nRepository cloned successfully!")
        else:
            print(f"\nClone failed with exit code: {res.exit_code}")
            print(f"Error output:\n{res.result}")
            
        # Verify files
        print("\nListing files in /workspace:")
        ls_res = sandbox.process.exec("ls -la /workspace")
        print(ls_res.result)
        
        print("\nSystem specifications inside the sandbox:")
        uname_res = sandbox.process.exec("uname -a")
        print(uname_res.result)
        
        print("\n============================================================")
        print("                 SANDBOX DEPLOYMENT COMPLETE!")
        print("============================================================")
        print("Your secure, isolated Usery OS development sandbox is active.")
        print(f"Sandbox ID: {sandbox.id}")
        print("You can run commands directly using the Daytona CLI or API.")
        print("============================================================")
        
    except Exception as e:
        print(f"\n[ERROR] Failed to deploy Daytona Sandbox: {e}")

if __name__ == "__main__":
    main()
