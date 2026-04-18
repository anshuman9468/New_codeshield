from typing import Dict, Any, List
from .llm import LLM
from .planner import PlannerAgent
from .executor import ExecutorAgent
from .security import SecurityValidator
from .memory import Memory
from tools.openclaw import OpenClaw


class CodeShieldAgent:
    def __init__(self):
        self.llm = LLM()
        self.security = SecurityValidator()
        self.memory = Memory()
        self.openclaw = OpenClaw()
        self.planner = PlannerAgent(self.llm)
        self.executor = ExecutorAgent(self.security, self.memory, self.openclaw)

    def analyze_code(self, code: str) -> Dict[str, Any]:
        return self.llm.analyze_code(code)

    def analyze_project(self, project_path: str) -> Dict[str, Any]:
        steps = []
        modified_files = []
        summary = ""

        try:
            steps.append(f"Listing files in {project_path}")
            list_result = self.executor.execute('list_files', {'path': project_path})

            if not list_result.get('success', False):
                return {
                    'success': False,
                    'error': list_result.get('error', 'Failed to list files'),
                    'steps': steps,
                    'modified_files': []
                }

            files = list_result.get('files', [])
            code_files = [f for f in files if f.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go'))]

            import os
            for file_path in code_files:
                full_path = os.path.join(project_path, file_path)
                steps.append(f"Reading file: {full_path}")
                read_result = self.executor.execute('read_file', {'path': full_path})

                if not read_result.get('success', False):
                    continue

                code = read_result.get('content', '')
                if not code:
                    continue

                steps.append(f"Analyzing code in {file_path}")
                analysis = self.llm.analyze_code(code)

                if len(analysis.get('bugs', [])) > 0:
                    bugs = analysis.get('bugs', [])
                    if len(bugs) == 1 and "No obvious bugs found" in bugs[0]:
                        continue
                    steps.append(f"Fixing code in {file_path}")
                    write_result = self.executor.execute('write_file', {
                        'path': full_path,
                        'content': analysis.get('fixed_code', code)
                    })

                    if write_result.get('success', False):
                        modified_files.append({
                            'file': file_path,
                            'bugs_fixed': analysis.get('bugs', []),
                            'quality_score': analysis.get('quality_score', 0)
                        })

            summary = f"Analyzed {len(code_files)} files, fixed {len(modified_files)} files"
            steps.append(summary)

            return {
                'success': True,
                'steps': steps,
                'modified_files': modified_files,
                'summary': summary
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'steps': steps,
                'modified_files': modified_files
            }
