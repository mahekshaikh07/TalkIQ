import os
from dotenv import load_dotenv
from groq import Groq

# Load API key from .env file
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Send a simple test prompt
response = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {"role": "user", "content": "Give me one tip to improve public speaking confidence."}
    ],
    temperature=0.3
)

# Print the AI's reply
print("AI Response:")
print(response.choices[0].message.content)