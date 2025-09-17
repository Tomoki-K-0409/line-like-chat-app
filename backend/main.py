from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import socketio
import aiosqlite
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001", # Frontend URL
]
DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create database tables
Base.metadata.create_all(bind=engine)

# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str

class MessageCreate(BaseModel):
    username: str
    message: str

class MessageResponse(BaseModel):
    id: int
    username: str
    message: str
    timestamp: datetime | None = None

    class Config:
        from_attributes = True

# FastAPI app
import socketio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=origins)
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@sio.on('connect')
async def connect(sid, environ):
    print("connect ", sid)

@sio.on('disconnect')
async def disconnect(sid):
    print("disconnect ", sid)

@sio.on('sendMessage')
async def handle_send_message(sid, data):
    username = data.get('username')
    message_content = data.get('message')
    if username and message_content:
        # Store message in DB (existing logic)
        async with aiosqlite.connect("chat.db") as db_conn:
            cursor = await db_conn.execute(
                "INSERT INTO messages (username, message) VALUES (?, ?)",
                (username, message_content)
            )
            message_id = cursor.lastrowid
            await db_conn.commit()

            # Fetch the newly created message to get timestamp
            cursor = await db_conn.execute(
                "SELECT id, username, message, timestamp FROM messages WHERE id = ?",
                (message_id,)
            )
            new_message = await cursor.fetchone()
            
            if new_message:
                # Convert row to dict for consistent message format
                new_message_dict = {
                    "id": new_message[0],
                    "username": new_message[1],
                    "message": new_message[2],
                    "timestamp": new_message[3]
                }
                # Broadcast message to all connected clients
                await sio.emit('message', new_message_dict)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=UserCreate)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = User(username=user.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Login successful", "username": user.username}

@app.get("/messages", response_model=list[MessageResponse])
def get_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).order_by(Message.timestamp).all()
    return messages

@app.post("/messages", response_model=MessageResponse)
def send_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = Message(username=message.username, message=message.message)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
