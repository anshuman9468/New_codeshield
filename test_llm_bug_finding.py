from backend.llm import LLM

llm = LLM()

# Let's simulate utils.py content!
test_code = '''def calculate_total(data):
    total = 0

    for item in data:
        total += item["value"]

    avg = total / len([])   # BUG: division by zero

    return total + avg'''

print("=== Testing LLM bug detection ===\n")
print("Code to analyze:")
print(test_code)
print("\n--- Analysis Result ---")
result = llm.analyze_code(test_code)
print(f"Bugs found: {result.get('bugs')}")
print(f"Fixed code:\n{result.get('fixed_code')}")
print(f"Quality score: {result.get('quality_score')}")
