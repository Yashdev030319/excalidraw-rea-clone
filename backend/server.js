
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const drawingRoutes = require('./routes/drawingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORS CONFIGURATION
// Supports multiple frontend origins
// ==========================================

const ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// BODY PARSER MIDDLEWARE
// ==========================================

app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}));

// ==========================================
// REQUEST LOGGING
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );
    next();
  });
}

// ==========================================
// HEALTH CHECK API
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'excalidraw-rea-backend'
  });
});

// ==========================================
// DRAWING API ROUTES
// ==========================================

app.use('/api/drawings', drawingRoutes);

// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`
  });
});

// ==========================================
// CENTRALIZED ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error'
  });
});

// ==========================================
// START SERVER
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('===============================================');
    console.log(' Excalidraw Lab Backend');
    console.log('===============================================');
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Port        : ${PORT}`);
    console.log(` Health Check: /api/health`);
    console.log(` API Base    : /api/drawings`);
    console.log(` CORS Origins: ${ORIGINS.join(', ')}`);
    console.log('===============================================');
  });
}

module.exports = app;
