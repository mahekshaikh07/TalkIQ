import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def evaluate_speech(transcript: str, topic: str, wpm: float, filler_data: dict, pause_data: dict, silence_ratio: float, vocab_diversity: float) -> str:

    prompt = f"""You are an expert public speaking coach evaluating a student's speech.

TOPIC: {topic}
TRANSCRIPT: {transcript}

COMPUTED METRICS (already calculated, use these, don't recalculate):
- Words per minute: {wpm}
- Filler word count: {filler_data['total_fillers']}
- Number of pauses: {pause_data['pause_count']}
- Longest pause: {pause_data['longest_pause']}s
- Silence ratio: {silence_ratio} (fraction of total time spent silent)
- Vocabulary diversity (TTR): {vocab_diversity} (closer to 1 = more varied word choice, closer to 0 = repetitive)

Based on the transcript content and the metrics above, evaluate this speech.

Return ONLY a valid JSON object in this exact format, nothing else, no markdown, no explanation before or after:

{{
  "scores": {{
    "vocabulary": <0-10>,
    "content_relevance": <0-10>,
    "organization": <0-10>,
    "critical_thinking": <0-10>,
    "confidence": <0-10>,
    "overall": <0-10>
  }},
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "summary": "2-3 sentence overall feedback"
}}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content