/* ============================================================
   ARAM ERP — ui.js  v3.0
   공통 UI 컴포넌트: Toast · Modal · NotificationPanel · SearchOverlay · UserDropdown
============================================================ */

window.ARAM_UI = (function () {
  'use strict';

  /* ── HTML 이스케이프 ── */
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ══════════════════════════════════════════════════════
     1. TOAST
  ══════════════════════════════════════════════════════ */
  let _toastContainer = null;

  function _getToastContainer() {
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.id = 'toast-container';
      document.body.appendChild(_toastContainer);
    }
    return _toastContainer;
  }

  const TOAST_ICONS = { success:'✅', error:'❌', warn:'⚠️', info:'ℹ️' };

  /**
   * toast(message, options)
   * options: { type:'success'|'error'|'warn'|'info', title, duration:ms }
   */
  function toast(message, opts = {}) {
    const type     = opts.type     || 'info';
    const title    = opts.title    || { success:'완료', error:'오류', warn:'주의', info:'알림' }[type];
    const duration = opts.duration || 3500;

    const el = document.createElement('div');
    el.className = `toast type-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${TOAST_ICONS[type]}</div>
      <div class="toast-body">
        <div class="toast-title">${esc(title)}</div>
        <div class="toast-msg">${esc(message)}</div>
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
      <div class="toast-bar" style="animation-duration:${duration}ms"></div>
    `;
    _getToastContainer().appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('show'));
    });

    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 400);
    }, duration);

    return el;
  }

  /* 단축 함수 */
  const Toast = {
    success : (msg, opts) => toast(msg, { type:'success', ...opts }),
    error   : (msg, opts) => toast(msg, { type:'error',   ...opts }),
    warn    : (msg, opts) => toast(msg, { type:'warn',    ...opts }),
    info    : (msg, opts) => toast(msg, { type:'info',    ...opts }),
  };

  /* ══════════════════════════════════════════════════════
     2. MODAL
  ══════════════════════════════════════════════════════ */
  let _activeBd = null;

  /**
   * Modal.open({ title, body, size:'sm'|''|'lg', footer:[{label, type, onClick}] })
   * Returns { close }
   */
  function openModal({ title = '', body = '', size = '', footer = [], onClose } = {}) {
    /* 기존 모달 닫기 */
    if (_activeBd) _activeBd.remove();

    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';

    const footerHtml = footer.map((f, i) =>
      `<button class="btn ${f.type === 'primary' ? 'btn-primary' : f.type === 'danger' ? 'btn-danger' : 'btn-secondary'}" data-footer-idx="${i}">${esc(f.label)}</button>`
    ).join('');

    bd.innerHTML = `
      <div class="modal ${size ? 'modal-' + size : ''}">
        <div class="modal-header">
          <div class="modal-title">${esc(title)}</div>
          <button class="modal-close" data-close>✕</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer.length ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(bd);
    _activeBd = bd;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => bd.classList.add('show'));
    });

    /* 닫기 */
    function close() {
      bd.classList.remove('show');
      setTimeout(() => { bd.remove(); if (_activeBd === bd) _activeBd = null; }, 250);
      if (onClose) onClose();
    }

    bd.querySelector('[data-close]').addEventListener('click', close);
    bd.addEventListener('click', e => { if (e.target === bd) close(); });

    /* 푸터 버튼 바인딩 */
    footer.forEach((f, i) => {
      const btn = bd.querySelector(`[data-footer-idx="${i}"]`);
      if (btn && f.onClick) btn.addEventListener('click', () => f.onClick(close));
    });

    /* ESC 닫기 */
    const escHandler = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);

    return { close, bd };
  }

  const Modal = { open: openModal };

  /* ══════════════════════════════════════════════════════
     3. NOTIFICATION PANEL
  ══════════════════════════════════════════════════════ */
  const NOTIFICATIONS = [
    { id:1, type:'orange', icon:'⚠️', text:'<strong>원단 안전재고 미달</strong> — FAB-2403 TC 20수 그레이 (5,430/6,000 YD)', time:'5분 전',  unread:true,  page:'inventory' },
    { id:2, type:'blue',   icon:'📋', text:'<strong>신규 수주 접수</strong> — ORD-2026-0871 (주)대한섬유 · ₩38,000,000', time:'18분 전', unread:true,  page:'sales-orders' },
    { id:3, type:'green',  icon:'✅', text:'<strong>생산완료</strong> — WO-DTP-2026-0234 작업지시 완료 처리되었습니다.', time:'34분 전', unread:true,  page:'production-dtp' },
    { id:4, type:'purple', icon:'💰', text:'<strong>급여 승인 요청</strong> — 2026년 5월 급여대장 승인이 필요합니다.', time:'1시간 전', unread:false, page:'finance' },
    { id:5, type:'blue',   icon:'📦', text:'<strong>발주 입고</strong> — PO-2026-0229 코리아부자재 입고 확인 요청', time:'2시간 전', unread:false, page:'purchase' },
    { id:6, type:'red',    icon:'🚨', text:'<strong>품질 이슈</strong> — WO-QLT-2026-0089 불량률 2.1% 초과 감지', time:'3시간 전', unread:false, page:'production-qlt' },
    { id:7, type:'orange', icon:'📅', text:'<strong>납기 임박</strong> — ORD-2026-0867 (주)대한섬유 납기 D-3 남음', time:'4시간 전', unread:false, page:'sales-orders' },
    { id:8, type:'green',  icon:'🤝', text:'<strong>거래처 승인</strong> — 한일직물 신규 협력업체 등록 승인 완료', time:'어제',     unread:false, page:'purchase' },
  ];

  let _notiPanel = null;
  let _notiOpen  = false;

  function _buildNotiPanel() {
    const el = document.createElement('div');
    el.className = 'noti-panel';
    el.id = 'noti-panel';

    const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

    el.innerHTML = `
      <div class="noti-header">
        <span class="noti-header-title">알림 <span style="font-size:12px;background:#ef4444;color:#fff;border-radius:10px;padding:1px 7px;margin-left:4px">${unreadCount}</span></span>
        <div class="noti-header-actions">
          <button class="noti-mark-all" onclick="ARAM_UI.markAllRead()">모두 읽음</button>
          <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:14px" onclick="ARAM_UI.closeNoti()">✕</button>
        </div>
      </div>
      <div class="noti-tabs">
        <div class="noti-tab active" onclick="ARAM_UI.switchNotiTab(this,'all')">전체</div>
        <div class="noti-tab" onclick="ARAM_UI.switchNotiTab(this,'unread')">안읽음 (${unreadCount})</div>
        <div class="noti-tab" onclick="ARAM_UI.switchNotiTab(this,'system')">시스템</div>
      </div>
      <div class="noti-list" id="noti-list">
        ${NOTIFICATIONS.map(n => _notiItemHtml(n)).join('')}
      </div>
      <div class="noti-footer">
        <a onclick="ARAM_UI.closeNoti()">알림 설정</a>
        &nbsp;·&nbsp;
        <a onclick="ARAM_UI.closeNoti()">전체 알림 보기 →</a>
      </div>
    `;
    return el;
  }

  function _notiItemHtml(n) {
    return `
      <div class="noti-item ${n.unread ? 'unread' : ''}" data-noti-id="${n.id}" onclick="ARAM_UI.clickNoti(${n.id})">
        <div class="noti-icon ${n.type}">${n.icon}</div>
        <div class="noti-body">
          <div class="noti-text">${n.text}</div>
          <div class="noti-time">${n.time}</div>
        </div>
      </div>
    `;
  }

  function toggleNoti() {
    const btn = document.querySelector('.tb-icon-btn[title="알림"]');
    if (_notiOpen) {
      closeNoti();
    } else {
      if (!_notiPanel) {
        _notiPanel = _buildNotiPanel();
        document.body.appendChild(_notiPanel);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => _notiPanel.classList.add('show'));
      });
      _notiOpen = true;
      if (btn) btn.classList.add('active');

      /* 외부 클릭 닫기 */
      setTimeout(() => {
        document.addEventListener('click', _notiOutsideClick, { once: false });
      }, 0);
    }
  }

  function _notiOutsideClick(e) {
    if (_notiPanel && !_notiPanel.contains(e.target) &&
        !e.target.closest('.tb-icon-btn[title="알림"]')) {
      closeNoti();
      document.removeEventListener('click', _notiOutsideClick);
    }
  }

  function closeNoti() {
    if (_notiPanel) {
      _notiPanel.classList.remove('show');
    }
    const btn = document.querySelector('.tb-icon-btn[title="알림"]');
    if (btn) btn.classList.remove('active');
    _notiOpen = false;
  }

  function markAllRead() {
    NOTIFICATIONS.forEach(n => n.unread = false);
    document.querySelectorAll('.noti-item.unread').forEach(el => el.classList.remove('unread'));
    /* 배지 업데이트 */
    const badge = document.querySelector('.tb-badge');
    if (badge) badge.textContent = '0';
  }

  function clickNoti(id) {
    const n = NOTIFICATIONS.find(x => x.id === id);
    if (!n) return;
    n.unread = false;
    const el = document.querySelector(`[data-noti-id="${id}"]`);
    if (el) el.classList.remove('unread');
    closeNoti();
    if (n.page && window.goPage) window.goPage(n.page);
  }

  function switchNotiTab(tabEl, filter) {
    document.querySelectorAll('.noti-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');

    const list = document.getElementById('noti-list');
    if (!list) return;

    let items = NOTIFICATIONS;
    if (filter === 'unread') items = NOTIFICATIONS.filter(n => n.unread);
    list.innerHTML = items.length
      ? items.map(n => _notiItemHtml(n)).join('')
      : '<div style="padding:32px;text-align:center;color:#9ba8c0;font-size:13.5px">알림이 없습니다.</div>';
  }

  /* ══════════════════════════════════════════════════════
     4. GLOBAL SEARCH OVERLAY
  ══════════════════════════════════════════════════════ */
  const SEARCH_ITEMS = [
    /* 페이지 */
    { type:'page', icon:'📊', bg:'#eff2ff', name:'대시보드', sub:'메인 홈', page:'dashboard' },
    { type:'page', icon:'📋', bg:'#ecfdf5', name:'수주관리', sub:'영업/주문관리', page:'sales-orders' },
    { type:'page', icon:'🏭', bg:'#fff7ed', name:'DTP 생산', sub:'생산관리', page:'production-dtp' },
    { type:'page', icon:'🧵', bg:'#f5f3ff', name:'자수 생산', sub:'생산관리', page:'production-emb' },
    { type:'page', icon:'📦', bg:'#eff6ff', name:'재고현황', sub:'원단/재고관리', page:'inventory' },
    { type:'page', icon:'🌐', bg:'#ecfdf5', name:'FabricHub', sub:'상품관리', page:'fabricHub' },
    { type:'page', icon:'💰', bg:'#fdf4ff', name:'재무관리', sub:'경영', page:'finance' },
    { type:'page', icon:'👥', bg:'#fff7ed', name:'인사관리', sub:'경영', page:'hr' },
    { type:'page', icon:'🛒', bg:'#eff6ff', name:'구매관리', sub:'경영', page:'purchase' },
    { type:'page', icon:'💬', bg:'#ecfdf5', name:'사내커뮤니케이션', sub:'메신저', page:'chat' },
    { type:'page', icon:'⚙️', bg:'#f8f9fc', name:'시스템설정', sub:'관리', page:'system-users' },
    /* 주문 */
    { type:'order', icon:'📄', bg:'#eff2ff', name:'ORD-2026-0871', sub:'(주)대한섬유 · 진행중', page:'sales-order-detail' },
    { type:'order', icon:'📄', bg:'#eff2ff', name:'ORD-2026-0870', sub:'한슬패션 · 진행중', page:'sales-order-detail' },
    /* 거래처 */
    { type:'client', icon:'🏢', bg:'#fff7ed', name:'(주)대한섬유', sub:'거래처 · 서울', page:'sales-orders' },
    { type:'client', icon:'🏢', bg:'#fff7ed', name:'한슬패션', sub:'거래처 · 경기', page:'sales-orders' },
    { type:'client', icon:'🏢', bg:'#fff7ed', name:'인디고텍스', sub:'거래처 · 부산', page:'sales-orders' },
  ];

  let _searchEl = null;
  let _searchOpen = false;
  let _focusIdx = -1;

  function openSearch() {
    if (_searchEl) { _searchEl.remove(); _searchEl = null; }

    const el = document.createElement('div');
    el.className = 'search-overlay';
    el.innerHTML = `
      <div class="search-box">
        <div class="search-input-row">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input id="search-main-input" placeholder="메뉴, 주문번호, 거래처 검색…" autocomplete="off">
          <span class="search-kbd">ESC</span>
        </div>
        <div class="search-results" id="search-results">
          ${_renderSearchResults('')}
        </div>
        <div class="search-footer">
          <span class="search-footer-hint"><kbd>↑↓</kbd> 이동</span>
          <span class="search-footer-hint"><kbd>Enter</kbd> 이동</span>
          <span class="search-footer-hint"><kbd>ESC</kbd> 닫기</span>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    _searchEl = el;
    _searchOpen = true;
    _focusIdx = -1;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('show'));
    });

    const input = el.querySelector('#search-main-input');
    setTimeout(() => input && input.focus(), 50);

    input && input.addEventListener('input', e => {
      _focusIdx = -1;
      const results = el.querySelector('#search-results');
      if (results) results.innerHTML = _renderSearchResults(e.target.value);
    });

    /* 키보드 네비게이션 */
    input && input.addEventListener('keydown', e => {
      const items = el.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _focusIdx = Math.min(_focusIdx + 1, items.length - 1);
        _updateFocused(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _focusIdx = Math.max(_focusIdx - 1, 0);
        _updateFocused(items);
      } else if (e.key === 'Enter') {
        const focused = el.querySelector('.search-result-item.focused');
        if (focused) focused.click();
        else if (items[0]) items[0].click();
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    el.addEventListener('click', e => { if (e.target === el) closeSearch(); });
  }

  function _updateFocused(items) {
    items.forEach((it, i) => {
      it.classList.toggle('focused', i === _focusIdx);
    });
  }

  function _renderSearchResults(q) {
    const query = q.trim().toLowerCase();

    if (!query) {
      /* 빠른 메뉴 */
      const pages = SEARCH_ITEMS.filter(i => i.type === 'page').slice(0, 6);
      return `
        <div class="search-section-label">빠른 이동</div>
        ${pages.map(p => _searchItemHtml(p)).join('')}
      `;
    }

    const matched = SEARCH_ITEMS.filter(i =>
      i.name.toLowerCase().includes(query) || i.sub.toLowerCase().includes(query)
    );

    if (!matched.length) {
      return `<div style="padding:32px;text-align:center;color:#9ba8c0;font-size:13.5px">
        "<strong style="color:#1a2035">${esc(q)}</strong>" 에 대한 결과가 없습니다.
      </div>`;
    }

    const groups = { page:'메뉴', order:'수주/주문', client:'거래처', '':'기타' };
    const byType = {};
    matched.forEach(i => { (byType[i.type] = byType[i.type] || []).push(i); });

    return Object.entries(byType).map(([type, items]) =>
      `<div class="search-section-label">${groups[type] || type}</div>` +
      items.map(i => _searchItemHtml(i, query)).join('')
    ).join('');
  }

  function _searchItemHtml(item, q = '') {
    let name = esc(item.name);
    if (q) {
      const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      name = name.replace(re, '<mark style="background:#fffbe6;border-radius:2px">$1</mark>');
    }
    return `
      <div class="search-result-item" onclick="ARAM_UI.searchGo('${item.page}')">
        <div class="search-result-icon" style="background:${item.bg}">${item.icon}</div>
        <div>
          <div class="search-result-name">${name}</div>
          <div class="search-result-sub">${esc(item.sub)}</div>
        </div>
        <div class="search-result-badge">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14" style="color:#d1d5db"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
    `;
  }

  function searchGo(page) {
    closeSearch();
    if (page && window.goPage) window.goPage(page);
  }

  function closeSearch() {
    if (!_searchEl) return;
    _searchEl.classList.remove('show');
    setTimeout(() => { if (_searchEl) { _searchEl.remove(); _searchEl = null; } }, 250);
    _searchOpen = false;
  }

  /* ══════════════════════════════════════════════════════
     5. USER DROPDOWN
  ══════════════════════════════════════════════════════ */
  let _userDd = null;
  let _userDdOpen = false;

  function toggleUserDropdown() {
    if (_userDdOpen) {
      closeUserDropdown();
    } else {
      const user = _getSessionUser();
      if (!_userDd) {
        _userDd = document.createElement('div');
        _userDd.className = 'user-dropdown';
        _userDd.innerHTML = `
          <div class="user-dd-header">
            <div class="user-dd-name">${esc(user.name)} ${esc(user.role)}</div>
            <div class="user-dd-info">${esc(user.dept)} · ${esc(user.email || '')}</div>
          </div>
          <div class="user-dd-item" onclick="ARAM_UI.closeUserDropdown()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            내 프로필
          </div>
          <div class="user-dd-item" onclick="ARAM_UI.closeUserDropdown()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41"/></svg>
            환경설정
          </div>
          <div class="user-dd-item" onclick="ARAM_UI.closeUserDropdown();window.goPage('system-users')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            시스템설정
          </div>
          <div class="user-dd-divider"></div>
          <div class="user-dd-item danger" onclick="logout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            로그아웃
          </div>
        `;
        document.body.appendChild(_userDd);
      }

      /* 위치: 우상단 */
      const tbUser = document.querySelector('.tb-user');
      if (tbUser) {
        const r = tbUser.getBoundingClientRect();
        _userDd.style.right = (window.innerWidth - r.right) + 'px';
        _userDd.style.top   = (r.bottom + 6) + 'px';
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => _userDd.classList.add('show'));
      });
      _userDdOpen = true;

      setTimeout(() => {
        document.addEventListener('click', _ddOutsideClick);
      }, 0);
    }
  }

  function _ddOutsideClick(e) {
    if (_userDd && !_userDd.contains(e.target) && !e.target.closest('.tb-user')) {
      closeUserDropdown();
      document.removeEventListener('click', _ddOutsideClick);
    }
  }

  function closeUserDropdown() {
    if (_userDd) _userDd.classList.remove('show');
    _userDdOpen = false;
  }

  function _getSessionUser() {
    try { return JSON.parse(sessionStorage.getItem('aram_user') || '{}'); } catch { return {}; }
  }

  /* ══════════════════════════════════════════════════════
     6. 수주 신규 등록 모달
  ══════════════════════════════════════════════════════ */
  function openNewOrderModal() {
    const today = new Date().toISOString().slice(0, 10);
    openModal({
      title: '신규 수주 등록',
      size: 'lg',
      body: `
        <div class="form-section">
          <div class="form-section-title">거래처 정보</div>
          <div class="form-grid">
            <div class="form-field">
              <label>거래처명 <span style="color:#ef4444">*</span></label>
              <input class="form-input" id="ord-client" placeholder="거래처명 검색 또는 입력">
            </div>
            <div class="form-field">
              <label>담당자</label>
              <select class="form-select" id="ord-mgr">
                <option>김영업</option><option>이수진</option><option>박민재</option><option>최유정</option>
              </select>
            </div>
            <div class="form-field">
              <label>납기일 <span style="color:#ef4444">*</span></label>
              <input class="form-input" type="date" id="ord-due" value="${today}">
            </div>
            <div class="form-field">
              <label>결제조건</label>
              <select class="form-select" id="ord-pay">
                <option>30일 후</option><option>60일 후</option><option>즉시</option><option>기타</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">품목 정보</div>
          <div class="form-grid">
            <div class="form-field">
              <label>품목명 <span style="color:#ef4444">*</span></label>
              <input class="form-input" id="ord-product" placeholder="품목명 입력">
            </div>
            <div class="form-field">
              <label>규격</label>
              <input class="form-input" id="ord-spec" placeholder="예: 30수 면 트윌">
            </div>
            <div class="form-field">
              <label>수량 <span style="color:#ef4444">*</span></label>
              <input class="form-input" id="ord-qty" placeholder="예: 10,000 m">
            </div>
            <div class="form-field">
              <label>단가 (원)</label>
              <input class="form-input" id="ord-price" type="number" placeholder="0">
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">추가 정보</div>
          <div class="form-grid">
            <div class="form-field">
              <label>우선순위</label>
              <select class="form-select"><option>보통</option><option>높음</option><option>긴급</option></select>
            </div>
            <div class="form-field">
              <label>배송방법</label>
              <select class="form-select"><option>일반 배송</option><option>퀵서비스</option><option>고객 직접 수령</option></select>
            </div>
            <div class="form-field full">
              <label>비고</label>
              <textarea class="form-input" placeholder="특이사항 입력"></textarea>
            </div>
          </div>
        </div>
      `,
      footer: [
        { label: '취소', type: 'secondary', onClick: (close) => close() },
        { label: '임시저장', type: 'secondary', onClick: (close) => {
          Toast.info('임시 저장되었습니다.');
        }},
        { label: '수주 등록', type: 'primary', onClick: (close) => {
          const client  = document.getElementById('ord-client')?.value.trim();
          const product = document.getElementById('ord-product')?.value.trim();
          const qty     = document.getElementById('ord-qty')?.value.trim();
          if (!client || !product || !qty) {
            Toast.error('필수 항목을 모두 입력해주세요.');
            return;
          }
          close();
          Toast.success(`수주가 등록되었습니다. (${client} — ${product})`);
        }},
      ],
    });
  }

  /* ══════════════════════════════════════════════════════
     7. 구매요청 모달
  ══════════════════════════════════════════════════════ */
  function openNewPurchaseModal() {
    const today = new Date().toISOString().slice(0, 10);
    openModal({
      title: '구매요청 등록',
      size: 'lg',
      body: `
        <div class="form-section">
          <div class="form-section-title">협력업체</div>
          <div class="form-grid">
            <div class="form-field">
              <label>협력업체명 <span style="color:#ef4444">*</span></label>
              <select class="form-select">
                <option>선택</option><option>(하)동방자재</option><option>한일직물</option><option>코리아부자재</option>
              </select>
            </div>
            <div class="form-field">
              <label>담당자</label>
              <input class="form-input" placeholder="담당자명">
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">품목</div>
          <div class="form-grid">
            <div class="form-field">
              <label>품목명 <span style="color:#ef4444">*</span></label>
              <input class="form-input" placeholder="품목명">
            </div>
            <div class="form-field">
              <label>수량</label>
              <input class="form-input" placeholder="예: 1,000 YD">
            </div>
            <div class="form-field">
              <label>단가 (원)</label>
              <input class="form-input" type="number" placeholder="0">
            </div>
            <div class="form-field">
              <label>입고 희망일</label>
              <input class="form-input" type="date" value="${today}">
            </div>
            <div class="form-field full">
              <label>비고</label>
              <textarea class="form-input" placeholder="요청사항"></textarea>
            </div>
          </div>
        </div>
      `,
      footer: [
        { label: '취소', type: 'secondary', onClick: (close) => close() },
        { label: '구매요청', type: 'primary', onClick: (close) => {
          close();
          Toast.success('구매요청이 등록되었습니다.');
        }},
      ],
    });
  }

  /* ══════════════════════════════════════════════════════
     8. 키보드 단축키
  ══════════════════════════════════════════════════════ */
  function _initKeyboard() {
    document.addEventListener('keydown', e => {
      /* Ctrl/Cmd + K = 검색 */
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        _searchOpen ? closeSearch() : openSearch();
      }
      /* Escape = 검색/모달/알림 닫기 */
      if (e.key === 'Escape') {
        closeSearch();
        closeNoti();
        closeUserDropdown();
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════ */
  function init() {
    _initKeyboard();
  }

  return {
    /* Toast */
    toast, Toast,
    /* Modal */
    Modal, openModal,
    /* Notification */
    toggleNoti, closeNoti, markAllRead, clickNoti, switchNotiTab,
    getUnreadCount: () => NOTIFICATIONS.filter(n => n.unread).length,
    /* Search */
    openSearch, closeSearch, searchGo,
    /* User Dropdown */
    toggleUserDropdown, closeUserDropdown,
    /* 모달 단축 */
    openNewOrderModal, openNewPurchaseModal,
    /* Init */
    init,
  };

})();
