from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from gps import gps_manager
from pothole import pothole_detector
from camera import camera_manager
from database import *

app = FastAPI()

initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/gps")
def gps():
    return gps_manager.get_data()

@app.get("/pothole")
def pothole():
    return {
        "alert": pothole_detector.detect()
    }

@app.get("/camera")
def camera():
    return camera_manager.get_status()

@app.get("/service")
def service():
    return {
        "next_service": get_next_service()
    }

# Static files (resolved relative to this file)
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

# If running from within /backend, these resolve to <project_root>/documents and <project_root>/frontend
DOCUMENTS_DIR = os.path.join(PROJECT_DIR, "documents")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")


app.mount(
    "/documents",
    StaticFiles(directory=DOCUMENTS_DIR),
    name="documents"
)

app.mount(
    "/frontend",
    StaticFiles(directory=FRONTEND_DIR),
    name="frontend"
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
    app,
    host="127.0.0.1",
    port=8080
    )