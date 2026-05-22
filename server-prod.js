/**
 * ARAM ERP — 운영 서버 (Production Server)
 * 실행: NODE_ENV=production node server-prod.js  또는  npm run prod
 * URL:  http://0.0.0.0:8080
 */

const express     = require('express');
const path        = require('path');
const compression = require('compression');
const helmet      = require('helmet');

const app  = express();
const PORT = process.env.PORT || 8080;

/* ── 보안 헤더 ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc : ["'self'"],
      scriptSrc  : ["'self'", 'cdn.jsdelivr.net', "'unsafe-inline'"],
      styleSrc   : ["'self'", 'fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc    : ["'self'", 'fonts.gstatic.com'],
      imgSrc     : ["'self'", 'data:', 'blob:'],
      connectSrc : ["'self'"],
    },
  },
}));

/* ── Gzip 압축 ── */
app.use(compression());

/* ── 운영 환경 헤더 ── */
app.use((req, res, next) => {
  res.setHeader('X-Environment', 'production');
  next();
});

/* ── 정적 파일 (1일 캐시) ── */
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  maxAge: '1d',
  etag: true,
}));

/* ── SPA 폴백 ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   ARAM ERP  —  운영 서버 (PROD)      ║');
  console.log(`  ║   http://0.0.0.0:${PORT}               ║`);
  console.log('  ║   NODE_ENV = production              ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
