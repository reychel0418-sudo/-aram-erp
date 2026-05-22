/**
 * ARAM ERP — 개발 서버 (Development Server)
 * 실행: node server.js  또는  npm run dev
 * URL:  http://localhost:3000
 */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── 개발 환경 헤더 ── */
app.use((req, res, next) => {
  res.setHeader('X-Environment', 'development');
  res.setHeader('Cache-Control', 'no-store');  // 개발 중 캐시 비활성화
  next();
});

/* ── 정적 파일 서빙 ── */
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  etag: false,
}));

/* ── SPA 폴백: 모든 경로를 index.html 로 ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   ARAM ERP  —  개발 서버 (DEV)       ║');
  console.log(`  ║   http://localhost:${PORT}               ║`);
  console.log('  ║   NODE_ENV = development             ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
