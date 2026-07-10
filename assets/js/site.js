// Settlers of Mars — shared site behaviour
(function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // Highlight the current page in the nav
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var target = a.getAttribute('href');
    if (target === here || (here === 'index.html' && target === './')) {
      a.classList.add('active');
    }
  });

  // Copy-to-clipboard for prompt blocks
  document.querySelectorAll('.prompt .copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.prompt').querySelector('pre');
      if (!pre) return;
      var text = pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var old = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(function () { btn.textContent = old; }, 1600);
      }).catch(function () {
        // Fallback: select the text so the user can copy manually
        var range = document.createRange();
        range.selectNodeContents(pre);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  });
})();
