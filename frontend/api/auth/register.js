import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

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

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (email, password, created_at)
      VALUES (${email}, ${hashedPassword}, NOW())
      RETURNING id, email, created_at
    `;

    return res.status(201).json({ 
      message: 'Регистрация успешна',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}