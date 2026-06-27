/* =========================================================================
   NOVADOM — Module d'envoi d'e-mails (avec pièces jointes)
   Utilise Web3Forms si une clé est configurée (window.NOVADOM.web3formsKey).
   Les e-mails (et les fichiers joints) arrivent dans la boîte associée à la clé.
   ========================================================================= */
window.NDmail = (function () {
  var C = window.NOVADOM || {};
  function key() { return ((C.web3formsKey) || '').trim(); }

  function send(opts) {
    opts = opts || {};
    var fd = new FormData();
    fd.append('access_key', key());
    fd.append('subject', opts.subject || 'Message — site Novadom');
    fd.append('from_name', opts.fromName || 'Site Novadom');
    if (opts.replyTo) fd.append('replyto', opts.replyTo);

    var f = opts.fields || {};
    Object.keys(f).forEach(function (k) { fd.append(k, f[k] == null ? '' : String(f[k])); });

    (opts.files || []).forEach(function (file, i) {
      if (file) {
        var name = file.name || ('fichier-' + (i + 1));
        fd.append('attachment_' + (i + 1) + '_' + name, file, name);
      }
    });

    return fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          return { ok: r.ok && j.success !== false, data: j };
        });
      });
  }

  return {
    enabled: function () { return !!key(); },
    send: send
  };
})();
