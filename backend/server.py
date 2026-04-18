from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

app = FastAPI(title="CodeShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .agent import CodeShieldAgent

agent = CodeShieldAgent()

logs = []


class CodeRequest(BaseModel):
    code: str


class ProjectRequest(BaseModel):
    path: str


class LogEntry(BaseModel):
    id: Optional[int] = None
    timestamp: str
    type: str
    input: str
    result: Dict[str, Any]


@app.post("/analyze_code")
async def analyze_code(request: CodeRequest):
    try:
        result = agent.analyze_code(request.code)
        
        log_entry = {
            "id": len(logs) + 1,
            "timestamp": datetime.now().isoformat(),
            "type": "code_analysis",
            "input": request.code[:100] + "..." if len(request.code) > 100 else request.code,
            "result": result
        }
        logs.append(log_entry)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze_project")
async def analyze_project(request: ProjectRequest):
    try:
        result = agent.analyze_project(request.path)
        
        log_entry = {
            "id": len(logs) + 1,
            "timestamp": datetime.now().isoformat(),
            "type": "project_analysis",
            "input": request.path,
            "result": result
        }
        logs.append(log_entry)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs")
async def get_logs():
    return {
        "success": True,
        "data": logs[-50:]
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "CodeShield"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
