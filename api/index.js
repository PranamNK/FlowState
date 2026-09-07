import app from '../server/app.js';
import { connectDB } from '../server/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err.message);
    return res.status(500).json({
      success: false,
      message: `Database connection error: ${err.message}. Please verify that MongoDB Atlas Network Access has 0.0.0.0/0 enabled.`,
    });
  }
  return app(req, res);
}
