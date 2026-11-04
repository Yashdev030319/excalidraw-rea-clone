const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawingController');

// GET /api/drawings - List all drawings
router.get('/', drawingController.listDrawings);

// POST /api/drawings - Save drawing
router.post('/', drawingController.saveDrawing);

// GET /api/drawings/:id - Get drawing by ID
router.get('/:id', drawingController.getDrawing);

// PUT /api/drawings/:id - Update drawing
router.put('/:id', drawingController.updateDrawing);

// DELETE /api/drawings/:id - Delete drawing
router.delete('/:id', drawingController.removeDrawing);

module.exports = router;

