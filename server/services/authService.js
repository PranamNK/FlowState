import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'flowstate_dev_jwt_secret_key_super_secure_2026',
    { expiresIn: '30d' }
  );
}

export async function registerUser({ name, email, password, timezone, preferences }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    timezone: timezone || 'UTC',
    preferences: preferences || {},
  });

  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
}
