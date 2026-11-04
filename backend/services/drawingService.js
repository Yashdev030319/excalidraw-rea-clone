const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', process.env.DATA_DIR || './data/drawings');

// Ensure storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

function getFilePath(id) {
  const cleanId = sanitizeId(id);
  if (!cleanId) return null;
  return path.join(DATA_DIR, `${cleanId}.json`);
}

async function getAllDrawings() {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }

  const files = await fs.promises.readdir(DATA_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const summaries = [];
  for (const file of jsonFiles) {
    try {
      const fullPath = path.join(DATA_DIR, file);
      const raw = await fs.promises.readFile(fullPath, 'utf8');
      const data = JSON.parse(raw);
      summaries.push({
        id: data.id,
        name: data.name || 'Untitled Drawing',
        elementCount: Array.isArray(data.elements) ? data.elements.length : 0,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null
      });
    } catch (err) {
      console.error(`Error reading drawing file ${file}:`, err.message);
    }
  }

  // Sort newest first
  summaries.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  return summaries;
}

async function getDrawingById(id) {
  const filePath = getFilePath(id);
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const raw = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function createDrawing({ name, elements, appState }) {
  const now = new Date().toISOString();
  const id = `draw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const filePath = getFilePath(id);

  const drawing = {
    id,
    name: (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Untitled Drawing',
    elements: Array.isArray(elements) ? elements : [],
    appState: (appState && typeof appState === 'object') ? appState : {},
    createdAt: now,
    updatedAt: now
  };

  await fs.promises.writeFile(filePath, JSON.stringify(drawing, null, 2), 'utf8');
  return drawing;
}

async function updateDrawing(id, { name, elements, appState }) {
  const existing = await getDrawingById(id);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    name: (name && typeof name === 'string' && name.trim()) ? name.trim() : existing.name,
    elements: Array.isArray(elements) ? elements : existing.elements,
    appState: (appState && typeof appState === 'object') ? appState : existing.appState,
    updatedAt: now
  };

  const filePath = getFilePath(id);
  await fs.promises.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

async function deleteDrawing(id) {
  const filePath = getFilePath(id);
  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  await fs.promises.unlink(filePath);
  return true;
}

module.exports = {
  getAllDrawings,
  getDrawingById,
  createDrawing,
  updateDrawing,
  deleteDrawing,
  sanitizeId
};

