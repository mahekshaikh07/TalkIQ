import json
import re

def clean_and_parse_json(raw_text: str) -> dict:
    cleaned = re.sub(r'```json|```', '', raw_text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def get_valid_json(generate_function, *args, max_retries: int = 3, **kwargs) -> dict:
    for attempt in range(max_retries):
        raw_output = generate_function(*args, **kwargs)
        parsed = clean_and_parse_json(raw_output)
        if parsed is not None:
            return parsed
        print(f"Attempt {attempt+1} failed to parse JSON, retrying...")

    return {
        "scores": {},
        "strengths": [],
        "improvements": [],
        "summary": "Evaluation failed, please try again."
    }