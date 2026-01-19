from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

# --- CONFIGURATION ---
MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.focus_mate_db
tasks_collection = db.tasks
agenda_collection = db.agenda  # <--- NEW: Agenda Storage

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class SubTask(BaseModel):
    id: str
    content: str
    isCompleted: bool = False

class Task(BaseModel):
    content: str
    project: Optional[str] = ""
    energy: str = "medium"
    isUrgent: bool = False
    isSomeday: bool = False
    isCompleted: bool = False
    dueDate: Optional[str] = ""
    step: Optional[int] = None
    subtasks: List[SubTask] = []

class AgendaItem(BaseModel):
    content: str
    time_slot: str = "" 
    isCompleted: bool = False

class TaskResponse(Task):
    id: str

class AgendaResponse(AgendaItem):
    id: str

def fix_id(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Focus Mate API v3 is running!"}

# --- TASKS ---
@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(x_user_id: str = Header(None)):
    if not x_user_id: return []
    cursor = tasks_collection.find({"user_id": x_user_id})
    tasks = await cursor.to_list(length=1000)
    return [fix_id(task) for task in tasks]

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: Task, x_user_id: str = Header(None)):
    if not x_user_id: raise HTTPException(status_code=400, detail="User ID required")
    task_dict = task.dict()
    task_dict["user_id"] = x_user_id
    result = await tasks_collection.insert_one(task_dict)
    created_task = await tasks_collection.find_one({"_id": result.inserted_id})
    return fix_id(created_task)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: Task, x_user_id: str = Header(None)):
    update_result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id), "user_id": x_user_id},
        {"$set": task.dict()}
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    return fix_id(updated_task)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, x_user_id: str = Header(None)):
    result = await tasks_collection.delete_one({"_id": ObjectId(task_id), "user_id": x_user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Deleted"}

# --- AGENDA (NEW) ---
@app.get("/agenda", response_model=List[AgendaResponse])
async def get_agenda(x_user_id: str = Header(None)):
    if not x_user_id: return []
    cursor = agenda_collection.find({"user_id": x_user_id})
    items = await cursor.to_list(length=100)
    return [fix_id(item) for item in items]

@app.post("/agenda", response_model=AgendaResponse)
async def create_agenda_item(item: AgendaItem, x_user_id: str = Header(None)):
    if not x_user_id: raise HTTPException(status_code=400, detail="User ID required")
    item_dict = item.dict()
    item_dict["user_id"] = x_user_id
    result = await agenda_collection.insert_one(item_dict)
    created_item = await agenda_collection.find_one({"_id": result.inserted_id})
    return fix_id(created_item)

@app.put("/agenda/{item_id}", response_model=AgendaResponse)
async def update_agenda_item(item_id: str, item: AgendaItem, x_user_id: str = Header(None)):
    await agenda_collection.update_one(
        {"_id": ObjectId(item_id), "user_id": x_user_id},
        {"$set": item.dict()}
    )
    updated_item = await agenda_collection.find_one({"_id": ObjectId(item_id)})
    return fix_id(updated_item)

@app.delete("/agenda/{item_id}")
async def delete_agenda_item(item_id: str, x_user_id: str = Header(None)):
    await agenda_collection.delete_one({"_id": ObjectId(item_id), "user_id": x_user_id})
    return {"message": "Deleted"}