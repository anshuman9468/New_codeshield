import os
from backend.security import SecurityValidator

validator = SecurityValidator()

print("=== Testing Security Validator ===\n")

print("Current Working Directory:", os.getcwd())
print("\nAllowed Base Directories:")
for dir in validator.allowed_base_dirs:
    print(f"  - {dir} (norm: {os.path.normpath(dir)})")

test_path = r"d:\New_codeshield\user\project\sample project"
print(f"\nTesting path: {test_path}")

allowed, error = validator.is_path_allowed(test_path)
print(f"Allowed? {allowed}")
if not allowed:
    print(f"Error: {error}")

print("\nTesting with forward slashes:")
test_path2 = "d:/New_codeshield/user/project/sample project"
allowed2, error2 = validator.is_path_allowed(test_path2)
print(f"  Path: {test_path2}")
print(f"  Allowed? {allowed2}")
if not allowed2:
    print(f"  Error: {error2}")

print("\nTesting without space:")
test_path3 = r"d:\New_codeshield\user\project"
allowed3, error3 = validator.is_path_allowed(test_path3)
print(f"  Path: {test_path3}")
print(f"  Allowed? {allowed3}")
if not allowed3:
    print(f"  Error: {error3}")
