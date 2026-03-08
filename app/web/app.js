const state = {
  markets: [],
  signals: [],
  sharks: [],
  sound: false,
  strategies: [
    { name: 'Arb', on: true, tip: 'מנצל פערי YES/NO ל-Arbitrage.' },
    { name: 'Momentum', on: true, tip: 'מצטרף לטרנד קצר-טווח.' },
    { name: 'Shark Tracking', on: true, tip: 'עוקב אחרי עסקאות Whale.' },
    { name: 'Correlated Markets', on: false, tip: 'מזהה התאמות בין שווקים קשורים.' },
    { name: 'Close-to-Close', on: false, tip: 'ניתוח תנודתיות בין סגירות.' },
    { name: 'News Sentiment', on: true, tip: 'מתרגם סנטימנט חדשות להחלטות מסחר.' },
  ],
};

const $ = (id) => document.getElementById(id);
const showToast = (msg) => {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
};

async function api(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error(`API error on ${path}`);
  return response.json();
}

function renderMetrics(status) {
  $('pnlValue').textContent = `$${Number(status.pnl || 0).toFixed(2)}`;
  $('signalsCount').textContent = status.signals_count ?? 0;
  $('marketsCount').textContent = status.markets_scanned ?? 0;
  $('sharkCount').textContent = status.shark_alerts ?? 0;
  $('winRate').textContent = `${status.win_rate ?? 0}%`;
  $('botStatus').textContent = status.trading_enabled ? 'ONLINE' : 'OFFLINE';
  $('simBtn').textContent = `Simulation: ${status.simulation_mode ? 'ON' : 'OFF'}`;
}

function marketRow(market) {
  const edgeClass = market.edge >= 0 ? 'edge-pos' : 'edge-neg';
  return `
    <tr>
      <td>${market.name}</td>
      <td>${market.yes}</td>
      <td>${market.no}</td>
      <td class="${edgeClass}">${market.edge}%</td>
      <td><button data-analyze="${market.id}">Analyze</button></td>
    </tr>
  `;
}

function renderMarkets() {
  $('marketsTable').innerHTML = state.markets.map(marketRow).join('');
  document.querySelectorAll('[data-analyze]').forEach((button) => {
    button.addEventListener('click', () => openMarketModal(button.dataset.analyze));
  });
}

function signalIcon(signal) {
  const type = (signal.type || '').toLowerCase();
  if (type.includes('arb')) return '⚡';
  if (type.includes('shark')) return '🦈';
  if (type.includes('momentum')) return '📈';
  return '📰';
}

function renderSignals() {
  const feed = $('signalFeed');
  const items = state.signals.slice(0, 20).map((s) => {
    const edge = Number(s.edge_percentage || 0).toFixed(3);
    return `<li>${signalIcon(s)} <strong>${s.market || 'Market'}</strong> | Edge: ${edge}</li>`;
  });
  feed.innerHTML = items.length ? items.join('') : '<li>אין סיגנלים כרגע.</li>';
  drawSignalsChart();
}

function drawSignalsChart() {
  const canvas = $('signalsChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const points = state.signals.slice(0, 24).map((s, i) => ({
    x: (i / 23) * (width - 40) + 20,
    y: height - ((Number(s.edge_percentage || 0) + 0.08) * 480),
  }));

  ctx.strokeStyle = '#49d8ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  ctx.strokeStyle = 'rgba(73,216,255,.35)';
  points.forEach((p) => {
    const wick = (Math.random() * 16) + 8;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - wick);
    ctx.lineTo(p.x, p.y + wick);
    ctx.stroke();
  });
}

function renderSharks() {
  const list = $('sharkList');
  const rows = state.sharks.slice(0, 16).map((s) => (
    `<li>🦈 ${s.avatar} ${s.size}$ | ${s.market} | ${s.time}</li>`
  ));
  list.innerHTML = rows.length ? rows.join('') : '<li>עדיין אין פעילות Whale.</li>';
}

function renderNews() {
  const samples = [
    { title: 'ETF זרימות גבוהות לשוק הקריפטו', s: 'bull', src: 'Bloomberg' },
    { title: 'רגולציה חדשה בארה"ב סביב חוזי תחזית', s: 'neutral', src: 'Reuters' },
    { title: 'ירידה בנפחי פולימרקט בשעות אסיה', s: 'bear', src: 'The Block' },
  ];
  $('newsList').innerHTML = samples.map((n) => {
    const color = n.s === 'bull' ? '#3de0a3' : n.s === 'bear' ? '#ff5f7a' : '#ffcf66';
    return `<li><strong style="color:${color}">${n.s.toUpperCase()}</strong> | ${n.title} <small>(${n.src}, עכשיו)</small></li>`;
  }).join('');
}

function renderStrategies() {
  $('strategiesGrid').innerHTML = state.strategies.map((s, i) => `
    <article class="strategy-card" title="${s.tip}">
      <strong>${s.name}</strong>
      <p>${s.tip}</p>
      <div class="switch ${s.on ? 'on' : ''}" data-strategy="${i}"></div>
    </article>
  `).join('');

  document.querySelectorAll('[data-strategy]').forEach((sw) => {
    sw.addEventListener('click', () => {
      const idx = Number(sw.dataset.strategy);
      state.strategies[idx].on = !state.strategies[idx].on;
      renderStrategies();
      showToast(`Strategy ${state.strategies[idx].name} ${state.strategies[idx].on ? 'ON' : 'OFF'}`);
    });
  });
}

