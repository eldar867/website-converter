import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = ['https://converter-online.vercel.app', 'http://localhost:5173'];

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidPassword = (password) => {
  return password && password.length >= 6 && password.length <= 128;
};

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Некорректный email или пароль' });
    }

    const result = await sql`
      SELECT id, email, password FROM users WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    return res.status(200).json({
      message: 'Вход успешен',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}