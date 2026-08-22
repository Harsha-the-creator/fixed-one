/**
 * College Admission System - Backend Server
 * Handles email sending and serves frontend static files
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5503',
  'file://'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow null origin for file:// protocol
    if (origin === 'null') {
      return callback(null, true);
    }
    
    // Allow all localhost variations
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For any other origin, log but still allow (for development)
    console.warn(`⚠️  CORS request from: ${origin}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
}));
app.options('*', cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));



// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running', timestamp: new Date().toISOString() });
});

// Firebase web configuration is read from the server environment instead of source files.
app.get('/api/firebase-config', (req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };

  if (Object.values(config).some(value => !value)) {
    return res.status(503).json({ error: 'Firebase configuration is unavailable' });
  }

  res.json(config);
});

app.post('/api/send-status-email', async (req, res) => {
  const { email, studentName, applicationId, status } = req.body || {};
  const allowedStatuses = ['approved', 'rejected', 'pending'];

  if (!email || !studentName || !applicationId || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Incomplete status email details' });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(503).json({ error: 'Email service is not configured' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'not approved' : 'returned to pending review';

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Application ${applicationId} status update`,
      text: `Dear Parent/Guardian,\n\nThe application for ${studentName} (ID: ${applicationId}) has been ${statusText}.\n\nPlease contact the admissions office for further details.\n\nGAYATRI JUNIOR & DEGREE COLLEGE`
    });
    res.json({ sent: true });
  } catch (error) {
    console.error('Status email failed:', error);
    res.status(502).json({ error: 'Unable to send status email' });
  }
});

// Catch-all route to serve index.html for SPA-like navigation
app.get('*', (req, res) => {
  // Don't serve files for /api routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n✅ College Admission System Backend Server`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`💊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Frontend: http://localhost:${PORT}\n`);
});
