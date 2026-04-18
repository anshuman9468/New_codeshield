import requests
import json

print("=== Testing Project Analysis with Fixed Security ===\n")

test_path = r"d:\New_codeshield\user\project\test-buggy-app"

print(f"Testing path: {test_path}\n")

try:
    response = requests.post(
        "http://localhost:8000/analyze_project",
        json={"path": test_path},
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    
    print(f"Status Code: {response.status_code}")
    print("\nResponse:")
    result = response.json()
    print(json.dumps(result, indent=2))
    
except Exception as e:
    print(f"Error: {e}")
