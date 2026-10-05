from pydantic import BaseModel, EmailStr

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

class SpeakSubmitRequest(BaseModel):
    topic: str
    transcript: str
    duration_actual: int
class DebateStartRequest(BaseModel):
    topic: str
    stance: str

class DebateTurnRequest(BaseModel):
    session_id: str
    message: str

class DebateEndRequest(BaseModel):
    session_id: str