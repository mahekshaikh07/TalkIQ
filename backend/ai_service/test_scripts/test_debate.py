import sys
sys.path.append('..')
from main_ai_functions import process_debate_turn, process_debate_evaluation

from debate_metrics import (
    calculate_rebuttal_relevance,
    count_evidence_keywords,
    calculate_debate_vocabulary_diversity,
    calculate_response_length_trend
)

history = []
topic = "Social media does more harm than good"

response = process_debate_turn(history, "I think social media connects people globally.", topic, "oppose")
print("AI says:", response)

history.append({"role": "user", "content": "I think social media connects people globally."})
history.append({"role": "assistant", "content": response})

eval_result = process_debate_evaluation(history, topic, "support")
print("Evaluation:", eval_result)

# wherever full_conversation is ready, before/after calling process_debate_evaluation:
print("Rebuttal Relevance:", calculate_rebuttal_relevance(history))
print("Evidence Keywords:", count_evidence_keywords(history))
print("Vocab Diversity:", calculate_debate_vocabulary_diversity(history))
print("Length Trend:", calculate_response_length_trend(history))