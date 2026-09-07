import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, timezone, preferences } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    const result = await authService.registerUser({ name, email, password, timezone, preferences });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const result = await authService.loginUser({ email, password });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
}
