import sys
sys.path.append('..')
from whisper_service import transcribe_audio

# put any short mp3/wav file in ai-service/test_audio/sample.wav first
result = transcribe_audio("../test_audio/sample.mp3")
print("Transcript:", result["transcript"])
print("Duration:", result["duration"])
print("Segments:", result["segments"][:2])  # just first 2 to check format