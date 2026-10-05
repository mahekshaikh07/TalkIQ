import random
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from db import db
from models import (
    UserSignup, UserLogin, SpeakStartRequest, SpeakSubmitRequest,
    DebateStartRequest, DebateTurnRequest, DebateEndRequest
)
from auth import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, my backend is working!"}

@app.get("/test-db")
async def test_db():
    collections = await db.list_collection_names()
    return {"status": "connected", "collections": collections}

@app.post("/signup")
async def signup(user: UserSignup):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw
    }

    await db["users"].insert_one(new_user)

    return {"message": "Signup successful"}

@app.post("/login")
async def login(user: UserLogin):
    db_user = await db["users"].find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})

    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"you_are": current_user["sub"]}

TOPICS = [
    "The impact of social media on society",
    "Should students be allowed to use AI tools in exams",
    "The importance of environmental conservation",
    "Is remote work better than office work",
    "The role of technology in education"
]

@app.post("/speak/start")
async def speak_start(request: SpeakStartRequest, current_user: dict = Depends(get_current_user)):
    topic = random.choice(TOPICS)
    return {
        "topic": topic,
        "difficulty": request.difficulty,
        "duration": request.duration
    }

@app.post("/speak/submit")
async def speak_submit(request: SpeakSubmitRequest, current_user: dict = Depends(get_current_user)):
    if request.duration_actual <= 0:
        raise HTTPException(status_code=400, detail="Duration must be greater than 0")

    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")

    word_count = len(request.transcript.split())
    wpm = round((word_count / request.duration_actual) * 60) if request.duration_actual > 0 else 0

    dummy_scores = {
        "fluency": 7.5,
        "confidence": 7.0,
        "vocabulary": 8.0,
        "content_relevance": 7.5,
        "organization": 7.0,
        "critical_thinking": 7.5,
        "overall": 7.4
    }

    session = {
        "user_email": current_user["sub"],
        "topic": request.topic,
        "transcript": request.transcript,
        "duration_actual": request.duration_actual,
        "wpm": wpm,
        "scores": dummy_scores,
        "ai_feedback": {
            "strengths": ["Good vocabulary usage", "Clear structure"],
            "improvements": ["Reduce filler words", "Speak with more confidence"],
            "recommendations": ["Practice more on this topic"]
        },
        "created_at": datetime.utcnow()
    }

    result = await db["speaking_sessions"].insert_one(session)

    return {
        "message": "Speaking session saved",
        "session_id": str(result.inserted_id),
        "wpm": wpm,
        "scores": dummy_scores
    }

@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    sessions_cursor = db["speaking_sessions"].find({"user_email": current_user["sub"]})
    sessions = await sessions_cursor.to_list(length=100)

    for session in sessions:
        session["_id"] = str(session["_id"])

    return {"sessions": sessions}

DEBATE_AI_REPLIES = [
    "That's an interesting point, but have you considered the opposite side?",
    "I understand your view, but the evidence suggests otherwise.",
    "That may be true in some cases, but not always.",
    "Can you provide stronger evidence for that claim?",
    "That's a fair point, but it doesn't address the core issue."
]

@app.post("/debate/start")
async def debate_start(request: DebateStartRequest, current_user: dict = Depends(get_current_user)):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    if request.stance.lower() not in ["support", "oppose"]:
        raise HTTPException(status_code=400, detail="Stance must be 'support' or 'oppose'")

    session = {
        "user_email": current_user["sub"],
        "topic": request.topic,
        "stance": request.stance,
        "conversation": [],
        "status": "active",
        "created_at": datetime.utcnow()
    }

    result = await db["debate_sessions"].insert_one(session)

    return {
        "session_id": str(result.inserted_id),
        "topic": request.topic,
        "stance": request.stance
    }

@app.post("/debate/turn")
async def debate_turn(request: DebateTurnRequest, current_user: dict = Depends(get_current_user)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        session_object_id = ObjectId(request.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    session = await db["debate_sessions"].find_one({"_id": session_object_id})

    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    ai_reply = random.choice(DEBATE_AI_REPLIES)

    new_turns = [
        {"speaker": "user", "text": request.message, "timestamp": datetime.utcnow()},
        {"speaker": "ai", "text": ai_reply, "timestamp": datetime.utcnow()}
    ]

    await db["debate_sessions"].update_one(
        {"_id": session_object_id},
        {"$push": {"conversation": {"$each": new_turns}}}
    )

    return {"ai_reply": ai_reply}

@app.post("/debate/end")
async def debate_end(request: DebateEndRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_object_id = ObjectId(request.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    session = await db["debate_sessions"].find_one({"_id": session_object_id})

    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    dummy_scores = {
        "argument_strength": 7.0,
        "logic": 7.5,
        "rebuttal_quality": 7.0,
        "persuasiveness": 7.5,
        "critical_thinking": 7.5,
        "overall": 7.3
    }

    await db["debate_sessions"].update_one(
        {"_id": session_object_id},
        {"$set": {
            "status": "completed",
            "scores": dummy_scores,
            "ai_feedback": {
                "strengths": ["Good use of evidence", "Stayed on topic"],
                "improvements": ["Address counterarguments more directly"],
                "recommendations": ["Practice rebuttal techniques"]
            }
        }}
    )

    return {
        "message": "Debate session completed",
        "scores": dummy_scores
    }

@app.get("/debate/history")
async def get_debate_history(current_user: dict = Depends(get_current_user)):
    sessions_cursor = db["debate_sessions"].find({"user_email": current_user["sub"]})
    sessions = await sessions_cursor.to_list(length=100)

    for session in sessions:
        session["_id"] = str(session["_id"])

    return {"sessions": sessions}