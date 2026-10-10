import os
import sys
import random
import shutil
import uuid
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from db import db
from models import (
    UserSignup, UserLogin, SpeakStartRequest,
    DebateStartRequest, DebateTurnRequest, DebateEndRequest
)
from auth import hash_password, verify_password, create_access_token, get_current_user

from backend.ai_service.whisper_service import transcribe_audio
from backend.ai_service.metrics import (
    count_filler_words, calculate_wpm, detect_pauses,
    calculate_silence_ratio, calculate_vocabulary_diversity,
    calculate_pace_timeline
)
from backend.ai_service.evaluation_service import evaluate_speech
from backend.ai_service.debate_service import get_debate_response, evaluate_debate
from backend.ai_service.debate_metrics import (
    calculate_rebuttal_relevance, count_evidence_keywords,
    calculate_debate_vocabulary_diversity, calculate_response_length_trend
)
from backend.ai_service.json_helper import get_valid_json

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("temp_audio")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_AUDIO_SIZE_MB = 10
ALLOWED_AUDIO_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/webm", "audio/ogg", "video/webm"
}


@app.get("/")
def read_root():
    return {"message": "Hello, my backend is working!"}


@app.get("/test-db")
async def test_db():
    collections = await db.list_collection_names()
    return {"status": "connected", "collections": collections}


# ---------- AUTH ----------

@app.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, user: UserSignup):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    new_user = {"name": user.name, "email": user.email, "password": hashed_pw}
    await db["users"].insert_one(new_user)

    return {"message": "Signup successful"}


@app.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, user: UserLogin):
    db_user = await db["users"].find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"you_are": current_user["sub"]}


# ---------- SPEAKING ----------

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
    return {"topic": topic, "difficulty": request.difficulty, "duration": request.duration}


@app.post("/speak/submit")
@limiter.limit("10/minute")
async def speak_submit(
    request: Request,
    topic: str = Form(...),
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # browsers can send "audio/webm;codecs=opus", so keep only the part before ";"
    content_type = (audio.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported audio format. Use wav, mp3, webm or ogg")

    audio.file.seek(0, 2)
    size_mb = audio.file.tell() / (1024 * 1024)
    audio.file.seek(0)
    if size_mb > MAX_AUDIO_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"Audio file too large. Max {MAX_AUDIO_SIZE_MB}MB")

    temp_path = UPLOAD_DIR / f"{uuid.uuid4()}{Path(audio.filename or 'audio.wav').suffix}"

    try:
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)

        whisper_result = transcribe_audio(str(temp_path))
        transcript = whisper_result["transcript"]
        duration = whisper_result["duration"]
        segments = whisper_result["segments"]

        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Could not detect speech in audio")

        filler_data = count_filler_words(transcript)
        wpm = calculate_wpm(transcript, duration)
        pause_data = detect_pauses(segments)
        silence_ratio = calculate_silence_ratio(segments, duration)
        vocab_diversity = calculate_vocabulary_diversity(transcript)

        word_count = len(transcript.split())
        filler_per_100 = round(filler_data["total_fillers"] / word_count * 100, 2) if word_count else 0
        pace_timeline = calculate_pace_timeline(segments)

        # send only the summary to the LLM, not the long pause list
        pause_summary = {k: v for k, v in pause_data.items() if k != "pauses"}

        evaluation = get_valid_json(
            evaluate_speech, transcript, topic, wpm, filler_data, pause_summary, silence_ratio, vocab_diversity
        )
    finally:
        if temp_path.exists():
            temp_path.unlink()

    session = {
        "user_email": current_user["sub"],
        "topic": topic,
        "transcript": transcript,
        "duration": duration,
        "word_count": word_count,
        "metrics": {
            "wpm": wpm,
            "filler_data": filler_data,
            "filler_per_100_words": filler_per_100,
            "pause_data": pause_data,
            "silence_ratio": silence_ratio,
            "vocab_diversity": vocab_diversity,
            "pace_timeline": pace_timeline
        },
        "scores": evaluation.get("scores"),
        "strengths": evaluation.get("strengths"),
        "improvements": evaluation.get("improvements"),
        "summary": evaluation.get("summary"),
        "created_at": datetime.utcnow()
    }

    result = await db["speaking_sessions"].insert_one(session)

    return {
        "message": "Speaking session saved",
        "session_id": str(result.inserted_id),
        "transcript": transcript,
        "metrics": session["metrics"],
        "scores": session["scores"],
        "strengths": session["strengths"],
        "improvements": session["improvements"],
        "summary": session["summary"]
    }


@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    sessions_cursor = db["speaking_sessions"].find(
        {"user_email": current_user["sub"]}
    ).sort("created_at", -1)
    sessions = await sessions_cursor.to_list(length=100)
    for session in sessions:
        session["_id"] = str(session["_id"])
    return {"sessions": sessions}


# ---------- DEBATE ----------

