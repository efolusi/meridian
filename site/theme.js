// The docs site's theme, shared with every Efolusi site through ThemeToggle's
// storage: the efolusi_theme cookie, then localStorage, then the system setting.
// The first line is themeInitScript() from components/marketing/ThemeToggle.jsx,
// verbatim (tests/site-theme.test.mjs), so it runs before the first paint.
(function(){try{var m=document.cookie.match(/(?:^|;\s*)efolusi_theme=([^;]+)/),p=m&&decodeURIComponent(m[1]);if(p!=='light'&&p!=='dark'&&p!=='system'){p=null;try{p=localStorage.getItem('efolusi-theme')}catch(e){}}if(p!=='light'&&p!=='dark')p=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(p==='dark')document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme')}catch(e){}})();
(function () {
  var ORDER = ['light', 'dark', 'system'];
  var LABELS = {
    en: { system: 'System theme', light: 'Light theme', dark: 'Dark theme', next: 'switch to' },
    id: { system: 'Tema sistem', light: 'Tema terang', dark: 'Tema gelap', next: 'ganti ke' }
  };
  function ds() { return window.EfolusiDesignSystem_4ffc3d; }
  function pref() { return ds() ? ds().readThemePreference() : 'system'; }
  function label() {
    var p = pref();
    var t = LABELS[(window.EfLang && window.EfLang.get()) === 'id' ? 'id' : 'en'];
    var n = ORDER[(ORDER.indexOf(p) + 1) % ORDER.length];
    document.documentElement.setAttribute('data-theme-preference', p);
    var text = t[p] + ', ' + t.next + ' ' + t[n].toLowerCase();
    document.querySelectorAll('.site-theme').forEach(function (b) { b.setAttribute('aria-label', text); b.setAttribute('title', t[p]); });
  }
  window.EfSiteTheme = {
    // Moves Light -> Dark -> System and returns the theme now shown.
    cycle: function () {
      var next = ORDER[(ORDER.indexOf(pref()) + 1) % ORDER.length];
      ds().writeThemePreference(next);
      var shown = ds().applyTheme(next);
      label();
      return shown;
    },
    label: label
  };
  // On System, follow the operating system live.
  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (ds() && pref() === 'system') ds().applyTheme('system');
    });
  }
  document.addEventListener('DOMContentLoaded', label);
  window.addEventListener('load', label);
})();
