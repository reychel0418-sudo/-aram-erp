/* ═══════════════════════════════════════════════
   ARAM INDUSTRY ERP — Mock Data v3.0
   ═══════════════════════════════════════════════ */

window.ARAM_DATA = {

  /* ── CURRENT USER (from sessionStorage) ── */
  getUser() {
    try { return JSON.parse(sessionStorage.getItem('aram_user')) || { name:'김민수', role:'대표', dept:'경영지원팀' }; }
    catch { return { name:'김민수', role:'대표', dept:'경영지원팀' }; }
  },

  /* ── DASHBOARD ── */
  dashboard: {
    kpis: [
      { label:'이번달 매출', value:'₩482,300,000', change:'+12.4%', dir:'up', unit:'전월 대비', color:'#4361ee', data:[182,210,245,238,285,312,298,341,380,420,465,482] },
      { label:'진행중 주문', value:'87건',          change:'+8.7%',  dir:'up', unit:'전월 대비', color:'#10b981', data:[52,61,58,74,70,82,78,88,75,92,84,87] },
      { label:'생산완료율',  value:'94.2%',         change:'+5.3%',  dir:'up', unit:'전월 대비', color:'#f59e0b', data:[84,87,85,91,88,93,90,92,95,91,94,94] },
      { label:'재고회전율',  value:'6.8회',         change:'+1.2회', dir:'up', unit:'전월 대비', color:'#8b5cf6', data:[4.2,4.8,5.1,5.0,5.4,5.8,5.6,6.0,6.3,6.5,6.4,6.8] },
    ],
    monthlySales: {
      labels: ['24.06','24.07','24.08','24.09','24.10','24.11','24.12','25.01','25.02','25.03','25.04','25.05'],
      data:   [182, 210, 245, 238, 285, 312, 298, 341, 380, 420, 465, 482],
    },
    categoryProduction: {
      labels: ['DTP','원단','퀄팅','자수'],
      data:   [38.6, 26.4, 19.7, 15.3],
      colors: ['#4361ee','#14b8a6','#8b5cf6','#f59e0b'],
      total:  '18,520건',
    },
    notices: [
      { type:'red', text:'2025년 6월 시스템 점검 안내',      date:'05.19' },
      { type:'blue',text:'원단 단가 변동 안내 (05/20 적용)', date:'05.18' },
      { type:'',    text:'제휴 물류사 변경 안내',            date:'05.16' },
      { type:'',    text:'6월 안전보건 교육 일정 안내',       date:'05.15' },
      { type:'',    text:'ERP 모바일 앱 업데이트 안내',       date:'05.14' },
    ],
    recentOrders: [
      { no:'SO-2025-0519-001', client:'(주)스타패션', product:'콜론 DTP 티셔츠 원단',  qty:'12,000 YD', due:'2025.05.28', status:'대기',   statusColor:'gray' },
      { no:'SO-2025-0518-002', client:'(주)위드텍스타일',product:'자수 보이넥 팬텀맨', qty:'3,200 EA',  due:'2025.05.30', status:'진행중', statusColor:'blue' },
      { no:'SO-2025-0517-003', client:'(주)모던어패럴', product:'퀄팅 패딩 원단',      qty:'8,500 YD',  due:'2025.05.25', status:'완료',   statusColor:'green' },
      { no:'SO-2025-0516-004', client:'(주)제이브랜드', product:'기모 후드티 원단',     qty:'5,000 YD',  due:'2025.05.24', status:'진행중', statusColor:'blue' },
      { no:'SO-2025-0515-005', client:'(주)해슬컴퍼니', product:'린넨 스트라이프 서츠 원단',qty:'2,800 YD',due:'2025.05.27',status:'완료',statusColor:'green' },
    ],
  },

  /* ── SALES ORDERS ── */
  salesOrders: [
    { no:'ORD-2026-0871', client:'(주)대한섬유',  product:'30수 면 트윌 (베이지)',      qty:'10,000 m', price:'3,800',  total:'38,000,000', due:'2026-05-20', progress:85, status:'진행중', mgr:'김영업' },
    { no:'ORD-2026-0870', client:'한슬패션',      product:'40수 면 옥스포드 (네이비)',  qty:'8,000 m',  price:'4,200',  total:'33,600,000', due:'2026-05-22', progress:60, status:'진행중', mgr:'이수진' },
    { no:'ORD-2026-0869', client:'인디고텍스',    product:'TC 65/35 (그레이)',          qty:'15,000 m', price:'2,900',  total:'43,500,000', due:'2026-05-25', progress:40, status:'접수',   mgr:'박민재' },
    { no:'ORD-2026-0868', client:'모던월트',      product:'60수 아사 (핑크)',           qty:'12,000 m', price:'4,600',  total:'55,200,000', due:'2026-05-28', progress:25, status:'접수',   mgr:'최유정' },
    { no:'ORD-2026-0867', client:'(주)대한섬유',  product:'30수 선염 스트라이프 (블루)',qty:'9,000 m',  price:'4,100',  total:'36,900,000', due:'2026-05-30', progress:70, status:'진행중', mgr:'김영업' },
    { no:'ORD-2026-0866', client:'한슬패션',      product:'20수 쭈리 (아이보리)',       qty:'7,500 m',  price:'3,500',  total:'26,250,000', due:'2026-06-02', progress:10, status:'접수',   mgr:'이수진' },
    { no:'ORD-2026-0865', client:'인디고텍스',    product:'나일론 Taslan (블랙)',        qty:'5,000 m',  price:'6,800',  total:'34,000,000', due:'2026-06-05', progress:5,  status:'접수',   mgr:'박민재' },
    { no:'ORD-2026-0864', client:'모던월트',      product:'60수 평직 (민트)',           qty:'6,000 m',  price:'4,300',  total:'25,800,000', due:'2026-06-08', progress:0,  status:'접수',   mgr:'최유정' },
    { no:'ORD-2026-0863', client:'(주)대한섬유',  product:'데님 10oz (인디고)',         qty:'8,000 m',  price:'5,700',  total:'45,600,000', due:'2026-06-10', progress:50, status:'진행중', mgr:'김영업' },
    { no:'ORD-2026-0862', client:'한슬패션',      product:'40수 면 싱글 (화이트)',      qty:'9,500 m',  price:'3,200',  total:'30,400,000', due:'2026-06-12', progress:30, status:'접수',   mgr:'이수진' },
    { no:'ORD-2026-0861', client:'인디고텍스',    product:'TC 80/20 (카키)',            qty:'11,000 m', price:'3,100',  total:'34,100,000', due:'2026-06-15', progress:15, status:'접수',   mgr:'박민재' },
    { no:'ORD-2026-0860', client:'모던월트',      product:'30수 피그먼트 (크림)',       qty:'6,500 m',  price:'4,000',  total:'26,000,000', due:'2026-06-18', progress:0,  status:'접수',   mgr:'최유정' },
  ],

  /* ── ORDER DETAIL ── */
  orderDetail: {
    no: 'ORD-2026-0871',
    status: '진행중',
    client: '(주)대한섬유',
    bizNo: '123-81-45678',
    mgr: '박지훈 (010-1234-5678 / parkjh@dhtex.co.kr)',
    due: '2026-05-20 (수)',
    payment: '30일 후',
    address: '경기도 김포시 양촌읍 황금로 123',
    items: [
      { code:'FAB-1001', name:'NYLON RIPSTOP', spec:'70D / PU 2,000mm', qty:'5,000 YD', price:'₩3,200', amount:'₩16,000,000', note:'네이비' },
      { code:'FAB-1002', name:'POLYESTER TAFFETA', spec:'75D / WR',     qty:'4,000 YD', price:'₩2,400', amount:'₩9,600,000',  note:'그레이' },
      { code:'ACC-2001', name:'YKK 지퍼 (5호)', spec:'5호 / 블랙',      qty:'5,000 EA', price:'₩600',   amount:'₩3,000,000',  note:'-' },
      { code:'ACC-2002', name:'플라스틱 버클 (20mm)', spec:'20mm / 블랙',qty:'5,000 EA', price:'₩300',   amount:'₩1,500,000',  note:'-' },
      { code:'LAB-3001', name:'봉제 가공비', spec:'-',                   qty:'5,000 EA', price:'₩1,600', amount:'₩8,000,000',  note:'-' },
    ],
    total: '₩38,000,000',
    timeline: [
      { label:'수주접수', date:'2026-04-28 09:15', done:true },
      { label:'견적승인', date:'2026-04-28 11:02', done:true },
      { label:'생산지시', date:'2026-04-29 14:30', done:true },
      { label:'생산중',   date:'2026-05-06 10:20', active:true },
      { label:'검수',     date:'',                  done:false, pending:true },
      { label:'출하',     date:'',                  done:false, pending:true },
    ],
    attachments: [
      { name:'작업지시서.pdf',  size:'1.2 MB', type:'pdf', color:'#ef4444' },
      { name:'디자인시안.ai',   size:'8.7 MB', type:'ai',  color:'#f97316' },
      { name:'원단스펙.xlsx',   size:'45.3 KB',type:'xlsx',color:'#10b981' },
    ],
    comments: [
      { name:'박지훈 대리', title:'작성자', date:'2026-04-29 14:31', text:'생산지시 완료되었습니다. 원단 입고 일정 확인 부탁드립니다.' },
      { name:'이소영 과장', title:'',       date:'2026-04-29 14:45', text:'원단 5/8 입고 예정입니다. 일정에 반영하겠습니다.' },
      { name:'김민수 차장', title:'',       date:'2026-05-06 10:21', text:'검수 기준서 추가 첨부드립니다. 확인 부탁드립니다.' },
    ],
  },

  /* ── INVENTORY ── */
  inventory: [
    { code:'FAB-2401', color:'#e8e4d8', name:'모달 60수 화이트', width:'150', stock:'12,450 YD', safety:8000, location:'A-12-3', incoming:'2,000 YD (05/22)', status:'정상' },
    { code:'FAB-2402', color:'#1e3a5f', name:'옥스포드 나일론 네이비', width:'147', stock:'8,620 YD',  safety:7000, location:'B-04-1', incoming:'1,500 YD (05/23)', status:'정상' },
    { code:'FAB-2403', color:'#9ba8c0', name:'TC 20수 그레이', width:'110', stock:'5,430 YD',  safety:6000, location:'C-07-2', incoming:'-',              status:'부족' },
    { code:'FAB-2404', color:'#1a1a1a', name:'트윌 코튼 블랙', width:'145', stock:'9,870 YD',  safety:5000, location:'A-03-4', incoming:'3,000 YD (05/20)', status:'정상' },
    { code:'FAB-2405', color:'#f5f5f0', name:'린넨 30수 내추럴', width:'140', stock:'3,210 YD',  safety:4000, location:'D-02-1', incoming:'1,000 YD (05/28)', status:'부족' },
    { code:'FAB-2406', color:'#87ceeb', name:'옥스포드 코튼 스카이', width:'147', stock:'14,320 YD', safety:8000, location:'B-05-3', incoming:'2,500 YD (05/21)', status:'정상' },
    { code:'FAB-2407', color:'#5c4a3d', name:'테일러드 울 차콜', width:'150', stock:'2,150 YD',  safety:3000, location:'E-01-2', incoming:'-',              status:'부족' },
    { code:'FAB-2408', color:'#c8a96e', name:'나일론 20D 카키', width:'142', stock:'6,780 YD',  safety:5000, location:'C-11-4', incoming:'2,000 YD (05/27)', status:'정상' },
    { code:'FAB-2409', color:'#ff9fb2', name:'면 40수 핑크', width:'110', stock:'1,250 YD',  safety:2500, location:'D-03-2', incoming:'1,000 YD (05/26)', status:'부족' },
    { code:'FAB-2410', color:'#2c3e50', name:'폴리 75D 블랙', width:'148', stock:'0 YD',     safety:4000, location:'A-01-1', incoming:'2,000 YD (05/20)', status:'품절' },
  ],

  /* ── FABRICCUB PRODUCTS ── */
  fabricProducts: [
    { name:'내추럴 린넨 오트밀',   vendor:'바한슬직물',  price:'₩6,800', unit:'/yd', rating:4.7, count:24,  stock:'120yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#f5e6d0,#e8d5b0)' },
    { name:'코튼 트윌 민트',       vendor:'인디고텍스',  price:'₩5,200', unit:'/yd', rating:4.6, count:38,  stock:'250yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#c8e6d0,#a8d8b0)' },
    { name:'12oz 데님 네이비',     vendor:'태광데님',   price:'₩7,900', unit:'/yd', rating:4.8, count:52,  stock:'180yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#1e3a5f,#2d5a8e)' },
    { name:'실크 세틴 라벤더',     vendor:'제이텍스타일',price:'₩16,000',unit:'/yd', rating:4.9, count:18,  stock:'90yd',  stockOk:true,  category:'실크',bg:'linear-gradient(135deg,#d8c8e8,#c0a8d0)' },
    { name:'울 캐시미어 크림',     vendor:'동화섬유',   price:'₩22,500',unit:'/yd', rating:4.8, count:31,  stock:'65yd',  stockOk:true,  category:'울', bg:'linear-gradient(135deg,#f0ebe0,#e0d8c0)' },
    { name:'코튼 샴브레이 세이지', vendor:'에스텍스',   price:'₩5,600', unit:'/yd', rating:4.6, count:44,  stock:'200yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#b8d0b8,#9ab89a)' },
    { name:'30수 싱글 저지 차콜',  vendor:'제이텍스타일',price:'₩4,200', unit:'/yd', rating:4.5, count:67,  stock:'300yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#4a4a4a,#2a2a2a)' },
    { name:'폴리 새틴 블러쉬',     vendor:'제이텍스타일',price:'₩4,800', unit:'/yd', rating:4.4, count:29,  stock:'150yd', stockOk:true,  category:'혼방',bg:'linear-gradient(135deg,#f0c0c0,#e0a0a0)' },
    { name:'10수 캔버스 아이보리', vendor:'한슬캔버스',  price:'₩3,900', unit:'/yd', rating:4.6, count:55,  stock:'500yd', stockOk:true,  category:'면', bg:'linear-gradient(135deg,#f5f0e8,#e8e0d0)' },
    { name:'모달 스판 더스티로즈',  vendor:'에스텍스',   price:'₩6,300', unit:'/yd', rating:4.7, count:33,  stock:'220yd', stockOk:true,  category:'혼방',bg:'linear-gradient(135deg,#e8c0c8,#d0a0b0)' },
    { name:'폴리 코튼 포플린 토프', vendor:'태광섬유',   price:'₩3,700', unit:'/yd', rating:4.5, count:78,  stock:'260yd', stockOk:true,  category:'혼방',bg:'linear-gradient(135deg,#d8cfc0,#c8bfa0)' },
    { name:'쉬폰 샌드 베이지',     vendor:'제이텍스타일',price:'₩5,100', unit:'/yd', rating:4.6, count:41,  stock:'110yd', stockOk:false, category:'혼방',bg:'linear-gradient(135deg,#e8dfc0,#d8cfa0)' },
  ],

  /* ── FINANCE ── */
  finance: {
    kpis: [
      { label:'현금성자산', value:'₩4,820,000,000', color:'#4361ee' },
      { label:'매출채권',   value:'₩1,240,000,000', color:'#10b981' },
      { label:'매입채무',   value:'₩780,000,000',   color:'#f59e0b' },
      { label:'순현금흐름', value:'+₩320,000,000',  color:'#10b981', positive:true },
      { label:'운전자본',   value:'₩5,280,000,000', color:'#8b5cf6' },
    ],
    cashflow: {
      labels: ['25.06','25.07','25.08','25.09','25.10','25.11','25.12','26.01','26.02','26.03','26.04','26.05'],
      income:  [1050,1180,1320,1100,1250,1380,1420,1150,1280,1420,1350,1380],
      expense: [-820,-950,-1100,-880,-1020,-1150,-1250,-920,-1100,-1180,-1050,-1060],
    },
    banks: [
      { name:'국민은행', icon:'🏦', amount:'₩2,100,000,000', pct:44 },
      { name:'신한은행', icon:'🏦', amount:'₩980,000,000',   pct:20 },
      { name:'우리은행', icon:'🏦', amount:'₩620,000,000',   pct:13 },
      { name:'하나은행', icon:'🏦', amount:'₩540,000,000',   pct:11 },
      { name:'기업은행', icon:'🏦', amount:'₩580,000,000',   pct:12 },
    ],
    recentTx: [
      { date:'2026.05.23', client:'(주)텍크솔루션', item:'제품 매출 대금 입금', type:'입금', amount:'₩4,820,000,000' },
      { date:'2026.05.22', client:'(주)동방자재',  item:'원재료 납품 대금 지급',type:'출금', amount:'₩4,500,000,000' },
      { date:'2026.05.21', client:'신한은행',       item:'기업대출 이자 납부',   type:'출금', amount:'₩4,620,000,000' },
      { date:'2026.05.20', client:'(주)미래전자',   item:'제품 매출 대금 입금',  type:'입금', amount:'₩4,740,000,000' },
      { date:'2026.05.19', client:'하나카드(주)',    item:'법인카드 사용 대금 결제',type:'출금',amount:'₩4,360,000,000' },
    ],
  },

  /* ── HR ── */
  hr: {
    kpis: [
      { label:'전체 임직원', value:'142명', sub:'전체 임직원 수', color:'#4361ee' },
      { label:'이번달 입사', value:'3명',   sub:'신규 입사자',   color:'#10b981' },
      { label:'평균 근속',   value:'4.7년', sub:'전체 평균',     color:'#f59e0b' },
      { label:'출근율',      value:'96.8%', sub:'이번달 기준',   color:'#8b5cf6' },
    ],
    teamMembers: [
      { name:'박지훈', title:'대리', dept:'DTP팀', joined:'2021.03.15', status:'재직중', statusColor:'green' },
      { name:'최유리', title:'사원', dept:'DTP팀', joined:'2022.06.01', status:'재직중', statusColor:'green' },
      { name:'김태우', title:'대리', dept:'DTP팀', joined:'2020.11.02', status:'재직중', statusColor:'green' },
      { name:'정다은', title:'주임', dept:'DTP팀', joined:'2021.07.19', status:'재직중', statusColor:'green' },
      { name:'이상민', title:'사원', dept:'DTP팀', joined:'2023.02.13', status:'휴직',   statusColor:'orange' },
      { name:'한수빈', title:'주임', dept:'DTP팀', joined:'2020.08.24', status:'재직중', statusColor:'green' },
      { name:'오재형', title:'대리', dept:'DTP팀', joined:'2019.12.05', status:'재직중', statusColor:'green' },
      { name:'김민지', title:'사원', dept:'DTP팀', joined:'2022.09.05', status:'재직중', statusColor:'green' },
      { name:'유승현', title:'사원', dept:'DTP팀', joined:'2023.08.14', status:'외근',   statusColor:'orange' },
    ],
  },

  /* ── PURCHASE ORDERS ── */
  purchaseOrders: [
    { no:'PO-2026-0234', vendor:'(하)동방자재',  product:'TR 스판 원단 (자홀)', qty:'1,000 YD',price:'₩4,200',total:'₩4,200,000',  ordered:'2025-05-28', due:'2026-06-05', status:'발주완료', mgr:'김민수' },
    { no:'PO-2026-0233', vendor:'한일직물',      product:'면 20수 원단 (아이보리)',qty:'800 YD', price:'₩3,100',total:'₩2,480,000',  ordered:'2025-05-27', due:'2026-06-04', status:'승인대기', mgr:'이지연' },
    { no:'PO-2026-0232', vendor:'코리아부자재',  product:'YKK 지퍼 5호 (블랙)',   qty:'3,000 EA',price:'₩250',  total:'₩750,000',    ordered:'2025-05-26', due:'2026-06-02', status:'발주완료', mgr:'박상현' },
    { no:'PO-2026-0231', vendor:'(하)동방자재',  product:'폴리 안감 (네이비)',    qty:'1,500 YD',price:'₩1,800',total:'₩2,700,000',  ordered:'2025-05-26', due:'2026-06-03', status:'입고대기', mgr:'김민수' },
    { no:'PO-2026-0230', vendor:'한일직물',      product:'선염 스트라이프 원단',  qty:'600 YD',  price:'₩5,600',total:'₩3,360,000',  ordered:'2025-05-24', due:'2026-06-01', status:'발주완료', mgr:'이지연' },
    { no:'PO-2026-0229', vendor:'코리아부자재',  product:'채봉사 40수 (검정)',    qty:'50 EA',   price:'₩2,000',total:'₩100,000',     ordered:'2025-05-23', due:'2026-05-30', status:'입고완료', mgr:'박상현' },
    { no:'PO-2026-0228', vendor:'(하)동방자재',  product:'나일론 원단 (카키)',    qty:'1,200 YD',price:'₩2,900',total:'₩3,480,000',  ordered:'2025-05-22', due:'2026-05-29', status:'발주완료', mgr:'김민수' },
    { no:'PO-2026-0227', vendor:'한일직물',      product:'양면 기모 원단 (그레이)',qty:'900 YD', price:'₩4,400',total:'₩3,960,000',  ordered:'2025-05-21', due:'2026-05-28', status:'승인대기', mgr:'이지연' },
  ],

};
