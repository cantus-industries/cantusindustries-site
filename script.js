// Script to handle theme toggle for cantusindustries.com

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      // Get current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      let newTheme = 'light';
      
      if (currentTheme === 'light') {
        newTheme = 'dark';
      }
      
      // Update DOM
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
    });
  }

  // Listen for system theme changes if user hasn't set a manual override
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  });
});



// Desk agent panel (spec section 6). Degrades to the offline message on any
// failure path - the page never breaks because the agent does.
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('askInput');
  const btn = document.getElementById('askBtn');
  const box = document.getElementById('answer');
  if (!input || !btn || !box) return;
  const aText = box.querySelector('.a-text');
  const aSrc = box.querySelector('.a-src');
  const OFFLINE = 'The desk agent is offline - email us instead: cantusteam@cantusindustries.com';

  document.querySelectorAll('.desk-chip').forEach((c) => {
    c.addEventListener('click', () => {
      input.value = c.getAttribute('data-q');
      input.focus();
    });
  });

  function show(text, src) {
    box.style.display = 'block';
    aText.textContent = text;
    aSrc.textContent = src || '';
  }

  function ask() {
    const q = (input.value || '').trim();
    if (!q) return;
    btn.disabled = true;
    show('\u2026', '');
    fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then((d) => {
        if (d && d.answer) {
          show(d.answer, 'Answered from the public corpus \u00b7 ' + (d.source || 'site materials') + '. For anything else: cantusteam@cantusindustries.com');
        } else {
          show(OFFLINE, '');
        }
      })
      .catch(() => show(OFFLINE, ''))
      .finally(() => { btn.disabled = false; });
  }
  btn.addEventListener('click', ask);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });
});