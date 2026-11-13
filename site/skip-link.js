// "Skip to content" for the docs site. Every page carries the link as its first
// focusable element (<a class="site-skip" href="#main">) and gives its <main>
// id="main" tabIndex="-1" so focus can land there.
//
// The jump is done here rather than by the browser's own fragment navigation:
// Docs and Components route on location.hash, and Docs treats an unknown hash
// as "show the first section", so letting #main reach the URL would throw a
// reader on Installation back to Introduction. Moving focus directly also
// works in browsers that scroll to a fragment without moving focus.
(function () {
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('.site-skip') : null;
    if (!link) return;
    var target = document.getElementById((link.getAttribute('href') || '').slice(1));
    if (!target) return;
    e.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  });
})();
