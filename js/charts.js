/* ============================================================
   ARAM ERP — charts.js  v3.1
   Chart.js 초기화 모듈
   goPage() 가 페이지 HTML을 삽입한 직후 initCharts(pageName) 을 호출
============================================================ */

window.ARAM_CHARTS = (function () {

  const D = window.ARAM_DATA;

  /* ── 공통 색상 팔레트 ── */
  const C = {
    primary  : '#4361ee',
    green    : '#10b981',
    teal     : '#14b8a6',
    orange   : '#f59e0b',
    red      : '#ef4444',
    purple   : '#8b5cf6',
    gray     : '#94a3b8',
    gridLine : 'rgba(148,163,184,.15)',
    fontColor: '#64748b',
  };

  /* ── 공통 툴팁 스타일 ── */
  const tooltipStyle = {
    backgroundColor: '#1e2433',
    titleColor     : '#e2e8f0',
    bodyColor      : '#94a3b8',
    borderColor    : 'rgba(255,255,255,.08)',
    borderWidth    : 1,
    padding        : 10,
    cornerRadius   : 8,
  };

  /* ── 공통 스케일 옵션 ── */
  function scaleOpts(yBeginZero = true) {
    return {
      x: {
        grid : { color: C.gridLine, drawBorder: false },
        ticks: { color: C.fontColor, font: { size: 11 } },
      },
      y: {
        grid      : { color: C.gridLine, drawBorder: false },
        ticks     : { color: C.fontColor, font: { size: 11 } },
        beginAtZero: yBeginZero,
      },
    };
  }

  /* ── 차트 인스턴스 캐시 ── */
  const _cache = {};

  function safeCanvas(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (_cache[id]) {
      try { _cache[id].destroy(); } catch (_) {}
      delete _cache[id];
    }
    return el;
  }

  function reg(id, chart) { _cache[id] = chart; return chart; }

  /* ══════════════════════════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════════════════════════ */
  function initDashboard() {
    /* 월별 매출 — data.js: { labels:[...], data:[...] } */
    const ms = D.dashboard.monthlySales;
    const cvMon = safeCanvas('chart-monthly-sales');
    if (cvMon) {
      /* 목표: 실적 대비 +10% 임의 생성 */
      const targetData = ms.data.map(v => Math.round(v * 1.1));
      reg('chart-monthly-sales', new Chart(cvMon, {
        type: 'line',
        data: {
          labels: ms.labels,
          datasets: [
            {
              label: '실적',
              data : ms.data,
              borderColor    : C.primary,
              backgroundColor: 'rgba(67,97,238,.10)',
              fill   : true,
              tension: .42,
              pointRadius: 4,
              pointBackgroundColor: C.primary,
              borderWidth: 2.5,
            },
            {
              label: '목표',
              data : targetData,
              borderColor    : C.orange,
              backgroundColor: 'transparent',
              fill  : false,
              tension: .42,
              pointRadius: 3,
              borderDash : [6, 4],
              borderWidth: 2,
              pointBackgroundColor: C.orange,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          plugins: {
            tooltip: tooltipStyle,
            legend : {
              display : true,
              position: 'top',
              align   : 'end',
              labels  : { color: C.fontColor, font: { size: 11 }, boxWidth: 20, usePointStyle: true },
            },
          },
          scales: scaleOpts(false),
        },
      }));
    }

    /* 카테고리별 생산 도넛 — data.js: { labels:[...], data:[...], colors:[...] } */
    const cp  = D.dashboard.categoryProduction;
    const cvCat = safeCanvas('chart-category-donut');
    if (cvCat) {
      reg('chart-category-donut', new Chart(cvCat, {
        type: 'doughnut',
        data: {
          labels  : cp.labels,
          datasets: [{
            data           : cp.data,
            backgroundColor: cp.colors,
            borderWidth    : 0,
            hoverOffset    : 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout : '68%',
          plugins: {
            tooltip: tooltipStyle,
            legend : { display: false },   /* 페이지 HTML 에 커스텀 범례 있음 */
          },
        },
      }));
    }

    /* KPI 스파크라인 — pages.js id="spark-${i}", data.js kpis[i].data */
    const kpis = D.dashboard.kpis;
    kpis.forEach((k, i) => {
      _initSparkline(`spark-${i}`, k.data, k.color);
    });
  }

  function _initSparkline(id, data, color) {
    const cv = safeCanvas(id);
    if (!cv) return;
    /* rgba 변환 (hex → rgba) */
    const hex = color.replace('#', '');
    const r   = parseInt(hex.slice(0,2), 16);
    const g   = parseInt(hex.slice(2,4), 16);
    const b   = parseInt(hex.slice(4,6), 16);
    const bg  = `rgba(${r},${g},${b},.15)`;

    reg(id, new Chart(cv, {
      type: 'line',
      data: {
        labels  : data.map((_, i) => i),
        datasets: [{
          data,
          borderColor    : color,
          backgroundColor: bg,
          fill      : true,
          tension   : .4,
          pointRadius: 0,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales : {
          x: { display: false },
          y: { display: false, beginAtZero: false },
        },
      },
    }));
  }

  /* ══════════════════════════════════════════════════════════
     INVENTORY
  ══════════════════════════════════════════════════════════ */
  function initInventory() {
    const labels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const cvTrend = safeCanvas('chart-inv-trend');
    if (cvTrend) {
      reg('chart-inv-trend', new Chart(cvTrend, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label          : '입고',
              data           : [320,280,350,390,310,420,380,440,360,410,390,450],
              backgroundColor: 'rgba(67,97,238,.75)',
              borderRadius   : 4,
            },
            {
              label          : '출고',
              data           : [290,260,330,370,295,400,355,420,340,385,370,430],
              backgroundColor: 'rgba(16,185,129,.75)',
              borderRadius   : 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 500 },
          plugins: {
            tooltip: tooltipStyle,
            legend : {
              display : true,
              position: 'top',
              align   : 'end',
              labels  : { color: C.fontColor, font: { size: 11 }, boxWidth: 14, usePointStyle: true },
            },
          },
          scales: scaleOpts(),
        },
      }));
    }
  }

  /* ══════════════════════════════════════════════════════════
     FINANCE
  ══════════════════════════════════════════════════════════ */
  function initFinance() {
    /* data.js cashflow: { labels:[...], income:[...], expense:[...] } */
    const cf = D.finance.cashflow;

    /* 자금흐름 에어리어 */
    const cvCash = safeCanvas('chart-cashflow');
    if (cvCash) {
      /* 잔액 = income + expense (expense 는 음수) */
      const balance = cf.income.map((v, i) => v + cf.expense[i]);
      reg('chart-cashflow', new Chart(cvCash, {
        type: 'line',
        data: {
          labels  : cf.labels,
          datasets: [
            {
              label          : '매출',
              data           : cf.income,
              borderColor    : C.green,
              backgroundColor: 'rgba(16,185,129,.12)',
              fill   : true,
              tension: .42,
              pointRadius: 4,
              borderWidth: 2.5,
              pointBackgroundColor: C.green,
            },
            {
              label          : '매입',
              data           : cf.expense.map(v => Math.abs(v)),
              borderColor    : C.red,
              backgroundColor: 'rgba(239,68,68,.08)',
              fill   : true,
              tension: .42,
              pointRadius: 4,
              borderWidth: 2.5,
              pointBackgroundColor: C.red,
            },
            {
              label      : '순현금',
              data       : balance,
              borderColor: C.primary,
              backgroundColor: 'transparent',
              fill       : false,
              tension    : .42,
              pointRadius: 3,
              borderWidth: 2,
              borderDash : [5, 4],
              pointBackgroundColor: C.primary,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          plugins: {
            tooltip: tooltipStyle,
            legend : {
              display : true,
              position: 'top',
              align   : 'end',
              labels  : { color: C.fontColor, font: { size: 11 }, usePointStyle: true, padding: 12 },
            },
          },
          scales: scaleOpts(false),
        },
      }));
    }

    /* 매출/매입 비교 바 */
    const cvSP = safeCanvas('chart-sales-purchase');
    if (cvSP) {
      reg('chart-sales-purchase', new Chart(cvSP, {
        type: 'bar',
        data: {
          labels  : cf.labels,
          datasets: [
            {
              label          : '매출',
              data           : cf.income,
              backgroundColor: 'rgba(67,97,238,.75)',
              borderRadius   : 4,
            },
            {
              label          : '매입',
              data           : cf.expense.map(v => Math.abs(v)),
              backgroundColor: 'rgba(239,68,68,.6)',
              borderRadius   : 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 500 },
          plugins: {
            tooltip: tooltipStyle,
            legend : {
              display : true,
              position: 'top',
              align   : 'end',
              labels  : { color: C.fontColor, font: { size: 11 }, usePointStyle: true },
            },
          },
          scales: scaleOpts(),
        },
      }));
    }
  }

  /* ══════════════════════════════════════════════════════════
     HR
  ══════════════════════════════════════════════════════════ */
  function initHr() {
    const cvAtt = safeCanvas('chart-attendance');
    if (cvAtt) {
      reg('chart-attendance', new Chart(cvAtt, {
        type: 'doughnut',
        data: {
          labels  : ['정상출근','재택근무','휴가','출장','결근'],
          datasets: [{
            data           : [68, 12, 8, 6, 1],
            backgroundColor: [C.green, C.primary, C.orange, C.purple, C.red],
            borderWidth    : 0,
            hoverOffset    : 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout : '65%',
          plugins: {
            tooltip: tooltipStyle,
            legend : {
              display : true,
              position: 'bottom',
              labels  : { color: C.fontColor, font: { size: 11 }, usePointStyle: true, padding: 10 },
            },
          },
        },
      }));
    }
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════ */
  function initCharts(pageName) {
    requestAnimationFrame(() => {
      switch (pageName) {
        case 'dashboard': initDashboard(); break;
        case 'inventory': initInventory(); break;
        case 'finance'  : initFinance();   break;
        case 'hr'       : initHr();        break;
        default: break;
      }
    });
  }

  function destroyAll() {
    Object.keys(_cache).forEach(k => {
      try { _cache[k].destroy(); } catch (_) {}
      delete _cache[k];
    });
  }

  return { initCharts, destroyAll };

})();
