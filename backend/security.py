import os
from typing import List, Optional


class SecurityValidator:
    def __init__(self):
        self.allowed_base_dirs = [
            os.path.abspath('./user/project'),
            os.path.abspath('user/project'),
            os.path.join(os.getcwd(), 'user', 'project'),
            os.path.abspath(r'D:\sample project'),
            os.path.abspath('D:/sample project'),
            
        ]
        self.blocked_files = [
            '.env',
            'config.json',
            'secrets.json',
            '*.pem',
            '*.key',
            'id_rsa',
            'id_dsa',
        ]
        self.blocked_commands = [
            'rm -rf',
            'delete',
            'shutdown',
            'format',
            'del',
            'rmdir /s',
            'rd /s',
            ':(){ :|:& };:',
            'mkfs',
            'chmod 777',
            'chown -R',
        ]

    def is_path_allowed(self, file_path: str) -> tuple[bool, Optional[str]]:
        try:
            abs_path = os.path.abspath(file_path)
            is_allowed = False
            for base_dir in self.allowed_base_dirs:
                normalized_base = os.path.normpath(base_dir).lower()
                normalized_path = os.path.normpath(abs_path).lower()
                base_with_sep = normalized_base + os.sep.lower()
                if normalized_path.startswith(base_with_sep) or normalized_path == normalized_base:
                    is_allowed = True
                    break

            if not is_allowed:
                return False, f"Path '{file_path}' is outside allowed directories"

            filename = os.path.basename(abs_path)
            for blocked_pattern in self.blocked_files:
                if self._matches_pattern(filename, blocked_pattern):
                    return False, f"File '{filename}' is blocked"

            return True, None
        except Exception as e:
            return False, str(e)

    def _matches_pattern(self, filename: str, pattern: str) -> bool:
        if pattern.startswith('*'):
            suffix = pattern[1:]
            return filename.lower().endswith(suffix.lower())
        elif pattern.endswith('*'):
            prefix = pattern[:-1]
            return filename.lower().startswith(prefix.lower())
        else:
            return filename.lower() == pattern.lower()

    def is_command_safe(self, command: str) -> tuple[bool, Optional[str]]:
        cmd_lower = command.lower()
        for blocked in self.blocked_commands:
            if blocked.lower() in cmd_lower:
                return False, f"Command contains blocked pattern '{blocked}'"
        return True, None

    def validate_tool_call(self, tool_name: str, args: dict) -> tuple[bool, Optional[str]]:
        if tool_name in ['read_file', 'write_file', 'list_files']:
            if 'path' not in args:
                return False, "Missing 'path' argument"
            return self.is_path_allowed(args['path'])
        elif tool_name == 'run_command':
            if 'command' not in args:
                return False, "Missing 'command' argument"
            return self.is_command_safe(args['command'])
        return True, None
