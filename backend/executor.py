from typing import Dict, Any
from .security import SecurityValidator
from .memory import Memory
from tools.openclaw import OpenClaw


class ExecutorAgent:
    def __init__(self, security: SecurityValidator, memory: Memory, openclaw: OpenClaw):
        self.security = security
        self.memory = memory
        self.openclaw = openclaw

    def execute(self, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        is_safe, error = self.security.validate_tool_call(tool_name, args)
        if not is_safe:
            return {
                'success': False,
                'error': error
            }

        result = {}
        if tool_name == 'read_file':
            result = self.openclaw.read_file(args['path'])
        elif tool_name == 'write_file':
            result = self.openclaw.write_file(args['path'], args.get('content', ''))
        elif tool_name == 'list_files':
            result = self.openclaw.list_files(args['path'])
        elif tool_name == 'run_command':
            result = self.openclaw.run_command(args['command'])
        else:
            result = {
                'success': False,
                'error': f'Unknown tool: {tool_name}'
            }

        self.memory.add({
            'tool': tool_name,
            'args': args,
            'result': result
        })

        return result
