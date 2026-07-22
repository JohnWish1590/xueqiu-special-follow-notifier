// content.js — 运行在 xueqiu.com 页面内部
//
// 核心作用：接收 background/options 发来的消息，在雪球页面上下文里执行 fetch。
// 因为 fetch 的发起源是 xueqiu.com（同站），浏览器会自动附带所有 Cookie（含 httpOnly），
// 彻底绕开 chrome-extension:// 跨站、SameSite 限制、以及手动复制 Cookie 的所有问题。
//
// 消息协议：
//   { type: 'xqFetch', url: '...' } → fetch(url) 并返回 { ok, status, text, error }

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'xqFetch') return; // 不是给我的消息，忽略

  // 用 async 但同步返回 true 告诉 Chrome 我们会异步 sendResponse
  (async () => {
    try {
      const res = await fetch(msg.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://xueqiu.com/',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const text = await res.text();
      sendResponse({ ok: true, status: res.status, text });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();

  return true; // 保持消息通道开放，等待异步 sendResponse
});
