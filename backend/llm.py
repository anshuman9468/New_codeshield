import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


class LLM:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        self.use_mock = not api_key or api_key == 'your_gemini_api_key_here'
        
        if not self.use_mock:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
            except Exception as e:
                print(f"Warning: Could not initialize Gemini API, using mock mode: {e}")
                self.use_mock = True

    def analyze_code(self, code: str) -> Dict[str, Any]:
        if self.use_mock:
            return self._mock_analyze_code(code)

        try:
            import google.generativeai as genai
            prompt = f"""You are an expert code reviewer and debugger. Analyze this code and provide:
            1. A list of bugs/errors
            2. Fixed code
            3. A code quality score from 0-100
            4. A brief explanation of improvements

            Return only valid JSON in this format:
            {{
                "bugs": ["bug1", "bug2"],
                "fixed_code": "the fixed code here",
                "quality_score": 85,
                "explanation": "brief explanation"
            }}

            Code to analyze:
            {code}
            """
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            import json
            return json.loads(result_text)
        except Exception as e:
            return {
                "bugs": [f"Analysis failed: {str(e)}"],
                "fixed_code": code,
                "quality_score": 0,
                "explanation": "Could not analyze code"
            }

    def _mock_analyze_code(self, code: str) -> Dict[str, Any]:
        bugs = []
        fixed_code = code
        
        if 'divide' in code and 'return a / b' in code:
            bugs.append("Division by zero possible - no check for b == 0")
            fixed_code = fixed_code.replace(
                'def divide(a, b):\n    return a / b',
                'def divide(a, b):\n    if b == 0:\n        raise ValueError("Cannot divide by zero")\n    return a / b'
            )
        
        if 'calculate_average' in code and 'len(numbers)' in code:
            bugs.append("No check for empty list in calculate_average")
            if 'if not numbers:' not in fixed_code:
                fixed_code = fixed_code.replace(
                    'def calculate_average(numbers):\n    total = 0',
                    'def calculate_average(numbers):\n    if not numbers:\n        return 0\n    total = 0'
                )
        
        if 'len([])' in code:
            bugs.append("Division by zero - len([]) causes division by zero!")
            bugs.append("Unnecessary avg calculation - returns total + avg")
            fixed_code = fixed_code.replace(
                'def calculate_total(data):\n    total = 0\n\n    for item in data:\n        total += item["value"]\n\n    avg = total / len([])   # BUG: division by zero\n\n    return total + avg',
                'def calculate_total(data):\n    total = 0\n\n    for item in data:\n        total += item["value"]\n\n    if data:\n        avg = total / len(data)\n    else:\n        avg = 0\n\n    return total'
            )
        
        if 'num % 2 = 0' in code:
            bugs.append("SyntaxError - should be '==' instead of '='")
            fixed_code = fixed_code.replace(
                'if num % 2 = 0:',
                'if num % 2 == 0:'
            )
        
        if 'find_average' in code and 'return total' in code:
            bugs.append("Incorrect average calculation - returns total instead of total/len(numbers)")
            if 'return total' in fixed_code:
                import re
                fixed_code = re.sub(
                    r'def find_average\(numbers\):\s+total = calculate_sum\(numbers\)\s+return total',
                    'def find_average(numbers):\n    if not numbers:\n        return 0\n    total = calculate_sum(numbers)\n    return total / len(numbers)',
                    fixed_code
                )
        
        if not bugs:
            bugs = ["No obvious bugs found - code looks good!"]
            return {
                "bugs": bugs,
                "fixed_code": code,
                "quality_score": 95,
                "explanation": "No fixes needed - code is good!"
            }
        
        return {
            "bugs": bugs,
            "fixed_code": fixed_code,
            "quality_score": 75,
            "explanation": "Added error handling for edge cases"
        }

    def plan_steps(self, user_request: str, context: str = "") -> Dict[str, Any]:
        if self.use_mock:
            return {
                "steps": [
                    "List files in project directory",
                    "Read each code file",
                    "Analyze for bugs",
                    "Apply fixes",
                    "Write fixed files back"
                ]
            }

        try:
            import google.generativeai as genai
            prompt = f"""You are a planning agent. Break down this user request into clear steps.
            Consider this context if provided: {context}

            User request: {user_request}

            Return only valid JSON in this format:
            {{
                "steps": ["step 1", "step 2", "step 3"]
            }}
            """
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            import json
            return json.loads(result_text)
        except Exception as e:
            return {"steps": [f"Planning failed: {str(e)}"]}
