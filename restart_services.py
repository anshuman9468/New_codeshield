import os
import subprocess
import time

def kill_port(port):
    try:
        result = subprocess.run(
            ['netstat', '-ano'],
            capture_output=True,
            text=True,
            timeout=10
        )
        lines = result.stdout.split('\n')
        for line in lines:
            if f':{port}' in line and 'LISTENING' in line:
                parts = line.split()
                pid = parts[-1]
                try:
                    subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True, timeout=5)
                    print(f"Killed process {pid} on port {port}")
                except Exception as e:
                    print(f"Could not kill process {pid}: {e}")
    except Exception as e:
        print(f"Error checking port {port}: {e}")

print("=== Restarting CodeShield Services ===")
print("\n1. Killing existing processes...")
kill_port(8000)
kill_port(8001)
kill_port(3000)

print("\n2. Waiting 2 seconds...")
time.sleep(2)

print("\n3. Services ready to restart!")
print("\nNow start the services in separate terminals:")
print("  Terminal 1: python -m tools.mock_server")
print("  Terminal 2: python -m backend.server")
print("  Terminal 3: cd frontend ; npm run dev")
