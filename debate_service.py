import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_debate_response(history: list, user_message: str, topic: str, ai_stance: str) -> str:
    system_prompt = f"""You are debating the topic: "{topic}".
Your stance: {ai_stance}.
Rules:
- Give sharp, logical counter-arguments, not generic statements
- Keep responses to 2-3 sentences, this is a live debate, not an essay
- Directly respond to what the user just said, don't ignore their point
- Stay respectful but firm"""

    messages = [{"role": "system", "content": system_prompt}] + history
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=0.7,
    )

    return response.choices[0].message.content


def evaluate_debate(full_conversation: list, topic: str, user_stance: str,
                     rebuttal_data: dict, evidence_data: dict, vocab_diversity: float, length_trend: dict) -> str:
    conversation_text = "\n".join([f"{m['role']}: {m['content']}" for m in full_conversation])

    prompt = f"""Evaluate this debate. Topic: {topic}. User's stance: {user_stance}.

CONVERSATION:
{conversation_text}

COMPUTED METRICS (already calculated, use these, don't recalculate):
- Average rebuttal relevance: {rebuttal_data['average_relevance']} (0 to 1 scale, how closely user replies engaged with the AI's points)
- Per-turn relevance scores: {rebuttal_data['per_turn_scores']}
- Evidence/reasoning markers used: {evidence_data['total_evidence_markers']} ({evidence_data['breakdown']})
- Vocabulary diversity (TTR): {vocab_diversity} (closer to 1 = more varied word choice)
- Response length trend: {length_trend['trend']} (word counts per turn: {length_trend['word_counts_per_turn']})

Return ONLY this JSON format, nothing else:
{{
  "scores": {{
    "argument_strength": <0-10>,
    "logic": <0-10>,
    "rebuttal_quality": <0-10>,
    "persuasiveness": <0-10>,
    "critical_thinking": <0-10>,
    "overall": <0-10>
  }},
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "summary": "2-3 sentence feedback"
}}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content