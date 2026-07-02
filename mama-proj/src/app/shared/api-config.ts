// Fill this in with your deployed backend URL (e.g. https://quiz-backend.onrender.com)
// once it's live. Left empty, API calls go to relative paths (used by the local dev proxy).
const PROD_API_BASE_URL = '';

export function getApiBaseUrl(): string {
  return window.location.hostname === 'localhost' ? '' : PROD_API_BASE_URL;
}

export function getWsBaseUrl(): string {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return `ws://${window.location.hostname}:3000`;
  }

  return apiBaseUrl.replace(/^http/, 'ws');
}
