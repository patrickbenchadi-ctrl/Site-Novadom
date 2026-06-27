/* =========================================================================
   NOVADOM — Page « Merci » (déclenchée APRÈS le paiement Stripe)
   - lit la commande stockée
   - déclenche l'envoi : contrat SPÉCIMEN au client + demande de vérification à Novadom
   ========================================================================= */
(function () {
  var C = window.NOVADOM;
  if (!C || !document.getElementById('merci')) return;

  var order = null;
  try { order = JSON.parse(localStorage.getItem('novadom_order') || 'null'); } catch (e) {}

  var status = document.getElementById('send-status');
  var ref = new URLSearchParams(location.search).get('ref') || (order && order.reference) || '—';
  var refEl = document.getElementById('merci-ref'); if (refEl) refEl.textContent = ref;

  // Récap + aperçu du contrat spécimen
  if (order) {
    var c = document.getElementById('merci-contract');
    if (c) c.querySelector('.contract-doc-wrap').innerHTML = C.genererContrat(order);
    var email = document.getElementById('merci-email');
    if (email) email.textContent = order.emailClient || 'votre adresse e-mail';

    var dl = document.getElementById('dl-contract');
    if (dl) dl.addEventListener('click', function () {
      var doc = window.NOVADOM.genererContratPDF ? window.NOVADOM.genererContratPDF(order) : null;
      if (doc) { doc.save(window.NOVADOM.nomFichierContrat(order)); }
      else { downloadContractHTML(order); }
    });
  }

  // Envoi de l'événement « paid » → l'automatisation envoie les e-mails
  function setStatus(cls, txt, icon) {
    if (!status) return;
    status.className = 'send-status ' + cls;
    status.innerHTML = (icon || '') + '<span>' + txt + '</span>';
  }
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
  var spin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 109 9"/></svg>';
  var warn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>';

  setStatus('pending', 'Envoi du contrat en cours…', spin);

  var payload = {
    event: 'paid',
    reference: ref,
    emailClient: order && order.emailClient,
    nomClient: order && ((order.prenom || '') + ' ' + (order.nom || '')).trim(),
    raisonSociale: order && order.raisonSociale,
    mensuelHT: order && order.mensuelHT,
    contractHtml: order && order.contractHtml
  };

  // Joindre le contrat en PDF (base64) pour l'e-mail au client + dossier Novadom
  try {
    if (order && window.NOVADOM.genererContratPDF) {
      var pdfDoc = window.NOVADOM.genererContratPDF(order);
      if (pdfDoc) {
        payload.contractPdfBase64 = pdfDoc.output('datauristring').split(',')[1];
        payload.contractPdfName = window.NOVADOM.nomFichierContrat(order);
      }
    }
  } catch (e) { /* le PDF n'est pas bloquant pour l'envoi */ }

  if (C.endpointEnvoi) {
    fetch(C.endpointEnvoi, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) {
        if (r.ok) setStatus('ok', 'Contrat (spécimen) envoyé à ' + (payload.emailClient || 'votre e-mail'), check);
        else setStatus('err', 'Envoi à confirmer — notre équipe vous recontacte sous 24 h.', warn);
      })
      .catch(function () {
        setStatus('err', 'Envoi à confirmer — notre équipe vous recontacte sous 24 h.', warn);
      });
  } else {
    // Mode démonstration (aucun endpoint configuré)
    setTimeout(function () {
      setStatus('ok', 'Démo : contrat spécimen « envoyé » à ' + (payload.emailClient || 'votre e-mail'), check);
    }, 900);
  }

  /* Téléchargement du contrat spécimen (fichier HTML imprimable) */
  function downloadContractHTML(o) {
    var wm = '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0">' +
      '<span style="font:600 90px Georgia,serif;color:rgba(182,136,63,.14);transform:rotate(-24deg);letter-spacing:.1em;text-transform:uppercase">Spécimen</span></div>';
    var css = '<style>body{font-family:Georgia,serif;color:#2a3550;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.7;position:relative}' +
      'h1{font-size:22px;text-align:center}.sub{text-align:center;color:#777;font-size:12px}' +
      'h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#8A6526;border-bottom:1px solid #eee;padding-bottom:4px;margin-top:20px}' +
      '.party{background:#f6f1e6;border-radius:8px;padding:10px 14px;margin-bottom:8px}.fill{font-weight:700;background:rgba(182,136,63,.12);padding:1px 4px;border-radius:3px}' +
      'table.rc{width:100%;border-collapse:collapse}table.rc td{border:1px solid #e2dccb;padding:6px 9px;font-size:12px}.sign{display:flex;gap:30px;margin-top:24px}.sign div{border-top:1px solid #ccc;padding-top:6px;font-size:11px;flex:1}</style>';
    var html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Contrat SPÉCIMEN ' + ref + ' — NOVADOM</title>' + css + '</head><body>' + wm + C.genererContrat(o) + '</body></html>';
    var blob = new Blob([html], { type: 'text/html' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contrat-domiciliation-SPECIMEN-' + ref + '.html';
    document.body.appendChild(a); a.click(); a.remove();
  }
})();