function openMarketModal(id) {
  const market = state.markets.find((m) => String(m.id) === String(id));
  if (!market) return;
  $('modalBody').innerHTML = `
    <p><strong>${market.name}</strong></p>
    <p>AI Confidence: <strong>${(62 + Math.random() * 30).toFixed(1)}%</strong></p>
    <p>Edge Snapshot: <strong class="${market.edge >= 0 ? 'edge-pos' : 'edge-neg'}">${market.edge}%</strong></p>
    <p>Liquidity: ${Number(market.liquidity).toLocaleString()} | Volume: ${Number(market.volume).toLocaleString()}</p>
    <p>Action: ${market.edge > 1 ? 'ארביטראז\' מועדף' : 'המתנה לאישור סיגנל נוסף'}</p>
  `;
  $('analysisModal').classList.add('show');
}

function addChatBubble(text, role = 'ai') {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  $('chatLog').appendChild(bubble);
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
}

function runFakeAIResponse(question) {
  const answer = `ניתוח AI: בהתבסס על שאלה "${question}", כדאי להתמקד בשווקים עם Edge מעל 1.5% ולשלב הגבלת סיכון דינמית.`;
  setTimeout(() => addChatBubble(answer, 'ai'), 600);
}

function initChat() {
  $('sendChat').addEventListener('click', () => {
    const input = $('chatInput');
    const text = input.value.trim();
    if (!text) return;
    addChatBubble(text, 'user');
    runFakeAIResponse(text);
    input.value = '';
  });

  $('chatInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') $('sendChat').click();
  });
}

function initDnD() {
  let dragged = null;
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.addEventListener('dragstart', () => { dragged = panel; });
    panel.addEventListener('dragover', (e) => e.preventDefault());
    panel.addEventListener('drop', () => {
      if (!dragged || dragged === panel) return;
      const root = $('dashboard');
      const items = [...root.children];
      const a = items.indexOf(dragged);
      const b = items.indexOf(panel);
      if (a < b) panel.after(dragged); else panel.before(dragged);
    });
  });
}

function initCursorGlow() {
  const glow = $('cursorGlow');
  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

function initTabs() {
  $('tabs').querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initControls() {
  $('scanBtn').addEventListener('click', async () => {
    await api('/scan');
    await refreshAll();
    showToast('Market scan completed');
  });

  $('startBtn').addEventListener('click', async () => {
    await api('/start-trading', { method: 'POST' });
    await refreshStatus();
    showToast('Bot started');
  });

  $('stopBtn').addEventListener('click', async () => {
    await api('/stop-trading', { method: 'POST' });
    await refreshStatus();
    showToast('Bot stopped');
  });

  $('simBtn').addEventListener('click', async () => {
    await api('/toggle-simulation', { method: 'POST' });
    await refreshStatus();
    showToast('Simulation mode toggled');
  });

  $('themeToggle').addEventListener('click', () => document.body.classList.toggle('light'));
  $('closeModal').addEventListener('click', () => $('analysisModal').classList.remove('show'));
  $('soundToggle').addEventListener('click', () => {
    state.sound = !state.sound;
    showToast(`Sound ${state.sound ? 'enabled' : 'disabled'}`);
  });
}

async function refreshStatus() {
  const status = await api('/status');
  renderMetrics(status);
}

async function refreshMarkets() {
  const data = await api('/markets');
  state.markets = data.markets || [];
  renderMarkets();
}

async function refreshSignals() {
  const data = await api('/signals');
  state.signals = (data.signals || []).map((s, i) => ({
    ...s,
    type: i % 4 === 0 ? 'Arb' : i % 4 === 1 ? 'Momentum' : i % 4 === 2 ? 'Shark' : 'News',
  }));
  renderSignals();

  state.sharks = state.signals
    .filter((_, i) => i % 3 === 0)
    .slice(0, 8)
    .map((s, i) => ({
      avatar: ['🐋', '🦈', '🐳'][i % 3],
      size: (1500 + Math.random() * 8000).toFixed(0),
      market: s.market || 'Unknown',
      time: `${1 + i}m ago`,
    }));
  renderSharks();
}

async function refreshAll() {
  await Promise.all([refreshStatus(), refreshMarkets(), refreshSignals()]);
}

function connectWebSocket() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const socket = new WebSocket(`${protocol}://${location.host}/ws/live`);

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.status) renderMetrics(payload.status);
    if (payload.ticker) $('ticker').textContent = payload.ticker.join('  •  ');
  };

  socket.onclose = () => setTimeout(connectWebSocket, 3000);
}

function init() {
  initControls();
  initTabs();
  initDnD();
  initChat();
  initCursorGlow();
  renderStrategies();
  renderNews();
  refreshAll();
  connectWebSocket();
  setInterval(() => refreshSignals().catch(() => {}), 12000);
}

init();
