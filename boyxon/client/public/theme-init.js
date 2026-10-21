// Boyxon Oshxonasi — FOUC oldini olish: default DARK, faqat foydalanuvchi 'light' tanlasa yorug'
(function () {
  try {
    var t = localStorage.getItem('boyxon-theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();