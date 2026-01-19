from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

# --- CONFIGURATION ---
# Get the Database URL from the environment (Render)
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client.focus_mate_db  # This creates a DB named "focus_mate_db"
tasks_collection = db.tasks

# CORS (Allows frontend to talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class Task(BaseModel):
    content: str
    project: Optional[str] = ""
    energy: str = "medium"
    isUrgent: bool = False
    isSomeday: bool = False
    isCompleted: bool = False
    dueDate: Optional[str] = ""
    step: Optional[int] = None

class TaskResponse(Task):
    id: str

# --- HELPER FUNCTION ---
def fix_id(doc):
    """Convert MongoDB's _id object to a string id"""
    doc["id"] = str(doc.pop("_id"))
    return doc

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Focus Mate API is running with MongoDB!"}

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(x_user_id: str = Header(None)):
    if not x_user_id:
        return []
    
    # Find tasks belonging to this user
    tasks_cursor = tasks_collection.find({"user_id": x_user_id})
    tasks = await tasks_cursor.to_list(length=1000)
    
    # Convert _id to id for the frontend
    return [fix_id(task) for task in tasks]

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: Task, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    # Prepare data for MongoDB
    task_dict = task.dict()
    task_dict["user_id"] = x_user_id  # Associate task with user
    
    # Insert into DB
    result = await tasks_collection.insert_one(task_dict)
    
    # Return the created task with its new ID
    created_task = await tasks_collection.find_one({"_id": result.inserted_id})
    return fix_id(created_task)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: Task, x_user_id: str = Header(None)):
    # Update the task in DB
    update_result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id), "user_id": x_user_id},
        {"$set": task.dict()}
    )
    
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Return updated task
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    return fix_id(updated_task)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, x_user_id: str = Header(None)):
    delete_result = await tasks_collection.delete_one(
        {"_id": ObjectId(task_id), "user_id": x_user_id}
    )
    
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return {"message": "Task deleted"}