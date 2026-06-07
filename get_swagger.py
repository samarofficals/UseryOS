import urllib.request
import json

def main():
    url = "https://app.daytona.io/api/docs/openapi.json"
    print(f"Fetching OpenAPI spec from {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        print("Successfully fetched OpenAPI spec!")
        
        # Check paths
        paths = data.get("paths", {})
        
        # Let's print out the paths that deal with workspace or sandbox
        workspace_paths = [p for p in paths.keys() if "workspace" in p or "sandbox" in p]
        print("\nRelevant endpoints:")
        for wp in workspace_paths:
            print(f"  {wp}: {list(paths[wp].keys())}")
            
        # If there's a POST on /workspace or /api/workspace
        workspace_post = None
        for p in ["/workspace", "/api/workspace", "/sandbox", "/api/sandbox"]:
            if p in paths and "post" in paths[p]:
                workspace_post = paths[p]["post"]
                print(f"\nFound POST endpoint: {p}")
                break
                
        if workspace_post:
            request_body = workspace_post.get("requestBody", {})
            content = request_body.get("content", {})
            json_content = content.get("application/json", {})
            schema_ref = json_content.get("schema", {}).get("$ref", "")
            print(f"Schema reference: {schema_ref}")
            
            # Find the schema in components/schemas
            schema_name = schema_ref.split("/")[-1]
            schemas = data.get("components", {}).get("schemas", {})
            schema = schemas.get(schema_name, {})
            
            print(f"\nSchema '{schema_name}' fields:")
            for prop_name, prop_val in schema.get("properties", {}).items():
                print(f"  {prop_name}: {prop_val.get('type')} (required: {prop_name in schema.get('required', [])})")
                if prop_name == "projects":
                    # Check items schema
                    items_ref = prop_val.get("items", {}).get("$ref", "")
                    items_name = items_ref.split("/")[-1]
                    items_schema = schemas.get(items_name, {})
                    print(f"    -> items schema '{items_name}':")
                    for ip_name, ip_val in items_schema.get("properties", {}).items():
                        print(f"       {ip_name}: {ip_val.get('type')}")
                        if ip_name == "repository":
                            repo_ref = ip_val.get("$ref", "")
                            repo_name = repo_ref.split("/")[-1]
                            repo_schema = schemas.get(repo_name, {})
                            print(f"          -> repo schema '{repo_name}':")
                            for rp_name, rp_val in repo_schema.get("properties", {}).items():
                                print(f"             {rp_name}: {rp_val.get('type')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
