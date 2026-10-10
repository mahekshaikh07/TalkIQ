from pydantic import BaseModel, EmailStr, Field

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SpeakStartRequest(BaseModel):
    difficulty: str
    duration: int

class DebateStartRequest(BaseModel):
    topic: str
    stance: str
    duration_minutes: int = Field(default=5, ge=2, le=15)

class DebateTurnRequest(BaseModel):
    session_id: str
    message: str

class DebateEndRequest(BaseModel):
    session_id: str