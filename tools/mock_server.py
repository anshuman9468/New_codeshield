from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
from typing import List, Optional

app = FastAPI(title="Mock OpenClaw Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReadRequest(BaseModel):
    path: str


class WriteRequest(BaseModel):
    path: str
    content: str


class ListRequest(BaseModel):
    path: str


class RunRequest(BaseModel):
    command: str


@app.post("/read")
async def read_file(request: ReadRequest):
    try:
        if not os.path.exists(request.path):
            return {"success": False, "error": "File not found", "content": ""}
        
        with open(request.path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {"success": True, "content": content}
    except Exception as e:
        return {"success": False, "error": str(e), "content": ""}


@app.post("/write")
async def write_file(request: WriteRequest):
    try:
        directory = os.path.dirname(request.path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        with open(request.path, 'w', encoding='utf-8') as f:
            f.write(request.content)
        
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/list")
async def list_files(request: ListRequest):
    try:
        if not os.path.exists(request.path):
            return {"success": False, "error": "Directory not found", "files": []}
        
        files = []
        for item in os.listdir(request.path):
            item_path = os.path.join(request.path, item)
            files.append({
                "name": item,
                "is_dir": os.path.isdir(item_path)
            })
        
        return {"success": True, "files": [f["name"] for f in files]}
    except Exception as e:
        return {"success": False, "error": str(e), "files": []}


@app.post("/run")
async def run_command(request: RunRequest):
    try:
        result = subprocess.run(
            request.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        return {
            "success": True,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Command timed out", "stdout": "", "stderr": ""}
    except Exception as e:
        return {"success": False, "error": str(e), "stdout": "", "stderr": ""}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
