import api, { toApiError } from "../services/api";
import { USE_MOCK_DATA } from "../config/dashboardConfig";

const MOCK_DELAY_MS = 300;

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function fetchSessions(path) {
  try {
    const { data } = await api.get(path);
    return data && Array.isArray(data.sessions) ? data.sessions : [];
  } catch (err) {
    throw toApiError(err, "Could not load your sessions.");
  }
}

export async function getSpeechSessions() {
  if (USE_MOCK_DATA) {
    const { MOCK_SPEECH_SESSIONS } = await import("../data/mockSessions");
    await delay(MOCK_DELAY_MS);
    return JSON.parse(JSON.stringify(MOCK_SPEECH_SESSIONS));
  }
  return fetchSessions("/history");
}

// Returns every debate (also unfinished ones). Use onlyCompleted() from
// dashboardHelpers when you only want the evaluated debates.
export async function getDebateSessions() {
  if (USE_MOCK_DATA) {
    const { MOCK_DEBATE_SESSIONS } = await import("../data/mockSessions");
    await delay(MOCK_DELAY_MS);
    return JSON.parse(JSON.stringify(MOCK_DEBATE_SESSIONS));
  }
  return fetchSessions("/debate/history");
}
