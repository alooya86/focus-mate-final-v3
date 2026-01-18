import uuid
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE (In-Memory Dictionary) ---
# Format: { "user_secret_id": [ List of Tasks ] }
db = {}

class Task(BaseModel):
    id: Optional[str] = None
    content: str
    project: Optional[str] = ""
    energy: str
    isUrgent: bool = False
    isSomeday: bool = False
    isCompleted: bool = False
    # --- NEW FEATURES ---
    dueDate: Optional[str] = None  # Format: "YYYY-MM-DD"
    step: Optional[int] = None     # For sequential order (1, 2, 3...)

@app.get("/tasks")
def get_tasks(x_user_id: Optional[str] = Header(None)):
    if not x_user_id: return []
    return db.get(x_user_id, [])

@app.post("/tasks")
def create_task(task: Task, x_user_id: Optional[str] = Header(None)):
    if not x_user_id: return {"error": "No User ID"}
    
    task.id = str(uuid.uuid4())
    if x_user_id not in db: db[x_user_id] = []
    db[x_user_id].append(task)
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str, x_user_id: Optional[str] = Header(None)):
    if not x_user_id or x_user_id not in db: return {"status": "ignored"}
    db[x_user_id] = [t for t in db[x_user_id] if t.id != task_id]
    return {"status": "deleted"}

@app.put("/tasks/{task_id}")
def update_task(task_id: str, updated_task: Task, x_user_id: Optional[str] = Header(None)):
    if not x_user_id or x_user_id not in db: return {"error": "User not found"}
    user_tasks = db[x_user_id]
    for i, t in enumerate(user_tasks):
        if t.id == task_id:
            user_tasks[i] = updated_task
            return updated_task
    return {"error": "Task not found"}