from whisper_service import transcribe_audio
from metrics import calculate_wpm, count_filler_words, detect_pauses, calculate_silence_ratio, calculate_vocabulary_diversity
from evaluation_service import evaluate_speech
from debate_service import get_debate_response, evaluate_debate
from json_helper import get_valid_json
from debate_metrics import (
    calculate_rebuttal_relevance,
    count_evidence_keywords,
    calculate_debate_vocabulary_diversity,
    calculate_response_length_trend
)


def process_speech_submission(audio_path: str, topic: str) -> dict:
    whisper_result = transcribe_audio(audio_path)
    transcript = whisper_result["transcript"]
    duration = whisper_result["duration"]

    wpm = calculate_wpm(transcript, duration)
    filler_data = count_filler_words(transcript)
    pause_data = detect_pauses(whisper_result["segments"])
    silence_ratio = calculate_silence_ratio(whisper_result["segments"], duration)
    vocab_diversity = calculate_vocabulary_diversity(transcript)

    evaluation = get_valid_json(
        evaluate_speech, transcript, topic, wpm, filler_data, pause_data, silence_ratio, vocab_diversity
    )

    return {
        "transcript": transcript,
        "wpm": wpm,
        "filler_words": filler_data,
        "pauses": pause_data,
        "silence_ratio": silence_ratio,
        "vocabulary_diversity": vocab_diversity,
        "evaluation": evaluation
    }


def process_debate_turn(history: list, user_message: str, topic: str, ai_stance: str) -> str:
    return get_debate_response(history, user_message, topic, ai_stance)


def process_debate_evaluation(full_conversation: list, topic: str, user_stance: str) -> dict:
    rebuttal_data = calculate_rebuttal_relevance(full_conversation)
    evidence_data = count_evidence_keywords(full_conversation)
    vocab_diversity = calculate_debate_vocabulary_diversity(full_conversation)
    length_trend = calculate_response_length_trend(full_conversation)

    return get_valid_json(
        evaluate_debate, full_conversation, topic, user_stance,
        rebuttal_data, evidence_data, vocab_diversity, length_trend
    )
