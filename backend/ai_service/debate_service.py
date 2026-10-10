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
    # Label turns by role in the debate, not by chat API role names
    conversation_text = "\n".join([
        f"{'STUDENT' if m['role'] == 'user' else 'OPPONENT (AI)'}: {m['content']}"
        for m in full_conversation
    ])

    prompt = f"""You are evaluating a debate practice session for a STUDENT who is learning debate skills.

Topic: {topic}. Student's stance: {user_stance}.

CONVERSATION (STUDENT is the person being evaluated. OPPONENT (AI) is a practice opponent, shown only for context. Do NOT evaluate, praise, or critique the OPPONENT's arguments):
{conversation_text}

COMPUTED METRICS about the STUDENT's turns only (already calculated, use these, don't recalculate):
- Average rebuttal relevance: {rebuttal_data['average_relevance']} (0 to 1 scale, how closely the student's replies engaged with the opponent's points)
- Per-turn relevance scores: {rebuttal_data['per_turn_scores']}
- Evidence/reasoning markers used by the student: {evidence_data['total_evidence_markers']} ({evidence_data['breakdown']})
- Student's vocabulary diversity (TTR): {vocab_diversity} (closer to 1 = more varied word choice)
- Student's response length trend: {length_trend['trend']} (word counts per turn: {length_trend['word_counts_per_turn']})

Score, and write strengths/improvements/summary, about the STUDENT ONLY. Never mention or assess the OPPONENT's argument quality.

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
  "summary": "2-3 sentence feedback about the student's performance"
}}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content