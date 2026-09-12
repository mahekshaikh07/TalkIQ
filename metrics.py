import re

def count_filler_words(transcript: str) -> dict:
    filler_words = ["um", "uh", "like", "you know", "so", "actually", "basically"]
    text_lower = transcript.lower()

    counts = {}
    total = 0
    for word in filler_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        matches = re.findall(pattern, text_lower)
        count = len(matches)
        if count > 0:
            counts[word] = count
            total += count

    return {"total_fillers": total, "breakdown": counts}

def calculate_wpm(transcript: str, duration_seconds: float) -> float:
    word_count = len(transcript.split())
    minutes = duration_seconds / 60
    if minutes == 0:
        return 0
    return round(word_count / minutes, 1)

def detect_pauses(segments: list, pause_threshold: float = 1.0) -> dict:
    pauses = []
    for i in range(len(segments) - 1):
        gap = segments[i + 1]["start"] - segments[i]["end"]
        if gap >= pause_threshold:
            pauses.append(round(gap, 2))

    return {
        "pause_count": len(pauses),
        "total_pause_time": round(sum(pauses), 2),
        "longest_pause": round(max(pauses), 2) if pauses else 0
    }

def calculate_silence_ratio(segments: list, total_duration: float) -> float:
    if not segments or total_duration == 0:
        return 0.0

    speech_time = sum(seg["end"] - seg["start"] for seg in segments)
    silence_time = total_duration - speech_time
    silence_ratio = silence_time / total_duration

    return round(max(0.0, min(1.0, silence_ratio)), 3)


def calculate_vocabulary_diversity(transcript: str) -> float:
    words = transcript.lower().split()
    words = [w.strip('.,!?;:"\'') for w in words if w.strip('.,!?;:"\'')]

    if len(words) == 0:
        return 0.0

    unique_words = set(words)
    ttr = len(unique_words) / len(words)

    return round(ttr, 3)