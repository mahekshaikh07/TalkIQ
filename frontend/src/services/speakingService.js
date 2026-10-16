import api, { toApiError } from "./api";

// Sends the recorded audio + topic to the backend.
// Returns { session_id, transcript, metrics, scores, strengths, improvements, summary }.
export async function submitSpeech({ topic, audioBlob, filename }) {
  const form = new FormData();
  form.append("topic", topic);
  form.append("audio", new File([audioBlob], filename, { type: audioBlob.type }));

  try {
    // Whisper + the AI evaluation can take a while, so wait up to 3 minutes.
    const { data } = await api.post("/speak/submit", form, { timeout: 180000 });
    return data;
  } catch (err) {
    throw toApiError(err, "Could not analyse your speech. Please try again.");
  }
}
