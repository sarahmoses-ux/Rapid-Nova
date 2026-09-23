export async function api(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, { method, credentials: 'same-origin', signal, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to connect. Check your connection and try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Unable to complete this request. Please try again.'); error.status = response.status; throw error; }
  return data;
}
export const placements = ['Travel', 'Contract', 'Permanent', 'Temporary-to-permanent', 'Per diem'];
