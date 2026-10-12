from datetime import datetime, timezone
import os
import socket
from fastapi import FastAPI

app = FastAPI(title="KubeWatch API", version="1.0.0")
INSTANCE_ID = os.getenv("INSTANCE_ID", socket.gethostname())

@app.get("/")
def root():
    return {"application": "KubeWatch API", "message": "KubeWatch is running", "instance": INSTANCE_ID}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "kubewatch-backend", "instance": INSTANCE_ID}

@app.get("/api/status")
def status():
    return {
        "application": "KubeWatch",
        "status": "operational",
        "instance": INSTANCE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
