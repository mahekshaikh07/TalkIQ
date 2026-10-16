import api, { toApiError } from "../services/api";

async function fetchSessions(path) {
  try {
    const { data } = await api.get(path);
    return data && Array.isArray(data.sessions) ? data.sessions : [];
  } catch (err) {
    throw toApiError(err, "Could not load your sessions.");
  }
}

export async function getSpeechSessions() {
  return fetchSessions("/history");
}

// Returns every debate (also unfinished ones). Use onlyCompleted() from
// dashboardHelpers when you only want the evaluated debates.
export async function getDebateSessions() {
  return fetchSessions("/debate/history");
}
