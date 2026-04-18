from backend.llm import LLM
from tools.openclaw import OpenClaw
import os

llm = LLM()
oc = OpenClaw()
project_path = os.path.join(os.getcwd(), 'user', 'project', 'test-buggy-app')

steps = []
modified_files = []

print("=== Step 1: Listing files ===")
list_result = oc.list_files(project_path)
print(f"Result: {list_result}")
steps.append(f"Listing files in {project_path}")

if list_result.get('success'):
    files = list_result.get('files')
    code_files = [f for f in files if f.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go'))]
    print(f"\n=== Code files found: {code_files} ===")

    for file_path in code_files:
        full_path = os.path.join(project_path, file_path)
        print(f"\n--- Processing {full_path} ---")
        steps.append(f"Reading file: {full_path}")
        read_result = oc.read_file(full_path)

        if read_result.get('success'):
            code = read_result.get('content', '')
            if code:
                print("--- Code content ---")
                print(code[:200])

                steps.append(f"Analyzing code in {file_path}")
                analysis = llm.analyze_code(code)

                print(f"--- Bugs: {analysis.get('bugs')} ---")

                if len(analysis.get('bugs', [])) > 0:
                    print("--- Found bugs! ---")
                    print(f"Fixed code (first 200 chars): {analysis.get('fixed_code')[:200]}")
                    steps.append(f"Fixing code in {file_path}")

                    write_result = oc.write_file(full_path, analysis.get('fixed_code', code))
                    print(f"Write result: {write_result}")

                    if write_result.get('success'):
                        modified_files.append({
                            'file': file_path,
                            'bugs_fixed': analysis.get('bugs', []),
                            'quality_score': analysis.get('quality_score', 0)
                        })
                        print("ADDED TO MODIFIED FILES!")

print(f"\n=== FINAL: Modified files: {len(modified_files)} files ===")
print(modified_files)
