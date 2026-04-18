import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


class OpenClaw:
    def __init__(self, base_url: str = None):
        if base_url is None:
            base_url = os.getenv('ARMORCLAW_BASE_URL', 'http://localhost:18789')
        self.base_url = base_url.rstrip('/')
        self.api_key = os.getenv('ARMORCLAW_API_KEY', '')
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}' if self.api_key else ''
        }

    def is_available(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/healthz", timeout=2)
            return response.status_code == 200
        except Exception:
            return False

    def read_file(self, path: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/read"
            response = requests.post(url, json={'path': path}, headers=self.headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': ''
            }

    def write_file(self, path: str, content: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/write"
            response = requests.post(url, json={'path': path, 'content': content}, headers=self.headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def list_files(self, path: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/list"
            response = requests.post(url, json={'path': path}, headers=self.headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'files': []
            }

    def run_command(self, command: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/run"
            response = requests.post(url, json={'command': command}, headers=self.headers, timeout=60)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'stdout': '',
                'stderr': ''
            }
