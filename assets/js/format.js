/* =========================================================================
   NOVADOM — Formatage & validation des champs normalisés
   Verrouille la saisie (téléphone, e-mail, code postal, RCS/SIREN, capital)
   et expose window.NDvalid pour la validation par les autres scripts.
   Cibles : tout champ portant un attribut data-format="..."
   ========================================================================= */
(function () {
  // -------- Formatage (au fil de la frappe) --------
  function fmtTel(v) {
    v = (v || '').replace(/[^\d+]/g, '');
    var intl = v.charAt(0) === '+';
    var d = v.replace(/\D/g, '');
    if (intl) {
      d = d.slice(0, 13);
      // +33 6 12 34 56 78
      var cc = d.slice(0, 2), rest = d.slice(2);
      var out = '+' + cc;
      if (rest.length) { out += ' ' + rest.slice(0, 1); rest = rest.slice(1); }
      while (rest.length) { out += ' ' + rest.slice(0, 2); rest = rest.slice(2); }
      return out.trim();
    }
    d = d.slice(0, 10);
    var o = '';
    for (var i = 0; i < d.length; i += 2) o += (i ? ' ' : '') + d.slice(i, i + 2);
    return o;
  }
  function fmtCP(v) { return (v || '').replace(/\D/g, '').slice(0, 5); }
  function fmtSiren(v) {
    var d = (v || '').replace(/\D/g, '').slice(0, 9);
    return d.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
  function fmtCapital(v) {
    var d = (v || '').replace(/\D/g, '');
    if (!d) return '';
    var n = d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n + ' €';
  }
  function fmtEmail(v) { return (v || '').replace(/\s+/g, '').toLowerCase(); }
  function fmtUpper(v) { return (v || '').toUpperCase(); }

  var FORMATTERS = { tel: fmtTel, cp: fmtCP, siren: fmtSiren, capital: fmtCapital, email: fmtEmail, upper: fmtUpper };

  // -------- Validation --------
  var V = {
    email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v); },
    tel: function (v) {
      var d = (v || '').replace(/\D/g, '');
      if ((v || '').trim().charAt(0) === '+') return d.length >= 11 && d.length <= 13;
      return /^0\d{9}$/.test(d);
    },
    cp: function (v) { return /^\d{5}$/.test(v); },
    siren: function (v) { return /^\d{9}$/.test((v || '').replace(/\D/g, '')); },
    capital: function (v) { return /\d/.test(v); },
    upper: function (v) { return (v || '').trim().length > 0; }
  };

  var MSG = {
    email: 'Adresse e-mail invalide (ex. nom@domaine.fr).',
    tel: 'Numéro invalide (ex. 06 12 34 56 78).',
    cp: 'Le code postal doit comporter 5 chiffres.',
    siren: 'Le N° RCS/SIREN doit comporter 9 chiffres.',
    capital: 'Indiquez un montant en chiffres.',
    upper: 'Champ requis.'
  };

  // -------- API exposée --------
  window.NDvalid = {
    // valide un élément selon son data-format (vide = valide sauf si data-required)
    check: function (el) {
      var f = el.getAttribute('data-format');
      var v = (el.value || '').trim();
      if (!v) return !el.hasAttribute('data-required');
      var fn = V[f];
      return fn ? fn(v) : true;
    },
    message: function (el) { return MSG[el.getAttribute('data-format')] || 'Champ invalide.'; },
    format: function (el) {
      var f = el.getAttribute('data-format');
      var fn = FORMATTERS[f];
      if (!fn) return;
      var start = el.selectionStart, before = el.value;
      el.value = fn(el.value);
      // repositionne le curseur en fin si la longueur a changé (simple et fiable)
      if (el.value.length !== before.length) { try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {} }
      else { try { el.setSelectionRange(start, start); } catch (e) {} }
    }
  };

  // -------- Branchement automatique --------
  function wire() {
    document.querySelectorAll('[data-format]').forEach(function (el) {
      var f = el.getAttribute('data-format');
      if (f === 'tel') { el.setAttribute('inputmode', 'tel'); }
      if (f === 'cp' || f === 'siren') { el.setAttribute('inputmode', 'numeric'); }
      if (f === 'email') { el.setAttribute('inputmode', 'email'); }
      el.addEventListener('input', function () { window.NDvalid.format(el); el.classList.remove('invalid'); });
      el.addEventListener('blur', function () {
        window.NDvalid.format(el);
        if (el.value.trim() && !window.NDvalid.check(el)) el.classList.add('invalid');
      });
    });
  }
  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();
