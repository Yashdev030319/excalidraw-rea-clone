const drawingService = require('../services/drawingService');

async function listDrawings(req, res, next) {
  try {
    const drawings = await drawingService.getAllDrawings();
    res.json({
      success: true,
      count: drawings.length,
      data: drawings
    });
  } catch (err) {
    next(err);
  }
}

async function getDrawing(req, res, next) {
  try {
    const { id } = req.params;
    const cleanId = drawingService.sanitizeId(id);
    if (!cleanId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid drawing ID'
      });
    }

    const drawing = await drawingService.getDrawingById(cleanId);
    if (!drawing) {
      return res.status(404).json({
        success: false,
        error: 'Drawing not found'
      });
    }

    res.json({
      success: true,
      data: drawing
    });
  } catch (err) {
    next(err);
  }
}

async function saveDrawing(req, res, next) {
  try {
    const { name, elements, appState } = req.body;

    // Validation
    if (elements !== undefined && !Array.isArray(elements)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: elements must be an array'
      });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: name must be a string'
      });
    }

    const drawing = await drawingService.createDrawing({
      name,
      elements: elements || [],
      appState: appState || {}
    });

    res.status(201).json({
      success: true,
      message: 'Drawing created successfully',
      data: drawing
    });
  } catch (err) {
    next(err);
  }
}

async function updateDrawing(req, res, next) {
  try {
    const { id } = req.params;
    const cleanId = drawingService.sanitizeId(id);
    if (!cleanId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid drawing ID'
      });
    }

    const { name, elements, appState } = req.body;

    if (elements !== undefined && !Array.isArray(elements)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: elements must be an array'
      });
    }

    const updated = await drawingService.updateDrawing(cleanId, {
      name,
      elements,
      appState
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Drawing not found'
      });
    }

    res.json({
      success: true,
      message: 'Drawing updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function removeDrawing(req, res, next) {
  try {
    const { id } = req.params;
    const cleanId = drawingService.sanitizeId(id);
    if (!cleanId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid drawing ID'
      });
    }

    const deleted = await drawingService.deleteDrawing(cleanId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Drawing not found'
      });
    }

    res.json({
      success: true,
      message: 'Drawing deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDrawings,
  getDrawing,
  saveDrawing,
  updateDrawing,
  removeDrawing
};

