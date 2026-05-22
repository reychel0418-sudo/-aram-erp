/* ═══════════════════════════════════════════════
   ARAM ERP — Page HTML Renderer v3.0
   각 페이지의 HTML을 동적으로 생성합니다
   ═══════════════════════════════════════════════ */

window.ARAM_PAGES = {

  /* ══════════════════════════════════
     대시보드
  ══════════════════════════════════ */
  dashboard() {
    const d = window.ARAM_DATA;
    const user = d.getUser();
    const _d0 = new Date();
    const _yyyy = _d0.getFullYear();
    const _mm = String(_d0.getMonth()+1).padStart(2,'0');
    const _dd = String(_d0.getDate()).padStart(2,'0');
    const _days = ['일','월','화','수','목','금','토'];
    const today = `${_yyyy}.${_mm}.${_dd} (${_days[_d0.getDay()]})`;
    const kpis = d.dashboard.kpis;
    const notices = d.dashboard.notices;
    const orders = d.dashboard.recentOrders;

    const statusBadge = s => ({
      '대기':'badge badge-gray','진행중':'badge badge-blue','완료':'badge badge-green'
    })[s] || 'badge badge-gray';

    return `
    <div class="page-header">
      <div class="page-header-row">
        <div>
          <div class="page-title">안녕하세요, ${user.name}님</div>
          <div class="page-desc">오늘도 아람인더스트의 성장을 함께 만들어가요.</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="page-date">오늘 날짜 ${today}</div>
          <button id="dash-refresh" class="btn btn-secondary btn-sm" style="width:32px;height:32px;padding:0;display:flex;align-items:center;justify-content:center" title="새로고침">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="15" height="15"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="stat-grid">
      ${kpis.map((k,i)=>{
        const pages=['finance','sales-orders','production-dtp','inventory'];
        const tips=['재무관리','수주관리','생산관리','재고관리'];
        return `
      <div class="stat-card" style="cursor:pointer;position:relative;transition:box-shadow .15s,transform .15s"
        onclick="goPage('${pages[i]}')"
        onmouseover="this.style.boxShadow='0 6px 24px rgba(67,97,238,.18)';this.style.transform='translateY(-2px)'"
        onmouseout="this.style.boxShadow='';this.style.transform=''"
        title="${tips[i]} 페이지로 이동">
        <div style="position:absolute;top:10px;right:10px;opacity:0;transition:opacity .15s" class="stat-arrow">
          <svg fill="none" stroke="#4361ee" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="stat-label">${k.label}
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
        <div class="stat-value">${k.value}</div>
        <div class="stat-change up">▲ ${k.change} <span style="color:#9ba8c0;font-weight:400">(${k.unit})</span></div>
        <canvas id="spark-${i}" class="stat-sparkline" height="40"></canvas>
      </div>`;
      }).join('')}
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 300px 280px;gap:16px;margin-bottom:16px">
      <!-- Monthly Sales -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">월별 매출 추이</span>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;color:#9ba8c0">(단위: 백만원)</span>
            <select class="form-select" style="height:28px;font-size:12px;padding:0 8px">
              <option>최근 12개월</option><option>최근 6개월</option>
            </select>
          </div>
        </div>
        <div class="card-body" style="padding:16px 20px">
          <div class="chart-container" style="height:200px">
            <canvas id="chart-monthly-sales"></canvas>
          </div>
        </div>
      </div>
      <!-- Category Donut -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">카테고리별 생산량</span>
          <span style="font-size:12px;color:#9ba8c0">(단위: %)</span>
        </div>
        <div class="card-body" style="padding:16px">
          <div class="chart-container" style="height:200px;position:relative">
            <canvas id="chart-category-donut"></canvas>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none">
              <div style="font-size:11px;color:#9ba8c0">총 생산량</div>
              <div style="font-size:15px;font-weight:700;color:#1a2035">18,520건</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
            ${['DTP','원단','퀄팅','자수'].map((l,i)=>{
              const cs=['#4361ee','#14b8a6','#8b5cf6','#f59e0b'];
              const vs=[38.6,26.4,19.7,15.3];
              return `<div style="display:flex;align-items:center;gap:8px;font-size:12px">
                <span style="width:10px;height:10px;border-radius:50%;background:${cs[i]};flex-shrink:0"></span>
                <span style="flex:1;color:#6b7a99">${l}</span>
                <span style="font-weight:600;color:#1a2035">${vs[i]}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <!-- Notices + Quick Menu -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card" style="flex:1">
          <div class="card-header">
            <span class="card-title">공지사항</span>
            <a style="font-size:12.5px;color:#4361ee;cursor:pointer">더보기 ›</a>
          </div>
          <div class="card-body" style="padding:12px 16px">
            <div class="notice-list">
              ${notices.map(n=>`
              <div class="notice-item">
                <span class="notice-dot${n.type==='red'?' red':''}"></span>
                <span class="notice-text">${n.text}</span>
                <span class="notice-date">${n.date}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">빠른메뉴</span></div>
          <div class="card-body" style="padding:12px">
            <div class="quick-menu">
              ${[
                {icon:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',label:'주문등록',page:'sales-orders'},
                {icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',label:'생산지시',page:'production-dtp'},
                {icon:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8"/>',label:'재고현황',page:'inventory'},
                {icon:'<path d="M5 12h14M12 5l7 7-7 7"/>',label:'출고물류',page:'purchase'},
                {icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',label:'매출현황',page:'finance'},
                {icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>',label:'거래처관리',page:'purchase'},
              ].map(q=>`
              <div class="qm-item" onclick="goPage('${q.page}')">
                <div class="qm-icon"><svg fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">${q.icon}</svg></div>
                <span class="qm-label">${q.label}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card mb-16">
      <div class="card-header">
        <span class="card-title">최근 주문 현황</span>
        <a class="btn btn-secondary btn-sm" style="font-size:12px" onclick="goPage('sales-orders')">더보기 ›</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>주문번호</th><th>거래처</th><th>상품명</th><th>수량</th><th>납기일</th><th style="text-align:center">상태</th>
          </tr></thead>
          <tbody>
            ${orders.map(o=>`
            <tr onclick="goPage('sales-order-detail')" style="cursor:pointer">
              <td class="td-link">${o.no}</td>
              <td>${o.client}</td>
              <td>${o.product}</td>
              <td>${o.qty}</td>
              <td>${o.due}</td>
              <td class="td-center"><span class="${statusBadge(o.status)}">${o.status}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Row: 이번주 일정 캘린더 + 최근 활동 피드 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

      <!-- 이번주 업무 캘린더 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📅 이번주 주요 일정</span>
          <span style="font-size:12px;color:#9ba8c0">2026년 5월 셋째 주</span>
        </div>
        <div class="card-body" style="padding:0">
          ${[
            {day:'월 (19)', events:[{type:'수주','color':'#4361ee',text:'SO-2026-0091 납기일'},]},
            {day:'화 (20)', events:[{type:'생산',color:'#10b981',text:'WO-DTP-0234 완료예정'},{type:'품질',color:'#8b5cf6',text:'EMB 라인 품질검사'}]},
            {day:'수 (21)', events:[{type:'회의',color:'#f59e0b',text:'전사 경영회의 15:00'}]},
            {day:'목 (22)', events:[{type:'납품',color:'#4361ee',text:'삼성물산 납품 예정'},{type:'발주',color:'#ef4444',text:'DMC 실 긴급 발주'}]},
            {day:'금 (23)', events:[{type:'수주',color:'#4361ee',text:'SO-2026-0089 납기일'},{type:'급여',color:'#14b8a6',text:'5월 급여 지급'}]},
          ].map((d,i)=>`
          <div style="display:flex;gap:0;border-bottom:1px solid var(--bdr);${i===1?'background:var(--primary-lt)':''}">
            <div style="width:64px;padding:10px 12px;font-size:12px;font-weight:${i===1?'700':'500'};color:${i===1?'var(--primary)':'var(--muted)'};border-right:1px solid var(--bdr);flex-shrink:0;display:flex;align-items:flex-start">
              ${d.day}${i===1?'<span style="margin-left:4px;font-size:9px;background:var(--primary);color:#fff;border-radius:4px;padding:1px 4px">오늘</span>':''}
            </div>
            <div style="flex:1;padding:8px 12px;display:flex;flex-direction:column;gap:4px">
              ${d.events.map(e=>`
              <div style="display:flex;align-items:center;gap:6px">
                <div style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0"></div>
                <span style="font-size:12.5px;color:var(--txt)">${e.text}</span>
                <span style="margin-left:auto;font-size:10.5px;background:${e.color}18;color:${e.color};padding:1px 6px;border-radius:10px;white-space:nowrap">${e.type}</span>
              </div>`).join('')}
            </div>
          </div>`).join('')}
          <div style="padding:10px 16px;text-align:right">
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('캘린더 전체보기')">캘린더 전체 ›</button>
          </div>
        </div>
      </div>

      <!-- 최근 활동 피드 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📋 최근 활동</span>
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('전체 활동 내역 보기')">전체보기</button>
        </div>
        <div class="card-body" style="padding:6px 0;max-height:340px;overflow-y:auto">
          ${[
            {user:'김민수 과장',action:'수주 등록',target:'SO-2026-0091',time:'방금 전',icon:'📝',color:'#4361ee'},
            {user:'박지영 대리',action:'파일 업로드',target:'디자인시안_0234.ai',time:'5분 전',icon:'📎',color:'#8b5cf6'},
            {user:'이자수 사원',action:'작업지시 상태 변경',target:'WO-EMB-0156 → 도안승인대기',time:'12분 전',icon:'🔄',color:'#f59e0b'},
            {user:'최영훈 대리',action:'재고 입고 처리',target:'DMC-321 Navy 500m',time:'28분 전',icon:'📦',color:'#10b981'},
            {user:'정유진 대리',action:'세금계산서 발행',target:'삼성물산 ₩48,000,000',time:'1시간 전',icon:'🧾',color:'#14b8a6'},
            {user:'한지민 사원',action:'견적서 발송',target:'QT-2026-0124 → 롯데쇼핑',time:'2시간 전',icon:'📤',color:'#4361ee'},
            {user:'이준호 차장',action:'시스템 로그인',target:'관리자 계정',time:'3시간 전',icon:'🔐',color:'#9ba8c0'},
            {user:'박자수 과장',action:'품질검사 완료',target:'WO-EMB-0155 합격',time:'3시간 전',icon:'✅',color:'#10b981'},
            {user:'김퀄팅 사원',action:'발주요청 등록',target:'PO-2026-0052',time:'4시간 전',icon:'🛒',color:'#8b5cf6'},
            {user:'강태민 사원',action:'DTP 작업 완료',target:'WO-DTP-0232',time:'어제 17:30',icon:'🖨',color:'#4361ee'},
          ].map(a=>`
          <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 16px;border-bottom:1px solid var(--bdr)">
            <div style="width:34px;height:34px;border-radius:50%;background:${a.color}18;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${a.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
                <span style="font-size:13px;font-weight:600;color:var(--txt)">${a.user}</span>
                <span style="font-size:12.5px;color:var(--muted)">${a.action}</span>
              </div>
              <div style="font-size:12px;color:${a.color};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.target}</div>
            </div>
            <div style="font-size:11.5px;color:#9ba8c0;white-space:nowrap;flex-shrink:0">${a.time}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- 페이지 푸터 -->
    <div style="margin-top:24px;padding:16px 0 8px;border-top:1px solid var(--bdr);text-align:center">
      <p style="font-size:12px;color:var(--muted);line-height:1.7;margin:0">
        (주)아람인더스트 &nbsp;/&nbsp; © 2025 ARAM INDUSTRIES Co., Ltd. &nbsp;/&nbsp; All rights reserved.
      </p>
    </div>`;
  },

  /* ══════════════════════════════════
     전체 메뉴
  ══════════════════════════════════ */
  menu() {
    /* ── 모듈 정의 (스크린샷 구성 기준) ── */
    const modules = [
      { num:1,  title:'대시보드',          page:'dashboard',
        icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        items:[{l:'메인',p:'dashboard'},{l:'내업무',p:'dashboard'},{l:'즐겨찾기',p:'menu'},{l:'최근방문',p:'menu'}] },
      { num:2,  title:'영업/주문관리',     page:'sales-orders',
        icon:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
        items:[{l:'거래처관리',p:'sales-clients'},{l:'품목등록',p:'sales-items'},{l:'견적관리',p:'sales-orders'},{l:'수주관리',p:'sales-orders'},{l:'출하관리',p:'sales-orders'},{l:'매출관리',p:'finance'},{l:'CRM',p:'sales-orders'}] },
      { num:3,  title:'디자인팀',          page:'design-dtp',
        icon:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>',
        items:[{l:'DTP 디자인',p:'design-dtp'},{l:'자수 디자인',p:'design-emb'},{l:'거래처별 모음',p:'design-dtp'},{l:'대기건 대시보드',p:'design-dtp'},{l:'디자인 자료',p:'design-dtp'}] },
      { num:4,  title:'생산관리',          page:'production-dtp',
        icon:'<path d="M2 20h20M4 20V10l8-7 8 7v10"/><rect x="9" y="14" width="6" height="6"/>',
        items:[{l:'작업지시',p:'production-dtp'},{l:'DTP',p:'production-dtp'},{l:'자수',p:'production-emb'},{l:'퀄팅',p:'production-qlt'},{l:'원단가공',p:'production-dtp'},{l:'품질검사',p:'production-dtp'},{l:'생산실적',p:'production-dtp'}] },
      { num:5,  title:'원단/재고관리',     page:'inventory',
        icon:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>',
        items:[{l:'입출고',p:'inventory'},{l:'재고현황',p:'inventory'},{l:'실사',p:'inventory'},{l:'이동',p:'inventory'},{l:'창고관리',p:'inventory'},{l:'바코드',p:'inventory'}] },
      { num:6,  title:'FabricHub',         page:'fabricHub',
        icon:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>',
        items:[{l:'상품등록',p:'fabricHub'},{l:'판매자관리',p:'fabricHub'},{l:'주문관리',p:'fabricHub'},{l:'정산',p:'fabricHub'},{l:'리뷰',p:'fabricHub'}] },
      { num:7,  title:'재무관리',          page:'finance',
        icon:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
        items:[{l:'자금현황',p:'finance'},{l:'매입매출',p:'finance'},{l:'세금계산서',p:'finance'},{l:'지출결의',p:'finance'},{l:'정산',p:'finance'},{l:'회계',p:'finance'}] },
      { num:8,  title:'인사관리',          page:'hr',
        icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
        items:[{l:'조직도',p:'hr'},{l:'사원관리',p:'hr'},{l:'근태',p:'hr'},{l:'급여',p:'hr'},{l:'평가',p:'hr'},{l:'교육',p:'hr'}] },
      { num:9,  title:'구매관리',          page:'purchase',
        icon:'<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
        items:[{l:'구매요청',p:'purchase'},{l:'발주',p:'purchase'},{l:'입고',p:'purchase'},{l:'협력업체',p:'purchase'}] },
      { num:10, title:'사내커뮤니케이션', page:'chat',
        icon:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
        items:[{l:'채팅',p:'chat'},{l:'공지',p:'chat'},{l:'게시판',p:'chat'},{l:'일정',p:'chat'}] },
      { num:11, title:'시스템설정',        page:'system-users',
        icon:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41"/>',
        items:[{l:'사용자',p:'system-users'},{l:'권한',p:'system-users'},{l:'메뉴',p:'system-users'},{l:'로그',p:'system-users'},{l:'백업',p:'system-users'}] },
    ];

    return `
    <!-- 전체 메뉴 헤더 -->
    <div style="margin-bottom:24px">
      <div style="font-size:20px;font-weight:700;color:var(--txt);font-family:'Noto Sans KR',sans-serif;letter-spacing:-0.3px">
        (주)아람인더스트 통합포털 — 전체 메뉴
      </div>
    </div>

    <!-- 10개 모듈 카드 그리드 (5열 × 2행) -->
    <div id="menu-module-grid"
      style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
      ${modules.map(m=>`
      <div class="menu-module-card"
        data-page="${m.page}"
        data-title="${m.title}"
        data-items="${m.items.map(i=>i.l).join(',')}"
        onclick="goPage('${m.page}')"
        onmouseover="this.style.boxShadow='0 6px 24px rgba(67,97,238,.13)';this.style.transform='translateY(-2px)'"
        onmouseout="this.style.boxShadow='';this.style.transform=''"
        style="background:var(--card);border:1.5px solid var(--bdr);border-radius:10px;padding:18px 16px 16px;cursor:pointer;transition:box-shadow .15s,transform .12s">

        <!-- 모듈 아이콘 -->
        <div style="width:38px;height:38px;border-radius:8px;border:1.5px solid #c8d0e8;display:flex;align-items:center;justify-content:center;margin-bottom:13px;background:var(--bg)">
          <svg fill="none" stroke="#4361ee" stroke-width="1.6" viewBox="0 0 24 24" width="18" height="18">${m.icon}</svg>
        </div>

        <!-- 번호 + 제목 -->
        <div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:13px;font-family:'Noto Sans KR',sans-serif;line-height:1.3">
          ${m.num}. ${m.title}
        </div>

        <!-- 서브 메뉴 목록 (불릿) -->
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
          ${m.items.map(it=>`
          <li onclick="event.stopPropagation();goPage('${it.p}')"
            onmouseover="this.querySelector('.mi-dot').style.background='#4361ee';this.querySelector('.mi-txt').style.color='#4361ee'"
            onmouseout="this.querySelector('.mi-dot').style.background='';this.querySelector('.mi-txt').style.color=''"
            style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <span class="mi-dot" style="width:5px;height:5px;border-radius:50%;background:#c5cde8;flex-shrink:0;display:inline-block;transition:background .1s"></span>
            <span class="mi-txt" style="font-size:12.5px;color:var(--muted);font-family:'Noto Sans KR',sans-serif;transition:color .1s">${it.l}</span>
          </li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>

    <script>
    /* 호환성 유지 — 외부에서 호출될 수 있는 함수 */
    window._filterMenu    = function() {};
    window._setMenuFilter = function() {};
    window._toggleFav     = function(page) {
      var favPages = [];
      try { favPages = JSON.parse(localStorage.getItem('aram_favs')||'[]'); } catch(_) {}
      var idx = favPages.indexOf(page);
      if (idx > -1) { favPages.splice(idx,1); } else { favPages.push(page); }
      try { localStorage.setItem('aram_favs', JSON.stringify(favPages)); } catch(_) {}
    };
    <\/script>`;
  },

  /* ══════════════════════════════════
     DTP 디자인팀
  ══════════════════════════════════ */
  'design-dtp'() {
    const clients = [
      {init:'JS', color:'#1a237e', name:'지성',    total:18, done:16},
      {init:'SM', color:'#2e7d32', name:'슈퍼맛',  total:15, done:11},
      {init:'YS', color:'#00695c', name:'예성',    total:14, done:9},
      {init:'MJ', color:'#bf360c', name:'엠제이',  total:13, done:10},
      {init:'ID', color:'#6a1b9a', name:'아이디어', total:12, done:7},
      {init:'NM', color:'#b71c1c', name:'네모',    total:11, done:8},
      {init:'TI', color:'#37474f', name:'타임',    total:10, done:8},
      {init:'BO', color:'#d84315', name:'바오',    total:9,  done:7},
      {init:'PJ', color:'#006064', name:'풍전',    total:8,  done:6},
      {init:'SO', color:'#1b5e20', name:'세연',    total:8,  done:7},
      {init:'SY', color:'#c62828', name:'세영',    total:7,  done:5},
      {init:'DR', color:'#4527a0', name:'두레',    total:5,  done:4},
      {init:'JT', color:'#00838f', name:'지텍스',  total:5,  done:4},
      {init:'KV', color:'#880e4f', name:'케빈',    total:4,  done:3},
      {init:'기타',color:'#78909c', name:'기타',   total:'+12', done:'EB·CC·MU 등', extra:true},
    ];
    /* 전역 요청서 데이터 (저장 시 누적) — 새로고침 전까지 유지 */
    if (!window._dtpRequests) {
      window._dtpRequests = [
        {no:'DTP-2026-0891',client:'지성',   item:'플라워 프린트 A4', req:'05.15',due:'05.20',staff:'김디자인',bclass:'badge-red',   status:'오늘기한'},
        {no:'DTP-2026-0887',client:'슈퍼맛', item:'체크패턴 반복',    req:'05.14',due:'05.21',staff:'이담당',  bclass:'badge-blue',  status:'진행중'},
        {no:'DTP-2026-0882',client:'예성',   item:'줄무늬 컬러웨이',  req:'05.13',due:'05.22',staff:'박작업',  bclass:'badge-gray',  status:'대기'},
        {no:'DTP-2026-0879',client:'엠제이', item:'아이코닉 로고',    req:'05.12',due:'05.23',staff:'김디자인',bclass:'badge-gray',  status:'대기'},
        {no:'DTP-2026-0876',client:'아이디어',item:'기하학 패턴',     req:'05.11',due:'05.25',staff:'이담당',  bclass:'badge-gray',  status:'대기'},
      ];
    }
    const pendingRows = window._dtpRequests;

    return `
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">DTP 디자인 · 생산 · 물류</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('페이지를 새로고침합니다')" style="display:flex;align-items:center;gap:5px">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="13" height="13"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            새로고침
          </button>
          <button class="btn btn-primary btn-sm" onclick="_openDtpRequestModal()">
            + 요청서 작성
          </button>
        </div>
      </div>
    </div>

    <!-- Notion 연동 배너 -->
    <div style="background:#1a2035;border-radius:10px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
      <div style="width:42px;height:42px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
      </div>
      <div style="flex:1">
        <div style="font-size:14.5px;font-weight:700;color:#fff;margin-bottom:3px">
          DTP — Notion 연동 | 디자인 요청서 DB · 생산 현황 · 물류 재고
        </div>
        <div style="font-size:12.5px;color:#8898bf">
          CW · TEST · OPTION 작업 코드 · 출력X · 지급 · 메일 플레그 반영
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <span style="background:rgba(255,255,255,.1);color:#a0b0d0;border-radius:6px;padding:3px 10px;font-size:11.5px">Notion 연동</span>
        <span style="background:rgba(67,97,238,.3);color:#7ba7ff;border-radius:6px;padding:3px 10px;font-size:11.5px">실시간 동기화</span>
      </div>
    </div>

    <!-- 메인 탭 바 -->
    <div class="tab-bar" style="border:1.5px solid var(--bdr);border-radius:8px 8px 0 0;padding:2px 4px 0;margin-bottom:0;background:var(--card)">
      <div class="tab active" onclick="switchTab(this,'dtp-d-tab-1')" style="display:flex;align-items:center;gap:5px;font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" width="13" height="13"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
        DTP 디자인 요청서
      </div>
      <div class="tab" onclick="switchTab(this,'dtp-d-tab-2')" style="display:flex;align-items:center;gap:5px;font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        디자인 자료
      </div>
      <div class="tab" onclick="switchTab(this,'dtp-d-tab-3')" style="display:flex;align-items:center;gap:5px;font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" width="13" height="13"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        담당자별 진행상황
      </div>
      <div class="tab" onclick="switchTab(this,'dtp-d-tab-4')" style="display:flex;align-items:center;gap:5px;font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" width="13" height="13"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        DTP 생산 데이터
      </div>
      <div class="tab" onclick="switchTab(this,'dtp-d-tab-5')" style="display:flex;align-items:center;gap:5px;font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" width="13" height="13"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        DTP 물류 데이터
      </div>
    </div>

    <!-- ▶ 탭1: DTP 디자인 요청서 -->
    <div id="dtp-d-tab-1" style="border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <!-- 서브탭 버튼 (pill 스타일) -->
      <div style="display:flex;gap:3px;margin-bottom:16px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;padding:4px">
        <button class="dtpsub-btn" onclick="switchDtpSub(this,'dtpsub-1')"
          style="flex:1;padding:7px 8px;border-radius:6px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s;font-family:inherit">거래처 디자인 건수</button>
        <button class="dtpsub-btn" onclick="switchDtpSub(this,'dtpsub-2')"
          style="flex:1;padding:7px 8px;border-radius:6px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s;font-family:inherit">검색&amp;이달의 BEST</button>
        <button class="dtpsub-btn dtpsub-active" onclick="switchDtpSub(this,'dtpsub-3')"
          style="flex:1;padding:7px 8px;border-radius:6px;border:none;font-size:12.5px;font-weight:600;cursor:pointer;background:#1a2035;color:#fff;transition:all .15s;font-family:inherit">거래처별 모음</button>
        <button class="dtpsub-btn" onclick="switchDtpSub(this,'dtpsub-4')"
          style="flex:1;padding:7px 8px;border-radius:6px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s;font-family:inherit">대기건 대시보드</button>
      </div>

      <!-- 서브탭1: 거래처 디자인 건수 -->
      <div id="dtpsub-1" style="display:none">
        <div class="table-wrap">
          <table>
            <thead><tr><th>거래처</th><th style="text-align:center">전체</th><th style="text-align:center">완료</th><th style="text-align:center">진행중</th><th style="text-align:center">대기</th><th style="width:180px">완료율</th></tr></thead>
            <tbody>
              ${clients.filter(function(c){return !c.extra;}).map(function(c){
                const pct = Math.round(Number(c.done)/Number(c.total)*100);
                const rem = Number(c.total)-Number(c.done);
                const ing = rem>2?Math.floor(rem/2):1;
                const wait = Math.ceil(rem/2);
                return '<tr>'
                  +'<td><div style="display:flex;align-items:center;gap:8px">'
                  +'<div style="width:28px;height:28px;border-radius:50%;background:'+c.color+';color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+c.init+'</div>'
                  +'<span style="font-weight:500">'+c.name+'</span></div></td>'
                  +'<td style="text-align:center;font-weight:700">'+c.total+'</td>'
                  +'<td style="text-align:center;color:#10b981;font-weight:600">'+c.done+'</td>'
                  +'<td style="text-align:center;color:#4361ee">'+ing+'</td>'
                  +'<td style="text-align:center;color:#ef4444">'+wait+'</td>'
                  +'<td><div style="display:flex;align-items:center;gap:8px">'
                  +'<div style="flex:1;height:6px;border-radius:3px;background:var(--bdr)">'
                  +'<div style="width:'+pct+'%;height:100%;border-radius:3px;background:'+c.color+'"></div>'
                  +'</div><span style="font-size:12px;font-weight:600;color:var(--txt);width:34px;text-align:right">'+pct+'%</span>'
                  +'</div></td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 서브탭2: 검색&이달의 BEST -->
      <div id="dtpsub-2" style="display:none">
        <div style="display:grid;grid-template-columns:280px 1fr;gap:16px">
          <div class="card">
            <div class="card-header"><span class="card-title">🏆 이달의 BEST 거래처</span></div>
            <div class="card-body" style="padding:0">
              ${['🥇','🥈','🥉','4️⃣','5️⃣'].map(function(medal,i){
                const c=clients[i];
                return '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--bdr)">'
                  +'<span style="font-size:18px;width:24px;text-align:center">'+medal+'</span>'
                  +'<div style="width:32px;height:32px;border-radius:50%;background:'+c.color+';color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+c.init+'</div>'
                  +'<div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--txt)">'+c.name+'</div>'
                  +'<div style="font-size:11.5px;color:var(--muted)">완료 '+c.done+'건</div></div>'
                  +'<span style="font-size:24px;font-weight:800;color:var(--txt)">'+c.total+'</span>'
                  +'</div>';
              }).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">🔍 요청서 검색</span></div>
            <div class="card-body" style="padding:16px">
              <div style="display:flex;gap:8px;margin-bottom:12px">
                <div style="flex:1;position:relative">
                  <svg fill="none" stroke="#9ba8c0" stroke-width="2" viewBox="0 0 24 24" width="15" height="15" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input class="form-input" placeholder="작업번호, 거래처, 품목 검색..." style="padding-left:32px">
                </div>
                <button class="btn btn-primary btn-sm">검색</button>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
                ${['전체','진행중','완료','CW대기','출력X','대기'].map(function(s,i){return '<button class="btn btn-sm '+(i===0?'btn-primary':'btn-secondary')+'" style="font-size:11.5px">'+s+'</button>';}).join('')}
              </div>
              <div class="table-wrap" style="max-height:240px;overflow-y:auto">
                <table>
                  <thead><tr><th>작업번호</th><th>거래처</th><th>품목</th><th>담당자</th><th style="text-align:center">상태</th></tr></thead>
                  <tbody id="dtp-search-tbody">
                    ${pendingRows.map(function(r){return '<tr><td class="td-link" style="font-size:12px">'+r.no+'</td><td style="font-size:12px">'+r.client+'</td><td style="font-size:12px">'+r.item+'</td><td style="font-size:12px">'+r.staff+'</td><td class="td-center"><span class="badge '+r.bclass+'">'+r.status+'</span></td></tr>';}).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 서브탭3: 거래처별 모음 (기본 활성) -->
      <div id="dtpsub-3">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-size:14.5px;font-weight:600;color:var(--txt)">거래처별 디자인 모음</div>
          <div style="position:relative">
            <svg fill="none" stroke="#9ba8c0" stroke-width="2" viewBox="0 0 24 24" width="15" height="15"
              style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input class="form-input" placeholder="거래처 검색..." style="padding-left:32px;width:200px"
              oninput="_filterDtpClients(this.value)">
          </div>
        </div>
        <div id="dtp-client-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px">
          ${clients.map(function(c){
            var tNum = typeof c.total==='number'?c.total:0;
            var dNum = typeof c.done==='number'?c.done:0;
            return '<div class="dtp-client-card" data-name="'+c.name+'" data-init="'+c.init+'"'
              +' onclick="_openDtpClientDetail(\''+c.name+'\',\''+c.color+'\',\''+c.init+'\','+tNum+','+dNum+')"'
              +' onmouseover="this.style.boxShadow=\'0 4px 18px rgba(0,0,0,.1)\';this.style.transform=\'translateY(-2px)\'"'
              +' onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'"'
              +' style="background:var(--card);border:1.5px solid var(--bdr);border-radius:12px;padding:22px 16px 16px;text-align:center;cursor:pointer;transition:box-shadow .15s,transform .12s">'
              +'<div style="width:54px;height:54px;border-radius:50%;background:'+c.color+';color:#fff;font-size:'+(c.init.length>2?'11':'14')+'px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">'+c.init+'</div>'
              +'<div style="font-size:13px;color:var(--muted);margin-bottom:6px">'+c.name+'</div>'
              +'<div style="font-size:32px;font-weight:800;color:var(--txt);line-height:1;margin-bottom:4px">'+c.total+'</div>'
              +'<div style="font-size:12px;color:#9ba8c0">'+(c.extra ? c.done : '완료 '+c.done+'건')+'</div>'
              +'</div>';
          }).join('')}
        </div>
      </div>

      <!-- 서브탭4: 대기건 대시보드 -->
      <div id="dtpsub-4" style="display:none">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
          ${[['전체 대기',23,'#ef4444'],['오늘 기한',5,'#f59e0b'],['이번주 기한',11,'#4361ee'],['CW 대기',7,'#8b5cf6']].map(function(kv){return '<div class="card" style="padding:20px;text-align:center">'+'<div style="font-size:12px;color:var(--muted);margin-bottom:10px">'+kv[0]+'</div>'+'<div style="font-size:36px;font-weight:800;color:'+kv[2]+';line-height:1">'+kv[1]+'</div>'+'<div style="font-size:12px;color:var(--muted);margin-top:4px">건</div></div>';}).join('')}
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">⏳ 대기 요청서 목록</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>작업번호</th><th>거래처</th><th>품목</th><th>요청일</th><th>기한</th><th>담당자</th><th style="text-align:center">상태</th></tr></thead>
              <tbody id="dtp-pending-tbody">
                ${pendingRows.map(function(r){return '<tr><td class="td-link">'+r.no+'</td><td>'+r.client+'</td><td>'+r.item+'</td><td>'+r.req+'</td><td style="font-weight:600;color:'+(r.bclass==='badge-red'?'#ef4444':'var(--txt)')+'">'+r.due+'</td><td>'+r.staff+'</td><td class="td-center"><span class="badge '+r.bclass+'">'+r.status+'</span></td></tr>';}).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div><!-- /dtp-d-tab-1 -->

    <!-- ▶ 탭2: 디자인 자료 -->
    <div id="dtp-d-tab-2" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
        ${[['전체 자료',148,'#4361ee'],['이달 등록',23,'#10b981'],['검토 대기',7,'#f59e0b']].map(function(kv){return '<div class="card" style="padding:16px;text-align:center"><div style="font-size:12px;color:var(--muted);margin-bottom:8px">'+kv[0]+'</div><div style="font-size:28px;font-weight:800;color:'+kv[2]+'">'+kv[1]+'</div></div>';}).join('')}
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">📁 디자인 자료 목록</span>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('자료 업로드 기능은 준비 중입니다.')">+ 자료 업로드</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>파일명</th><th>거래처</th><th>구분</th><th>등록일</th><th>담당자</th><th>크기</th><th style="text-align:center">작업</th></tr></thead>
            <tbody>
              ${(function(){
                var files = [
                  {name:'플라워패턴_지성_0891.ai', client:'지성',   ext:'AI 파일', date:'05.15', staff:'김디자인', size:'24.3 MB', req:'DTP-2026-0891', memo:'플라워 프린트 A4 사이즈 패턴 원본 AI 파일. 색상 4도 분리 완료.'},
                  {name:'체크패턴_슈퍼맛_0887.psd',client:'슈퍼맛', ext:'PSD',     date:'05.14', staff:'이담당',   size:'18.7 MB', req:'DTP-2026-0887', memo:'체크패턴 반복 PSD 레이어 파일. 컬러칩 포함.'},
                  {name:'줄무늬_예성_0882_v2.ai',  client:'예성',   ext:'AI 파일', date:'05.13', staff:'박작업',   size:'11.2 MB', req:'DTP-2026-0882', memo:'줄무늬 컬러웨이 2차 수정본. 4가지 배색 버전 포함.'},
                  {name:'로고디자인_엠제이_0879.eps',client:'엠제이',ext:'EPS',     date:'05.12', staff:'김디자인', size:'8.9 MB',  req:'DTP-2026-0879', memo:'엠제이 아이코닉 로고 벡터 원본 EPS 파일.'},
                  {name:'기하학_아이디어_0876.pdf', client:'아이디어',ext:'PDF',    date:'05.11', staff:'이담당',   size:'5.4 MB',  req:'DTP-2026-0876', memo:'기하학 패턴 최종 교정 PDF. 출력 검수용.'},
                  {name:'스트라이프_지성_0855.ai',  client:'지성',   ext:'AI 파일', date:'05.08', staff:'김디자인', size:'16.1 MB', req:'DTP-2026-0855', memo:'스트라이프 CW 완료 원본 파일.'},
                  {name:'레트로패턴_슈퍼맛_0860.psd',client:'슈퍼맛',ext:'PSD',    date:'05.09', staff:'오회진',   size:'21.4 MB', req:'DTP-2026-0860', memo:'레트로 패턴 PSD 레이어 분리 파일.'},
                  {name:'예성시즌패턴_0840.ai',     client:'예성',   ext:'AI 파일', date:'05.04', staff:'박작업',   size:'9.8 MB',  req:'DTP-2026-0840', memo:'예성 시즌 패턴 AI 파일. 컬러 3종.'},
                ];
                var extColor = {'AI 파일':'#f59e0b','PSD':'#4361ee','EPS':'#10b981','PDF':'#ef4444'};
                return files.map(function(f){
                  var ec = extColor[f.ext] || '#6b7280';
                  return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'">'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')" style="cursor:pointer">'
                    +'<span style="color:#4361ee;font-weight:500;text-decoration:underline;cursor:pointer">'+f.name+'</span>'
                    +'</td>'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')">'+f.client+'</td>'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')">'
                    +'<span style="background:'+ec+'22;color:'+ec+';border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">'+f.ext+'</span>'
                    +'</td>'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')">'+f.date+'</td>'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')">'+f.staff+'</td>'
                    +'<td onclick="_openDtpFileDetail(\''+f.name+'\')" style="color:var(--muted)">'+f.size+'</td>'
                    +'<td class="td-center">'
                    +'<button class="btn btn-secondary btn-sm" style="font-size:11px" onclick="event.stopPropagation();_downloadDtpFile(\''+f.name+'\',\''+f.ext+'\',\''+f.size+'\')">다운로드</button>'
                    +'</td>'
                    +'</tr>';
                }).join('');
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ▶ 탭3: 담당자별 진행상황 -->
    <div id="dtp-d-tab-3" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        ${(function(){
          const staff = [
            { name:'하에진', color:'#2c3e6b', count:8,
              days:[
                { date:'2026-05-07 (목)', items:[
                  {code:'JS지성3610-CW',     desc:'아람60수110 출력 진행중', badge:'지급',  bc:'#f59e0b', blt:'#fff'},
                  {code:'YS예성0810-OPTION', desc:'새보정 요청 반영 중',    badge:'출력X', bc:'#374151', blt:'#fff'},
                  {code:'KV케빈0112-CW',    desc:'신규 거래처 첫 작업',    badge:'',      bc:'',        blt:''},
                ]},
                { date:'2026-05-06 (수)', items:[
                  {code:'NM네모1183-CW',   desc:'완료', badge:'완료', bc:'#10b981', blt:'#fff'},
                  {code:'PJ풍전0406-TEST', desc:'완료', badge:'완료', bc:'#10b981', blt:'#fff'},
                ]},
              ]
            },
            { name:'오회진', color:'#0d6e6e', count:6,
              days:[
                { date:'2026-05-07 (목)', items:[
                  {code:'MJ엠제이2220-CW',    desc:'샘플 메일 발송 완료', badge:'메일', bc:'#3b82f6', blt:'#fff'},
                  {code:'SM슈퍼마켓1021-CW',  desc:'작업 진행중',         badge:'',     bc:'',        blt:''},
                ]},
                { date:'2026-05-06 (수)', items:[
                  {code:'BO바오0507-CW',       desc:'완료 · 출고 처리', badge:'완료', bc:'#10b981', blt:'#fff'},
                  {code:'ID아이디어0312-TEST', desc:'완료',             badge:'완료', bc:'#10b981', blt:'#fff'},
                ]},
              ]
            },
            { name:'신호준', color:'#5b21b6', count:5,
              days:[
                { date:'2026-05-07 (목)', items:[
                  {code:'NM네모1185-TEST',     desc:'지성80수9088 색보정',  badge:'', bc:'', blt:''},
                  {code:'SO세연0504-TEST',     desc:'대기 → 진행중 전환',  badge:'', bc:'', blt:''},
                ]},
                { date:'2026-05-06 (수)', items:[
                  {code:'SM슈퍼마켓0916-TEST', desc:'완료', badge:'완료', bc:'#10b981', blt:'#fff'},
                ]},
              ]
            },
            { name:'이동연', color:'#7c3100', count:4,
              days:[
                { date:'2026-05-07 (목)', items:[
                  {code:'TI타임0320-CW',     desc:'아람60수110 작업중',  badge:'', bc:'', blt:''},
                  {code:'SY세영0204-OPTION', desc:'OPTION 수정 반영',    badge:'', bc:'', blt:''},
                ]},
                { date:'2026-05-05 (화)', items:[
                  {code:'DR두레0103-CW',     desc:'완료', badge:'완료', bc:'#10b981', blt:'#fff'},
                ]},
              ]
            },
          ];
          return staff.map(function(s){
            var daysHtml = s.days.map(function(d){
              var itemsHtml = d.items.map(function(it){
                var badge = it.badge ? '<span style="margin-left:auto;flex-shrink:0;font-size:11px;font-weight:700;color:'+it.blt+';background:'+it.bc+';border-radius:4px;padding:2px 8px">'+it.badge+'</span>' : '';
                var safeCode = it.code.replace(/'/g, "\\'");
                return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.04);cursor:pointer;transition:background .15s" '
                  +'onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'" '
                  +'onclick="_openDtpWorkDetail(\''+safeCode+'\')">'
                  +'<span style="font-size:12px;font-weight:600;color:#4361ee;flex:0 0 auto;text-decoration:underline">'+it.code+'</span>'
                  +'<span style="font-size:12px;color:var(--muted);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+it.desc+'</span>'
                  +badge
                  +'</div>';
              }).join('');
              return '<div style="padding:0 14px 2px">'
                +'<div style="font-size:12px;font-weight:700;color:var(--muted);padding:10px 0 6px;border-bottom:2px solid var(--bdr);margin-bottom:2px">'+d.date+'</div>'
                +itemsHtml
                +'</div>';
            }).join('');
            return '<div style="background:var(--card);border:1.5px solid var(--bdr);border-radius:10px;overflow:hidden">'
              +'<div style="background:'+s.color+';padding:12px 16px;display:flex;align-items:center;justify-content:space-between">'
              +'<span style="font-size:15px;font-weight:700;color:#fff">'+s.name+'</span>'
              +'<span style="font-size:12px;color:rgba(255,255,255,.8);background:rgba(255,255,255,.18);border-radius:20px;padding:2px 10px">진행 '+s.count+'건</span>'
              +'</div>'
              +daysHtml
              +'</div>';
          }).join('');
        })()}
      </div>
    </div>

    <!-- ▶ 탭4: DTP 생산 데이터 -->
    <div id="dtp-d-tab-4" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        ${[['총 생산지시',68,'#4361ee','all'],['완료',51,'#10b981','완료'],['진행중',12,'#f59e0b','진행중'],['불량률',1.4,'#ef4444','불량']].map(function(kv,i){
          var suffix = i===3?'%':'';
          return '<div class="card" style="padding:16px;text-align:center;cursor:pointer;transition:box-shadow .18s" '
            +'onmouseover="this.style.boxShadow=\'0 4px 18px rgba(0,0,0,.12)\'" onmouseout="this.style.boxShadow=\'\'" '
            +'onclick="_openDtpProdFilter(\''+kv[3]+'\')">'
            +'<div style="font-size:12px;color:var(--muted);margin-bottom:8px">'+kv[0]+'</div>'
            +'<div style="font-size:28px;font-weight:800;color:'+kv[2]+';text-decoration:underline dotted 2px">'+kv[1]+suffix+'</div>'
            +'<div style="font-size:11px;color:var(--muted);margin-top:5px">클릭하여 상세보기</div>'
            +'</div>';
        }).join('')}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🖨️ DTP 생산 현황</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>작업번호</th><th>거래처</th><th>품목</th><th>출력크기</th><th>수량</th><th>시작일</th><th>완료일</th><th style="text-align:center">상태</th></tr></thead>
            <tbody>
              ${[
                ['DTP-2026-0891','지성','플라워 프린트','A4','500m','05.15','05.17','완료'],
                ['DTP-2026-0887','슈퍼맛','체크패턴','A3','300m','05.14','05.18','완료'],
                ['DTP-2026-0882','예성','줄무늬','A4','450m','05.16','-','진행중'],
                ['DTP-2026-0879','엠제이','아이코닉','특수','200m','05.17','-','진행중'],
                ['DTP-2026-0876','아이디어','기하학','A4','350m','05.18','-','대기'],
              ].map(function(r){
                return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'">'
                  +'<td><span onclick="_openDtpProdDetail(\''+r[0]+'\')" style="color:#4361ee;font-weight:700;cursor:pointer;text-decoration:underline">'+r[0]+'</span></td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[1]+'</td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[2]+'</td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[3]+'</td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[4]+'</td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[5]+'</td>'
                  +'<td onclick="_openDtpProdDetail(\''+r[0]+'\')">'+r[6]+'</td>'
                  +'<td class="td-center" onclick="_openDtpProdDetail(\''+r[0]+'\')">'
                  +'<span class="badge '+(r[7]==='완료'?'badge-green':r[7]==='진행중'?'badge-blue':'badge-gray')+'">'+r[7]+'</span></td>'
                  +'</tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ▶ 탭5: DTP 물류 데이터 -->
    <div id="dtp-d-tab-5" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        ${[['출고 대기',14,'#f59e0b'],['출고 완료',42,'#10b981'],['배송중',8,'#4361ee'],['반품',2,'#ef4444']].map(function(kv){return '<div class="card" style="padding:16px;text-align:center"><div style="font-size:12px;color:var(--muted);margin-bottom:8px">'+kv[0]+'</div><div style="font-size:28px;font-weight:800;color:'+kv[2]+'">'+kv[1]+'</div></div>';}).join('')}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🚚 물류 현황</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>운송번호</th><th>거래처</th><th>품목</th><th>수량</th><th>출고일</th><th>수령예정</th><th>배송사</th><th style="text-align:center">상태</th></tr></thead>
            <tbody>
              ${[
                ['LG-2026-0412','지성','플라워 프린트 500m','1롤','05.17','05.18','CJ대한통운','완료'],
                ['LG-2026-0408','슈퍼맛','체크패턴 300m','1롤','05.16','05.17','한진택배','완료'],
                ['LG-2026-0405','예성','줄무늬 450m','2롤','05.18','05.20','CJ대한통운','배송중'],
                ['LG-2026-0401','엠제이','아이코닉 200m','1롤','-','05.22','-','대기'],
              ].map(function(r){return '<tr><td class="td-link">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+r[4]+'</td><td>'+r[5]+'</td><td>'+r[6]+'</td><td class="td-center"><span class="badge '+(r[7]==='완료'?'badge-green':r[7]==='배송중'?'badge-blue':'badge-gray')+'">'+r[7]+'</span></td></tr>';}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    `;
  },

  /* ══════════════════════════════════
     자수 디자인팀
  ══════════════════════════════════ */
  'design-emb'() {
    const embClients = [
      {init:'SJ', color:'#1565c0', name:'서주',   total:12, done:10},
      {init:'HN', color:'#6a1b9a', name:'한나',   total:9,  done:7},
      {init:'YR', color:'#00695c', name:'예루',   total:8,  done:6},
      {init:'TK', color:'#e65100', name:'태강',   total:7,  done:5},
      {init:'BG', color:'#2e7d32', name:'버그',   total:6,  done:4},
      {init:'CM', color:'#c62828', name:'시마',   total:5,  done:4},
      {init:'PR', color:'#37474f', name:'프라임', total:4,  done:3},
      {init:'기타',color:'#78909c', name:'기타',  total:'+6', done:'MJ·CC 등', extra:true},
    ];
    return `
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">자수 디자인 · 생산</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('페이지를 새로고침합니다')">↺ 새로고침</button>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('자수 요청서 작성 폼을 불러옵니다')">+ 요청서 작성</button>
        </div>
      </div>
    </div>

    <!-- 배너 -->
    <div style="background:#1a0535;border-radius:10px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
      <div style="width:42px;height:42px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24" width="22" height="22"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </div>
      <div>
        <div style="font-size:14.5px;font-weight:700;color:#fff;margin-bottom:3px">자수 디자인 — 요청서 DB · 생산 현황</div>
        <div style="font-size:12.5px;color:#b899e0">EMB · CC · MU 작업 코드 · 색상표 · 실 번호 · 납기 관리</div>
      </div>
    </div>

    <!-- 탭 바 -->
    <div class="tab-bar" style="border:1.5px solid var(--bdr);border-radius:8px 8px 0 0;padding:2px 4px 0;margin-bottom:0;background:var(--card)">
      <div class="tab active" onclick="switchTab(this,'embd-tab-1')" style="font-size:13px">거래처별 모음</div>
      <div class="tab" onclick="switchTab(this,'embd-tab-2')" style="font-size:13px">요청서 현황</div>
      <div class="tab" onclick="switchTab(this,'embd-tab-3')" style="font-size:13px">자수 생산 데이터</div>
    </div>

    <!-- 탭1: 거래처별 모음 -->
    <div id="embd-tab-1" style="border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:14.5px;font-weight:600;color:var(--txt)">거래처별 자수 디자인 모음</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px">
        ${embClients.map(function(c){
          return '<div onclick="if(window.ARAM_UI)ARAM_UI.Toast.info(\''+c.name+' 자수 디자인 목록 조회\')"'
            +' onmouseover="this.style.boxShadow=\'0 4px 18px rgba(0,0,0,.1)\';this.style.transform=\'translateY(-2px)\'"'
            +' onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'"'
            +' style="background:var(--card);border:1.5px solid var(--bdr);border-radius:12px;padding:22px 16px 16px;text-align:center;cursor:pointer;transition:box-shadow .15s,transform .12s">'
            +'<div style="width:54px;height:54px;border-radius:50%;background:'+c.color+';color:#fff;font-size:'+(c.init.length>2?'11':'14')+'px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">'+c.init+'</div>'
            +'<div style="font-size:13px;color:var(--muted);margin-bottom:6px">'+c.name+'</div>'
            +'<div style="font-size:32px;font-weight:800;color:var(--txt);line-height:1;margin-bottom:4px">'+c.total+'</div>'
            +'<div style="font-size:12px;color:#9ba8c0">'+(c.extra?c.done:'완료 '+c.done+'건')+'</div>'
            +'</div>';
        }).join('')}
      </div>
    </div>

    <!-- 탭2: 요청서 현황 -->
    <div id="embd-tab-2" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div class="table-wrap">
        <table>
          <thead><tr><th>작업번호</th><th>거래처</th><th>품목</th><th>실번호</th><th>요청일</th><th>기한</th><th>담당자</th><th style="text-align:center">상태</th></tr></thead>
          <tbody>
            ${[
              ['EMB-2026-0234','서주','플로럴 자수','DMC-321','05.14','05.20','자수1팀','완료'],
              ['EMB-2026-0231','한나','이니셜 레터링','DMC-310','05.13','05.21','자수2팀','진행중'],
              ['EMB-2026-0228','예루','기하학 패치','DMC-666','05.12','05.23','자수1팀','대기'],
              ['EMB-2026-0225','태강','회사 로고','DMC-815','05.11','05.25','자수2팀','대기'],
            ].map(function(r){return '<tr><td class="td-link">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td><code style="background:var(--bg);padding:1px 6px;border-radius:4px;font-size:12px">'+r[3]+'</code></td><td>'+r[4]+'</td><td>'+r[5]+'</td><td>'+r[6]+'</td><td class="td-center"><span class="badge '+(r[7]==='완료'?'badge-green':r[7]==='진행중'?'badge-blue':'badge-gray')+'">'+r[7]+'</span></td></tr>';}).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 탭3: 자수 생산 데이터 -->
    <div id="embd-tab-3" style="display:none;border:1.5px solid var(--bdr);border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:16px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        ${[['이달 완료',28,'#10b981'],['진행중',8,'#4361ee'],['대기',5,'#f59e0b'],['불량',1,'#ef4444']].map(function(kv){return '<div class="card" style="padding:16px;text-align:center"><div style="font-size:12px;color:var(--muted);margin-bottom:8px">'+kv[0]+'</div><div style="font-size:28px;font-weight:800;color:'+kv[2]+'">'+kv[1]+'</div></div>';}).join('')}
      </div>
      <div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="36" height="36" style="margin:0 auto 12px;display:block;opacity:.4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        자수 생산 데이터가 준비 중입니다
      </div>
    </div>`;
  },

  /* ══════════════════════════════════
     거래처관리
  ══════════════════════════════════ */
  'sales-clients'() {
    /* 전체 22개 거래처 데이터 */
    var _allClients = [
      {no:1,  code:'JS001', name:'지성텍스(주)',      rep:'김지성', tel:'031-xxx-1234', mobile:'',            search:'JS지성',   price:'기본단가', due:25, use:'YES'},
      {no:2,  code:'SM001', name:'(주)슈퍼마켓텍스', rep:'이슈퍼', tel:'031-852-5100', mobile:'',            search:'SM슈퍼마켓',price:'',         due:'',  use:'YES'},
      {no:3,  code:'YS001', name:'예성텍스(주)',      rep:'박예성', tel:'',             mobile:'',            search:'YS예성',   price:'',         due:'',  use:'YES'},
      {no:4,  code:'MJ001', name:'엠제이패션(주)',    rep:'최엠제이',tel:'',            mobile:'',            search:'MJ엠제이', price:'',         due:'',  use:'YES'},
      {no:5,  code:'ID001', name:'(주)아이디어섬유',  rep:'정아이디',tel:'',            mobile:'',            search:'ID아이디어',price:'',        due:'',  use:'YES'},
      {no:6,  code:'NM001', name:'네모텍스(주)',      rep:'한네모', tel:'',             mobile:'',            search:'NM네모',   price:'',         due:'',  use:'YES'},
      {no:7,  code:'TI001', name:'타임패브릭(주)',    rep:'김타임', tel:'',             mobile:'',            search:'TI타임',   price:'',         due:'',  use:'YES'},
      {no:8,  code:'BO001', name:'바오텍스(주)',      rep:'이바오', tel:'',             mobile:'',            search:'BO바오',   price:'',         due:'',  use:'YES'},
      {no:9,  code:'PJ001', name:'풍전섬유(주)',      rep:'박풍전', tel:'',             mobile:'',            search:'PJ풍전',   price:'',         due:'',  use:'YES'},
      {no:10, code:'SO001', name:'세연패션(주)',      rep:'최세연', tel:'',             mobile:'',            search:'SO세연',   price:'',         due:'',  use:'YES'},
      {no:11, code:'SY001', name:'세영텍스(주)',      rep:'정세영', tel:'',             mobile:'',            search:'SY세영',   price:'',         due:'',  use:'YES'},
      {no:12, code:'DR001', name:'두레섬유(주)',      rep:'한두레', tel:'',             mobile:'',            search:'DR두레',   price:'',         due:'',  use:'YES'},
      {no:13, code:'JT001', name:'지텍스코리아(주)', rep:'김지텍', tel:'',             mobile:'',            search:'JT지텍스', price:'',         due:'',  use:'YES'},
      {no:14, code:'KV001', name:'케빈패션(주)',      rep:'이케빈', tel:'',             mobile:'',            search:'KV케빈',   price:'',         due:'',  use:'YES'},
      {no:15, code:'HK001', name:'(주)한국염손',      rep:'김지윤', tel:'',             mobile:'',            search:'한국염손', price:'',         due:'',  use:'YES'},
      {no:16, code:'CW001', name:'청운섬유(주)',      rep:'박청운', tel:'032-445-2200', mobile:'010-2345-6789',search:'CW청운',  price:'기본단가', due:30,  use:'YES'},
      {no:17, code:'HR001', name:'하람텍스(주)',      rep:'최하람', tel:'',             mobile:'010-3456-7890',search:'HR하람',  price:'',         due:'',  use:'YES'},
      {no:18, code:'SJ001', name:'성주패션(주)',      rep:'정성주', tel:'051-234-5678', mobile:'',            search:'SJ성주',   price:'',         due:'',  use:'YES'},
      {no:19, code:'DW001', name:'대우섬유(주)',      rep:'김대우', tel:'',             mobile:'',            search:'DW대우',   price:'',         due:'',  use:'YES'},
      {no:20, code:'GS001', name:'글로벌스타일(주)', rep:'이글로', tel:'02-3344-5566', mobile:'010-9876-5432',search:'GS글로벌', price:'기본단가', due:20,  use:'YES'},
      {no:21, code:'NW001', name:'뉴웨이브텍스(주)', rep:'박뉴웨', tel:'',             mobile:'',            search:'NW뉴웨이브',price:'',        due:'',  use:'YES'},
      {no:22, code:'AR001', name:'아라미패션(주)',    rep:'최아라', tel:'031-777-8899', mobile:'010-1111-2222',search:'AR아라미', price:'기본단가', due:25,  use:'YES'},
    ];
    /* 페이지1 15개 */
    var page1 = _allClients.slice(0,15);
    var page2 = _allClients.slice(15);

    function renderRow(c) {
      return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'" onclick="_openClientDetail(\''+c.code+'\')">'
        +'<td style="width:32px;text-align:center" onclick="event.stopPropagation()"><input type="checkbox" style="cursor:pointer"></td>'
        +'<td style="width:36px;text-align:center;font-size:12px;color:var(--muted)">'+c.no+'</td>'
        +'<td style="font-size:12.5px;color:#4361ee;font-weight:600;text-decoration:underline;cursor:pointer">'+c.code+'</td>'
        +'<td style="font-weight:700">'+c.name+'</td>'
        +'<td>'+c.rep+'</td>'
        +'<td style="font-size:12px">'+c.tel+'</td>'
        +'<td style="font-size:12px">'+c.mobile+'</td>'
        +'<td style="font-size:12px">'+c.search+'</td>'
        +'<td style="font-size:12px">'+c.price+'</td>'
        +'<td style="text-align:center;font-size:12px">'+c.due+'</td>'
        +'<td style="text-align:center"><span style="color:#10b981;font-weight:700;font-size:12.5px">'+c.use+'</span></td>'
        +'<td style="text-align:center" onclick="event.stopPropagation()"><span style="color:#4361ee;font-size:12px;cursor:pointer;text-decoration:underline" onclick="_openClientDetail(\''+c.code+'\')">등록</span></td>'
        +'</tr>';
    }

    return `
    <!-- 헤더 -->
    <div class="page-header" style="padding-bottom:0">
      <div class="flex-between">
        <div>
          <div class="page-title">거래처관리 — 기초등록</div>
        </div>
        <button class="btn btn-secondary" onclick="goPage('sales-clients')" style="font-size:12px">
          ↺ 새로고침
        </button>
      </div>
    </div>

    <!-- 정보 배너 (이미지 없음) -->
    <div style="background:#1e2b4a;border-radius:10px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px">거래처관리 기초등록 — 거래처 · 품목 마스터 관리</div>
        <div style="font-size:12px;color:rgba(255,255,255,.6)">거래처 등록 / 수정 · 품목 코드 관리 · 단가 설정</div>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="goPage('sales-clients')"
          style="padding:7px 16px;font-size:12.5px;font-weight:700;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:5px">
          &#9646; 거래처등록
        </button>
        <button onclick="goPage('sales-items')"
          style="padding:7px 16px;font-size:12.5px;font-weight:700;background:#d97706;color:#fff;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:5px">
          &#9646; 품목등록
        </button>
      </div>
    </div>

    <!-- 탭 -->
    <div style="display:flex;border-bottom:2px solid var(--bdr);margin-bottom:0">
      <div style="padding:10px 22px;font-size:13px;font-weight:700;color:#4361ee;border-bottom:2.5px solid #4361ee;margin-bottom:-2px;cursor:default;display:flex;align-items:center;gap:6px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        거래처등록
      </div>
      <div onclick="goPage('sales-items')"
        style="padding:10px 22px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;display:flex;align-items:center;gap:6px"
        onmouseover="this.style.color='var(--txt)'" onmouseout="this.style.color='var(--muted)'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        품목등록
      </div>
    </div>

    <!-- 검색 행 -->
    <div style="display:flex;align-items:center;gap:8px;padding:10px 0 12px;flex-wrap:wrap">
      <input id="cli-srch" type="text" placeholder="거래처명 또는 코드 검색..."
        style="flex:1;min-width:220px;max-width:360px;padding:7px 12px;border:1.5px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);font-size:13px"
        oninput="_cliSearch()" onkeydown="if(event.key==='Enter'||event.key==='F3')_cliSearch()">
      <label style="display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--txt);cursor:pointer;white-space:nowrap">
        <input type="checkbox" id="cli-inc-stop" onchange="_cliSearch()" style="cursor:pointer"> 사용중단포함
      </label>
      <button onclick="_cliSearch()" style="padding:7px 18px;font-size:13px;font-weight:700;background:#1e2b4a;color:#fff;border:none;border-radius:6px;cursor:pointer">Search (F3)</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('옵션 기능 준비 중')" style="padding:7px 14px;font-size:13px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">옵션 ▼</button>
      <button onclick="_openClientRegModal()" style="margin-left:auto;padding:7px 20px;font-size:13px;font-weight:700;background:#4361ee;color:#fff;border:none;border-radius:6px;cursor:pointer">신규 (F2)</button>
    </div>

    <!-- 테이블 -->
    <div style="border:1.5px solid var(--bdr);border-radius:8px;overflow:hidden;margin-bottom:0">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f1f4ff;border-bottom:1.5px solid var(--bdr)">
            <th style="width:32px;padding:9px 6px;text-align:center" onclick="event.stopPropagation()">
              <input type="checkbox" id="cli-check-all" onchange="_cliCheckAll(this)" style="cursor:pointer">
            </th>
            <th style="width:36px;padding:9px 6px;text-align:center;font-size:12px;color:var(--muted)">#</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">거래처코드</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">거래처명</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">대표자명</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">전화</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">모바일</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">검색항내용</th>
            <th style="padding:9px 10px;text-align:left;font-size:12px;font-weight:700;color:var(--txt)">단가적용</th>
            <th style="padding:9px 10px;text-align:center;font-size:12px;font-weight:700;color:var(--txt)">청구마감일자</th>
            <th style="padding:9px 10px;text-align:center;font-size:12px;font-weight:700;color:var(--txt)">사용구분</th>
            <th style="padding:9px 10px;text-align:center;font-size:12px;font-weight:700;color:var(--txt)">이체정보</th>
          </tr>
        </thead>
        <tbody id="cli-tbody-p1">
          ${page1.map(renderRow).join('')}
        </tbody>
        <tbody id="cli-tbody-p2" style="display:none">
          ${page2.map(renderRow).join('')}
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 2px">
      <div style="display:flex;align-items:center;gap:4px">
        <button id="cli-pg-1" onclick="_cliPage(1)"
          style="width:28px;height:28px;border-radius:5px;background:#4361ee;color:#fff;border:none;font-size:13px;font-weight:700;cursor:pointer">1</button>
        <button id="cli-pg-2" onclick="_cliPage(2)"
          style="width:28px;height:28px;border-radius:5px;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);font-size:13px;cursor:pointer">2</button>
        <span style="font-size:12px;color:var(--muted);margin-left:6px">— / 2</span>
      </div>
      <span style="font-size:12px;color:var(--muted)">총 22건</span>
    </div>

    <!-- 하단 버튼 바 -->
    <div style="display:flex;align-items:center;gap:6px;padding:10px 0;border-top:1.5px solid var(--bdr);flex-wrap:wrap">
      <button onclick="_openClientRegModal()" style="padding:7px 16px;font-size:12.5px;font-weight:700;background:#4361ee;color:#fff;border:none;border-radius:6px;cursor:pointer">신규 (F2)</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('관계설정 기능 준비 중')" style="padding:7px 14px;font-size:12.5px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">관계설정</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('계층그룹 기능 준비 중')" style="padding:7px 14px;font-size:12.5px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">계층그룹</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('변경 기능 준비 중')" style="padding:7px 14px;font-size:12.5px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">변경</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('사용중단/재사용 기능 준비 중')" style="padding:7px 14px;font-size:12.5px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">사용중단/재사용 ▲</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.success('Excel 내보내기 완료')" style="padding:7px 16px;font-size:12.5px;font-weight:700;background:#1d6f42;color:#fff;border:none;border-radius:6px;cursor:pointer">Excel</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('행자료올리기 기능 준비 중')" style="padding:7px 14px;font-size:12.5px;font-weight:600;background:var(--bg);color:var(--txt);border:1.5px solid var(--bdr);border-radius:6px;cursor:pointer">행자료올리기</button>
      <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('SMS 발송 기능 준비 중')" style="padding:7px 16px;font-size:12.5px;font-weight:700;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer">SMS</button>
    </div>
    `;
  },

  /* ══════════════════════════════════
     품목등록
  ══════════════════════════════════ */
  'sales-items'() {
    return `
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">품목등록</div>
          <div class="page-subtitle">영업/주문 &gt; 품목등록</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('엑셀 내보내기 기능 준비 중입니다.')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            엑셀 다운
          </button>
          <button class="btn btn-primary" onclick="_openItemRegModal()">+ 품목 등록</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
      ${[['전체 품목',156,'#4361ee'],['활성 품목',132,'#10b981'],['단종',18,'#9ca3af'],['신규(당월)',6,'#8b5cf6']].map(function(kv){
        return '<div class="card" style="padding:16px;text-align:center">'
          +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px">'+kv[0]+'</div>'
          +'<div style="font-size:26px;font-weight:800;color:'+kv[2]+'">'+kv[1]+'</div>'
          +'</div>';
      }).join('')}
    </div>

    <!-- 검색 / 필터 -->
    <div class="card" style="margin-bottom:14px;padding:14px 16px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <input id="item-search-input" type="text" placeholder="품목명 / 코드 검색…"
          style="flex:1;min-width:180px;padding:8px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px"
          oninput="_filterItems(this.value)">
        <select id="item-cat-filter" onchange="_filterItems(document.getElementById('item-search-input').value)"
          style="padding:8px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px">
          <option value="">전체 카테고리</option>
          <option value="DTP 원단">DTP 원단</option>
          <option value="자수 원단">자수 원단</option>
          <option value="부자재">부자재</option>
          <option value="완제품">완제품</option>
        </select>
        <select id="item-status-filter" onchange="_filterItems(document.getElementById('item-search-input').value)"
          style="padding:8px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px">
          <option value="">전체 상태</option>
          <option value="활성">활성</option>
          <option value="단종">단종</option>
        </select>
      </div>
    </div>

    <!-- 품목 테이블 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">📦 품목 목록</span>
        <span id="item-count-badge" style="font-size:12px;color:var(--muted)">156건</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>품목코드</th><th>품목명</th><th>카테고리</th><th>단위</th><th>단가</th>
              <th>재고</th><th>등록일</th><th style="text-align:center">상태</th><th style="text-align:center">관리</th>
            </tr>
          </thead>
          <tbody id="item-tbody">
            ${(function(){
              var items = [
                {code:'ITM-0001', name:'플라워 프린트 원단',    cat:'DTP 원단',  unit:'m',  price:'3,200',  stock:'450m',  date:'2026-01-05', status:'활성'},
                {code:'ITM-0002', name:'체크무늬 원단',         cat:'DTP 원단',  unit:'m',  price:'2,800',  stock:'320m',  date:'2026-01-10', status:'활성'},
                {code:'ITM-0003', name:'줄무늬 원단',           cat:'DTP 원단',  unit:'m',  price:'2,600',  stock:'210m',  date:'2026-01-12', status:'활성'},
                {code:'ITM-0004', name:'장미 자수 원단',        cat:'자수 원단', unit:'m',  price:'8,500',  stock:'180m',  date:'2026-01-15', status:'활성'},
                {code:'ITM-0005', name:'기하학 패턴 원단',      cat:'DTP 원단',  unit:'m',  price:'3,100',  stock:'0m',    date:'2026-02-01', status:'단종'},
                {code:'ITM-0006', name:'국화 자수 원단',        cat:'자수 원단', unit:'m',  price:'9,200',  stock:'95m',   date:'2026-02-05', status:'활성'},
                {code:'ITM-0007', name:'DTP 잉크 CMYK 세트',  cat:'부자재',    unit:'set', price:'42,000', stock:'28set', date:'2026-02-10', status:'활성'},
                {code:'ITM-0008', name:'전사지 A4',            cat:'부자재',    unit:'box', price:'18,000', stock:'44box', date:'2026-02-15', status:'활성'},
                {code:'ITM-0009', name:'완성 패턴 셔츠',       cat:'완제품',    unit:'ea',  price:'32,000', stock:'120ea', date:'2026-03-01', status:'활성'},
                {code:'ITM-0010', name:'완성 패턴 블라우스',   cat:'완제품',    unit:'ea',  price:'38,000', stock:'80ea',  date:'2026-03-05', status:'활성'},
                {code:'ITM-0011', name:'아이코닉 프린트 원단', cat:'DTP 원단',  unit:'m',  price:'3,400',  stock:'260m',  date:'2026-03-10', status:'활성'},
                {code:'ITM-0012', name:'퀄팅 충전재',          cat:'부자재',    unit:'kg',  price:'5,500',  stock:'0kg',   date:'2026-03-15', status:'단종'},
              ];
              var catColors = {'DTP 원단':'#4361ee','자수 원단':'#8b5cf6','부자재':'#f59e0b','완제품':'#10b981'};
              return items.map(function(it){
                var cc = catColors[it.cat] || '#607d8b';
                var sc = it.status==='활성' ? '#10b981' : '#9ca3af';
                return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'">'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" style="font-size:12px;color:var(--muted)">'+it.code+'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" style="font-weight:700;color:#4361ee;text-decoration:underline">'+it.name+'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')">'
                  +'<span style="font-size:11px;font-weight:700;color:#fff;background:'+cc+';border-radius:4px;padding:2px 7px">'+it.cat+'</span>'
                  +'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" >'+it.unit+'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" style="text-align:right;font-weight:600">₩'+it.price+'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" style="font-weight:600;color:'+(it.stock==='0m'||it.stock==='0kg'?'#ef4444':'var(--txt)')+'">'+it.stock+'</td>'
                  +'<td onclick="_openItemDetail(\''+it.code+'\')" style="font-size:12px;color:var(--muted)">'+it.date+'</td>'
                  +'<td style="text-align:center"><span style="background:'+sc+';color:#fff;border-radius:4px;padding:2px 10px;font-size:12px;font-weight:700">'+it.status+'</span></td>'
                  +'<td style="text-align:center">'
                  +'<button class="btn btn-secondary btn-sm" style="font-size:11px;margin-right:4px" onclick="event.stopPropagation();_openItemDetail(\''+it.code+'\')">상세</button>'
                  +'<button class="btn btn-secondary btn-sm" style="font-size:11px" onclick="event.stopPropagation();if(window.ARAM_UI)ARAM_UI.Toast.info(\'수정 기능 준비 중\')">수정</button>'
                  +'</td>'
                  +'</tr>';
              }).join('');
            })()}
          </tbody>
        </table>
      </div>
    </div>
    `;
  },

  /* ══════════════════════════════════
     수주관리 목록
  ══════════════════════════════════ */
  'sales-orders'() {
    const orders = window.ARAM_DATA.salesOrders;
    const statusBadge = s => ({
      '진행중':'badge badge-solid-blue','접수':'badge badge-solid-gray','완료':'badge badge-solid-green','취소':'badge badge-red'
    })[s]||'badge badge-gray';
    return `
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">수주관리</div>
          <div class="page-desc">견적 → 계약 → 생산 → 납품 전체 워크플로우 관리</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('수주관리')">CSV ↓</button>
          <button class="btn btn-secondary btn-sm" onclick="printPage()">🖨 인쇄</button>
          <button class="btn btn-primary" onclick="if(window.ARAM_UI) ARAM_UI.openNewOrderModal()">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            신규 수주
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar mb-16">
      <button class="tab-btn active" onclick="switchTab(this,'so-tab-0')">수주현황</button>
      <button class="tab-btn" onclick="switchTab(this,'so-tab-1')">견적관리</button>
      <button class="tab-btn" onclick="switchTab(this,'so-tab-2')">계약관리</button>
      <button class="tab-btn" onclick="switchTab(this,'so-tab-3')">납품현황</button>
    </div>

    <!-- Tab 0: 수주현황 (기존) -->
    <div id="so-tab-0">

    <!-- Filters -->
    <div class="filter-bar">
      <span class="filter-label">기간</span>
      <div class="date-range">
        <input class="form-input" type="date" value="2026-05-01">
        <span style="color:#9ba8c0">~</span>
        <input class="form-input" type="date" value="2026-05-31">
      </div>
      <span class="filter-label">거래처</span>
      <input class="form-input" placeholder="거래처명 검색" style="width:160px">
      <span class="filter-label">상태</span>
      <select class="form-select" style="width:100px"><option>전체</option><option>접수</option><option>진행중</option><option>완료</option><option>취소</option></select>
      <span class="filter-label">담당자</span>
      <select class="form-select" style="width:120px"><option>전체</option></select>
    </div>

    <!-- Stats -->
    <div class="stat-grid mb-16">
      ${[
        ['총 수주','87건','#4361ee'],
        ['진행중','42건','#3b82f6'],
        ['이번주 신규','18건','#10b981'],
        ['금액 합계','₩12.5억','#8b5cf6'],
      ].map(([l,v,c])=>`
      <div class="stat-card">
        <div class="stat-label">${l}</div>
        <div class="stat-value${v.length>5?' sm':''}" style="color:${c}">${v}</div>
      </div>`).join('')}
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th class="checkbox-cell"><input type="checkbox"></th>
            <th>수주번호</th><th>거래처명</th><th>품목</th>
            <th>수량</th><th>단가</th><th class="td-right">금액</th>
            <th>납기일</th><th>진행률</th><th style="text-align:center">상태</th><th>담당자</th><th>액션</th>
          </tr></thead>
          <tbody>
            ${orders.map((o,i)=>`
            <tr style="cursor:pointer" onclick="goPage('sales-order-detail')">
              <td class="checkbox-cell"><input type="checkbox" onclick="event.stopPropagation()"></td>
              <td class="td-link">${o.no}</td>
              <td>${o.client}</td>
              <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${o.product}</td>
              <td>${o.qty}</td>
              <td>₩${Number(o.price).toLocaleString()}</td>
              <td class="td-right">₩${Number(o.total).toLocaleString()}</td>
              <td>${o.due}</td>
              <td style="min-width:100px">
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${o.progress}%"></div></div>
                  <span style="font-size:12px;color:#6b7a99;width:28px">${o.progress}%</span>
                </div>
              </td>
              <td class="td-center"><span class="${statusBadge(o.status)}">${o.status}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:6px">
                  <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600">${o.mgr[0]}</div>
                  <span style="font-size:13px">${o.mgr}</span>
                </div>
              </td>
              <td onclick="event.stopPropagation()">
                <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px;white-space:nowrap"
                  onclick="window._openProductionLinkModal && window._openProductionLinkModal(${i})">🏭 생산</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span class="page-info">전체 87건</span>
        <div class="page-nums">
          <span class="page-btn">‹</span>
          ${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}
          <span class="page-btn">…</span><span class="page-btn">9</span><span class="page-btn">›</span>
        </div>
        <div class="page-size">
          <span>페이지당</span>
          <select><option>12</option><option>24</option><option>48</option></select>
          <span>개</span>
        </div>
      </div>
    </div>
    </div><!-- /so-tab-0 -->

    <!-- Tab 1: 견적관리 -->
    <div id="so-tab-1" style="display:none">
      <div class="filter-bar mb-16">
        <input type="date" class="form-input" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input type="date" class="form-input" value="2026-05-31" style="width:140px">
        ${['전체','견적발송','협의중','견적확정','실패'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 거래처·견적번호 검색" style="flex:1;max-width:240px">
        <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('신규 견적서 작성')">+ 견적서 작성</button>
      </div>
      <!-- 견적 KPI -->
      <div class="stat-grid mb-16">
        ${[['견적 발송','24건','#4361ee'],['협의중','9건','#f59e0b'],['견적 성사율','62.5%','#10b981'],['이달 견적금액','₩4.2억','#8b5cf6']].map(([l,v,c])=>`
        <div class="stat-card">
          <div class="stat-label">${l}</div>
          <div class="stat-value sm" style="color:${c}">${v}</div>
        </div>`).join('')}
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>견적번호</th><th>거래처명</th><th>품목명</th><th>견적일</th><th>유효기간</th>
              <th class="td-right">견적금액</th><th>담당자</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'QT-2026-0124',client:'삼성물산',item:'DTP 대량인쇄 80,000장',date:'05-19',valid:'05-26',amt:'₩48,000,000',mgr:'김민재',status:'협의중',sc:'orange'},
                {no:'QT-2026-0123',client:'LG생활건강',item:'자수 로고 패치 5,000ea',date:'05-18',valid:'05-25',amt:'₩14,000,000',mgr:'한지민',status:'견적확정',sc:'green'},
                {no:'QT-2026-0122',client:'현대백화점',item:'퀄팅 이불커버 200ea',date:'05-17',valid:'05-24',amt:'₩8,600,000',mgr:'김민재',status:'견적발송',sc:'blue'},
                {no:'QT-2026-0121',client:'롯데쇼핑',item:'원단 프린트 복합패턴',date:'05-16',valid:'05-23',amt:'₩32,500,000',mgr:'한지민',status:'협의중',sc:'orange'},
                {no:'QT-2026-0120',client:'신세계인터내셔날',item:'기업 로고 자수 10,000ea',date:'05-15',valid:'05-22',amt:'₩28,000,000',mgr:'김민재',status:'실패',sc:'red'},
                {no:'QT-2026-0119',client:'코오롱인더스트리',item:'기능성 퀄팅 소재',date:'05-14',valid:'05-21',amt:'₩61,200,000',mgr:'한지민',status:'견적확정',sc:'green'},
              ].map(r=>`
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee;cursor:pointer">${r.no}</td>
                <td style="font-weight:500">${r.client}</td>
                <td style="font-size:13px">${r.item}</td>
                <td style="font-size:12.5px">2026-${r.date}</td>
                <td style="font-size:12.5px">2026-${r.valid}</td>
                <td class="td-right font-600">${r.amt}</td>
                <td>${r.mgr}</td>
                <td><span class="badge badge-${r.sc}">${r.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('견적서 PDF 다운로드')">PDF</button>
                    ${r.status==='견적확정'?`<button class="btn btn-primary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('수주로 전환: ${r.no}')">→ 수주</button>`:''}
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /so-tab-1 -->

    <!-- Tab 2: 계약관리 -->
    <div id="so-tab-2" style="display:none">
      <div class="filter-bar mb-16">
        <input type="date" class="form-input" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input type="date" class="form-input" value="2026-05-31" style="width:140px">
        ${['전체','계약체결','이행중','완료','해지'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 계약번호·거래처 검색" style="flex:1;max-width:240px">
        <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('신규 계약서 등록')">+ 계약 등록</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>계약번호</th><th>거래처명</th><th>계약품목</th>
              <th>계약일</th><th>계약만료</th><th class="td-right">계약금액</th>
              <th>결제조건</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'CT-2026-0058',client:'삼성물산',item:'DTP 인쇄 연간계약',start:'01-02',end:'12-31',amt:'₩580,000,000',pay:'월 세금계산서',status:'이행중',sc:'blue'},
                {no:'CT-2026-0057',client:'LG생활건강',item:'자수 로고 패치 공급',start:'03-01',end:'08-31',amt:'₩84,000,000',pay:'30일 후 지급',status:'이행중',sc:'blue'},
                {no:'CT-2026-0056',client:'현대백화점',item:'퀄팅 이불류 공급',start:'04-01',end:'09-30',amt:'₩51,600,000',pay:'선금 30% + 잔금',status:'이행중',sc:'blue'},
                {no:'CT-2026-0055',client:'롯데쇼핑',item:'원단 프린트 분기계약',start:'02-01',end:'04-30',amt:'₩97,500,000',pay:'분기 일시 납부',status:'완료',sc:'green'},
                {no:'CT-2026-0054',client:'신세계인터내셔날',item:'DTP 특수소재 인쇄',start:'01-15',end:'03-14',amt:'₩42,000,000',pay:'납품 후 30일',status:'완료',sc:'green'},
              ].map(r=>`
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee;cursor:pointer">${r.no}</td>
                <td style="font-weight:500">${r.client}</td>
                <td style="font-size:13px">${r.item}</td>
                <td style="font-size:12.5px">2026-${r.start}</td>
                <td style="font-size:12.5px">2026-${r.end}</td>
                <td class="td-right font-600">${r.amt}</td>
                <td style="font-size:12.5px;color:#9ba8c0">${r.pay}</td>
                <td><span class="badge badge-${r.sc}">${r.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('계약서 다운로드')">계약서</button>
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('이행현황 보기')">이행현황</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /so-tab-2 -->

    <!-- Tab 3: 납품현황 -->
    <div id="so-tab-3" style="display:none">
      <div class="stat-grid mb-16">
        ${[['이달 납품','38건','#4361ee'],['납품완료','29건','#10b981'],['납품지연','3건','#ef4444'],['납품예정(금주)','6건','#f59e0b']].map(([l,v,c])=>`
        <div class="stat-card">
          <div class="stat-label">${l}</div>
          <div class="stat-value sm" style="color:${c}">${v}</div>
        </div>`).join('')}
      </div>
      <div class="filter-bar mb-16">
        <input type="date" class="form-input" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input type="date" class="form-input" value="2026-05-31" style="width:140px">
        ${['전체','납품대기','납품중','납품완료','반품'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 수주번호·거래처 검색" style="flex:1;max-width:220px">
        <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('납품현황')">CSV ↓</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>수주번호</th><th>거래처명</th><th>납품품목</th>
              <th class="td-right">납품수량</th><th>예정일</th><th>실제납품일</th>
              <th>납품지</th><th>운송방법</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'SO-2026-0091',client:'삼성물산',item:'DTP 카탈로그 인쇄물',qty:'80,000장',plan:'05-22',actual:'-',addr:'서울 강남',ship:'택배',status:'납품중',sc:'blue'},
                {no:'SO-2026-0090',client:'LG생활건강',item:'자수 로고 패치',qty:'3,000ea',plan:'05-20',actual:'05-20',addr:'경기 오산',ship:'직납',status:'납품완료',sc:'green'},
                {no:'SO-2026-0089',client:'현대백화점',item:'퀄팅 이불커버',qty:'300ea',plan:'05-28',actual:'-',addr:'서울 신촌',ship:'화물',status:'납품대기',sc:'gray'},
                {no:'SO-2026-0088',client:'코오롱인더',item:'기능성 퀄팅 원단',qty:'500m',plan:'05-18',actual:'05-19',addr:'경기 이천',ship:'화물',status:'납품완료',sc:'green'},
                {no:'SO-2026-0087',client:'롯데쇼핑',item:'자수 엠블럼 패치',qty:'2,000ea',plan:'05-15',actual:'05-16',addr:'서울 잠실',ship:'택배',status:'납품완료',sc:'green'},
                {no:'SO-2026-0085',client:'ABC패션',item:'DTP 패턴 원단',qty:'200m',plan:'05-12',actual:'-',addr:'대구 동성로',ship:'화물',status:'지연',sc:'red'},
              ].map(r=>`
              <tr style="${r.status==='지연'?'background:#fff5f5':r.status==='납품완료'?'':''}">
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee;cursor:pointer">${r.no}</td>
                <td style="font-weight:500">${r.client}</td>
                <td>${r.item}</td>
                <td class="td-right">${r.qty}</td>
                <td style="font-size:12.5px">2026-${r.plan}</td>
                <td style="font-size:12.5px;color:${r.actual==='-'?'#9ba8c0':'inherit'}">${r.actual==='-'?'—':'2026-'+r.actual}</td>
                <td style="font-size:12.5px">${r.addr}</td>
                <td style="font-size:12.5px">${r.ship}</td>
                <td><span class="badge badge-${r.sc}">${r.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('거래명세서 출력')">명세서</button>
                    ${r.status!=='납품완료'?`<button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('납품처리: ${r.no}')">납품처리</button>`:''}
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /so-tab-3 -->`;
  },

  /* ══════════════════════════════════
     수주 상세
  ══════════════════════════════════ */
  'sales-order-detail'() {
    const d = window.ARAM_DATA.orderDetail;
    const fileIcon = t => ({'pdf':'🔴','ai':'🟠','xlsx':'🟢'})[t]||'📄';
    return `
    <div class="detail-layout">
      <div class="detail-main">
        <!-- Header Card -->
        <div class="detail-header-card">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:12px;color:#9ba8c0;margin-bottom:6px">수주번호</div>
              <div class="order-num">
                ${d.no}
                <span class="badge badge-solid-blue">${d.status}</span>
              </div>
            </div>
            <div class="detail-actions">
              <button class="btn btn-secondary btn-sm" onclick="printPage('.detail-layout')">🖨 출력</button>
              <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('수주 복제 기능은 준비 중입니다.')">⎘ 복제</button>
              <button class="btn btn-secondary btn-sm" style="color:#ef4444;border-color:#fecaca" onclick="if(window.ARAM_UI) ARAM_UI.Modal.open({title:'수주 취소',body:'<p style=\'text-align:center;padding:8px 0;color:#525f7f;font-size:14px\'>수주 <strong>'+window.ARAM_DATA.orderDetail.no+'</strong>를<br>취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>',size:\'sm\',footer:[{label:\'닫기\',type:\'secondary\',onClick:c=>c()},{label:\'수주 취소\',type:\'danger\',onClick:c=>{c();ARAM_UI.Toast.error(\'수주가 취소되었습니다.\')}}]})">✕ 취소</button>
              <button class="btn btn-primary btn-sm">✏ 수정</button>
            </div>
          </div>
          <div class="detail-meta">
            <div class="meta-field"><label>거래처</label><span>${d.client}</span></div>
            <div class="meta-field"><label>납기일</label><span>${d.due}</span></div>
            <div class="meta-field"><label>사업자번호</label><span>${d.bizNo}</span></div>
            <div class="meta-field"><label>결제조건</label><span>${d.payment}</span></div>
            <div class="meta-field"><label>담당자</label><span style="font-size:12.5px">${d.mgr}</span></div>
            <div class="meta-field"><label>배송지</label><span style="font-size:12.5px">${d.address}</span></div>
          </div>
        </div>

        <!-- Tabs + Content -->
        <div class="card">
          <div style="padding:0 20px">
            <div class="tab-bar">
              ${['기본정보','품목','생산현황','첨부파일','이력'].map((t,i)=>`
              <div class="tab${i===0?' active':''}" onclick="switchTab(this,'detail-tab-${i}')">${t}</div>`).join('')}
            </div>
          </div>
          <div id="detail-tab-0" class="card-body">
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th>품목코드</th><th>품목명</th><th>규격</th>
                  <th>수량</th><th>단가</th><th class="td-right">금액</th><th>비고</th>
                </tr></thead>
                <tbody>
                  ${d.items.map(i=>`
                  <tr>
                    <td style="font-family:monospace;font-size:12.5px;color:#6b7a99">${i.code}</td>
                    <td style="font-weight:500">${i.name}</td>
                    <td style="font-size:12.5px;color:#6b7a99">${i.spec}</td>
                    <td>${i.qty}</td>
                    <td>${i.price}</td>
                    <td class="td-right font-600">${i.amount}</td>
                    <td style="color:#9ba8c0">${i.note}</td>
                  </tr>`).join('')}
                  <tr style="background:#f8f9fc">
                    <td colspan="5" style="text-align:right;font-weight:600;padding-right:20px">합계</td>
                    <td class="td-right font-700" style="font-size:16px;color:#4361ee">${d.total}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div id="detail-tab-1" style="display:none" class="card-body">
            <div class="table-wrap">
              <table>
                <thead><tr><th>품목코드</th><th>품목명</th><th>규격/색상</th><th>수량</th><th>단가</th><th class="td-right">금액</th><th>납기</th><th>상태</th></tr></thead>
                <tbody>
                  ${d.items.map((i,idx)=>`
                  <tr>
                    <td style="font-family:monospace;font-size:12.5px;color:#6b7a99">${i.code}</td>
                    <td style="font-weight:500">${i.name}</td>
                    <td style="font-size:12.5px;color:#6b7a99">${i.spec}</td>
                    <td>${i.qty}</td>
                    <td>${i.price}</td>
                    <td class="td-right font-600">${i.amount}</td>
                    <td style="font-size:12.5px;color:#9ba8c0">${d.due}</td>
                    <td><span class="badge badge-solid-blue">생산대기</span></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div id="detail-tab-2" style="display:none" class="card-body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
              ${[['수주수량','15,000m','🎯'],['생산완료','9,750m','✅'],['진행률','65%','📊'],['불량수량','0m','✨'],['납기','${d.due}','📅'],['담당','김생산','👤']].map(([l,v,i])=>`
              <div style="background:#f8f9fc;border-radius:10px;padding:14px;text-align:center">
                <div style="font-size:20px;margin-bottom:6px">${i}</div>
                <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:4px">${l}</div>
                <div style="font-size:16px;font-weight:700;color:#1a2035">${v}</div>
              </div>`).join('')}
            </div>
            <div class="progress-bar" style="height:12px;border-radius:6px;margin-bottom:8px">
              <div class="progress-fill" style="width:65%;border-radius:6px;background:linear-gradient(90deg,#4361ee,#8b5cf6)"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#9ba8c0">
              <span>0%</span><span style="color:#4361ee;font-weight:600">65% 완료</span><span>100%</span>
            </div>
          </div>
          <div id="detail-tab-3" style="display:none" class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span style="font-size:13.5px;color:#1a2035;font-weight:600">첨부파일 (${d.attachments.length})</span>
              <button class="btn btn-secondary btn-sm">+ 파일 추가</button>
            </div>
            ${d.attachments.map(a=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1.5px solid #f0f1f5;border-radius:8px;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">${({'pdf':'🔴','ai':'🟠','xlsx':'🟢'}[a.type]||'📄')}</span>
                <div>
                  <div style="font-size:13.5px;font-weight:500">${a.name}</div>
                  <div style="font-size:11.5px;color:#9ba8c0">${a.size} · 업로드 ${d.date || '2026-05-18'}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-secondary btn-sm">미리보기</button>
                <button class="btn btn-secondary btn-sm">⬇ 다운</button>
              </div>
            </div>`).join('')}
          </div>
          <div id="detail-tab-4" style="display:none" class="card-body">
            <div style="font-size:13.5px;color:#9ba8c0;margin-bottom:12px">수주 등록부터 현재까지 변경 이력</div>
            ${[
              {date:'2026-05-24 14:22',user:'김영업',action:'상태 변경','detail':'생산중 → 진행중','color':'#4361ee'},
              {date:'2026-05-22 10:15',user:'박생산',action:'생산지시','detail':'WO-DTP-2026-0234 작업지시 발행','color':'#10b981'},
              {date:'2026-05-20 09:33',user:'이수진',action:'수주 확인','detail':'납기 및 수량 검토 완료','color':'#8b5cf6'},
              {date:'2026-05-18 16:41',user:'김영업',action:'수주 등록','detail':'ORD-2026-0871 신규 등록','color':'#f59e0b'},
            ].map(h=>`
            <div style="display:flex;gap:14px;padding:10px 0;border-bottom:1px solid #f2f4f8">
              <div style="font-size:12px;color:#9ba8c0;width:140px;flex-shrink:0">${h.date}</div>
              <div style="width:6px;height:6px;border-radius:50%;background:${h.color};margin-top:5px;flex-shrink:0"></div>
              <div>
                <div style="font-size:13.5px;font-weight:500">${h.action} <span style="font-weight:400;color:#9ba8c0">— ${h.user}</span></div>
                <div style="font-size:12.5px;color:#6b7a99;margin-top:2px">${h.detail}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Comments -->
        <div class="card mt-16">
          <div class="card-header"><span class="card-title">댓글</span></div>
          <div class="card-body">
            <div style="display:flex;gap:12px;margin-bottom:16px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0">김</div>
              <div style="flex:1;display:flex;gap:8px">
                <input class="form-input" style="flex:1;height:40px" placeholder="댓글을 입력하세요...">
                <button class="btn btn-primary">등록</button>
              </div>
            </div>
            ${d.comments.map(c=>`
            <div style="display:flex;gap:12px;margin-bottom:16px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0">${c.name[0]}</div>
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <span style="font-size:13.5px;font-weight:600">${c.name}</span>
                  ${c.title?`<span class="badge badge-blue" style="font-size:11px;padding:1px 7px">${c.title}</span>`:''}
                  <span style="font-size:12px;color:#9ba8c0;margin-left:auto">${c.date}</span>
                </div>
                <div style="font-size:13.5px;color:#525f7f;line-height:1.6">${c.text}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Right Side Panel -->
      <div class="detail-side">
        <!-- Timeline -->
        <div class="card mb-16">
          <div class="card-header"><span class="card-title">진행 상황</span></div>
          <div class="card-body">
            <div class="timeline">
              ${d.timeline.map((t,i)=>{
                const cls = t.done?'done':t.active?'active-step':'';
                const icon = t.done?'✓':t.active?'●':(i+1);
                return `
                <div class="timeline-item ${cls}">
                  <div class="tl-dot">${icon}</div>
                  <div class="tl-content">
                    <div class="tl-title">${t.label}${t.active?`<span class="tl-tag">진행중</span>`:''}${t.pending?`<span style="color:#9ba8c0;font-size:12px;margin-left:6px">대기</span>`:''}</div>
                    ${t.date?`<div class="tl-date">${t.date}</div>`:''}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="card">
          <div class="card-header"><span class="card-title">첨부파일</span></div>
          <div class="card-body">
            ${d.attachments.map(a=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f2f4f8">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:20px">${fileIcon(a.type)}</span>
                <div>
                  <div style="font-size:13px;font-weight:500">${a.name}</div>
                  <div style="font-size:11.5px;color:#9ba8c0">${a.size}</div>
                </div>
              </div>
              <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:16px">⬇</button>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },

  /* ══════════════════════════════════
     DTP 작업지시 상세
  ══════════════════════════════════ */
  'production-dtp'() {
    return `
    <div class="page-header">
      <div class="flex-between">
        <div class="page-title">DTP 생산관리</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('작업지시서를 출력합니다.')">작업지시서 출력</button>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('신규 작업지시 기능은 준비 중입니다.')">+ 신규 작업지시</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${[
        ['진행중 작업','12건','이번달 총 54건','🔄','#4361ee'],
        ['오늘 완료','8건','목표 대비 92%','✅','#10b981'],
        ['납기 임박','3건','3일 이내','⏰','#ef4444'],
        ['장비 가동율','94%','인쇄기 5대 중 4.7대','🖨','#8b5cf6'],
      ].map(([l,v,s,i,c])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:46px;height:46px;border-radius:12px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:22px">${i}</div>
        <div>
          <div class="stat-label">${l}</div>
          <div class="stat-value">${v}</div>
          <div style="font-size:11.5px;color:#9ba8c0">${s}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- 탭 바 -->
    <div class="tab-bar" style="margin-bottom:16px">
      <div class="tab active" onclick="switchTab(this,'prod-tab-0')">📋 작업현황</div>
      <div class="tab" onclick="switchTab(this,'prod-tab-1')">📄 작업지시 목록</div>
      <div class="tab" onclick="switchTab(this,'prod-tab-2')">🗂 칸반 보드</div>
      <div class="tab" onclick="switchTab(this,'prod-tab-3')">🔍 품질검사</div>
    </div>

    <!-- ── 탭0: 작업현황 (기존 상세 뷰) ── -->
    <div id="prod-tab-0">
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:12px;color:#9ba8c0;margin-bottom:4px">현재 작업지시</div>
          <div style="display:flex;align-items:center;gap:14px">
            <span style="font-size:22px;font-weight:700;color:#1a2035">WO-DTP-2026-0234</span>
            <span class="badge badge-solid-blue">인쇄중</span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#9ba8c0">전체 진행률</div>
          <div style="font-size:28px;font-weight:700;color:#4361ee">65%</div>
          <div style="width:200px;margin-top:4px">
            <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:65%"></div></div>
          </div>
          <div style="font-size:11.5px;color:#9ba8c0;margin-top:4px">등록 2026-05-15 09:21 · 담당 김기사</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:280px 1fr 260px;gap:20px">
      <!-- 인쇄 사양 -->
      <div class="card">
        <div class="card-header"><span class="card-title">📄 인쇄 사양</span></div>
        <div class="card-body" style="padding:16px">
          <table class="info-table">
            <tr><td>원단</td><td>코튼 30수</td></tr>
            <tr><td>사이즈</td><td>1500 × 2000 mm</td></tr>
            <tr><td>컬러</td><td>CMYK 8도</td></tr>
            <tr><td>해상도</td><td>720 dpi</td></tr>
            <tr><td>수량</td><td>500 장</td></tr>
            <tr><td>인쇄방식</td><td>디지털전사</td></tr>
            <tr><td>후가공</td><td>칼선 / 봉제</td></tr>
            <tr><td>납기</td><td style="color:#ef4444;font-weight:600">2026-05-25</td></tr>
          </table>
        </div>
      </div>

      <!-- 디자인 시안 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🖼 디자인 시안</span>
          <button class="btn btn-secondary btn-sm">원본 다운로드 ⬇</button>
        </div>
        <div class="card-body" style="padding:16px">
          <div style="height:260px;background:linear-gradient(135deg,#f8e8e0 0%,#e8d4c8 25%,#d4c8e8 50%,#c8d8d0 75%,#e0d4e0 100%);border-radius:10px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
            <svg viewBox="0 0 400 260" style="width:100%;height:100%;position:absolute;top:0;left:0">
              <ellipse cx="80" cy="80" rx="50" ry="60" fill="#d4a8b8" opacity="0.6"/>
              <ellipse cx="200" cy="60" rx="40" ry="50" fill="#a8c4d4" opacity="0.6"/>
              <ellipse cx="320" cy="90" rx="55" ry="65" fill="#c4d4a8" opacity="0.6"/>
              <ellipse cx="140" cy="180" rx="45" ry="55" fill="#d4c4a8" opacity="0.6"/>
              <ellipse cx="280" cy="190" rx="50" ry="60" fill="#b8a8d4" opacity="0.6"/>
              <text x="200" y="140" text-anchor="middle" font-size="14" fill="#8896a4" opacity="0.7">디자인 시안 미리보기</text>
            </svg>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            ${['linear-gradient(135deg,#f0c8b0,#e0a890)','linear-gradient(135deg,#b0c8f0,#90a8e0)','linear-gradient(135deg,#c8f0b0,#a8e090)','linear-gradient(135deg,#d0b0f0,#b090e0)'].map((bg,i)=>`
            <div style="width:72px;height:72px;border-radius:8px;background:${bg};border:${i===0?'2.5px solid #4361ee':'1.5px solid #e5e9f2'};cursor:pointer;overflow:hidden;flex-shrink:0"></div>`).join('')}
          </div>
        </div>
      </div>

      <!-- 공정 진행 -->
      <div class="card">
        <div class="card-header"><span class="card-title">공정 진행</span></div>
        <div class="card-body">
          <div class="timeline">
            ${[
              {label:'디자인확정',date:'2026-05-15 09:30',person:'김기사',done:true},
              {label:'색상승인',date:'2026-05-15 10:15',person:'최대리',done:true},
              {label:'인쇄',date:'2026-05-16 14:20',person:'정기사',done:true},
              {label:'후가공',date:'2026-05-17 11:05',person:'박기사',active:true,pct:65},
              {label:'검수',date:'예정 2026-05-18',pending:true},
              {label:'포장',date:'예정 2026-05-19',pending:true},
              {label:'출하',date:'예정 2026-05-20',pending:true},
            ].map((s,i)=>`
            <div class="timeline-item ${s.done?'done':s.active?'active-step':''}">
              <div class="tl-dot">${s.done?'✓':s.active?'●':(i+1)}</div>
              <div class="tl-content">
                <div class="tl-title">${s.label}${s.active?` <span class="tl-tag">(진행중)</span>`:''}</div>
                <div class="tl-date">${s.date}${s.person?` · ${s.person}`:''}</div>
                ${s.pct?`<div style="margin-top:4px"><div class="progress-bar"><div class="progress-fill" style="width:${s.pct}%"></div></div><span style="font-size:11px;color:#4361ee">◎${s.pct}%</span></div>`:''}
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px">
      <!-- 결재 라인 -->
      <div class="card">
        <div class="card-header"><span class="card-title">결재 라인</span></div>
        <div class="card-body">
          <div class="approval-flow" style="justify-content:space-around">
            ${[{name:'김기사',title:'담당',role:'생산팀/기사',ok:true},{name:'박과장',title:'팀장',role:'생산팀/과장',ok:true},{name:'이부장',title:'부장',role:'생산팀/부장',ok:true}].map((a,i,arr)=>`
            <div class="approval-step">
              <div class="approval-avatar" style="background:linear-gradient(135deg,#4361ee,#8b5cf6)">${a.name[0]}</div>
              <div class="approval-name">${a.name}</div>
              <div class="approval-title">${a.role}</div>
              <span class="approval-status" style="background:#ecfdf5;color:#059669">✓ 승인</span>
            </div>
            ${i<arr.length-1?'<div class="arrow-between">→</div>':''}`).join('')}
          </div>
        </div>
      </div>
      <!-- 작업 메모 -->
      <div class="card">
        <div class="card-header"><span class="card-title">작업 메모</span></div>
        <div class="card-body">
          <textarea style="width:100%;height:110px;border:1.5px solid #e5e9f2;border-radius:8px;padding:10px;font-size:13px;resize:none;font-family:inherit;color:#525f7f;line-height:1.6">원단 특성상 온도 195℃ 기준으로 전사 진행 바랍니다.
후가공 칼선은 외곽 3mm 여백 유지 필수.
봉제 시 패턴 정렬 확인 후 작업 요청드립니다.</textarea>
          <div style="text-align:right;font-size:12px;color:#9ba8c0;margin-top:4px">120 / 500</div>
        </div>
      </div>
      <!-- 자재 사용량 -->
      <div class="card">
        <div class="card-header"><span class="card-title">자재 사용량</span></div>
        <div class="card-body" style="padding:12px 16px">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="border-bottom:1.5px solid #e5e9f2">
              <th style="text-align:left;padding:6px 0;color:#9ba8c0;font-weight:600">자재</th>
              <th style="text-align:right;color:#9ba8c0;font-weight:600">사용량</th>
              <th style="text-align:right;color:#9ba8c0;font-weight:600">단위</th>
              <th style="text-align:right;color:#9ba8c0;font-weight:600">사용률</th>
            </tr></thead>
            <tbody>
              ${[['잉크 (Cyan)','#06b6d4',320,'g',64],['잉크 (Magenta)','#ec4899',300,'g',60],['잉크 (Yellow)','#f59e0b',280,'g',56],['잉크 (Black)','#1a2035',350,'g',70]].map(([name,color,use,unit,pct])=>`
              <tr style="border-bottom:1px solid #f2f4f8">
                <td style="padding:8px 0;display:flex;align-items:center;gap:8px">
                  <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>${name}
                </td>
                <td style="text-align:right;padding:8px 0">${use}</td>
                <td style="text-align:right;padding:8px 0;color:#9ba8c0">${unit}</td>
                <td style="text-align:right;padding:8px 0">
                  <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
                    <div style="width:60px;height:5px;background:#e5e9f2;border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${color};border-radius:3px"></div></div>
                    <span style="font-size:12px;font-weight:600;color:${color}">${pct}%</span>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div><!-- /prod-tab-0 -->

    <!-- ── 탭1: 작업지시 목록 ── -->
    <div id="prod-tab-1" style="display:none">
      <div class="filter-bar" style="margin-bottom:16px">
        <span class="filter-label">기간</span>
        <div class="date-range">
          <input class="form-input" type="date" value="2026-05-01">
          <span style="color:#9ba8c0">~</span>
          <input class="form-input" type="date" value="2026-05-20">
        </div>
        <span class="filter-label">상태</span>
        ${['전체','대기','진행중','완료','보류'].map((s,i)=>`
        <span style="padding:4px 12px;border-radius:4px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'transparent'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'transparent'}">${s}</span>`).join('')}
        <div class="filter-actions">
          <input class="form-input" placeholder="작업지시번호, 수주번호 검색" style="width:220px">
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('DTP작업지시')">CSV ↓</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th class="checkbox-cell"><input type="checkbox"></th>
              <th>작업지시번호</th><th>연결 수주</th><th>품목명</th>
              <th>담당자</th><th class="td-right">수량</th>
              <th>시작일</th><th>완료예정일</th>
              <th class="td-center">진행률</th><th class="td-center">상태</th>
              <th class="td-center">액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'WO-DTP-2026-0234',so:'SO-2026-0892',name:'플로랄 패턴 면 원단',user:'김기사',qty:'500',start:'05-15',due:'05-25',pct:65,status:'진행중'},
                {no:'WO-DTP-2026-0233',so:'SO-2026-0891',name:'체크 패턴 폴리 원단',user:'이기사',qty:'800',start:'05-14',due:'05-23',pct:100,status:'완료'},
                {no:'WO-DTP-2026-0232',so:'SO-2026-0888',name:'스트라이프 TC 원단',user:'박기사',qty:'350',start:'05-13',due:'05-22',pct:100,status:'완료'},
                {no:'WO-DTP-2026-0231',so:'SO-2026-0885',name:'솔리드 코튼 원단',user:'최기사',qty:'1200',start:'05-20',due:'05-28',pct:0,status:'대기'},
                {no:'WO-DTP-2026-0230',so:'SO-2026-0883',name:'지오메트릭 린넨',user:'정기사',qty:'420',start:'05-19',due:'05-27',pct:30,status:'진행중'},
                {no:'WO-DTP-2026-0229',so:'SO-2026-0880',name:'추상화 패턴 실크',user:'김기사',qty:'200',start:'05-18',due:'05-26',pct:80,status:'진행중'},
                {no:'WO-DTP-2026-0228',so:'SO-2026-0876',name:'나뭇잎 패턴 폴리',user:'이기사',qty:'650',start:'05-17',due:'05-24',pct:100,status:'완료'},
                {no:'WO-DTP-2026-0227',so:'SO-2026-0872',name:'도트 패턴 면',user:'박기사',qty:'900',start:'05-16',due:'05-23',pct:0,status:'보류'},
              ].map(r=>`
              <tr style="cursor:pointer" onmouseover="this.style.background='var(--primary-lt)'" onmouseout="this.style.background=''">
                <td class="checkbox-cell"><input type="checkbox" onclick="event.stopPropagation()"></td>
                <td class="td-link" style="font-family:monospace;font-size:12.5px">${r.no}</td>
                <td style="font-size:12.5px;color:#4361ee">${r.so}</td>
                <td style="font-weight:500">${r.name}</td>
                <td style="font-size:13px">${r.user}</td>
                <td class="td-right">${r.qty}m</td>
                <td style="font-size:12.5px;color:#9ba8c0">2026.${r.start}</td>
                <td style="font-size:12.5px;color:${r.status==='보류'?'#ef4444':'#9ba8c0'}">2026.${r.due}</td>
                <td style="padding:8px 12px">
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="flex:1;height:5px;background:#f2f4f8;border-radius:3px;overflow:hidden">
                      <div style="height:100%;width:${r.pct}%;background:${r.pct===100?'#10b981':'#4361ee'};border-radius:3px"></div>
                    </div>
                    <span style="font-size:12px;font-weight:600;min-width:28px">${r.pct}%</span>
                  </div>
                </td>
                <td class="td-center">
                  <span class="badge ${r.status==='완료'?'badge-solid-green':r.status==='진행중'?'badge-solid-blue':r.status==='보류'?'badge-err':'badge-gray'}">${r.status}</span>
                </td>
                <td class="td-center">
                  <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:18px"
                    onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('작업지시서 상세는 준비 중입니다.')">⋯</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-info">전체 54건</span>
          <div class="page-nums">${[1,2,3].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
        </div>
      </div>
    </div><!-- /prod-tab-1 -->

    <!-- ── 탭2: 칸반 보드 ── -->
    <div id="prod-tab-2" style="display:none">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;overflow-x:auto;min-width:900px">
        ${[
          {title:'대기',color:'#9ba8c0',bg:'#f8f9fc',cards:[
            {no:'WO-DTP-2026-0231',name:'솔리드 코튼 원단',qty:'1,200m',due:'05-28',user:'최기사'},
            {no:'WO-DTP-2026-0225',name:'타탄 체크 면',qty:'600m',due:'05-30',user:'이기사'},
          ]},
          {title:'디자인확정',color:'#8b5cf6',bg:'#f5f3ff',cards:[
            {no:'WO-DTP-2026-0226',name:'꽃무늬 린넨',qty:'450m',due:'05-27',user:'정기사'},
          ]},
          {title:'인쇄중',color:'#4361ee',bg:'#eff2ff',cards:[
            {no:'WO-DTP-2026-0234',name:'플로랄 패턴 면',qty:'500m',due:'05-25',user:'김기사'},
            {no:'WO-DTP-2026-0230',name:'지오메트릭 린넨',qty:'420m',due:'05-27',user:'정기사'},
            {no:'WO-DTP-2026-0229',name:'추상화 실크',qty:'200m',due:'05-26',user:'김기사'},
          ]},
          {title:'후가공',color:'#f59e0b',bg:'#fffbeb',cards:[
            {no:'WO-DTP-2026-0235',name:'레오파드 폴리',qty:'780m',due:'05-24',user:'박기사'},
          ]},
          {title:'완료',color:'#10b981',bg:'#ecfdf5',cards:[
            {no:'WO-DTP-2026-0233',name:'체크 폴리 원단',qty:'800m',due:'05-23',user:'이기사'},
            {no:'WO-DTP-2026-0232',name:'스트라이프 TC',qty:'350m',due:'05-22',user:'박기사'},
            {no:'WO-DTP-2026-0228',name:'나뭇잎 폴리',qty:'650m',due:'05-24',user:'이기사'},
          ]},
        ].map(col=>`
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 4px">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:10px;height:10px;border-radius:50%;background:${col.color}"></div>
              <span style="font-size:13px;font-weight:600;color:#1a2035">${col.title}</span>
            </div>
            <span style="background:${col.color}20;color:${col.color};border-radius:10px;font-size:11px;padding:1px 8px;font-weight:600">${col.cards.length}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;min-height:100px">
            ${col.cards.map(c=>`
            <div style="background:var(--card);border:1.5px solid var(--bdr);border-left:4px solid ${col.color};border-radius:8px;padding:10px 12px;cursor:pointer;transition:.15s" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'" onmouseout="this.style.boxShadow=''">
              <div style="font-size:11.5px;color:${col.color};font-family:monospace;margin-bottom:4px">${c.no}</div>
              <div style="font-size:13px;font-weight:600;color:#1a2035;margin-bottom:6px;line-height:1.3">${c.name}</div>
              <div style="display:flex;justify-content:space-between;font-size:11.5px;color:#9ba8c0">
                <span>📏 ${c.qty}</span>
                <span>👤 ${c.user}</span>
              </div>
              <div style="font-size:11px;color:#9ba8c0;margin-top:4px">납기: 2026.${c.due}</div>
            </div>`).join('')}
            <div style="border:2px dashed #e5e9f2;border-radius:8px;padding:12px;text-align:center;color:#9ba8c0;font-size:12px;cursor:pointer" onmouseover="this.style.borderColor='#4361ee';this.style.color='#4361ee'" onmouseout="this.style.borderColor='#e5e9f2';this.style.color='#9ba8c0'">+ 추가</div>
          </div>
        </div>`).join('')}
      </div>
    </div><!-- /prod-tab-2 -->

    <!-- ── 탭3: 품질검사 ── -->
    <div id="prod-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

        <!-- 검사 체크리스트 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">품질 검사표 — WO-DTP-2026-0234</span>
            <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('검사 결과가 저장되었습니다.')">검사 완료</button>
          </div>
          <div class="card-body">
            <div style="margin-bottom:14px;padding:10px 12px;background:#eff2ff;border-radius:8px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;font-weight:500">검사 진행률</span>
              <span style="font-size:16px;font-weight:700;color:#4361ee">7/10 완료</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                {label:'원단 색상 일치 여부',spec:'CMYK 기준 ΔE < 3',result:'합격',ok:true},
                {label:'인쇄 선명도',spec:'720 dpi 이상',result:'합격',ok:true},
                {label:'색상 균일도',spec:'표면 전체 균일',result:'합격',ok:true},
                {label:'번짐 (블리딩) 여부',spec:'없음',result:'합격',ok:true},
                {label:'원단 손상 여부',spec:'손상 없음',result:'합격',ok:true},
                {label:'후가공 칼선 정확도',spec:'±0.5mm 이내',result:'검사중',ok:null},
                {label:'봉제 패턴 정렬',spec:'5mm 이내 오차',result:'검사중',ok:null},
                {label:'수축률 검사',spec:'3% 미만',result:'미검사',ok:null},
                {label:'내광성 테스트',spec:'광시험 4급 이상',result:'미검사',ok:null},
                {label:'포장 상태 확인',spec:'손상 없음, 라벨 부착',result:'미검사',ok:null},
              ].map(item=>`
              <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #f2f4f8;border-radius:6px">
                <div style="width:22px;height:22px;border-radius:50%;background:${item.ok===true?'#ecfdf5':item.ok===false?'#fef2f2':'#f2f4f8'};display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">${item.ok===true?'✓':item.ok===false?'✗':'○'}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:500;color:#1a2035">${item.label}</div>
                  <div style="font-size:11.5px;color:#9ba8c0">${item.spec}</div>
                </div>
                <span style="font-size:12px;font-weight:500;color:${item.ok===true?'#059669':item.ok===false?'#ef4444':'#9ba8c0'};white-space:nowrap">${item.result}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- 검사 이력 + 불량 현황 -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-header"><span class="card-title">최근 검사 이력</span></div>
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th>작업번호</th><th>품목명</th><th class="td-center">결과</th><th>검사일</th><th>검사자</th>
                </tr></thead>
                <tbody>
                  ${[
                    {no:'WO-DTP-0233',name:'체크 폴리 원단',ok:true,date:'05-23',user:'품질1팀'},
                    {no:'WO-DTP-0232',name:'스트라이프 TC',ok:true,date:'05-22',user:'품질1팀'},
                    {no:'WO-DTP-0231',name:'꽃무늬 면 원단',ok:false,date:'05-21',user:'품질2팀'},
                    {no:'WO-DTP-0230',name:'그라데이션 폴리',ok:true,date:'05-20',user:'품질1팀'},
                    {no:'WO-DTP-0229',name:'도트 패턴 면',ok:true,date:'05-19',user:'품질2팀'},
                  ].map(r=>`
                  <tr>
                    <td style="font-size:12.5px;color:#4361ee">${r.no}</td>
                    <td style="font-weight:500;font-size:13px">${r.name}</td>
                    <td class="td-center"><span class="badge ${r.ok?'badge-solid-green':'badge-err'}">${r.ok?'합격':'불합격'}</span></td>
                    <td style="font-size:12px;color:#9ba8c0">2026.${r.date}</td>
                    <td style="font-size:12.5px">${r.user}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">불량 유형 분석 (이번달)</span></div>
            <div class="card-body" style="padding:14px 16px">
              ${[
                ['색상 오차','#ef4444',38],['번짐','#f59e0b',24],['선명도 미달','#8b5cf6',18],['원단 손상','#4361ee',12],['기타','#9ba8c0',8],
              ].map(([l,c,p])=>`
              <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                  <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:${c}"></span>${l}</span>
                  <span style="font-weight:600">${p}%</span>
                </div>
                <div class="progress-bar" style="height:7px"><div class="progress-fill" style="width:${p}%;background:${c}"></div></div>
              </div>`).join('')}
              <div style="margin-top:12px;padding:10px;background:#fef2f2;border-radius:8px;display:flex;justify-content:space-between;font-size:13px">
                <span style="color:#ef4444">이번달 불합격률</span>
                <span style="font-weight:700;color:#ef4444">3.2%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div><!-- /prod-tab-3 -->`;
  },

  /* ══════════════════════════════════
     자수 작업지시
  ══════════════════════════════════ */
  'production-emb'() {
    const machines = [
      {id:'TMEZ-01', status:'가동중', sc:'ok',   pct:78, today:'612 / 780 ea',  wo:'WO-EMB-2026-0156'},
      {id:'TMEZ-02', status:'대기',   sc:'gray', pct:0,  today:'0 / 0 ea',      wo:'-'},
      {id:'TMEZ-03', status:'가동중', sc:'ok',   pct:45, today:'432 / 960 ea',  wo:'WO-EMB-2026-0156'},
      {id:'TMEZ-04', status:'점검',   sc:'warn', pct:0,  today:'0 / 0 ea',      wo:'-'},
    ];
    const threads = [
      {seq:1, code:'DMC-310',  brand:'DMC', color:'#1a1a1a', name:'310 Black',            use:1850, yd:0.62, outline:true},
      {seq:2, code:'DMC-321',  brand:'DMC', color:'#1e3a8a', name:'321 Navy Blue',         use:2560, yd:0.85, outline:false},
      {seq:3, code:'DMC-3752', brand:'DMC', color:'#0c7a6e', name:'3752 Peacock Blue',     use:1720, yd:0.57, outline:false},
      {seq:4, code:'DMC-3812', brand:'DMC', color:'#14b8a6', name:'3812 Sea Green',        use:2380, yd:0.79, outline:false},
      {seq:5, code:'DMC-3852', brand:'DMC', color:'#a0d4d0', name:'3852 Light Sea Green',  use:1450, yd:0.48, outline:false},
      {seq:6, code:'DMC-5200', brand:'DMC', color:'#f0f0f0', name:'5200 White',            use:1980, yd:0.66, outline:true},
      {seq:7, code:'DMC-817',  brand:'DMC', color:'#9ba8c0', name:'817 Coral Red',         use:980,  yd:0.33, outline:false},
      {seq:8, code:'DMC-3740', brand:'DMC', color:'#c4b5fd', name:'3740 Antique Violet',   use:860,  yd:0.29, outline:false},
    ];
    const steps = [
      {label:'도안제작',    date:'완료 2026-05-18', done:true},
      {label:'색상지정',    date:'완료 2026-05-19', done:true},
      {label:'도안승인',    date:'진행중',           active:true},
      {label:'자수기 세팅', date:'대기',             pending:true},
      {label:'자수작업',    date:'대기',             pending:true},
      {label:'검수',        date:'대기',             pending:true},
      {label:'포장',        date:'대기',             pending:true},
    ];
    const totalUse = threads.reduce((a,t)=>a+t.use,0);
    const totalYd  = threads.reduce((a,t)=>+(a+t.yd).toFixed(2),0);

    return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div style="font-size:12px;color:#9ba8c0;margin-bottom:4px">생산관리 <span style="margin:0 3px">›</span> 자수 <span style="margin:0 3px">›</span> 작업지시</div>
          <div class="page-title">자수생산관리</div>
          <div class="page-desc">EMB 라인 작업지시 현황 및 자수기 가동 관리</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="if(window._openEmbItemLink)_openEmbItemLink()">📦 품목등록 연결</button>
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('작업지시서가 인쇄됩니다.')">🖨 인쇄</button>
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('자수생산현황')">CSV ↓</button>
          <button class="btn btn-primary btn-sm" onclick="if(window._openNewEmbWO)_openNewEmbWO()">+ 작업지시</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${[
        ['진행중','8건','#4361ee','🔄'],
        ['오늘 완료','5건','#10b981','✅'],
        ['납기임박','2건','#f59e0b','⚡'],
        ['자수기 가동률','61%','#8b5cf6','⚙️'],
      ].map(([l,v,c,i])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:12px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${i}</div>
        <div>
          <div style="font-size:12px;color:#9ba8c0;margin-bottom:2px">${l}</div>
          <div style="font-size:22px;font-weight:700;color:${c}">${v}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Tabs -->
    <div class="tab-bar mb-16">
      <button class="tab-btn active" onclick="switchTab(this,'emb-tab-0')">작업현황</button>
      <button class="tab-btn" onclick="switchTab(this,'emb-tab-1')">작업지시목록</button>
      <button class="tab-btn" onclick="switchTab(this,'emb-tab-2')">칸반보드</button>
      <button class="tab-btn" onclick="switchTab(this,'emb-tab-3')">품질검사</button>
    </div>

    <!-- ── Tab 0: 작업현황 ── -->
    <div id="emb-tab-0">

    <!-- 작업지시 헤더 (스크린샷 상단과 동일) -->
    <div style="background:var(--card);border:1.5px solid var(--bdr);border-radius:12px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:12px;color:#9ba8c0;margin-bottom:6px">
          생산관리 <span style="margin:0 4px">›</span> 자수 <span style="margin:0 4px">›</span> 작업지시 <span style="margin:0 4px">›</span>
          <span style="color:#4361ee;font-weight:600">WO-EMB-2026-0156</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:17px">📋</span>
          <span style="font-size:21px;font-weight:700;color:var(--txt)">작업지시 WO-EMB-2026-0156</span>
        </div>
        <div style="font-size:12.5px;color:#9ba8c0">지시일 2026-05-20 &nbsp;·&nbsp; 납기일 2026-05-30</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('도안 승인 처리를 시작합니다.')"
          style="background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.3px">도안승인대기</button>
        <button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('추가 메뉴')"
          style="background:transparent;border:1.5px solid var(--bdr);border-radius:8px;color:#9ba8c0;font-size:18px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">⋯</button>
      </div>
    </div>

    <!-- 3단 레이아웃: 자수사양 | 도안미리보기 | 공정진행 -->
    <div style="display:grid;grid-template-columns:268px 1fr 230px;gap:14px;margin-bottom:14px">

      <!-- ① 자수 사양 -->
      <div class="card">
        <div class="card-header"><span class="card-title">자수 사양</span></div>
        <div class="card-body" style="padding:14px 16px">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            ${[
              ['원단','폴리에스터'],
              ['자수기종','Tajima TMEZ-S1501'],
              ['바늘수','15니들'],
              ['도안 사이즈','80 × 60 mm'],
              ['색상수','8도'],
              ['스티치수','24,580'],
              ['수량','1,200 ea'],
              ['단가','₩2,800'],
            ].map(([k,v])=>`
            <tr style="border-bottom:1px solid var(--bdr)">
              <td style="padding:7px 0;color:#9ba8c0;font-size:12.5px;width:42%;white-space:nowrap">${k}</td>
              <td style="padding:7px 0;font-weight:${k==='단가'?'700':'500'};color:${k==='단가'?'#4361ee':'var(--txt)'}">${v}</td>
            </tr>`).join('')}
          </table>
        </div>
      </div>

      <!-- ② 도안 미리보기 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">도안 미리보기</span>
          <button class="btn btn-secondary btn-sm" style="height:24px;font-size:11px;padding:0 10px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('도안 파일 업로드')">도안 업로드</button>
        </div>
        <div class="card-body" style="padding:14px 16px">
          <!-- AR 로고 SVG (실제 자수 도안 스타일) -->
          <div style="height:175px;background:#f5f7fa;border-radius:10px;overflow:hidden;border:1.5px solid var(--bdr);margin-bottom:12px;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 320 195" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
              <rect width="320" height="195" fill="#f5f7fa"/>
              <!-- Background subtle texture -->
              <pattern id="embPat" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <line x1="0" y1="4" x2="4" y2="0" stroke="#e8eaf0" stroke-width="0.5"/>
              </pattern>
              <rect width="320" height="195" fill="url(#embPat)"/>
              <!-- A letter - dark navy with serif style -->
              <text x="14" y="163" font-size="155" font-weight="900" fill="#1e2b4a"
                font-family="Georgia,'Times New Roman',serif" letter-spacing="-5">A</text>
              <!-- Thread texture on A -->
              <line x1="52" y1="90" x2="58" y2="72" stroke="#2a3b5a" stroke-width="1" opacity="0.25"/>
              <line x1="80" y1="90" x2="86" y2="72" stroke="#2a3b5a" stroke-width="1" opacity="0.25"/>
              <line x1="108" y1="90" x2="114" y2="72" stroke="#2a3b5a" stroke-width="1" opacity="0.25"/>
              <!-- R letter - teal/sea green -->
              <text x="162" y="148" font-size="120" font-weight="900" fill="#0c7a6e"
                font-family="Georgia,'Times New Roman',serif">R</text>
              <!-- Thread texture on R -->
              <line x1="185" y1="80" x2="191" y2="64" stroke="#0a6558" stroke-width="1" opacity="0.25"/>
              <!-- Diamond/star accent -->
              <polygon points="242,163 257,148 272,163 257,178" fill="#14b8a6"/>
              <polygon points="248,163 257,154 266,163 257,172" fill="#1dd4c0" opacity="0.6"/>
            </svg>
          </div>

          <!-- 색상 팔레트 -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:#9ba8c0">색상 팔레트 (${threads.length}도)</span>
            <button class="btn btn-secondary btn-sm" style="height:22px;font-size:10.5px;padding:0 8px"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('색상 변경 기능')">색상 변경</button>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${threads.map(t=>`
            <div style="text-align:center" title="${t.code} ${t.name}">
              <div style="width:28px;height:28px;border-radius:5px;background:${t.color};
                border:${t.outline?'2px solid #555':'1.5px solid #d1d5db'};
                cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.12);transition:transform .15s"
                onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform=''"
                onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${t.code}: ${t.name} (${t.use.toLocaleString()}m)')"></div>
              <div style="font-size:9px;color:#9ba8c0;margin-top:2px">${t.code.replace('DMC-','')}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- ③ 공정 진행 -->
      <div class="card">
        <div class="card-header"><span class="card-title">공정 진행</span></div>
        <div class="card-body" style="padding:10px 0">
          <div class="timeline">
            ${steps.map((s,i)=>`
            <div class="timeline-item ${s.done?'done':s.active?'active-step':''}">
              <div class="tl-dot">${s.done?'✓':s.active?'●':(i+1)}</div>
              <div class="tl-content">
                <div class="tl-title">${s.label}${s.active?` <span class="tl-tag">진행중</span>`:''}</div>
                <div class="tl-date">${s.date}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 2단: 자수기 가동현황 | 사용 실 종류 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">

      <!-- 자수기 가동 현황 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">자수기 가동 현황</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:#9ba8c0">기준 시각 2026-05-20 10:30</span>
            <button class="btn btn-secondary btn-sm" style="height:22px;font-size:10.5px;padding:0 8px"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('새로고침')">🔄 새로고침</button>
          </div>
        </div>
        <div class="card-body" style="padding:14px 16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${machines.map(m=>`
            <div style="background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;padding:14px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <span style="font-size:13px;font-weight:700;color:var(--txt)">${m.id}</span>
                <span style="font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:10px;
                  background:${m.sc==='ok'?'#d1fae5':m.sc==='warn'?'#fef3c7':'#f1f5f9'};
                  color:${m.sc==='ok'?'#059669':m.sc==='warn'?'#d97706':'#64748b'}">${m.status}</span>
              </div>
              <div style="font-size:11px;color:#9ba8c0;margin-bottom:3px">가동률</div>
              <div style="font-size:26px;font-weight:800;color:${m.sc==='ok'?'#4361ee':'#9ba8c0'};margin-bottom:6px">${m.pct}%</div>
              <div style="height:5px;background:var(--bdr);border-radius:10px;overflow:hidden;margin-bottom:10px">
                <div style="height:100%;width:${m.pct}%;background:${m.sc==='ok'?'linear-gradient(90deg,#4361ee,#8b5cf6)':'#e5e9f2'};border-radius:10px"></div>
              </div>
              <div style="font-size:11.5px;color:#64748b;line-height:1.9">
                <div>금일 생산 &nbsp;<strong>${m.today}</strong></div>
                <div>현재 작업 &nbsp;<span style="color:${m.sc==='ok'?'#4361ee':'#9ba8c0'};font-weight:500">${m.wo}</span></div>
              </div>
            </div>`).join('')}
          </div>
          <div style="font-size:11px;color:#9ba8c0;text-align:center;margin-top:10px">※ 가동률은 실시간 데이터 기준이며, 5분 간격으로 갱신됩니다.</div>
        </div>
      </div>

      <!-- 사용 실 종류 (1YD사용량·실순서·색상윤곽 포함) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">사용 실 종류</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="background:#eff2ff;color:#4361ee;font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px">총 ${threads.length}색</span>
            <button class="btn btn-secondary btn-sm" style="height:24px;font-size:10.5px;padding:0 8px"
              onclick="if(window._openEmbItemLink)_openEmbItemLink()">품목연결</button>
            <button class="btn btn-secondary btn-sm" style="height:24px;font-size:10.5px;padding:0 8px"
              onclick="exportTableCSV('자수실종류')">CSV ↓</button>
          </div>
        </div>
        <div class="table-wrap">
          <table style="font-size:12.5px">
            <thead>
              <tr>
                <th style="width:36px;text-align:center">No.</th>
                <th>실 코드</th>
                <th>브랜드</th>
                <th style="width:44px;text-align:center">색상 윤곽</th>
                <th>색상명</th>
                <th class="td-right" style="white-space:nowrap">1YD사용량</th>
                <th class="td-right">사용량</th>
                <th>단위</th>
              </tr>
            </thead>
            <tbody>
              ${threads.map((t,i)=>`
              <tr>
                <td style="color:#9ba8c0;text-align:center;font-size:12px">${i+1}</td>
                <td><span style="font-family:monospace;font-size:12px;font-weight:600;color:#334155">${t.code}</span></td>
                <td style="color:#64748b">${t.brand}</td>
                <td style="text-align:center">
                  <div style="display:inline-flex;align-items:center;justify-content:center;gap:3px">
                    <div style="width:20px;height:20px;border-radius:4px;background:${t.color};
                      border:${t.outline?'2px solid #374151':'1.5px solid #d1d5db'};
                      box-shadow:0 1px 3px rgba(0,0,0,.15)"
                      title="${t.code}${t.outline?' (윤곽색)':''}"></div>
                    ${t.outline?`<span style="font-size:9px;color:#ef4444;font-weight:700">윤</span>`:''}
                  </div>
                </td>
                <td style="color:#334155">${t.name}</td>
                <td class="td-right" style="color:#4361ee;font-weight:600">${t.yd}</td>
                <td class="td-right font-600">${t.use.toLocaleString()}</td>
                <td style="color:#9ba8c0">m</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg)">
                <td colspan="5" style="padding:8px 12px;font-weight:700;color:var(--txt);font-size:12px">합계</td>
                <td class="td-right" style="font-weight:700;color:#4361ee;padding:8px 12px">${totalYd}</td>
                <td class="td-right font-600" style="padding:8px 12px">${totalUse.toLocaleString()}</td>
                <td style="color:#9ba8c0;padding:8px 12px">m</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    </div><!-- /emb-tab-0 -->

    <!-- Tab 1: 작업지시목록 -->
    <div id="emb-tab-1" style="display:none">
      <div class="filter-bar mb-16">
        <input type="date" class="form-input" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input type="date" class="form-input" value="2026-05-31" style="width:140px">
        ${['전체','도안승인대기','자수중','완료','보류'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm" onclick="this.closest('.filter-bar').querySelectorAll('button').forEach(b=>b.className='btn btn-secondary btn-sm');this.className='btn btn-primary btn-sm'">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 작업번호·품목명 검색" style="flex:1;max-width:240px">
        <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('자수작업지시목록')">CSV ↓</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>작업번호</th><th>연결수주</th><th>품목명</th><th>담당자</th>
              <th class="td-right">수량</th><th>시작일</th><th>완료예정</th>
              <th style="min-width:120px">진행률</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {wo:'WO-EMB-2026-0156',so:'SO-2026-0089',item:'사명 로고 자수 (폴리)',mgr:'김자수',qty:1200,start:'05-20',end:'05-30',pct:0,status:'도안승인대기',statusC:'orange'},
                {wo:'WO-EMB-2026-0155',so:'SO-2026-0087',item:'학교 엠블럼 자수 8도',mgr:'이자수',qty:800,start:'05-18',end:'05-27',pct:35,status:'자수중',statusC:'blue'},
                {wo:'WO-EMB-2026-0154',so:'SO-2026-0085',item:'팀명 패치 자수 5도',mgr:'박자수',qty:2000,start:'05-15',end:'05-25',pct:72,status:'자수중',statusC:'blue'},
                {wo:'WO-EMB-2026-0153',so:'SO-2026-0082',item:'국기 자수 3도',mgr:'김자수',qty:500,start:'05-12',end:'05-22',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-EMB-2026-0152',so:'SO-2026-0080',item:'스포츠 브랜드 로고',mgr:'이자수',qty:3000,start:'05-10',end:'05-20',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-EMB-2026-0151',so:'SO-2026-0078',item:'기업 이니셜 자수 2도',mgr:'박자수',qty:600,start:'05-08',end:'05-18',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-EMB-2026-0150',so:'SO-2026-0076',item:'캐릭터 자수 풀컬러',mgr:'최자수',qty:400,start:'05-06',end:'05-15',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-EMB-2026-0149',so:'SO-2026-0075',item:'군부대 마크 자수',mgr:'김자수',qty:1500,start:'05-22',end:'06-05',pct:0,status:'대기',statusC:'gray'},
              ].map(r=>`
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee;cursor:pointer">${r.wo}</td>
                <td style="font-size:12px;color:#9ba8c0">${r.so}</td>
                <td style="font-weight:500">${r.item}</td>
                <td>${r.mgr}</td>
                <td class="td-right">${r.qty.toLocaleString()}</td>
                <td style="font-size:12.5px">2026-${r.start}</td>
                <td style="font-size:12.5px">2026-${r.end}</td>
                <td style="min-width:120px">
                  <div style="display:flex;align-items:center;gap:6px">
                    <div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:${r.pct}%"></div></div>
                    <span style="font-size:11px;color:#9ba8c0;width:28px">${r.pct}%</span>
                  </div>
                </td>
                <td><span class="badge badge-${r.statusC}">${r.status}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                    onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${r.wo} 상세보기')">상세</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /emb-tab-1 -->

    <!-- Tab 2: 칸반보드 -->
    <div id="emb-tab-2" style="display:none">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
        ${[
          {col:'대기',color:'#9ba8c0',dot:'#9ba8c0',cards:[
            {wo:'WO-EMB-2026-0149',item:'군부대 마크 자수',qty:'1,500ea',due:'06-05',mgr:'김자수'},
            {wo:'WO-EMB-2026-0156',item:'사명 로고 자수',qty:'1,200ea',due:'05-30',mgr:'김자수'},
          ]},
          {col:'도안승인',color:'#f59e0b',dot:'#f59e0b',cards:[
            {wo:'WO-EMB-2026-0148',item:'패션 브랜드 로고',qty:'900ea',due:'05-28',mgr:'이자수'},
          ]},
          {col:'자수중',color:'#4361ee',dot:'#4361ee',cards:[
            {wo:'WO-EMB-2026-0155',item:'학교 엠블럼 자수',qty:'800ea',due:'05-27',mgr:'이자수'},
            {wo:'WO-EMB-2026-0154',item:'팀명 패치 자수',qty:'2,000ea',due:'05-25',mgr:'박자수'},
          ]},
          {col:'검수중',color:'#8b5cf6',dot:'#8b5cf6',cards:[
            {wo:'WO-EMB-2026-0147',item:'골프웨어 로고',qty:'600ea',due:'05-22',mgr:'최자수'},
          ]},
          {col:'완료',color:'#10b981',dot:'#10b981',cards:[
            {wo:'WO-EMB-2026-0153',item:'국기 자수 3도',qty:'500ea',due:'05-22',mgr:'김자수'},
            {wo:'WO-EMB-2026-0152',item:'스포츠 브랜드',qty:'3,000ea',due:'05-20',mgr:'이자수'},
            {wo:'WO-EMB-2026-0151',item:'기업 이니셜',qty:'600ea',due:'05-18',mgr:'박자수'},
          ]},
        ].map(col=>`
        <div style="background:#f8f9fc;border-radius:12px;padding:12px;min-height:400px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:${col.dot}"></div>
            <span style="font-size:13px;font-weight:700">${col.col}</span>
            <span style="background:${col.color}22;color:${col.color};font-size:11px;font-weight:700;padding:1px 7px;border-radius:20px;margin-left:auto">${col.cards.length}</span>
          </div>
          ${col.cards.map(c=>`
          <div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:8px;border:1.5px solid #e5e9f2;border-left:4px solid ${col.dot};cursor:pointer"
            onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow=''">
            <div style="font-size:11px;color:#9ba8c0;font-family:monospace;margin-bottom:4px">${c.wo}</div>
            <div style="font-size:13px;font-weight:600;margin-bottom:6px">${c.item}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="font-size:11px;background:#f0f2f7;color:#6b7a99;padding:2px 7px;border-radius:10px">📦 ${c.qty}</span>
              <span style="font-size:11px;background:#f0f2f7;color:#6b7a99;padding:2px 7px;border-radius:10px">📅 ${c.due}</span>
            </div>
            <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
              <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px">${c.mgr[0]}</div>
              <span style="font-size:11.5px;color:#9ba8c0">${c.mgr}</span>
            </div>
          </div>`).join('')}
          <div style="border:1.5px dashed #d5daea;border-radius:10px;padding:10px;text-align:center;color:#9ba8c0;font-size:12px;cursor:pointer;margin-top:4px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('새 작업지시를 추가합니다.')">+ 추가</div>
        </div>`).join('')}
      </div>
    </div><!-- /emb-tab-2 -->

    <!-- Tab 3: 품질검사 -->
    <div id="emb-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- QC 체크리스트 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">자수 품질 체크리스트</span>
            <span style="font-size:12px;background:#10b98120;color:#10b981;padding:3px 10px;border-radius:20px;font-weight:600">6/10 완료</span>
          </div>
          <div class="card-body" style="padding:16px">
            ${[
              {item:'도안 치수 확인 (80×60mm)',done:true},{item:'색상수 확인 (8도)',done:true},
              {item:'스티치 수 검증 (24,580)',done:true},{item:'실 장력 및 텐션 설정',done:true},
              {item:'바늘 상태 점검 (15니들)',done:true},{item:'시제품 자수 시행',done:true},
              {item:'색상 재현율 검토',active:true},{item:'세탁 견뢰도 테스트',done:false},
              {item:'풀림·올풀림 검사',done:false},{item:'최종 출하 검사',done:false},
            ].map((c,i)=>`
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f2f4f8">
              <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${c.done?'#10b981':c.active?'#4361ee':'#d5daea'};background:${c.done?'#10b981':c.active?'#eff2ff':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${c.done?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':c.active?'<div style="width:8px;height:8px;border-radius:50%;background:#4361ee"></div>':''}
              </div>
              <span style="font-size:13px;color:${c.done?'#9ba8c0':c.active?'#1a2035':'#525f7f'};${c.done?'text-decoration:line-through':''}">${c.item}</span>
              ${c.active?`<span style="margin-left:auto;font-size:11px;background:#eff2ff;color:#4361ee;padding:2px 8px;border-radius:10px">진행중</span>`:''}
            </div>`).join('')}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- 검사 이력 -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">검사 이력</span>
              <button class="btn btn-secondary btn-sm">+ 검사 추가</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>검사일</th><th>작업번호</th><th>검사자</th><th>판정</th><th>불량률</th></tr></thead>
                <tbody>
                  ${[
                    {date:'2026-05-19',wo:'WO-EMB-0155',inspector:'김품질',result:'합격',rate:'0.3%',ok:true},
                    {date:'2026-05-18',wo:'WO-EMB-0154',inspector:'이품질',result:'조건부합격',rate:'1.2%',ok:true},
                    {date:'2026-05-16',wo:'WO-EMB-0153',inspector:'김품질',result:'합격',rate:'0.0%',ok:true},
                    {date:'2026-05-14',wo:'WO-EMB-0152',inspector:'박품질',result:'불합격',rate:'4.5%',ok:false},
                    {date:'2026-05-12',wo:'WO-EMB-0151',inspector:'이품질',result:'합격',rate:'0.8%',ok:true},
                  ].map(r=>`
                  <tr>
                    <td style="font-size:12.5px">${r.date}</td>
                    <td style="font-family:monospace;font-size:11.5px">${r.wo}</td>
                    <td>${r.inspector}</td>
                    <td><span class="badge ${r.ok?'badge-solid-green':'badge-err'}">${r.result}</span></td>
                    <td class="td-right" style="color:${r.ok?'#10b981':'#ef4444'};font-weight:600">${r.rate}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 불량 유형 분석 -->
          <div class="card">
            <div class="card-header"><span class="card-title">불량 유형 분석 (최근 30일)</span></div>
            <div class="card-body" style="padding:16px">
              ${[
                {type:'실 끊어짐',pct:38,color:'#ef4444'},
                {type:'색상 오차',pct:26,color:'#f59e0b'},
                {type:'스티치 뭉침',pct:18,color:'#8b5cf6'},
                {type:'치수 불일치',pct:12,color:'#4361ee'},
                {type:'기타',pct:6,color:'#9ba8c0'},
              ].map(d=>`
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:13px">${d.type}</span>
                  <span style="font-size:13px;font-weight:600;color:${d.color}">${d.pct}%</span>
                </div>
                <div style="height:8px;background:#f0f2f7;border-radius:10px;overflow:hidden">
                  <div style="height:100%;width:${d.pct}%;background:${d.color};border-radius:10px;transition:width .8s ease"></div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div><!-- /emb-tab-3 -->`;
  },

  /* ══════════════════════════════════
     퀄팅 작업지시
  ══════════════════════════════════ */
  'production-qlt'() {
    const materials = [{name:'겉감',used:180,total:300,pct:60},{name:'솜(충전재)',used:60,total:100,pct:60,unit:'kg'},{name:'안감',used:180,total:300,pct:60},{name:'실',used:8,total:15,pct:53,unit:'콘'}];
    return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">퀄팅생산관리</div>
          <div class="page-desc">QLT 라인 작업지시 현황 및 퀄팅기 가동 관리</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('작업지시서가 인쇄됩니다.')">🖨 인쇄</button>
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('퀄팅생산현황')">CSV ↓</button>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Modal.open({title:'신규 작업지시',body:'<p style=\'padding:20px\'>신규 퀄팅 작업지시 등록 폼</p>'})">+ 작업지시</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${[
        ['진행중','6건','#4361ee','🔄'],
        ['오늘 완료','4건','#10b981','✅'],
        ['납기임박','1건','#f59e0b','⚡'],
        ['퀄팅기 가동률','50%','#14b8a6','⚙️'],
      ].map(([l,v,c,i])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:12px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${i}</div>
        <div>
          <div style="font-size:12px;color:#9ba8c0;margin-bottom:2px">${l}</div>
          <div style="font-size:22px;font-weight:700;color:${c}">${v}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Tabs -->
    <div class="tab-bar mb-16">
      <button class="tab-btn active" onclick="switchTab(this,'qlt-tab-0')">작업현황</button>
      <button class="tab-btn" onclick="switchTab(this,'qlt-tab-1')">작업지시목록</button>
      <button class="tab-btn" onclick="switchTab(this,'qlt-tab-2')">칸반보드</button>
      <button class="tab-btn" onclick="switchTab(this,'qlt-tab-3')">품질검사</button>
    </div>

    <!-- Tab 0: 작업현황 (기존 내용) -->
    <div id="qlt-tab-0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <div style="font-size:13px;color:#9ba8c0;margin-bottom:6px">생산관리 › 퀄팅 › 작업지시 › WO-QLT-2026-0089</div>
        <div style="font-size:22px;font-weight:700">작업지시 WO-QLT-2026-0089</div>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <span class="badge badge-solid-blue" style="font-size:13px;padding:5px 14px">생산중</span>
        <div>
          <div style="font-size:12px;color:#9ba8c0">진행률</div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px;font-weight:700;color:#4361ee">42%</span>
            <div style="width:150px"><div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:42%"></div></div></div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:280px 1fr 240px;gap:20px">
      <!-- 퀄팅 사양 -->
      <div class="card">
        <div class="card-header"><span class="card-title">퀄팅 사양</span></div>
        <div class="card-body" style="padding:16px">
          <table class="info-table">
            <tr><td>겉감</td><td>면100% 60수</td></tr>
            <tr><td>충전재</td><td>폴리솜 200g</td></tr>
            <tr><td>안감</td><td>면혼방</td></tr>
            <tr><td>퀄팅 패턴</td><td>다이아몬드 5cm</td></tr>
            <tr><td>박음질 간격</td><td>50mm</td></tr>
            <tr><td>사이즈</td><td>2000 × 2400 mm</td></tr>
            <tr><td>수량</td><td style="font-weight:600">300 ea</td></tr>
          </table>
        </div>
      </div>

      <!-- 패턴 미리보기 -->
      <div class="card">
        <div class="card-header"><span class="card-title">패턴 미리보기</span></div>
        <div class="card-body" style="padding:16px">
          <div style="height:220px;background:#f8f5ec;border-radius:10px;overflow:hidden;border:1.5px solid #e5e9f2">
            <svg viewBox="0 0 400 220" style="width:100%;height:100%">
              <defs><pattern id="diamond" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                <polygon points="25,2 48,25 25,48 2,25" fill="none" stroke="#c8b89a" stroke-width="1.5"/>
              </pattern></defs>
              <rect width="400" height="220" fill="#f8f5ec"/>
              <rect width="400" height="220" fill="url(#diamond)"/>
            </svg>
          </div>
          <div style="margin-top:12px">
            <div style="font-size:12px;color:#9ba8c0;margin-bottom:8px">패턴 선택</div>
            <div class="pattern-selector">
              ${['다이아몬드','스트라이프','허니컴','웨이브','박스'].map((p,i)=>`
              <div class="pattern-item ${i===0?'active':''}">
                <svg viewBox="0 0 60 60" style="width:100%;height:100%">
                  ${i===0?'<polygon points="30,4 56,30 30,56 4,30" fill="none" stroke="#4361ee" stroke-width="2"/>':
                    i===1?'<line x1="0" y1="15" x2="60" y2="15" stroke="#9ba8c0" stroke-width="2"/><line x1="0" y1="30" x2="60" y2="30" stroke="#9ba8c0" stroke-width="2"/><line x1="0" y1="45" x2="60" y2="45" stroke="#9ba8c0" stroke-width="2"/>':
                    '<circle cx="30" cy="30" r="15" fill="none" stroke="#9ba8c0" stroke-width="2"/>'}
                </svg>
              </div>`).join('')}
              <div class="pattern-item"><span class="pattern-add">+</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 공정 -->
      <div class="card">
        <div class="card-header"><span class="card-title">공정</span></div>
        <div class="card-body">
          <div class="timeline">
            ${[
              {label:'재단',done:true},{label:'충전재 준비',done:true},{label:'퀄팅기 세팅',done:true},
              {label:'퀄팅중',active:true,pct:42},{label:'마감 박음질',pending:true},{label:'검수',pending:true},{label:'포장',pending:true}
            ].map((s,i)=>`
            <div class="timeline-item ${s.done?'done':s.active?'active-step':''}">
              <div class="tl-dot">${s.done?'✓':s.active?'●':(i+1)}</div>
              <div class="tl-content">
                <div class="tl-title">${s.label}${s.active?` <span class="tl-tag">퀄팅중</span>`:''}</div>
                ${s.pct?`<div class="progress-bar mt-4"><div class="progress-fill" style="width:${s.pct}%"></div></div>`:''}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title">퀄팅기 현황</span>
          <button class="btn btn-secondary btn-sm">↻ 새로고침</button>
        </div>
        <div class="card-body">
          ${[{name:'Gammill Statler',status:'가동중',model:'Gammill Statler',needles:228,speed:'12.5 m/min'},
             {name:'Innova 22',status:'대기',model:'Innova 22',needles:216,speed:'0 m/min'}].map(m=>`
          <div style="display:flex;align-items:center;gap:14px;padding:12px;background:#f8f9fc;border-radius:10px;margin-bottom:10px">
            <div style="width:56px;height:56px;background:#e5e9f2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px">🧵</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-size:14px;font-weight:600">${m.name}</span>
                <span class="badge ${m.status==='가동중'?'badge-solid-green':'badge-solid-gray'}">${m.status}</span>
              </div>
              <div style="font-size:12px;color:#9ba8c0">모델 ${m.model} &nbsp;|&nbsp; 바늘수 ${m.needles} &nbsp;|&nbsp; 생산속도 ${m.speed}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">자재 소모량</span>
          <select class="form-select" style="height:28px;font-size:12px">
            <option>전체</option>
          </select>
        </div>
        <div class="card-body">
          ${materials.map(m=>`
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:13.5px;font-weight:500">${m.name}</span>
              <span style="font-size:13px;color:#9ba8c0">${m.used} ${m.unit||'m'} / ${m.total} ${m.unit||'m'}</span>
              <span style="font-size:13px;font-weight:700;color:#4361ee">${m.pct}%</span>
            </div>
            <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${m.pct}%"></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    </div><!-- /qlt-tab-0 -->

    <!-- Tab 1: 작업지시목록 -->
    <div id="qlt-tab-1" style="display:none">
      <div class="filter-bar mb-16">
        <input type="date" class="form-input" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input type="date" class="form-input" value="2026-05-31" style="width:140px">
        ${['전체','재단','퀄팅중','마감','완료','보류'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm" onclick="this.closest('.filter-bar').querySelectorAll('button').forEach(b=>b.className='btn btn-secondary btn-sm');this.className='btn btn-primary btn-sm'">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 작업번호·품목명 검색" style="flex:1;max-width:240px">
        <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('퀄팅작업지시목록')">CSV ↓</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>작업번호</th><th>연결수주</th><th>품목명</th><th>담당자</th>
              <th class="td-right">수량</th><th>시작일</th><th>완료예정</th>
              <th style="min-width:120px">진행률</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {wo:'WO-QLT-2026-0089',so:'SO-2026-0091',item:'다이아몬드 퀄팅 이불커버',mgr:'이퀄팅',qty:300,start:'05-18',end:'05-28',pct:42,status:'퀄팅중',statusC:'blue'},
                {wo:'WO-QLT-2026-0088',so:'SO-2026-0088',item:'허니컴 패턴 쿠션커버',mgr:'박퀄팅',qty:500,start:'05-16',end:'05-26',pct:78,status:'퀄팅중',statusC:'blue'},
                {wo:'WO-QLT-2026-0087',so:'SO-2026-0086',item:'스트라이프 퀄팅 조끼',mgr:'김퀄팅',qty:200,start:'05-20',end:'06-01',pct:0,status:'재단중',statusC:'orange'},
                {wo:'WO-QLT-2026-0086',so:'SO-2026-0083',item:'웨이브 패턴 베드커버',mgr:'이퀄팅',qty:150,start:'05-14',end:'05-24',pct:95,status:'마감중',statusC:'purple'},
                {wo:'WO-QLT-2026-0085',so:'SO-2026-0081',item:'박스 퀄팅 점퍼',mgr:'박퀄팅',qty:800,start:'05-10',end:'05-20',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-QLT-2026-0084',so:'SO-2026-0079',item:'클래식 다이아 누비',mgr:'최퀄팅',qty:400,start:'05-08',end:'05-18',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-QLT-2026-0083',so:'SO-2026-0077',item:'허니컴 방한 이불',mgr:'김퀄팅',qty:250,start:'05-06',end:'05-16',pct:100,status:'완료',statusC:'green'},
                {wo:'WO-QLT-2026-0082',so:'SO-2026-0074',item:'기능성 퀄팅 조끼 아동',mgr:'이퀄팅',qty:1200,start:'05-25',end:'06-10',pct:0,status:'대기',statusC:'gray'},
              ].map(r=>`
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#14b8a6;cursor:pointer">${r.wo}</td>
                <td style="font-size:12px;color:#9ba8c0">${r.so}</td>
                <td style="font-weight:500">${r.item}</td>
                <td>${r.mgr}</td>
                <td class="td-right">${r.qty.toLocaleString()}</td>
                <td style="font-size:12.5px">2026-${r.start}</td>
                <td style="font-size:12.5px">2026-${r.end}</td>
                <td style="min-width:120px">
                  <div style="display:flex;align-items:center;gap:6px">
                    <div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:${r.pct}%;background:var(--teal,#14b8a6)"></div></div>
                    <span style="font-size:11px;color:#9ba8c0;width:28px">${r.pct}%</span>
                  </div>
                </td>
                <td><span class="badge badge-${r.statusC}">${r.status}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                    onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${r.wo} 상세보기')">상세</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /qlt-tab-1 -->

    <!-- Tab 2: 칸반보드 -->
    <div id="qlt-tab-2" style="display:none">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
        ${[
          {col:'대기',dot:'#9ba8c0',cards:[
            {wo:'WO-QLT-0082',item:'기능성 퀄팅 조끼 아동',qty:'1,200ea',due:'06-10',mgr:'이퀄팅'},
          ]},
          {col:'재단중',dot:'#f59e0b',cards:[
            {wo:'WO-QLT-0087',item:'스트라이프 퀄팅 조끼',qty:'200ea',due:'06-01',mgr:'김퀄팅'},
          ]},
          {col:'퀄팅중',dot:'#4361ee',cards:[
            {wo:'WO-QLT-0089',item:'다이아몬드 이불커버',qty:'300ea',due:'05-28',mgr:'이퀄팅'},
            {wo:'WO-QLT-0088',item:'허니컴 쿠션커버',qty:'500ea',due:'05-26',mgr:'박퀄팅'},
          ]},
          {col:'마감중',dot:'#8b5cf6',cards:[
            {wo:'WO-QLT-0086',item:'웨이브 베드커버',qty:'150ea',due:'05-24',mgr:'이퀄팅'},
          ]},
          {col:'완료',dot:'#10b981',cards:[
            {wo:'WO-QLT-0085',item:'박스 퀄팅 점퍼',qty:'800ea',due:'05-20',mgr:'박퀄팅'},
            {wo:'WO-QLT-0084',item:'클래식 다이아 누비',qty:'400ea',due:'05-18',mgr:'최퀄팅'},
            {wo:'WO-QLT-0083',item:'허니컴 방한 이불',qty:'250ea',due:'05-16',mgr:'김퀄팅'},
          ]},
        ].map(col=>`
        <div style="background:#f8f9fc;border-radius:12px;padding:12px;min-height:400px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:${col.dot}"></div>
            <span style="font-size:13px;font-weight:700">${col.col}</span>
            <span style="background:${col.dot}22;color:${col.dot};font-size:11px;font-weight:700;padding:1px 7px;border-radius:20px;margin-left:auto">${col.cards.length}</span>
          </div>
          ${col.cards.map(c=>`
          <div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:8px;border:1.5px solid #e5e9f2;border-left:4px solid ${col.dot};cursor:pointer"
            onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow=''">
            <div style="font-size:11px;color:#9ba8c0;font-family:monospace;margin-bottom:4px">${c.wo}</div>
            <div style="font-size:13px;font-weight:600;margin-bottom:6px">${c.item}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="font-size:11px;background:#f0f2f7;color:#6b7a99;padding:2px 7px;border-radius:10px">📦 ${c.qty}</span>
              <span style="font-size:11px;background:#f0f2f7;color:#6b7a99;padding:2px 7px;border-radius:10px">📅 ${c.due}</span>
            </div>
            <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
              <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#14b8a6,#4361ee);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px">${c.mgr[0]}</div>
              <span style="font-size:11.5px;color:#9ba8c0">${c.mgr}</span>
            </div>
          </div>`).join('')}
          <div style="border:1.5px dashed #d5daea;border-radius:10px;padding:10px;text-align:center;color:#9ba8c0;font-size:12px;cursor:pointer;margin-top:4px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('새 작업지시를 추가합니다.')">+ 추가</div>
        </div>`).join('')}
      </div>
    </div><!-- /qlt-tab-2 -->

    <!-- Tab 3: 품질검사 -->
    <div id="qlt-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- QC 체크리스트 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">퀄팅 품질 체크리스트</span>
            <span style="font-size:12px;background:#10b98120;color:#10b981;padding:3px 10px;border-radius:20px;font-weight:600">5/9 완료</span>
          </div>
          <div class="card-body" style="padding:16px">
            ${[
              {item:'원단 수축률 사전 검사',done:true},{item:'패턴 치수 확인 (5cm 간격)',done:true},
              {item:'충전재 중량 확인 (200g)',done:true},{item:'퀄팅기 바늘 상태 (228개)',done:true},
              {item:'시제품 퀄팅 시행',done:true},{item:'박음질 견고성 테스트',active:true},
              {item:'세탁 수축 테스트',done:false},{item:'필링 저항성 검사',done:false},
              {item:'최종 출하 검사',done:false},
            ].map((c,i)=>`
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f2f4f8">
              <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${c.done?'#10b981':c.active?'#14b8a6':'#d5daea'};background:${c.done?'#10b981':c.active?'#e6faf9':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${c.done?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':c.active?'<div style="width:8px;height:8px;border-radius:50%;background:#14b8a6"></div>':''}
              </div>
              <span style="font-size:13px;color:${c.done?'#9ba8c0':c.active?'#1a2035':'#525f7f'};${c.done?'text-decoration:line-through':''}">${c.item}</span>
              ${c.active?`<span style="margin-left:auto;font-size:11px;background:#e6faf9;color:#14b8a6;padding:2px 8px;border-radius:10px">진행중</span>`:''}
            </div>`).join('')}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- 검사 이력 -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">검사 이력</span>
              <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('검사 추가')">+ 검사 추가</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>검사일</th><th>작업번호</th><th>검사자</th><th>판정</th><th>불량률</th></tr></thead>
                <tbody>
                  ${[
                    {date:'2026-05-19',wo:'WO-QLT-0088',inspector:'김품질',result:'합격',rate:'0.5%',ok:true},
                    {date:'2026-05-17',wo:'WO-QLT-0087',inspector:'이품질',result:'합격',rate:'0.2%',ok:true},
                    {date:'2026-05-15',wo:'WO-QLT-0086',inspector:'박품질',result:'조건부합격',rate:'1.8%',ok:true},
                    {date:'2026-05-13',wo:'WO-QLT-0085',inspector:'김품질',result:'합격',rate:'0.0%',ok:true},
                    {date:'2026-05-11',wo:'WO-QLT-0084',inspector:'이품질',result:'불합격',rate:'5.2%',ok:false},
                  ].map(r=>`
                  <tr>
                    <td style="font-size:12.5px">${r.date}</td>
                    <td style="font-family:monospace;font-size:11.5px">${r.wo}</td>
                    <td>${r.inspector}</td>
                    <td><span class="badge ${r.ok?'badge-solid-green':'badge-err'}">${r.result}</span></td>
                    <td class="td-right" style="color:${r.ok?'#10b981':'#ef4444'};font-weight:600">${r.rate}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 불량 유형 -->
          <div class="card">
            <div class="card-header"><span class="card-title">불량 유형 분석 (최근 30일)</span></div>
            <div class="card-body" style="padding:16px">
              ${[
                {type:'박음질 풀림',pct:32,color:'#ef4444'},
                {type:'패턴 틀어짐',pct:28,color:'#f59e0b'},
                {type:'충전재 쏠림',pct:20,color:'#8b5cf6'},
                {type:'원단 수축',pct:14,color:'#14b8a6'},
                {type:'기타',pct:6,color:'#9ba8c0'},
              ].map(d=>`
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:13px">${d.type}</span>
                  <span style="font-size:13px;font-weight:600;color:${d.color}">${d.pct}%</span>
                </div>
                <div style="height:8px;background:#f0f2f7;border-radius:10px;overflow:hidden">
                  <div style="height:100%;width:${d.pct}%;background:${d.color};border-radius:10px"></div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div><!-- /qlt-tab-3 -->`;
  },


  /* ══════════════════════════════════
     재고현황
  ══════════════════════════════════ */
  inventory() {
    const items = window.ARAM_DATA.inventory;
    const statusBadge = s => ({'정상':'badge badge-solid-green','부족':'badge badge-orange','품절':'badge badge-err'})[s]||'badge badge-gray';
    return `
    <div class="page-header">
      <div class="flex-between">
        <div class="page-title">재고관리</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:12.5px;color:#9ba8c0">기준일: 2026-05-20</span>
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('재고현황')">CSV ↓</button>
          <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('재고현황이 최신 데이터로 갱신되었습니다.')">↻ 새로고침</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${[
        ['총 SKU','1,247종','전체 원단 SKU 수','📦','#4361ee'],
        ['재고가치','₩3,840M','원가 기준','💰','#10b981'],
        ['안전재고 미달','23종','즉시 발주 필요','⚠️','#f59e0b'],
        ['재고 회전율','6.8회','최근 30일 기준','🔄','#8b5cf6'],
      ].map(([l,v,s,i,c])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:46px;height:46px;border-radius:12px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:22px">${i}</div>
        <div>
          <div class="stat-label">${l}</div>
          <div class="stat-value${l==='재고가치'?' sm':''}" style="${l==='안전재고 미달'?'color:'+c:''}">${v}</div>
          <div style="font-size:11.5px;color:#9ba8c0">${s}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- 탭 바 -->
    <div class="tab-bar" style="margin-bottom:16px">
      <div class="tab active" onclick="switchTab(this,'inv-tab-0')">📦 재고현황</div>
      <div class="tab" onclick="switchTab(this,'inv-tab-1')">🔄 입출고이력</div>
      <div class="tab" onclick="switchTab(this,'inv-tab-2')">⚠️ 재고알림 <span style="display:inline-block;background:#f59e0b;color:#fff;border-radius:10px;font-size:10px;padding:0 5px;margin-left:4px">23</span></div>
      <div class="tab" onclick="switchTab(this,'inv-tab-3')">🏭 창고별 현황</div>
    </div>

    <!-- ── 탭0: 재고현황 ── -->
    <div id="inv-tab-0">
      <!-- 필터 바 -->
      <div class="filter-bar">
        <span class="filter-label">카테고리</span>
        <select class="form-select" style="width:100px"><option>전체</option><option>면</option><option>폴리</option><option>혼방</option><option>특수</option></select>
        <span class="filter-label">색상</span>
        ${['전체','화이트','블랙','네이비','그레이','베이지'].map((c,i)=>`
        <span style="padding:5px 12px;border-radius:20px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'#f0f2f7'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'#e5e9f2'}">${c}</span>`).join('')}
        <span class="filter-label" style="margin-left:8px">창고</span>
        ${['전체','1공장','2공장','물류센터'].map((w,i)=>`
        <span style="padding:5px 12px;border-radius:20px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'#f0f2f7'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'#e5e9f2'}">${w}</span>`).join('')}
        <div class="filter-actions">
          <div style="position:relative">
            <input class="form-input" placeholder="원단코드, 원단명 검색" style="width:200px;padding-left:36px">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ba8c0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
        </div>
      </div>

      <div class="inv-layout">
        <!-- 메인 테이블 -->
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th class="checkbox-cell"><input type="checkbox"></th>
                <th>원단코드</th><th>색상</th><th>원단명</th><th>규격(폭 cm)</th>
                <th class="td-right">재고량(m)</th><th class="td-right">안전재고</th>
                <th>위치(랙)</th><th>입고예정</th><th class="td-center">상태</th>
              </tr></thead>
              <tbody>
                ${items.map(r=>`
                <tr style="cursor:pointer" onmouseover="this.style.background='var(--primary-lt)'" onmouseout="this.style.background=''">
                  <td class="checkbox-cell"><input type="checkbox" onclick="event.stopPropagation()"></td>
                  <td class="td-link">${r.code}</td>
                  <td><div class="color-dot" style="background:${r.color};width:16px;height:16px;border-radius:50%;border:1px solid rgba(0,0,0,.1)"></div></td>
                  <td style="font-weight:500">${r.name}</td>
                  <td>${r.width}</td>
                  <td class="td-right font-600">${r.stock}</td>
                  <td class="td-right" style="color:#9ba8c0">${r.safety.toLocaleString()}</td>
                  <td style="font-size:12.5px;color:#6b7a99">${r.location}</td>
                  <td style="font-size:12.5px;color:#6b7a99">${r.incoming}</td>
                  <td class="td-center"><span class="${statusBadge(r.status)}">${r.status}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span class="page-info">전체 1,247건</span>
            <div class="page-nums">
              <span class="page-btn">‹</span>
              ${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}
              <span class="page-btn">›</span>
            </div>
          </div>
        </div>

        <!-- 우측 패널 -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-header"><span class="card-title">카테고리별 재고 분포</span></div>
            <div class="card-body" style="padding:14px 16px">
              ${[['면','#4361ee',35],['폴리','#8b5cf6',28],['혼방','#ef4444',22],['특수','#f59e0b',15]].map(([l,c,p])=>`
              <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                  <span>${l}</span><span style="font-weight:600">${p}%</span>
                </div>
                <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${p}%;background:${c}"></div></div>
              </div>`).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">입출고 추이 (30일)</span></div>
            <div class="card-body" style="padding:12px">
              <div class="chart-container" style="height:140px"><canvas id="chart-inv-trend"></canvas></div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <span style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600">⚠ 즉시 발주 필요</span>
              <span style="font-size:12px;color:#9ba8c0">안전재고 미달 5건</span>
            </div>
            <div class="table-wrap">
              <table style="font-size:12.5px">
                <thead><tr><th>코드</th><th>원단명</th><th class="td-right">재고</th><th class="td-right">기준</th><th></th></tr></thead>
                <tbody>
                  ${[['FAB-2403','TC 20수 그레이',5430,6000],['FAB-2405','린넨 30수 내추럴',3210,4000],['FAB-2407','울 차콜',2150,3000]].map(([c,n,s,a])=>`
                  <tr>
                    <td style="color:#4361ee;font-size:12px">${c}</td>
                    <td>${n}</td>
                    <td class="td-right">${s.toLocaleString()}</td>
                    <td class="td-right" style="color:#f59e0b">${a.toLocaleString()}</td>
                    <td><button class="btn btn-primary btn-sm" style="font-size:11px;padding:2px 8px" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('${c} 발주 요청이 접수되었습니다.')">발주</button></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /inv-tab-0 -->

    <!-- ── 탭1: 입출고 이력 ── -->
    <div id="inv-tab-1" style="display:none">
      <div class="filter-bar" style="margin-bottom:16px">
        <span class="filter-label">기간</span>
        <div class="date-range">
          <input class="form-input" type="date" value="2026-05-01">
          <span style="color:#9ba8c0">~</span>
          <input class="form-input" type="date" value="2026-05-20">
        </div>
        <span class="filter-label">유형</span>
        ${['전체','입고','출고','반품','조정'].map((t,i)=>`
        <span style="padding:4px 12px;border-radius:4px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'transparent'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'transparent'}">${t}</span>`).join('')}
        <div class="filter-actions">
          <input class="form-input" placeholder="원단코드 검색" style="width:180px">
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('입출고이력')">CSV ↓</button>
        </div>
      </div>

      <!-- 입출고 요약 -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        ${[
          ['이번달 입고','156,400m','전월 대비 +12%','#10b981'],
          ['이번달 출고','189,200m','전월 대비 +8%','#4361ee'],
          ['반품','2,300m','전월 대비 -5%','#f59e0b'],
          ['재고 조정','800m','4건 처리','#8b5cf6'],
        ].map(([l,v,s,c])=>`
        <div class="card" style="padding:14px">
          <div style="font-size:12px;color:#9ba8c0;margin-bottom:4px">${l}</div>
          <div style="font-size:20px;font-weight:700;color:${c}">${v}</div>
          <div style="font-size:11.5px;color:#9ba8c0">${s}</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>일시</th><th>전표번호</th><th class="td-center">유형</th>
              <th>원단코드</th><th>원단명</th><th>창고</th>
              <th class="td-right">수량(m)</th><th class="td-right">단가(₩)</th><th class="td-right">금액</th>
              <th>담당자</th><th>비고</th>
            </tr></thead>
            <tbody>
              ${[
                {dt:'2026-05-20 10:22',no:'IN-2026-05-1842',type:'입고',code:'FAB-1102',name:'코튼 20수 화이트',wh:'1공장',qty:'5,400',price:'12,800',total:'69,120,000',user:'박준영',note:''},
                {dt:'2026-05-20 09:45',no:'OUT-2026-05-3211',type:'출고',code:'FAB-1103',name:'코튼 30수 블랙',wh:'2공장',qty:'2,200',price:'14,500',total:'31,900,000',user:'이정훈',note:'WO-DTP-0234'},
                {dt:'2026-05-19 17:30',no:'IN-2026-05-1841',type:'입고',code:'FAB-2201',name:'폴리 75D 네이비',wh:'물류센터',qty:'8,000',price:'9,200',total:'73,600,000',user:'오재형',note:''},
                {dt:'2026-05-19 15:10',no:'OUT-2026-05-3210',type:'출고',code:'FAB-1102',name:'코튼 20수 화이트',wh:'1공장',qty:'3,600',price:'12,800',total:'46,080,000',user:'박준영',note:'WO-EMB-0189'},
                {dt:'2026-05-19 11:00',no:'RTN-2026-05-0044',type:'반품',code:'FAB-2403',name:'TC 20수 그레이',wh:'물류센터',qty:'600',price:'11,500',total:'6,900,000',user:'한지수',note:'품질 불량'},
                {dt:'2026-05-18 16:44',no:'ADJ-2026-05-0012',type:'조정',code:'FAB-3301',name:'린넨 40수 베이지',wh:'1공장',qty:'-200',price:'18,000',total:'-3,600,000',user:'이준호',note:'실사 조정'},
                {dt:'2026-05-18 09:10',no:'IN-2026-05-1840',type:'입고',code:'FAB-1205',name:'코튼 40수 그레이',wh:'2공장',qty:'4,200',price:'16,200',total:'68,040,000',user:'최수아',note:''},
              ].map(r=>`
              <tr>
                <td style="font-size:12px;color:#9ba8c0;white-space:nowrap">${r.dt}</td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee">${r.no}</td>
                <td class="td-center">
                  <span class="badge ${r.type==='입고'?'badge-solid-green':r.type==='출고'?'badge-solid-blue':r.type==='반품'?'badge-orange':'badge-purple'}">${r.type}</span>
                </td>
                <td style="font-size:12.5px;color:#4361ee">${r.code}</td>
                <td style="font-weight:500">${r.name}</td>
                <td style="font-size:12.5px;color:#9ba8c0">${r.wh}</td>
                <td class="td-right font-600" style="color:${r.qty.startsWith('-')?'#ef4444':'inherit'}">${r.qty}</td>
                <td class="td-right" style="font-size:12.5px;color:#9ba8c0">₩${r.price}</td>
                <td class="td-right" style="color:${r.total.startsWith('-')?'#ef4444':'#1a2035'}">₩${r.total}</td>
                <td style="font-size:12.5px">${r.user}</td>
                <td style="font-size:12px;color:#9ba8c0">${r.note||'—'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-info">전체 3,847건</span>
          <div class="page-nums">${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
        </div>
      </div>
    </div><!-- /inv-tab-1 -->

    <!-- ── 탭2: 재고알림 ── -->
    <div id="inv-tab-2" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- 안전재고 미달 목록 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title" style="display:flex;align-items:center;gap:6px">⚠️ 안전재고 미달 <span style="background:#f59e0b;color:#fff;border-radius:12px;font-size:11px;padding:1px 7px">23건</span></span>
            <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('23건 일괄 발주 요청이 접수되었습니다.')">일괄 발주</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>원단코드</th><th>원단명</th>
                <th class="td-right">현재고</th><th class="td-right">안전재고</th>
                <th class="td-center">부족률</th><th class="td-center">발주</th>
              </tr></thead>
              <tbody>
                ${[
                  ['FAB-2403','TC 20수 그레이',5430,6000],
                  ['FAB-2405','린넨 30수 내추럴',3210,4000],
                  ['FAB-2407','테일러드 울 차콜',2150,3000],
                  ['FAB-1801','실크 혼방 아이보리',1200,2500],
                  ['FAB-3301','린넨 40수 베이지',4800,5500],
                  ['FAB-2201','폴리 75D 네이비',7200,8000],
                  ['FAB-1102','코튼 20수 화이트',9800,10500],
                ].map(([c,n,s,a])=>{
                  const rate = Math.round((1-s/a)*100);
                  return `
                  <tr>
                    <td style="color:#4361ee;font-size:12.5px">${c}</td>
                    <td style="font-weight:500;font-size:13px">${n}</td>
                    <td class="td-right font-600">${s.toLocaleString()}</td>
                    <td class="td-right" style="color:#9ba8c0">${a.toLocaleString()}</td>
                    <td class="td-center">
                      <span style="color:${rate>30?'#ef4444':rate>15?'#f59e0b':'#f59e0b'};font-weight:700;font-size:13px">${rate}%</span>
                    </td>
                    <td class="td-center">
                      <button class="btn btn-primary btn-sm" style="font-size:11px;padding:2px 8px" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('${c} 발주 요청 접수')">발주</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 알림 설정 + 품절 임박 -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-header"><span class="card-title">🔴 품절 임박 (7일 이내)</span></div>
            <div style="padding:8px 0">
              ${[
                {code:'FAB-1801',name:'실크 혼방 아이보리',days:2,stock:'1,200m'},
                {code:'FAB-2407',name:'테일러드 울 차콜',days:4,stock:'2,150m'},
                {code:'FAB-3301',name:'린넨 40수 베이지',days:6,stock:'4,800m'},
              ].map(r=>`
              <div style="display:flex;gap:12px;align-items:center;padding:10px 16px;border-bottom:1px solid #f8f9fc">
                <div style="width:36px;height:36px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">🚨</div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:600;color:#1a2035">${r.name}</div>
                  <div style="font-size:12px;color:#9ba8c0">${r.code} · 잔여 ${r.stock}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:16px;font-weight:700;color:#ef4444">${r.days}일</div>
                  <div style="font-size:11px;color:#9ba8c0">소진 예상</div>
                </div>
              </div>`).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">알림 설정</span></div>
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
                ${[
                  ['안전재고 미달 알림','안전재고 미달 시 이메일·시스템 알림',true],
                  ['품절 임박 알림 (7일)','7일 이내 소진 예상 시 알림',true],
                  ['입고 예정 알림','발주 후 입고 예정일 3일 전 알림',true],
                  ['대량 출고 알림','일일 출고량 임계값 초과 시 알림',false],
                  ['재고 실사 알림','월간 재고 실사 일정 알림',true],
                ].map(([l,d,v])=>`
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                  <div>
                    <div style="font-weight:500;margin-bottom:2px">${l}</div>
                    <div style="font-size:12px;color:#9ba8c0">${d}</div>
                  </div>
                  <label style="position:relative;display:inline-block;width:36px;height:20px;cursor:pointer;flex-shrink:0;margin-top:2px">
                    <input type="checkbox" ${v?'checked':''} style="opacity:0;width:0;height:0">
                    <span style="position:absolute;inset:0;border-radius:20px;background:${v?'#4361ee':'#e5e9f2'};transition:.2s"></span>
                    <span style="position:absolute;top:3px;left:${v?'19':'3'}px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s"></span>
                  </label>
                </div>`).join('')}
                <div style="padding-top:8px;display:flex;gap:8px">
                  <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('알림 설정이 저장되었습니다.')">저장</button>
                  <button class="btn btn-secondary btn-sm">기본값</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /inv-tab-2 -->

    <!-- ── 탭3: 창고별 현황 ── -->
    <div id="inv-tab-3" style="display:none">
      <!-- 창고별 KPI -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">
        ${[
          {name:'1공장 창고',icon:'🏭',capacity:'80%',sku:'428종',value:'₩1,560M',items:[['면류','48%'],['혼방','32%'],['특수','20%']]},
          {name:'2공장 창고',icon:'🏗',capacity:'65%',sku:'382종',value:'₩1,240M',items:[['폴리','55%'],['혼방','28%'],['면류','17%']]},
          {name:'물류센터',icon:'📦',capacity:'72%',sku:'437종',value:'₩1,040M',items:[['면류','40%'],['폴리','35%'],['특수','25%']]},
        ].map(wh=>`
        <div class="card">
          <div class="card-header">
            <span class="card-title">${wh.icon} ${wh.name}</span>
            <span class="badge badge-blue">${wh.sku}</span>
          </div>
          <div class="card-body">
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px">
                <span style="color:#9ba8c0">창고 사용률</span>
                <span style="font-weight:600">${wh.capacity}</span>
              </div>
              <div style="height:12px;background:#f2f4f8;border-radius:6px;overflow:hidden">
                <div style="height:100%;width:${wh.capacity};background:linear-gradient(90deg,#4361ee,#8b5cf6);border-radius:6px"></div>
              </div>
            </div>
            <div style="text-align:center;padding:10px;background:#f8f9fc;border-radius:8px;margin-bottom:12px">
              <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:2px">재고 가치</div>
              <div style="font-size:18px;font-weight:700;color:#1a2035">${wh.value}</div>
            </div>
            <div style="font-size:12px;font-weight:600;color:#6b7a99;margin-bottom:8px">카테고리 구성</div>
            ${wh.items.map(([l,p])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12.5px">
              <span style="color:#6b7a99">${l}</span>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:60px;height:5px;background:#f2f4f8;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${p};background:#4361ee;border-radius:3px"></div>
                </div>
                <span style="font-weight:600;min-width:28px;text-align:right">${p}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>`).join('')}
      </div>

      <!-- 랙 맵 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">1공장 랙 배치도</span>
          <div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#9ba8c0">
            <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;background:#dcfce7;border-radius:3px;display:inline-block"></span>정상</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;background:#fef3c7;border-radius:3px;display:inline-block"></span>부족</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;background:#fee2e2;border-radius:3px;display:inline-block"></span>품절</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;background:#f2f4f8;border-radius:3px;display:inline-block"></span>빈칸</span>
          </div>
        </div>
        <div style="padding:16px;overflow-x:auto">
          <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:6px;min-width:600px">
            ${Array.from({length:48},(_,i)=>{
              const states = ['normal','normal','normal','low','empty','normal','normal','normal','low','normal','empty','normal'];
              const colors = {normal:'#dcfce7',low:'#fef3c7',empty:'#fee2e2',free:'#f2f4f8'};
              const labels = {normal:'정상',low:'부족',empty:'품절',free:'빈칸'};
              const s = i%8===7?'free':states[i%12]||'normal';
              return `<div style="aspect-ratio:1;background:${colors[s]};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#6b7a99;cursor:pointer;border:1px solid rgba(0,0,0,.06)"
                title="랙 ${String.fromCharCode(65+Math.floor(i/12))}-${(i%12+1).toString().padStart(2,'0')} (${labels[s]})">${String.fromCharCode(65+Math.floor(i/12))}${(i%12+1).toString().padStart(2,'0')}</div>`;
            }).join('')}
          </div>
          <div style="margin-top:12px;font-size:12px;color:#9ba8c0;text-align:center">A~D 행 (총 48개 랙) · 각 셀 클릭 시 상세 원단 조회</div>
        </div>
      </div>
    </div><!-- /inv-tab-3 -->`;
  },

  /* ══════════════════════════════════
     FabricHub 상품관리
  ══════════════════════════════════ */
  fabricHub() {
    const products = window.ARAM_DATA.fabricProducts;
    const stars = r => '★'.repeat(Math.floor(r)) + (r%1>=0.5?'½':'') + '☆'.repeat(5-Math.ceil(r));
    return `
    <div class="fh-layout">
      <div>
        <div class="page-header">
          <div class="flex-between">
            <div class="page-title">FabricHub 상품관리</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary">⬇ 엑셀 내보내기</button>
              <button class="btn btn-primary">+ 상품등록</button>
            </div>
          </div>
        </div>

        <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
          ${[['등록상품','384종','📦','#4361ee'],['이번주 거래','87건','📈','#10b981'],['거래액','₩280M','💰','#f59e0b'],['평균 평점','4.7','⭐','#8b5cf6']].map(([l,v,i,c])=>`
          <div class="stat-card" style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:10px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:20px">${i}</div>
            <div><div class="stat-label">${l}</div><div class="stat-value">${v}</div></div>
          </div>`).join('')}
        </div>

        <!-- Category filter -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <span style="color:#9ba8c0">‹</span>
          ${['전체','면','실크','울','혼방','기능성','친환경'].map((c,i)=>`
          <span onclick="filterFabric(this,'${c}')" style="padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all .15s;
            background:${i===0?'#4361ee':'#fff'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'#e5e9f2'}">${c}</span>`).join('')}
          <span style="color:#9ba8c0">›</span>
          <div style="margin-left:auto;display:flex;gap:8px">
            <select class="form-select" style="width:130px;height:34px;font-size:13px"><option>최신 등록순</option><option>가격 낮은순</option><option>평점 높은순</option></select>
            <button class="btn btn-secondary btn-sm" style="font-size:12px">▦ 그리드</button>
            <button class="btn btn-secondary btn-sm" style="font-size:12px">≡ 리스트</button>
          </div>
        </div>

        <!-- Product grid -->
        <div class="fabric-grid" id="fabric-grid">
          ${products.map((p,i)=>`
          <div class="fabric-card" data-idx="${i}" data-cat="${p.category}" onclick="selectFabric(${i})">
            <div class="fabric-img" style="background:${p.bg}">
              <div class="fabric-img-overlay"><span class="badge badge-gray" style="font-size:10px">${p.category}</span></div>
            </div>
            <div class="fabric-info">
              <div class="fabric-name">${p.name}</div>
              <div class="fabric-vendor">${p.vendor}</div>
              <div class="fabric-price">${p.price}<span style="font-size:11.5px;color:#9ba8c0;font-weight:400">${p.unit}</span></div>
              <div class="fabric-meta">
                <span class="star-rating">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
                <span style="font-size:11px;color:#9ba8c0">${p.rating} (${p.count})</span>
                <span class="fabric-stock ${p.stockOk?'ok':'low'}">재고 ${p.stock}</span>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Right: Detail Panel -->
      <div id="fh-detail-panel">
        <div class="card" style="position:sticky;top:0">
          <div class="card-header">
            <span class="card-title">상품 상세</span>
            <button onclick="closeFabricDetail()" style="background:none;border:none;font-size:18px;color:#9ba8c0;cursor:pointer">✕</button>
          </div>
          <div id="fh-detail-content" style="padding:16px">
            <div style="height:160px;background:linear-gradient(135deg,#c8e6d0,#a8d8b0);border-radius:10px;margin-bottom:14px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff">상품을 선택하세요</div>
            <p style="color:#9ba8c0;font-size:13px;text-align:center;margin-top:20px">좌측 상품 카드를 클릭하면<br>상세 정보가 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* ══════════════════════════════════
     재무관리
  ══════════════════════════════════ */
  finance() {
    const d = window.ARAM_DATA.finance;
    return `
    <div class="page-header">
      <div class="flex-between">
        <div class="page-title">재무관리</div>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:12.5px;color:#9ba8c0">↻ 최종 업데이트: 2026.05.23 09:30</span>
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('재무내역')">CSV</button>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('데이터가 동기화되었습니다.')">↻ 동기화</button>
        </div>
      </div>
    </div>

    <!-- 재무 탭 -->
    <div class="tab-bar" style="margin-bottom:16px">
      <div class="tab active" onclick="switchTab(this,'fin-tab-0')">자금현황</div>
      <div class="tab" onclick="switchTab(this,'fin-tab-1')">세금계산서</div>
      <div class="tab" onclick="switchTab(this,'fin-tab-2')">손익계산서</div>
      <div class="tab" onclick="switchTab(this,'fin-tab-3')">지출결의</div>
      <div class="tab" onclick="switchTab(this,'fin-tab-4')">📊 예산관리</div>
    </div>

    <!-- ── 탭0: 자금현황 ── -->
    <div id="fin-tab-0">

    <!-- KPI Cards -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px">
      ${d.kpis.map(k=>`
      <div class="stat-card">
        <div class="stat-label">${k.label}</div>
        <div class="stat-value sm" style="color:${k.positive?'#10b981':'#1a2035'}">${k.value}</div>
        <div class="chart-container" style="height:40px;margin-top:8px">
          <svg viewBox="0 0 100 40" style="width:100%;height:100%">
            <polyline points="0,35 15,28 30,25 45,30 60,20 75,15 90,18 100,12" fill="none" stroke="${k.color}" stroke-width="2" opacity="0.7"/>
          </svg>
        </div>
      </div>`).join('')}
    </div>

    <!-- Cash Flow Chart -->
    <div class="card mb-16">
      <div class="card-header">
        <span class="card-title">12개월 현금흐름</span>
        <div style="display:flex;gap:14px;font-size:12.5px">
          <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:3px;background:#4361ee;display:inline-block;border-radius:2px"></span>수입</span>
          <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:3px;background:#14b8a6;display:inline-block;border-radius:2px"></span>지출</span>
        </div>
      </div>
      <div class="card-body" style="padding:16px">
        <div class="chart-container" style="height:200px"><canvas id="chart-cashflow"></canvas></div>
      </div>
    </div>

    <!-- Bottom 3 columns -->
    <div class="finance-layout">
      <!-- 은행 잔액 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">은행 잔액</span>
          <span style="font-size:12px;color:#9ba8c0">최종 동기화: 2026.05.23 09:30 ↻</span>
        </div>
        <div class="card-body">
          <ul class="bank-list">
            ${d.banks.map(b=>`
            <li class="bank-item">
              <div class="bank-name"><div class="bank-icon">🏦</div>${b.name}</div>
              <div class="bank-bar"><div class="bank-bar-fill" style="width:${b.pct}%"></div></div>
              <div class="bank-amount">${b.amount}</div>
            </li>`).join('')}
            <li class="bank-item" style="padding-top:12px;margin-top:4px;border-top:1.5px solid #e5e9f2">
              <div class="bank-name" style="font-weight:700">합계</div>
              <div class="bank-bar"></div>
              <div class="bank-amount" style="font-size:14px">₩4,820,000,000</div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 매출/매입 추이 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">매출/매입 추이 (12개월)</span>
          <div style="display:flex;gap:10px;font-size:12px">
            <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:50%;background:#4361ee;display:inline-block"></span>매출</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:50%;background:#14b8a6;display:inline-block"></span>매입</span>
          </div>
        </div>
        <div class="card-body" style="padding:16px">
          <div class="chart-container" style="height:180px"><canvas id="chart-sales-purchase"></canvas></div>
        </div>
      </div>

      <!-- 자금 일정 -->
      <div class="card">
        <div class="card-header"><span class="card-title">자금 일정</span></div>
        <div class="card-body" style="padding:14px">
          <div class="mini-cal">
            <div class="mini-cal-header">
              <span style="font-size:14px;font-weight:700">2026년 5월</span>
              <div style="display:flex;gap:4px">
                <span style="cursor:pointer;color:#9ba8c0;font-size:16px">‹</span>
                <span style="cursor:pointer;color:#9ba8c0;font-size:16px">›</span>
              </div>
            </div>
            <div class="cal-grid">
              ${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-day-label">${d}</div>`).join('')}
              ${Array.from({length:5},(_,i)=>`<div></div>`).join('')}
              ${Array.from({length:31},(_, i)=>{
                const d=i+1;
                const cls = d===20?'today':d===28?'mark-orange':d===30?'mark-blue':d===25?'mark-red':'';
                return `<div class="cal-day ${cls}">${d}</div>`;
              }).join('')}
            </div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;font-size:11.5px">
              <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block"></span>5월 28일 — 지급예정</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#3b82f6;display:inline-block"></span>5월 30일 — 입금예정</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>5월 25일 — 세금</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 최근 거래 내역 -->
    <div class="card mt-16">
      <div class="card-header"><span class="card-title">최근 거래 내역</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>날짜</th><th>거래처</th><th>항목</th><th style="text-align:center">입금/출금</th><th class="td-right">잔액</th><th></th></tr></thead>
          <tbody>
            ${d.recentTx.map(t=>`
            <tr>
              <td style="color:#9ba8c0">${t.date}</td>
              <td style="font-weight:500">${t.client}</td>
              <td>${t.item}</td>
              <td class="td-center">
                <span style="display:flex;align-items:center;gap:4px;justify-content:center">
                  <span style="color:${t.type==='입금'?'#10b981':'#ef4444'};font-size:14px">${t.type==='입금'?'↑':'↓'}</span>
                  <span class="badge ${t.type==='입금'?'badge-green':'badge-red'}">${t.type}</span>
                </span>
              </td>
              <td class="td-right font-600">${t.amount}</td>
              <td><span style="color:#4361ee;cursor:pointer;font-size:13px">›</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div class="page-nums">
          <span class="page-btn">‹</span>
          <span class="page-btn active">1</span>
          <span class="page-btn">/</span>
          <span class="page-btn">10</span>
          <span class="page-btn">›</span>
        </div>
      </div>
    </div>
    </div><!-- /fin-tab-0 -->

    <!-- ── 탭1: 세금계산서 ── -->
    <div id="fin-tab-1" style="display:none">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;gap:8px;align-items:center">
          ${['전체','발행','수취','미발행'].map((s,i)=>`<span style="padding:5px 14px;border-radius:20px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'#f0f2f7'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'transparent'}">${s}</span>`).join('')}
        </div>
        <div style="display:flex;gap:8px">
          <input class="form-input" placeholder="거래처명, 계산서번호 검색" style="width:220px">
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('세금계산서 발행 기능은 준비 중입니다.')">+ 발행</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>계산서번호</th><th>발행일</th><th>거래처</th><th>공급가액</th><th>세액</th><th class="td-right">합계</th><th style="text-align:center">구분</th><th style="text-align:center">상태</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'TI-2026-00234',date:'2026.05.22',client:'(주)대한섬유',  supply:'34,545,455',tax:'3,454,545',total:'38,000,000',type:'발행',status:'전송완료'},
                {no:'TI-2026-00233',date:'2026.05.21',client:'한슬패션',      supply:'30,545,455',tax:'3,054,545',total:'33,600,000',type:'발행',status:'전송완료'},
                {no:'TR-2026-00189',date:'2026.05.20',client:'코리아부자재', supply:'16,363,636',tax:'1,636,364',total:'18,000,000',type:'수취',status:'완료'},
                {no:'TI-2026-00232',date:'2026.05.19',client:'인디고텍스',   supply:'39,545,455',tax:'3,954,545',total:'43,500,000',type:'발행',status:'전송완료'},
                {no:'TR-2026-00188',date:'2026.05.18',client:'동화섬유',      supply:'22,727,273',tax:'2,272,727',total:'25,000,000',type:'수취',status:'완료'},
                {no:'TI-2026-00231',date:'2026.05.17',client:'모던월트',      supply:'50,181,818',tax:'5,018,182',total:'55,200,000',type:'발행',status:'전송완료'},
                {no:'TI-2026-00230',date:'2026.05.16',client:'(주)대한섬유', supply:'23,545,455',tax:'2,354,545',total:'25,900,000',type:'발행',status:'미전송'},
                {no:'TR-2026-00187',date:'2026.05.15',client:'태광데님',      supply:'9,090,909',tax:'909,091', total:'10,000,000',type:'수취',status:'완료'},
              ].map(r=>`
              <tr style="cursor:pointer" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('${r.no} — 세금계산서 상세 기능 준비 중')">
                <td><input type="checkbox" onclick="event.stopPropagation()"></td>
                <td class="td-link" style="font-family:monospace;font-size:12.5px">${r.no}</td>
                <td style="color:#9ba8c0;font-size:12.5px">${r.date}</td>
                <td style="font-weight:500">${r.client}</td>
                <td class="td-right">₩${r.supply}</td>
                <td class="td-right" style="color:#9ba8c0">₩${r.tax}</td>
                <td class="td-right font-600">₩${r.total}</td>
                <td class="td-center"><span class="badge ${r.type==='발행'?'badge-blue':'badge-green'}">${r.type}</span></td>
                <td class="td-center"><span class="badge ${r.status==='전송완료'||r.status==='완료'?'badge-solid-green':'badge-orange'}">${r.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-info">전체 48건</span>
          <div class="page-nums">${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
        </div>
      </div>
    </div><!-- /fin-tab-1 -->

    <!-- ── 탭2: 손익계산서 ── -->
    <div id="fin-tab-2" style="display:none">
      <div style="display:flex;gap:12px;margin-bottom:14px;align-items:center">
        <select class="form-select" style="width:100px"><option>2026년</option><option>2025년</option></select>
        <select class="form-select" style="width:80px">${['전체','1분기','2분기','3분기','4분기'].map(q=>`<option>${q}</option>`).join('')}</select>
        <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('손익계산서')">CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="printPage('#fin-tab-2')">인쇄</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card">
          <div class="card-header"><span class="card-title">손익계산서 (2026년 1~5월)</span></div>
          <div class="card-body">
            <table class="info-table">
              <tr><td style="font-weight:700;color:#1a2035;font-size:14px" colspan="2">매출</td></tr>
              ${[['제품 매출','₩2,415,000,000'],['기타 매출','₩32,400,000']].map(([l,v])=>`<tr><td style="padding-left:16px">${l}</td><td style="text-align:right">${v}</td></tr>`).join('')}
              <tr><td style="font-weight:600;color:#4361ee">매출 합계</td><td style="text-align:right;font-weight:700;color:#4361ee">₩2,447,400,000</td></tr>
              <tr><td style="height:12px" colspan="2"></td></tr>
              <tr><td style="font-weight:700;color:#1a2035;font-size:14px" colspan="2">매출원가</td></tr>
              ${[['원자재비','₩1,102,000,000'],['노무비','₩312,000,000'],['제조경비','₩188,000,000']].map(([l,v])=>`<tr><td style="padding-left:16px">${l}</td><td style="text-align:right">${v}</td></tr>`).join('')}
              <tr><td style="font-weight:600;color:#ef4444">원가 합계</td><td style="text-align:right;font-weight:700;color:#ef4444">₩1,602,000,000</td></tr>
              <tr style="background:#f0fdf4"><td style="font-weight:700;color:#10b981;font-size:14px;padding:12px 0">매출총이익</td><td style="text-align:right;font-weight:700;color:#10b981;font-size:15px">₩845,400,000</td></tr>
              <tr><td style="height:12px" colspan="2"></td></tr>
              <tr><td style="font-weight:700;color:#1a2035;font-size:14px" colspan="2">판관비</td></tr>
              ${[['인건비','₩312,000,000'],['임차료','₩48,000,000'],['감가상각','₩24,000,000'],['기타판관비','₩52,000,000']].map(([l,v])=>`<tr><td style="padding-left:16px">${l}</td><td style="text-align:right">${v}</td></tr>`).join('')}
              <tr><td style="font-weight:600;color:#9ba8c0">판관비 합계</td><td style="text-align:right;font-weight:600;color:#9ba8c0">₩436,000,000</td></tr>
              <tr style="background:#eff2ff"><td style="font-weight:700;color:#4361ee;font-size:15px;padding:14px 0">영업이익</td><td style="text-align:right;font-weight:700;color:#4361ee;font-size:16px">₩409,400,000</td></tr>
            </table>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-header"><span class="card-title">영업이익률 추이</span></div>
            <div class="card-body" style="padding:16px">
              <div style="display:flex;flex-direction:column;gap:10px">
                ${[['1월','14.2%',14],['2월','15.8%',16],['3월','16.1%',16],['4월','17.3%',17],['5월','16.7%',17]].map(([m,v,w])=>`
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:28px;font-size:12.5px;color:#9ba8c0">${m}</div>
                  <div style="flex:1;height:8px;background:#f0f2f7;border-radius:4px;overflow:hidden">
                    <div style="width:${w*4.5}%;height:100%;background:linear-gradient(90deg,#4361ee,#8b5cf6);border-radius:4px"></div>
                  </div>
                  <div style="width:40px;font-size:12.5px;font-weight:600;color:#4361ee;text-align:right">${v}</div>
                </div>`).join('')}
              </div>
            </div>
          </div>
          <div class="card" style="flex:1">
            <div class="card-header"><span class="card-title">전년 동기 비교</span></div>
            <div class="card-body">
              ${[['매출','₩2,447M','↑21.3%','#10b981'],['원가','₩1,602M','↑18.2%','#f59e0b'],['영업이익','₩409M','↑28.7%','#4361ee'],['영업이익률','16.7%','↑1.1%p','#8b5cf6']].map(([l,v,c,col])=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f2f4f8">
                <span style="font-size:13.5px;color:#6b7a99">${l}</span>
                <div style="text-align:right">
                  <div style="font-size:14px;font-weight:700">${v}</div>
                  <div style="font-size:12px;color:${col}">${c} vs 전년</div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div><!-- /fin-tab-2 -->

    <!-- ── 탭3: 지출결의 ── -->
    <div id="fin-tab-3" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="display:flex;gap:8px">
          ${['전체','승인대기','승인완료','반려'].map((s,i)=>`<span style="padding:5px 14px;border-radius:20px;font-size:12.5px;cursor:pointer;background:${i===0?'#4361ee':'#f0f2f7'};color:${i===0?'#fff':'#6b7a99'};border:1.5px solid ${i===0?'#4361ee':'transparent'}">${s}</span>`).join('')}
        </div>
        <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Modal.open({title:'지출결의서 작성',size:'lg',body:\`<div class='form-section'><div class='form-section-title'>지출 정보</div><div class='form-grid'><div class='form-field'><label>지출 항목 <span style='color:#ef4444'>*</span></label><input class='form-input' placeholder='항목명 입력'></div><div class='form-field'><label>금액 <span style='color:#ef4444'>*</span></label><input class='form-input' type='number' placeholder='0'></div><div class='form-field'><label>지출일</label><input class='form-input' type='date'></div><div class='form-field'><label>지출 유형</label><select class='form-select'><option>교통비</option><option>접대비</option><option>소모품비</option><option>업무비</option><option>기타</option></select></div><div class='form-field full'><label>적요</label><textarea class='form-input' placeholder='지출 내용 입력'></textarea></div></div></div>\`,footer:[{label:'취소',type:'secondary',onClick:c=>c()},{label:'결의서 제출',type:'primary',onClick:c=>{c();ARAM_UI.Toast.success('지출결의서가 제출되었습니다.')}}]})">+ 결의서 작성</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>결의번호</th><th>제출일</th><th>제출자</th><th>항목</th><th>유형</th><th class="td-right">금액</th><th style="text-align:center">상태</th><th>승인자</th></tr></thead>
            <tbody>
              ${[
                {no:'EX-2026-00089',date:'2026.05.23',user:'김영업',item:'고객 접대비',type:'접대비',  amount:'450,000',  status:'승인대기', approver:'-'},
                {no:'EX-2026-00088',date:'2026.05.22',user:'이생산',item:'소모품 구매', type:'소모품비',amount:'128,000',  status:'승인완료', approver:'김민수 대표'},
                {no:'EX-2026-00087',date:'2026.05.21',user:'박기술',item:'출장 교통비', type:'교통비',  amount:'86,000',   status:'승인완료', approver:'김민수 대표'},
                {no:'EX-2026-00086',date:'2026.05.20',user:'최회계',item:'사무용품',    type:'소모품비',amount:'67,500',   status:'반려',     approver:'김민수 대표'},
                {no:'EX-2026-00085',date:'2026.05.19',user:'김영업',item:'거래처 식대', type:'접대비',  amount:'320,000',  status:'승인완료', approver:'김민수 대표'},
                {no:'EX-2026-00084',date:'2026.05.18',user:'이수진',item:'교육비',       type:'업무비',  amount:'150,000',  status:'승인완료', approver:'김민수 대표'},
              ].map(r=>`
              <tr style="cursor:pointer">
                <td class="td-link" style="font-family:monospace;font-size:12.5px">${r.no}</td>
                <td style="color:#9ba8c0;font-size:12.5px">${r.date}</td>
                <td style="font-weight:500">${r.user}</td>
                <td>${r.item}</td>
                <td><span class="badge badge-blue">${r.type}</span></td>
                <td class="td-right font-600">₩${r.amount}</td>
                <td class="td-center"><span class="badge ${r.status==='승인완료'?'badge-solid-green':r.status==='반려'?'badge-err':'badge-orange'}">${r.status}</span></td>
                <td style="font-size:12.5px;color:#9ba8c0">${r.approver}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-info">전체 89건</span>
          <div class="page-nums">${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
        </div>
      </div>
    </div><!-- /fin-tab-3 -->

    <!-- ── 탭4: 예산관리 ── -->
    <div id="fin-tab-4" style="display:none">
      <!-- 예산 KPI -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        ${[
          {label:'연간 예산',  value:'₩5.2억', sub:'2026년 전사 예산',  color:'#4361ee', pct:null},
          {label:'집행 완료',  value:'₩2.18억',sub:'전체의 41.9% 집행',  color:'#10b981', pct:41.9},
          {label:'잔여 예산',  value:'₩3.02억',sub:'미집행 잔액',        color:'#3b82f6', pct:58.1},
          {label:'초과 부서',  value:'2개',     sub:'예산 초과 경고',     color:'#ef4444', pct:null},
        ].map(k=>`
        <div class="stat-card">
          <div class="stat-label">${k.label}</div>
          <div class="stat-value sm" style="color:${k.color}">${k.value}</div>
          <div style="font-size:12px;color:#9ba8c0;margin-top:2px">${k.sub}</div>
          ${k.pct !== null ? `
          <div style="margin-top:8px">
            <div class="progress-bar" style="height:5px">
              <div class="progress-fill" style="width:${k.pct}%;background:${k.color}"></div>
            </div>
          </div>` : ''}
        </div>`).join('')}
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px">
        <!-- 부서별 예산 vs 실적 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">부서별 예산 집행현황</span>
            <div style="display:flex;gap:8px">
              <select class="form-select" style="height:28px;font-size:12px;padding:0 8px">
                <option>2026년 전체</option><option>2026년 상반기</option><option>2026년 하반기</option>
              </select>
              <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('부서별예산')">CSV ↓</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>부서명</th>
                <th class="td-right">예산</th>
                <th class="td-right">집행액</th>
                <th class="td-right">잔액</th>
                <th style="width:140px">집행률</th>
                <th class="td-center">상태</th>
                <th class="td-center">액션</th>
              </tr></thead>
              <tbody>
                ${[
                  {dept:'영업본부',      budget:'120,000,000', used:'58,320,000',  remain:'61,680,000', pct:48.6, status:'정상'},
                  {dept:'생산관리팀',    budget:'85,000,000',  used:'41,820,000',  remain:'43,180,000', pct:49.2, status:'정상'},
                  {dept:'DTP팀',         budget:'65,000,000',  used:'38,450,000',  remain:'26,550,000', pct:59.2, status:'주의'},
                  {dept:'자수팀',        budget:'55,000,000',  used:'29,700,000',  remain:'25,300,000', pct:54.0, status:'정상'},
                  {dept:'퀄팅팀',        budget:'48,000,000',  used:'51,840,000',  remain:'-3,840,000', pct:108.0, status:'초과'},
                  {dept:'재고관리팀',    budget:'35,000,000',  used:'16,100,000',  remain:'18,900,000', pct:46.0, status:'정상'},
                  {dept:'재무회계팀',    budget:'30,000,000',  used:'11,700,000',  remain:'18,300,000', pct:39.0, status:'정상'},
                  {dept:'인사지원팀',    budget:'42,000,000',  used:'45,150,000',  remain:'-3,150,000', pct:107.5, status:'초과'},
                  {dept:'경영지원팀',    budget:'40,000,000',  used:'15,600,000',  remain:'24,400,000', pct:39.0, status:'정상'},
                ].map(r=>{
                  const isOver = r.pct > 100;
                  const isWarn = r.pct >= 80 && r.pct <= 100;
                  const barColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
                  const dispPct = Math.min(r.pct, 100);
                  return `
                  <tr>
                    <td style="font-weight:500">${r.dept}</td>
                    <td class="td-right" style="font-size:12.5px">₩${r.budget}</td>
                    <td class="td-right" style="font-size:12.5px;color:${isOver?'#ef4444':'inherit'};font-weight:${isOver?'700':'400'}">₩${r.used}</td>
                    <td class="td-right" style="font-size:12.5px;color:${r.remain.startsWith('-')?'#ef4444':'#9ba8c0'}">₩${r.remain}</td>
                    <td style="padding:8px 12px">
                      <div style="display:flex;align-items:center;gap:6px">
                        <div style="flex:1;height:6px;background:#e5e9f2;border-radius:3px;overflow:hidden">
                          <div style="width:${dispPct}%;height:100%;background:${barColor};border-radius:3px;transition:width .4s ease"></div>
                        </div>
                        <span style="font-size:12px;font-weight:700;color:${barColor};min-width:38px;text-align:right">${r.pct}%</span>
                      </div>
                    </td>
                    <td class="td-center">
                      <span class="badge ${isOver?'badge-err':isWarn?'badge-orange':'badge-solid-green'}">${r.status}</span>
                    </td>
                    <td class="td-center">
                      <button class="btn btn-secondary btn-sm" style="height:24px;font-size:11px;padding:0 8px"
                        onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${r.dept} 예산 상세')">상세</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 월별 예산 vs 실적 차트 + 집행 분석 -->
        <div style="display:flex;flex-direction:column;gap:12px">
          <!-- 집행 분석 -->
          <div class="card">
            <div class="card-header"><span class="card-title">항목별 집행 분석</span></div>
            <div class="card-body" style="padding:14px 16px">
              ${[
                {label:'인건비',   color:'#4361ee', budget:210, used:108.5, pct:51.7},
                {label:'원자재',   color:'#14b8a6', budget:148, used:68.2,  pct:46.1},
                {label:'운영비',   color:'#f59e0b', budget:89,  used:52.8,  pct:59.3},
                {label:'마케팅',   color:'#8b5cf6', budget:42,  used:38.4,  pct:91.4},
                {label:'설비투자', color:'#ef4444', budget:31,  used:36.3,  pct:117.1},
              ].map(r=>{
                const isOver = r.pct>100;
                const dispPct = Math.min(r.pct, 100);
                return `
                <div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                    <div style="display:flex;align-items:center;gap:6px">
                      <span style="width:8px;height:8px;border-radius:50%;background:${r.color};flex-shrink:0"></span>
                      <span style="font-weight:500">${r.label}</span>
                    </div>
                    <div style="font-size:12px;color:#9ba8c0">${r.used}M / ${r.budget}M</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:8px;background:#e5e9f2;border-radius:4px;overflow:hidden">
                      <div style="width:${dispPct}%;height:100%;background:${r.color};border-radius:4px"></div>
                    </div>
                    <span style="font-size:12px;font-weight:700;color:${isOver?'#ef4444':r.color};min-width:40px;text-align:right">${r.pct}%</span>
                    ${isOver?`<span class="badge badge-err" style="font-size:10px;padding:1px 5px">초과</span>`:''}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>

          <!-- 예산 알림 -->
          <div class="card">
            <div class="card-header"><span class="card-title">⚠️ 예산 알림</span></div>
            <div class="card-body" style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
              ${[
                {dept:'퀄팅팀',  msg:'예산 초과 ₩3,840,000', color:'#ef4444', bg:'#fef2f2'},
                {dept:'인사지원팀', msg:'예산 초과 ₩3,150,000', color:'#ef4444', bg:'#fef2f2'},
                {dept:'마케팅',  msg:'집행률 91.4% 경고', color:'#f59e0b', bg:'#fffbeb'},
                {dept:'설비투자', msg:'집행률 117% 초과', color:'#ef4444', bg:'#fef2f2'},
              ].map(a=>`
              <div style="padding:8px 10px;background:${a.bg};border-radius:6px;border-left:3px solid ${a.color}">
                <div style="font-size:12.5px;font-weight:600;color:${a.color}">🚨 ${a.dept}</div>
                <div style="font-size:11.5px;color:#6b7a99;margin-top:2px">${a.msg}</div>
              </div>`).join('')}
              <button class="btn btn-primary" style="width:100%;margin-top:4px"
                onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('예산 조정 요청이 전송되었습니다.')">
                📋 예산 조정 요청
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 월별 예산 vs 실적 바 차트 (SVG) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">월별 예산 vs 실적 추이 (2026년)</span>
          <div style="display:flex;gap:14px;font-size:12.5px;align-items:center">
            <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#4361ee;display:inline-block"></span>예산</span>
            <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:2px;background:#10b981;display:inline-block"></span>실적</span>
            <button class="btn btn-secondary btn-sm">연간 보고서 ↓</button>
          </div>
        </div>
        <div class="card-body" style="padding:20px">
          <div style="display:flex;align-items:flex-end;gap:6px;height:160px;padding-bottom:4px">
            ${[
              {m:'1월',budget:38,actual:35},
              {m:'2월',budget:36,actual:32},
              {m:'3월',budget:42,actual:40},
              {m:'4월',budget:44,actual:43},
              {m:'5월',budget:46,actual:48},
              {m:'6월',budget:48,actual:null},
              {m:'7월',budget:50,actual:null},
              {m:'8월',budget:52,actual:null},
              {m:'9월',budget:50,actual:null},
              {m:'10월',budget:48,actual:null},
              {m:'11월',budget:44,actual:null},
              {m:'12월',budget:42,actual:null},
            ].map(r=>{
              const maxV = 65;
              const bh = Math.round((r.budget/maxV)*140);
              const ah = r.actual !== null ? Math.round((r.actual/maxV)*140) : 0;
              const isOver = r.actual !== null && r.actual > r.budget;
              return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
                <div style="display:flex;align-items:flex-end;gap:2px;height:140px">
                  <div style="width:12px;height:${bh}px;background:#4361ee;border-radius:2px 2px 0 0;opacity:.5" title="예산: ₩${r.budget}M"></div>
                  ${r.actual !== null ? `<div style="width:12px;height:${ah}px;background:${isOver?'#ef4444':'#10b981'};border-radius:2px 2px 0 0" title="실적: ₩${r.actual}M"></div>` :
                  '<div style="width:12px;height:4px;background:#e5e9f2;border-radius:2px 2px 0 0;align-self:flex-end"></div>'}
                </div>
                <div style="font-size:11px;color:#9ba8c0;text-align:center;margin-top:4px">${r.m}</div>
              </div>`;
            }).join('')}
          </div>
          <div style="margin-top:10px;padding:10px;background:#eff2ff;border-radius:8px;font-size:12.5px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:#4361ee">📊 1~5월 집행 현황: 예산 ₩2.06억 / 실적 ₩1.98억 (집행률 96.1%)</span>
            <span style="color:#9ba8c0">5월 초과: ₩200만</span>
          </div>
        </div>
      </div>
    </div><!-- /fin-tab-4 -->`;
  },

  /* ══════════════════════════════════
     인사관리
  ══════════════════════════════════ */
  hr() {
    const d = window.ARAM_DATA.hr;
    return `
    <div class="page-header">
      <div class="flex-between">
        <div class="page-title">인사관리</div>
        <div style="display:flex;gap:8px">
          <input class="form-input" placeholder="사원명, 부서 검색" style="width:200px">
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('사원 등록 기능은 준비 중입니다.')">+ 사원 등록</button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${d.kpis.map((k,i)=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:46px;height:46px;border-radius:12px;background:${k.color}18;display:flex;align-items:center;justify-content:center;font-size:22px">
          ${['👥','📥','📅','📊'][i]||'📋'}
        </div>
        <div><div class="stat-label">${k.label}</div><div class="stat-value">${k.value}</div><div style="font-size:12px;color:#9ba8c0">${k.sub}</div></div>
      </div>`).join('')}
    </div>

    <!-- HR 탭 -->
    <div class="tab-bar" style="margin-bottom:16px">
      <div class="tab active" onclick="switchTab(this,'hr-tab-0')">조직/사원</div>
      <div class="tab" onclick="switchTab(this,'hr-tab-1')">근태관리</div>
      <div class="tab" onclick="switchTab(this,'hr-tab-2')">급여현황</div>
      <div class="tab" onclick="switchTab(this,'hr-tab-3')">평가/교육</div>
    </div>

    <!-- ── HR 탭0: 조직/사원 ── -->
    <div id="hr-tab-0">

    <div class="hr-layout">
      <!-- 조직도 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">조직도</span>
          <input class="form-input" placeholder="조직/팀 검색" style="width:130px;height:28px;font-size:12px">
        </div>
        <div class="card-body" style="padding:14px;overflow-x:auto">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0">
            <!-- CEO -->
            <div style="text-align:center;padding:10px 18px;background:#4361ee;color:#fff;border-radius:8px;min-width:100px;margin-bottom:20px;position:relative">
              <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.3);margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:16px">👤</div>
              <div style="font-size:12.5px;font-weight:600">대표이사</div>
              <div style="font-size:11px;opacity:.8">김민수</div>
              <div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);width:2px;height:20px;background:#e5e9f2"></div>
            </div>
            <!-- Divisions -->
            <div style="display:flex;gap:12px;margin-bottom:0;position:relative">
              <div style="position:absolute;top:-1px;left:10%;right:10%;height:1px;background:#e5e9f2;top:0"></div>
              ${[['경영지원본부','23명'],['영업본부','32명'],['생산본부','62명'],['기술본부','25명']].map(([n,c])=>`
              <div style="display:flex;flex-direction:column;align-items:center;gap:0">
                <div style="width:1px;height:16px;background:#e5e9f2"></div>
                <div style="padding:8px 12px;border:1.5px solid #e5e9f2;border-radius:8px;text-align:center;min-width:80px;cursor:pointer;transition:.15s" onmouseover="this.style.borderColor='#4361ee'" onmouseout="this.style.borderColor='#e5e9f2'">
                  <div style="font-size:12px;font-weight:600;color:#1a2035">${n}</div>
                  <div style="font-size:11px;color:#9ba8c0">${c}</div>
                </div>
                ${n==='생산본부'?`
                <div style="width:1px;height:12px;background:#e5e9f2"></div>
                <div style="display:flex;gap:6px">
                  ${[['DTP팀','12명',true],['자수팀','16명'],['퀄팅팀','18명'],['품질팀','16명']].map(([t,tc,active])=>`
                  <div style="padding:6px 8px;border:1.5px solid ${active?'#4361ee':'#e5e9f2'};border-radius:6px;text-align:center;cursor:pointer;background:${active?'#eff2ff':''}">
                    <div style="font-size:11px;font-weight:600;color:${active?'#4361ee':'#1a2035'}">${t}</div>
                    <div style="font-size:10px;color:#9ba8c0">${tc}</div>
                  </div>`).join('')}
                </div>`:''}
              </div>`).join('')}
            </div>
          </div>
        </div>
        <!-- Bottom stats -->
        <div style="padding:12px 16px;border-top:1px solid #f2f4f8;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${[['이번달 출근','96%','평균 출근율'],['휴가사용 평균','1.2일','1인당'],['야근시간 평균','4시간','1인당']].map(([l,v,s])=>`
          <div style="text-align:center;padding:10px;background:#f8f9fc;border-radius:8px">
            <div style="font-size:11.5px;color:#9ba8c0">${l}</div>
            <div style="font-size:18px;font-weight:700;color:#1a2035;margin:2px 0">${v}</div>
            <div style="font-size:11px;color:#9ba8c0">${s}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Team Members -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div>
            <div style="font-size:16px;font-weight:700">DTP팀 (12명)</div>
            <div style="font-size:13px;color:#9ba8c0">이정훈 팀장 &nbsp;☎ 010-1234-5678 &nbsp;✉ lee.junghoon@aram.co.kr</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm">팀 편집</button>
            <button class="btn btn-primary btn-sm">+ 구성원 추가</button>
          </div>
        </div>

        <div class="member-grid">
          ${d.teamMembers.map(m=>`
          <div class="member-card" style="cursor:pointer" onclick="openEmpProfile('${m.name}','${m.title}','${m.dept}','${m.joined}','${m.status}')">
            <div class="member-card-avatar">${m.name[0]}</div>
            <div>
              <div class="member-info-name">${m.name}</div>
              <div class="member-info-title">${m.title} &nbsp;|&nbsp; ${m.dept}</div>
              <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:5px">입사일 ${m.joined}</div>
              <div class="member-status">
                <div class="status-dot ${m.statusColor}"></div>
                <span style="color:${m.statusColor==='green'?'#10b981':m.statusColor==='orange'?'#f59e0b':'#9ba8c0'}">${m.status}</span>
              </div>
            </div>
          </div>`).join('')}
        </div>

        <!-- Attendance + Birthday -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
          <div class="card">
            <div class="card-header"><span class="card-title">근태 현황</span></div>
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div class="chart-container" style="width:120px;height:120px;flex-shrink:0"><canvas id="chart-attendance"></canvas></div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${[['출근','#10b981','9명 (75%)'],['외근','#3b82f6','1명 (8%)'],['휴가','#f59e0b','1명 (8%)'],['결근','#9ba8c0','1명 (8%)']].map(([l,c,v])=>`
                <div style="display:flex;align-items:center;gap:6px;font-size:12.5px">
                  <span style="width:10px;height:10px;border-radius:50%;background:${c}"></span>
                  <span style="color:#6b7a99;width:40px">${l}</span>
                  <span style="font-weight:600">${v}</span>
                </div>`).join('')}
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">이번달 생일자 (3명)</span><a style="font-size:12.5px;color:#4361ee;cursor:pointer">전체보기</a></div>
            <div class="card-body" style="display:flex;gap:12px;justify-content:center">
              ${[['오재형','05.12'],['정다은','05.19'],['최유리','05.27']].map(n=>`
              <div style="text-align:center">
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:600;margin:0 auto 4px">${n[0][0]}</div>
                <div style="font-size:12.5px;font-weight:600">${n[0]}</div>
                <div style="font-size:11px;color:#f59e0b">🎂 ${n[1]}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div><!-- /hr-tab-0 -->

    <!-- ── HR 탭1: 근태관리 ── -->
    <div id="hr-tab-1" style="display:none">

      <!-- 연차/원격근무 신청 바 -->
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="window._openLeaveModal('연차신청')">
          🏖 연차신청
        </button>
        <button class="btn btn-secondary" onclick="window._openLeaveModal('반차신청')">
          🕛 반차신청
        </button>
        <button class="btn btn-secondary" onclick="window._openLeaveModal('원격근무신청')">
          🏠 원격근무 신청
        </button>
        <button class="btn btn-secondary" onclick="window._openLeaveModal('초과근무신청')">
          ⏰ 초과근무 신청
        </button>
        <div style="margin-left:auto;display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:10px;padding:8px 14px;font-size:13px">
          <span style="color:#9ba8c0">잔여연차</span>
          <span style="font-weight:700;color:#4361ee;font-size:18px">12일</span>
          <span style="color:#9ba8c0;font-size:12px">(사용 3일 / 부여 15일)</span>
        </div>
      </div>

      <!-- 신청 현황 (미니 테이블) -->
      <div class="card mb-16">
        <div class="card-header">
          <span class="card-title">나의 신청 현황</span>
          <span style="font-size:12.5px;color:#9ba8c0">2026년 5월 기준</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>신청번호</th><th>종류</th><th>신청일</th><th>기간/일시</th>
              <th>사유</th><th>결재자</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'LV-2026-0042',type:'연차',date:'05-15',period:'05-20 (1일)',reason:'개인 사정',appr:'이준호 차장',status:'승인완료',sc:'green'},
                {no:'LV-2026-0041',type:'반차',date:'05-08',period:'05-10 오전',reason:'병원 방문',appr:'이준호 차장',status:'승인완료',sc:'green'},
                {no:'WF-2026-0018',type:'원격근무',date:'05-19',period:'05-21 (1일)',reason:'집중 작업',appr:'이준호 차장',status:'승인대기',sc:'orange'},
                {no:'OT-2026-0031',type:'초과근무',date:'05-18',period:'05-19 18:00~21:00',reason:'납기 대응',appr:'이준호 차장',status:'승인완료',sc:'green'},
              ].map(r=>`
              <tr>
                <td style="font-family:monospace;font-size:12px;color:#4361ee">${r.no}</td>
                <td><span class="badge badge-${r.type==='연차'?'blue':r.type==='원격근무'?'purple':r.type==='반차'?'teal':'orange'}">${r.type}</span></td>
                <td style="font-size:12.5px">2026-${r.date}</td>
                <td style="font-size:12.5px">${r.period}</td>
                <td style="font-size:12.5px;color:#9ba8c0">${r.reason}</td>
                <td style="font-size:12.5px">${r.appr}</td>
                <td><span class="badge badge-${r.sc}">${r.status}</span></td>
                <td>
                  ${r.status==='승인대기'?`<button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px;color:#ef4444"
                    onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('신청이 취소되었습니다.')">취소</button>`
                    :`<button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                    onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('상세보기')">상세</button>`}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mb-16">
        <div class="card-header" style="flex-wrap:wrap;gap:8px">
          <span class="card-title">근태 현황 — 2026년 5월</span>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select class="form-select" style="width:110px">
              <option>2026년 5월</option>
              <option>2026년 4월</option>
              <option>2026년 3월</option>
            </select>
            <select class="form-select" style="width:120px">
              <option>전체 부서</option>
              <option>DTP팀</option>
              <option>자수팀</option>
              <option>퀄팅팀</option>
            </select>
            <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('근태현황')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>
        </div>

        <!-- 근태 요약 KPI -->
        <div style="padding:14px 16px;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;border-bottom:1px solid #f2f4f8">
          ${[['정상출근','142명','#10b981'],['지각','3명','#f59e0b'],['조기퇴근','2명','#f59e0b'],['결근','1명','#ef4444'],['연차','4명','#6b7a99']].map(([l,v,c])=>`
          <div style="text-align:center;padding:10px;background:#f8f9fc;border-radius:8px">
            <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:4px">${l}</div>
            <div style="font-size:20px;font-weight:700;color:${c}">${v}</div>
          </div>`).join('')}
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>사원명</th><th>부서</th><th>직책</th>
              <th class="td-center">출근시간</th><th class="td-center">퇴근시간</th>
              <th class="td-center">근무시간</th><th class="td-center">초과근무</th>
              <th class="td-center">휴가사용</th><th class="td-center">상태</th>
            </tr></thead>
            <tbody>
              ${[
                {name:'이정훈',dept:'DTP팀',title:'팀장',  in:'08:52',out:'18:10',work:'9h 18m',ot:'1h 10m',vac:'0일',st:'정상'},
                {name:'김다현',dept:'DTP팀',title:'대리',  in:'09:01',out:'18:03',work:'9h 02m',ot:'1h 03m',vac:'0일',st:'정상'},
                {name:'박준영',dept:'DTP팀',title:'사원',  in:'09:24',out:'18:00',work:'8h 36m',ot:'0h 00m',vac:'0일',st:'지각'},
                {name:'최수아',dept:'DTP팀',title:'사원',  in:'09:00',out:'17:30',work:'8h 30m',ot:'0h 00m',vac:'0일',st:'조기퇴근'},
                {name:'오재형',dept:'자수팀',title:'주임',  in:'08:55',out:'18:05',work:'9h 10m',ot:'1h 05m',vac:'0일',st:'정상'},
                {name:'정다은',dept:'자수팀',title:'사원',  in:'-',out:'-',work:'-',ot:'-',vac:'1일',st:'연차'},
                {name:'한지수',dept:'퀄팅팀',title:'대리',  in:'08:58',out:'18:02',work:'9h 04m',ot:'1h 02m',vac:'0일',st:'정상'},
                {name:'유민호',dept:'퀄팅팀',title:'사원',  in:'09:00',out:'18:00',work:'9h 00m',ot:'1h 00m',vac:'0일',st:'정상'},
                {name:'임소연',dept:'품질팀',title:'주임',  in:'-',out:'-',work:'-',ot:'-',vac:'0일',st:'결근'},
                {name:'강민준',dept:'품질팀',title:'사원',  in:'09:03',out:'18:01',work:'8h 58m',ot:'0h 58m',vac:'0일',st:'정상'},
              ].map(r=>`
              <tr>
                <td><b>${r.name}</b></td>
                <td>${r.dept}</td>
                <td>${r.title}</td>
                <td class="td-center" style="font-family:monospace;font-size:12.5px">${r.in}</td>
                <td class="td-center" style="font-family:monospace;font-size:12.5px">${r.out}</td>
                <td class="td-center" style="font-weight:600">${r.work}</td>
                <td class="td-center" style="color:${r.ot!=='-'&&r.ot!=='0h 00m'?'#f59e0b':'#9ba8c0'}">${r.ot}</td>
                <td class="td-center" style="color:${r.vac!=='0일'?'#4361ee':'#9ba8c0'}">${r.vac}</td>
                <td class="td-center">
                  <span class="badge ${r.st==='정상'?'badge-solid-green':r.st==='지각'?'badge-orange':r.st==='결근'?'badge-err':r.st==='연차'?'badge-blue':'badge-orange'}">${r.st}</span>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <!-- 월간 근태 캘린더 미니 -->
        <div style="padding:14px 16px;border-top:1px solid var(--bdr)">
          <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:10px">5월 달력 요약</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:11.5px;text-align:center">
            ${['일','월','화','수','목','금','토'].map(d=>`<div style="color:#9ba8c0;font-weight:600;padding:4px 0">${d}</div>`).join('')}
            ${Array.from({length:4},()=>`<div></div>`).join('')}
            ${Array.from({length:31},(_,i)=>{
              const day = i+1;
              const isWeekend = (day+3)%7===0||(day+3)%7===6;
              const isToday = day===20;
              const isHoliday = day===5;
              return `<div style="padding:4px 2px;border-radius:4px;background:${isToday?'#4361ee':isHoliday?'#fee2e2':'transparent'};color:${isToday?'#fff':isHoliday?'#ef4444':isWeekend?'#9ba8c0':'var(--txt)'};font-weight:${isToday?'700':'400'}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div><!-- /근태현황 card -->
    </div><!-- /hr-tab-1 -->

    <!-- ── HR 탭2: 급여현황 ── -->
    <div id="hr-tab-2" style="display:none">

      <!-- 급여 요약 -->
      <div class="stat-grid mb-16">
        ${[['이번달 급여총액','₩427,200,000','전월 대비 2.1% ↑','💰'],['평균 급여','₩3,840,000','전월 대비 1.8% ↑','📊'],['성과급 지급','₩24,500,000','14명 대상','⭐'],['4대보험 합계','₩38,448,000','급여의 9.0%','🏦']].map(([l,v,s,i])=>`
        <div class="stat-card">
          <div style="font-size:22px;margin-bottom:6px">${i}</div>
          <div class="stat-label">${l}</div>
          <div class="stat-value sm">${v}</div>
          <div class="stat-change up" style="font-size:11.5px">${s}</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:8px">
          <span class="card-title">급여 명세 — 2026년 5월 지급</span>
          <div style="display:flex;gap:8px;align-items:center">
            <select class="form-select" style="width:130px">
              <option>2026년 5월</option>
              <option>2026년 4월</option>
            </select>
            <select class="form-select" style="width:110px">
              <option>전체 부서</option>
              <option>DTP팀</option>
              <option>자수팀</option>
            </select>
            <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('급여현황')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
            <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('급여 명세서를 일괄 발송했습니다.')">
              명세서 발송
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>사원명</th><th>부서</th><th>직책</th>
              <th class="td-right">기본급</th>
              <th class="td-right">수당</th>
              <th class="td-right">성과급</th>
              <th class="td-right">공제액</th>
              <th class="td-right font-600">실수령액</th>
              <th class="td-center">지급일</th>
              <th class="td-center">명세서</th>
            </tr></thead>
            <tbody>
              ${[
                {name:'이정훈',dept:'DTP팀',  title:'팀장',base:'4,500,000',allowance:'350,000',bonus:'500,000',deduct:'481,500',net:'4,868,500'},
                {name:'김다현',dept:'DTP팀',  title:'대리',base:'3,200,000',allowance:'200,000',bonus:'0',deduct:'316,800',net:'3,083,200'},
                {name:'박준영',dept:'DTP팀',  title:'사원',base:'2,800,000',allowance:'150,000',bonus:'0',deduct:'272,700',net:'2,677,300'},
                {name:'최수아',dept:'DTP팀',  title:'사원',base:'2,600,000',allowance:'150,000',bonus:'0',deduct:'249,660',net:'2,500,340'},
                {name:'오재형',dept:'자수팀',  title:'주임',base:'3,000,000',allowance:'180,000',bonus:'200,000',deduct:'297,180',net:'3,082,820'},
                {name:'정다은',dept:'자수팀',  title:'사원',base:'2,600,000',allowance:'150,000',bonus:'0',deduct:'249,660',net:'2,500,340'},
                {name:'한지수',dept:'퀄팅팀',  title:'대리',base:'3,400,000',allowance:'220,000',bonus:'300,000',deduct:'336,420',net:'3,583,580'},
                {name:'유민호',dept:'퀄팅팀',  title:'사원',base:'2,700,000',allowance:'150,000',bonus:'0',deduct:'261,270',net:'2,588,730'},
              ].map(r=>`
              <tr>
                <td><b>${r.name}</b></td>
                <td>${r.dept}</td>
                <td>${r.title}</td>
                <td class="td-right">₩${r.base}</td>
                <td class="td-right" style="color:#10b981">₩${r.allowance}</td>
                <td class="td-right" style="color:#4361ee">${r.bonus!=='0'?'₩'+r.bonus:'—'}</td>
                <td class="td-right" style="color:#ef4444">-₩${r.deduct}</td>
                <td class="td-right font-600">₩${r.net}</td>
                <td class="td-center" style="font-size:12px;color:#9ba8c0">2026.05.25</td>
                <td class="td-center">
                  <button class="btn btn-secondary btn-sm" style="font-size:11px;padding:2px 8px"
                    onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('${r.name} 급여 명세서를 출력합니다.')">출력</button>
                </td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr style="background:#f8f9fc">
                <td colspan="3" style="font-weight:700;text-align:right">합계</td>
                <td class="td-right font-600">₩24,800,000</td>
                <td class="td-right font-600" style="color:#10b981">₩1,400,000</td>
                <td class="td-right font-600" style="color:#4361ee">₩1,000,000</td>
                <td class="td-right font-600" style="color:#ef4444">-₩2,465,190</td>
                <td class="td-right font-600" style="color:#4361ee">₩24,734,810</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div><!-- /hr-tab-2 -->

    <!-- ── HR 탭3: 평가/교육 ── -->
    <div id="hr-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

        <!-- 인사평가 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">인사평가 현황 — 2026 상반기</span>
            <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('평가 시트를 생성했습니다.')">평가 시작</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>사원명</th><th>부서</th>
                <th class="td-center">업무성과</th>
                <th class="td-center">역량</th>
                <th class="td-center">태도</th>
                <th class="td-center">종합등급</th>
              </tr></thead>
              <tbody>
                ${[
                  {name:'이정훈',dept:'DTP팀',  perf:'A',comp:'A',att:'S',grade:'A+'},
                  {name:'김다현',dept:'DTP팀',  perf:'B+',comp:'A',att:'A',grade:'A'},
                  {name:'박준영',dept:'DTP팀',  perf:'B',comp:'B+',att:'B+',grade:'B+'},
                  {name:'오재형',dept:'자수팀',  perf:'A',comp:'B+',att:'A',grade:'A'},
                  {name:'정다은',dept:'자수팀',  perf:'B+',comp:'B',att:'A',grade:'B+'},
                  {name:'한지수',dept:'퀄팅팀',  perf:'S',comp:'A',att:'S',grade:'S'},
                  {name:'유민호',dept:'퀄팅팀',  perf:'B',comp:'B',att:'B+',grade:'B'},
                ].map(r=>{
                  const gc={'S':'#8b5cf6','A+':'#4361ee','A':'#10b981','B+':'#f59e0b','B':'#9ba8c0'};
                  return `
                  <tr>
                    <td><b>${r.name}</b></td>
                    <td style="font-size:12.5px;color:#9ba8c0">${r.dept}</td>
                    <td class="td-center"><span style="font-weight:600;color:${gc[r.perf]||'#1a2035'}">${r.perf}</span></td>
                    <td class="td-center"><span style="font-weight:600;color:${gc[r.comp]||'#1a2035'}">${r.comp}</span></td>
                    <td class="td-center"><span style="font-weight:600;color:${gc[r.att]||'#1a2035'}">${r.att}</span></td>
                    <td class="td-center">
                      <span class="badge" style="background:${gc[r.grade]||'#9ba8c0'}18;color:${gc[r.grade]||'#9ba8c0'};font-weight:700;min-width:36px;text-align:center">${r.grade}</span>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 교육 일정 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">교육/연수 일정</span>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('교육 신청이 완료되었습니다.')">+ 신청</button>
          </div>
          <div style="padding:4px 0">
            ${[
              {title:'DTP 장비 안전교육',date:'2026.05.22',target:'DTP팀 전체',hours:'4H',status:'예정',color:'#4361ee'},
              {title:'ISO 9001 품질관리 교육',date:'2026.05.28',target:'품질팀',hours:'8H',status:'예정',color:'#4361ee'},
              {title:'소방안전교육',date:'2026.06.03',target:'전사',hours:'2H',status:'예정',color:'#10b981'},
              {title:'리더십 역량 강화 과정',date:'2026.06.10',target:'팀장급',hours:'16H',status:'예정',color:'#8b5cf6'},
              {title:'개인정보보호 법정교육',date:'2026.06.15',target:'전사',hours:'2H',status:'예정',color:'#f59e0b'},
              {title:'신입사원 OJT',date:'2026.04.07',target:'신입 3명',hours:'40H',status:'완료',color:'#9ba8c0'},
            ].map(e=>`
            <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 16px;border-bottom:1px solid #f8f9fc">
              <div style="width:4px;border-radius:4px;background:${e.color};align-self:stretch;flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                  <div style="font-size:13.5px;font-weight:600;color:#1a2035">${e.title}</div>
                  <span class="badge ${e.status==='완료'?'badge-solid-green':'badge-blue'}" style="font-size:11px">${e.status}</span>
                </div>
                <div style="display:flex;gap:12px;font-size:12px;color:#9ba8c0">
                  <span>📅 ${e.date}</span>
                  <span>👥 ${e.target}</span>
                  <span>⏱ ${e.hours}</span>
                </div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- 역량 개발 현황 -->
        <div class="card" style="grid-column:1 / -1">
          <div class="card-header">
            <span class="card-title">팀원별 역량 개발 현황</span>
          </div>
          <div style="padding:14px 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
            ${[
              {name:'이정훈',skills:[['리더십',88],['DTP',95],['품질관리',80],['커뮤니케이션',90]]},
              {name:'김다현',skills:[['DTP설계',92],['CAD',78],['데이터분석',70],['프레젠테이션',85]]},
              {name:'한지수',skills:[['퀄팅',96],['품질검사',90],['문서작성',82],['교육훈련',75]]},
              {name:'오재형',skills:[['자수',89],['설비관리',72],['안전관리',85],['팀워크',88]]},
            ].map(emp=>`
            <div style="border:1px solid #f2f4f8;border-radius:10px;padding:14px">
              <div style="font-size:13.5px;font-weight:700;color:#1a2035;margin-bottom:10px">${emp.name}</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${emp.skills.map(([sk,val])=>`
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                    <span style="color:#6b7a99">${sk}</span>
                    <span style="font-weight:600;color:#1a2035">${val}</span>
                  </div>
                  <div style="height:5px;border-radius:3px;background:#f2f4f8;overflow:hidden">
                    <div style="height:100%;width:${val}%;border-radius:3px;background:${val>=90?'#10b981':val>=80?'#4361ee':val>=70?'#f59e0b':'#ef4444'};transition:width .6s ease"></div>
                  </div>
                </div>`).join('')}
              </div>
            </div>`).join('')}
          </div>
        </div>

      </div>
    </div><!-- /hr-tab-3 -->`;
  },

  /* ══════════════════════════════════
     발주관리
  ══════════════════════════════════ */
  purchase() {
    const orders = window.ARAM_DATA.purchaseOrders;
    const statusBadge = s=>({
      '발주완료':'badge badge-solid-blue','승인대기':'badge badge-orange','입고대기':'badge badge-purple','입고완료':'badge badge-solid-green'
    })[s]||'badge badge-gray';
    return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex-between">
        <div>
          <div class="page-title">구매관리</div>
          <div class="page-desc">발주·입고·협력업체 통합 관리</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('발주관리')">CSV ↓</button>
          <button class="btn btn-primary" onclick="if(window.ARAM_UI) ARAM_UI.openNewPurchaseModal()">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            신규 발주
          </button>
        </div>
      </div>
    </div>

    <!-- KPI -->
    <div class="stat-grid mb-16">
      ${[['이번달 발주','56건','📄','#4361ee'],['발주금액','₩680M','💰','#10b981'],['입고대기','18건','📦','#f59e0b'],['협력업체','47개','🤝','#8b5cf6']].map(([l,v,i,c])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:12px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${i}</div>
        <div>
          <div class="stat-label">${l}</div>
          <div class="stat-value sm" style="color:${c}">${v}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- 메인 탭 -->
    <div class="tab-bar mb-16">
      <button class="tab-btn active" onclick="switchTab(this,'po-tab-0')">발주목록</button>
      <button class="tab-btn" onclick="switchTab(this,'po-tab-1')">입고관리</button>
      <button class="tab-btn" onclick="switchTab(this,'po-tab-2')">협력업체</button>
      <button class="tab-btn" onclick="switchTab(this,'po-tab-3')">발주통계</button>
    </div>

    <!-- Tab 0: 발주목록 (기존 레이아웃) -->
    <div id="po-tab-0">
    <div class="purchase-layout">
      <div>
        <!-- Filter -->
        <div class="filter-bar mb-16">
          <input class="form-input" type="date" value="2026-05-01" style="width:140px">
          <span style="color:#9ba8c0">~</span>
          <input class="form-input" type="date" value="2026-05-31" style="width:140px">
          <select class="form-select" style="width:130px"><option>협력업체 전체</option></select>
          ${['전체','요청','승인대기','발주완료','입고완료'].map((s,i)=>`
          <button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm"
            onclick="this.closest('.filter-bar').querySelectorAll('button').forEach(b=>b.className='btn btn-secondary btn-sm');this.className='btn btn-primary btn-sm'">${s}</button>`).join('')}
          <input class="form-input" placeholder="발주번호·품목 검색" style="flex:1;max-width:200px">
        </div>

        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th class="checkbox-cell"><input type="checkbox"></th>
                <th>발주번호</th><th>협력업체</th><th>품목</th>
                <th>수량</th><th>단가</th><th class="td-right">합계</th>
                <th>발주일</th><th>입고예정일</th><th style="text-align:center">상태</th><th>담당자</th>
              </tr></thead>
              <tbody>
                ${orders.map((o,idx)=>`
                <tr style="cursor:pointer" onclick="openPODetail(${idx})">
                  <td class="checkbox-cell"><input type="checkbox" onclick="event.stopPropagation()"></td>
                  <td class="td-link">${o.no}</td>
                  <td>${o.vendor}</td>
                  <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis">${o.product}</td>
                  <td>${o.qty}</td>
                  <td>${o.price}</td>
                  <td class="td-right font-600">${o.total}</td>
                  <td style="font-size:12.5px;color:#9ba8c0">${o.ordered}</td>
                  <td style="font-size:12.5px;color:#9ba8c0">${o.due}</td>
                  <td class="td-center"><span class="${statusBadge(o.status)}">${o.status}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:600">${o.mgr[0]}</div>
                      <span style="font-size:12.5px">${o.mgr}</span>
                    </div>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span class="page-info">전체 56건</span>
            <div class="page-nums">${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
            <div class="page-size"><select><option>10개씩</option></select></div>
          </div>
        </div>
      </div>

      <!-- Right Panel (발주 상세) -->
      <div id="po-detail" style="display:none;flex-direction:column;gap:0">
        <div class="card" style="flex:1;display:flex;flex-direction:column">
          <div class="card-header" style="border-bottom:1px solid var(--bdr)">
            <div>
              <div style="font-size:11px;color:#9ba8c0;margin-bottom:2px">발주 상세</div>
              <div style="font-size:15px;font-weight:700" id="po-detail-no">—</div>
            </div>
            <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:18px;padding:4px" onclick="closePODetail()" title="닫기">✕</button>
          </div>
          <div style="display:flex;border-bottom:2px solid var(--bdr);padding:0 16px">
            ${[['기본정보','po-dtab-0'],['품목명세','po-dtab-1'],['입고현황','po-dtab-2'],['결재이력','po-dtab-3']].map(([l,id],i)=>`
            <div class="tab${i===0?' active':''}" onclick="switchTab(this,'${id}')" style="font-size:12.5px;padding:10px 12px;margin:0;border-radius:0;border-bottom:2px solid ${i===0?'#4361ee':'transparent'};margin-bottom:-2px">${l}</div>`).join('')}
          </div>
          <div style="flex:1;overflow-y:auto">
            <div id="po-dtab-0" style="padding:16px"><div style="color:#9ba8c0;font-size:13px;text-align:center;padding:30px 0">발주건을 선택해주세요</div></div>
            <div id="po-dtab-1" style="padding:16px;display:none"><div style="color:#9ba8c0;font-size:13px;text-align:center;padding:30px 0">발주건을 선택해주세요</div></div>
            <div id="po-dtab-2" style="padding:16px;display:none"><div style="color:#9ba8c0;font-size:13px;text-align:center;padding:30px 0">발주건을 선택해주세요</div></div>
            <div id="po-dtab-3" style="padding:16px;display:none"><div style="color:#9ba8c0;font-size:13px;text-align:center;padding:30px 0">발주건을 선택해주세요</div></div>
          </div>
          <div style="padding:12px 16px;border-top:1px solid var(--bdr);display:flex;gap:8px">
            <button class="btn btn-primary" style="flex:1" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('입고 확정이 완료되었습니다.')">입고 확정</button>
            <button class="btn btn-secondary" onclick="printPage('.purchase-layout')">인쇄</button>
            <button class="btn btn-secondary" style="color:#ef4444;border-color:#fecaca"
              onclick="if(window.ARAM_UI) ARAM_UI.Modal.open({title:'발주 취소',body:'<p style=\\'text-align:center;padding:12px 0\\'>선택한 발주건을 취소하시겠습니까?</p>',size:\\'sm\\'})">취소</button>
          </div>
        </div>
      </div>
    </div>
    </div><!-- /po-tab-0 -->

    <!-- Tab 1: 입고관리 -->
    <div id="po-tab-1" style="display:none">
      <div class="stat-grid mb-16">
        ${[['오늘 입고예정','3건','#4361ee'],['이번주 입고예정','12건','#f59e0b'],['검수 대기','5건','#8b5cf6'],['이달 입고완료','38건','#10b981']].map(([l,v,c])=>`
        <div class="stat-card">
          <div class="stat-label">${l}</div>
          <div class="stat-value sm" style="color:${c}">${v}</div>
        </div>`).join('')}
      </div>
      <div class="filter-bar mb-16">
        <input class="form-input" type="date" value="2026-05-01" style="width:140px">
        <span style="color:#9ba8c0">~</span>
        <input class="form-input" type="date" value="2026-05-31" style="width:140px">
        ${['전체','입고예정','검수중','입고완료','반품'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 발주번호·품목 검색" style="flex:1;max-width:220px">
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox"></th>
              <th>발주번호</th><th>협력업체</th><th>품목명</th>
              <th class="td-right">발주수량</th><th class="td-right">입고수량</th>
              <th>입고예정일</th><th>실제입고일</th><th>창고</th><th>검수</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              ${[
                {no:'PO-2026-0058',vendor:'한국원단(주)',item:'면 60수 화이트 500m',oqty:'500m',iqty:'500m',plan:'05-20',actual:'05-20',wh:'1공장',qc:'합격',status:'입고완료',sc:'green'},
                {no:'PO-2026-0059',vendor:'신성섬유',item:'폴리에스터 블랙 300m',oqty:'300m',iqty:'-',plan:'05-21',actual:'-',wh:'2공장',qc:'대기',status:'입고예정',sc:'blue'},
                {no:'PO-2026-0060',vendor:'DMC코리아',item:'DMC-321 Navy Blue 실 2kg',oqty:'2kg',iqty:'-',plan:'05-22',actual:'-',wh:'1공장',qc:'대기',status:'입고예정',sc:'blue'},
                {no:'PO-2026-0057',vendor:'부산원단',item:'혼방 네이비 200m',oqty:'200m',iqty:'200m',plan:'05-19',actual:'05-19',wh:'물류센터',qc:'합격',status:'입고완료',sc:'green'},
                {no:'PO-2026-0056',vendor:'한국원단(주)',item:'기능성 폴리 그레이 800m',oqty:'800m',iqty:'780m',plan:'05-18',actual:'05-18',wh:'2공장',qc:'조건부합격',status:'검수중',sc:'orange'},
              ].map(r=>`
              <tr>
                <td><input type="checkbox"></td>
                <td style="font-family:monospace;font-size:12px;color:#4361ee">${r.no}</td>
                <td style="font-weight:500">${r.vendor}</td>
                <td>${r.item}</td>
                <td class="td-right">${r.oqty}</td>
                <td class="td-right" style="color:${r.iqty==='-'?'#9ba8c0':'inherit'}">${r.iqty}</td>
                <td style="font-size:12.5px">2026-${r.plan}</td>
                <td style="font-size:12.5px;color:${r.actual==='-'?'#9ba8c0':'inherit'}">${r.actual==='-'?'—':'2026-'+r.actual}</td>
                <td style="font-size:12.5px">${r.wh}</td>
                <td><span class="badge badge-${r.qc==='합격'?'solid-green':r.qc==='대기'?'gray':'orange'}">${r.qc}</span></td>
                <td><span class="badge badge-${r.sc}">${r.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    ${r.status!=='입고완료'?`<button class="btn btn-primary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.success('입고 확정 처리되었습니다.')">입고처리</button>`:''}
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('검수 내역')">검수</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div><!-- /po-tab-1 -->

    <!-- Tab 2: 협력업체 -->
    <div id="po-tab-2" style="display:none">
      <div class="filter-bar mb-16">
        ${['전체','원단','실·부자재','포장재','인쇄소재'].map((s,i)=>`<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm">${s}</button>`).join('')}
        <input class="form-input" placeholder="🔍 업체명 검색" style="flex:1;max-width:220px">
        <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('협력업체 등록')">+ 업체 등록</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
        <!-- 협력업체 목록 -->
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>업체명</th><th>카테고리</th><th>담당자</th><th>연락처</th>
                <th class="td-right">이달 발주액</th><th class="td-right">누적 거래액</th>
                <th>평가</th><th>거래상태</th><th>액션</th>
              </tr></thead>
              <tbody>
                ${[
                  {name:'한국원단(주)',cat:'원단',mgr:'김대표',tel:'02-1234-5678',month:'₩82M',total:'₩1.2B',grade:'A',status:'거래중',sc:'green'},
                  {name:'신성섬유',cat:'원단',mgr:'이부장',tel:'031-234-5678',month:'₩45M',total:'₩680M',grade:'B+',status:'거래중',sc:'green'},
                  {name:'DMC코리아',cat:'실·부자재',mgr:'박과장',tel:'051-234-5678',month:'₩28M',total:'₩320M',grade:'A',status:'거래중',sc:'green'},
                  {name:'부산원단',cat:'원단',mgr:'최이사',tel:'051-345-6789',month:'₩19M',total:'₩240M',grade:'B',status:'거래중',sc:'green'},
                  {name:'대한포장',cat:'포장재',mgr:'정과장',tel:'032-456-7890',month:'₩12M',total:'₩160M',grade:'A+',status:'거래중',sc:'green'},
                  {name:'서울잉크',cat:'인쇄소재',mgr:'한대리',tel:'02-456-7890',month:'₩8M',total:'₩88M',grade:'B+',status:'거래중',sc:'green'},
                  {name:'글로벌원단',cat:'원단',mgr:'오부장',tel:'02-567-8901',month:'₩0',total:'₩42M',grade:'C',status:'거래중단',sc:'red'},
                ].map((v,i)=>`
                <tr style="cursor:pointer" onclick="document.getElementById('vendor-detail').style.display='block'">
                  <td style="font-weight:600">${v.name}</td>
                  <td><span class="badge badge-gray">${v.cat}</span></td>
                  <td>${v.mgr}</td>
                  <td style="font-size:12.5px;color:#9ba8c0">${v.tel}</td>
                  <td class="td-right">${v.month}</td>
                  <td class="td-right font-600">${v.total}</td>
                  <td><span style="font-weight:700;color:${v.grade==='A+'?'#10b981':v.grade==='A'?'#4361ee':v.grade==='B+'?'#8b5cf6':'#f59e0b'}">${v.grade}</span></td>
                  <td><span class="badge badge-${v.sc}">${v.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" style="height:26px;font-size:11px;padding:0 8px"
                      onclick="event.stopPropagation();if(window.ARAM_UI)ARAM_UI.Toast.info('${v.name} 발주 요청')">발주</button>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 협력업체 상세 패널 -->
        <div id="vendor-detail" style="display:none">
          <div class="card" style="position:sticky;top:0">
            <div class="card-header">
              <span class="card-title">한국원단(주)</span>
              <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:16px"
                onclick="document.getElementById('vendor-detail').style.display='none'">✕</button>
            </div>
            <div class="card-body" style="padding:14px 16px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
                <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700">한</div>
                <div>
                  <div style="font-size:15px;font-weight:700;color:var(--txt)">한국원단(주)</div>
                  <div style="font-size:12.5px;color:#9ba8c0">원단 · 거래 3년차</div>
                  <span style="font-size:11px;background:#ecfdf5;color:#10b981;padding:2px 8px;border-radius:10px;font-weight:600">A등급 협력사</span>
                </div>
              </div>
              <table style="width:100%;font-size:13px;border-collapse:collapse">
                ${[['담당자','김대표'],['연락처','02-1234-5678'],['이메일','korea@fabric.co.kr'],['주소','서울 구로구 디지털로 300'],['결제조건','30일 후 세금계산서'],['리드타임','5~7일'],].map(([l,v])=>`
                <tr style="border-bottom:1px solid var(--bdr)">
                  <td style="padding:6px 0;color:#9ba8c0;width:70px">${l}</td>
                  <td style="padding:6px 0;font-weight:500">${v}</td>
                </tr>`).join('')}
              </table>
              <div style="margin-top:12px">
                <div style="font-size:12.5px;font-weight:600;margin-bottom:8px">월별 발주 추이</div>
                ${[['2월','62M',62],['3월','75M',75],['4월','68M',68],['5월','82M',82]].map(([m,v,p])=>`
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px">
                  <span style="width:20px;color:#9ba8c0">${m}</span>
                  <div style="flex:1;height:8px;background:#f0f2f7;border-radius:10px;overflow:hidden">
                    <div style="height:100%;width:${p}%;background:#4361ee;border-radius:10px"></div>
                  </div>
                  <span style="width:30px;text-align:right;font-weight:600">₩${v}</span>
                </div>`).join('')}
              </div>
              <div style="display:flex;gap:6px;margin-top:12px">
                <button class="btn btn-primary" style="flex:1"
                  onclick="if(window.ARAM_UI)ARAM_UI.Toast.success('발주 요청이 등록되었습니다.')">발주 요청</button>
                <button class="btn btn-secondary"
                  onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('업체 정보 편집')">편집</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /po-tab-2 -->

    <!-- Tab 3: 발주통계 -->
    <div id="po-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- 월별 발주 금액 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">월별 발주 현황</span>
            <select class="form-select" style="width:100px;height:28px;font-size:12px"><option>2026년</option></select>
          </div>
          <div class="card-body" style="padding:16px">
            ${[['1월','₩520M',52],['2월','₩480M',48],['3월','₩610M',61],['4월','₩590M',59],['5월','₩680M',68]].map(([m,v,p])=>`
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
                <span style="color:var(--muted)">${m}</span>
                <span style="font-weight:600">${v}</span>
              </div>
              <div style="height:10px;background:var(--bg);border-radius:10px;overflow:hidden">
                <div style="height:100%;width:${p}%;background:linear-gradient(90deg,#4361ee,#8b5cf6);border-radius:10px"></div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- 카테고리별 발주 비율 -->
        <div class="card">
          <div class="card-header"><span class="card-title">품목 카테고리별 발주 비율</span></div>
          <div class="card-body" style="padding:16px">
            ${[['원단','#4361ee',48],['실·부자재','#8b5cf6',22],['포장재','#14b8a6',15],['인쇄소재','#f59e0b',10],['기타','#9ba8c0',5]].map(([l,c,p])=>`
            <div style="margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div style="width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0"></div>
                <span style="font-size:13px;flex:1">${l}</span>
                <span style="font-size:13px;font-weight:600;color:${c}">${p}%</span>
              </div>
              <div style="height:8px;background:var(--bg);border-radius:10px;overflow:hidden">
                <div style="height:100%;width:${p}%;background:${c};border-radius:10px"></div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- TOP 협력업체 -->
        <div class="card">
          <div class="card-header"><span class="card-title">TOP 5 협력업체 (이달 발주액)</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>순위</th><th>업체명</th><th>카테고리</th><th class="td-right">발주금액</th><th>비율</th><th>평가</th></tr></thead>
              <tbody>
                ${[['한국원단(주)','원단','₩82M',82,'A'],['신성섬유','원단','₩45M',45,'B+'],['DMC코리아','실·부자재','₩28M',28,'A'],['부산원단','원단','₩19M',19,'B'],['대한포장','포장재','₩12M',12,'A+']].map(([n,c,a,p,g],i)=>`
                <tr>
                  <td style="font-weight:700;color:${i<3?'#f59e0b':'#9ba8c0'}">${i+1}위</td>
                  <td style="font-weight:600">${n}</td>
                  <td><span class="badge badge-gray">${c}</span></td>
                  <td class="td-right font-600">${a}</td>
                  <td style="min-width:80px">
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="flex:1;height:6px;background:#f0f2f7;border-radius:10px;overflow:hidden">
                        <div style="height:100%;width:${p}%;background:#4361ee;border-radius:10px"></div>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight:700;color:${g==='A+'?'#10b981':g==='A'?'#4361ee':'#8b5cf6'}">${g}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 발주 사이클 분석 -->
        <div class="card">
          <div class="card-header"><span class="card-title">발주 → 입고 소요일 분석</span></div>
          <div class="card-body" style="padding:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
              ${[['평균 소요일','6.2일','#4361ee'],['최단 소요일','2일','#10b981'],['최장 소요일','18일','#ef4444'],['정시 입고율','87.3%','#8b5cf6']].map(([l,v,c])=>`
              <div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center">
                <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:4px">${l}</div>
                <div style="font-size:20px;font-weight:700;color:${c}">${v}</div>
              </div>`).join('')}
            </div>
            <div style="font-size:12.5px;font-weight:600;margin-bottom:8px">품목별 평균 소요일</div>
            ${[['원단류','7.2일',72,'#4361ee'],['실·부자재','4.5일',45,'#8b5cf6'],['포장재','3.1일',31,'#14b8a6'],['인쇄소재','5.8일',58,'#f59e0b']].map(([l,v,p,c])=>`
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12.5px">
                <span>${l}</span><span style="font-weight:600;color:${c}">${v}</span>
              </div>
              <div style="height:7px;background:var(--bg);border-radius:10px;overflow:hidden">
                <div style="height:100%;width:${p}%;background:${c};border-radius:10px"></div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div><!-- /po-tab-3 -->`;
  },

  /* ══════════════════════════════════
     사내커뮤니케이션
  ══════════════════════════════════ */
  chat() {
    const members = [
      {name:'김민수 과장',online:'online'},{name:'박지영 대리',online:'online'},{name:'최서연 주임',online:'online'},
      {name:'윤태호 대리',online:'online'},{name:'이상훈 과장',online:'online'},{name:'이준호 차장',online:'away'},
      {name:'정재훈 부장',online:'online'},
    ];
    const channels = [
      {ch:'전체공지',cnt:3},{ch:'영업1팀',cnt:3},{ch:'DTP팀',cnt:8,active:true},
      {ch:'자수팀',cnt:2},{ch:'생산회의',cnt:3},{ch:'자재공유',cnt:2},
    ];
    const dms = [
      {name:'김민수 과장',time:'10:36',preview:'확인했습니다, 감사합니다!',unread:1},
      {name:'박지영 대리',time:'09:58',preview:'파일 확인 부탁드려요.',unread:1},
      {name:'최서연 주임',time:'어제',preview:'네, 알겠습니다!',unread:0},
      {name:'이준호 차장',time:'어제',preview:'고생 많으셨습니다.',unread:0},
    ];

    /* 렌더 후 이벤트 초기화 */
    setTimeout(() => window._initChatEvents && window._initChatEvents(), 50);

    return `
    <div class="chat-layout" style="height:calc(100vh - 64px)">
      <!-- Left: Sidebar -->
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:15px;font-weight:700;color:var(--txt)">ARAM ERP</span>
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18" style="color:#9ba8c0"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <input class="chat-search" placeholder="채널·사람 검색" oninput="if(window.ARAM_UI){}">
        </div>

        <div style="overflow-y:auto;flex:1">
          <div class="chat-section-label">★ 즐겨찾기</div>
          <div class="chat-channel active" data-chat-name="DTP팀" data-chat-type="channel" style="background:#eff2ff">
            <span style="color:#4361ee">#</span>
            <span style="flex:1;font-weight:600">DTP팀</span>
            <span style="font-size:11px;color:#4361ee">✦</span>
          </div>

          <div class="chat-section-label">▼ 다이렉트 메시지
            <span style="cursor:pointer;margin-left:auto" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('새 다이렉트 메시지')">+</span>
          </div>
          ${dms.map(m=>`
          <div class="chat-item" data-chat-name="${m.name}" data-chat-type="dm">
            <div class="chat-item-avatar">${m.name[0]}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="chat-item-name">${m.name}</span>
                <span class="chat-item-time">${m.time}</span>
              </div>
              <div class="chat-item-preview">${m.preview}</div>
            </div>
            ${m.unread?`<span class="chat-unread">${m.unread}</span>`:''}
          </div>`).join('')}

          <div class="chat-section-label">▼ 채널
            <span style="cursor:pointer;margin-left:auto" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('새 채널 생성')">+</span>
          </div>
          ${channels.map(c=>`
          <div class="chat-channel ${c.active?'active':''}" data-chat-name="${c.ch}" data-chat-type="channel">
            <span style="color:${c.active?'#4361ee':'#9ba8c0'}">#</span>
            <span style="flex:1">${c.ch}</span>
            <span class="chat-channel-unread" style="background:${c.active?'#4361ee':'#ef4444'}">${c.cnt}</span>
          </div>`).join('')}
          <div style="padding:8px 16px;font-size:12.5px;color:#4361ee;cursor:pointer"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('채널 목록 더 보기')">채널 더 보기 ›</div>
        </div>

        <!-- User info -->
        <div style="padding:12px 16px;border-top:1px solid var(--bdr);display:flex;align-items:center;gap:8px">
          <div class="chat-item-avatar" style="background:linear-gradient(135deg,#4361ee,#8b5cf6)">이</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">이준호 차장</div>
            <div style="font-size:11.5px;color:#10b981">● 온라인</div>
          </div>
          <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:16px" title="설정"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('채팅 설정')">⚙</button>
        </div>
      </div>

      <!-- Center: Messages -->
      <div class="chat-main">
        <div class="chat-main-header">
          <div id="chat-channel-header" style="display:flex;align-items:center;gap:8px">
            <span style="font-size:16px;color:#9ba8c0">#</span>
            <span style="font-size:15px;font-weight:700">DTP팀</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="display:flex">
              ${members.slice(0,4).map(m=>`<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600;border:2px solid var(--card);margin-left:-6px">${m.name[0]}</div>`).join('')}
              <div style="width:28px;height:28px;border-radius:50%;background:#f0f2f7;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6b7a99;border:2px solid var(--card);margin-left:-6px">+7</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('채팅 검색')">🔍</button>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('화상통화 시작')">📞</button>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('채널 설정')">···</button>
          </div>
        </div>

        <!-- Messages Area -->
        <div id="chat-messages-area" class="chat-messages">
          <div style="text-align:center;color:#9ba8c0;font-size:13px;padding:30px 0">채널을 선택하면 메시지가 표시됩니다.</div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <div style="display:flex;gap:8px;margin-bottom:8px">
            ${['B','I','U','S','</>','≡','링크','📎'].map(f=>`<button style="min-width:26px;height:26px;border:1px solid var(--bdr);border-radius:4px;font-size:11px;background:var(--card);cursor:pointer;font-weight:600;color:var(--muted);padding:0 4px" title="${f}">${f}</button>`).join('')}
          </div>
          <div class="chat-input-bar">
            <span style="color:#9ba8c0;cursor:pointer;padding:0 4px" title="파일 첨부"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('파일 첨부 기능')">📎</span>
            <span style="color:#9ba8c0;cursor:pointer;padding:0 4px" title="이모지"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('이모지 선택')">😊</span>
            <span style="color:#9ba8c0;cursor:pointer;padding:0 4px" title="멘션"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('@멘션')">@</span>
            <input placeholder="메시지 보내기 (#DTP팀)" style="flex:1">
            <div class="chat-send-btn" title="전송 (Enter)">
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
          </div>
          <div style="font-size:11px;color:#9ba8c0;margin-top:6px;padding:0 4px">Enter로 전송 · Shift+Enter로 줄바꿈</div>
        </div>
      </div>

      <!-- Right: Channel Info -->
      <div class="chat-info-panel">
        <div class="chat-info-header">
          <span id="chat-info-ch-name" style="font-size:14px;font-weight:700"># DTP팀</span>
          <button style="background:none;border:none;color:#9ba8c0;cursor:pointer;font-size:16px"
            onclick="this.closest('.chat-info-panel').style.display='none'">✕</button>
        </div>

        <!-- 빠른 액션 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px 12px;border-bottom:1px solid var(--bdr)">
          ${[{i:'📌',l:'핀고정'},  {i:'🔔',l:'알림설정'}, {i:'🔍',l:'내용검색'}, {i:'📊',l:'멤버관리'}].map(a=>`
          <button class="btn btn-secondary btn-sm" style="height:32px;font-size:12px;gap:4px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${a.l}')">${a.i} ${a.l}</button>`).join('')}
        </div>

        <div class="chat-info-section">
          <div class="chat-info-label">📌 핀고정 메시지</div>
          <div style="background:var(--bg);border-radius:8px;padding:10px;font-size:12.5px;line-height:1.5;color:var(--muted);border-left:3px solid #4361ee">
            <div style="font-weight:600;color:var(--txt);margin-bottom:4px">김민수 과장 · 5. 12. (월) 10:15</div>
            DTP팀 작업 가이드라인 및 체크리스트 확인 부탁드립니다.
            <div style="color:#4361ee;cursor:pointer;margin-top:4px;font-size:12px"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('핀고정 메시지 더 보기')">더 보기 ›</div>
          </div>
        </div>

        <div class="chat-info-section">
          <div class="chat-info-label">📁 파일 <a style="float:right;color:#4361ee;cursor:pointer;font-weight:400;font-size:11px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('파일 모두 보기')">모두 보기 ›</a></div>
          ${[{name:'디자인시안.png',size:'1.2MB',date:'5.20 09:03',icon:'🖼'},{name:'작업지시서.pdf',size:'542KB',date:'5.20 09:05',icon:'📄'},{name:'원단샘플.xlsx',size:'88KB',date:'5.19 15:42',icon:'📊'}].map(f=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:16px">${f.icon}</span>
              <div>
                <div style="font-size:12.5px;font-weight:500;color:var(--txt)">${f.name}</div>
                <div style="font-size:11px;color:#9ba8c0">${f.size} · ${f.date}</div>
              </div>
            </div>
            <span style="cursor:pointer;color:#9ba8c0" title="다운로드"
              onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('${f.name} 다운로드')">⬇</span>
          </div>`).join('')}
        </div>

        <div class="chat-info-section">
          <div class="chat-info-label">👥 멤버 ${members.length}명 <a style="float:right;color:#4361ee;cursor:pointer;font-weight:400;font-size:11px"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('전체 멤버 보기')">모두 보기 ›</a></div>
          ${members.map(m=>`
          <div class="member-item" style="cursor:pointer" onclick="if(window.ARAM_CHAT)ARAM_CHAT.switchChannel('${m.name}','dm')">
            <div class="member-avatar">${m.name[0]}</div>
            <span class="member-name">${m.name}</span>
            <div class="online-dot ${m.online}" style="margin-left:auto"></div>
          </div>`).join('')}
        </div>

        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:6px">
          <button class="btn btn-secondary" style="width:100%"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('멤버 초대 기능')">👥 멤버 초대</button>
          <button class="btn btn-secondary" style="width:100%"
            onclick="if(window.ARAM_UI)ARAM_UI.Toast.info('채널 설정 열기')">⚙ 채널 설정</button>
        </div>
      </div>
    </div>`;
  },

  /* ══════════════════════════════════
     시스템 — 사용자/권한 관리
  ══════════════════════════════════ */
  'system-users'() {
    const users = [
      {name:'이준호',sid:'A20230001',dept:'시스템관리팀',rank:'부장',  role:'슈퍼관리자',lastLogin:'2026-05-20 09:21',active:true},
      {name:'김민재',sid:'A20210023',dept:'영업본부',    rank:'차장',  role:'부서관리자',lastLogin:'2026-05-20 08:47',active:true},
      {name:'박서연',sid:'A20220015',dept:'생산관리팀',  rank:'과장',  role:'일반사용자',lastLogin:'2026-05-19 17:12',active:true},
      {name:'최영훈',sid:'A20230012',dept:'재고관리팀',  rank:'대리',  role:'일반사용자',lastLogin:'2026-05-19 16:35',active:true},
      {name:'정유진',sid:'A20210031',dept:'재무관리팀',  rank:'대리',  role:'부서관리자',lastLogin:'2026-05-19 15:22',active:true},
      {name:'이도현',sid:'A20220027',dept:'인사관리팀',  rank:'과장',  role:'일반사용자',lastLogin:'2026-05-19 11:08',active:false},
      {name:'한지민',sid:'A20230036',dept:'영업1팀',    rank:'사원',  role:'일반사용자',lastLogin:'2026-05-18 18:40',active:true},
      {name:'강태민',sid:'A20240002',dept:'DTP팀',      rank:'사원',  role:'일반사용자',lastLogin:'2026-05-18 09:05',active:true},
      {name:'오수빈',sid:'A20230044',dept:'재무관리팀',  rank:'주임',  role:'일반사용자',lastLogin:'2026-05-17 14:22',active:true},
      {name:'윤지호',sid:'A20210018',dept:'경영지원팀',  rank:'과장',  role:'부서관리자',lastLogin:'2026-05-17 09:41',active:true},
    ];
    const roleBadge = r => ({'슈퍼관리자':'badge badge-purple','부서관리자':'badge badge-blue','일반사용자':'badge badge-gray','외부협력':'badge badge-orange'})[r]||'badge badge-gray';
    const toggle = (active, label) => `
      <label style="position:relative;display:inline-block;width:36px;height:20px;cursor:pointer" title="${label}">
        <input type="checkbox" ${active?'checked':''} style="opacity:0;width:0;height:0">
        <span style="position:absolute;inset:0;border-radius:20px;background:${active?'#4361ee':'#e5e9f2'};transition:.2s"></span>
        <span style="position:absolute;top:3px;left:${active?'19':'3'}px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s"></span>
      </label>`;
    return `
    <div class="page-header">
      <div class="flex-between">
        <div class="page-title">시스템설정</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#9ba8c0">
          <div style="width:8px;height:8px;border-radius:50%;background:#10b981"></div>
          이준호 / 슈퍼관리자 &nbsp;|&nbsp;
          <span style="font-size:11.5px">마지막 변경: 2026-05-20 09:21</span>
        </div>
      </div>
    </div>

    <!-- KPI 요약 -->
    <div class="stat-grid mb-16">
      ${[['전체 사용자','142명','👤','#4361ee'],['활성 사용자','138명','✅','#10b981'],['역할 그룹','4개','🛡','#8b5cf6'],['이번달 신규','3명','➕','#f59e0b']].map(([l,v,i,c])=>`
      <div class="stat-card" style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:10px;background:${c}18;display:flex;align-items:center;justify-content:center;font-size:22px">${i}</div>
        <div><div class="stat-label">${l}</div><div class="stat-value">${v}</div></div>
      </div>`).join('')}
    </div>

    <!-- 탭 바 -->
    <div class="tab-bar" style="margin-bottom:20px">
      <div class="tab active" onclick="switchTab(this,'sys-tab-0')">👤 사용자</div>
      <div class="tab" onclick="switchTab(this,'sys-tab-1')">🛡 역할관리</div>
      <div class="tab" onclick="switchTab(this,'sys-tab-2')">🔐 권한설정</div>
      <div class="tab" onclick="switchTab(this,'sys-tab-3')">📋 메뉴관리</div>
      <div class="tab" onclick="switchTab(this,'sys-tab-4')">📊 접속로그</div>
      <div class="tab" onclick="switchTab(this,'sys-tab-5')">💾 백업/복원</div>
    </div>

    <!-- ── 탭0: 사용자 관리 ── -->
    <div id="sys-tab-0">
      <div class="sys-layout">
        <!-- 사용자 목록 -->
        <div class="card">
          <div class="card-header" style="flex-wrap:wrap;gap:8px">
            <div style="display:flex;gap:8px;flex:1;flex-wrap:wrap">
              <input class="form-input" placeholder="이름, 사번 검색" style="width:200px">
              <select class="form-select" style="width:130px">
                <option>전체 부서</option>
                <option>시스템관리팀</option><option>영업본부</option><option>생산관리팀</option><option>재무관리팀</option>
              </select>
              <select class="form-select" style="width:120px">
                <option>전체 역할</option>
                <option>슈퍼관리자</option><option>부서관리자</option><option>일반사용자</option>
              </select>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('사용자 추가 화면은 준비 중입니다.')">+ 사용자 추가</button>
              <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('사용자목록')">CSV ↓</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th class="checkbox-cell"><input type="checkbox"></th>
                <th>이름 / 사번</th><th>부서</th><th>직급</th><th>역할</th>
                <th>마지막 로그인</th><th class="td-center">활성</th><th class="td-center">액션</th>
              </tr></thead>
              <tbody>
                ${users.map(u=>`
                <tr style="cursor:pointer">
                  <td class="checkbox-cell"><input type="checkbox" onclick="event.stopPropagation()"></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0">${u.name[0]}</div>
                      <div>
                        <div style="font-size:13.5px;font-weight:600">${u.name}</div>
                        <div style="font-size:11.5px;color:#9ba8c0">${u.sid}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:13px">${u.dept}</td>
                  <td style="font-size:13px">${u.rank}</td>
                  <td><span class="${roleBadge(u.role)}">${u.role}</span></td>
                  <td style="font-size:12px;color:#9ba8c0">${u.lastLogin}</td>
                  <td class="td-center">${toggle(u.active, u.active?'비활성화':'활성화')}</td>
                  <td class="td-center">
                    <button style="background:none;border:none;cursor:pointer;color:#9ba8c0;font-size:20px;padding:0 4px"
                      onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('${u.name} 사용자 편집 화면은 준비 중입니다.')">⋯</button>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span class="page-info">총 142명</span>
            <div class="page-nums">${[1,2,3].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}<span>…</span><span class="page-btn">12</span></div>
          </div>
        </div>

        <!-- 사용자 상세 패널 -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-body">
              <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:16px">
                <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4361ee,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;flex-shrink:0">이</div>
                <div style="flex:1">
                  <div style="font-size:16px;font-weight:700">이준호</div>
                  <div style="font-size:13px;color:#9ba8c0">부장 | 시스템관리팀</div>
                  <div style="font-size:12.5px;color:#9ba8c0;margin-top:4px">✉ junho.lee@aram.co.kr</div>
                  <div style="font-size:12.5px;color:#9ba8c0">☎ 010-1234-5678</div>
                </div>
                <span class="badge badge-purple">슈퍼관리자</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12.5px">
                ${[['사번','A20230001'],['입사일','2023-03-02'],['최근 로그인','2026-05-20 09:21'],['IP 주소','192.168.1.105']].map(([l,v])=>`
                <div><span style="color:#9ba8c0">${l}</span> <b>${v}</b></div>`).join('')}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">권한 매트릭스</span></div>
            <div class="card-body" style="padding:12px">
              <table class="permission-matrix">
                <thead><tr><th>메뉴</th><th class="td-center">조회</th><th class="td-center">등록</th><th class="td-center">수정</th><th class="td-center">삭제</th></tr></thead>
                <tbody>
                  ${[['영업',true,true,true,true],['생산',true,true,true,true],['재고',true,true,true,false],['재무',true,true,true,false],['인사',true,false,false,false],['시스템',true,true,true,true]].map(([m,...perms])=>`
                  <tr>
                    <td style="font-weight:500">${m}</td>
                    ${perms.map(v=>`<td class="td-center"><span class="${v?'perm-check':'perm-x'}">${v?'✓':'—'}</span></td>`).join('')}
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">최근 활동</span></div>
            <div class="card-body" style="padding:4px 0">
              ${[
                ['🔑','로그인','2026-05-20 09:21'],
                ['✏️','사용자 권한 변경 — 김민재','2026-05-19 17:33'],
                ['✅','결재 승인 — PR-202605-0123','2026-05-19 15:14'],
                ['🔑','로그인','2026-05-19 08:47'],
                ['⚙️','시스템 설정 변경 — 백업 스케줄','2026-05-18 11:02'],
              ].map(([ic,tx,tm])=>`
              <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 16px;border-bottom:1px solid #f8f9fc">
                <div style="font-size:13px;flex-shrink:0">${ic}</div>
                <div style="flex:1;font-size:12.5px">${tx}</div>
                <div style="font-size:11.5px;color:#9ba8c0;white-space:nowrap">${tm}</div>
              </div>`).join('')}
            </div>
            <div style="padding:10px 16px;display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" style="flex:1" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('저장되었습니다.')">저장</button>
              <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('비밀번호 재설정 메일을 발송했습니다.')">비밀번호 재설정</button>
              <button class="btn btn-secondary btn-sm" style="color:#ef4444;border-color:#fecaca" onclick="if(window.ARAM_UI) ARAM_UI.Modal.open({title:'사용자 비활성화',body:'<p style=\\'font-size:14px;color:#525f7f;text-align:center;padding:8px 0\\'>이준호 사용자를 비활성화하시겠습니까?</p>',size:'sm',footer:[{label:'취소',type:\'secondary\',onClick:(c)=>c()},{label:\'비활성화\',type:\'danger\',onClick:(c)=>{c();if(window.ARAM_UI)ARAM_UI.Toast.warn(\'비활성화되었습니다.\')}}]})">비활성화</button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /sys-tab-0 -->

    <!-- ── 탭1: 역할관리 ── -->
    <div id="sys-tab-1" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">역할 목록</span>
            <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('역할 추가 기능은 준비 중입니다.')">+ 역할 추가</button>
          </div>
          <div style="padding:8px 0">
            ${[
              {name:'슈퍼관리자',desc:'시스템 전체 권한 보유',count:2,color:'#8b5cf6',icon:'🛡'},
              {name:'부서관리자',desc:'소속 부서 데이터 관리 및 결재',count:12,color:'#4361ee',icon:'👔'},
              {name:'일반사용자',desc:'기본 조회 및 업무 처리',count:124,color:'#10b981',icon:'👤'},
              {name:'외부협력업체',desc:'발주서·납품 현황 조회만 허용',count:4,color:'#f59e0b',icon:'🤝'},
            ].map((r,i)=>`
            <div style="display:flex;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid #f8f9fc;cursor:pointer;transition:.15s" onmouseover="this.style.background='#f8f9fc'" onmouseout="this.style.background=''">
              <div style="width:40px;height:40px;border-radius:10px;background:${r.color}18;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${r.icon}</div>
              <div style="flex:1">
                <div style="font-size:13.5px;font-weight:600;color:#1a2035;margin-bottom:2px">${r.name}</div>
                <div style="font-size:12px;color:#9ba8c0">${r.desc}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:18px;font-weight:700;color:${r.color}">${r.count}</div>
                <div style="font-size:11px;color:#9ba8c0">명</div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">역할 상세 — 슈퍼관리자</span></div>
          <div class="card-body">
            <div style="padding:12px;background:#f8f9fc;border-radius:8px;margin-bottom:14px;font-size:13px;color:#6b7a99">
              시스템 전체에 대한 모든 권한을 가집니다. 사용자 생성·삭제, 역할 배정, 시스템 설정 변경 등 모든 기능에 접근할 수 있습니다.
            </div>
            <div style="font-size:13px;font-weight:600;margin-bottom:10px">포함 권한</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                ['데이터 조회','모든 메뉴 전체 조회','✅'],
                ['데이터 입력','모든 메뉴 데이터 등록','✅'],
                ['데이터 수정','모든 메뉴 데이터 수정','✅'],
                ['데이터 삭제','일부 메뉴 데이터 삭제','✅'],
                ['사용자 관리','사용자 추가·수정·비활성화','✅'],
                ['역할 관리','역할 생성·수정·삭제','✅'],
                ['시스템 설정','시스템 전반 설정 변경','✅'],
                ['로그 열람','전체 사용자 접속 로그 조회','✅'],
              ].map(([l,d,v])=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid #f2f4f8;border-radius:6px">
                <div>
                  <div style="font-size:13px;font-weight:500">${l}</div>
                  <div style="font-size:11.5px;color:#9ba8c0">${d}</div>
                </div>
                <span style="font-size:16px">${v}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div><!-- /sys-tab-1 -->

    <!-- ── 탭2: 권한설정 ── -->
    <div id="sys-tab-2" style="display:none">
      <div class="card">
        <div class="card-header">
          <span class="card-title">메뉴별 권한 매트릭스</span>
          <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('권한 설정이 저장되었습니다.')">변경사항 저장</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="min-width:120px">메뉴</th>
                ${['슈퍼관리자','부서관리자','일반사용자','외부협력'].map(r=>`<th class="td-center" colspan="4" style="border-left:2px solid #e5e9f2">${r}</th>`).join('')}
              </tr>
              <tr style="background:#fafbfe">
                <th style="color:#9ba8c0;font-size:11.5px"></th>
                ${['슈퍼관리자','부서관리자','일반사용자','외부협력'].map(()=>['R','W','M','D'].map(p=>`<th class="td-center" style="font-size:11px;color:#9ba8c0;font-weight:500">${p}</th>`).join('')).join('')}
              </tr>
            </thead>
            <tbody>
              ${[
                {menu:'대시보드',perms:[[1,1,1,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]]},
                {menu:'수주관리',perms:[[1,1,1,1],[1,1,1,0],[1,0,0,0],[0,0,0,0]]},
                {menu:'생산관리',perms:[[1,1,1,1],[1,1,1,0],[1,0,0,0],[0,0,0,0]]},
                {menu:'재고관리',perms:[[1,1,1,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]]},
                {menu:'재무관리',perms:[[1,1,1,1],[1,1,0,0],[1,0,0,0],[0,0,0,0]]},
                {menu:'인사관리',perms:[[1,1,1,1],[1,1,0,0],[1,0,0,0],[0,0,0,0]]},
                {menu:'구매관리',perms:[[1,1,1,1],[1,1,1,0],[1,0,0,0],[1,1,0,0]]},
                {menu:'시스템설정',perms:[[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]},
              ].map(row=>`
              <tr>
                <td style="font-weight:500">${row.menu}</td>
                ${row.perms.map((cols,ci)=>cols.map(v=>`
                <td class="td-center" style="${ci===0?'border-left:2px solid #e5e9f2':''}">
                  <input type="checkbox" ${v?'checked':''} style="width:15px;height:15px;cursor:pointer;accent-color:#4361ee">
                </td>`).join('')).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:10px 16px;font-size:12px;color:#9ba8c0;border-top:1px solid #f2f4f8">
          R=조회 &nbsp; W=등록 &nbsp; M=수정 &nbsp; D=삭제
        </div>
      </div>
    </div><!-- /sys-tab-2 -->

    <!-- ── 탭3: 메뉴관리 ── -->
    <div id="sys-tab-3" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">메뉴 구조</span>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('메뉴 순서 저장 기능은 준비 중입니다.')">순서 저장</button>
          </div>
          <div style="padding:8px 0">
            ${[
              {icon:'📊',label:'대시보드',path:'/dashboard',active:true,sub:[]},
              {icon:'📋',label:'수주관리',path:'/sales',active:true,sub:['수주목록','수주상세']},
              {icon:'🏭',label:'생산관리',path:'/production',active:true,sub:['DTP생산','자수생산','품질검사']},
              {icon:'📦',label:'재고관리',path:'/inventory',active:true,sub:[]},
              {icon:'🧵',label:'FabricHub',path:'/fabric',active:true,sub:[]},
              {icon:'💰',label:'재무관리',path:'/finance',active:true,sub:['자금현황','세금계산서','손익계산서']},
              {icon:'👥',label:'인사관리',path:'/hr',active:true,sub:['조직/사원','근태관리','급여현황']},
              {icon:'🛒',label:'구매관리',path:'/purchase',active:true,sub:[]},
              {icon:'💬',label:'채팅',path:'/chat',active:true,sub:[]},
              {icon:'⚙️',label:'시스템설정',path:'/system',active:true,sub:['사용자','역할','권한']},
            ].map((m,i)=>`
            <div style="border-bottom:1px solid #f8f9fc">
              <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer" onmouseover="this.style.background='#f8f9fc'" onmouseout="this.style.background=''">
                <div style="color:#9ba8c0;font-size:12px;width:16px;text-align:center">⠿</div>
                <div style="font-size:14px">${m.icon}</div>
                <div style="flex:1;font-size:13.5px;font-weight:500">${m.label}</div>
                <div style="font-size:11.5px;color:#9ba8c0;margin-right:8px">${m.path}</div>
                ${toggle(m.active, m.active?'비활성화':'활성화')}
              </div>
              ${m.sub.length?`
              <div style="padding:0 16px 8px 42px;display:flex;flex-wrap:wrap;gap:4px">
                ${m.sub.map(s=>`<span style="font-size:11.5px;color:#9ba8c0;background:#f8f9fc;padding:2px 8px;border-radius:4px">${s}</span>`).join('')}
              </div>`:''}
            </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">메뉴 설정</span></div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:14px">
              ${[
                ['메뉴 아이콘 표시','사이드바에 아이콘을 함께 표시합니다',true],
                ['메뉴 축소 기억','사이드바 축소 상태를 사용자별로 기억합니다',true],
                ['툴팁 표시','축소 시 메뉴명 툴팁을 표시합니다',true],
                ['서브메뉴 자동 펼침','클릭 시 서브메뉴를 자동으로 펼칩니다',false],
                ['배지 카운트 표시','알림·건수를 뱃지로 표시합니다',true],
                ['즐겨찾기 메뉴','사용자별 즐겨찾기 메뉴 기능 활성화',false],
              ].map(([l,d,v])=>`
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                <div>
                  <div style="font-size:13.5px;font-weight:500;margin-bottom:2px">${l}</div>
                  <div style="font-size:12px;color:#9ba8c0">${d}</div>
                </div>
                ${toggle(v, l)}
              </div>`).join('')}
            </div>
            <div style="margin-top:20px;display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.success('설정이 저장되었습니다.')">저장</button>
              <button class="btn btn-secondary btn-sm">기본값 복원</button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /sys-tab-3 -->

    <!-- ── 탭4: 접속로그 ── -->
    <div id="sys-tab-4" style="display:none">
      <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:8px">
          <span class="card-title">접속 로그</span>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="date-range">
              <input class="form-input" type="date" value="2026-05-14">
              <span style="color:#9ba8c0">~</span>
              <input class="form-input" type="date" value="2026-05-20">
            </div>
            <select class="form-select" style="width:120px">
              <option>전체 사용자</option>
              <option>이준호</option><option>김민재</option>
            </select>
            <select class="form-select" style="width:110px">
              <option>전체 유형</option>
              <option>로그인</option><option>로그아웃</option><option>오류</option>
            </select>
            <button class="btn btn-secondary btn-sm" onclick="exportTableCSV('접속로그')">CSV ↓</button>
          </div>
        </div>

        <!-- 로그 요약 -->
        <div style="padding:12px 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-bottom:1px solid #f2f4f8">
          ${[['오늘 접속','38회','#4361ee'],['로그인 실패','3회','#ef4444'],['비정상 접근','0회','#10b981'],['평균 세션','2시간 14분','#f59e0b']].map(([l,v,c])=>`
          <div style="text-align:center;padding:8px;background:#f8f9fc;border-radius:8px">
            <div style="font-size:11.5px;color:#9ba8c0">${l}</div>
            <div style="font-size:18px;font-weight:700;color:${c}">${v}</div>
          </div>`).join('')}
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>일시</th><th>사용자</th><th>IP 주소</th><th>브라우저</th>
              <th class="td-center">유형</th><th>접속 경로</th><th class="td-center">결과</th>
            </tr></thead>
            <tbody>
              ${[
                {dt:'2026-05-20 09:21:14',user:'이준호',ip:'192.168.1.105',browser:'Chrome 124',type:'로그인',path:'/dashboard',ok:true},
                {dt:'2026-05-20 09:18:02',user:'김민재',ip:'192.168.1.88',browser:'Edge 122',type:'로그인',path:'/sales-orders',ok:true},
                {dt:'2026-05-20 08:55:31',user:'박서연',ip:'192.168.2.14',browser:'Chrome 124',type:'로그인',path:'/production-dtp',ok:true},
                {dt:'2026-05-20 08:47:12',user:'알 수 없음',ip:'203.12.44.98',browser:'Firefox 125',type:'로그인 시도',path:'/login',ok:false},
                {dt:'2026-05-19 18:02:45',user:'정유진',ip:'192.168.1.120',browser:'Chrome 123',type:'로그아웃',path:'/',ok:true},
                {dt:'2026-05-19 17:51:09',user:'이도현',ip:'192.168.1.77',browser:'Safari 17',type:'로그인',path:'/hr',ok:true},
                {dt:'2026-05-19 17:14:22',user:'최영훈',ip:'192.168.1.92',browser:'Chrome 124',type:'로그아웃',path:'/',ok:true},
                {dt:'2026-05-19 16:33:08',user:'알 수 없음',ip:'58.229.14.72',browser:'Chrome 124',type:'로그인 시도',path:'/login',ok:false},
                {dt:'2026-05-19 15:22:41',user:'정유진',ip:'192.168.1.120',browser:'Chrome 123',type:'로그인',path:'/finance',ok:true},
                {dt:'2026-05-19 14:07:55',user:'윤지호',ip:'192.168.1.101',browser:'Edge 122',type:'로그인',path:'/dashboard',ok:true},
              ].map(r=>`
              <tr>
                <td style="font-size:12px;color:#9ba8c0;white-space:nowrap">${r.dt}</td>
                <td style="font-weight:500">${r.user}</td>
                <td style="font-family:monospace;font-size:12.5px">${r.ip}</td>
                <td style="font-size:12.5px;color:#9ba8c0">${r.browser}</td>
                <td class="td-center"><span class="badge ${r.type==='로그인'?'badge-solid-green':r.type==='로그아웃'?'badge-blue':'badge-err'}">${r.type}</span></td>
                <td style="font-size:12.5px;color:#6b7a99">${r.path}</td>
                <td class="td-center"><span style="font-size:15px">${r.ok?'✅':'❌'}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-info">전체 1,284건</span>
          <div class="page-nums">${[1,2,3,4,5].map((n,i)=>`<span class="page-btn${i===0?' active':''}">${n}</span>`).join('')}</div>
        </div>
      </div>
    </div><!-- /sys-tab-4 -->

    <!-- ── 탭5: 백업/복원 ── -->
    <div id="sys-tab-5" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- 백업 스케줄 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">자동 백업 설정</span>
            <span class="badge badge-solid-green">활성</span>
          </div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:14px">
              ${[
                ['백업 주기','매일 새벽 3:00 AM'],
                ['보관 기간','최근 30일'],
                ['백업 위치','서버 내부 + NAS 이중 저장'],
                ['압축 여부','활성화 (gzip)'],
                ['암호화','AES-256 적용'],
                ['알림 수신','admin@aram.co.kr'],
              ].map(([l,v])=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fc">
                <span style="font-size:13px;color:#6b7a99">${l}</span>
                <span style="font-size:13.5px;font-weight:500">${v}</span>
              </div>`).join('')}
            </div>
            <div style="margin-top:16px;display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('수동 백업이 시작되었습니다. 완료 시 이메일로 알림을 드립니다.')">지금 백업</button>
              <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('설정 편집 화면은 준비 중입니다.')">설정 편집</button>
            </div>
          </div>
        </div>

        <!-- 백업 이력 -->
        <div class="card">
          <div class="card-header"><span class="card-title">백업 이력</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>일시</th><th>유형</th><th class="td-right">크기</th><th class="td-center">상태</th><th class="td-center">복원</th>
              </tr></thead>
              <tbody>
                ${[
                  {dt:'2026-05-20 03:00',type:'자동',size:'2.4 GB',ok:true},
                  {dt:'2026-05-19 03:00',type:'자동',size:'2.3 GB',ok:true},
                  {dt:'2026-05-18 03:00',type:'자동',size:'2.3 GB',ok:true},
                  {dt:'2026-05-17 14:22',type:'수동',size:'2.2 GB',ok:true},
                  {dt:'2026-05-17 03:00',type:'자동',size:'2.2 GB',ok:true},
                  {dt:'2026-05-16 03:00',type:'자동',size:'2.1 GB',ok:false},
                  {dt:'2026-05-15 03:00',type:'자동',size:'2.1 GB',ok:true},
                ].map(r=>`
                <tr>
                  <td style="font-size:12.5px;color:#9ba8c0">${r.dt}</td>
                  <td><span class="badge ${r.type==='자동'?'badge-blue':'badge-purple'}">${r.type}</span></td>
                  <td class="td-right" style="font-size:13px">${r.ok?r.size:'—'}</td>
                  <td class="td-center"><span class="badge ${r.ok?'badge-solid-green':'badge-err'}">${r.ok?'완료':'실패'}</span></td>
                  <td class="td-center">
                    ${r.ok?`<button class="btn btn-secondary btn-sm" style="font-size:11px;padding:2px 8px" onclick="if(window.ARAM_UI) ARAM_UI.Modal.open({title:'백업 복원',body:'<p style=\\'font-size:14px;color:#525f7f;text-align:center;padding:8px 0\\'>${r.dt} 백업으로 복원하시겠습니까?<br><b style=\\'color:#ef4444\\'>현재 데이터가 덮어씌워집니다.</b></p>',size:\\'sm\\'})">복원</button>`:'—'}
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 데이터 정리 -->
        <div class="card" style="grid-column:1 / -1">
          <div class="card-header"><span class="card-title">데이터베이스 상태</span></div>
          <div style="padding:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
            ${[
              {label:'DB 크기',value:'18.4 GB',sub:'증가 추세 +120MB/월',color:'#4361ee'},
              {label:'테이블 수',value:'142개',sub:'운영 중',color:'#10b981'},
              {label:'레코드 수',value:'4,821,034건',sub:'전체 누적',color:'#8b5cf6'},
              {label:'최적화 대상',value:'3개 테이블',sub:'권장: 조각 모음 실행',color:'#f59e0b'},
            ].map(({label,value,sub,color})=>`
            <div style="padding:14px;background:#f8f9fc;border-radius:10px;text-align:center">
              <div style="font-size:11.5px;color:#9ba8c0;margin-bottom:6px">${label}</div>
              <div style="font-size:20px;font-weight:700;color:${color};margin-bottom:4px">${value}</div>
              <div style="font-size:11.5px;color:#9ba8c0">${sub}</div>
            </div>`).join('')}
          </div>
          <div style="padding:0 16px 16px;display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('데이터베이스 최적화를 시작했습니다.')">DB 최적화</button>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('임시 파일을 정리했습니다.')">임시파일 정리</button>
            <button class="btn btn-secondary btn-sm" onclick="if(window.ARAM_UI) ARAM_UI.Toast.info('쿼리 캐시를 초기화했습니다.')">캐시 초기화</button>
          </div>
        </div>
      </div>
    </div><!-- /sys-tab-5 -->`;
  },

};

/* ═══════════════════════════════════════════════════════════
   DTP 디자인 — 전역 함수 (pages.js 로드 시 즉시 등록)
   innerHTML 내부 <script> 실행 문제를 우회하기 위해
   페이지 렌더러 밖 모듈 레벨에서 정의합니다.
   ═══════════════════════════════════════════════════════════ */

/* ── 테이블 갱신 ── */
window._refreshDtpTables = function() {
  var rows = window._dtpRequests || [];

  var tb1 = document.getElementById('dtp-search-tbody');
  if (tb1) {
    tb1.innerHTML = rows.map(function(r) {
      return '<tr>'
        + '<td class="td-link" style="font-size:12px">' + r.no + '</td>'
        + '<td style="font-size:12px">' + r.client + '</td>'
        + '<td style="font-size:12px">' + r.item + '</td>'
        + '<td style="font-size:12px">' + r.staff + '</td>'
        + '<td class="td-center"><span class="badge ' + r.bclass + '">' + r.status + '</span></td>'
        + '</tr>';
    }).join('');
  }

  var tb2 = document.getElementById('dtp-pending-tbody');
  if (tb2) {
    tb2.innerHTML = rows.map(function(r) {
      return '<tr>'
        + '<td class="td-link">' + r.no + '</td>'
        + '<td>' + r.client + '</td>'
        + '<td>' + r.item + '</td>'
        + '<td>' + r.req + '</td>'
        + '<td style="font-weight:600;color:' + (r.bclass === 'badge-red' ? '#ef4444' : 'var(--txt)') + '">' + r.due + '</td>'
        + '<td>' + r.staff + '</td>'
        + '<td class="td-center"><span class="badge ' + r.bclass + '">' + r.status + '</span></td>'
        + '</tr>';
    }).join('');
  }
};

/* ── 거래처 카드 검색 필터 ── */
window._filterDtpClients = function(q) {
  q = (q || '').toLowerCase().trim();
  document.querySelectorAll('.dtp-client-card').forEach(function(card) {
    var n   = (card.dataset.name || '').toLowerCase();
    var ini = (card.dataset.init || '').toLowerCase();
    card.style.display = (!q || n.includes(q) || ini.includes(q)) ? '' : 'none';
  });
};

/* ── 서브탭 전환 ── */
window.switchDtpSub = function(btn, panelId) {
  document.querySelectorAll('.dtpsub-btn').forEach(function(b) {
    b.style.background  = 'transparent';
    b.style.color       = 'var(--muted)';
    b.style.fontWeight  = '500';
  });
  btn.style.background = '#1a2035';
  btn.style.color      = '#fff';
  btn.style.fontWeight = '600';
  ['dtpsub-1', 'dtpsub-2', 'dtpsub-3', 'dtpsub-4'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = (id === panelId) ? '' : 'none';
  });
};

/* ── 출력 유무 버튼 토글 ── */
window._dtpPrintToggle = function(selected) {
  var btnY = document.getElementById('dtpPrintY');
  var btnN = document.getElementById('dtpPrintN');
  if (!btnY || !btnN) return;
  if (selected === 'Y') {
    btnY.style.background = '#4361ee'; btnY.style.color = '#fff';
    btnN.style.background = 'transparent'; btnN.style.color = 'var(--muted)';
    btnY.dataset.selected = '1'; btnN.dataset.selected = '0';
  } else {
    btnN.style.background = '#4361ee'; btnN.style.color = '#fff';
    btnY.style.background = 'transparent'; btnY.style.color = 'var(--muted)';
    btnN.dataset.selected = '1'; btnY.dataset.selected = '0';
  }
};

/* ── 요청서 작성 모달 ── */
/* ── 거래처별 샘플 요청서 데이터 ── */
window._dtpClientSample = {
  '지성': [
    {no:'DTP-2026-0891',item:'플라워 프린트 A4',  req:'05.15',due:'05.20',staff:'김디자인',bclass:'badge-red',   status:'오늘기한'},
    {no:'DTP-2026-0855',item:'스트라이프 CW',      req:'05.08',due:'05.16',staff:'김디자인',bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0830',item:'도트 패턴 컬러웨이', req:'05.02',due:'05.10',staff:'하에진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0810',item:'지성 로고 자수',     req:'04.28',due:'05.05',staff:'하에진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0795',item:'기하학 반복 패턴',   req:'04.22',due:'04.30',staff:'김디자인',bclass:'badge-green', status:'완료'},
  ],
  '슈퍼맛': [
    {no:'DTP-2026-0887',item:'체크패턴 반복',     req:'05.14',due:'05.21',staff:'이담당',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0860',item:'레트로 패턴 CW',    req:'05.09',due:'05.17',staff:'오회진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0835',item:'플로럴 리피트',      req:'05.03',due:'05.12',staff:'이담당',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0812',item:'슈퍼맛 브랜드 패턴',req:'04.29',due:'05.06',staff:'오회진',  bclass:'badge-green', status:'완료'},
  ],
  '예성': [
    {no:'DTP-2026-0882',item:'줄무늬 컬러웨이',   req:'05.13',due:'05.22',staff:'박작업',  bclass:'badge-gray',  status:'대기'},
    {no:'DTP-2026-0858',item:'그라데이션 TEST',   req:'05.08',due:'05.16',staff:'하에진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0840',item:'예성 시즌 패턴',    req:'05.04',due:'05.13',staff:'박작업',  bclass:'badge-green', status:'완료'},
  ],
  '엠제이': [
    {no:'DTP-2026-0879',item:'아이코닉 로고',     req:'05.12',due:'05.23',staff:'김디자인',bclass:'badge-gray',  status:'대기'},
    {no:'DTP-2026-0852',item:'엠제이 샘플',       req:'05.07',due:'05.15',staff:'오회진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0828',item:'시그니처 패턴 CW',  req:'05.01',due:'05.09',staff:'김디자인',bclass:'badge-green', status:'완료'},
  ],
  '아이디어': [
    {no:'DTP-2026-0876',item:'기하학 패턴',        req:'05.11',due:'05.25',staff:'이담당',  bclass:'badge-gray',  status:'대기'},
    {no:'DTP-2026-0845',item:'아이디어 CW-2',      req:'05.05',due:'05.14',staff:'이담당',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0820',item:'추상 패턴 TEST',     req:'04.30',due:'05.08',staff:'하에진',  bclass:'badge-green', status:'완료'},
  ],
  '네모': [
    {no:'DTP-2026-0874',item:'네모 시즌 CW',       req:'05.11',due:'05.22',staff:'신호준',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0848',item:'직선 기하 패턴',     req:'05.06',due:'05.15',staff:'신호준',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0822',item:'네모 로고 자수',     req:'04.30',due:'05.08',staff:'신호준',  bclass:'badge-green', status:'완료'},
  ],
  '타임': [
    {no:'DTP-2026-0872',item:'타임 클래식 CW',    req:'05.10',due:'05.20',staff:'이동연',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0846',item:'스트라이프 TEST',   req:'05.05',due:'05.14',staff:'이동연',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0823',item:'타임 로고 옵션',    req:'04.30',due:'05.07',staff:'이동연',  bclass:'badge-green', status:'완료'},
  ],
  '바오': [
    {no:'DTP-2026-0869',item:'바오 플로럴',       req:'05.09',due:'05.19',staff:'오회진',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0842',item:'바오 CW-시즌2',     req:'05.04',due:'05.12',staff:'오회진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0818',item:'동물 패턴 TEST',    req:'04.29',due:'05.06',staff:'오회진',  bclass:'badge-green', status:'완료'},
  ],
  '풍전': [
    {no:'DTP-2026-0867',item:'풍전 전통 패턴',   req:'05.09',due:'05.18',staff:'신호준',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0843',item:'풍전 로고 CW',     req:'05.04',due:'05.12',staff:'신호준',  bclass:'badge-green', status:'완료'},
  ],
  '세연': [
    {no:'DTP-2026-0866',item:'세연 플라워 CW',   req:'05.08',due:'05.17',staff:'하에진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0844',item:'세연 시즌 TEST',   req:'05.05',due:'05.13',staff:'하에진',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0819',item:'세연 로고 OPTION', req:'04.29',due:'05.07',staff:'하에진',  bclass:'badge-green', status:'완료'},
  ],
  '세영': [
    {no:'DTP-2026-0863',item:'세영 CW 패턴',     req:'05.08',due:'05.16',staff:'이동연',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0841',item:'세영 TEST 샘플',   req:'05.04',due:'05.11',staff:'이동연',  bclass:'badge-green', status:'완료'},
  ],
  '두레': [
    {no:'DTP-2026-0859',item:'두레 전통 문양',   req:'05.07',due:'05.15',staff:'신호준',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0837',item:'두레 로고 CW',     req:'05.03',due:'05.10',staff:'신호준',  bclass:'badge-green', status:'완료'},
  ],
  '지텍스': [
    {no:'DTP-2026-0856',item:'지텍스 기능성 CW', req:'05.07',due:'05.14',staff:'이동연',  bclass:'badge-green', status:'완료'},
    {no:'DTP-2026-0833',item:'지텍스 TEST 패턴', req:'05.02',due:'05.09',staff:'이동연',  bclass:'badge-green', status:'완료'},
  ],
  '케빈': [
    {no:'DTP-2026-0854',item:'케빈 신규 CW',     req:'05.06',due:'05.14',staff:'하에진',  bclass:'badge-blue',  status:'진행중'},
    {no:'DTP-2026-0831',item:'케빈 로고 TEST',   req:'05.02',due:'05.09',staff:'하에진',  bclass:'badge-green', status:'완료'},
  ],
};

/* ── 거래처 상세 모달 ── */
window._openDtpClientDetail = function(name, color, init, total, done) {
  var UI = window.ARAM_UI;
  if (!UI || !UI.Modal) { alert('UI 모듈 로드 오류'); return; }

  var totalN = Number(total) || 0;
  var doneN  = Number(done)  || 0;
  var ingN   = Math.max(0, Math.ceil((totalN - doneN) / 2));
  var waitN  = Math.max(0, totalN - doneN - ingN);
  var pct    = totalN > 0 ? Math.round(doneN / totalN * 100) : 0;

  /* 요청서 데이터: 전역 배열에서 해당 거래처 필터 + 샘플 보완 */
  var live    = (window._dtpRequests || []).filter(function(r){ return r.client === name; });
  var samples = (window._dtpClientSample || {})[name] || [];
  /* 중복 제거: live에 있는 번호는 samples에서 제외 */
  var liveNos = live.map(function(r){ return r.no; });
  var extra   = samples.filter(function(r){ return liveNos.indexOf(r.no) === -1; });
  var rows    = live.concat(extra);

  var initSize = (init||'').length > 2 ? '11' : '16';
  var colorHex = color || '#4361ee';
  var hexAlpha = colorHex + '1a'; /* 약 10% 투명 배경 */

  /* 통계 카드 */
  var statsHtml = [
    ['전체',   totalN, '#4361ee'],
    ['완료',   doneN,  '#10b981'],
    ['진행중', ingN,   '#f59e0b'],
    ['대기',   waitN,  '#6b7280'],
  ].map(function(kv){
    return '<div style="background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;padding:14px;text-align:center">'
      + '<div style="font-size:11.5px;color:var(--muted);margin-bottom:6px">' + kv[0] + '</div>'
      + '<div style="font-size:26px;font-weight:800;color:' + kv[2] + ';line-height:1">' + kv[1] + '</div>'
      + '</div>';
  }).join('');

  /* 요청서 테이블 rows */
  var trowHtml = rows.length > 0
    ? rows.map(function(r){
        return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'">'
          + '<td style="font-size:12px"><span onclick="_openDtpRequestDetail(\'' + r.no + '\')" style="color:#4361ee;font-weight:600;cursor:pointer;text-decoration:underline">' + r.no + '</span></td>'
          + '<td style="font-size:12px" onclick="_openDtpRequestDetail(\'' + r.no + '\')">' + r.item + '</td>'
          + '<td style="font-size:12px;text-align:center" onclick="_openDtpRequestDetail(\'' + r.no + '\')">' + (r.req || '-') + '</td>'
          + '<td style="font-size:12px;text-align:center;font-weight:600;color:' + (r.bclass==='badge-red'?'#ef4444':'var(--txt)') + '" onclick="_openDtpRequestDetail(\'' + r.no + '\')">' + (r.due || '-') + '</td>'
          + '<td style="font-size:12px" onclick="_openDtpRequestDetail(\'' + r.no + '\')">' + (r.staff || '-') + '</td>'
          + '<td class="td-center" onclick="_openDtpRequestDetail(\'' + r.no + '\')"><span class="badge ' + r.bclass + '">' + r.status + '</span></td>'
          + '</tr>';
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--muted);font-size:13px">등록된 요청서가 없습니다</td></tr>';

  var body = '<div>'

    /* 거래처 헤더 */
    + '<div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:' + colorHex + ';border:1.5px solid ' + colorHex + ';border-radius:12px;margin-bottom:16px">'
    + '<div style="width:60px;height:60px;border-radius:50%;background:' + colorHex + ';border:3px solid ' + colorHex + ';box-shadow:0 0 0 4px ' + colorHex + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:' + initSize + 'px;font-weight:700;color:#fff;background:' + colorHex + '">'
    + '<div style="width:60px;height:60px;border-radius:50%;background:' + color + ';color:#fff;font-size:' + initSize + 'px;font-weight:700;display:flex;align-items:center;justify-content:center">' + init + '</div>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font-size:20px;font-weight:700;color:var(--txt);margin-bottom:4px">' + name + '</div>'
    + '<div style="font-size:12.5px;color:var(--muted)">전체 ' + totalN + '건 &nbsp;·&nbsp; 완료 ' + doneN + '건 &nbsp;·&nbsp; 완료율 ' + pct + '%</div>'
    + '</div>'
    + '<div style="text-align:right;flex-shrink:0">'
    + '<div style="font-size:32px;font-weight:800;color:' + color + ';line-height:1">' + pct + '%</div>'
    + '<div style="width:100px;height:7px;border-radius:4px;background:var(--bdr);margin-top:8px">'
    + '<div style="width:' + pct + '%;height:100%;border-radius:4px;background:' + color + '"></div>'
    + '</div>'
    + '</div>'
    + '</div>'

    /* 통계 카드 4개 */
    + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">' + statsHtml + '</div>'

    /* 요청서 목록 */
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<div style="font-size:13.5px;font-weight:600;color:var(--txt)">' + name + ' 디자인 요청서 목록</div>'
    + '<span style="font-size:12px;color:var(--muted)">' + rows.length + '건</span>'
    + '</div>'
    + '<div class="table-wrap" style="max-height:240px;overflow-y:auto">'
    + '<table>'
    + '<thead><tr><th>작업번호</th><th>품목 / 제목</th><th style="text-align:center">요청일</th><th style="text-align:center">기한</th><th>담당자</th><th style="text-align:center">상태</th></tr></thead>'
    + '<tbody>' + trowHtml + '</tbody>'
    + '</table>'
    + '</div>'
    + '</div>';

  UI.Modal.open({
    title: name + ' 거래처 디자인 현황',
    body:  body,
    size:  'lg',
    footer: [
      { label: '닫기',      type: 'secondary', onClick: function(close) { close(); } },
      { label: '+ 요청서 작성', type: 'primary', onClick: function(close) {
          close();
          setTimeout(function(){ window._openDtpRequestModal(); }, 350);
        }
      }
    ]
  });
};

window._openDtpRequestModal = function() {
  var UI = window.ARAM_UI;
  if (!UI || !UI.Modal) { alert('UI 모듈이 로드되지 않았습니다.'); return; }

  var clientOpts = ['지성','슈퍼맛','예성','엠제이','아이디어','네모','타임','바오','풍전','세연','세영','두레','지텍스','케빈']
    .map(function(n){ return '<option value="' + n + '">' + n + '</option>'; }).join('');

  var statusBtns = ['대기','진행중','완료','취소'].map(function(s, i) {
    var active = i === 0;
    return '<label style="display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;'
      + 'border:1.5px solid ' + (active ? '#f0a0c0' : 'var(--bdr)') + ';'
      + 'background:' + (active ? '#fff0f6' : 'transparent') + ';'
      + 'cursor:pointer;font-size:12.5px;font-weight:' + (active ? '600' : '400') + ';'
      + 'color:' + (active ? '#d63384' : 'var(--muted)') + '">'
      + '<input type="radio" name="dtpFStatus" value="' + s + '" ' + (active ? 'checked' : '') + ' style="accent-color:#d63384">' + s
      + '</label>';
  }).join('');

  var formHtml = '<div style="padding:4px 0 0;font-family:inherit">'

    + '<div style="font-size:13px;font-weight:700;color:#4361ee;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e8ecf8">기본 정보</div>'

    + '<div style="margin-bottom:14px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">요청서 제목 <span style="color:#ef4444">*</span></label>'
    + '<input id="dtpFTitle" class="form-input" placeholder="요청서 제목 입력" style="width:100%">'
    + '<div id="dtpFTitleErr" style="color:#ef4444;font-size:11.5px;margin-top:3px;display:none">제목을 입력해 주세요</div>'
    + '</div>'

    + '<div style="margin-bottom:14px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:8px">작업 상태</label>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap">' + statusBtns + '</div>'
    + '</div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">작업요청 날짜 <span style="color:#ef4444">*</span></label>'
    + '<input id="dtpFDate" type="date" class="form-input" style="width:100%">'
    + '<div id="dtpFDateErr" style="color:#ef4444;font-size:11.5px;margin-top:3px;display:none">날짜를 선택해 주세요</div>'
    + '</div>'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">거래처명 <span style="color:#ef4444">*</span></label>'
    + '<select id="dtpFClient" class="form-select" style="width:100%"><option value="">-- 거래처 선택 --</option>' + clientOpts + '</select>'
    + '<div id="dtpFClientErr" style="color:#ef4444;font-size:11.5px;margin-top:3px;display:none">거래처를 선택해 주세요</div>'
    + '</div>'
    + '</div>'

    + '<div style="margin-bottom:20px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">코드명</label>'
    + '<input id="dtpFCode" class="form-input" placeholder="예: JS지성3610" style="width:100%">'
    + '</div>'

    + '<div style="font-size:13px;font-weight:700;color:#4361ee;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e8ecf8">작업 정보</div>'

    + '<div style="margin-bottom:14px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">이미지 확인</label>'
    + '<input id="dtpFImg" class="form-input" placeholder="이미지 URL 또는 메모" style="width:100%">'
    + '</div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">작업 구분</label>'
    + '<select id="dtpFWorkType" class="form-select" style="width:100%"><option value="">-- 선택 --</option><option>CW</option><option>TEST</option><option>OPTION</option><option>샘플</option></select>'
    + '</div>'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:8px">출력 유무</label>'
    + '<div style="display:flex;gap:6px">'
    + '<button type="button" id="dtpPrintY" onclick="_dtpPrintToggle(\'Y\')" data-selected="0"'
    + ' style="flex:1;padding:7px;border-radius:6px;border:1.5px solid var(--bdr);background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">유</button>'
    + '<button type="button" id="dtpPrintN" onclick="_dtpPrintToggle(\'N\')" data-selected="1"'
    + ' style="flex:1;padding:7px;border-radius:6px;border:1.5px solid var(--bdr);background:#4361ee;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">무</button>'
    + '</div>'
    + '</div>'
    + '</div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">원단명</label>'
    + '<input id="dtpFFabric" class="form-input" placeholder="예: 아람60수110" style="width:100%">'
    + '</div>'
    + '<div>'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">출고처</label>'
    + '<input id="dtpFOutlet" class="form-input" placeholder="출고처 입력" style="width:100%">'
    + '</div>'
    + '</div>'

    + '<div style="margin-bottom:20px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">출력요청 날짜</label>'
    + '<input id="dtpFPrintDate" type="date" class="form-input" style="width:60%">'
    + '</div>'

    + '<div style="font-size:13px;font-weight:700;color:#4361ee;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e8ecf8">상세 내용</div>'
    + '<div style="margin-bottom:4px">'
    + '<label style="font-size:12.5px;font-weight:600;color:var(--txt);display:block;margin-bottom:5px">작업지시 사항</label>'
    + '<textarea id="dtpFMemo" class="form-input" rows="4" placeholder="작업지시 사항을 입력하세요..." style="width:100%;resize:vertical;line-height:1.6"></textarea>'
    + '</div>'
    + '</div>';

  UI.Modal.open({
    title: 'DTP 디자인 요청서 작성',
    body:  formHtml,
    size:  'lg',
    footer: [
      { label: '취소',    type: 'secondary', onClick: function(close) { close(); } },
      { label: '저장하기', type: 'primary',   onClick: function(close) {

        var title     = (document.getElementById('dtpFTitle')     || {}).value || '';
        var dateVal   = (document.getElementById('dtpFDate')      || {}).value || '';
        var client    = (document.getElementById('dtpFClient')    || {}).value || '';
        var code      = (document.getElementById('dtpFCode')      || {}).value || '';
        var workType  = (document.getElementById('dtpFWorkType')  || {}).value || '';
        var fabric    = (document.getElementById('dtpFFabric')    || {}).value || '';
        var outlet    = (document.getElementById('dtpFOutlet')    || {}).value || '';
        var printDate = (document.getElementById('dtpFPrintDate') || {}).value || '';
        var memo      = (document.getElementById('dtpFMemo')      || {}).value || '';
        var statusEl  = document.querySelector('input[name="dtpFStatus"]:checked');
        var status    = statusEl ? statusEl.value : '대기';
        var printNBtn = document.getElementById('dtpPrintN');
        var printYn   = (printNBtn && printNBtn.dataset.selected === '1') ? '무' : '유';

        title  = title.trim();
        client = client.trim();

        /* 유효성 검사 */
        var valid = true;
        ['dtpFTitleErr','dtpFDateErr','dtpFClientErr'].forEach(function(id) {
          var el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        if (!title)   { var e = document.getElementById('dtpFTitleErr');  if (e) e.style.display = 'block'; valid = false; }
        if (!dateVal) { var e = document.getElementById('dtpFDateErr');   if (e) e.style.display = 'block'; valid = false; }
        if (!client)  { var e = document.getElementById('dtpFClientErr'); if (e) e.style.display = 'block'; valid = false; }
        if (!valid) return;

        var reqDisp = dateVal   ? dateVal.slice(5).replace('-', '.')   : '';
        var dueDisp = printDate ? printDate.slice(5).replace('-', '.') : '-';
        var seq     = (window._dtpRequests || []).length + 892;
        var newNo   = 'DTP-2026-0' + seq;
        var bclass  = ({ '대기':'badge-gray', '진행중':'badge-blue', '완료':'badge-green', '취소':'badge-red' })[status] || 'badge-gray';
        var itemLabel = title + (workType ? ' [' + workType + ']' : '');

        if (!window._dtpRequests) window._dtpRequests = [];
        window._dtpRequests.unshift({
          no: newNo, client: client, item: itemLabel,
          req: reqDisp, due: dueDisp, staff: '담당자',
          bclass: bclass, status: status,
          code: code, fabric: fabric, outlet: outlet, printYn: printYn, memo: memo
        });

        window._refreshDtpTables();
        UI.Toast.success('요청서 ' + newNo + ' 저장되었습니다 ✓');
        close();
      }}
    ]
  });
};

/* ── 작업번호로 요청서 찾기 (live + sample 통합 검색) ── */
window._findDtpRequest = function(no) {
  /* 1) 새로 저장된 live 데이터 우선 */
  var live = (window._dtpRequests || []);
  for (var i = 0; i < live.length; i++) { if (live[i].no === no) return live[i]; }

  /* 2) 거래처별 샘플 데이터 */
  var samples = window._dtpClientSample || {};
  var clientNames = Object.keys(samples);
  for (var ci = 0; ci < clientNames.length; ci++) {
    var list = samples[clientNames[ci]];
    for (var j = 0; j < list.length; j++) {
      if (list[j].no === no) return Object.assign({ client: clientNames[ci] }, list[j]);
    }
  }
  return null;
};

/* ── 요청서 상세 모달 ── */
window._openDtpRequestDetail = function(no) {
  var UI = window.ARAM_UI;
  if (!UI || !UI.Modal) return;

  var r = window._findDtpRequest(no);
  if (!r) { UI.Toast.info('요청서 정보를 찾을 수 없습니다.'); return; }

  /* 상태 컬러 */
  var statusColor = {
    '오늘기한':'#ef4444','대기':'#6b7280','진행중':'#4361ee','완료':'#10b981','취소':'#ef4444'
  }[r.status] || '#6b7280';

  /* 출력 유무 배지 */
  var printYnHtml = r.printYn
    ? '<span style="background:' + (r.printYn==='유'?'#4361ee':'#6b7280') + ';color:#fff;border-radius:5px;padding:2px 10px;font-size:12px;font-weight:600">' + r.printYn + '</span>'
    : '<span style="color:var(--muted);font-size:13px">—</span>';

  /* 작업구분 배지 */
  var workTypeHtml = r.workType
    ? '<span style="background:#e8ecf8;color:#4361ee;border-radius:5px;padding:3px 12px;font-size:12.5px;font-weight:600">' + r.workType + '</span>'
    : '<span style="color:var(--muted);font-size:13px">—</span>';

  function row(label, val) {
    return '<div style="display:flex;align-items:flex-start;gap:0;padding:11px 0;border-bottom:1px solid var(--bdr)">'
      + '<div style="width:130px;flex-shrink:0;font-size:12.5px;font-weight:600;color:var(--muted)">' + label + '</div>'
      + '<div style="font-size:13px;color:var(--txt);flex:1">' + (val || '<span style="color:var(--muted)">—</span>') + '</div>'
      + '</div>';
  }

  var body = '<div>'

    /* 상단 상태 헤더 */
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:20px">'
    + '<div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--txt);margin-bottom:4px">' + r.no + '</div>'
    + '<div style="font-size:12.5px;color:var(--muted)">' + (r.client || '') + (r.code ? ' &nbsp;·&nbsp; ' + r.code : '') + '</div>'
    + '</div>'
    + '<span style="background:' + statusColor + ';color:#fff;border-radius:20px;padding:5px 16px;font-size:13px;font-weight:700">' + r.status + '</span>'
    + '</div>'

    /* 기본 정보 섹션 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">기본 정보</div>'
    + row('요청서 제목', r.item)
    + row('거래처명', r.client)
    + row('코드명', r.code)
    + row('작업요청 날짜', r.req ? '2026.' + r.req : '—')
    + row('기한 (출력요청)', r.due ? '2026.' + r.due : '—')
    + row('담당자', r.staff)

    /* 작업 정보 섹션 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 8px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">작업 정보</div>'
    + row('작업 구분', workTypeHtml)
    + row('출력 유무', printYnHtml)
    + row('원단명', r.fabric)
    + row('출고처', r.outlet)

    /* 작업지시 사항 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 8px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">작업지시 사항</div>'
    + '<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);min-height:60px;line-height:1.7">'
    + (r.memo || '<span style="color:var(--muted)">작업지시 사항이 없습니다.</span>')
    + '</div>'

    + '</div>';

  UI.Modal.open({
    title: '요청서 상세 — ' + r.no,
    body:  body,
    size:  'lg',
    footer: [
      { label: '목록으로', type: 'secondary', onClick: function(close) { close(); } },
      { label: '요청서 수정', type: 'primary', onClick: function(close) {
          UI.Toast.info('수정 기능은 준비 중입니다.');
        }
      }
    ]
  });
};

/* ───────────────────────────────────────────────
   DTP 디자인 자료 파일 DB
─────────────────────────────────────────────── */
window._dtpFileDB = [
  {name:'플라워패턴_지성_0891.ai',   client:'지성',   ext:'AI 파일',   extTag:'ai',  date:'2026-05-15', staff:'김디자인', size:'24.3 MB', req:'DTP-2026-0891', ver:'v1.0', memo:'플라워 프린트 A4 사이즈 패턴 원본 AI 파일. 색상 4도 분리 완료.'},
  {name:'체크무늬_대한_0892.psd',    client:'대한',   ext:'PSD 파일',  extTag:'psd', date:'2026-05-16', staff:'이편집',  size:'88.7 MB', req:'DTP-2026-0892', ver:'v2.1', memo:'체크무늬 전면 배색 PSD. 레이어 분리 상태로 저장.'},
  {name:'줄무늬_미래_0893.pdf',      client:'미래',   ext:'PDF 파일',  extTag:'pdf', date:'2026-05-17', staff:'박DTP',   size:'3.2 MB',  req:'DTP-2026-0893', ver:'v1.0', memo:'줄무늬 패턴 인쇄용 PDF. CMYK 변환 완료.'},
  {name:'그라데이션_새벽_0894.ai',   client:'새벽',   ext:'AI 파일',   extTag:'ai',  date:'2026-05-17', staff:'김디자인', size:'17.5 MB', req:'DTP-2026-0894', ver:'v1.2', memo:'그라데이션 배경 AI 파일. 투명도 효과 포함.'},
  {name:'기하학_하늘_0895.png',      client:'하늘',   ext:'PNG 이미지', extTag:'png', date:'2026-05-18', staff:'이편집',  size:'5.1 MB',  req:'DTP-2026-0895', ver:'v1.0', memo:'기하학 패턴 고해상도 PNG. 300dpi 출력용.'},
  {name:'꽃잎_대우_0896.pdf',        client:'대우',   ext:'PDF 파일',  extTag:'pdf', date:'2026-05-18', staff:'박DTP',   size:'2.8 MB',  req:'DTP-2026-0896', ver:'v1.1', memo:'꽃잎 문양 인쇄용 PDF. 재단선 포함.'},
  {name:'아트_동방_0897.ai',         client:'동방',   ext:'AI 파일',   extTag:'ai',  date:'2026-05-19', staff:'김디자인', size:'31.0 MB', req:'DTP-2026-0897', ver:'v1.0', memo:'아트 패턴 원본 AI. 색상 스와치 별도 첨부.'},
  {name:'자수패턴_청운_0898.psd',    client:'청운',   ext:'PSD 파일',  extTag:'psd', date:'2026-05-19', staff:'이편집',  size:'104.2 MB',req:'DTP-2026-0898', ver:'v3.0', memo:'자수 패턴 PSD. 스티치 레이어 별도 분리.'}
];

/* ───────────────────────────────────────────────
   파일 상세 모달 열기
─────────────────────────────────────────────── */
window._openDtpFileDetail = function(filename) {
  var UI = window.ARAM_UI;
  var f = (window._dtpFileDB || []).find(function(x){ return x.name === filename; });
  if (!f) { UI.Toast.error('파일 정보를 찾을 수 없습니다.'); return; }

  var extColors = { ai:'#FF6B00', psd:'#31A8FF', pdf:'#E02B2B', png:'#1AC97D', jpg:'#8E44AD' };
  var extColor  = extColors[f.extTag] || '#607d8b';

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'

    /* 파일 아이콘 + 이름 */
    + '<div style="display:flex;align-items:center;gap:18px;padding:16px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:18px">'
    +   '<div style="width:56px;height:56px;border-radius:10px;background:' + extColor + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +     '<span style="color:#fff;font-size:14px;font-weight:800;letter-spacing:-0.5px">' + f.extTag.toUpperCase() + '</span>'
    +   '</div>'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:4px;word-break:break-all">' + f.name + '</div>'
    +     '<div style="font-size:12px;color:var(--muted)">' + f.ext + ' &nbsp;·&nbsp; ' + f.size + ' &nbsp;·&nbsp; ' + f.ver + '</div>'
    +   '</div>'
    +   '<button onclick="_downloadDtpFile(\'' + f.name.replace(/'/g,"\\'") + '\',\'' + f.ext + '\',\'' + f.size + '\')" '
    +     'style="flex-shrink:0;background:#4361ee;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer">⬇ 다운로드</button>'
    + '</div>'

    /* 상세 정보 */
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">'
    + _dtpFileInfoCell('거래처', f.client)
    + _dtpFileInfoCell('담당자', f.staff)
    + _dtpFileInfoCell('등록일', f.date)
    + _dtpFileInfoCell('버전', f.ver)
    + _dtpFileInfoCell('파일 형식', f.ext)
    + _dtpFileInfoCell('파일 크기', f.size)
    + '</div>'

    /* 연결 요청서 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">연결 요청서</div>'
    + '<div style="padding:10px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;margin-bottom:14px;cursor:pointer" '
    +   'onclick="_openDtpRequestDetail(\'' + f.req + '\')">'
    +   '<span style="color:#4361ee;font-weight:700;text-decoration:underline">' + f.req + '</span>'
    +   '<span style="color:var(--muted);font-size:12px;margin-left:10px">클릭하여 요청서 상세보기</span>'
    + '</div>'

    /* 메모 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">메모 / 작업지시</div>'
    + '<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);line-height:1.7;min-height:50px">'
    + (f.memo || '<span style="color:var(--muted)">메모 없음</span>')
    + '</div>'

    + '</div>';

  UI.Modal.open({
    title: '파일 상세 — ' + f.name,
    body:  body,
    size:  'lg',
    footer: [
      { label: '닫기', type: 'secondary', onClick: function(close){ close(); } },
      { label: '⬇ 다운로드', type: 'primary', onClick: function(close){
          window._downloadDtpFile(f.name, f.ext, f.size);
        }
      }
    ]
  });
};

/* helper: 파일 정보 셀 */
window._dtpFileInfoCell = function(label, val) {
  return '<div style="background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;padding:10px 14px">'
    + '<div style="font-size:11px;color:var(--muted);margin-bottom:3px">' + label + '</div>'
    + '<div style="font-size:13px;font-weight:600;color:var(--txt)">' + (val || '—') + '</div>'
    + '</div>';
};

/* ───────────────────────────────────────────────
   파일 다운로드 (Blob)
─────────────────────────────────────────────── */
window._downloadDtpFile = function(filename, ext, size) {
  var UI = window.ARAM_UI;
  var content = [
    '==================================================',
    '  ARAM INDUSTRY — DTP 디자인 파일 정보',
    '==================================================',
    '파일명  : ' + filename,
    '형식    : ' + ext,
    '크기    : ' + size,
    '다운로드: ' + new Date().toLocaleString('ko-KR'),
    '--------------------------------------------------',
    '본 파일은 ARAM INDUSTRY 통합포털 ERP에서 내보낸',
    '디자인 자료 정보 파일입니다.',
    '실제 디자인 원본 파일은 사내 파일 서버를 확인하세요.',
    '=================================================='
  ].join('\n');

  try {
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = filename.replace(/\.[^.]+$/, '') + '_info.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
    UI.Toast.success(filename + ' 다운로드가 시작되었습니다 ✓');
  } catch(e) {
    UI.Toast.error('다운로드 중 오류가 발생했습니다.');
  }
};

/* ═══════════════════════════════════════════════════
   담당자별 진행상황 — 업무 코드 상세 DB
═══════════════════════════════════════════════════ */
window._dtpWorkDB = [
  /* 하에진 담당 */
  {code:'JS지성3610-CW',     staff:'하에진', client:'지성',     type:'CW',     date:'2026-05-07', status:'진행중', badge:'지급',  bc:'#f59e0b',
   fabric:'아람60수110', size:'A4', qty:'500m', outlet:'지성본사', memo:'출력 진행 중. 색상 4도 분리 완료, 원단 수령 후 즉시 출력 예정. 지급 처리 필요.'},
  {code:'YS예성0810-OPTION', staff:'하에진', client:'예성',     type:'OPTION', date:'2026-05-07', status:'검토중', badge:'출력X', bc:'#374151',
   fabric:'새보정 원단', size:'A3', qty:'300m', outlet:'예성공장', memo:'새보정 요청 반영 중. OPTION 작업으로 출력 없이 디지털 파일만 납품 예정.'},
  {code:'KV케빈0112-CW',    staff:'하에진', client:'케빈',     type:'CW',     date:'2026-05-07', status:'진행중', badge:'',      bc:'',
   fabric:'60수 혼방', size:'A4', qty:'200m', outlet:'케빈쇼룸', memo:'신규 거래처 첫 작업. 샘플 출력 후 확인 요청 예정.'},
  {code:'NM네모1183-CW',    staff:'하에진', client:'네모',     type:'CW',     date:'2026-05-06', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'40수 면', size:'A4', qty:'400m', outlet:'네모물류센터', memo:'출력 완료. 납품 완료 확인.'},
  {code:'PJ풍전0406-TEST',  staff:'하에진', client:'풍전',     type:'TEST',   date:'2026-05-06', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'테스트원단', size:'A4', qty:'50m', outlet:'풍전본사', memo:'테스트 출력 완료. 품질 검수 통과.'},

  /* 오회진 담당 */
  {code:'MJ엠제이2220-CW',    staff:'오회진', client:'엠제이',   type:'CW',   date:'2026-05-07', status:'완료',  badge:'메일', bc:'#3b82f6',
   fabric:'80수 면', size:'특수', qty:'200m', outlet:'엠제이본사', memo:'샘플 메일 발송 완료. 거래처 최종 확인 대기 중.'},
  {code:'SM슈퍼마켓1021-CW',  staff:'오회진', client:'슈퍼마켓', type:'CW',   date:'2026-05-07', status:'진행중', badge:'',    bc:'',
   fabric:'60수 폴리', size:'A3', qty:'350m', outlet:'슈퍼마켓DC', memo:'작업 진행 중. 중간 점검 완료.'},
  {code:'BO바오0507-CW',       staff:'오회진', client:'바오',    type:'CW',   date:'2026-05-06', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'40수 혼방', size:'A4', qty:'250m', outlet:'바오창고', memo:'출력 완료 및 출고 처리 완료.'},
  {code:'ID아이디어0312-TEST', staff:'오회진', client:'아이디어', type:'TEST', date:'2026-05-06', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'테스트원단', size:'A4', qty:'30m', outlet:'아이디어스튜디오', memo:'테스트 출력 완료.'},

  /* 신호준 담당 */
  {code:'NM네모1185-TEST',     staff:'신호준', client:'네모',     type:'TEST', date:'2026-05-07', status:'진행중', badge:'', bc:'',
   fabric:'지성80수9088', size:'A4', qty:'50m', outlet:'네모물류센터', memo:'색보정 작업 중. 지성80수9088 원단 색상 프로파일 보정.'},
  {code:'SO세연0504-TEST',     staff:'신호준', client:'세연',     type:'TEST', date:'2026-05-07', status:'진행중', badge:'', bc:'',
   fabric:'혼방 원단', size:'A3', qty:'100m', outlet:'세연쇼룸', memo:'대기에서 진행중으로 전환. 원단 입고 확인 후 출력 예정.'},
  {code:'SM슈퍼마켓0916-TEST', staff:'신호준', client:'슈퍼마켓', type:'TEST', date:'2026-05-06', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'테스트원단', size:'A4', qty:'50m', outlet:'슈퍼마켓DC', memo:'테스트 출력 완료.'},

  /* 이동연 담당 */
  {code:'TI타임0320-CW',     staff:'이동연', client:'타임',  type:'CW',     date:'2026-05-07', status:'진행중', badge:'', bc:'',
   fabric:'아람60수110', size:'A4', qty:'300m', outlet:'타임본사', memo:'아람60수110 작업 진행 중. 색상 확인 완료.'},
  {code:'SY세영0204-OPTION', staff:'이동연', client:'세영',  type:'OPTION', date:'2026-05-07', status:'검토중', badge:'', bc:'',
   fabric:'OPTION 원단', size:'A3', qty:'150m', outlet:'세영공장', memo:'OPTION 수정 반영 중. 거래처 요청 사항 검토.'},
  {code:'DR두레0103-CW',     staff:'이동연', client:'두레',  type:'CW',     date:'2026-05-05', status:'완료',  badge:'완료', bc:'#10b981',
   fabric:'40수 면', size:'A4', qty:'200m', outlet:'두레물류', memo:'출력 완료. 납품 확인.'},
];

/* ═══════════════════════════════════════════════════
   담당자별 업무 상세 모달
═══════════════════════════════════════════════════ */
window._openDtpWorkDetail = function(code) {
  var UI = window.ARAM_UI;
  var w  = (window._dtpWorkDB || []).find(function(x){ return x.name === code || x.code === code; });
  if (!w) { UI.Toast.error('업무 정보를 찾을 수 없습니다: ' + code); return; }

  /* 상태별 색상 */
  var scMap = { '완료':'#10b981', '진행중':'#4361ee', '검토중':'#f59e0b', '대기':'#9ca3af' };
  var statusColor = scMap[w.status] || '#9ca3af';

  /* 유형 뱃지 */
  var typeMap = { 'CW':'#4361ee', 'TEST':'#8b5cf6', 'OPTION':'#374151' };
  var typeColor = typeMap[w.type] || '#607d8b';

  function infoRow(label, val) {
    return '<div style="display:flex;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bdr)">'
      + '<span style="min-width:110px;font-size:12px;color:var(--muted);flex-shrink:0">' + label + '</span>'
      + '<span style="font-size:13px;font-weight:600;color:var(--txt);flex:1">' + (val || '—') + '</span>'
      + '</div>';
  }

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'

    /* 상단 코드 + 상태 */
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:18px">'
    +   '<div>'
    +     '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:5px">' + w.code + '</div>'
    +     '<div style="display:flex;align-items:center;gap:8px">'
    +       '<span style="font-size:11px;font-weight:700;color:#fff;background:' + typeColor + ';border-radius:4px;padding:2px 8px">' + w.type + '</span>'
    +       '<span style="font-size:12px;color:var(--muted)">담당: ' + w.staff + '</span>'
    +     '</div>'
    +   '</div>'
    +   '<span style="background:' + statusColor + ';color:#fff;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:700">' + w.status + '</span>'
    + '</div>'

    /* 기본 정보 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">업무 기본 정보</div>'
    + infoRow('업무 코드', w.code)
    + infoRow('거래처명', w.client)
    + infoRow('담당자', w.staff)
    + infoRow('작업 유형', w.type)
    + infoRow('작업 날짜', w.date)
    + infoRow('현재 상태', '<span style="color:' + statusColor + ';font-weight:700">' + w.status + '</span>')

    /* 작업 상세 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">작업 상세</div>'
    + infoRow('원단명', w.fabric)
    + infoRow('출력 크기', w.size)
    + infoRow('수량', w.qty)
    + infoRow('출고처', w.outlet)

    /* 업무 지시 / 메모 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">업무 내용 / 메모</div>'
    + '<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);line-height:1.75;min-height:56px">'
    + (w.memo || '<span style="color:var(--muted)">메모 없음</span>')
    + '</div>'

    + '</div>';

  UI.Modal.open({
    title: '업무 상세 — ' + w.code,
    body:  body,
    size:  'lg',
    footer: [
      { label: '닫기', type: 'secondary', onClick: function(close){ close(); } },
      { label: '수정 요청', type: 'primary', onClick: function(close){
          UI.Toast.info('수정 기능은 준비 중입니다.');
        }
      }
    ]
  });
};

/* ═══════════════════════════════════════════════════
   DTP 생산 데이터 — 생산 DB (작업번호 상세)
═══════════════════════════════════════════════════ */
window._dtpProdDB = [
  {no:'DTP-2026-0891', client:'지성',   item:'플라워 프린트', size:'A4',  qty:'500m',  start:'2026-05-15', end:'2026-05-17', status:'완료',  staff:'하에진', machine:'DTP-01', ink:'CMYK 4도', defect:0,   memo:'색상 4도 분리 완료. 납품 완료.'},
  {no:'DTP-2026-0887', client:'슈퍼맛', item:'체크패턴',      size:'A3',  qty:'300m',  start:'2026-05-14', end:'2026-05-18', status:'완료',  staff:'오회진', machine:'DTP-02', ink:'CMYK 4도', defect:0,   memo:'출력 완료. 품질 검수 통과.'},
  {no:'DTP-2026-0882', client:'예성',   item:'줄무늬',        size:'A4',  qty:'450m',  start:'2026-05-16', end:'-',          status:'진행중', staff:'하에진', machine:'DTP-01', ink:'CMYK 4도', defect:0,   memo:'출력 진행 중. 70% 완료.'},
  {no:'DTP-2026-0879', client:'엠제이', item:'아이코닉',      size:'특수', qty:'200m', start:'2026-05-17', end:'-',          status:'진행중', staff:'오회진', machine:'DTP-03', ink:'특수 잉크', defect:0,   memo:'특수 사이즈 출력 진행 중.'},
  {no:'DTP-2026-0876', client:'아이디어',item:'기하학',       size:'A4',  qty:'350m',  start:'2026-05-18', end:'-',          status:'대기',  staff:'신호준', machine:'-',      ink:'CMYK 4도', defect:0,   memo:'원단 입고 대기 중.'},
  /* 추가 완료 데이터 (필터 모달용) */
  {no:'DTP-2026-0870', client:'지성',   item:'스트라이프',    size:'A4',  qty:'600m',  start:'2026-05-10', end:'2026-05-12', status:'완료',  staff:'이동연', machine:'DTP-02', ink:'CMYK 4도', defect:2,   memo:'완료. 불량 2m 발생 — 색상 번짐.'},
  {no:'DTP-2026-0865', client:'네모',   item:'도트 패턴',     size:'A3',  qty:'400m',  start:'2026-05-09', end:'2026-05-11', status:'완료',  staff:'하에진', machine:'DTP-01', ink:'CMYK 4도', defect:5,   memo:'완료. 불량 5m — 잉크 농도 조절 필요.'},
  {no:'DTP-2026-0860', client:'케빈',   item:'추상 패턴',     size:'특수', qty:'150m', start:'2026-05-08', end:'2026-05-10', status:'완료',  staff:'오회진', machine:'DTP-03', ink:'특수 잉크', defect:0,   memo:'완료.'},
  {no:'DTP-2026-0855', client:'풍전',   item:'플로럴',        size:'A4',  qty:'500m',  start:'2026-05-07', end:'2026-05-09', status:'완료',  staff:'신호준', machine:'DTP-02', ink:'CMYK 4도', defect:1,   memo:'완료. 불량 1m.'},
  {no:'DTP-2026-0850', client:'바오',   item:'체크',          size:'A4',  qty:'300m',  start:'2026-05-06', end:'2026-05-08', status:'완료',  staff:'이동연', machine:'DTP-01', ink:'CMYK 4도', defect:0,   memo:'완료.'},
];

/* ═══════════════════════════════════════════════════
   KPI 카드 클릭 → 필터 목록 모달
═══════════════════════════════════════════════════ */
window._openDtpProdFilter = function(type) {
  var UI  = window.ARAM_UI;
  var all = window._dtpProdDB || [];

  var filtered, title, emptyMsg;
  if (type === 'all') {
    filtered = all;
    title    = '전체 생산지시 목록 (총 ' + all.length + '건)';
    emptyMsg = '생산지시 내역이 없습니다.';
  } else if (type === '완료') {
    filtered = all.filter(function(r){ return r.status === '완료'; });
    title    = '완료 목록 (' + filtered.length + '건)';
    emptyMsg = '완료된 작업이 없습니다.';
  } else if (type === '진행중') {
    filtered = all.filter(function(r){ return r.status === '진행중'; });
    title    = '진행중 목록 (' + filtered.length + '건)';
    emptyMsg = '진행중인 작업이 없습니다.';
  } else if (type === '불량') {
    filtered = all.filter(function(r){ return r.defect > 0; });
    title    = '불량 발생 목록 (' + filtered.length + '건)';
    emptyMsg = '불량 발생 내역이 없습니다.';
  } else {
    filtered = all;
    title    = '생산지시 목록';
    emptyMsg = '내역이 없습니다.';
  }

  var scMap = { '완료':'#10b981', '진행중':'#4361ee', '대기':'#9ca3af', '진행':'#4361ee' };

  var rows = filtered.length === 0
    ? '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted)">' + emptyMsg + '</td></tr>'
    : filtered.map(function(r) {
        var sc = scMap[r.status] || '#9ca3af';
        var defectCell = type === '불량'
          ? '<td style="color:#ef4444;font-weight:700;text-align:center">' + r.defect + 'm</td>'
          : '';
        return '<tr style="cursor:pointer" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'" onclick="_openDtpProdDetail(\'' + r.no + '\')">'
          + '<td><span style="color:#4361ee;font-weight:700;text-decoration:underline">' + r.no + '</span></td>'
          + '<td>' + r.client + '</td>'
          + '<td>' + r.item + '</td>'
          + '<td>' + r.qty + '</td>'
          + '<td>' + r.start + '</td>'
          + '<td>' + (r.end === '-' ? '<span style="color:var(--muted)">—</span>' : r.end) + '</td>'
          + (type === '불량' ? defectCell : '')
          + '<td style="text-align:center"><span style="background:' + sc + ';color:#fff;border-radius:4px;padding:2px 10px;font-size:12px;font-weight:700">' + r.status + '</span></td>'
          + '</tr>';
      }).join('');

  var thDefect = type === '불량' ? '<th style="text-align:center">불량</th>' : '';

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'
    + (type === '불량'
      ? '<div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:#dc2626">'
        + '⚠️ 불량 발생 내역입니다. 원인 분석 후 조치를 취해주세요.'
        + '</div>'
      : '')
    + '<div class="table-wrap" style="max-height:420px;overflow-y:auto">'
    + '<table><thead><tr><th>작업번호</th><th>거래처</th><th>품목</th><th>수량</th><th>시작일</th><th>완료일</th>'
    + thDefect
    + '<th style="text-align:center">상태</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '</div></div>';

  UI.Modal.open({
    title: '🖨️ ' + title,
    body:  body,
    size:  'lg',
    footer: [
      { label: '닫기', type: 'secondary', onClick: function(close){ close(); } }
    ]
  });
};

/* ═══════════════════════════════════════════════════
   작업번호 클릭 → 생산 상세 모달
═══════════════════════════════════════════════════ */
window._openDtpProdDetail = function(no) {
  var UI = window.ARAM_UI;
  var r  = (window._dtpProdDB || []).find(function(x){ return x.no === no; });
  if (!r) { UI.Toast.error('생산 정보를 찾을 수 없습니다: ' + no); return; }

  var scMap = { '완료':'#10b981', '진행중':'#4361ee', '대기':'#9ca3af' };
  var statusColor = scMap[r.status] || '#9ca3af';
  var progress = r.status === '완료' ? 100 : r.status === '진행중' ? 65 : 0;

  function row(label, val) {
    return '<div style="display:flex;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bdr)">'
      + '<span style="min-width:110px;font-size:12px;color:var(--muted);flex-shrink:0">' + label + '</span>'
      + '<span style="font-size:13px;font-weight:600;color:var(--txt);flex:1">' + (val || '—') + '</span>'
      + '</div>';
  }

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'

    /* 헤더 상태 배너 */
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:18px">'
    +   '<div>'
    +     '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:4px">' + r.no + '</div>'
    +     '<div style="font-size:12.5px;color:var(--muted)">' + r.client + ' &nbsp;·&nbsp; ' + r.item + '</div>'
    +   '</div>'
    +   '<span style="background:' + statusColor + ';color:#fff;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:700">' + r.status + '</span>'
    + '</div>'

    /* 진행률 바 */
    + '<div style="margin-bottom:18px">'
    +   '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px">'
    +     '<span>진행률</span><span style="font-weight:700;color:' + statusColor + '">' + progress + '%</span>'
    +   '</div>'
    +   '<div style="height:8px;background:var(--bdr);border-radius:4px;overflow:hidden">'
    +     '<div style="height:100%;width:' + progress + '%;background:' + statusColor + ';border-radius:4px;transition:width .6s"></div>'
    +   '</div>'
    + '</div>'

    /* 기본 정보 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">생산 기본 정보</div>'
    + row('작업번호', r.no)
    + row('거래처명', r.client)
    + row('품목명', r.item)
    + row('담당자', r.staff)
    + row('현재 상태', '<span style="color:' + statusColor + ';font-weight:700">' + r.status + '</span>')

    /* 작업 상세 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">작업 상세</div>'
    + row('출력 크기', r.size)
    + row('수량', r.qty)
    + row('사용 기계', r.machine)
    + row('잉크 종류', r.ink)
    + row('시작일', r.start)
    + row('완료일', r.end === '-' ? '<span style="color:var(--muted)">진행중</span>' : r.end)

    /* 불량 정보 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">품질 / 불량</div>'
    + (r.defect > 0
        ? '<div style="padding:10px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:8px;font-size:13px;color:#dc2626;font-weight:600">⚠️ 불량 발생: ' + r.defect + 'm</div>'
        : '<div style="padding:10px 14px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:8px;font-size:13px;color:#15803d;font-weight:600">✓ 불량 없음 — 정상</div>')

    /* 메모 */
    + '<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">작업 메모</div>'
    + '<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);line-height:1.75;min-height:50px">'
    + (r.memo || '<span style="color:var(--muted)">메모 없음</span>')
    + '</div>'

    + '</div>';

  UI.Modal.open({
    title: '생산 상세 — ' + r.no,
    body:  body,
    size:  'lg',
    footer: [
      { label: '닫기', type: 'secondary', onClick: function(close){ close(); } },
      { label: '생산지시 수정', type: 'primary', onClick: function(close){
          UI.Toast.info('수정 기능은 준비 중입니다.');
        }
      }
    ]
  });
};

/* ═══════════════════════════════════════════════════
   거래처관리 — 공통 DB (페이지 + 모달 공용)
═══════════════════════════════════════════════════ */
window._clientsDB = [
  {code:'JS001', name:'지성텍스(주)',      type:'내수', mgr:'하에진', rep:'김지성', tel:'031-xxx-1234', mobile:'',             email:'jisung@jisung.co.kr',   region:'경기', addr:'경기도 수원시 팔달구 인계동 100', bal:'12,400,000', joined:'2023-03-15', status:'활성', price:'기본단가', due:25, memo:'주력 DTP 거래처. 월 평균 발주 500m.'},
  {code:'SM001', name:'(주)슈퍼마켓텍스', type:'OEM',  mgr:'신호준', rep:'이슈퍼', tel:'031-852-5100', mobile:'',             email:'super@super.co.kr',     region:'경기', addr:'경기도 성남시 분당구 판교로 55', bal:'21,300,000', joined:'2022-06-15', status:'활성', price:'',         due:'', memo:'OEM 최대 거래처.'},
  {code:'YS001', name:'예성텍스(주)',      type:'내수', mgr:'오회진', rep:'박예성', tel:'',             mobile:'010-2345-6789',email:'yesung@yesung.co.kr',   region:'경기', addr:'경기도 평택시 진위면 200',      bal:'8,200,000',  joined:'2023-05-20', status:'활성', price:'',         due:'', memo:'줄무늬·체크 패턴 전문 거래처.'},
  {code:'MJ001', name:'엠제이패션(주)',    type:'내수', mgr:'오회진', rep:'최엠제이',tel:'',            mobile:'010-3456-7890',email:'mj@mj.co.kr',           region:'대구', addr:'대구시 중구 동성로 50',          bal:'3,800,000',  joined:'2024-01-20', status:'활성', price:'',         due:'', memo:''},
  {code:'ID001', name:'(주)아이디어섬유',  type:'수출', mgr:'하에진', rep:'정아이디',tel:'',            mobile:'010-4567-8901',email:'idea@idea.co.kr',        region:'서울', addr:'서울시 영등포구 여의도동 60',    bal:'6,700,000',  joined:'2023-09-05', status:'활성', price:'',         due:'', memo:'수출 전용.'},
  {code:'NM001', name:'네모텍스(주)',      type:'내수', mgr:'이동연', rep:'한네모', tel:'',             mobile:'',             email:'nemo@nemo.co.kr',        region:'부산', addr:'부산시 해운대구 우동 100',       bal:'9,100,000',  joined:'2022-11-01', status:'활성', price:'',         due:'', memo:''},
  {code:'TI001', name:'타임패브릭(주)',    type:'내수', mgr:'하에진', rep:'김타임', tel:'',             mobile:'010-5678-9012',email:'time@time.co.kr',        region:'경기', addr:'경기도 수원시 영통구 300',       bal:'7,500,000',  joined:'2023-12-01', status:'활성', price:'',         due:'', memo:''},
  {code:'BO001', name:'바오텍스(주)',      type:'수출', mgr:'신호준', rep:'이바오', tel:'',             mobile:'',             email:'bao@bao.co.kr',          region:'서울', addr:'서울시 송파구 잠실동 150',       bal:'0',          joined:'2022-04-01', status:'휴면', price:'',         due:'', memo:'거래 중단 상태. 재개 협의 중.'},
  {code:'PJ001', name:'풍전섬유(주)',      type:'내수', mgr:'이동연', rep:'박풍전', tel:'',             mobile:'010-6789-0123',email:'pj@pj.co.kr',            region:'광주', addr:'광주시 서구 치평동 80',          bal:'4,100,000',  joined:'2024-02-10', status:'활성', price:'',         due:'', memo:''},
  {code:'SO001', name:'세연패션(주)',      type:'OEM',  mgr:'오회진', rep:'최세연', tel:'',             mobile:'010-7890-1234',email:'seyeon@seyeon.co.kr',   region:'서울', addr:'서울시 강서구 마곡동 90',        bal:'13,200,000', joined:'2022-08-20', status:'활성', price:'',         due:'', memo:'OEM 거래처. 월 납품 2회.'},
  {code:'SY001', name:'세영텍스(주)',      type:'내수', mgr:'이동연', rep:'정세영', tel:'',             mobile:'',             email:'seyoung@seyoung.co.kr', region:'대전', addr:'대전시 유성구 죽동 25',          bal:'0',          joined:'2021-03-10', status:'휴면', price:'',         due:'', memo:'장기 휴면.'},
  {code:'DR001', name:'두레섬유(주)',      type:'내수', mgr:'이동연', rep:'한두레', tel:'041-234-5678', mobile:'010-8901-2345',email:'dure@dure.co.kr',        region:'충남', addr:'충청남도 아산시 탕정면 100',     bal:'5,600,000',  joined:'2023-07-10', status:'활성', price:'',         due:'', memo:''},
  {code:'JT001', name:'지텍스코리아(주)', type:'수출', mgr:'하에진', rep:'김지텍', tel:'',             mobile:'010-9012-3456',email:'jt@jt.co.kr',            region:'인천', addr:'인천시 연수구 송도동 200',       bal:'5,600,000',  joined:'2023-07-10', status:'활성', price:'',         due:'', memo:'수출 전용. USD 결제.'},
  {code:'KV001', name:'케빈패션(주)',      type:'수출', mgr:'하에진', rep:'이케빈', tel:'',             mobile:'010-0123-4567',email:'kevin@kevin.co.kr',      region:'인천', addr:'인천시 남동구 논현동 50',        bal:'5,600,000',  joined:'2023-07-10', status:'활성', price:'',         due:'', memo:''},
  {code:'HK001', name:'(주)한국염손',      type:'내수', mgr:'신호준', rep:'김지윤', tel:'',             mobile:'',             email:'hk@hk.co.kr',            region:'서울', addr:'서울시 강북구 미아동 300',       bal:'3,200,000',  joined:'2024-03-01', status:'활성', price:'',         due:'', memo:''},
  {code:'CW001', name:'청운섬유(주)',      type:'내수', mgr:'오회진', rep:'박청운', tel:'032-445-2200', mobile:'010-2345-6789',email:'cw@cw.co.kr',            region:'인천', addr:'인천시 계양구 효성동 150',       bal:'4,800,000',  joined:'2023-11-15', status:'활성', price:'기본단가', due:30, memo:''},
  {code:'HR001', name:'하람텍스(주)',      type:'내수', mgr:'이동연', rep:'최하람', tel:'',             mobile:'010-3456-7890',email:'hr@hr.co.kr',            region:'경북', addr:'경북 구미시 산동면 200',         bal:'2,900,000',  joined:'2024-01-10', status:'활성', price:'',         due:'', memo:''},
  {code:'SJ001', name:'성주패션(주)',      type:'내수', mgr:'신호준', rep:'정성주', tel:'051-234-5678', mobile:'',             email:'sj@sj.co.kr',            region:'부산', addr:'부산시 사상구 주례동 100',       bal:'3,600,000',  joined:'2023-08-20', status:'활성', price:'',         due:'', memo:''},
  {code:'DW001', name:'대우섬유(주)',      type:'내수', mgr:'오회진', rep:'김대우', tel:'',             mobile:'010-4567-8901',email:'dw@dw.co.kr',            region:'서울', addr:'서울시 도봉구 창동 80',          bal:'1,500,000',  joined:'2024-02-28', status:'활성', price:'',         due:'', memo:''},
  {code:'GS001', name:'글로벌스타일(주)', type:'수출', mgr:'하에진', rep:'이글로', tel:'02-3344-5566', mobile:'010-9876-5432',email:'gs@gs.co.kr',            region:'서울', addr:'서울시 중구 을지로 200',         bal:'9,800,000',  joined:'2022-12-01', status:'활성', price:'기본단가', due:20, memo:'수출 전용. EUR 결제.'},
  {code:'NW001', name:'뉴웨이브텍스(주)', type:'OEM',  mgr:'신호준', rep:'박뉴웨', tel:'',             mobile:'',             email:'nw@nw.co.kr',            region:'경기', addr:'경기도 화성시 봉담읍 300',       bal:'7,200,000',  joined:'2023-04-15', status:'활성', price:'',         due:'', memo:'OEM 신규.'},
  {code:'AR001', name:'아라미패션(주)',    type:'내수', mgr:'하에진', rep:'최아라', tel:'031-777-8899', mobile:'010-1111-2222',email:'ar@ar.co.kr',            region:'경기', addr:'경기도 이천시 부발읍 100',       bal:'6,400,000',  joined:'2023-06-01', status:'활성', price:'기본단가', due:25, memo:''},
];

/* ───────────── 거래처 검색 필터 ───────────── */
window._filterClients = function(q) {
  var tbody  = document.getElementById('client-tbody');
  if (!tbody) return;
  var typeF   = (document.getElementById('client-type-filter')   || {}).value || '';
  var statusF = (document.getElementById('client-status-filter') || {}).value || '';
  var kw      = (q || '').trim().toLowerCase();
  var rows    = tbody.querySelectorAll('tr');
  var visible = 0;
  rows.forEach(function(tr) {
    var cells = tr.querySelectorAll('td');
    if (!cells.length) return;
    var name   = (cells[1] ? cells[1].textContent : '').toLowerCase();
    var code   = (cells[0] ? cells[0].textContent : '').toLowerCase();
    var type   = (cells[2] ? cells[2].textContent : '').trim();
    var status = (cells[7] ? cells[7].textContent : '').trim();
    var matchKw     = !kw     || name.includes(kw) || code.includes(kw);
    var matchType   = !typeF   || type.includes(typeF);
    var matchStatus = !statusF || status.includes(statusF);
    var show = matchKw && matchType && matchStatus;
    tr.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  var badge = document.getElementById('client-count-badge');
  if (badge) badge.textContent = visible + '건';
};

/* ───────────── 거래처 상세 모달 ───────────── */
window._openClientDetail = function(code) {
  var UI = window.ARAM_UI;
  var c  = (window._clientsDB || []).find(function(x){ return x.code === code; });
  if (!c) { UI.Toast.error('거래처 정보를 찾을 수 없습니다.'); return; }
  var typeColor = {내수:'#4361ee', 수출:'#10b981', OEM:'#f59e0b'}[c.type] || '#607d8b';
  var sc        = c.status === '활성' ? '#10b981' : '#9ca3af';

  function row(l, v) {
    return '<div style="display:flex;padding:9px 0;border-bottom:1px solid var(--bdr)">'
      +'<span style="min-width:100px;font-size:12px;color:var(--muted);flex-shrink:0">'+l+'</span>'
      +'<span style="font-size:13px;font-weight:600;color:var(--txt)">'+v+'</span></div>';
  }

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'
    /* 헤더 */
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:18px">'
    +  '<div><div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:4px">'+c.name+'</div>'
    +  '<div style="display:flex;gap:8px;align-items:center">'
    +    '<span style="font-size:11px;font-weight:700;color:#fff;background:'+typeColor+';border-radius:4px;padding:2px 8px">'+c.type+'</span>'
    +    '<span style="font-size:12px;color:var(--muted)">'+c.code+'</span></div></div>'
    +  '<span style="background:'+sc+';color:#fff;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:700">'+c.status+'</span>'
    +'</div>'
    /* 기본정보 */
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">기본 정보</div>'
    +row('거래처코드', c.code)
    +row('거래처명', c.name)
    +row('거래 유형', '<span style="color:'+typeColor+';font-weight:700">'+c.type+'</span>')
    +row('대표자명', c.rep || '—')
    +row('담당자(영업)', c.mgr || '—')
    +row('전화', c.tel || '—')
    +row('모바일', c.mobile || '—')
    +row('이메일', c.email || '—')
    +row('지역', c.region || '—')
    +row('주소', c.addr || '—')
    +row('거래 시작일', c.joined || '—')
    /* 거래 조건 */
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">거래 조건</div>'
    +row('단가 적용', c.price || '—')
    +row('청구마감일자', c.due ? c.due + '일' : '—')
    +row('사용구분', '<span style="color:#10b981;font-weight:700">YES</span>')
    /* 재무정보 */
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">재무 정보</div>'
    +row('수주 잔액', c.bal ? '₩'+c.bal : '—')
    /* 메모 */
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">메모</div>'
    +'<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);line-height:1.75;min-height:44px">'
    +(c.memo || '<span style="color:var(--muted)">메모 없음</span>')+'</div>'
    +'</div>';

  UI.Modal.open({
    title: '거래처 상세 — ' + c.name,
    body: body, size: 'lg',
    footer: [
      { label: '닫기',    type: 'secondary', onClick: function(close){ close(); } },
      { label: '수주 내역 보기', type: 'primary', onClick: function(close){ close(); if(window.goPage) goPage('sales-orders'); } }
    ]
  });
};

/* ───────────── 거래처 등록 모달 ───────────── */
/* ── 공통 인풋 헬퍼 ── */
window._clientField = function(label, type, id, ph, required) {
  var star = required ? ' <span style="color:#ef4444">★</span>' : '';
  return '<div><label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">'+label+star+'</label>'
    +'<input id="'+id+'" type="'+type+'" placeholder="'+ph+'" style="width:100%;padding:8px 11px;border:1.5px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);font-size:13px;box-sizing:border-box"></div>';
};

/* ── 사업자번호 자동 하이픈 ── */
window._fmtBizNo = function(el) {
  var v = el.value.replace(/\D/g,'').slice(0,10);
  if (v.length > 5) v = v.slice(0,3)+'-'+v.slice(3,5)+'-'+v.slice(5);
  else if (v.length > 3) v = v.slice(0,3)+'-'+v.slice(3);
  el.value = v;
  /* 중복 체크 */
  var badge = document.getElementById('biz-dup-badge');
  if (!badge) return;
  var raw = v.replace(/-/g,'');
  if (raw.length < 10) { badge.textContent=''; return; }
  var dup = (window._clientsDB||[]).some(function(c){ return (c.bizNo||'').replace(/-/g,'')=== raw; });
  if (dup) {
    badge.textContent = '⚠ 이미 등록된 사업자번호입니다';
    badge.style.color = '#ef4444';
  } else {
    badge.textContent = '✓ 사용 가능';
    badge.style.color = '#10b981';
  }
};

/* ── 주소 검색 팝업 (독립 오버레이 — 등록모달 파괴 방지) ── */
window._ADDR_DB = [
  /* ── 서울 ── */
  {zip:'06292',addr:'서울특별시 강남구 테헤란로 123',dong:'역삼동'},
  {zip:'06141',addr:'서울특별시 강남구 역삼로 180',dong:'역삼동'},
  {zip:'06524',addr:'서울특별시 강남구 선릉로 428',dong:'삼성동'},
  {zip:'06035',addr:'서울특별시 강남구 압구정로 201',dong:'압구정동'},
  {zip:'06181',addr:'서울특별시 강남구 봉은사로 524',dong:'삼성동'},
  {zip:'08510',addr:'서울특별시 금천구 가산디지털1로 168',dong:'가산동'},
  {zip:'08390',addr:'서울특별시 금천구 디지털로 300',dong:'가산동'},
  {zip:'07071',addr:'서울특별시 동작구 노량진로 54',dong:'노량진동'},
  {zip:'03922',addr:'서울특별시 마포구 양화로 45',dong:'서교동'},
  {zip:'04068',addr:'서울특별시 마포구 월드컵북로 396',dong:'상암동'},
  {zip:'04799',addr:'서울특별시 성동구 왕십리로 410',dong:'성수동'},
  {zip:'04785',addr:'서울특별시 성동구 뚝섬로 377',dong:'성수동'},
  {zip:'01010',addr:'서울특별시 도봉구 도봉로 162',dong:'도봉동'},
  {zip:'07290',addr:'서울특별시 영등포구 여의대방로 65',dong:'여의도동'},
  {zip:'07325',addr:'서울특별시 영등포구 국제금융로 10',dong:'여의도동'},
  {zip:'05856',addr:'서울특별시 송파구 올림픽로 300',dong:'방이동'},
  {zip:'05551',addr:'서울특별시 송파구 잠실로 148',dong:'잠실동'},
  {zip:'04551',addr:'서울특별시 중구 을지로 30',dong:'을지로3가'},
  {zip:'04519',addr:'서울특별시 중구 세종대로 110',dong:'태평로1가'},
  {zip:'03150',addr:'서울특별시 종로구 세종대로 175',dong:'세종로'},
  /* ── 경기 ── */
  {zip:'13529',addr:'경기도 성남시 분당구 판교로 255',dong:'삼평동'},
  {zip:'13487',addr:'경기도 성남시 분당구 대왕판교로 660',dong:'삼평동'},
  {zip:'14059',addr:'경기도 안양시 동안구 평촌대로 195',dong:'평촌동'},
  {zip:'16229',addr:'경기도 수원시 영통구 광교로 107',dong:'이의동'},
  {zip:'16499',addr:'경기도 수원시 팔달구 효원로 1',dong:'인계동'},
  {zip:'14544',addr:'경기도 부천시 길주로 1',dong:'중동'},
  {zip:'14566',addr:'경기도 부천시 원미구 조마루로 385',dong:'중동'},
  {zip:'10380',addr:'경기도 고양시 일산동구 중앙로 1275',dong:'장항동'},
  {zip:'10223',addr:'경기도 고양시 덕양구 화정로 86',dong:'화정동'},
  {zip:'17068',addr:'경기도 용인시 기흥구 구성로 217',dong:'보정동'},
  {zip:'16942',addr:'경기도 용인시 수지구 신수로 767',dong:'죽전동'},
  {zip:'11780',addr:'경기도 의정부시 시민로 1',dong:'의정부동'},
  {zip:'15872',addr:'경기도 군포시 군포로 591',dong:'당동'},
  {zip:'18430',addr:'경기도 화성시 동탄대로 537',dong:'반송동'},
  {zip:'12243',addr:'경기도 남양주시 다산중앙로 82',dong:'다산동'},
  {zip:'10592',addr:'경기도 파주시 회동길 37',dong:'문발동'},
  {zip:'13590',addr:'경기도 성남시 중원구 둔촌대로 388',dong:'상대원동'},
  /* ── 인천 ── */
  {zip:'21999',addr:'인천광역시 연수구 송도과학로 32',dong:'송도동'},
  {zip:'22330',addr:'인천광역시 남동구 인주대로 598',dong:'구월동'},
  {zip:'21563',addr:'인천광역시 계양구 계산로 36',dong:'계산동'},
  {zip:'22101',addr:'인천광역시 미추홀구 소성로 163',dong:'용현동'},
  /* ── 부산 ── */
  {zip:'46742',addr:'부산광역시 강서구 낙동북로 477',dong:'대저1동'},
  {zip:'48058',addr:'부산광역시 해운대구 센텀동로 30',dong:'우동'},
  {zip:'48940',addr:'부산광역시 해운대구 해운대해변로 264',dong:'우동'},
  {zip:'49243',addr:'부산광역시 사상구 학감대로 46',dong:'학장동'},
  {zip:'47011',addr:'부산광역시 부산진구 중앙대로 672',dong:'부전동'},
  {zip:'48549',addr:'부산광역시 남구 수영로 309',dong:'대연동'},
  /* ── 대구 ── */
  {zip:'41934',addr:'대구광역시 중구 동성로 2가 50',dong:'동성로'},
  {zip:'42013',addr:'대구광역시 수성구 동대구로 364',dong:'범어동'},
  {zip:'42601',addr:'대구광역시 달서구 달구벌대로 1095',dong:'장기동'},
  {zip:'41217',addr:'대구광역시 북구 연암로 40',dong:'산격동'},
  /* ── 광주 ── */
  {zip:'61951',addr:'광주광역시 서구 치평동 1200',dong:'치평동'},
  {zip:'61012',addr:'광주광역시 북구 무등로 339',dong:'용봉동'},
  {zip:'62199',addr:'광주광역시 광산구 장신로 155',dong:'장덕동'},
  /* ── 대전 ── */
  {zip:'35220',addr:'대전광역시 서구 둔산대로 100',dong:'둔산동'},
  {zip:'34135',addr:'대전광역시 유성구 대덕대로 512',dong:'구성동'},
  {zip:'35208',addr:'대전광역시 서구 갈마중로 10',dong:'갈마동'},
  /* ── 울산 ── */
  {zip:'44538',addr:'울산광역시 중구 번영로 45',dong:'학성동'},
  {zip:'44010',addr:'울산광역시 남구 삼산중로 6',dong:'삼산동'},
  /* ── 충청 ── */
  {zip:'31060',addr:'충청남도 천안시 서북구 성환읍 성환로 100',dong:''},
  {zip:'31177',addr:'충청남도 천안시 동남구 신부동로 58',dong:'신부동'},
  {zip:'28547',addr:'충청북도 청주시 상당구 상당로 155',dong:'북문로1가'},
  {zip:'28644',addr:'충청북도 청주시 흥덕구 직지대로 713',dong:'복대동'},
  {zip:'32247',addr:'충청남도 홍성군 홍북읍 충남대로 21',dong:''},
  /* ── 전라 ── */
  {zip:'54853',addr:'전라북도 전주시 완산구 효자로 225',dong:'효자동'},
  {zip:'54907',addr:'전라북도 전주시 덕진구 백제대로 567',dong:'인후동'},
  {zip:'61921',addr:'전라남도 목포시 영산로 483',dong:'용당동'},
  {zip:'57972',addr:'전라남도 순천시 순천만길 513',dong:'오천동'},
  /* ── 경상 ── */
  {zip:'51392',addr:'경상남도 창원시 성산구 창이대로 532',dong:'사파동'},
  {zip:'51327',addr:'경상남도 창원시 의창구 중앙대로 151',dong:'용호동'},
  {zip:'36614',addr:'경상북도 안동시 풍천면 도청대로 455',dong:''},
  {zip:'38542',addr:'경상북도 포항시 남구 포스코대로 300',dong:'효자동'},
  /* ── 강원·제주 ── */
  {zip:'24239',addr:'강원도 춘천시 중앙로 1',dong:'조양동'},
  {zip:'25514',addr:'강원도 강릉시 강릉대로 33',dong:'홍제동'},
  {zip:'63148',addr:'제주특별자치도 제주시 문연로 6',dong:'이도2동'},
  {zip:'63243',addr:'제주특별자치도 제주시 노연로 80',dong:'노형동'},
];

/* ── 카카오 우편번호 API embed 방식 주소 검색 ── */
window._openAddrSearch = function(target) {
  /* 기존 오버레이 제거 */
  var old = document.getElementById('addr-search-overlay');
  if (old) old.remove();

  window._addrSearchTarget = target;

  /* 오버레이 + 컨테이너 생성 */
  var overlay = document.createElement('div');
  overlay.id = 'addr-search-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:14px;box-shadow:0 24px 72px rgba(0,0,0,.3);'
    +'width:600px;max-width:95vw;display:flex;flex-direction:column;overflow:hidden">'
    /* 헤더 */
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#1e2b4a">'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:15px;font-weight:800;color:#fff">🔍 도로명 주소 검색</span>'
    +'<span style="background:rgba(255,255,255,.2);color:#fff;border-radius:5px;padding:2px 8px;font-size:11px">카카오 주소 API</span>'
    +'</div>'
    +'<button id="addr-close-btn" '
    +'style="background:rgba(255,255,255,.15);border:none;color:#fff;font-size:18px;cursor:pointer;'
    +'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center">✕</button>'
    +'</div>'
    /* 로딩 표시 */
    +'<div id="addr-loading" style="padding:60px;text-align:center;color:#64748b;font-size:13px">'
    +'<div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#4361ee;border-radius:50%;'
    +'animation:spin .8s linear infinite;margin:0 auto 12px"></div>'
    +'카카오 주소 검색을 불러오는 중...'
    +'</div>'
    /* 카카오 embed 컨테이너 */
    +'<div id="kakao-addr-wrap" style="width:100%;height:480px;display:none"></div>'
    /* 안내 */
    +'<div style="padding:10px 20px;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;background:#f8fafc">'
    +'※ 주소 선택 시 우편번호·도로명 주소가 자동 입력되고, 상세주소 입력창으로 이동합니다.'
    +'</div>'
    +'</div>';

  /* 닫기 이벤트 */
  overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  document.getElementById('addr-close-btn').addEventListener('click', function(){ overlay.remove(); });

  /* spin 애니메이션 (없으면 추가) */
  if (!document.getElementById('addr-spin-style')) {
    var st = document.createElement('style');
    st.id = 'addr-spin-style';
    st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }

  /* 카카오 Postcode 스크립트 로드 후 embed */
  function embedKakao() {
    var wrap = document.getElementById('kakao-addr-wrap');
    var loading = document.getElementById('addr-loading');
    if (!wrap) return;
    try {
      new daum.Postcode({
        embed: true,
        autoClose: false,
        oncomplete: function(data) {
          /* 도로명 주소 우선, 없으면 지번 주소 */
          var addr  = data.roadAddress || data.jibunAddress || data.address || '';
          var zip   = data.zonecode || '';
          var bname = data.bname   || data.bname1 || '';
          /* 건물명이 있으면 주소에 포함 */
          if (data.buildingName && data.apartment === 'Y') addr += ' ' + data.buildingName;
          /* 선택 처리 */
          _selectAddr(window._addrSearchTarget || '1', zip, addr, bname);
          /* 오버레이 닫기 */
          var ov = document.getElementById('addr-search-overlay');
          if (ov) ov.remove();
        },
        onclose: function() {
          var ov = document.getElementById('addr-search-overlay');
          if (ov) ov.remove();
        }
      }).embed(wrap, { autoClose: false });

      if (loading) loading.style.display = 'none';
      wrap.style.display = 'block';
    } catch(err) {
      /* 카카오 로드 실패 시 샘플 DB 폴백 */
      if (loading) loading.innerHTML = '<div style="color:#ef4444;font-size:13px">⚠ 주소 API 로드 실패<br><span style="font-size:12px;color:#94a3b8">인터넷 연결 확인 후 다시 시도하세요</span><br><br>'
        +'<button onclick="_openAddrSearchFallback(\''+target+'\')" '
        +'style="padding:8px 18px;background:#4361ee;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;margin-top:4px">샘플 주소로 검색</button></div>';
    }
  }

  if (window.daum && window.daum.Postcode) {
    /* 이미 로드됨 */
    setTimeout(embedKakao, 50);
  } else {
    /* 동적 로드 */
    var script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload  = function(){ setTimeout(embedKakao, 100); };
    script.onerror = function(){
      var loading = document.getElementById('addr-loading');
      if (loading) loading.innerHTML = '<div style="color:#ef4444;font-size:13px">⚠ 주소 API 로드 실패 (네트워크 오류)<br><br>'
        +'<button onclick="_openAddrSearchFallback(\''+target+'\')" '
        +'style="padding:8px 18px;background:#4361ee;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer">샘플 주소로 검색</button></div>';
    };
    document.head.appendChild(script);
  }
};

/* 폴백 — 샘플 DB 검색 (오프라인 환경용) */
window._openAddrSearchFallback = function(target) {
  var ov = document.getElementById('addr-search-overlay');
  if (ov) ov.remove();

  window._addrSearchTarget = target;
  window._addrSearchData   = window._ADDR_DB;

  function makeRows(list) {
    if (!list || !list.length) return '<tr><td colspan="2" style="padding:28px;text-align:center;color:#94a3b8;font-size:13px">검색 결과가 없습니다.</td></tr>';
    return list.map(function(a){
      return '<tr style="cursor:pointer;border-bottom:1px solid #f1f5f9" '
        +'onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'#fff\'" '
        +'onclick="_selectAddr(\''+target+'\',\''+a.zip+'\',\''+a.addr.replace(/'/g,"\\'")+'\',\''+(a.dong||'').replace(/'/g,"\\'")+'\''+')">'
        +'<td style="padding:10px 12px;font-size:12px;color:#4361ee;white-space:nowrap;width:80px;font-weight:600">['+a.zip+']</td>'
        +'<td style="padding:10px 8px;font-size:13px;color:#1e293b">'+a.addr+(a.dong?' <span style="color:#94a3b8;font-size:12px">('+a.dong+')</span>':'')+'</td>'
        +'</tr>';
    }).join('');
  }

  var overlay = document.createElement('div');
  overlay.id = 'addr-search-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:14px;box-shadow:0 24px 72px rgba(0,0,0,.28);width:600px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#1e2b4a;border-radius:14px 14px 0 0">'
    +'<span style="font-size:14px;font-weight:800;color:#fff">🔍 주소 검색 (샘플 데이터)</span>'
    +'<button onclick="var o=document.getElementById(\'addr-search-overlay\');if(o)o.remove();" '
    +'style="background:rgba(255,255,255,.15);border:none;color:#fff;font-size:18px;cursor:pointer;width:32px;height:32px;border-radius:50%">✕</button>'
    +'</div>'
    +'<div style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;gap:8px">'
    +'<input id="addr-srch-input" type="text" placeholder="도로명, 동, 우편번호 검색..." '
    +'style="flex:1;padding:9px 12px;border:2px solid #4361ee;border-radius:8px;font-size:13px;outline:none" '
    +'oninput="_liveAddrFilter()" onkeydown="if(event.key===\'Enter\')_liveAddrFilter()">'
    +'<button onclick="_liveAddrFilter()" style="padding:9px 18px;background:#1e2b4a;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">검색</button>'
    +'</div>'
    +'<div id="addr-count-label" style="padding:6px 16px;font-size:11.5px;color:#64748b;background:#f8fafc;border-bottom:1px solid #f1f5f9">전체 '+window._ADDR_DB.length+'개</div>'
    +'<div style="overflow-y:auto;flex:1"><table id="addr-result-table" style="width:100%;border-collapse:collapse"><tbody id="addr-result-tbody">'+makeRows(window._ADDR_DB)+'</tbody></table></div>'
    +'<div style="padding:10px 16px;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;background:#f8fafc;border-radius:0 0 14px 14px">※ 주소를 클릭하면 자동으로 입력됩니다.</div>'
    +'</div>';
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  setTimeout(function(){ var el=document.getElementById('addr-srch-input'); if(el) el.focus(); },60);
};

/* 실시간 필터 (폴백 모드용) */
window._liveAddrFilter = function() {
  var kw    = ((document.getElementById('addr-srch-input')||{}).value||'').trim();
  var tbody = document.getElementById('addr-result-tbody');
  var label = document.getElementById('addr-count-label');
  if (!tbody) return;
  var data  = window._addrSearchData || window._ADDR_DB || [];
  var tgt   = window._addrSearchTarget || '1';
  var kwL   = kw.toLowerCase();
  var list  = kw ? data.filter(function(a){
    return a.addr.toLowerCase().includes(kwL) || a.zip.includes(kw) || (a.dong||'').toLowerCase().includes(kwL);
  }) : data;
  if (label) label.textContent = list.length+'개 결과'+(kw?' (검색어: "'+kw+'")'  : '');
  if (!list.length) { tbody.innerHTML='<tr><td colspan="2" style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">검색 결과가 없습니다.</td></tr>'; return; }
  var re = kw ? new RegExp('('+kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi') : null;
  tbody.innerHTML = list.map(function(a){
    var d = re ? a.addr.replace(re,'<mark style="background:#fef08a;border-radius:2px;padding:0 1px">$1</mark>') : a.addr;
    return '<tr style="cursor:pointer;border-bottom:1px solid #f1f5f9" '
      +'onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'#fff\'" '
      +'onclick="_selectAddr(\''+tgt+'\',\''+a.zip+'\',\''+a.addr.replace(/'/g,"\\'")+'\',\''+(a.dong||'').replace(/'/g,"\\'")+'\''+')">'
      +'<td style="padding:10px 12px;font-size:12px;color:#4361ee;white-space:nowrap;width:80px;font-weight:600">['+a.zip+']</td>'
      +'<td style="padding:10px 8px;font-size:13px;color:#1e293b">'+d+(a.dong?' <span style="color:#94a3b8;font-size:12px">('+a.dong+')</span>':'')+'</td>'
      +'</tr>';
  }).join('');
};

window._filterAddrList = function() { _liveAddrFilter(); };

window._selectAddr = function(target, zip, addr, dong) {
  /* 우편번호 입력 (readonly) */
  var zipEl  = document.getElementById('reg-cli-zip'+target);
  if (zipEl) zipEl.value = zip;

  /* 도로명 주소 입력 (textarea — readonly 해제 상태, 편집 가능) */
  var addrEl = document.getElementById('reg-cli-addr'+target);
  if (addrEl) {
    addrEl.value = addr + (dong ? ' ('+dong+')' : '');
    /* 주소는 선택 후 수정 가능하도록 배경색만 변경해 선택됐음을 표시 */
    addrEl.style.borderColor = '#10b981';
    addrEl.style.background  = '#f0fdf4';
    setTimeout(function(){ addrEl.style.borderColor = ''; addrEl.style.background = ''; }, 2000);
  }

  /* 주소검색 오버레이 닫기 */
  var overlay = document.getElementById('addr-search-overlay');
  if (overlay) overlay.remove();

  /* 상세주소 입력 필드로 포커스 이동 */
  setTimeout(function(){
    var detailEl = document.getElementById('reg-cli-addrdetail'+target);
    if (detailEl) {
      detailEl.focus();
      detailEl.placeholder = '동/호수 등 상세주소를 입력하세요';
      detailEl.style.borderColor = '#4361ee';
      detailEl.style.boxShadow   = '0 0 0 3px rgba(67,97,238,.15)';
      setTimeout(function(){ detailEl.style.borderColor=''; detailEl.style.boxShadow=''; }, 2500);
    }
  }, 80);

  if (window.ARAM_UI) ARAM_UI.Toast.success('['+zip+'] '+addr+' 입력 완료 — 상세주소를 입력하세요.');
};

/* ── 공정단가 행 추가/삭제 ── */
window._addGongjeongRow = function() {
  var tbody = document.getElementById('gongjeong-tbody');
  if (!tbody) return;
  var idx = tbody.querySelectorAll('tr').length + 1;
  var tr = document.createElement('tr');
  tr.style.borderBottom = '1px solid var(--bdr)';
  tr.innerHTML = '<td style="padding:5px 6px"><input type="text" placeholder="공정명" style="width:100%;padding:5px 8px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px"></td>'
    +'<td style="padding:5px 6px"><input type="number" placeholder="단가" style="width:100%;padding:5px 8px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px;text-align:right"></td>'
    +'<td style="padding:5px 6px">'
    +'<select style="width:100%;padding:5px 6px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px">'
    +'<option>1YD</option><option>1M</option><option>1EA</option><option>1KG</option><option>1SET</option>'
    +'</select></td>'
    +'<td style="padding:5px 6px;text-align:center"><button onclick="this.closest(\'tr\').remove()" style="background:#ef4444;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">×</button></td>';
  tbody.appendChild(tr);
};

window._toggleGongjeongSection = function(val) {
  var sec = document.getElementById('gongjeong-section');
  if (!sec) return;
  sec.style.display = (val === '공정단가') ? '' : 'none';
};

/* ══════════════════════════════════════════════════
   거래처 파일관리 — 독립 오버레이 (등록모달 파괴 방지)
══════════════════════════════════════════════════ */
window._regFileStore = { biz:[], bank:[], etc:[] };

/* 파일 섹션 HTML 렌더 */
window._renderRegFileSec = function(key) {
  var files = (window._regFileStore || {})[key] || [];
  if (!files.length) {
    return '<div style="padding:14px 16px;text-align:center;color:#94a3b8;font-size:13px">첨부된 파일이 없습니다.</div>';
  }
  return files.map(function(f, i) {
    var ext = (f.name.split('.').pop()||'').toUpperCase();
    var extColor = {PDF:'#ef4444',JPG:'#f59e0b',JPEG:'#f59e0b',PNG:'#10b981',DOCX:'#2563eb',XLSX:'#1d6f42'}[ext] || '#64748b';
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #f1f5f9;background:#fff">'
      +'<div style="display:flex;align-items:center;gap:8px;min-width:0">'
      +'<span style="background:'+extColor+';color:#fff;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;flex-shrink:0">'+ext+'</span>'
      +'<span style="font-size:12.5px;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+f.name+'</span>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      +'<span style="font-size:11px;color:#94a3b8">'+f.size+'</span>'
      +'<button onclick="_removeRegFile(\''+key+'\','+i+')" style="background:#fee2e2;color:#ef4444;border:none;border-radius:4px;padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer">삭제</button>'
      +'</div></div>';
  }).join('');
};

/* 특정 섹션 새로고침 */
window._refreshFileSection = function(key) {
  var sec = document.getElementById('file-section-'+key);
  if (sec) sec.innerHTML = window._renderRegFileSec(key);
};

/* 배지 숫자 업데이트 */
window._updateFileBadge = function() {
  var badge = document.getElementById('reg-file-badge');
  if (!badge) return;
  var store = window._regFileStore || {};
  var total = ((store.biz||[]).length + (store.bank||[]).length + (store.etc||[]).length);
  badge.textContent = total;
};

/* 파일 삭제 */
window._removeRegFile = function(key, idx) {
  if (window._regFileStore && window._regFileStore[key]) {
    window._regFileStore[key].splice(idx, 1);
    _refreshFileSection(key);
    _updateFileBadge();
  }
};

/* 숨겨진 file input 트리거 */
window._triggerRegFileInput = function(key) {
  var el = document.getElementById('reg-file-input-'+key);
  if (el) el.click();
};

/* file input change 핸들러 */
window._onRegFileChange = function(key, input) {
  if (!window._regFileStore) window._regFileStore = {biz:[],bank:[],etc:[]};
  Array.from(input.files || []).forEach(function(f){
    window._regFileStore[key].push({
      name: f.name,
      size: f.size >= 1048576 ? (f.size/1048576).toFixed(1)+'MB' : Math.ceil(f.size/1024)+'KB'
    });
  });
  input.value = ''; /* 같은 파일 재선택 허용 */
  _refreshFileSection(key);
  _updateFileBadge();
  if (window.ARAM_UI) ARAM_UI.Toast.success('파일이 첨부되었습니다.');
};

/* 파일관리 독립 오버레이 */
window._openFileManageModal = function() {
  /* 기존 파일관리 오버레이 제거 */
  var old = document.getElementById('file-manage-overlay');
  if (old) old.remove();

  if (!window._regFileStore) window._regFileStore = {biz:[],bank:[],etc:[]};

  var configs = [
    {key:'biz',  label:'사업자등록증',    bg:'#1e2b4a', icon:'📄'},
    {key:'bank', label:'거래처 통장 사본', bg:'#059669', icon:'🏦'},
    {key:'etc',  label:'기타 서류',        bg:'#7c3aed', icon:'📁'},
  ];

  /* 각 섹션 HTML */
  var sectionsHtml = configs.map(function(cfg) {
    return '<div style="border:1.5px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px">'
      +'<div style="background:'+cfg.bg+';padding:10px 16px;display:flex;align-items:center;justify-content:space-between">'
      +'<span style="font-size:13px;font-weight:700;color:#fff">'+cfg.icon+' '+cfg.label+'</span>'
      +'<button onclick="_triggerRegFileInput(\''+cfg.key+'\')" '
      +'style="padding:5px 14px;background:#fff;color:'+cfg.bg+';border:none;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer">+ 첨부</button>'
      +'</div>'
      +'<div id="file-section-'+cfg.key+'" style="background:#f8fafc;min-height:52px">'
      +window._renderRegFileSec(cfg.key)
      +'</div>'
      +'</div>';
  }).join('');

  /* 숨겨진 file 인풋들 */
  var inputsHtml = configs.map(function(cfg){
    return '<input type="file" id="reg-file-input-'+cfg.key+'" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" '
      +'style="display:none" onchange="_onRegFileChange(\''+cfg.key+'\',this)">';
  }).join('');

  var overlay = document.createElement('div');
  overlay.id = 'file-manage-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99998;display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:#f8fafc;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:520px;max-width:95vw;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">'
    /* 헤더 */
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#fff;border-bottom:1.5px solid #e5e7eb">'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">📂 파일관리</span>'
    +'<span style="background:#f1f4ff;color:#4361ee;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">TEMP</span>'
    +'</div>'
    +'<button onclick="var o=document.getElementById(\'file-manage-overlay\');if(o)o.remove();" '
    +'style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;line-height:1;padding:0">✕</button>'
    +'</div>'
    /* 본문 */
    +'<div style="padding:16px 18px;overflow-y:auto;flex:1">'
    +sectionsHtml
    +inputsHtml
    +'</div>'
    /* 푸터 */
    +'<div style="padding:12px 18px;background:#fff;border-top:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between">'
    +'<button onclick="var o=document.getElementById(\'file-manage-overlay\');if(o)o.remove();" '
    +'style="padding:8px 22px;background:#64748b;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer">닫기</button>'
    +'<span style="font-size:12px;color:#94a3b8">※ 파일은 현재 세션에 임시 저장됩니다</span>'
    +'</div>'
    +'</div>';

  /* 배경 클릭 시 닫기 */
  overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
};

/* ══ 거래처 등록 메인 모달 ══ */
window._openClientRegModal = function() {
  var UI = window.ARAM_UI;
  /* 파일 스토어 초기화 (모달 새로 열릴 때마다 리셋) */
  window._regFileStore = { biz:[], bank:[], etc:[] };

  function row(label, content, required) {
    var star = required ? ' <span style="color:#ef4444">★</span>' : '';
    return '<div style="display:grid;grid-template-columns:110px 1fr;align-items:start;gap:0;border-bottom:1px solid var(--bdr)">'
      +'<div style="padding:9px 10px;font-size:12.5px;color:var(--txt);background:var(--bg);font-weight:600;border-right:1px solid var(--bdr);min-height:38px;display:flex;align-items:center">'+label+star+'</div>'
      +'<div style="padding:6px 10px">'+content+'</div>'
      +'</div>';
  }
  function inp(id, ph, extra) {
    return '<input id="'+id+'" type="text" placeholder="'+ph+'" '+(extra||'')+' style="width:100%;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px;box-sizing:border-box">';
  }

  var body = '<div style="font-family:\'Pretendard\',sans-serif;border:1.5px solid var(--bdr);border-radius:8px;overflow:hidden;margin-bottom:4px">'

    /* 섹션 제목 */
    +'<div style="background:var(--bg);padding:8px 14px;font-size:12.5px;font-weight:700;color:#4361ee;border-bottom:2px solid var(--bdr)">거래처 정보</div>'

    /* 거래처코드 (자동생성 표시 + 사업자번호 입력) */
    +row('거래처코드',
      '<div style="display:flex;gap:8px;align-items:center">'
      +'<span style="font-size:12.5px;color:var(--muted);padding:6px 10px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:5px;flex-shrink:0">자동생성</span>'
      +'<div style="flex:1">'
      +'<input id="reg-biz-no" type="text" placeholder="사업자번호 000-00-00000" maxlength="12" '
      +'oninput="_fmtBizNo(this)" '
      +'style="width:100%;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px;box-sizing:border-box">'
      +'<span id="biz-dup-badge" style="font-size:11px;margin-top:2px;display:block"></span>'
      +'</div></div>')

    /* 상호(이름) */
    +row('상호(이름)', inp('reg-cli-name','상호(이름)'), true)

    /* 거래처코드구분 */
    +row('거래처코드구분',
      '<div style="display:flex;gap:14px;align-items:center;padding:3px 0;flex-wrap:wrap">'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-codetype" value="사업자자동번호" checked> 사업자자동번호</label>'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-codetype" value="비사업자(내국인)"> 비사업자(내국인)</label>'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-codetype" value="비사업자(외국인)"> 비사업자(외국인)</label>'
      +'</div>')

    /* 세무소고래처 */
    +row('세무소고래처',
      '<div style="display:flex;gap:14px;align-items:center;padding:3px 0;flex-wrap:wrap">'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-taxtype" value="거래처코드동일" checked> 거래처코드동일</label>'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-taxtype" value="검색입력"> 검색입력</label>'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-taxtype" value="직접입력"> 직접입력</label>'
      +'</div>')

    /* 종사업장번호 */
    +row('종사업장번호', inp('reg-cli-bizsub','종사업장번호'))

    /* 대표자명 */
    +row('대표자명', inp('reg-cli-rep','대표자명'))

    /* 업태 */
    +row('업태', inp('reg-cli-biztype','업태'))

    /* 종목 */
    +row('종목', inp('reg-cli-bizitem','종목'))

    /* 전화 */
    +row('전화', inp('reg-cli-tel','000-0000-0000'))

    /* Fax */
    +row('Fax', inp('reg-cli-fax','Fax'))

    /* Email */
    +row('Email', inp('reg-cli-email','이메일 주소'))

    /* 모바일 */
    +row('모바일', inp('reg-cli-mobile','010-0000-0000'))

    /* 주소1 우편번호 */
    +row('주소1 우편번호',
      '<div style="display:flex;gap:8px;align-items:center">'
      +'<button onclick="_openAddrSearch(\'1\')" style="padding:5px 12px;background:#1e2b4a;color:#fff;border:none;border-radius:5px;font-size:12px;cursor:pointer;white-space:nowrap">🇰🇷 주소검색</button>'
      +'<input id="reg-cli-zip1" type="text" placeholder="우편번호" readonly style="flex:1;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'</div>')

    /* 주소1 */
    +row('주소1',
      '<textarea id="reg-cli-addr1" rows="2" placeholder="주소1" style="width:100%;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px;resize:vertical;box-sizing:border-box"></textarea>'
      +'<input id="reg-cli-addrdetail1" type="text" placeholder="상세 주소" style="width:100%;margin-top:4px;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px;box-sizing:border-box">')

    /* 주소2 우편번호 */
    +row('주소2 우편번호',
      '<div style="display:flex;gap:8px;align-items:center">'
      +'<button onclick="_openAddrSearch(\'2\')" style="padding:5px 12px;background:#1e2b4a;color:#fff;border:none;border-radius:5px;font-size:12px;cursor:pointer;white-space:nowrap">🇰🇷 주소검색</button>'
      +'<input id="reg-cli-zip2" type="text" placeholder="우편번호" readonly style="flex:1;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'</div>')

    /* 주소2 */
    +row('주소2',
      '<textarea id="reg-cli-addr2" rows="2" placeholder="주소2" style="width:100%;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px;resize:vertical;box-sizing:border-box"></textarea>')

    /* 검색내용 */
    +row('검색내용', inp('reg-cli-search','검색어(별칭)'))

    /* 단가적용 */
    +row('단가적용',
      '<div>'
      +'<select id="reg-cli-price-type" onchange="_toggleGongjeongSection(this.value)" '
      +'style="width:100%;padding:7px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'<option value="">— 선택 —</option>'
      +'<option value="기본단가">기본단가</option>'
      +'<option value="공정단가">공정단가</option>'
      +'<option value="특별단가">특별단가</option>'
      +'</select>'
      /* 공정단가 세부 섹션 */
      +'<div id="gongjeong-section" style="display:none;margin-top:10px;border:1.5px solid #e8ecf8;border-radius:6px;overflow:hidden">'
      +'<div style="background:#e8ecf8;padding:6px 10px;font-size:12px;font-weight:700;color:#4361ee;display:flex;align-items:center;justify-content:space-between">'
      +'공정/단가 설정'
      +'<button onclick="_addGongjeongRow()" style="padding:3px 10px;background:#4361ee;color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer">+ 추가</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--bg);border-bottom:1px solid var(--bdr)">'
      +'<th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--muted)">공정명</th>'
      +'<th style="padding:6px 8px;text-align:right;font-weight:600;color:var(--muted)">단가(₩)</th>'
      +'<th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--muted)">단위</th>'
      +'<th style="padding:6px 8px;width:40px"></th>'
      +'</tr></thead>'
      +'<tbody id="gongjeong-tbody">'
      +'<tr style="border-bottom:1px solid var(--bdr)">'
      +'<td style="padding:5px 6px"><input type="text" placeholder="공정명" style="width:100%;padding:5px 8px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px"></td>'
      +'<td style="padding:5px 6px"><input type="number" placeholder="단가" style="width:100%;padding:5px 8px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px;text-align:right"></td>'
      +'<td style="padding:5px 6px"><select style="width:100%;padding:5px 6px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:12px"><option>1YD</option><option>1M</option><option>1EA</option><option>1KG</option><option>1SET</option></select></td>'
      +'<td style="padding:5px 6px;text-align:center"><button onclick="this.closest(\'tr\').remove()" style="background:#ef4444;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">×</button></td>'
      +'</tr>'
      +'</tbody></table>'
      +'<div style="padding:6px 10px;font-size:11px;color:var(--muted)">※ 단위 기본값: 1YD (야드). 공정별 단가·단위를 각각 설정하세요.</div>'
      +'</div>'
      +'</div>', true)

    /* 청구마감일자 */
    +row('청구마감일자',
      '<div style="display:flex;align-items:center;gap:6px;font-size:13px">'
      +'매월 <select id="reg-cli-due" style="padding:5px 8px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'<option value="">— 선택 —</option>'
      +(function(){ var o=''; for(var i=1;i<=31;i++) o+='<option>'+i+'</option>'; return o; })()
      +'</select> 일 마감'
      +'<span style="font-size:11px;color:var(--muted);margin-left:4px">(리스트 청구마감일자 권한에 포함)</span>'
      +'</div>', true)

    /* 업종별구분 */
    +row('업종별구분',
      '<div style="display:flex;gap:14px;align-items:center;padding:3px 0">'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-bizcat" value="일반" checked> 일반</label>'
      +'<label style="display:flex;align-items:center;gap:4px;font-size:12.5px;cursor:pointer"><input type="radio" name="rc-bizcat" value="관세사"> 관세사</label>'
      +'</div>')

    /* 통화 */
    +row('통화',
      '<select id="reg-cli-currency" style="width:200px;padding:7px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'<option value="KRW">내지 (KRW)</option>'
      +'<option value="USD">USD</option>'
      +'<option value="EUR">EUR</option>'
      +'<option value="JPY">JPY</option>'
      +'</select>')

    /* 파일관리 */
    +row('파일관리',
      '<div style="padding:7px 14px;background:#f1f4ff;border:1.5px solid #c7d2fe;border-radius:5px;display:flex;align-items:center;gap:8px;cursor:pointer" onclick="_openFileManageModal()">'
      +'<span style="font-size:12.5px;color:#4361ee;font-weight:700">📎 파일관리</span>'
      +'<span id="reg-file-badge" style="background:#4361ee;color:#fff;border-radius:10px;padding:1px 8px;font-size:11px;font-weight:700">0</span>'
      +'<span style="font-size:11px;color:#4361ee;margin-left:4px">클릭하여 서류 첨부</span>'
      +'</div>')

    /* 거래처그룹1 */
    +row('거래처그룹1',
      '<div style="display:flex;gap:6px">'
      +'<input id="reg-cli-grp1" type="text" placeholder="거래처그룹1" style="flex:1;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'<button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info(\'그룹 검색 기능 준비 중\')" style="padding:5px 10px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:5px;cursor:pointer;font-size:13px">🔍</button>'
      +'</div>')

    /* 거래처그룹2 */
    +row('거래처그룹2',
      '<div style="display:flex;gap:6px">'
      +'<input id="reg-cli-grp2" type="text" placeholder="거래처그룹2" style="flex:1;padding:6px 10px;border:1.5px solid var(--bdr);border-radius:5px;background:var(--bg);color:var(--txt);font-size:13px">'
      +'<button onclick="if(window.ARAM_UI)ARAM_UI.Toast.info(\'그룹 검색 기능 준비 중\')" style="padding:5px 10px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:5px;cursor:pointer;font-size:13px">🔍</button>'
      +'</div>')

    /* 홈페이지 */
    +row('홈페이지', inp('reg-cli-web','https://'))

    +'</div>'; /* /form table */

  UI.Modal.open({
    title: '거래처등록',
    body: body,
    size: 'lg',
    footer: [
      { label: '닫기',     type: 'secondary', onClick: function(close){ close(); } },
      { label: '다시 작성', type: 'secondary', onClick: function() {
          ['reg-biz-no','reg-cli-name','reg-cli-bizsub','reg-cli-rep','reg-cli-biztype','reg-cli-bizitem',
           'reg-cli-tel','reg-cli-fax','reg-cli-email','reg-cli-mobile',
           'reg-cli-zip1','reg-cli-addr1','reg-cli-addrdetail1',
           'reg-cli-zip2','reg-cli-addr2',
           'reg-cli-search','reg-cli-grp1','reg-cli-grp2','reg-cli-web'].forEach(function(id){
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
          var badge = document.getElementById('biz-dup-badge');
          if (badge) badge.textContent = '';
          /* 파일 스토어 초기화 */
          window._regFileStore = { biz:[], bank:[], etc:[] };
          var fb = document.getElementById('reg-file-badge');
          if (fb) fb.textContent = '0';
          if (window.ARAM_UI) ARAM_UI.Toast.info('양식이 초기화되었습니다.');
        }
      },
      { label: '저장 (F8)', type: 'primary', onClick: function(close) {
          var bizNo = ((document.getElementById('reg-biz-no')||{}).value||'').replace(/-/g,'');
          var name  = ((document.getElementById('reg-cli-name')||{}).value||'').trim();
          var price = (document.getElementById('reg-cli-price-type')||{}).value||'';

          if (!bizNo || bizNo.length < 10) { UI.Toast.error('사업자번호를 올바르게 입력하세요. (10자리)'); return; }
          var dup = (window._clientsDB||[]).some(function(c){ return (c.bizNo||'').replace(/-/g,'') === bizNo; });
          if (dup) { UI.Toast.error('이미 등록된 사업자번호입니다.'); return; }
          if (!name) { UI.Toast.error('상호(이름)을 입력하세요.'); return; }
          if (!price) { UI.Toast.error('단가적용을 선택하세요.'); return; }

          /* 신규 코드 생성 */
          var initials = name.replace(/[^가-힣]/g,'').charAt(0) || name.charAt(0).toUpperCase();
          var seq = String((window._clientsDB||[]).length + 1).padStart(3,'0');
          var newCode = initials + seq;
          var formatted = bizNo.slice(0,3)+'-'+bizNo.slice(3,5)+'-'+bizNo.slice(5);

          if (window._clientsDB) {
            window._clientsDB.push({
              code:newCode, name:name, type:'내수', mgr:'—', rep:((document.getElementById('reg-cli-rep')||{}).value||''),
              tel:((document.getElementById('reg-cli-tel')||{}).value||''),
              mobile:((document.getElementById('reg-cli-mobile')||{}).value||''),
              email:((document.getElementById('reg-cli-email')||{}).value||''),
              region:'', addr:((document.getElementById('reg-cli-addr1')||{}).value||''),
              bal:'0', joined:new Date().toISOString().slice(0,10), status:'활성',
              price:price, due:'', bizNo:formatted, memo:'',
              search:((document.getElementById('reg-cli-search')||{}).value||''),
            });
          }
          var store = window._regFileStore || {};
          var fileCount = ((store.biz||[]).length + (store.bank||[]).length + (store.etc||[]).length);
          var fileMsg = fileCount ? ' (첨부파일 ' + fileCount + '건)' : '';
          UI.Toast.success('거래처 [' + name + '] ' + newCode + ' 등록 완료 ✓' + fileMsg);
          close();
        }
      }
    ]
  });
};

/* ═══════════════════════════════════════════════════
   자수 작업지시 → 품목등록 연결 오버레이
═══════════════════════════════════════════════════ */
window._openEmbItemLink = function() {
  var old = document.getElementById('emb-item-link-overlay');
  if (old) old.remove();

  /* 현재 WO 기준 8도 스레드 데이터 */
  var threads = [
    {seq:1, code:'DMC-310',  name:'310 Black',           color:'#1a1a1a', use:1850, yd:0.62, outline:true},
    {seq:2, code:'DMC-321',  name:'321 Navy Blue',        color:'#1e3a8a', use:2560, yd:0.85, outline:false},
    {seq:3, code:'DMC-3752', name:'3752 Peacock Blue',    color:'#0c7a6e', use:1720, yd:0.57, outline:false},
    {seq:4, code:'DMC-3812', name:'3812 Sea Green',       color:'#14b8a6', use:2380, yd:0.79, outline:false},
    {seq:5, code:'DMC-3852', name:'3852 Light Sea Green', color:'#a0d4d0', use:1450, yd:0.48, outline:false},
    {seq:6, code:'DMC-5200', name:'5200 White',           color:'#f0f0f0', use:1980, yd:0.66, outline:true},
    {seq:7, code:'DMC-817',  name:'817 Coral Red',        color:'#9ba8c0', use:980,  yd:0.33, outline:false},
    {seq:8, code:'DMC-3740', name:'3740 Antique Violet',  color:'#c4b5fd', use:860,  yd:0.29, outline:false},
  ];

  var overlay = document.createElement('div');
  overlay.id = 'emb-item-link-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px';

  var threadRows = threads.map(function(t, i) {
    var outlineTag = t.outline
      ? '<span style="background:#fee2e2;color:#ef4444;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:4px">윤곽</span>'
      : '';
    return '<tr style="border-bottom:1px solid #f0f2f7">'
      + '<td style="padding:7px 12px;color:#9ba8c0;text-align:center;font-size:12px">' + (i+1) + '</td>'
      + '<td style="padding:7px 12px;font-family:monospace;font-size:12px;font-weight:700;color:#4361ee">' + t.code + '</td>'
      + '<td style="padding:7px 12px">'
      +   '<div style="display:flex;align-items:center;gap:6px">'
      +     '<div style="width:18px;height:18px;border-radius:3px;background:' + t.color + ';border:' + (t.outline ? '2px solid #374151' : '1.5px solid #d1d5db') + ';flex-shrink:0"></div>'
      +     '<span style="font-size:12.5px;color:#334155">' + t.name + '</span>'
      +     outlineTag
      +   '</div>'
      + '</td>'
      + '<td style="padding:7px 12px;text-align:right;color:#4361ee;font-weight:600;font-size:12px">' + t.yd + '</td>'
      + '<td style="padding:7px 12px;text-align:right;font-weight:600;font-size:12px">' + t.use.toLocaleString() + ' m</td>'
      + '</tr>';
  }).join('');

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:16px;width:700px;max-width:95vw;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.25)">'

    /* 헤더 */
    + '<div style="background:linear-gradient(135deg,#1e2b4a,#2d4a8e);padding:18px 24px;display:flex;align-items:center;justify-content:space-between">'
    +   '<div>'
    +     '<div style="font-size:11px;color:rgba(255,255,255,.6);margin-bottom:3px">생산관리 › 자수 › WO-EMB-2026-0156</div>'
    +     '<div style="font-size:16px;font-weight:700;color:#fff">📦 품목등록 연결</div>'
    +   '</div>'
    +   '<button onclick="document.getElementById(\'emb-item-link-overlay\').remove()" '
    +     'style="background:rgba(255,255,255,.15);border:none;border-radius:8px;color:#fff;width:32px;height:32px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>'
    + '</div>'

    /* 작업지시 요약 */
    + '<div style="background:#f8f9fc;padding:12px 24px;border-bottom:1.5px solid #e5e9f2;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'
    + [
        ['작업번호', 'WO-EMB-2026-0156'],
        ['품목명',   '사명 로고 자수 (폴리)'],
        ['색상수',   '8도'],
        ['수량',     '1,200 ea / 단가 ₩2,800'],
      ].map(function(x) {
        return '<div>'
          + '<div style="font-size:11px;color:#9ba8c0;margin-bottom:3px">' + x[0] + '</div>'
          + '<div style="font-size:12.5px;font-weight:600;color:#1a2035">' + x[1] + '</div>'
          + '</div>';
      }).join('')
    + '</div>'

    /* 실 상세 테이블 */
    + '<div style="padding:16px 24px 8px;flex:1;overflow-y:auto">'
    +   '<div style="font-size:12.5px;font-weight:700;color:#4361ee;margin-bottom:10px;display:flex;align-items:center;gap:8px">'
    +     '🧵 자수실 상세 명세'
    +     '<span style="background:#eff2ff;color:#4361ee;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600">8색상</span>'
    +   '</div>'
    +   '<table style="width:100%;border-collapse:collapse;font-size:13px">'
    +     '<thead><tr style="background:#f0f2f7">'
    +       '<th style="padding:8px 12px;text-align:center;font-size:11.5px;color:#64748b;width:36px">순서</th>'
    +       '<th style="padding:8px 12px;font-size:11.5px;color:#64748b">실 코드</th>'
    +       '<th style="padding:8px 12px;font-size:11.5px;color:#64748b">색상명</th>'
    +       '<th style="padding:8px 12px;text-align:right;font-size:11.5px;color:#64748b">1YD사용량</th>'
    +       '<th style="padding:8px 12px;text-align:right;font-size:11.5px;color:#64748b">총사용량</th>'
    +     '</tr></thead>'
    +     '<tbody>' + threadRows + '</tbody>'
    +   '</table>'
    + '</div>'

    /* 품목등록 연결 폼 */
    + '<div style="padding:16px 24px;border-top:1.5px solid #e5e9f2;background:#fff">'
    +   '<div style="font-size:12.5px;font-weight:700;color:#1a2035;margin-bottom:12px">품목 정보 설정</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">품목명</label>'
    +       '<input id="emb-link-name" class="form-input" value="사명 로고 자수 (8도 폴리)" style="width:100%">'
    +     '</div>'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">카테고리</label>'
    +       '<select id="emb-link-cat" class="form-select" style="width:100%">'
    +         '<option selected>자수 원단</option>'
    +         '<option>완제품</option>'
    +         '<option>부자재</option>'
    +       '</select>'
    +     '</div>'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">단위</label>'
    +       '<select id="emb-link-unit" class="form-select" style="width:100%">'
    +         '<option selected>ea</option><option>m</option><option>set</option>'
    +       '</select>'
    +     '</div>'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">단가 (₩)</label>'
    +       '<input id="emb-link-price" class="form-input" value="2800" type="number" style="width:100%">'
    +     '</div>'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">규격/사양</label>'
    +       '<input id="emb-link-spec" class="form-input" value="폴리에스터 8도 자수 80×60mm" style="width:100%">'
    +     '</div>'
    +     '<div>'
    +       '<label style="font-size:11.5px;color:#64748b;display:block;margin-bottom:4px">재고수량</label>'
    +       '<input id="emb-link-stock" class="form-input" value="1200" type="number" style="width:100%">'
    +     '</div>'
    +   '</div>'

    /* 버튼 */
    +   '<div style="display:flex;gap:8px;justify-content:flex-end">'
    +     '<button onclick="document.getElementById(\'emb-item-link-overlay\').remove()" '
    +       'class="btn btn-secondary">취소</button>'
    +     '<button onclick="window._saveEmbItemLink()" class="btn btn-primary">'
    +       '✅ 품목등록 저장</button>'
    +   '</div>'
    + '</div>'

    + '</div>'; /* /modal */

  overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
};

/* 품목등록 저장 처리 */
window._saveEmbItemLink = function() {
  var name  = (document.getElementById('emb-link-name')  || {}).value || '';
  var cat   = (document.getElementById('emb-link-cat')   || {}).value || '';
  var unit  = (document.getElementById('emb-link-unit')  || {}).value || '';
  var price = (document.getElementById('emb-link-price') || {}).value || '';
  var spec  = (document.getElementById('emb-link-spec')  || {}).value || '';
  var stock = (document.getElementById('emb-link-stock') || {}).value || '0';

  if (!name) {
    if (window.ARAM_UI) ARAM_UI.Toast.error('품목명을 입력하세요.');
    return;
  }

  /* _itemsDB에 추가 */
  if (!window._itemsDB) window._itemsDB = [];
  var seq = String(window._itemsDB.length + 1).padStart(4, '0');
  var newCode = 'ITM-' + seq;
  window._itemsDB.unshift({
    code: newCode,
    name: name,
    cat: cat,
    unit: unit,
    price: parseInt(price || '0').toLocaleString(),
    stock: stock,
    date: new Date().toISOString().slice(0, 10),
    status: '활성',
    spec: spec,
    width: '-',
    memo: 'WO-EMB-2026-0156 자동 연결 등록',
  });

  /* 오버레이 닫기 */
  var ov = document.getElementById('emb-item-link-overlay');
  if (ov) ov.remove();

  if (window.ARAM_UI) {
    ARAM_UI.Toast.success('품목 [' + name + '] ' + newCode + ' 등록 완료 — 품목등록 페이지에서 확인하세요.');
  }
};

/* 신규 자수 작업지시 오버레이 */
window._openNewEmbWO = function() {
  if (window.ARAM_UI) {
    ARAM_UI.Modal.open({
      title: '+ 신규 자수 작업지시',
      body: '<div style="padding:20px">'
        + '<p style="color:#64748b;margin-bottom:16px">신규 작업지시를 생성하면 연결된 수주번호 기준으로<br>자수 사양과 실 배합이 자동 설정됩니다.</p>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
        + '<div><label style="font-size:12px;color:#9ba8c0;display:block;margin-bottom:4px">연결 수주번호</label><input class="form-input" placeholder="SO-2026-XXXX" style="width:100%"></div>'
        + '<div><label style="font-size:12px;color:#9ba8c0;display:block;margin-bottom:4px">납기일</label><input type="date" class="form-input" style="width:100%"></div>'
        + '<div><label style="font-size:12px;color:#9ba8c0;display:block;margin-bottom:4px">담당자</label><select class="form-select" style="width:100%"><option>김자수</option><option>이자수</option><option>박자수</option></select></div>'
        + '<div><label style="font-size:12px;color:#9ba8c0;display:block;margin-bottom:4px">자수기</label><select class="form-select" style="width:100%"><option>TMEZ-01</option><option>TMEZ-02</option><option>TMEZ-03</option></select></div>'
        + '</div></div>',
      actions: [
        {label:'취소', cls:'btn-secondary', action: function(){ if(window.ARAM_UI)ARAM_UI.Modal.close(); }},
        {label:'작업지시 생성', cls:'btn-primary', action: function(){
          if(window.ARAM_UI){
            ARAM_UI.Modal.close();
            ARAM_UI.Toast.success('신규 작업지시 WO-EMB-2026-0157 생성 완료');
          }
        }}
      ]
    });
  }
};

/* ═══════════════════════════════════════════════════
   품목등록 — 공통 DB
═══════════════════════════════════════════════════ */
window._itemsDB = [
  {code:'ITM-0001', name:'플라워 프린트 원단',    cat:'DTP 원단',  unit:'m',  price:'3,200',  stock:'450', date:'2026-01-05', status:'활성', spec:'60수 혼방 면', width:'150cm', memo:'주력 DTP 패턴. 색상 4도 분리.'},
  {code:'ITM-0002', name:'체크무늬 원단',         cat:'DTP 원단',  unit:'m',  price:'2,800',  stock:'320', date:'2026-01-10', status:'활성', spec:'40수 면',     width:'150cm', memo:''},
  {code:'ITM-0003', name:'줄무늬 원단',           cat:'DTP 원단',  unit:'m',  price:'2,600',  stock:'210', date:'2026-01-12', status:'활성', spec:'80수 면',     width:'140cm', memo:''},
  {code:'ITM-0004', name:'장미 자수 원단',        cat:'자수 원단', unit:'m',  price:'8,500',  stock:'180', date:'2026-01-15', status:'활성', spec:'40수 면',     width:'130cm', memo:'자수 밀도 높음.'},
  {code:'ITM-0005', name:'기하학 패턴 원단',      cat:'DTP 원단',  unit:'m',  price:'3,100',  stock:'0',   date:'2026-02-01', status:'단종', spec:'60수 면',     width:'150cm', memo:'단종. 재고 소진.'},
  {code:'ITM-0006', name:'국화 자수 원단',        cat:'자수 원단', unit:'m',  price:'9,200',  stock:'95',  date:'2026-02-05', status:'활성', spec:'40수 면',     width:'130cm', memo:''},
  {code:'ITM-0007', name:'DTP 잉크 CMYK 세트',  cat:'부자재',    unit:'set', price:'42,000', stock:'28',  date:'2026-02-10', status:'활성', spec:'CMYK 4색 세트', width:'-',   memo:'DTP 전용 잉크.'},
  {code:'ITM-0008', name:'전사지 A4',            cat:'부자재',    unit:'box', price:'18,000', stock:'44',  date:'2026-02-15', status:'활성', spec:'A4 500매/box', width:'-',   memo:''},
  {code:'ITM-0009', name:'완성 패턴 셔츠',       cat:'완제품',    unit:'ea',  price:'32,000', stock:'120', date:'2026-03-01', status:'활성', spec:'혼방 100%',    width:'-',   memo:''},
  {code:'ITM-0010', name:'완성 패턴 블라우스',   cat:'완제품',    unit:'ea',  price:'38,000', stock:'80',  date:'2026-03-05', status:'활성', spec:'혼방 100%',    width:'-',   memo:''},
  {code:'ITM-0011', name:'아이코닉 프린트 원단', cat:'DTP 원단',  unit:'m',  price:'3,400',  stock:'260', date:'2026-03-10', status:'활성', spec:'60수 폴리',    width:'150cm', memo:''},
  {code:'ITM-0012', name:'퀄팅 충전재',          cat:'부자재',    unit:'kg',  price:'5,500',  stock:'0',   date:'2026-03-15', status:'단종', spec:'100g/㎡',      width:'-',   memo:'단종 처리.'},
];

/* ───────────── 품목 검색 필터 ───────────── */
window._filterItems = function(q) {
  var tbody  = document.getElementById('item-tbody');
  if (!tbody) return;
  var catF    = (document.getElementById('item-cat-filter')    || {}).value || '';
  var statusF = (document.getElementById('item-status-filter') || {}).value || '';
  var kw      = (q || '').trim().toLowerCase();
  var rows    = tbody.querySelectorAll('tr');
  var visible = 0;
  rows.forEach(function(tr) {
    var cells   = tr.querySelectorAll('td');
    if (!cells.length) return;
    var name    = (cells[1] ? cells[1].textContent : '').toLowerCase();
    var code    = (cells[0] ? cells[0].textContent : '').toLowerCase();
    var cat     = (cells[2] ? cells[2].textContent : '').trim();
    var status  = (cells[7] ? cells[7].textContent : '').trim();
    var matchKw     = !kw     || name.includes(kw) || code.includes(kw);
    var matchCat    = !catF   || cat.includes(catF);
    var matchStatus = !statusF || status.includes(statusF);
    var show = matchKw && matchCat && matchStatus;
    tr.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  var badge = document.getElementById('item-count-badge');
  if (badge) badge.textContent = visible + '건';
};

/* ───────────── 품목 상세 모달 ───────────── */
window._openItemDetail = function(code) {
  var UI = window.ARAM_UI;
  var it = (window._itemsDB || []).find(function(x){ return x.code === code; });
  if (!it) { UI.Toast.error('품목 정보를 찾을 수 없습니다.'); return; }
  var catColors = {'DTP 원단':'#4361ee','자수 원단':'#8b5cf6','부자재':'#f59e0b','완제품':'#10b981'};
  var cc = catColors[it.cat] || '#607d8b';
  var sc = it.status === '활성' ? '#10b981' : '#9ca3af';

  function row(l, v) {
    return '<div style="display:flex;padding:9px 0;border-bottom:1px solid var(--bdr)">'
      +'<span style="min-width:100px;font-size:12px;color:var(--muted);flex-shrink:0">'+l+'</span>'
      +'<span style="font-size:13px;font-weight:600;color:var(--txt)">'+v+'</span></div>';
  }

  var stockNum = parseInt((it.stock||'').replace(/[^0-9]/g,'')) || 0;
  var stockColor = stockNum === 0 ? '#ef4444' : stockNum < 50 ? '#f59e0b' : '#10b981';
  var stockLabel = stockNum === 0 ? '재고 없음' : stockNum < 50 ? '재고 부족' : '정상';

  var body = '<div style="font-family:\'Pretendard\',sans-serif">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:10px;margin-bottom:18px">'
    +  '<div><div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:4px">'+it.name+'</div>'
    +  '<div style="display:flex;gap:8px;align-items:center">'
    +    '<span style="font-size:11px;font-weight:700;color:#fff;background:'+cc+';border-radius:4px;padding:2px 8px">'+it.cat+'</span>'
    +    '<span style="font-size:12px;color:var(--muted)">'+it.code+'</span></div></div>'
    +  '<span style="background:'+sc+';color:#fff;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:700">'+it.status+'</span>'
    +'</div>'
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">품목 기본 정보</div>'
    +row('품목코드', it.code)
    +row('품목명', it.name)
    +row('카테고리', '<span style="color:'+cc+';font-weight:700">'+it.cat+'</span>')
    +row('단위', it.unit)
    +row('단가', '₩'+it.price)
    +row('재고', '<span style="color:'+stockColor+';font-weight:700">'+it.stock+it.unit+' ('+stockLabel+')</span>')
    +row('규격', it.spec)
    +row('폭', it.width)
    +row('등록일', it.date)
    +'<div style="font-size:12px;font-weight:700;color:#4361ee;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:6px;border-bottom:2px solid #e8ecf8">메모</div>'
    +'<div style="padding:12px 14px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:8px;font-size:13px;color:var(--txt);line-height:1.75;min-height:44px">'
    +(it.memo || '<span style="color:var(--muted)">메모 없음</span>')+'</div>'
    +'</div>';

  UI.Modal.open({
    title: '품목 상세 — ' + it.name,
    body: body, size: 'lg',
    footer: [
      { label: '닫기', type: 'secondary', onClick: function(close){ close(); } },
      { label: '품목 수정', type: 'primary', onClick: function(close){ UI.Toast.info('수정 기능은 준비 중입니다.'); } }
    ]
  });
};

/* ───────────── 품목 등록 모달 ───────────── */
window._openItemRegModal = function() {
  var UI = window.ARAM_UI;
  var body = '<div style="font-family:\'Pretendard\',sans-serif;display:flex;flex-direction:column;gap:14px">'
    +_clientField('품목명 *','text','reg-item-name','예: 플라워 원단')
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    +'<div><label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">카테고리 *</label>'
    +'<select id="reg-item-cat" style="width:100%;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px">'
    +'<option value="">선택</option><option>DTP 원단</option><option>자수 원단</option><option>부자재</option><option>완제품</option></select></div>'
    +'<div><label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">단위 *</label>'
    +'<select id="reg-item-unit" style="width:100%;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px">'
    +'<option value="">선택</option><option>m</option><option>ea</option><option>set</option><option>box</option><option>kg</option></select></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    +_clientField('단가 *','number','reg-item-price','예: 3200')
    +_clientField('초기 재고','number','reg-item-stock','예: 100')
    +'</div>'
    +_clientField('규격','text','reg-item-spec','예: 60수 혼방')
    +'<div><label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">메모</label>'
    +'<textarea id="reg-item-memo" rows="3" placeholder="품목 관련 특이사항" style="width:100%;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:8px;background:var(--bg);color:var(--txt);font-size:13px;resize:vertical"></textarea></div>'
    +'</div>';

  UI.Modal.open({
    title: '품목 신규 등록',
    body: body, size: 'md',
    footer: [
      { label: '취소', type: 'secondary', onClick: function(close){ close(); } },
      { label: '등록', type: 'primary', onClick: function(close) {
          var name = (document.getElementById('reg-item-name')||{}).value||'';
          var cat  = (document.getElementById('reg-item-cat') ||{}).value||'';
          var unit = (document.getElementById('reg-item-unit')||{}).value||'';
          if (!name.trim()) { UI.Toast.error('품목명을 입력하세요.'); return; }
          if (!cat)         { UI.Toast.error('카테고리를 선택하세요.'); return; }
          if (!unit)        { UI.Toast.error('단위를 선택하세요.'); return; }
          var newCode = 'ITM-' + String((window._itemsDB||[]).length + 1).padStart(4,'0');
          UI.Toast.success('품목 ' + name + '(' + newCode + ') 등록 완료 ✓');
          close();
        }
      }
    ]
  });
};

/* ═══════════════════════════════════════════════════
   거래처관리 페이지 — 페이지네이션 / 검색 / 전체선택
═══════════════════════════════════════════════════ */
window._cliCurrentPage = 1;

window._cliPage = function(n) {
  window._cliCurrentPage = n;
  var p1 = document.getElementById('cli-tbody-p1');
  var p2 = document.getElementById('cli-tbody-p2');
  var b1 = document.getElementById('cli-pg-1');
  var b2 = document.getElementById('cli-pg-2');
  if (!p1 || !p2) return;
  if (n === 1) {
    p1.style.display = ''; p2.style.display = 'none';
    if (b1) { b1.style.background='#4361ee'; b1.style.color='#fff'; b1.style.border='none'; }
    if (b2) { b2.style.background='var(--bg)'; b2.style.color='var(--txt)'; b2.style.border='1.5px solid var(--bdr)'; }
  } else {
    p1.style.display = 'none'; p2.style.display = '';
    if (b2) { b2.style.background='#4361ee'; b2.style.color='#fff'; b2.style.border='none'; }
    if (b1) { b1.style.background='var(--bg)'; b1.style.color='var(--txt)'; b1.style.border='1.5px solid var(--bdr)'; }
  }
};

window._cliSearch = function() {
  var kw   = ((document.getElementById('cli-srch')||{}).value||'').trim().toLowerCase();
  var incStop = (document.getElementById('cli-inc-stop')||{}).checked;
  var bodies = [
    document.getElementById('cli-tbody-p1'),
    document.getElementById('cli-tbody-p2')
  ];
  var total = 0;
  bodies.forEach(function(tbody) {
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(function(tr) {
      var code = (tr.cells[2] ? tr.cells[2].textContent : '').toLowerCase();
      var name = (tr.cells[3] ? tr.cells[3].textContent : '').toLowerCase();
      var srch = (tr.cells[7] ? tr.cells[7].textContent : '').toLowerCase();
      var use  = (tr.cells[10]? tr.cells[10].textContent: '').trim();
      var matchKw   = !kw || code.includes(kw) || name.includes(kw) || srch.includes(kw);
      var matchStop = incStop || use === 'YES';
      var show = matchKw && matchStop;
      tr.style.display = show ? '' : 'none';
      if (show) total++;
    });
  });
};

window._cliCheckAll = function(master) {
  var bodies = [
    document.getElementById('cli-tbody-p1'),
    document.getElementById('cli-tbody-p2')
  ];
  bodies.forEach(function(tbody) {
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(function(tr) {
      var cb = tr.querySelector('input[type=checkbox]');
      if (cb) cb.checked = master.checked;
    });
  });
};
