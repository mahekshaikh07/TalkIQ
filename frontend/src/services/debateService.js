import api, { toApiError } from "./api";

// stance must be "support" or "oppose". durationMinutes must be 2 to 15.
export async function startDebate({ topic, stance, durationMinutes }) {
  try {
    const { data } = await api.post("/debate/start", {
      topic,
      stance,
      duration_minutes: durationMinutes,
    });
    return data; // { session_id, topic, stance, duration_minutes }
  } catch (err) {
    throw toApiError(err, "Could not start the debate.");
  }
}

// Returns { ai_reply, seconds_remaining }.
export async function sendDebateTurn(sessionId, message) {
  try {
    const { data } = await api.post(
      "/debate/turn",
      { session_id: sessionId, message },
      { timeout: 90000 }
    );
    return data;
  } catch (err) {
    throw toApiError(err, "The AI could not reply. Please try again.");
  }
}

// Returns { scores, strengths, improvements, summary }.
export async function endDebate(sessionId) {
  try {
    const { data } = await api.post(
      "/debate/end",
      { session_id: sessionId },
      { timeout: 180000 }
    );
    return data;
  } catch (err) {
    throw toApiError(err, "Could not evaluate the debate. Please try again.");
  }
}

// The backend has no "get one session" route, so read the history and pick the session.
export async function fetchDebateSession(sessionId) {
  try {
    const { data } = await api.get("/debate/history");
    const list = data && Array.isArray(data.sessions) ? data.sessions : [];
    return list.find((s) => s._id === sessionId) || null;
  } catch (err) {
    throw toApiError(err, "Could not load the debate.");
  }
}
