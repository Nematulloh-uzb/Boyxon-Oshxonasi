// Boyxon Oshxonasi — yangi deploydan keyin eski JS chunk topilmasa,
// sahifani bir marta avtomatik yangilaymiz (yangi HTML yangi chunk nomlarini beradi).
// Alohida fayl: CSP `script-src 'self'` inline skriptlarni bloklaydi.
(function () {
  var KEY = 'boyxon-chunk-reload';
  function reloadOnce() {
    try {
      var last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last < 15000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch (e) {
      /* private mode */
    }
    window.location.reload();
  }
  window.addEventListener('vite:preloadError', function (event) {
    event.preventDefault();
    reloadOnce();
  });
  window.addEventListener(
    'error',
    function (event) {
      var el = event.target;
      if (el && el.tagName === 'SCRIPT' && el.src && el.src.indexOf('/assets/') !== -1) {
        reloadOnce();
      }
    },
    true,
  );
})();
