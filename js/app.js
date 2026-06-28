/* ============================================================
   ARAM ERP — app.js
   라우터 · 인증 · 사이드바 · 인터랙션
============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. 인증 체크
  ────────────────────────────────────────── */
  const loggedIn = sessionStorage.getItem('aram_logged_in');
  if (!loggedIn) {
    /* 개발 편의: file:// 직접 접근 시 기본 계정으로 자동 세팅 */
    const isFileDirect = location.protocol === 'file:';
    if (isFileDirect) {
      const defaultUser = { email:'admin@aram.co.kr', name:'김민수', role:'대표', dept:'경영지원팀' };
      sessionStorage.setItem('aram_logged_in', 'true');
      sessionStorage.setItem('aram_user', JSON.stringify(defaultUser));
    } else {
      window.location.href = 'index.html';
      return;
    }
  }

  /* 세션에서 사용자 정보 읽기 */
  let currentUser = {};
  try {
    currentUser = JSON.parse(sessionStorage.getItem('aram_user') || '{}');
  } catch (_) {}

  /* ──────────────────────────────────────────
     2. 환경 배너 (localhost = DEV)
  ────────────────────────────────────────── */
  const banner = document.getElementById('env-banner');
  if (banner) {
    const host = location.hostname;
    const isDev = host === 'localhost' || host === '127.0.0.1' || host === '';
    if (isDev) {
      banner.classList.add('dev');
      document.body.classList.add('has-env-banner');
    }
    /* 운영: banner 는 CSS default none 이므로 별도 처리 불필요 */
  }

  /* ──────────────────────────────────────────
     3. 사용자 정보 UI 반영
  ────────────────────────────────────────── */
  function applyUserInfo() {
    const name  = currentUser.name  || '사용자';
    const role  = currentUser.role  || '';
    const dept  = currentUser.dept  || '';
    const init  = name.charAt(0);

    _setText('sb-user-name',  name);
    _setText('sb-user-dept',  `${dept} · ${role}`);
    _setText('sb-avatar-init', init);
    _setText('tb-user-name',  name);
    _setText('tb-user-role',  `/ ${role}`);
    _setText('tb-avatar',     init);
  }

  function _setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  /* ──────────────────────────────────────────
     4. 페이지 라우터
  ────────────────────────────────────────── */
  const PAGE_TITLES = {
    dashboard          : '대시보드',
    menu               : '전체 메뉴',
    'sales-orders'     : '주문관리',
    'sales-order-detail': '주문 상세',
    'design-dtp'       : 'DTP 디자인',
    'design-emb'       : '자수 디자인',
    'production-dtp'   : 'DTP 생산',
    'production-emb'   : '자수 생산',
    'production-qlt'   : '퀄팅 생산',
    inventory          : '재고현황',
    fabricHub          : 'FabricHub',
    finance            : '재무관리',
    hr                 : '인사관리',
    purchase           : '구매관리',
    chat               : '사내커뮤니케이션',
    'system-users'     : '시스템설정',
  };

  let _currentPage = null;

  window.goPage = function (name) {
    /* 1) 모든 페이지 숨기기 */
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    /* 2) 타깃 페이지 컨테이너 */
    const target = document.getElementById('page-' + name);
    if (!target) return;

    /* 3) 렌더링 — menu·inventory 는 매번 재렌더 (재고는 품목등록 변경을 실시간 반영) */
    const alwaysRender = (name === 'menu' || name === 'inventory' || name === 'sales-orders');
    if (!target.dataset.rendered || alwaysRender) {
      const renderer = window.ARAM_PAGES && window.ARAM_PAGES[_normKey(name)];
      if (renderer) {
        target.innerHTML = renderer();
        /* innerHTML 로 삽입된 <script> 는 브라우저가 실행하지 않으므로
           새 script 엘리먼트로 교체하여 강제 실행 */
        target.querySelectorAll('script').forEach(function(oldScript) {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(function(attr) {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        target.dataset.rendered = '1';
      }
    }

    /* 4) 페이지 표시 */
    target.classList.add('active');
    _currentPage = name;

    /* 5) 차트 초기화 */
    if (window.ARAM_CHARTS) {
      window.ARAM_CHARTS.initCharts(name);
    }

    /* 6) 사이드바 active 처리 */
    _updateSidebarActive(name);

    /* 7) 브레드크럼 */
    const bcEl = document.getElementById('bc-current');
    if (bcEl) bcEl.textContent = PAGE_TITLES[name] || name;

    /* 8) 페이지별 후처리 */
    _postRender(name);

    /* 9) 모바일: 사이드바 자동 닫기 */
    if (window.matchMedia('(max-width:1024px)').matches) {
      window.closeMobileSidebar && window.closeMobileSidebar();
    }

    /* 10) 최근 방문 기록 저장 (menu 페이지 제외) */
    if (name !== 'menu') {
      try {
        const recents = JSON.parse(sessionStorage.getItem('aram_recents') || '[]');
        const filtered = recents.filter(p => p !== name);
        filtered.unshift(name);
        sessionStorage.setItem('aram_recents', JSON.stringify(filtered.slice(0, 5)));
      } catch(_) {}
    }
  };

  /* pages.js 메서드 키 — 하이픈 포함 그대로 사용 */
  function _normKey(name) {
    return name;  // pages.js 가 'sales-orders'() 처럼 원본 키를 그대로 씀
  }

  /* 페이지 렌더 후 추가 초기화 */
  function _postRender(name) {
    if (name === 'dashboard')    _initDashboard();
    if (name === 'chat')         _initChat();
    if (name === 'fabricHub')    _initFabricHub();
    if (name === 'sales-orders') _initSalesOrders();
    if (name === 'system-users') _initSystemUsers();
  }

  /* ──────────────────────────────────────────
     5. 사이드바
  ────────────────────────────────────────── */
  function _updateSidebarActive(name) {
    document.querySelectorAll('.sb-link, .sb-sub-link').forEach(el => {
      el.classList.remove('active');
    });
    /* data-page 매칭 */
    document.querySelectorAll(`[data-page="${name}"]`).forEach(el => {
      el.classList.add('active');
      /* 부모 sb-item 열기 */
      const sub = el.closest('.sb-sub');
      if (sub) {
        sub.style.maxHeight = sub.scrollHeight + 'px';
        const parentItem = sub.closest('.sb-item');
        if (parentItem) {
          const link = parentItem.querySelector('.sb-link');
          if (link) link.classList.add('active');
        }
      }
    });
  }

  window.toggleMenu = function (id) {
    const item = document.getElementById(id);
    if (!item) return;
    const sub = item.querySelector('.sb-sub');
    if (!sub) return;
    const isOpen = sub.style.maxHeight && sub.style.maxHeight !== '0px';
    /* 닫기 */
    if (isOpen) {
      sub.style.maxHeight = '0px';
      item.querySelector('.sb-link').classList.remove('active');
    } else {
      sub.style.maxHeight = sub.scrollHeight + 'px';
      item.querySelector('.sb-link').classList.add('active');
    }
  };

  window.toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    const ma = document.querySelector('.main-area');
    if (!sb) return;

    /* 모바일(≤1024px): slide-in/out 방식 */
    if (window.matchMedia('(max-width:1024px)').matches) {
      const overlay = document.getElementById('sb-overlay');
      const isOpen  = sb.classList.contains('mobile-open');
      if (isOpen) {
        sb.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('show');
      } else {
        sb.classList.add('mobile-open');
        if (overlay) overlay.classList.add('show');
      }
      return;
    }

    /* 데스크탑: collapsed 토글 */
    sb.classList.toggle('collapsed');
    if (ma) ma.classList.toggle('sb-collapsed');
    _injectSidebarTooltips();
  };

  window.closeMobileSidebar = function () {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sb-overlay');
    if (sb) sb.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('show');
  };

  /* 사이드바 링크에 data-tooltip 속성 주입 */
  function _injectSidebarTooltips() {
    document.querySelectorAll('#sidebar .sb-link').forEach(link => {
      const label = link.querySelector('.sb-label');
      if (label && !link.dataset.tooltip) {
        link.dataset.tooltip = label.textContent.trim();
      }
    });
  }

  /* 키보드 단축키 도움말 오버레이 */
  function _initShortcutsOverlay() {
    const SHORTCUTS = [
      { key: 'Ctrl + K', desc: '전체 검색' },
      { key: '?',         desc: '단축키 도움말' },
      { key: 'Esc',       desc: '오버레이 닫기' },
      { key: 'Alt + D',  desc: '대시보드' },
      { key: 'Alt + S',  desc: '주문관리' },
      { key: 'Alt + P',  desc: 'DTP 생산' },
      { key: 'Alt + I',  desc: '재고현황' },
      { key: 'Alt + F',  desc: '재무관리' },
      { key: 'Alt + H',  desc: '인사관리' },
      { key: 'Alt + C',  desc: '채팅' },
      { key: 'Alt + T',  desc: '다크/라이트 모드 전환' },
    ];

    document.addEventListener('keydown', function (e) {
      /* ? 키 단축키 도움말 */
      if (e.key === '?' && !e.target.matches('input,textarea,select')) {
        e.preventDefault();
        _toggleShortcuts(SHORTCUTS);
        return;
      }
      /* Alt + 단축키 */
      if (e.altKey) {
        const map = { d:'dashboard', s:'sales-orders', p:'production-dtp', i:'inventory', f:'finance', h:'hr', c:'chat' };
        const page = map[e.key.toLowerCase()];
        if (page) { e.preventDefault(); goPage(page); return; }
        /* Alt+T: 테마 토글 */
        if (e.key.toLowerCase() === 't') { e.preventDefault(); window.toggleTheme(); }
      }
    });
  }

  let _shortcutsEl = null;
  function _toggleShortcuts(list) {
    if (_shortcutsEl) { _shortcutsEl.remove(); _shortcutsEl = null; return; }

    const el = document.createElement('div');
    el.className = 'shortcuts-overlay';
    el.innerHTML = `
      <div class="shortcuts-box">
        <div class="shortcuts-title">
          키보드 단축키
          <button style="background:none;border:none;cursor:pointer;font-size:18px;color:#9ba8c0" onclick="this.closest('.shortcuts-overlay').remove()">✕</button>
        </div>
        <div class="shortcuts-grid">
          ${list.map(s => `
          <div class="shortcut-item">
            <span>${s.desc}</span>
            <div class="shortcut-key">${s.key.split('+').map(k=>`<kbd>${k.trim()}</kbd>`).join('<span style="color:#9ba8c0;font-size:11px;padding:0 2px">+</span>')}</div>
          </div>`).join('')}
        </div>
        <div style="margin-top:14px;font-size:12px;color:#9ba8c0;text-align:center">ESC 또는 배경 클릭으로 닫기</div>
      </div>
    `;
    document.body.appendChild(el);
    _shortcutsEl = el;

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    el.addEventListener('click', e => { if (e.target === el) { el.remove(); _shortcutsEl = null; } });

    const escFn = e => { if (e.key === 'Escape') { el.remove(); _shortcutsEl = null; document.removeEventListener('keydown', escFn); } };
    document.addEventListener('keydown', escFn);
  }

  /* ──────────────────────────────────────────
     6. 탭 전환 (범용)
     pages.js 는 onclick="switchTab(this,'detail-tab-0')" 형태를 사용하고
     패널은 id="detail-tab-0" + inline style="display:none" 으로 숨김
  ────────────────────────────────────────── */
  window.switchTab = function (btnEl, panelId) {
    if (!btnEl) return;

    /* 1) 같은 탭바의 모든 탭에서 active 제거 후 클릭된 탭 활성화 */
    const group = btnEl.closest('.tab-bar, .tabs');
    if (group) {
      group.querySelectorAll('.tab, .tab-btn').forEach(t => t.classList.remove('active'));
      btnEl.classList.add('active');
    }

    /* 2) 패널 전환 — panelId 로 직접 찾기 */
    const panel = document.getElementById(panelId);
    if (!panel) return;

    /* 형제 패널 모두 숨기기 (inline style 또는 .tab-panel 클래스 방식 모두 지원) */
    const siblings = panel.parentElement ? panel.parentElement.children : [];
    Array.from(siblings).forEach(el => {
      if (el.id && el.id !== panelId && (
        el.classList.contains('tab-panel') ||
        el.classList.contains('card-body') ||
        el.id.match(/tab[-_]/)
      )) {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    });

    /* 대상 패널 표시 */
    panel.style.display = '';
    panel.classList.add('active');
  };

  /* data-tab 속성 기반 이벤트 위임 (선택적 패턴) */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    switchTab(btn, btn.dataset.tab);
  });

  /* ──────────────────────────────────────────
     7. 사이드바 nav 클릭 위임
  ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-page]');
    if (!link) return;
    const page = link.dataset.page;
    if (page) goPage(page);
  });

  /* ──────────────────────────────────────────
     8. 대시보드 — KPI 카운터 애니메이션
  ────────────────────────────────────────── */
  function _initDashboard() {
    /* KPI 카드 숫자 카운트업 */
    _animateKpiCounters();

    /* 대시보드 새로고침 버튼 이벤트 */
    const refreshBtn = document.getElementById('dash-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        this.style.transform = 'rotate(360deg)';
        this.style.transition = 'transform .6s ease';
        setTimeout(() => { this.style.transform = ''; this.style.transition = ''; }, 700);
        /* 스파크라인 재초기화 */
        if (window.ARAM_CHARTS) ARAM_CHARTS.initCharts('dashboard');
        if (window.ARAM_UI) ARAM_UI.Toast.info('대시보드를 새로고침했습니다.', { duration: 2000 });
      });
    }

    /* 실시간 신규주문 알림 시뮬레이션 (30초 후 1회) */
    const dashTimer = setTimeout(() => {
      if (_currentPage === 'dashboard' && window.ARAM_UI) {
        ARAM_UI.Toast.info('신규 수주가 접수되었습니다 — (주)대한섬유 · ₩28,500,000', {
          title: '📋 신규 수주',
          duration: 5000,
        });
        /* 알림 배지 카운트 증가 */
        const badge = document.querySelector('.tb-badge');
        if (badge) badge.textContent = (parseInt(badge.textContent) || 0) + 1;
      }
    }, 30000);

    /* 페이지 이탈 시 타이머 정리 */
    const origGoPage = window.goPage;
    window.goPage = function (name) {
      if (name !== 'dashboard') clearTimeout(dashTimer);
      origGoPage(name);
    };
  }

  function _animateKpiCounters() {
    /* .stat-value 텍스트를 파싱해서 카운트업 */
    document.querySelectorAll('#page-dashboard .stat-card .stat-value').forEach(el => {
      const raw   = el.textContent.trim();
      /* 숫자 + 단위 분리: ₩1,234M, 98.7%, 1,234건 등 */
      const match = raw.match(/^([\₩]?)([\d,]+\.?\d*)(.*)$/);
      if (!match) return;

      const prefix = match[1];
      const numStr = match[2].replace(/,/g, '');
      const suffix = match[3];
      const target = parseFloat(numStr);
      if (isNaN(target)) return;

      const isFloat  = numStr.includes('.');
      const decimals = isFloat ? (numStr.split('.')[1] || '').length : 0;
      const duration = 900;
      const start    = performance.now();

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const current  = target * easeOut(progress);
        const formatted = isFloat
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString();
        el.textContent = prefix + formatted + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      el.textContent = prefix + (isFloat ? (0).toFixed(decimals) : '0') + suffix;
      requestAnimationFrame(tick);
    });
  }

  /* ──────────────────────────────────────────
     9. FabricHub 필터 / 선택
     pages.js 기준: .fabric-card[data-cat], #fh-detail-content
     onclick="filterFabric(this,'카테고리명')"  → (element, category)
  ────────────────────────────────────────── */
  function _initFabricHub() {
    /* 카테고리 필터 — pages.js: filterFabric(this, '면') 형식 */
    window.filterFabric = function (btnEl, cat) {
      /* 스타일 토글 (pages.js 인라인 span 이므로 직접 style 변경) */
      const grid = document.getElementById('fabric-grid');
      if (!grid) return;

      /* 같은 행 span 들의 스타일 초기화 */
      if (btnEl && btnEl.parentElement) {
        btnEl.parentElement.querySelectorAll('span[onclick]').forEach(s => {
          s.style.background = '#fff';
          s.style.color      = '#6b7a99';
          s.style.borderColor = '#e5e9f2';
        });
        btnEl.style.background  = '#4361ee';
        btnEl.style.color       = '#fff';
        btnEl.style.borderColor = '#4361ee';
      }

      /* 카드 필터링 */
      grid.querySelectorAll('.fabric-card').forEach(card => {
        const cardCat = card.dataset.cat || '';
        card.style.display = (cat === '전체' || cardCat === cat) ? '' : 'none';
      });
    };

    /* 상품 선택 */
    window.selectFabric = function (idx) {
      document.querySelectorAll('.fabric-card').forEach(el => el.classList.remove('selected'));
      const target = document.querySelector(`.fabric-card[data-idx="${idx}"]`);
      if (target) target.classList.add('selected');
      _updateFabricDetail(idx);
    };

    /* 상세 닫기 */
    window.closeFabricDetail = function () {
      document.querySelectorAll('.fabric-card').forEach(el => el.classList.remove('selected'));
      const content = document.getElementById('fh-detail-content');
      if (content) content.innerHTML = `
        <div style="height:160px;background:linear-gradient(135deg,#e8f4ee,#c8e4d0);border-radius:10px;margin-bottom:14px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#9ba8c0">상품을 선택하세요</div>
        <p style="color:#9ba8c0;font-size:13px;text-align:center;margin-top:20px">좌측 상품 카드를 클릭하면<br>상세 정보가 표시됩니다.</p>
      `;
    };
  }

  function _updateFabricDetail(idx) {
    const prods = (window.ARAM_DATA || {}).fabricProducts || [];
    const p = prods[idx];
    if (!p) return;
    const panel = document.getElementById('fh-detail-content');
    if (!panel) return;

    const specs = [
      ['소재', p.category || '원단'],
      ['단가', `${p.price}${p.unit}`],
      ['재고', p.stock],
      ['최소발주', '50m'],
      ['납기', '7~14일'],
      ['원산지', '대한민국'],
    ];
    const orderHistory = [
      {date:'2026-05-10',qty:'200m',status:'입고완료'},
      {date:'2026-04-22',qty:'500m',status:'입고완료'},
      {date:'2026-03-15',qty:'300m',status:'입고완료'},
    ];
    const reviews = [
      {name:'김민수 과장',rating:5,text:'품질이 우수합니다. 색상 재현도 매우 좋아요.',date:'05-15'},
      {name:'박지영 대리',rating:4,text:'납기가 빠르고 가격 대비 품질이 좋습니다.',date:'05-08'},
    ];

    panel.innerHTML = `
      <!-- 이미지 + 이름 -->
      <div style="background:${p.bg};height:160px;border-radius:10px;margin-bottom:14px;display:flex;align-items:center;justify-content:center;position:relative">
        <span style="font-size:48px;color:#fff;opacity:.5">◈</span>
        <span style="position:absolute;top:10px;right:10px" class="badge badge-${p.stockOk?'solid-green':'orange'}">${p.stockOk?'재고있음':'재고부족'}</span>
      </div>
      <div style="font-weight:700;font-size:16px;margin-bottom:2px;color:var(--txt)">${p.name}</div>
      <div style="color:#9ba8c0;font-size:13px;margin-bottom:10px">${p.vendor} · ${p.category}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px">
        <span style="color:#f59e0b;font-size:14px">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
        <span style="font-size:13px;font-weight:600">${p.rating}</span>
        <span style="font-size:12px;color:#9ba8c0">(${p.count}건 리뷰)</span>
        <span style="margin-left:auto;font-size:16px;font-weight:700;color:#4361ee">${p.price}<span style="font-size:12px;font-weight:400;color:#9ba8c0">${p.unit}</span></span>
      </div>

      <!-- 탭 -->
      <div style="display:flex;border-bottom:2px solid var(--bdr);margin-bottom:12px;gap:0">
        ${['상품정보','발주이력','리뷰'].map((t,i)=>`
        <button id="fhdt-btn-${i}" onclick="[0,1,2].forEach(j=>{document.getElementById('fhdt-btn-'+j).style.cssText='background:none;border:none;padding:8px 14px;font-size:13px;cursor:pointer;border-bottom:${i===0?'2':'0'}px solid var(--primary);color:${i===0?'var(--primary)':'var(--muted)'};font-weight:${i===0?'700':'400'}';document.getElementById('fhdt-panel-'+j).style.display='none'});this.style.cssText='background:none;border:none;padding:8px 14px;font-size:13px;cursor:pointer;border-bottom:2px solid var(--primary);color:var(--primary);font-weight:700';document.getElementById('fhdt-panel-${i}').style.display=''"
          style="background:none;border:none;padding:8px 14px;font-size:13px;cursor:pointer;border-bottom:${i===0?'2':'0'}px solid var(--primary,#4361ee);color:${i===0?'var(--primary,#4361ee)':'#9ba8c0'};font-weight:${i===0?'700':'400'}">${t}</button>`).join('')}
      </div>

      <!-- 상품정보 패널 -->
      <div id="fhdt-panel-0">
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
          ${specs.map(([l,v])=>`<tr style="border-bottom:1px solid var(--bdr)"><td style="padding:7px 0;color:#9ba8c0;width:70px">${l}</td><td style="padding:7px 0;font-weight:500">${v}</td></tr>`).join('')}
        </table>
        <div style="background:var(--bg);border-radius:8px;padding:10px;font-size:12.5px;color:var(--muted);margin-bottom:12px;line-height:1.6">
          고품질 ${p.category} 원단입니다. 색상 견뢰도 우수하며 생산 현장에서 검증된 소재입니다. 대량 주문 시 별도 협의 가능합니다.
        </div>
      </div>

      <!-- 발주이력 패널 -->
      <div id="fhdt-panel-1" style="display:none">
        <table style="width:100%;border-collapse:collapse;font-size:12.5px">
          <thead><tr style="background:var(--bg)">
            <th style="padding:7px 8px;text-align:left;color:#9ba8c0">발주일</th>
            <th style="padding:7px 8px;text-align:right;color:#9ba8c0">수량</th>
            <th style="padding:7px 8px;text-align:center;color:#9ba8c0">상태</th>
          </tr></thead>
          <tbody>
            ${orderHistory.map(o=>`
            <tr style="border-bottom:1px solid var(--bdr)">
              <td style="padding:7px 8px">2026-${o.date}</td>
              <td style="padding:7px 8px;text-align:right;font-weight:600">${o.qty}</td>
              <td style="padding:7px 8px;text-align:center"><span class="badge badge-solid-green">${o.status}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div style="margin-top:10px;font-size:12px;color:#9ba8c0">총 발주횟수: 3회 · 누적: 1,000m</div>
      </div>

      <!-- 리뷰 패널 -->
      <div id="fhdt-panel-2" style="display:none">
        ${reviews.map(r=>`
        <div style="padding:10px 0;border-bottom:1px solid var(--bdr)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px">${r.name[0]}</div>
            <span style="font-size:13px;font-weight:600">${r.name}</span>
            <span style="color:#f59e0b;font-size:12px">${'★'.repeat(r.rating)}</span>
            <span style="font-size:11.5px;color:#9ba8c0;margin-left:auto">05-${r.date}</span>
          </div>
          <div style="font-size:12.5px;color:var(--txt);line-height:1.5;padding-left:36px">${r.text}</div>
        </div>`).join('')}
        <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:10px"
          onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('리뷰 작성')">+ 리뷰 작성</button>
      </div>

      <!-- 액션 버튼 -->
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-secondary" style="flex:1"
          onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('샘플 요청이 등록되었습니다.')">🧵 샘플요청</button>
        <button class="btn btn-primary" style="flex:1"
          onclick="if(window.ARAM_UI)ARAM_UI.Toast.success('발주 요청이 등록되었습니다.')">📦 발주요청</button>
      </div>
      <button class="btn btn-secondary" style="width:100%;margin-top:6px"
        onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('견적서가 PDF로 생성됩니다.')">📄 견적서 PDF</button>
    `;
  }

  /* ──────────────────────────────────────────
     9. 주문관리 – 필터 / 검색
  ────────────────────────────────────────── */
  function _initSalesOrders() {
    window.filterOrders = function (status) {
      document.querySelectorAll('.orders-filter-btn').forEach(b => b.classList.remove('active'));
      const clicked = document.querySelector(`.orders-filter-btn[data-status="${status}"]`);
      if (clicked) clicked.classList.add('active');

      const rows = document.querySelectorAll('.orders-table tbody tr');
      rows.forEach(tr => {
        const badge = tr.querySelector('.badge');
        if (!badge) return;
        tr.style.display = (status === 'all' || badge.textContent.includes(status)) ? '' : 'none';
      });
    };
  }

  /* ──────────────────────────────────────────
     10. 시스템설정 – 사용자 토글
  ────────────────────────────────────────── */
  function _initSystemUsers() {
    window.toggleUserActive = function (toggle) {
      const isOn = toggle.checked;
      const row = toggle.closest('tr');
      if (row) {
        const badge = row.querySelector('.badge');
        if (badge) {
          badge.textContent = isOn ? '활성' : '비활성';
          badge.className = 'badge ' + (isOn ? 'badge-ok' : 'badge-err');
        }
      }
    };
  }

  /* ──────────────────────────────────────────
     11. 채팅 – 메시지 전송
     pages.js 기준: .chat-messages (피드), .chat-input-bar input (입력), .chat-send-btn (전송)
  ────────────────────────────────────────── */
  function _initChat() {
    /* 신규 ARAM_CHAT 시스템 우선 사용 */
    if (window._initChatEvents) {
      window._initChatEvents();
    } else {
      /* 폴백: 기존 단순 전송 기능 */
      const chatPage = document.getElementById('page-chat');
      if (!chatPage) return;
      const feed    = chatPage.querySelector('#chat-messages-area') || chatPage.querySelector('.chat-messages');
      const input   = chatPage.querySelector('.chat-input-bar input');
      const sendBtn = chatPage.querySelector('.chat-send-btn');
      if (feed) feed.scrollTop = feed.scrollHeight;
      function doSend() {
        if (!input || !input.value.trim() || !feed) return;
        const text = input.value.trim();
        const now  = new Date();
        const ts   = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        const me   = currentUser.name || '나';
        const row  = document.createElement('div');
        row.className = 'msg-row';
        row.innerHTML = `<div class="msg-avatar" style="background:linear-gradient(135deg,#4361ee,#8b5cf6)">${me[0]}</div>
          <div class="msg-content"><div class="msg-header"><span class="msg-name">${_escHtml(me)}</span><span class="msg-time">${ts}</span></div>
          <div class="msg-text" style="background:#eff2ff;border-radius:0 10px 10px 10px;padding:8px 12px;display:inline-block;max-width:80%">${_escHtml(text)}</div></div>`;
        feed.appendChild(row);
        feed.scrollTop = feed.scrollHeight;
        input.value = '';
        input.focus();
      }
      if (sendBtn) sendBtn.addEventListener('click', doSend);
      if (input) input.addEventListener('keydown', e => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();} });
    }
  }

  function _escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ──────────────────────────────────────────
     12. 로그아웃
  ────────────────────────────────────────── */
  window.logout = function () {
    if (window.ARAM_UI) {
      ARAM_UI.Modal.open({
        title: '로그아웃',
        body: '<p style="font-size:14px;color:#525f7f;line-height:1.7;text-align:center;padding:8px 0">정말 로그아웃 하시겠습니까?</p>',
        size: 'sm',
        footer: [
          { label: '취소', type: 'secondary', onClick: (close) => close() },
          { label: '로그아웃', type: 'danger', onClick: (close) => {
            close();
            sessionStorage.removeItem('aram_logged_in');
            sessionStorage.removeItem('aram_user');
            window.location.href = 'index.html';
          }},
        ],
      });
    } else {
      if (!confirm('로그아웃 하시겠습니까?')) return;
      sessionStorage.removeItem('aram_logged_in');
      sessionStorage.removeItem('aram_user');
      window.location.href = 'index.html';
    }
  };

  /* ──────────────────────────────────────────
     13-B. 다크모드 토글
  ────────────────────────────────────────── */
  function _applyTheme(dark) {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    const moon = document.getElementById('theme-icon-moon');
    const sun  = document.getElementById('theme-icon-sun');
    if (moon) moon.style.display = dark ? 'none' : '';
    if (sun)  sun.style.display  = dark ? '' : 'none';
  }

  window.toggleTheme = function () {
    const isDark = document.body.classList.contains('dark');
    _applyTheme(!isDark);
    try { localStorage.setItem('aram_theme', isDark ? 'light' : 'dark'); } catch(_) {}
    if (window.ARAM_UI) {
      ARAM_UI.Toast.info(isDark ? '☀️ 라이트 모드로 전환했습니다.' : '🌙 다크 모드로 전환했습니다.', { duration: 1800 });
    }
  };

  /* 저장된 테마 복원 */
  (function _restoreTheme() {
    try {
      const saved = localStorage.getItem('aram_theme');
      if (saved === 'dark') _applyTheme(true);
    } catch(_) {}
  })();

  /* ──────────────────────────────────────────
     13-A. 사원 프로필 모달
  ────────────────────────────────────────── */
  window.openEmpProfile = function (name, title, dept, joined, status) {
    if (!window.ARAM_UI) return;
    const colors = ['#4361ee','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6'];
    const avatarBg = colors[name.charCodeAt(0) % colors.length];
    const email = name.replace(/\s/g,'').toLowerCase() + '@aram.co.kr';
    const body = `
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px">
        <div style="width:64px;height:64px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:700;flex-shrink:0">${name[0]}</div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:#1a2035;margin-bottom:3px">${name}</div>
          <div style="font-size:13px;color:#9ba8c0;margin-bottom:10px">${title} &nbsp;|&nbsp; ${dept}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
            <div><span style="color:#9ba8c0;font-size:11.5px;display:block">입사일</span>${joined}</div>
            <div><span style="color:#9ba8c0;font-size:11.5px;display:block">재직상태</span>${status}</div>
            <div><span style="color:#9ba8c0;font-size:11.5px;display:block">이메일</span>${email}</div>
            <div><span style="color:#9ba8c0;font-size:11.5px;display:block">연락처</span>010-****-****</div>
          </div>
        </div>
      </div>
      <hr style="border:none;border-top:1px solid #f2f4f8;margin-bottom:14px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;margin-bottom:14px">
        ${[['이번달 출근','22일'],['휴가 잔여','8일'],['이번달 급여','₩3,850,000']].map(([l,v])=>`
        <div style="padding:10px 6px;background:#f8f9fc;border-radius:8px">
          <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:3px">${l}</div>
          <div style="font-size:15px;font-weight:700;color:#1a2035">${v}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('급여 상세는 급여현황 탭에서 확인하세요.')">급여 상세</button>
        <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('근태 기록은 근태관리 탭에서 확인하세요.')">근태 기록</button>
      </div>
    `;
    ARAM_UI.Modal.open({ title: name + ' — 사원 프로필', body, size: 'sm' });
  };

  /* ──────────────────────────────────────────
     13. 전체검색 — ARAM_UI.openSearch() 로 위임
     (app.html .tb-search onclick 에서 직접 호출,
      여기서는 Ctrl+K 단축키만 추가 보완)
  ────────────────────────────────────────── */
  /* 별도 단축키 없음 — ui.js init() 에서 Ctrl+K 처리 */

  /* ──────────────────────────────────────────
     14. 알림/도움말 — app.html onclick에서 직접 처리
     (이 섹션은 ui.js 로 완전 이관됨)
  ────────────────────────────────────────── */

  /* ──────────────────────────────────────────
     15. CSV 내보내기
     사용법: exportTableCSV('테이블명', tableElement 또는 null(자동탐색))
  ────────────────────────────────────────── */
  window.exportTableCSV = function (filename, tableEl) {
    /* tableEl 없으면 현재 활성 페이지 첫 번째 table */
    const tbl = tableEl || document.querySelector('.page.active table');
    if (!tbl) {
      if (window.ARAM_UI) ARAM_UI.Toast.warn('내보낼 테이블이 없습니다.');
      return;
    }
    const rows = Array.from(tbl.querySelectorAll('tr'));
    const csv  = rows.map(tr => {
      const cells = Array.from(tr.querySelectorAll('th,td'));
      return cells.map(td => {
        let text = td.innerText.replace(/\n/g,' ').trim();
        /* 체크박스 셀 스킵 */
        if (td.classList.contains('checkbox-cell')) return '';
        /* 쉼표/따옴표 이스케이프 */
        if (text.includes(',') || text.includes('"')) text = `"${text.replace(/"/g,'""')}"`;
        return text;
      }).join(',');
    }).join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    if (window.ARAM_UI) ARAM_UI.Toast.success(`${filename}.csv 파일을 다운로드했습니다.`);
  };

  /* ──────────────────────────────────────────
     16. 인쇄 기능
  ────────────────────────────────────────── */
  window.printPage = function (selector) {
    const target = selector ? document.querySelector(selector) : document.querySelector('.page.active');
    if (!target) return;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    printWin.document.write(`<!DOCTYPE html><html lang="ko"><head>
      <meta charset="UTF-8">
      <title>ARAM ERP — 인쇄</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Noto Sans KR',sans-serif;font-size:13px;color:#1a2035;padding:20mm}
        table{width:100%;border-collapse:collapse;margin-bottom:16px}
        th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px}
        th{background:#f8f9fc;font-weight:600}
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px}
        .badge-blue{background:#dbeafe;color:#1d4ed8}
        .badge-green{background:#dcfce7;color:#15803d}
        .badge-gray{background:#f1f5f9;color:#475569}
        .badge-orange{background:#fef3c7;color:#b45309}
        .no-print{display:none!important}
        .detail-header-card,.card{border:1px solid #e5e9f0;border-radius:8px;padding:16px;margin-bottom:12px}
        h2{font-size:18px;font-weight:700;margin-bottom:4px}
        .meta-field{display:inline-block;margin-right:24px;margin-bottom:8px;font-size:13px}
        .meta-field label{color:#9ba8c0;font-size:11.5px;display:block}
        @media print{body{padding:10mm}button,select,input{display:none!important}}
      </style>
    </head><body>
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #4361ee;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:#9ba8c0;letter-spacing:2px">ARAM INDUSTRY</div>
          <div style="font-size:18px;font-weight:700;color:#1a2035">(주)아람인더스트 통합포털 ERP</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#9ba8c0">
          인쇄일시: ${new Date().toLocaleString('ko-KR')}<br>
          출력자: ${currentUser.name || ''} (${currentUser.dept || ''})
        </div>
      </div>
      ${target.innerHTML}
    </body></html>`);
    printWin.document.close();
    printWin.onload = () => { printWin.print(); };

    if (window.ARAM_UI) ARAM_UI.Toast.info('인쇄 창을 열었습니다.', { duration: 2000 });
  };

  /* ──────────────────────────────────────────
     17. 알림 배지 카운트 동기화
  ────────────────────────────────────────── */
  function _syncNotiBadge() {
    const badge = document.querySelector('.tb-badge');
    if (!badge) return;
    /* ARAM_UI가 로드됐으면 실제 unread 수 반영, 아니면 기본값 유지 */
    if (window.ARAM_UI && ARAM_UI.getUnreadCount) {
      const cnt = ARAM_UI.getUnreadCount();
      badge.textContent = cnt > 0 ? cnt : '';
      badge.style.display = cnt > 0 ? '' : 'none';
    }
  }

  /* ──────────────────────────────────────────
     16. 구매관리 – 발주 상세 패널
  ────────────────────────────────────────── */
  window.openPODetail = function (idx) {
    const orders = (window.ARAM_DATA || {}).purchaseOrders || [];
    const o = orders[idx];
    const panel = document.getElementById('po-detail');
    if (!panel) return;

    /* 선택 행 하이라이트 */
    document.querySelectorAll('.purchase-layout tbody tr').forEach((r,i) => {
      r.style.background = i === idx ? 'var(--primary-lt)' : '';
    });

    /* 패널 표시 */
    panel.style.display = 'flex';

    if (!o) return;

    const statusColor = {'발주완료':'#4361ee','승인대기':'#f59e0b','입고대기':'#8b5cf6','입고완료':'#10b981'}[o.status]||'#9ba8c0';

    /* 기본정보 탭 */
    const tab0 = document.getElementById('po-dtab-0');
    if (tab0) tab0.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        ${[
          ['발주번호', o.no],
          ['협력업체', o.vendor],
          ['발주일', o.ordered],
          ['입고예정일', o.due],
          ['담당자', '김민수 과장'],
          ['상태', `<span style="font-weight:700;color:${statusColor}">${o.status}</span>`],
        ].map(([l,v])=>`
        <div style="padding:8px;background:#f8f9fc;border-radius:6px">
          <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:2px">${l}</div>
          <div style="font-size:13px;font-weight:500">${v}</div>
        </div>`).join('')}
      </div>
      <div style="padding:12px;border:1px solid #e5e9f2;border-radius:8px;margin-bottom:12px">
        <div style="font-size:12px;color:#9ba8c0;margin-bottom:8px;font-weight:600">협력업체 정보</div>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:8px;background:#e5e9f2;display:flex;align-items:center;justify-content:center;font-size:18px">🏢</div>
          <div>
            <div style="font-size:13.5px;font-weight:600">${o.vendor}</div>
            <div style="font-size:12px;color:#9ba8c0">담당자: 조한성 차장 | ☎ 010-1234-5678</div>
            <div style="font-size:12px;color:#9ba8c0">신용등급 A | 거래기간 3년</div>
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:12px;color:#9ba8c0;margin-bottom:6px;font-weight:600">금액 정보</div>
        ${[['발주수량', o.qty], ['단가', '₩' + o.price], ['합계금액', '₩' + o.total], ['부가세 (10%)', '₩' + (parseInt((o.total||'').replace(/[^0-9]/g,''))/10).toLocaleString()||'—']].map(([l,v])=>`
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f8f9fc;font-size:13px">
          <span style="color:#9ba8c0">${l}</span>
          <span style="font-weight:600">${v}</span>
        </div>`).join('')}
      </div>
    `;

    /* 품목명세 탭 */
    const tab1 = document.getElementById('po-dtab-1');
    if (tab1) tab1.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <thead><tr style="background:#f8f9fc">
          <th style="padding:7px 8px;text-align:left;color:#9ba8c0">No.</th>
          <th style="padding:7px 8px;text-align:left;color:#9ba8c0">품목명</th>
          <th style="padding:7px 8px;text-align:right;color:#9ba8c0">수량</th>
          <th style="padding:7px 8px;text-align:right;color:#9ba8c0">단가</th>
          <th style="padding:7px 8px;text-align:right;color:#9ba8c0">금액</th>
        </tr></thead>
        <tbody>
          ${[o.product || '원자재', '부자재 A', '부자재 B'].map((p,i)=>`
          <tr style="border-bottom:1px solid #f8f9fc">
            <td style="padding:7px 8px;color:#9ba8c0">${i+1}</td>
            <td style="padding:7px 8px;font-weight:500">${p}</td>
            <td style="padding:7px 8px;text-align:right">${o.qty||'—'}</td>
            <td style="padding:7px 8px;text-align:right;color:#9ba8c0">₩${o.price||'—'}</td>
            <td style="padding:7px 8px;text-align:right;font-weight:600">₩${i===0?o.total:'—'}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f8f9fc">
            <td colspan="4" style="padding:7px 8px;font-weight:700;text-align:right">합계</td>
            <td style="padding:7px 8px;text-align:right;font-weight:700;color:#4361ee">₩${o.total}</td>
          </tr>
        </tfoot>
      </table>
    `;

    /* 입고현황 탭 */
    const tab2 = document.getElementById('po-dtab-2');
    if (tab2) {
      const isReceived = o.status === '입고완료';
      tab2.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:12px;border-radius:8px;background:${isReceived?'#ecfdf5':'#fffbeb'};border:1px solid ${isReceived?'#a7f3d0':'#fde68a'}">
          <div style="font-size:13px;font-weight:600;color:${isReceived?'#059669':'#b45309'};margin-bottom:4px">${isReceived?'✅ 입고 완료':'⏳ 입고 대기 중'}</div>
          <div style="font-size:12.5px;color:${isReceived?'#065f46':'#92400e'}">예정일: ${o.due} · 발주수량: ${o.qty}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12.5px">
          <thead><tr style="background:#f8f9fc">
            <th style="padding:7px 8px;text-align:left;color:#9ba8c0">일자</th>
            <th style="padding:7px 8px;text-align:right;color:#9ba8c0">입고량</th>
            <th style="padding:7px 8px;text-align:center;color:#9ba8c0">상태</th>
            <th style="padding:7px 8px;text-align:left;color:#9ba8c0">담당자</th>
          </tr></thead>
          <tbody>
            ${isReceived ? `
            <tr style="border-bottom:1px solid #f8f9fc">
              <td style="padding:7px 8px">${o.due}</td>
              <td style="padding:7px 8px;text-align:right;font-weight:600">${o.qty}</td>
              <td style="padding:7px 8px;text-align:center"><span class="badge badge-solid-green">완료</span></td>
              <td style="padding:7px 8px">박서연 과장</td>
            </tr>` : `
            <tr><td colspan="4" style="padding:20px;text-align:center;color:#9ba8c0;font-size:13px">입고 내역이 없습니다.</td></tr>`}
          </tbody>
        </table>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('입고 확정이 완료되었습니다.')">입고 확정</button>
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('부분입고 기능은 준비 중입니다.')">부분입고</button>
        </div>
      </div>`;
    }

    /* 결재이력 탭 */
    const tab3 = document.getElementById('po-dtab-3');
    if (tab3) tab3.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {name:'김민수',role:'구매담당/과장',action:'상신',date:''+o.ordered+' 09:12',done:true,color:'#10b981'},
          {name:'이재훈',role:'구매팀장/팀장',action:'승인',date:''+o.ordered+' 11:45',done:true,color:'#10b981'},
          {name:'최용진',role:'구매본부장/부장',action:'최종승인',date:o.status!=='승인대기'?o.ordered+' 15:30':'대기 중',done:o.status!=='승인대기',color:o.status!=='승인대기'?'#10b981':'#9ba8c0'},
        ].map((a,i,arr)=>`
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
            <div style="width:36px;height:36px;border-radius:50%;background:${a.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600">${a.name[0]}</div>
            ${i<arr.length-1?'<div style="width:2px;height:20px;background:#e5e9f2;margin:4px 0"></div>':''}
          </div>
          <div style="flex:1;padding-top:6px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <span style="font-size:13.5px;font-weight:600">${a.name}</span>
                <span style="font-size:12px;color:#9ba8c0;margin-left:6px">${a.role}</span>
              </div>
              <span class="badge ${a.done?'badge-solid-green':'badge-gray'}">${a.action}</span>
            </div>
            <div style="font-size:12px;color:#9ba8c0;margin-top:2px">${a.date}</div>
          </div>
        </div>`).join('')}
      </div>
    `;
  };

  window.closePODetail = function () {
    const panel = document.getElementById('po-detail');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.purchase-layout tbody tr').forEach(r => r.style.background = '');
  };

  window.selectPO = function (poId) {
    document.querySelectorAll('.po-row').forEach(r => r.classList.remove('selected'));
    const row = document.querySelector(`.po-row[data-po="${poId}"]`);
    if (row) row.classList.add('selected');
  };

  /* ──────────────────────────────────────────
     15-A. HR 연차·원격근무 신청 모달
  ────────────────────────────────────────── */
  window._openLeaveModal = function (type) {
    if (!window.ARAM_UI) return;
    const isLeave  = type === '연차신청' || type === '반차신청';
    const isRemote = type === '원격근무신청';
    const isOT     = type === '초과근무신청';
    const typeLabel= {연차신청:'연차',반차신청:'반차',원격근무신청:'원격근무',초과근무신청:'초과근무'}[type] || type;

    const body = `
    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">신청 종류</label>
        <div style="font-size:15px;font-weight:700;color:#4361ee">${typeLabel}</div>
      </div>
      ${isLeave ? `
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">${type==='반차신청'?'반차 일자 및 구분':'연차 기간'}</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" class="form-input" value="2026-05-22" style="flex:1">
          ${type==='반차신청'?`<select class="form-select" style="width:100px"><option>오전반차</option><option>오후반차</option></select>`:
          `<span style="color:#9ba8c0">~</span><input type="date" class="form-input" value="2026-05-22" style="flex:1">`}
        </div>
      </div>` : ''}
      ${isRemote ? `
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">원격근무 일자</label>
        <input type="date" class="form-input" value="2026-05-22" style="width:100%">
      </div>
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">근무 장소</label>
        <select class="form-select" style="width:100%"><option>자택</option><option>공유오피스</option><option>기타</option></select>
      </div>` : ''}
      ${isOT ? `
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">초과근무 일자 및 시간</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" class="form-input" value="2026-05-20" style="flex:1">
          <input type="time" class="form-input" value="18:00" style="width:90px">
          <span style="color:#9ba8c0">~</span>
          <input type="time" class="form-input" value="21:00" style="width:90px">
        </div>
      </div>` : ''}
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">사유</label>
        <textarea class="form-input" rows="3" style="width:100%;resize:vertical" placeholder="신청 사유를 입력해주세요">${isOT?'납기 대응':''}${isRemote?'집중 업무 환경 필요':''}</textarea>
      </div>
      <div style="background:#f8f9fc;border-radius:8px;padding:10px;font-size:12.5px;color:#525f7f">
        <div style="font-weight:600;margin-bottom:4px">📋 결재 정보</div>
        <div>결재자: <strong>이준호 차장</strong> → 최종승인: <strong>정재훈 부장</strong></div>
        ${isLeave?`<div style="margin-top:4px;color:#4361ee">잔여 연차: <strong>12일</strong> (${type==='반차신청'?'반차 사용 시 0.5일 차감':'신청 시 차감'})</div>`:''}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" style="flex:1"
          onclick="if(window.ARAM_UI){ARAM_UI.Modal.close();ARAM_UI.Toast.success('${typeLabel} 신청이 등록되었습니다. 결재를 기다려 주세요.')}">
          신청하기
        </button>
        <button class="btn btn-secondary" onclick="if(window.ARAM_UI)ARAM_UI.Modal.close()">취소</button>
      </div>
    </div>`;

    ARAM_UI.Modal.open({ title: type, body, size: 'sm' });
  };

  /* ──────────────────────────────────────────
     14-B. 수주 → 생산 연동 모달 (작업지시 생성)
  ────────────────────────────────────────── */
  window._openProductionLinkModal = function (idx) {
    if (!window.ARAM_UI) return;
    const orders = (window.ARAM_DATA || {}).salesOrders || [];
    const o = orders[idx];
    if (!o) return;

    /* 작업지시번호 자동 채번 */
    const yr   = new Date().getFullYear();
    const seq  = String(235 + Math.floor(Math.random() * 20)).padStart(4, '0');
    const woNo = `WO-DTP-${yr}-${seq}`;

    const body = `
    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">
      <!-- 수주 정보 요약 -->
      <div style="background:var(--bg);border-radius:8px;padding:12px;border-left:3px solid #4361ee">
        <div style="font-size:11.5px;color:#9ba8c0;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">📋 연동 수주 정보</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
          <div><span style="color:#9ba8c0;font-size:11px;display:block">수주번호</span>
            <span style="font-family:monospace;font-size:12.5px;color:#4361ee;font-weight:600">${o.no}</span></div>
          <div><span style="color:#9ba8c0;font-size:11px;display:block">거래처</span>${o.client}</div>
          <div style="grid-column:span 2"><span style="color:#9ba8c0;font-size:11px;display:block">품목명</span>
            <span style="font-weight:500">${o.product}</span></div>
          <div><span style="color:#9ba8c0;font-size:11px;display:block">수량</span>${o.qty}</div>
          <div><span style="color:#9ba8c0;font-size:11px;display:block">납기일</span>
            <span style="color:#ef4444;font-weight:600">${o.due}</span></div>
        </div>
      </div>

      <!-- 생산부서 & 작업지시번호 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">생산부서 선택 <span style="color:#ef4444">*</span></label>
          <select class="form-select" id="pl-dept" style="width:100%">
            <option value="DTP">🖨 DTP팀 — 디지털 전사 인쇄</option>
            <option value="EMB">🧵 자수팀 — 자수 생산</option>
            <option value="QLT">🪡 퀄팅팀 — 퀄팅 생산</option>
          </select>
        </div>
        <div>
          <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">우선순위</label>
          <select class="form-select" id="pl-priority" style="width:100%">
            <option>⚪ 보통</option>
            <option>🔴 긴급</option>
            <option>🔵 낮음</option>
          </select>
        </div>
      </div>

      <!-- 작업지시번호 + 일정 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div>
          <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">작업지시번호 (자동)</label>
          <input class="form-input" value="${woNo}" readonly
            style="font-family:monospace;font-size:12px;color:#4361ee;background:var(--bg)">
        </div>
        <div>
          <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">작업 시작일</label>
          <input type="date" class="form-input" value="2026-05-21">
        </div>
        <div>
          <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">완료 목표일</label>
          <input type="date" class="form-input" value="${o.due}"
            style="color:#ef4444">
        </div>
      </div>

      <!-- 수량 -->
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">작업 수량</label>
        <input class="form-input" value="${o.qty}" style="width:100%">
      </div>

      <!-- 작업 메모 -->
      <div>
        <label style="font-size:12.5px;color:#9ba8c0;display:block;margin-bottom:6px">작업 메모 (선택)</label>
        <textarea class="form-input" rows="3" style="width:100%;resize:vertical"
          placeholder="특이사항, 주의사항 등을 입력하세요"></textarea>
      </div>

      <!-- 안내 -->
      <div style="background:var(--info-bg);border-radius:8px;padding:10px 12px;font-size:12.5px;color:#3b82f6;display:flex;align-items:center;gap:8px;border:1px solid var(--info-bdr)">
        <span style="font-size:16px">ℹ️</span>
        <span>작업지시가 생성되면 담당 부서에 자동 알림이 발송되고 수주 상태가 <strong>생산중</strong>으로 변경됩니다.</span>
      </div>

      <!-- 버튼 -->
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" style="flex:1"
          onclick="(function(){
            if(!window.ARAM_UI) return;
            ARAM_UI.Modal.close();
            setTimeout(function(){
              ARAM_UI.Toast.success('작업지시 ${woNo} 생성 완료! 담당자에게 알림을 발송했습니다.', {duration:4000});
            }, 200);
          })()">
          ✅ 작업지시 생성
        </button>
        <button class="btn btn-secondary"
          onclick="if(window.ARAM_UI) ARAM_UI.Modal.close()">취소</button>
      </div>
    </div>`;

    ARAM_UI.Modal.open({ title: '수주 → 생산 연동 · 작업지시 생성', body, size: 'md' });
  };

  /* ──────────────────────────────────────────
     14-C. 실시간 알림 시뮬레이터
  ────────────────────────────────────────── */
  function _startNotiSimulator() {
    const messages = [
      { icon:'📋', text:'신규 수주 ORD-2026-0893 가 접수되었습니다.' },
      { icon:'🏭', text:'WO-DTP-2026-0235 작업이 완료처리 되었습니다.' },
      { icon:'📦', text:'DMC 실 (Navy) 재고가 최저수준 이하입니다. 발주를 검토하세요.' },
      { icon:'💬', text:'DTP팀 채널에 새 메시지가 도착했습니다.' },
      { icon:'👥', text:'박서연님의 연차 신청이 승인되었습니다.' },
      { icon:'💰', text:'5월 세금계산서 발행 마감이 3일 남았습니다 (5/23).' },
      { icon:'🚚', text:'SO-2026-0090 납품이 완료되었습니다. 거래명세서를 확인하세요.' },
      { icon:'⚠️', text:'퀄팅 라인 #2 기계 점검이 예정되어 있습니다 (05/22 오전).' },
    ];

    function showNoti() {
      const n = messages[Math.floor(Math.random() * messages.length)];
      if (window.ARAM_UI && ARAM_UI.Toast) {
        ARAM_UI.Toast.info(`${n.icon} ${n.text}`, { duration: 5000 });
      }
      /* 배지 카운트 +1 */
      const badge = document.querySelector('.tb-badge');
      if (badge) {
        const cur = parseInt(badge.textContent || '0', 10);
        badge.textContent = cur + 1;
        badge.style.display = '';
        badge.style.animation = 'none';
        /* 펄스 애니메이션 재트리거 */
        requestAnimationFrame(() => { badge.style.animation = ''; });
      }
    }

    /* 50~90초 후 첫 알림, 이후 70~130초 간격 반복 */
    const firstDelay = 50000 + Math.random() * 40000;
    setTimeout(function tick() {
      showNoti();
      setTimeout(tick, 70000 + Math.random() * 60000);
    }, firstDelay);
  }

  /* ──────────────────────────────────────────
     15-B. 채팅 기능
  ────────────────────────────────────────── */
  const _CHAT_DATA = {
    channels: {
      'DTP팀':    [
        {name:'김민수 과장',  time:'09:01', text:'안녕하세요. WO-DTP-2026-0234 작업 진행 상황 공유드립니다.', reactions:['👍 3','❤️ 1']},
        {name:'박지영 대리',  time:'09:03', text:'디자인 시안 업로드합니다. 색상 및 패턴 확인 부탁드려요!', isImage:true},
        {name:'최서연 주임',  time:'09:05', text:'작업지시서 첨부드립니다.', isFile:true},
        {name:'윤태호 대리',  time:'09:07', text:'@김민수 과장 시안의 네이비 색상 톤을 더 진하게 수정 가능한지 확인 부탁드립니다.'},
        {name:'이상훈 과장',  time:'09:09', text:'수정 시안 오늘 오후 2시까지 공유하겠습니다.'},
        {name:'박지영 대리',  time:'09:10', text:'원단 발주 일정은 변동 없을까요?'},
        {name:'정재훈 부장',  time:'09:12', text:'일정 변동 없습니다. 진행 상황 계속 공유 부탁드립니다.', thread:'답글 3개'},
        {name:'김민수 과장',  time:'09:20', text:'네, 알겠습니다! 수정 후 다시 공유드릴게요.'},
      ],
      '전체공지': [
        {name:'정재훈 부장',  time:'08:00', text:'[공지] 5월 20일 전사 회의는 오후 3시 대회의실에서 진행됩니다.', reactions:['✅ 12']},
        {name:'이준호 차장',  time:'08:15', text:'[공지] 이번 주 금요일 야근 식대 신청 마감은 수요일 오전 11시입니다.'},
        {name:'인사팀',       time:'09:00', text:'[공지] 2026년 하반기 공채 일정이 확정되었습니다. 첨부 공고문을 확인해 주세요.', isFile:true},
      ],
      '영업1팀':  [
        {name:'한지민 사원',  time:'10:02', text:'이번 주 신규 수주 3건 추가로 등록했습니다. 확인 부탁드려요.'},
        {name:'김민재 차장',  time:'10:08', text:'잘 하셨어요! 계약서 검토 후 승인 처리하겠습니다.'},
        {name:'한지민 사원',  time:'10:11', text:'감사합니다. 추가 문의 사항 있으면 바로 말씀해주세요.'},
      ],
      '자수팀':   [
        {name:'이자수 사원',  time:'11:00', text:'WO-EMB-2026-0156 도안 승인 요청드립니다.'},
        {name:'박자수 과장',  time:'11:05', text:'확인했습니다. 오늘 오후 중으로 승인 처리할게요.'},
      ],
      '생산회의': [
        {name:'정재훈 부장',  time:'14:00', text:'오늘 회의 안건: 1) 5월 생산 실적 2) 6월 생산 계획 3) 불량률 개선 방안'},
        {name:'이자수 사원',  time:'14:02', text:'5월 불량률이 전월 대비 0.3% 개선되었습니다.', reactions:['👍 5']},
        {name:'박퀄팅 과장', time:'14:05', text:'퀄팅 라인은 기계 점검으로 인해 6월 초 1주일 가동 중단 예정입니다.'},
      ],
      '자재공유': [
        {name:'최영훈 대리',  time:'08:30', text:'DMC 실 재고 부족 공지: DMC-321 Navy Blue 재고 200m 남았습니다. 발주 필요합니다.'},
        {name:'재고팀',       time:'09:00', text:'긴급 발주 진행하겠습니다. 예상 입고일 5월 23일입니다.'},
      ],
    },
    dm: {
      '김민수 과장': [
        {name:'김민수 과장', time:'10:32', text:'안녕하세요! DTP 작업 관련해서 문의 있습니다.'},
        {name:'나',          time:'10:33', text:'네, 말씀하세요!'},
        {name:'김민수 과장', time:'10:34', text:'색상 승인 절차가 어떻게 되나요?'},
        {name:'나',          time:'10:35', text:'색상 지정 후 도안 승인 요청 메뉴에서 결재 올리시면 됩니다.'},
        {name:'김민수 과장', time:'10:36', text:'확인했습니다, 감사합니다!'},
      ],
      '박지영 대리': [
        {name:'박지영 대리', time:'09:58', text:'시안 파일 공유드립니다. 파일 확인 부탁드려요.', isFile:true},
      ],
      '최서연 주임': [
        {name:'최서연 주임', time:'어제 17:20', text:'오늘 작업지시서 처리 완료했습니다.'},
        {name:'나',          time:'어제 17:22', text:'수고하셨습니다!'},
        {name:'최서연 주임', time:'어제 17:23', text:'네, 알겠습니다!'},
      ],
      '이준호 차장': [
        {name:'이준호 차장', time:'어제 18:10', text:'오늘 퇴근 수고하셨습니다.'},
        {name:'나',          time:'어제 18:11', text:'고생 많으셨습니다.'},
      ],
    }
  };

  window.ARAM_CHAT = {
    currentChannel: 'DTP팀',
    currentType: 'channel',

    _renderMsgs(msgs, container) {
      const avatarColors = ['#4361ee','#10b981','#f59e0b','#8b5cf6','#ef4444','#14b8a6','#3b82f6'];
      const colorOf = name => avatarColors[name.charCodeAt(0) % avatarColors.length];
      container.innerHTML = msgs.map(m => `
        <div class="msg-row">
          <div class="msg-avatar" style="background:${m.name==='나'?'linear-gradient(135deg,#4361ee,#8b5cf6)':colorOf(m.name)}">${m.name[0]}</div>
          <div class="msg-content">
            <div class="msg-header">
              <span class="msg-name">${m.name}</span>
              <span class="msg-time">${m.time}</span>
            </div>
            <div class="msg-text" style="${m.name==='나'?'background:#eff2ff;border-radius:0 10px 10px 10px;padding:8px 12px;display:inline-block;max-width:80%;':''}">${m.text}</div>
            ${m.isImage?`<div class="msg-image" style="margin-top:6px">🎨 디자인시안.png · 1.2MB <span style="color:#4361ee;cursor:pointer;font-size:12px">미리보기</span></div>`:''}
            ${m.isFile?`<div class="msg-file" style="margin-top:6px"><div class="msg-file-icon">📄</div><div><div class="msg-file-name">첨부파일.pdf</div><div class="msg-file-size">542KB · 다운로드</div></div></div>`:''}
            ${m.reactions?`<div class="msg-reactions">${m.reactions.map(r=>`<div class="msg-reaction" style="cursor:pointer" onclick="this.style.background='#eff2ff'">${r}</div>`).join('')}</div>`:''}
            ${m.thread?`<div style="margin-top:4px;font-size:12.5px;color:#4361ee;cursor:pointer">💬 ${m.thread} › </div>`:''}
          </div>
        </div>`).join('');
      container.scrollTop = container.scrollHeight;
    },

    switchChannel(name, type) {
      this.currentChannel = name;
      this.currentType = type;

      /* 헤더 */
      const hdr = document.getElementById('chat-channel-header');
      if (hdr) hdr.innerHTML = `<span style="font-size:15px;color:#9ba8c0;margin-right:4px">${type==='channel'?'#':'🔵'}</span>
        <span style="font-size:15px;font-weight:700">${name}</span>`;

      /* 입력창 placeholder */
      const inp = document.querySelector('.chat-input-bar input');
      if (inp) inp.placeholder = `메시지 보내기 (${type==='channel'?'#':'@'}${name})`;

      /* 메시지 렌더 */
      const msgs = type === 'channel' ? _CHAT_DATA.channels[name] : _CHAT_DATA.dm[name];
      const container = document.getElementById('chat-messages-area');
      if (container && msgs) this._renderMsgs(msgs, container);

      /* 사이드바 active */
      document.querySelectorAll('.chat-channel, .chat-item').forEach(el => el.classList.remove('active'));
      const target = document.querySelector(`[data-chat-name="${name}"]`);
      if (target) target.classList.add('active');

      /* 읽지않음 뱃지 제거 */
      const badge = document.querySelector(`[data-chat-name="${name}"] .chat-channel-unread, [data-chat-name="${name}"] .chat-unread`);
      if (badge) badge.remove();

      /* 우측 패널 채널명 갱신 */
      const rHdr = document.getElementById('chat-info-ch-name');
      if (rHdr) rHdr.textContent = (type==='channel'?'# ':'')+name;
    },

    sendMessage() {
      const inp = document.querySelector('.chat-input-bar input');
      if (!inp || !inp.value.trim()) return;
      const text = inp.value.trim();
      inp.value = '';

      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
      const me = { name:'나', time:timeStr, text };

      const data = this.currentType === 'channel'
        ? _CHAT_DATA.channels[this.currentChannel]
        : _CHAT_DATA.dm[this.currentChannel];
      if (data) data.push(me);

      const container = document.getElementById('chat-messages-area');
      if (container) {
        this._renderMsgs(data, container);
        /* 자동 답장 (채널 전용) */
        if (this.currentType === 'channel') {
          setTimeout(() => {
            const responders = ['김민수 과장','박지영 대리','최서연 주임','이상훈 과장'];
            const rep = responders[Math.floor(Math.random()*responders.length)];
            const replies = ['확인했습니다! 👍','감사합니다.','알겠습니다, 진행하겠습니다.','좋아요!','빠른 공유 감사합니다.','체크해볼게요.'];
            data.push({name:rep, time:timeStr, text:replies[Math.floor(Math.random()*replies.length)]});
            this._renderMsgs(data, container);
          }, 1500);
        }
      }
      if (window.ARAM_UI) ARAM_UI.Toast.success('메시지를 전송했습니다.', {duration:1200});
    }
  };

  /* 채팅 페이지 렌더 후 이벤트 위임 */
  window._initChatEvents = function () {
    /* 채널 클릭 */
    document.querySelectorAll('[data-chat-name]').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.chatName;
        const type = el.dataset.chatType || 'channel';
        window.ARAM_CHAT.switchChannel(name, type);
      });
    });
    /* 전송 버튼 */
    const sendBtn = document.querySelector('.chat-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', () => window.ARAM_CHAT.sendMessage());
    /* Enter 키 */
    const inp = document.querySelector('.chat-input-bar input');
    if (inp) inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.ARAM_CHAT.sendMessage(); }
    });
    /* 기본 채널 로드 */
    window.ARAM_CHAT.switchChannel('DTP팀','channel');
  };

  /* ──────────────────────────────────────────
     16. 앱 부트스트랩
  ────────────────────────────────────────── */
  function boot() {
    applyUserInfo();

    /* ARAM_UI 초기화 (Ctrl+K 단축키 등록 등) */
    if (window.ARAM_UI && typeof ARAM_UI.init === 'function') {
      ARAM_UI.init();
    }

    /* 사이드바 툴팁 & 키보드 단축키 도움말 초기화 */
    _injectSidebarTooltips();
    _initShortcutsOverlay();

    /* 알림 배지 카운트 동기화 */
    _syncNotiBadge();

    /* 기본 페이지 = 대시보드 */
    goPage('dashboard');
    /* 대시보드 사이드바 링크 active */
    const dashLink = document.querySelector('[data-page="dashboard"]');
    if (dashLink) dashLink.classList.add('active');

    /* 실시간 알림 시뮬레이터 시작 */
    _startNotiSimulator();
  }

  /* DOM 준비 완료 후 부트 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
