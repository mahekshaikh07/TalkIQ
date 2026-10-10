import os
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    sys.exit("MONGODB_URI not found in .env file. Add it before running the server.")

client = AsyncIOMotorClient(MONGODB_URI)
db = client["TalkIQ_db"]