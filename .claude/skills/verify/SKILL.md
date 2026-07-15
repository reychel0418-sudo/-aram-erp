---
name: verify
description: ARAM ERP(정적 HTML+JS SPA)를 실제 브라우저로 구동해 변경사항을 확인하는 방법
---

# ARAM ERP 검증 방법

## 실행
```bash
npm install          # express 등
node server.js       # http://localhost:3000 (백그라운드로)
```

## 브라우저 구동 (headless)
- 로그인 우회: Playwright `addInitScript`에서
  `sessionStorage.setItem('aram_logged_in','true')` +
  `sessionStorage.setItem('aram_user', JSON.stringify({name:'김영업',role:'과장',dept:'영업1팀'}))`
  설정 후 `http://localhost:3000/app.html` 직접 진입.
- 페이지 이동: `page.evaluate(() => goPage('sales-orders'))` 등 (페이지 키는 js/pages.js의 ARAM_PAGES 키).
- Playwright는 scratchpad에 `playwright-core`만 설치하고
  `executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'` 사용.

## 구조 요점
- 데이터: `window._clientsDB` / `_itemsDB` / `_ordersDB` — localStorage(`aram_clients`/`aram_items`/`aram_orders`)에 저장, 없으면 js/pages.js의 기본 시드 사용.
- 모달 API: `ARAM_UI.Modal.open({title,body,size,footer})`만 존재. `Modal.close()`는 **없음** — footer의 `onClick:(close)=>close()` 콜백 또는 Escape로 닫기.
- 주문 입력 그리드: 코드 입력 후 `change` 이벤트를 dispatch해야 자동채움(`_orderFillProduct`/`_orderFillFabric`)이 동작.

## 알려진 무해 오류
- `Chart is not defined` pageerror — CDN 차단 환경에서 charts.js가 Chart.js를 못 불러서 발생. 페이지 렌더에는 영향 없음.
