import requests
import json

print("Testing CodeShield Backend...")

# Test health endpoint
print("\n1. Testing /health endpoint:")
try:
    response = requests.get("http://localhost:8000/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test analyze_code endpoint
print("\n2. Testing /analyze_code endpoint:")
test_code = """def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

def divide(a, b):
    return a / b
"""

try:
    response = requests.post(
        "http://localhost:8000/analyze_code",
        json={"code": test_code},
        headers={"Content-Type": "application/json"}
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Success: {result.get('success')}")
    if result.get('success'):
        data = result.get('data', {})
        print(f"   Bugs: {data.get('bugs')}")
        print(f"   Quality Score: {data.get('quality_score')}/100")
except Exception as e:
    print(f"   Error: {e}")

print("\n✅ Backend tests completed!")