@app.post("/debate/start")
async def debate_start(request: DebateStartRequest, current_user: dict = Depends(get_current_user)):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    user_stance = request.stance.lower()
    if user_stance not in ["support", "oppose"]:
        raise HTTPException(status_code=400, detail="Stance must be 'support' or 'oppose'")

    ai_stance = "oppose" if user_stance == "support" else "support"

    session = {
        "user_email": current_user["sub"],
        "topic": request.topic,
        "stance": user_stance,
        "ai_stance": ai_stance,
        "conversation": [],
        "status": "active",
        "start_time": datetime.utcnow(),          # server owns the clock
        "duration_minutes": request.duration_minutes,
        "created_at": datetime.utcnow()
    }
    result = await db["debate_sessions"].insert_one(session)

    return {
        "session_id": str(result.inserted_id),
        "topic": request.topic,
        "stance": user_stance,
        "duration_minutes": request.duration_minutes
    }


@app.post("/debate/turn")
@limiter.limit("30/minute")
async def debate_turn(request: Request, body: DebateTurnRequest, current_user: dict = Depends(get_current_user)):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        session_object_id = ObjectId(body.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    session = await db["debate_sessions"].find_one({
        "_id": session_object_id,
        "user_email": current_user["sub"]
    })
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="This debate has already ended")

    # server-side time check, never trust a client-sent time value
    elapsed = datetime.utcnow() - session["start_time"]
    if elapsed > timedelta(minutes=session["duration_minutes"]):
        await db["debate_sessions"].update_one(
            {"_id": session_object_id}, {"$set": {"status": "expired"}}
        )
        raise HTTPException(status_code=400, detail="Time is up for this debate. Please end the session.")

    history_for_llm = [{"role": t["role"], "content": t["content"]} for t in session["conversation"]]

    ai_reply = get_debate_response(
        history=history_for_llm,
        user_message=body.message,
        topic=session["topic"],
        ai_stance=session["ai_stance"]
    )

    new_turns = [
        {"role": "user", "content": body.message, "timestamp": datetime.utcnow()},
        {"role": "assistant", "content": ai_reply, "timestamp": datetime.utcnow()}
    ]
    await db["debate_sessions"].update_one(
        {"_id": session_object_id},
        {"$push": {"conversation": {"$each": new_turns}}}
    )

    seconds_left = (timedelta(minutes=session["duration_minutes"]) - elapsed).total_seconds()

    return {"ai_reply": ai_reply, "seconds_remaining": max(0, int(seconds_left))}


@app.post("/debate/end")
async def debate_end(request: DebateEndRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_object_id = ObjectId(request.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    session = await db["debate_sessions"].find_one({
        "_id": session_object_id,
        "user_email": current_user["sub"]
    })
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    if session["status"] == "completed":
        raise HTTPException(status_code=400, detail="This debate is already evaluated")

    full_conversation = [{"role": t["role"], "content": t["content"]} for t in session["conversation"]]

    if not full_conversation:
        raise HTTPException(status_code=400, detail="Cannot evaluate a debate with no messages")

    rebuttal_data = calculate_rebuttal_relevance(full_conversation)
    evidence_data = count_evidence_keywords(full_conversation)
    vocab_diversity = calculate_debate_vocabulary_diversity(full_conversation)
    length_trend = calculate_response_length_trend(full_conversation)

    # one entry per user turn, used by the dashboard graphs
    user_msgs = [t["content"] for t in full_conversation if t["role"] == "user"]
    relevance_list = rebuttal_data["per_turn_scores"]
    per_turn = []
    for idx, msg in enumerate(user_msgs):
        per_turn.append({
            "turn": idx + 1,
            "word_count": len(msg.split()),
            "evidence_count": count_evidence_keywords(
                [{"role": "user", "content": msg}]
            )["total_evidence_markers"],
            # turn 1 has no AI message before it, so no relevance score
            "relevance": relevance_list[idx - 1] if 1 <= idx <= len(relevance_list) else None
        })

    evaluation = get_valid_json(
        evaluate_debate,
        full_conversation, session["topic"], session["stance"],
        rebuttal_data, evidence_data, vocab_diversity, length_trend
    )

    await db["debate_sessions"].update_one(
        {"_id": session_object_id},
        {"$set": {
            "status": "completed",
            "ended_at": datetime.utcnow(),
            "metrics": {
                "rebuttal_data": rebuttal_data,
                "evidence_data": evidence_data,
                "vocab_diversity": vocab_diversity,
                "length_trend": length_trend
            },
            "per_turn": per_turn,
            "scores": evaluation.get("scores"),
            "strengths": evaluation.get("strengths"),
            "improvements": evaluation.get("improvements"),
            "summary": evaluation.get("summary")
        }}
    )

    return {
        "message": "Debate session completed",
        "scores": evaluation.get("scores"),
        "strengths": evaluation.get("strengths"),
        "improvements": evaluation.get("improvements"),
        "summary": evaluation.get("summary")
    }


@app.get("/debate/history")
async def get_debate_history(current_user: dict = Depends(get_current_user)):
    sessions_cursor = db["debate_sessions"].find(
        {"user_email": current_user["sub"]}
    ).sort("created_at", -1)
    sessions = await sessions_cursor.to_list(length=100)
    for session in sessions:
        session["_id"] = str(session["_id"])
    return {"sessions": sessions}