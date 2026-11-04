const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function fetchDrawings() {
  const res = await fetch(`${API_BASE}/drawings`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to load drawings: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchDrawingById(id) {
  const res = await fetch(`${API_BASE}/drawings/${id}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to load drawing ${id}: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function createDrawingOnBackend(drawingData) {
  const res = await fetch(`${API_BASE}/drawings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(drawingData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function updateDrawingOnBackend(id, drawingData) {
  const res = await fetch(`${API_BASE}/drawings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(drawingData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function deleteDrawingOnBackend(id) {
  const res = await fetch(`${API_BASE}/drawings/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

