window.apiRequest = async function apiRequest(path, options = {}) {
  const base = window.APP_CONFIG?.API_BASE_URL;
  if (!base) throw new Error('API URL is not configured.');
  const response = await fetch(`${base}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Something went wrong. Please try again.');
  return payload;
};
