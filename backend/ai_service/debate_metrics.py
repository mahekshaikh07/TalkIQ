from sentence_transformers import SentenceTransformer, util

# Load the model ONCE when this file is imported, not every time we call the function.
# Loading it repeatedly would be very slow — same reason WhisperModel is loaded
# once at the top of whisper_service.py instead of inside transcribe_audio().
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')


def calculate_rebuttal_relevance(full_conversation: list) -> dict:
    """
    full_conversation: list of dicts like [{'role': 'assistant', 'content': '...'},
                                            {'role': 'user', 'content': '...'}, ...]

    For every user message, we compare it against the assistant message
    that came right before it, and score how "on-topic" the reply was.
    """
    relevance_scores = []

    for i in range(1, len(full_conversation)):
        current = full_conversation[i]
        previous = full_conversation[i - 1]

        # We only care about: AI said something, then user replied to it
        if current["role"] == "user" and previous["role"] == "assistant":
            ai_statement = previous["content"]
            user_rebuttal = current["content"]

            # Step 1: convert both sentences into embeddings (number-lists)
            embedding_1 = embedding_model.encode(ai_statement, convert_to_tensor=True)
            embedding_2 = embedding_model.encode(user_rebuttal, convert_to_tensor=True)

            # Step 2: compare the two embeddings using cosine similarity
            similarity = util.cos_sim(embedding_1, embedding_2).item()

            relevance_scores.append(round(similarity, 3))

    if not relevance_scores:
        return {"average_relevance": 0.0, "per_turn_scores": []}

    average = sum(relevance_scores) / len(relevance_scores)

    return {
        "average_relevance": round(average, 3),
        "per_turn_scores": relevance_scores
    }

def count_evidence_keywords(full_conversation: list) -> dict:
    evidence_keywords = [
        "because", "since", "therefore", "for example", "for instance",
        "research shows", "studies show", "according to", "evidence",
        "data", "statistics", "in fact", "specifically"
    ]

    user_messages = [m["content"].lower() for m in full_conversation if m["role"] == "user"]
    full_user_text = " ".join(user_messages)

    total = 0
    breakdown = {}
    for keyword in evidence_keywords:
        count = full_user_text.count(keyword)
        if count > 0:
            breakdown[keyword] = count
            total += count

    return {"total_evidence_markers": total, "breakdown": breakdown}

def calculate_debate_vocabulary_diversity(full_conversation: list) -> float:
    user_messages = [m["content"].lower() for m in full_conversation if m["role"] == "user"]
    full_text = " ".join(user_messages)

    words = full_text.split()
    words = [w.strip('.,!?;:"\'') for w in words if w.strip('.,!?;:"\'')]

    if len(words) == 0:
        return 0.0

    unique_words = set(words)
    return round(len(unique_words) / len(words), 3)

def calculate_response_length_trend(full_conversation: list) -> dict:
    user_messages = [m["content"] for m in full_conversation if m["role"] == "user"]
    word_counts = [len(msg.split()) for msg in user_messages]

    if len(word_counts) < 2:
        return {"word_counts_per_turn": word_counts, "trend": "not enough turns to determine"}

    # simple trend check: compare first half average to second half average
    midpoint = len(word_counts) // 2
    first_half_avg = sum(word_counts[:midpoint]) / midpoint
    second_half_avg = sum(word_counts[midpoint:]) / (len(word_counts) - midpoint)

    if second_half_avg > first_half_avg * 1.1:
        trend = "increasing"
    elif second_half_avg < first_half_avg * 0.9:
        trend = "decreasing"
    else:
        trend = "stable"

    return {"word_counts_per_turn": word_counts, "trend": trend}