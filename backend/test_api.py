import json
import sys
import time
import requests
from pathlib import Path

BASE = "http://127.0.0.1:8000"
EMAIL = "testuser@example.com"
PASSWORD = "Test@12345"

# path relative to this file, so it works on any laptop
AUDIO_FILE = Path(__file__).parent / "ai_service" / "test_audio" / "sample.mp3"


def step(title):
    print(f"\n{'=' * 10} {title} {'=' * 10}")


def check(r, ok_codes=(200, 201)):
    """Print the response nicely and stop if the step failed."""
    try:
        body = r.json()
        print(json.dumps(body, indent=2)[:1500])  # cut very long output
    except Exception:
        body = None
        print(r.text[:500])
    if r.status_code not in ok_codes:
        print(f"\nFAILED with status {r.status_code}. Stopping.")
        sys.exit(1)
    print(f"-> OK [{r.status_code}]")
    return body


def print_debate_result(body):
    # evaluation may be at top level or nested under a key
    ev = body.get("evaluation", body)

    score_keys = ["argument_strength", "logic", "rebuttal_quality",
                  "persuasiveness", "critical_thinking", "overall"]

    print("\n--- SCORES ---")
    for k in score_keys:
        if k in ev:
            print(f"  {k.replace('_', ' ').title():<20}: {ev[k]}")

    print("\n--- STRENGTHS ---")
    for s in ev.get("strengths", []):
        print(f"  + {s}")

    print("\n--- IMPROVEMENTS ---")
    for s in ev.get("improvements", []):
        print(f"  - {s}")

    print("\n--- SUMMARY ---")
    print(f"  {ev.get('summary', 'N/A')}")

    # computed metrics, if your /debate/end returns them
    metrics = body.get("metrics")
    if metrics:
        print("\n--- COMPUTED METRICS ---")
        for k, v in metrics.items():
            print(f"  {k}: {v}")


# 1. signup (400 is fine if the user already exists)
step("1. Signup")
r = requests.post(f"{BASE}/signup", json={"name": "Test", "email": EMAIL, "password": PASSWORD})
check(r, ok_codes=(200, 201, 400))

# 2. login
step("2. Login")
r = requests.post(f"{BASE}/login", json={"email": EMAIL, "password": PASSWORD})
body = check(r)
headers = {"Authorization": f"Bearer {body['access_token']}"}

# 3. speaking: start
step("3. Speak - start")
r = requests.post(f"{BASE}/speak/start", json={"difficulty": "easy", "duration": 2}, headers=headers)
topic = check(r)["topic"]
print("Topic:", topic)

# 4. speaking: submit audio
step("4. Speak - submit audio ")
mime = "audio/mpeg" if AUDIO_FILE.suffix.lower() == ".mp3" else "audio/wav"
start = time.time()
with open(AUDIO_FILE, "rb") as f:
    r = requests.post(
        f"{BASE}/speak/submit",
        data={"topic": topic},
        files={"audio": (AUDIO_FILE.name, f, mime)},
        headers=headers,
        timeout=300,
    )
check(r)
print(f"Time taken: {time.time() - start:.1f} sec")

# 5. debate: start
step("5. Debate - start")
r = requests.post(
    f"{BASE}/debate/start",
    json={"topic": "Social media does more good than harm", "stance": "support", "duration_minutes": 5},
    headers=headers,
)
session_id = check(r)["session_id"]

# 5.x debate: turns
messages = [
    "Social media connects people across the world, for example families living in different countries.",
    "It also helps small businesses reach customers because advertising becomes cheap.",
    "Yes echo chambers exist, but people can also learn new ideas since information is easy to find.",
]
for i, msg in enumerate(messages, 1):
    step(f"5.{i} Debate - turn {i}")
    print("User:", msg)
    r = requests.post(f"{BASE}/debate/turn", json={"session_id": session_id, "message": msg},
                      headers=headers, timeout=120)
    check(r)

# 6. debate: end and evaluation (printed in a clean format)
step("6. Debate - end and evaluation")
r = requests.post(f"{BASE}/debate/end", json={"session_id": session_id}, headers=headers, timeout=120)
if r.status_code != 200:
    print(r.text)
    print(f"\nFAILED with status {r.status_code}. Stopping.")
    sys.exit(1)
print_debate_result(r.json())
print("-> OK")

# 7. history
step("7. History")
check(requests.get(f"{BASE}/history", headers=headers))
check(requests.get(f"{BASE}/debate/history", headers=headers))

print("\n\nALL STEPS PASSED")