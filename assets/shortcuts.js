/* shortcuts.shareyourgroup.com: filter on a program page, search across all programs on the home page, print */
(function () {
  'use strict';
  var d = document, esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  d.addEventListener('click', function (e) { if (e.target.closest('[data-print]')) window.print(); });
  function match(k, words) { for (var j = 0; j < words.length; j++) if (k.indexOf(words[j]) < 0) return false; return true; }
  function kbd(keys) {
    return keys.split(/( or |, | then )/).map(function (a) { return / or |, | then /.test(a) && a.length < 7 ? ' <span class="or">' + a.trim() + '</span> ' : a.split(' + ').map(function (k) { return '<kbd>' + esc(k) + '</kbd>'; }).join(' + '); }).join('');
  }
  var q = d.getElementById('kq');
  if (q) {
    var rows = d.querySelectorAll('table.keys tbody tr'), count = d.querySelector('[data-kcount]');
    q.addEventListener('input', function () {
      var words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), n = 0;
      for (var i = 0; i < rows.length; i++) { var ok = match(rows[i].getAttribute('data-k'), words); rows[i].hidden = !ok; if (ok) n++; }
      var boxes = d.querySelectorAll('.kt');
      for (var b = 0; b < boxes.length; b++) {
        var show = !!boxes[b].querySelector('tbody tr:not([hidden])'), h = boxes[b].previousElementSibling;
        boxes[b].hidden = !show;
        while (h && !/^H[23]$/.test(h.tagName)) h = h.previousElementSibling;
        if (h && words.length) h.hidden = !show; else if (h) h.hidden = false;
      }
      count.textContent = words.length ? (n ? n + ' shortcut' + (n === 1 ? '' : 's') + ' found' : 'Nothing found on this page. Try another word, or search every program from the home page.') : '';
    });
  }
  var s = d.getElementById('sq');
  if (s) {
    var data = null, loading = null, res = d.querySelector('[data-sres]'), sc = d.querySelector('[data-scount]'), base = sc.textContent;
    var run = function () {
      var words = s.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (!words.length) { res.innerHTML = ''; sc.textContent = base; return; }
      var hits = [];
      for (var i = 0; i < data.length && hits.length < 60; i++) {
        var r = data[i];
        if (match((r[0] + ' ' + r[2] + ' ' + r[3] + ' ' + r[4] + ' ' + r[5]).toLowerCase(), words)) hits.push(r);
      }
      sc.textContent = hits.length ? (hits.length === 60 ? 'First 60 matches. Add a word to narrow them.' : hits.length + ' match' + (hits.length === 1 ? '' : 'es')) : 'Nothing found. Try a simpler word, such as "copy", "tab" or "screenshot".';
      res.innerHTML = hits.length ? '<ul>' + hits.map(function (r) {
        return '<li><b>' + esc(r[5]) + '</b><span>' + kbd(r[3]) + (r[4] ? ' <small>Mac:</small> ' + kbd(r[4]) : '') + '</span><a href="/' + r[1] + '/">' + esc(r[0]) + '</a></li>';
      }).join('') + '</ul>' : '';
    };
    s.addEventListener('input', function () {
      if (data) return run();
      if (!loading) loading = fetch('/data/keys.json').then(function (r) { return r.json(); }).then(function (j) { data = j; run(); }).catch(function () { sc.textContent = 'The list could not load. Check your connection.'; loading = null; });
    });
  }
})();
