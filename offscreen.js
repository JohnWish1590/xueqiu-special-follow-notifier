// offscreen.js — 离屏文档：在后台播放新帖提示音（Web Audio 蜂鸣，无需音频文件）
// 由于 service worker 没有 Web Audio，MV3 规定此类音频必须放到离屏文档里播放。

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

// 两段式“滴-滴”蜂鸣，醒目且不刺耳
function beep() {
  const ctx = getCtx();
  if (!ctx) return Promise.reject(new Error('no AudioContext'));
  return ctx.resume().then(() => {
    const now = ctx.currentTime;
    const tones = [
      { f: 880, t: 0.0, d: 0.12 },
      { f: 1175, t: 0.16, d: 0.14 },
    ];
    for (const tone of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = tone.f;
      const start = now + tone.t;
      const end = start + tone.d;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  });
}

// TTS 兜底：万一 Web Audio 被自动播放策略拦住，用系统朗读保证“有响动”
function speak() {
  try {
    const u = new SpeechSynthesisUtterance('雪球特别关注，有新帖');
    u.lang = 'zh-CN';
    u.rate = 1.05;
    speechSynthesis.speak(u);
  } catch (e) { /* 忽略 */ }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'beep') {
    beep().then(() => sendResponse({ ok: true })).catch(() => {
      speak();
      sendResponse({ ok: true, fallback: 'tts' });
    });
    return true;
  }
});
