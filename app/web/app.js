async function scanMarkets() {
  const response = await fetch('/scan');
  if (!response.ok) throw new Error('Failed to scan markets');
  return response.json();
}

async function fetchSignals() {
  const response = await fetch('/signals');
  if (!response.ok) throw new Error('Failed to fetch signals');
  return response.json();
}

async function startTrading() {
  const response = await fetch('/start-trading', { method: 'POST' });
  if (!response.ok) throw new Error('Failed to start trading');
  return response.json();
}

function renderSignals(signals) {
  const list = document.getElementById('signalsList');
  list.innerHTML = '';

  if (!signals.length) {
    list.innerHTML = '<li>לא נמצאו סיגנלים כרגע.</li>';
    return;
  }

  for (const signal of signals.slice(0, 6)) {
    const edge = Number(signal.edge_percentage ?? 0).toFixed(2);
    const market = signal.market_slug || signal.market_id || 'Market';
    const li = document.createElement('li');
    li.textContent = `${market} — יתרון ${edge}%`;
    list.appendChild(li);
  }
}

async function refreshSignalsView() {
  const data = await fetchSignals();
  renderSignals(data.signals || []);
  document.getElementById('signalsCount').textContent = (data.signals || []).length;
}

document.getElementById('scanBtn').addEventListener('click', async () => {
  try {
    const data = await scanMarkets();
    document.getElementById('marketsCount').textContent = data.markets_scanned;
    document.getElementById('signalsCount').textContent = data.signals_found;
    await refreshSignalsView();
  } catch (error) {
    document.getElementById('signalsList').innerHTML = `<li>שגיאה בסריקה: ${error.message}</li>`;
  }
});

document.getElementById('startBtn').addEventListener('click', async () => {
  try {
    const data = await startTrading();
    document.getElementById('tradeStatus').textContent = data.trading_enabled ? 'פעיל' : 'מושהה';
    await refreshSignalsView();
  } catch (error) {
    document.getElementById('tradeStatus').textContent = `שגיאה: ${error.message}`;
  }
});
