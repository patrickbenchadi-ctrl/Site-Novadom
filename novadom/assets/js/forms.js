/* =========================================================================
   NOVADOM — Formulaires Contact & Demande de rappel
   - envoie via Formspree si window.NOVADOM.formspree est renseigné
   - sinon, ouvre le logiciel d'e-mail du visiteur (repli sans inscription)
   ========================================================================= */
(function () {
  var C = window.NOVADOM || {};
  var forms = document.querySelectorAll('form[data-form]');
  if (!forms.length) return;

  function endpoint() {
    var f = (C.formspree || '').trim();
    if (!f) return '';
    return /^https?:\/\//.test(f) ? f : 'https://formspree.io/f/' + f;
  }

  function collect(form) {
    var data = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.id) return;
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

      data._sujet = (type === 'rappel')
        ? 'Demande de rappel — site Novadom'
        : 'Nouveau message — site Novadom';

      var url = endpoint();
      var btn = form.querySelector('button[type=submit]');
      var btnTxt = btn ? btn.textContent : '';

      // --- Repli sans Formspree : ouverture du logiciel d'e-mail ---
      if (!url) {
        var dest = (C.societe && C.societe.email) || '';
        var corps = Object.keys(data).filter(function (k) { return k[0] !== '_'; })
          .map(function (k) { return k + ' : ' + data[k]; }).join('\n');
        window.location.href = 'mailto:' + dest + '?subject=' + encodeURIComponent(data._sujet) + '&body=' + encodeURIComponent(corps);
        setStatus(form, 'ok', 'Votre logiciel de messagerie va s\u2019ouvrir pour finaliser l\u2019envoi.');
        return;
      }

      // --- Envoi via Formspree ---
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus(form, 'ok', type === 'rappel'
            ? 'Merci ! Nous vous rappelons très vite.'
            : 'Merci ! Votre message a bien été envoyé.');
        } else {
          setStatus(form, 'err', 'Une erreur est survenue. Réessayez ou appelez-nous au ' + ((C.societe && C.societe.tel) || ''));
        }
      }).catch(function () {
        setStatus(form, 'err', 'Connexion impossible. Réessayez ou appelez-nous au ' + ((C.societe && C.societe.tel) || ''));
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnTxt; }
      });
    });
  });
})();
