import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'FLOWSTATE Core Engine',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);

app.use(errorHandler);

export default app;
