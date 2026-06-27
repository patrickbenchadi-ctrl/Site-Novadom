/* =========================================================================
   NOVADOM — Formulaires Contact & Demande de rappel
   - envoie via Formspree si window.NOVADOM.formspree est renseigné
   - sinon, ouvre le logiciel d'e-mail du visiteur (repli sans inscription)
   ========================================================================= */
(function () {
  var C = window.NOVADOM || {};
  var forms = document.querySelectorAll('form[data-form]');
  if (!forms.length) return;

  // Détermine le service d'envoi : Formspree si configuré, sinon FormSubmit
  // (sans inscription, vers l'e-mail de la société), sinon repli mailto.
  function endpoint() {
    var f = (C.formspree || '').trim();
    if (f) return { url: /^https?:\/\//.test(f) ? f : 'https://formspree.io/f/' + f, kind: 'formspree' };
    var mail = ((C.societe && C.societe.email) || '').trim();
    if (mail) return { url: 'https://formsubmit.co/ajax/' + encodeURIComponent(mail), kind: 'formsubmit' };
    return { url: '', kind: 'mailto' };
  }

  function collect(form) {
    var data = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.id || el.type === 'file') return;
      var key = el.id.replace(/^[cr]-/, '');
      data[key] = el.value.trim();
    });
    return data;
  }

  function setStatus(form, cls, msg) {
    var s = form.querySelector('.form-status');
    if (!s) return;
    s.className = 'form-status ' + cls;
    s.textContent = msg;
    s.style.display = 'block';
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var type = form.getAttribute('data-form'); // contact | rappel
      var data = collect(form);

      // Validation : champs requis + formats normalisés (e-mail, téléphone…)
      var missing = [];
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        var emptyReq = el.hasAttribute('data-required') && !el.value.trim();
        var badFmt = el.hasAttribute('data-format') && el.value.trim() && window.NDvalid && !window.NDvalid.check(el);
        if (emptyReq || badFmt) { el.classList.add('invalid'); missing.push(el); }
        else { el.classList.remove('invalid'); }
      });
      if (missing.length) {
        var first = missing[0];
        var msg = (first.hasAttribute('data-format') && first.value.trim() && window.NDvalid)
          ? window.NDvalid.message(first)
          : 'Merci de compléter les champs obligatoires.';
        setStatus(form, 'err', msg); first.focus(); return;
      }

      var subject = (type === 'rappel') ? 'Demande de rappel — site Novadom' : 'Nouveau message — site Novadom';
      data._sujet = subject;

      var btn = form.querySelector('button[type=submit]');
      var btnTxt = btn ? btn.textContent : '';
      var files = [];
      form.querySelectorAll('input[type=file]').forEach(function (inp) {
        for (var i = 0; i < inp.files.length; i++) files.push(inp.files[i]);
      });
      var okMsg = (type === 'rappel') ? 'Merci ! Nous vous rappelons très vite.' : 'Merci ! Votre message a bien été envoyé.';
      var errMsg = 'Une erreur est survenue. Réessayez ou appelez-nous au ' + ((C.societe && C.societe.tel) || '');

      // 1) Web3Forms (avec pièces jointes) si une clé est configurée
      if (window.NDmail && window.NDmail.enabled()) {
        if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
        window.NDmail.send({ subject: subject, fromName: 'Contact Novadom', replyTo: data.email, fields: data, files: files })
          .then(function (res) {
            if (res.ok) { form.reset(); setStatus(form, 'ok', okMsg); }
            else setStatus(form, 'err', errMsg);
          })
          .catch(function () { setStatus(form, 'err', errMsg); })
          .finally(function () { if (btn) { btn.disabled = false; btn.textContent = btnTxt; } });
        return;
      }

      // 2) Sinon, service simple (sans pièce jointe) ou ouverture de la messagerie
      var ep = endpoint();
      if (ep.kind === 'mailto') {
        var dest = (C.societe && C.societe.email) || '';
        var corps = Object.keys(data).filter(function (k) { return k[0] !== '_'; })
          .map(function (k) { return k + ' : ' + data[k]; }).join('\n');
        window.location.href = 'mailto:' + dest + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(corps);
        setStatus(form, 'ok', 'Votre logiciel de messagerie va s\u2019ouvrir pour finaliser l\u2019envoi.');
        return;
      }
      if (files.length) setStatus(form, 'err', 'L\u2019envoi de pièces jointes nécessite la clé Web3Forms (voir le guide).');
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      if (ep.kind === 'formsubmit') { data._captcha = 'false'; data._subject = subject; data._template = 'table'; }
      fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { form.reset(); setStatus(form, 'ok', okMsg); }
        else setStatus(form, 'err', errMsg);
      }).catch(function () {
        setStatus(form, 'err', errMsg);
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnTxt; }
      });
    });
  });
})();
