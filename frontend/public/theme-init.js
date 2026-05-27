(function () {
  var t = localStorage.getItem('bba-theme');
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
})();
