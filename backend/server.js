require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seed');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FoodieHub Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Seed API endpoint for one-click demo data reset
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered. An account or item already exists with this data.',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid session token. Please log in again.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start Server if executed directly
let isConnected = false;
const initServer = async () => {
  if (!isConnected) {
    await connectDB();
    await seedDatabase();
    isConnected = true;
  }
};

const http = require('http');
const { initSocket } = require('./utils/socket');

if (require.main === module) {
  initServer().then(() => {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FoodieHub Backend Server running on port ${PORT}`);
    });
  });
}

module.exports = { app, initServer };
