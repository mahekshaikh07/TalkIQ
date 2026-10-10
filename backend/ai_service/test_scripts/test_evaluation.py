import sys
sys.path.append('..')
from main_ai_functions import process_speech_submission

result = process_speech_submission("../test_audio/sample.mp3", "The importance of time")
import json
print(json.dumps(result, indent=2))