from typing import Dict, Any
from .llm import LLM


class PlannerAgent:
    def __init__(self, llm: LLM):
        self.llm = llm

    def plan(self, request: str, context: str = "") -> Dict[str, Any]:
        return self.llm.plan_steps(request, context)
