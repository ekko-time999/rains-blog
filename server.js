/**
 * Rains Blog — Express 服务器
 */
const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'rains.db');
const MESSAGE_LIMITS = { name: 80, content: 5000, seat: 20 };

function parsePositiveInt(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function readQueryString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function normalizePost(post) {
  return post ? { ...post, tags: parseJsonArray(post.tags) } : post;
}

function normalizeProject(project) {
  return project ? { ...project, tags: parseJsonArray(project.tags) } : project;
}

// 数据库
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// 中间件
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  const blocked = req.path === '/server.js'
    || req.path === '/init-db.js'
    || req.path === '/package.json'
    || req.path === '/package-lock.json'
    || req.path.startsWith('/data/');
  if (blocked) return res.status(404).end();
  next();
});
app.use(express.static(path.join(__dirname), {
  etag: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'rains-blog',
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ========== 公开 API ==========

// 剧目
app.get('/api/posts', (req, res) => {
  const category = readQueryString(req.query.category);
  const page = parsePositiveInt(req.query.page, 1);
  if (!page) return res.status(400).json({ error: 'page must be a positive integer' });
  const limit = 10;
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT * FROM posts WHERE status = \'published\'';
  let countSql = 'SELECT COUNT(*) as total FROM posts WHERE status = \'published\'';
  const params = [];
  const countParams = [];
  
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    countSql += ' AND category = ?';
    params.push(category);
    countParams.push(category);
  }
  
  sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const posts = db.prepare(sql).all(...params).map(normalizePost);
  const { total } = db.prepare(countSql).get(...countParams);

  const totalPages = Math.ceil(total / limit);
  res.json({
    posts,
    pagination: { page, perPage: limit, total, totalPages },
    total,
    page,
    pages: totalPages
  });
});

// 归档（放在 :slug 前面，避免被误匹配）
app.get('/api/posts/archive', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts WHERE status = \'published\' ORDER BY published_at DESC').all().map(normalizePost);
  res.json({ posts });
});

app.get('/api/posts/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE slug = ? AND status = \'published\'').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(normalizePost(post));
});

app.get('/api/posts/:slug/adjacent', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE slug = ? AND status = \'published\'').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  const prev = db.prepare('SELECT * FROM posts WHERE status = \'published\' AND published_at < ? ORDER BY published_at DESC LIMIT 1').get(post.published_at);
  const next = db.prepare('SELECT * FROM posts WHERE status = \'published\' AND published_at > ? ORDER BY published_at ASC LIMIT 1').get(post.published_at);
  
  res.json({ prev, next });
});

// 项目
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all().map(normalizeProject);
  res.json({ projects });
});

// 友链
app.get('/api/friends', (req, res) => {
  const friends = db.prepare('SELECT * FROM friends ORDER BY sort_order ASC').all();
  res.json({ friends });
});

// 私藏
app.get('/api/recommendations', (req, res) => {
  const type = readQueryString(req.query.type);
  let sql = 'SELECT * FROM recommendations';
  const params = [];
  if (type) {
    sql += ' WHERE type = ?';
    params.push(type);
  }
  sql += ' ORDER BY sort_order ASC';
  const recommendations = db.prepare(sql).all(...params);
  res.json({ recommendations, total: recommendations.length });
});

// 留言板
app.get('/api/messages', (req, res) => {
  const messages = db.prepare(`
    SELECT id, name, content, seat, created_at FROM messages
    WHERE status = 'approved' 
    ORDER BY created_at DESC
  `).all();
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  const seat = typeof req.body?.seat === 'string' ? req.body.seat.trim() : '';
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }
  if (name.length > MESSAGE_LIMITS.name) {
    return res.status(400).json({ error: `Name must be ${MESSAGE_LIMITS.name} characters or fewer` });
  }
  if (content.length > MESSAGE_LIMITS.content) {
    return res.status(400).json({ error: `Content must be ${MESSAGE_LIMITS.content} characters or fewer` });
  }
  if (seat.length > MESSAGE_LIMITS.seat) {
    return res.status(400).json({ error: `Seat must be ${MESSAGE_LIMITS.seat} characters or fewer` });
  }
  const result = db.prepare(`
    INSERT INTO messages (name, content, seat, status)
    VALUES (?, ?, ?, 'pending')
  `).run(name, content, seat);
  res.json({ id: result.lastInsertRowid, status: 'pending' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ========== SPA 路由 ==========
// 所有非 API、非静态文件的请求都返回 index.html，支持前端路由
app.get(/^((?!api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  if (!req.path.startsWith('/api/')) return next(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  if (err instanceof SyntaxError && err.status === 400 && err.body) {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  console.error('API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== 启动服务器 ==========
const server = app.listen(PORT, () => {
  console.log(`✦ 剧场已开启：http://localhost:${PORT}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`✦ 收到 ${signal}，正在关闭剧场...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
