import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from './routes/userRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ✅ CORS configuration — allow preflight and correct origins
const allowedOrigins = [
  'https://mern-event-management-ss19.vercel.app', // your Vercel frontend
  'https://mern-event-management-ndmr.vercel.app', // alternate frontend (if any)
  'http://localhost:5173',                         // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// Middleware to parse JSON
app.use(express.json());

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// ✅ Default route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
