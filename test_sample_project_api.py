import requests

BACKEND_URL = "http://localhost:8000"

print("=== Testing D:\\sample project via API ===\n")

# Test 1: Health Check
print("1. Testing backend health...")
try:
    health_r = requests.get(f"{BACKEND_URL}/health")
    print(f"   Status: {health_r.status_code}")
    print(f"   Response: {health_r.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Project Mode Analysis
print("\n2. Testing D:\\sample project...")
try:
    payload = {
        "path": r"D:\sample project"
    }
    analysis_r = requests.post(f"{BACKEND_URL}/analyze_project", json=payload, timeout=60)
    print(f"   Status: {analysis_r.status_code}")
    print(f"   Response: {analysis_r.json()}")
except Exception as e:
    print(f"   Error: {e}")
