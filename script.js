// スマホ用メニュー
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
  nav.classList.toggle('is-open', !open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'メニューを開く');
  nav.classList.remove('is-open');
}));

// タブ切り替え
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => {
    const active = t === tab;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
    document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
  });
}));

// 香りチェック
const checks = document.querySelectorAll('#checklist input');
const result = document.getElementById('checkResult');
const messages = [
  'すでに香りにやさしい暮らしです。まわりの人にもこのサイトを紹介してみてください。',
  'あと少し！ チェックがついた項目を、使い切ったタイミングで無香料に切り替えてみましょう。',
  'まずは柔軟剤から見直すのがおすすめ。いちばん影響が大きく、効果を実感しやすいポイントです。',
  '香りに囲まれた暮らしかもしれません。上の「はじめ方」から、できることをひとつ選んでみましょう。'
];
checks.forEach(c => c.addEventListener('change', () => {
  const n = [...checks].filter(x => x.checked).length;
  const idx = n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : 3;
  result.textContent = `チェック ${n} 個：${messages[idx]}`;
}));

// トップへ戻るボタン
const toTop = document.querySelector('.to-top');
const header = document.querySelector('.site-header');
const onScroll = () => {
  toTop.classList.toggle('is-visible', window.scrollY > 600);
  header.classList.toggle('is-scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// スクロールでふわっと表示
const targets = document.querySelectorAll('.intro-quote, .intro-body, .split-head, .split-body > p, .note-card, .symptom-list li, .dark-card, .peach, .practice-close, .laundry-title, .agent-list li, .source, .step, .check-inner, .tabs, .banner-en, .banner-text, .faq details');
targets.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-shown'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
targets.forEach(el => io.observe(el));

// ご意見ボックス
const fbForm = document.getElementById('feedbackForm');
if (fbForm) {
  const fbStatus = document.getElementById('feedbackStatus');
  const fbButton = document.getElementById('feedbackSubmit');
  const fbCount = document.getElementById('feedbackCount');
  const fbMessage = fbForm.elements.message;
  fbMessage.addEventListener('input', () => { fbCount.textContent = fbMessage.value.length; });

  fbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = fbMessage.value.trim();
    if (!message) {
      fbStatus.textContent = 'ご意見・ご感想を入力してください。';
      fbStatus.dataset.state = 'error';
      fbMessage.focus();
      return;
    }
    fbButton.disabled = true;
    fbStatus.textContent = '送信しています…';
    fbStatus.dataset.state = '';
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: fbForm.elements.nickname.value,
          message,
          website: fbForm.elements.website.value,
        }),
      });
      if (!r.ok) throw new Error('failed');
      fbForm.reset();
      fbCount.textContent = '0';
      fbStatus.textContent = 'ありがとうございました。ご意見を受け付けました。';
      fbStatus.dataset.state = 'done';
    } catch {
      fbStatus.textContent = '送信できませんでした。時間をおいて、もう一度お試しください。';
      fbStatus.dataset.state = 'error';
    } finally {
      fbButton.disabled = false;
    }
  });
}
