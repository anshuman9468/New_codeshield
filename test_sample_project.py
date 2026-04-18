import os
from backend.security import SecurityValidator

validator = SecurityValidator()

print("=== Testing D:\\sample project ===\n")

test_path = r"D:\sample project"
print(f"Testing path: {test_path}")

allowed, error = validator.is_path_allowed(test_path)
print(f"Allowed? {allowed}")

if not allowed:
    print(f"Error: {error}")
else:
    print("\n✅ SUCCESS! Path is allowed!")

test_subpath = r"D:\sample project\test.py"
print(f"\nTesting subpath: {test_subpath}")
allowed2, error2 = validator.is_path_allowed(test_subpath)
print(f"Allowed? {allowed2}")
