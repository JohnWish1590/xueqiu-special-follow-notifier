// popup.js
function fmt(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function render() {
  chrome.runtime.sendMessage({ type: 'getStatus' }, (d) => {
    document.getElementById('cnt').textContent = d.trackedCount || 0;
    document.getElementById('last').textContent = fmt(d.lastRunAt || d.lastCheck);
    // 未读数
    const unread = (d.recent || []).filter(x => !x.read).length;
    document.getElementById('unread').textContent = unread;
    // 错误信息
    const errrow = document.getElementById('errrow');
    if (d.lastError) { errrow.style.display = 'block'; document.getElementById('err').textContent = d.lastError; }
    else errrow.style.display = 'none';
    // 抓取诊断：每用户解析到的条数
    const diag = document.getElementById('diag');
    const pu = d.perUser || {};
    const ids = Object.keys(pu);
    if (ids.length) {
      const parts = ids.map(id => {
        const p = pu[id];
        return p.ok ? `${p.name || id}(${p.parsed})` : `${p.name || id}:错误`;
      });
      diag.textContent = '抓取: ' + parts.join(' · ');
      diag.style.color = ids.some(id => !pu[id].ok) ? '#c00' : '#777';
    } else {
      diag.textContent = '（尚未运行或无人可监控）';
    }
    const box = document.getElementById('recent');
    box.innerHTML = '';
    const list = d.recent || [];
    if (!list.length) {
      box.innerHTML = '<div class="empty">暂无新帖记录。新帖会以系统通知弹出。</div>';
      return;
    }
    list.slice(0, 8).forEach(p => {
      const el = document.createElement('div');
      el.className = 'post';
      el.innerHTML = `<div><span class="name">${p.name || '雪球'}</span> <span class="t">${fmt(p.ts)}</span></div>` +
                     `<div class="txt">${p.text || ''}</div>`;
      box.appendChild(el);
    });
  });
}

document.getElementById('check').addEventListener('click', () => {
  const btn = document.getElementById('check');
  btn.textContent = '检查中…';
  chrome.runtime.sendMessage({ type: 'checkNow' }, () => {
    btn.textContent = '立即检查一次';
    render();
  });
});

document.getElementById('open-alert').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'openAlert' }, () => window.close());
});

document.getElementById('options').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

render();
