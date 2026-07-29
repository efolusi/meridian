// Bilingual (en/id) layer for the docs site — decoupled from the DCLogic runtime.
//
// It never touches page logic. Any leaf element authored with a `data-lang-id`
// attribute keeps its English text inline and carries the Indonesian text in the
// attribute; this script swaps the two when the language changes. The language
// button(s) are plain markup with class `site-lang`, wired here by delegation.
//
// Because DCLogic re-renders rebuild elements from the template (restoring the
// English text and the data-lang-id attribute), a debounced MutationObserver
// re-applies the swap after any re-render, so translations survive interaction.
//
// Only tag LEAF text elements with data-lang-id — swapping textContent on an
// element with child elements would drop the children. Wrap mixed content in a
// <span data-lang-id="…"> around just the text.
(function () {
  var KEY = 'efolusi-site-lang';
  var lang = 'en';
  try { lang = localStorage.getItem(KEY) || 'en'; } catch (e) {}
  if (lang !== 'id' && lang !== 'en') lang = 'en';

  function apply(root) {
    var nodes = (root || document).querySelectorAll('[data-lang-id]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // Capture the authored English once per (re-rendered) element.
      if (el.__i18nEn == null) el.__i18nEn = el.textContent;
      var next = lang === 'id' ? el.getAttribute('data-lang-id') : el.__i18nEn;
      if (next != null && el.textContent !== next) el.textContent = next;
    }
  }

  function updateToggles() {
    var btns = document.querySelectorAll('.site-lang');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = lang === 'id' ? 'EN' : 'ID';
      btns[i].setAttribute('aria-label', lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia');
      btns[i].setAttribute('title', btns[i].getAttribute('aria-label'));
    }
  }

  function setLang(next) {
    lang = next === 'id' ? 'id' : 'en';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    updateToggles();
    apply(document);
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.site-lang') : null;
    if (t) { e.preventDefault(); setLang(lang === 'id' ? 'en' : 'id'); }
  });

  var pending = false;
  var mo = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      apply(document);
      updateToggles();
    });
  });

  function init() {
    document.documentElement.setAttribute('lang', lang);
    updateToggles();
    apply(document);
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.EfLang = { get: function () { return lang; }, set: setLang, toggle: function () { setLang(lang === 'id' ? 'en' : 'id'); } };
})();
