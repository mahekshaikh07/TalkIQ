import { USE_MOCK_DATA, API_BASE } from "../config/dashboardConfig";
import { MOCK_SPEECH_SESSIONS, MOCK_DEBATE_SESSIONS } from "../data/mockSessions";

const MOCK_DELAY_MS = 500;
const TOKEN_KEY = "talkiq_token"; // same key used by src/services/api.js

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function fetchSessions(path) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(API_BASE + path, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    throw new Error("Request failed (" + res.status + ")");
  }
  const data = await res.json();
  return data && Array.isArray(data.sessions) ? data.sessions : [];
}

export async function getSpeechSessions() {
  if (USE_MOCK_DATA) {
    await delay(MOCK_DELAY_MS);
    return JSON.parse(JSON.stringify(MOCK_SPEECH_SESSIONS));
  }
  return fetchSessions("/history");
}

export async function getDebateSessions() {
  if (USE_MOCK_DATA) {
    await delay(MOCK_DELAY_MS);
    return JSON.parse(JSON.stringify(MOCK_DEBATE_SESSIONS));
  }
  return fetchSessions("/debate/history");
}