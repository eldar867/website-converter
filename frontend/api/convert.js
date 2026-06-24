import { sql } from '@vercel/postgres';
import axios from 'axios';
import * as cheerio from 'cheerio';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = ['https://converter-online.vercel.app', 'http://localhost:5173'];
const MAX_URL_LENGTH = 2048;
const REQUEST_TIMEOUT = 10000;


const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && url.length <= MAX_URL_LENGTH;
  } catch {
    return false;
  }
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

const validateToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token || token.length > 500) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

const sanitizeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const fetchWebsiteHtml = async (url) => {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    maxRedirects: 5,
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml'
    },
    validateStatus: (status) => status < 400
  });
  return response.data;
};

const parseWebsiteData = (html, url) => {
  const $ = cheerio.load(html);
  
  return {
    url: url,
    title: sanitizeHtml($('title').text().trim()),
    description: sanitizeHtml($('meta[name="description"]').attr('content') || ''),
    headings: {
      h1: $('h1').map((i, el) => sanitizeHtml($(el).text().trim())).get(),
      h2: $('h2').map((i, el) => sanitizeHtml($(el).text().trim())).get()
    },
    links: $('a').map((i, el) => ({
      text: sanitizeHtml($(el).text().trim()),
      href: $(el).attr('href')
    })).get().filter(link => link.text && link.href).slice(0, 20)
  };
};

const saveToDatabase = async (userId, url, format, data) => {
  await sql`
    INSERT INTO conversions (user_id, url, format, result, created_at)
    VALUES (${userId}, ${url}, ${format}, ${JSON.stringify(data)}, NOW())
  `;
};

const formatAsJson = (data) => data;

const formatAsCsv = (data) => {
  let csv = 'Type,Content,Href\n';
  data.headings.h1.forEach(h => { 
    csv += `H1,"${h.replace(/"/g, '""')}",\n`; 
  });
  data.links.forEach(l => { 
    csv += `Link,"${l.text.replace(/"/g, '""')}","${l.href}"\n`; 
  });
  return csv;
};

const formatAsXml = (data) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<website>\n';
  xml += `  <title>${data.title}</title>\n`;
  data.links.forEach(l => { 
    xml += `    <link href="${l.href}">${l.text}</link>\n`; 
  });
  xml += `</website>`;
  return xml;
};

const sendFormattedResponse = (res, format, data) => {
  if (format === 'json') {
    return res.status(200).json(formatAsJson(data));
  }
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(formatAsCsv(data));
  }
  if (format === 'xml') {
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(formatAsXml(data));
  }
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
    const userId = validateToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const { url, format } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    if (!['json', 'csv', 'xml'].includes(format)) {
      return res.status(400).json({ error: 'Некорректный формат' });
    }

    const html = await fetchWebsiteHtml(url);
    const data = parseWebsiteData(html, url);
    await saveToDatabase(userId, url, format, data);
    
    return sendFormattedResponse(res, format, data);

  } catch (error) {
    console.error('Convert error:', error);
    return res.status(500).json({ error: 'Не удалось получить данные сайта' });
  }
}