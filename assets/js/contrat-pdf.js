/* =========================================================================
   NOVADOM — Génération du contrat en PDF (côté navigateur, via jsPDF)
   Produit un vrai fichier .pdf, pré-rempli, avec filigrane SPÉCIMEN.
   Dépend de jsPDF (chargé depuis le CDN) et de window.NOVADOM (config.js).
   ========================================================================= */
(function () {
  if (!window.NOVADOM) return;

  // Nettoie les caractères non gérés par les polices PDF standard
  function clean(s) {
    return String(s == null ? '' : s)
      .replace(/€/g, 'EUR')
      .replace(/\u00A0/g, ' ')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, '...')
      .replace(/œ/g, 'oe').replace(/Œ/g, 'OE');
  }
  function euro(n) {
    return (Math.round((n || 0) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ') + ' EUR';
  }

  window.NOVADOM.genererContratPDF = function (d) {
    var S = window.NOVADOM.societe;
    var jsPDFns = window.jspdf || {};
    var JsPDF = jsPDFns.jsPDF;
    if (!JsPDF) { console.error('jsPDF non chargé'); return null; }

    var doc = new JsPDF({ unit: 'pt', format: 'a4' });
    var PW = doc.internal.pageSize.getWidth();   // 595
    var PH = doc.internal.pageSize.getHeight();  // 842
    var M = 50, RW = PW - 2 * M, y = 0;

    var cautionMois = window.NOVADOM.cautionMois || 3;
    var dureeMin = window.NOVADOM.dureeMinMois || 3;
    var mensuelHT = d.mensuelHT || 0;
    var caution = (typeof d.caution === 'number') ? d.caution : mensuelHT * cautionMois;

    function watermark() {
      try { doc.setGState(new doc.GState({ opacity: 0.10 })); } catch (e) {}
      doc.setFont('helvetica', 'bold'); doc.setFontSize(80); doc.setTextColor(182, 136, 63);
      doc.text('SPECIMEN', PW / 2, PH / 2, { align: 'center', angle: 32 });
      try { doc.setGState(new doc.GState({ opacity: 1 })); } catch (e) {}
      doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    }
    function newPage() { doc.addPage(); watermark(); y = 56; }
    function ensure(h) { if (y + h > PH - 64) newPage(); }

    function h2(t) {
      ensure(30); y += 8;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(138, 101, 38);
      doc.text(clean(t).toUpperCase(), M, y); y += 5;
      doc.setDrawColor(228, 220, 201); doc.setLineWidth(0.6); doc.line(M, y, PW - M, y); y += 13;
    }
    function para(t, opt) {
      opt = opt || {};
      var sz = opt.size || 9.5, fw = opt.bold ? 'bold' : 'normal';
      doc.setFont('helvetica', fw); doc.setFontSize(sz);
      var lines = doc.splitTextToSize(clean(t), RW);
      for (var i = 0; i < lines.length; i++) {
        ensure(13);
        doc.setFont('helvetica', fw); doc.setFontSize(sz); doc.setTextColor(40, 53, 80);
        doc.text(lines[i], M, y); y += 13;
      }
      y += 5;
    }
    function party(label, t) {
      var lines = doc.splitTextToSize(clean(t), RW - 24);
      var boxH = lines.length * 12 + 30;
      ensure(boxH + 4);
      doc.setFillColor(243, 238, 226); doc.roundedRect(M, y, RW, boxH, 5, 5, 'F');
      var yy = y + 16;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(22, 34, 58);
      doc.text(clean(label), M + 12, yy); yy += 14;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 53, 80);
      for (var i = 0; i < lines.length; i++) { doc.text(lines[i], M + 12, yy); yy += 12; }
      y += boxH + 8;
    }
    function table(rows) {
      var lw = RW * 0.40, rw = RW * 0.60;
      doc.setLineWidth(0.5); doc.setDrawColor(228, 220, 201);
      for (var i = 0; i < rows.length; i++) {
        var k = rows[i][0], v = clean(rows[i][1] || '—');
        doc.setFontSize(8.7);
        var vlines = doc.splitTextToSize(v, rw - 12);
        var rowH = Math.max(17, vlines.length * 11 + 8);
        ensure(rowH);
        doc.rect(M, y, lw, rowH); doc.rect(M + lw, y, rw, rowH);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 130, 150);
        doc.text(clean(k), M + 7, y + 12);
        doc.setTextColor(22, 34, 58);
        doc.text(vlines, M + lw + 7, y + 12);
        y += rowH;
      }
      y += 8;
    }
    function signatures() {
      ensure(80); y += 14;
      var colW = (RW - 30) / 2, x2 = M + colW + 30;
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.6);
      doc.line(M, y + 34, M + colW, y + 34); doc.line(x2, y + 34, x2 + colW, y + 34);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.7); doc.setTextColor(90, 100, 120);
      doc.text('Le Domiciliataire', M, y + 46); doc.text('Le Domicilié', x2, y + 46);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 34, 58);
      doc.text(clean(S.nom), M, y + 58);
      doc.text(clean(((d.prenom || '') + ' ' + (d.nom || '')).trim() || '—'), x2, y + 58);
      doc.setFont('helvetica', 'italic'); doc.setTextColor(90, 100, 120); doc.setFontSize(8);
      doc.text('« Lu et approuvé »', x2, y + 70);
      y += 80;
    }

    // ---- Première page ----
    watermark(); y = 58;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(22, 34, 58);
    doc.text('CONTRAT DE DOMICILIATION COMMERCIALE', PW / 2, y, { align: 'center' }); y += 18;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 130, 150);
    var sub = doc.splitTextToSize(clean(S.agrement + ' — articles L123-11-3 et R123-166-1 et suivants du Code de commerce'), RW);
    doc.text(sub, PW / 2, y, { align: 'center' }); y += sub.length * 10 + 6;
    if (d.reference) { doc.setFontSize(8); doc.setTextColor(138, 101, 38); doc.text('Référence : ' + clean(d.reference), PW / 2, y, { align: 'center' }); y += 14; }

    h2('Entre les soussignés');
    party('Le Domiciliataire',
      S.nom + ', ' + S.forme + ', immatriculée au ' + S.rcs + ', dont le siège est situé ' + S.adresse + ', ' + S.cp + ' ' + S.ville + ', titulaire de l\'' + S.agrement + ', représentée par sa direction dûment habilitée.');
    party('Le Domicilié',
      (d.civilite || '') + ' ' + (d.prenom || '') + ' ' + (d.nom || '') + ', agissant en qualité de ' + (d.qualite || '—') +
      (d.raisonSociale ? ' de la structure ' + d.raisonSociale : '') + (d.rcsClient ? ' (RCS ' + d.rcsClient + ')' : '') +
      ', demeurant ' + (d.adresseClient || '—') + ' ' + (d.cpClient || '') + ' ' + (d.villeClient || '') + '.');

    h2('Article 1 — Objet');
    para('Le Domiciliataire met à disposition du Domicilié l\'adresse du ' + S.adresse + ', ' + S.cp + ' ' + S.ville + ' afin d\'y établir le siège social de sa structure (' + (d.raisonSociale || '—') + '), conformément à la réglementation en vigueur.');

    h2('Article 2 — Identité du Domicilié');
    table([
      ['Raison sociale', d.raisonSociale],
      ['Forme / statut', d.statutLabel],
      ['N° RCS', d.rcsClient],
      ['Capital social', d.capital],
      ['Activité', d.activite],
      ['Représentant légal', (d.civilite || '') + ' ' + (d.prenom || '') + ' ' + (d.nom || '') + ' — ' + (d.qualite || '')],
      ['Pièce d\'identité', (d.pieceType || '') + ' n° ' + (d.pieceNum || '')],
      ['E-mail / téléphone', (d.emailClient || '') + ' — ' + (d.telClient || '')]
    ]);

    var opts = [];
    if (d.reexpedition) opts.push('réexpédition postale hebdomadaire du courrier');
    if (d.numerisation) opts.push('numérisation du courrier (accès en ligne 24h/24, 7j/7)');
    var prestations = 'mise à disposition du courrier à l\'agence' + (opts.length ? ', ' + opts.join(', ') : '');

    h2('Article 3 — Prestations & adresse');
    para('Au titre du présent contrat, le Domiciliataire assure : ' + prestations + '. Le Domicilié est notifié de toute réception de courrier.');

    h2('Article 4 — Durée');
    para('Le contrat prend effet le ' + (d.dateEffet || '—') + ' pour une durée minimale de ' + dureeMin + ' mois, renouvelable par tacite reconduction par périodes successives, sauf résiliation dans les conditions de l\'article 6.');

    h2('Article 5 — Conditions financières');
    para('Redevance : ' + euro(mensuelHT) + ' H.T / mois' + (d.reexpedition || d.numerisation ? ' (options incluses)' : '') + '. Caution contractuelle : ' + euro(caution) + ', correspondant à ' + cautionMois + ' mois de domiciliation, destinée à couvrir les ' + cautionMois + ' derniers mois en cas de résiliation.');

    h2('Article 6 — Résiliation & préavis');
    para('Chaque partie peut résilier moyennant un préavis de ' + dureeMin + ' mois adressé par lettre recommandée avec accusé de réception. Le Domicilié informe sans délai le greffe du tribunal de commerce de tout transfert de siège.');

    h2('Article 7 — Obligations du Domicilié');
    para('Le Domicilié donne mandat au Domiciliataire de recevoir en son nom toute notification. Il s\'engage à déclarer toute modification le concernant, à utiliser effectivement l\'adresse, et à fournir les justificatifs requis par la loi.');

    h2('Article 8 — Obligations du Domiciliataire');
    para('Le Domiciliataire met les locaux à disposition, conserve les justificatifs, tient le registre prévu par la loi, et communique aux autorités compétentes les informations exigées en cas de cessation.');

    h2('Article 9 — Données personnelles (RGPD)');
    para('Les données collectées servent exclusivement à l\'exécution du contrat et aux obligations légales du Domiciliataire. Le Domicilié dispose d\'un droit d\'accès, de rectification et d\'effacement auprès de ' + (S.email || '') + '.');

    h2('Article 10 — Droit applicable');
    para('Le présent contrat est régi par le droit français. Tout litige relève des tribunaux compétents du ressort du siège du Domiciliataire, à défaut d\'accord amiable.');

    para('Fait à ' + S.ville + ', le ' + (d.dateEffet || '...') + ' — en deux exemplaires.');
    signatures();

    // ---- Pieds de page (numerotation + mention) ----
    var n = doc.internal.getNumberOfPages();
    for (var pidx = 1; pidx <= n; pidx++) {
      doc.setPage(pidx);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
      doc.text('Modèle à faire valider par un conseil juridique — ' + S.nom, M, PH - 30);
      doc.text('Page ' + pidx + ' / ' + n, PW - M, PH - 30, { align: 'right' });
    }
    return doc;
  };

  // Nom de fichier normalisé
  window.NOVADOM.nomFichierContrat = function (d) {
    var ref = (d && d.reference) ? d.reference : 'SPECIMEN';
    return 'contrat-domiciliation-SPECIMEN-' + ref + '.pdf';
  };
})();
