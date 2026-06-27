/* =========================================================================
   NOVADOM — Moteur du tunnel de commande
   Dépend de config.js (window.NOVADOM)
   ========================================================================= */
(function () {
  var C = window.NOVADOM;
  if (!C || !document.getElementById('tunnel')) return;

  var euro = function (n) { return (Math.round((n || 0) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'; };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var state = { step: 1, files: {} };
  var TOTAL_STEPS = 5;

  /* ---------- Construire les choix dynamiques (statuts, options, docs) ---------- */
  function buildChoices() {
    // Statuts
    var sc = $('#statut-choices');
    sc.innerHTML = C.statuts.map(function (s, i) {
      return '<label class="choice">' +
        '<input type="radio" name="statut" value="' + s.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<div class="choice__top"><span class="choice__name">' + s.label + '</span>' +
        '<span class="choice__price">' + euro(s.base) + ' HT/mois</span></div>' +
        '<span class="choice__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span>' +
        '</label>';
    }).join('');

    // Options (réexpédition, numérisation)
    var oc = $('#option-choices');
    var o = C.options;
    oc.innerHTML =
      optionCard('reexpedition', o.reexpedition) +
      optionCard('numerisation', o.numerisation);

    // Documents
    var dc = $('#docs');
    dc.innerHTML = C.documents.map(function (d) {
      return '<div class="doc-item" data-doc="' + d.id + '">' +
        '<label><span>' + d.label + (d.requis ? ' <span class="req">*</span>' : ' <span class="muted">(facultatif)</span>') + '</span></label>' +
        '<div class="field__hint">' + d.desc + '</div>' +
        '<label class="dropzone" for="file-' + d.id + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4m0 0l-4 4m4-4l4 4"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/></svg>' +
        '<b>Cliquez pour ajouter un fichier</b><span>PDF, JPG ou PNG — 8 Mo max.</span>' +
        '<input type="file" id="file-' + d.id + '" accept=".pdf,.jpg,.jpeg,.png" hidden></label>' +
        '<div class="filechip-wrap"></div></div>';
    }).join('');
  }
  function optionCard(id, o) {
    return '<label class="choice">' +
      '<input type="checkbox" name="opt" value="' + id + '" data-prix="' + o.prix + '">' +
      '<div class="choice__top"><span class="choice__name">' + o.label + '</span>' +
      '<span class="choice__price">+ ' + euro(o.prix) + ' HT/mois</span></div>' +
      '<div class="choice__desc">' + o.desc + '</div>' +
      '<span class="choice__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span>' +
      '</label>';
  }

  /* ---------- Lecture de l'état du formulaire ---------- */
  function read() {
    var statutId = (($('input[name=statut]:checked') || {}).value) || C.statuts[0].id;
    var statut = C.statuts.filter(function (s) { return s.id === statutId; })[0] || C.statuts[0];
    var reexp = !!$('input[name=opt][value=reexpedition]:checked');
    var num = !!$('input[name=opt][value=numerisation]:checked');
    var mensuelHT = statut.base + (reexp ? C.options.reexpedition.prix : 0) + (num ? C.options.numerisation.prix : 0);
    var caution = mensuelHT * C.cautionMois;
    var sous;
    if (C.souscription === 'caution') sous = caution + C.fraisDossier;
    else if (C.souscription === '1mois') sous = mensuelHT + C.fraisDossier;
    else sous = caution + mensuelHT + C.fraisDossier;

    return {
      statut: statutId, statutLabel: statut.label, qualiteDefaut: statut.qualite,
      base: statut.base, reexpedition: reexp, numerisation: num,
      mensuelHT: mensuelHT, mensuelTTC: mensuelHT * (1 + C.tva),
      caution: caution, fraisDossier: C.fraisDossier,
      souscriptionHT: sous, souscriptionTTC: sous * (1 + C.tva),
      dateEffet: val('#f-dateEffet'),
      civilite: val('#f-civilite'), qualite: val('#f-qualite'),
      nom: val('#f-nom'), prenom: val('#f-prenom'),
      adresseClient: val('#f-adresseClient'), cpClient: val('#f-cpClient'),
      villeClient: val('#f-villeClient'), paysClient: val('#f-paysClient') || 'France',
      telClient: val('#f-telClient'), emailClient: val('#f-emailClient'),
      raisonSociale: val('#f-raisonSociale'), rcsClient: val('#f-rcsClient'),
      capital: val('#f-capital'), activite: val('#f-activite'),
      pieceType: val('#f-pieceType'), pieceNum: val('#f-pieceNum'),
      pieceDate: val('#f-pieceDate'), pieceLieu: val('#f-pieceLieu')
    };
  }
  function val(s) { var e = $(s); return e ? e.value.trim() : ''; }

  /* ---------- Récapitulatif (colonne droite) + plaque ---------- */
  function refresh() {
    var d = read();
    // plaque
    var nm = d.raisonSociale || (d.prenom || d.nom ? (d.prenom + ' ' + d.nom).trim() : '');
    $('#plq-name').textContent = nm || 'Votre entreprise';
    // lignes
    var lines = '';
    lines += line('Formule de base', d.statutLabel, euro(d.base) + ' HT');
    if (d.reexpedition) lines += line('Réexpédition postale', '', '+ ' + euro(C.options.reexpedition.prix) + ' HT');
    if (d.numerisation) lines += line('Numérisation du courrier', '', '+ ' + euro(C.options.numerisation.prix) + ' HT');
    lines += line('Engagement minimum', '', C.dureeMinMois + ' mois');
    $('#sum-lines').innerHTML = lines;
    // totaux
    $('#sum-ht').textContent = euro(d.mensuelHT);
    $('#sum-ttc').textContent = euro(d.mensuelTTC) + ' TTC';
    // à verser
    $('#sum-caution').textContent = euro(d.caution);
    $('#sum-sous').textContent = euro(d.souscriptionHT) + ' HT';
    $('#sum-sous-ttc').textContent = euro(d.souscriptionTTC) + ' TTC';
    return d;
  }
  function line(a, b, c) {
    return '<div class="summary__line"><span>' + a + (b ? ' <span class="muted">· ' + b + '</span>' : '') + '</span><span>' + c + '</span></div>';
  }

  /* ---------- Navigation entre étapes ---------- */
  function go(step) {
    if (step > state.step) { if (!validate(state.step)) return; }
    state.step = Math.max(1, Math.min(TOTAL_STEPS, step));
    document.querySelectorAll('.fstep').forEach(function (f) {
      f.classList.toggle('is-active', +f.dataset.step === state.step);
    });
    document.querySelectorAll('.stepper__i').forEach(function (i) {
      var n = +i.dataset.step;
      i.classList.toggle('is-active', n === state.step);
      i.classList.toggle('is-done', n < state.step);
    });
    $('#btn-prev').classList.toggle('hide', state.step === 1);
    $('#btn-next').classList.toggle('hide', state.step >= TOTAL_STEPS);
    $('#btn-pay').classList.toggle('hide', state.step < TOTAL_STEPS);
    if (state.step === 4) renderContract();
    if (state.step === 5) renderFinalRecap();
    window.scrollTo({ top: $('#tunnel').offsetTop - 80, behavior: 'smooth' });
  }

  /* ---------- Validation ---------- */
  function validate(step) {
    clearInvalid();
    var bad = [];
    if (step === 1) {
      if (!val('#f-dateEffet')) bad.push('#f-dateEffet');
    }
    if (step === 2) {
      ['#f-civilite', '#f-qualite', '#f-nom', '#f-prenom', '#f-adresseClient', '#f-cpClient',
       '#f-villeClient', '#f-telClient', '#f-emailClient', '#f-pieceType', '#f-pieceNum'
      ].forEach(function (s) { if (!val(s)) bad.push(s); });
      var statut = read().statut;
      if (statut !== 'particulier' && !val('#f-raisonSociale')) bad.push('#f-raisonSociale');
      // Vérification des formats normalisés (e-mail, téléphone, code postal, RCS…)
      if (window.NDvalid) {
        document.querySelectorAll('.fstep[data-step="2"] [data-format]').forEach(function (el) {
          if (el.value.trim() && !window.NDvalid.check(el) && bad.indexOf('#' + el.id) === -1) bad.push('#' + el.id);
        });
      }
    }
    if (step === 3) {
      C.documents.forEach(function (doc) {
        if (doc.requis && !state.files[doc.id]) bad.push('[data-doc="' + doc.id + '"] .dropzone');
      });
    }
    if (step === 4) {
      if (!$('#consent').checked) bad.push('#consent');
    }
    if (bad.length) {
      bad.forEach(function (s) { var e = $(s); if (e) e.classList.add('invalid'); });
      var first = $(bad[0]); if (first && first.scrollIntoView) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(step);
      return false;
    }
    return true;
  }
  function clearInvalid() { document.querySelectorAll('.invalid').forEach(function (e) { e.classList.remove('invalid'); }); }
  function flash(step) {
    var msg = $('#err-' + step);
    if (msg) { msg.classList.remove('hide'); clearTimeout(msg._t); msg._t = setTimeout(function () { msg.classList.add('hide'); }, 4000); }
  }

  /* ---------- Aperçu du contrat (pré-rempli + SPÉCIMEN) ---------- */
  function renderContract() {
    var d = refresh();
    $('#contract-preview .contract-doc-wrap').innerHTML = C.genererContrat(d);
  }

  /* ---------- Récap final (étape 5) ---------- */
  function renderFinalRecap() {
    var d = refresh();
    var html =
      kv('Formule', d.statutLabel) +
      kv('Options', [d.reexpedition ? 'Réexpédition' : null, d.numerisation ? 'Numérisation' : null].filter(Boolean).join(' + ') || 'Aucune') +
      kv('Adresse de domiciliation', C.societe.adresse + ', ' + C.societe.cp + ' ' + C.societe.ville) +
      kv('Date d\'effet', d.dateEffet || '—') +
      kv('Redevance', euro(d.mensuelHT) + ' HT / mois') +
      kv('Caution (' + C.cautionMois + ' mois)', euro(d.caution)) +
      kv('Société', d.raisonSociale || '—') +
      kv('Responsable', (d.civilite + ' ' + d.prenom + ' ' + d.nom).trim()) +
      kv('E-mail', d.emailClient || '—') +
      kv('Pièces déposées', Object.keys(state.files).map(function (k) { return state.files[k].name; }).join(', ') || 'aucune');
    $('#final-recap').innerHTML = html;
    $('#pay-amount').textContent = euro(d.souscriptionTTC) + ' TTC';
  }
  function kv(k, v) { return '<div class="summary__line"><span class="muted">' + k + '</span><span>' + escapeHtml(v) + '</span></div>'; }
  function escapeHtml(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}

  /* ---------- Upload de fichiers ---------- */
  function wireUploads() {
    C.documents.forEach(function (doc) {
      var input = $('#file-' + doc.id);
      var zone = input.closest('.doc-item').querySelector('.dropzone');
      var wrap = input.closest('.doc-item').querySelector('.filechip-wrap');
      input.addEventListener('change', function () { handleFile(doc.id, input.files[0], zone, wrap); });
      ['dragover', 'dragenter'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('drag'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('drag'); }); });
      zone.addEventListener('drop', function (e) { var f = e.dataTransfer.files[0]; if (f) handleFile(doc.id, f, zone, wrap); });
    });
  }
  function handleFile(id, file, zone, wrap) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Fichier trop volumineux (8 Mo max).'); return; }
    state.files[id] = file;
    zone.classList.remove('invalid');
    wrap.innerHTML = '<div class="filechip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12l5 5L20 7"/></svg>' +
      escapeHtml(file.name) + ' <span style="font-weight:400">(' + (file.size / 1024 / 1024).toFixed(1) + ' Mo)</span>' +
      '<button type="button" aria-label="Retirer">×</button></div>';
    wrap.querySelector('button').addEventListener('click', function () {
      delete state.files[id]; wrap.innerHTML = '';
    });
  }
  function filesToBase64() {
    var ids = Object.keys(state.files);
    return Promise.all(ids.map(function (id) {
      return new Promise(function (res) {
        var r = new FileReader();
        r.onload = function () { res({ doc: id, name: state.files[id].name, type: state.files[id].type, data: r.result }); };
        r.onerror = function () { res({ doc: id, name: state.files[id].name, error: true }); };
        r.readAsDataURL(state.files[id]);
      });
    }));
  }

  /* ---------- Paiement ---------- */
  function pay() {
    if (!validate(4)) { go(4); return; }
    var d = refresh();
    var ref = 'ND-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    var contractHtml = C.genererContrat(d);

    // Commande légère stockée pour la page « merci » (sans les fichiers)
    var light = JSON.parse(JSON.stringify(d));
    light.reference = ref;
    light.contractHtml = contractHtml;
    light.societe = C.societe;
    try { localStorage.setItem('novadom_order', JSON.stringify(light)); } catch (e) {}

    var btn = $('#btn-pay'); btn.disabled = true; btn.textContent = 'Préparation du paiement…';

    // Envoi complet (avec pièces) à l'automatisation — événement « initiated »
    filesToBase64().then(function (files) {
      var payload = Object.assign({ event: 'initiated', reference: ref, contractHtml: contractHtml, documents: files }, d);
      if (C.endpointEnvoi) {
        fetch(C.endpointEnvoi, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(function () {});
      }
      // Redirection vers Stripe (ou mode démo)
      var link = (C.stripe.liens || {})[d.statut];
      if (link) {
        var sep = link.indexOf('?') > -1 ? '&' : '?';
        window.location.href = link + sep + 'client_reference_id=' + encodeURIComponent(ref);
      } else {
        window.location.href = '../merci/index.html?ref=' + encodeURIComponent(ref) + '&demo=1';
      }
    });
  }

  /* ---------- Init ---------- */
  buildChoices();
  wireUploads();
  refresh();

  // Pré-remplir la qualité selon le statut
  $('#statut-choices').addEventListener('change', function () {
    var q = $('#f-qualite');
    if (q && !q.value) q.value = read().qualiteDefaut;
    refresh();
  });
  document.getElementById('tunnel').addEventListener('input', refresh);
  document.getElementById('tunnel').addEventListener('change', refresh);

  $('#btn-next').addEventListener('click', function () { go(state.step + 1); });
  $('#btn-prev').addEventListener('click', function () { go(state.step - 1); });
  $('#btn-pay').addEventListener('click', pay);
  document.querySelectorAll('.stepper__i').forEach(function (i) {
    i.addEventListener('click', function () { var n = +i.dataset.step; if (n < state.step) go(n); });
  });

  // Date d'effet : défaut = aujourd'hui
  var de = $('#f-dateEffet');
  if (de && !de.value) de.value = new Date().toISOString().slice(0, 10);

  go(1);
})();
