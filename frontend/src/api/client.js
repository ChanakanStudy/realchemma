import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_PROFILE_KEY = 'user_profile';

function buildUrl(path) {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function parseResponseBody(response, rawBody) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return rawBody ? JSON.parse(rawBody) : null;
  }

  return rawBody;
}

async function readResponse(response) {
  const rawBody = await response.text();
  const data = parseResponseBody(response, rawBody);

  if (!response.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data
      ? data.detail
      : data || response.statusText || 'Request failed';
    throw new Error(detail);
  }

  return data;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

export function saveSession(authResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.access_token);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(authResponse.user));
}

export function loadStoredSession() {
  const token = getAccessToken();
  const userJson = localStorage.getItem(USER_PROFILE_KEY);

  if (!token || !userJson) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }

    return JSON.parse(userJson);
  } catch (error) {
    clearSession();
    return null;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, token } = {}) {
  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return readResponse(response);
}

export async function loginUser(username_or_email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { username_or_email, password },
  });

  saveSession(data);
  return data;
}

export async function registerUser(username, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });

  saveSession(data);
  return data;
}

export async function getCurrentUser() {
  return apiRequest('/auth/me', {
    method: 'GET',
    token: getAccessToken(),
  });
}

export async function postNpcChat(message, history = []) {
  return apiRequest('/npc/npc-chat', {
    method: 'POST',
    body: { message, history },
  });
}

export async function getQuestState() {
  return apiRequest('/quests/state', {
    method: 'GET',
    token: getAccessToken(),
  });
}

export async function acceptQuest(questId) {
  return apiRequest(`/quests/accept/${questId}`, {
    method: 'POST',
    token: getAccessToken(),
  });
}

export async function completeQuest(questId, bossId) {
  return apiRequest('/quests/complete', {
    method: 'POST',
    token: getAccessToken(),
    body: {
      quest_id: questId,
      boss_id: bossId,
    },
  });
}