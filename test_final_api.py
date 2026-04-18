import requests
import os

BACKEND_URL = "http://localhost:8000"

# Test with our test-buggy-app
project_path = os.path.join(os.getcwd(), 'user', 'project', 'test-buggy-app')

print(f"=== Testing Project: {project_path} ===\n")

# Test 1: Health Check
print("1. Testing backend health...")
try:
    health_r = requests.get(f"{BACKEND_URL}/health")
    print(f"   Status: {health_r.status_code}")
    print(f"   Response: {health_r.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Project Analysis
print("\n2. Testing project analysis...")
try:
    payload = {
        "path": project_path
    }
    analysis_r = requests.post(f"{BACKEND_URL}/analyze_project", json=payload, timeout=60)
    print(f"   Status: {analysis_r.status_code}")
    print(f"\n   Response:\n{analysis_r.json()}")
except Exception as e:
    print(f"   Error: {e}")
