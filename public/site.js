// Shared by every page: admin-panel text, team list, and the "draft your enquiry" builder.
(function(){
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmt = s => esc(s).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\r?\n/g,'<br>');
  const form = $('#builder');

  // ---- Content from the admin panel ----
  function apply(data){
    const text = data.text || {};
    document.querySelectorAll('[data-k]').forEach(el => {
      const v = text[el.dataset.k];
      if (typeof v === 'string' && v.trim()) el.innerHTML = fmt(v.trim());
    });
    const box = $('#people');
    if (box && Array.isArray(data.team) && data.team.length){
      box.innerHTML = data.team.map(p => '<div class="person"><div class="mono-av" aria-hidden="true">' +
        esc(((p.name||'').trim().charAt(0) || '?').toUpperCase()) + '</div><b>' + esc(p.name||'') + '</b><span>' + esc(p.role||'') + '</span></div>').join('');
      box.classList.toggle('many', data.team.length > 3);
    }
    if (form) renderMsg();
  }
  fetch('/api/content').then(r => r.ok ? r.json() : null).then(d => { if (d) apply(d); }).catch(() => {});

  // ---- Contact helpers ----
  const flash = (el, t) => { el.textContent = t; setTimeout(() => el.textContent = '', 2600); };
  const copy = (text, st) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => flash(st,'Copied'), () => flash(st,'Select the text and press Ctrl/⌘ + C'));
    else flash(st,'Select the text and press Ctrl/⌘ + C');
  };
  if ($('#copyEmail')) $('#copyEmail').addEventListener('click', () => copy($('#email').textContent.trim(), $('#emailStatus')));

  if (!form) return;
  // Each page sets its own email subject and opening line on the form (data-subject, data-intro).
  function msg(){
    const svcs = [...form.querySelectorAll('.opts input:checked')].map(i => '  • ' + i.value);
    const org = $('#f-org').value.trim(), note = $('#f-note').value.trim();
    const intro = form.dataset.intro || 'are looking for support with:';
    return {
      to: $('#email').textContent.trim(),
      subject: (form.dataset.subject || 'Enquiry') + (org ? ' — ' + org : ''),
      body: 'Hello Agami Group,\n\n' + (org ? 'We are ' + org + ' and we' : 'We') + ' ' + intro + '\n' +
        (svcs.length ? svcs.join('\n') : '  • (select options above)') + (note ? '\n\n' + note : '') + '\n\nPlease let us know the next steps.\n'
    };
  }
  function renderMsg(){ const m = msg(); $('#preview').textContent = 'To: ' + m.to + '\nSubject: ' + m.subject + '\n\n' + m.body; }
  form.addEventListener('input', renderMsg); form.addEventListener('change', renderMsg);
  form.addEventListener('submit', e => { e.preventDefault(); const m = msg();
    location.href = 'mailto:' + m.to + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body); });
  $('#copyMsg').addEventListener('click', () => copy(msg().body, $('#msgStatus')));
  renderMsg();
})();
