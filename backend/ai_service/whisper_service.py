from faster_whisper import WhisperModel
import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
model = WhisperModel("base", device="cpu", compute_type="int8")

def transcribe_audio(audio_path: str) -> dict:
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500)
    )

    full_text = ""
    segment_list = []

    for segment in segments:
        full_text += segment.text + " "
        segment_list.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        })

    return {
        "transcript": full_text.strip(),
        "duration": info.duration,
        "segments": segment_list
    }