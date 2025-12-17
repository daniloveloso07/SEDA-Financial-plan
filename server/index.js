// ═══════════════════════════════════════════════════════════
// SEDA FINANCE PLAN - EXPRESS SERVER
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import applicationsRouter from './routes/applications.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
// NOTE: This MVP uses in-memory rate limiting which works for single-server deployments.
// For production scale with multiple servers or high traffic, consider using Redis or
// an external rate limiting service (e.g., express-rate-limit with Redis store).
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour per IP
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/applications', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/applications', applicationsRouter);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/apply', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/apply.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/result.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ SEDA Finance Plan server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
