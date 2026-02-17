const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
require('dotenv').config();

const app = express();

// Trust proxy for correct rate limiting and IPs behind CDNs/proxies
app.set('trust proxy', 1);
app.disable('x-powered-by');

// CORS Configuration (must be before security and rate limiting, and handle preflight)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "https://greenfarmiq.netlify.app";
const CORS_ALLOW_ALL = String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';
const allowedOriginRegexes = [
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/,
  /^https:\/\/.*\.netlify\.app$/,
  /^https:\/\/greenfarmiq\.netlify\.app$/
];
const corsOptions = CORS_ALLOW_ALL
  ? {
      // Reflect request Origin header. This allows credentials with a permissive policy.
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
    }
  : {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origin === FRONTEND_ORIGIN || allowedOriginRegexes.some(rx => rx.test(origin))) {
          return cb(null, true);
        }
        return cb(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
    };
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.razorpay.com", "https://api.stripe.com"]
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // higher tolerance in development
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // never rate limit preflight
});
app.use(limiter);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Warn if critical envs are missing (development only)
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using fallback secret for development.');
  process.env.JWT_SECRET = 'fallback_secret_key_for_development'; // More explicit fallback
}

// Connect to MongoDB with robust fallbacks
const mongoPrimary = process.env.MONGO_URI;
const mongoAlt = process.env.MONGODB_URI;
const mongoLocal = 'mongodb://localhost:27017/agricultural-marketplace';

const connectMongo = async () => {
  const tryConnect = async (uri, label) => {
    if (!uri) return false;
    try {
      // Using newer connection options for MongoDB
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });
      console.log(`MongoDB connected (${label})`);
      return true;
    } catch (err) {
      console.error(`MongoDB connection error (${label}):`, err.message);
      return false;
    }
  };

  if (await tryConnect(mongoPrimary, 'MONGO_URI')) return;
  if (await tryConnect(mongoAlt, 'MONGODB_URI')) return;
  if (await tryConnect(mongoLocal, 'local')) return;

  console.error('Failed to connect to any MongoDB URI. Check environment variables.');
};

connectMongo();

// Health check and database status
app.get('/', (req, res) => {
  // Check if MongoDB connection is ready
  if (mongoose.connection.readyState === 1) {
    res.json({
      status: 'success',
      message: 'Agricultural Marketplace API is running!',
      database: 'connected'
    });
  } else {
    res.status(503).json({
      status: 'error',
      message: 'Agricultural Marketplace API is running but database is disconnected',
      database: 'disconnected'
    });
  }
});

// Database connection status endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database_connected: mongoose.connection.readyState === 1,
    database_state: mongoose.connection.readyState
  });
});

// User Routes
app.use('/api/users', require('./routes/users'));

// Product Listing Routes
app.use('/api/product-listings', require('./routes/productListings'));

// Bid Routes
app.use('/api/bids', require('./routes/bids'));

// Matching Routes
app.use('/api/matching', require('./routes/matching'));

// Order Routes
app.use('/api/orders', require('./routes/orders'));

// Chat Routes
app.use('/api/chat', require('./routes/chat'));

// Admin Routes
app.use("/api/admin", require("./routes/admin"));

// Payments disabled per requirements

// Error handling
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
