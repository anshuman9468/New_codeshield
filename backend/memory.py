from collections import deque
from typing import List, Dict, Any


class Memory:
    def __init__(self, max_size: int = 5):
        self.history = deque(maxlen=max_size)

    def add(self, action: Dict[str, Any]):
        self.history.append(action)

    def get_recent(self, n: int = 5) -> List[Dict[str, Any]]:
        return list(self.history)[-n:]

    def clear(self):
        self.history.clear()

    def get_context(self) -> str:
        if not self.history:
            return ""
        context = "Recent actions:\n"
        for i, action in enumerate(self.get_recent(), 1):
            context += f"{i}. {action.get('tool', 'unknown')}: {action.get('args', {})}\n"
        return context
