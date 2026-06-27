/* =========================================================================
   NOVADOM — CONFIGURATION & CONTRAT
   --------------------------------------------------------------------------
   ▶▶ C'EST LE SEUL FICHIER QUE VOUS AVEZ BESOIN DE MODIFIER ◀◀
   Tout est commenté. Changez les valeurs entre guillemets, rien d'autre.
   ========================================================================= */

window.NOVADOM = {

  /* ----------------------------------------------------------------------
     1) COORDONNÉES — affichées partout sur le site
     ---------------------------------------------------------------------- */
  societe: {
    nom:        "NOVADOM",
    forme:      "SAS au capital de 1 000 €",
    rcs:        "902 244 870 RCS Nanterre",
    agrement:   "Agrément préfectoral CAB/BPS/SD n°146",
    adresse:    "8 rue de l'Est",
    cp:         "92100",
    ville:      "Boulogne-Billancourt",
    metro:      "M° Marcel Sembat / Jean Jaurès",
    tel:        "01 86 04 08 87",
    telLien:    "+33186040887",
    email:      "contact@boulogne-domiciliation.com", // ← mettez votre e-mail réel
    dirigeants: "Patrick Benchadi-Daurat (Président) et Michaël Szyjka (Directeur Général)"
  },

  /* ----------------------------------------------------------------------
     2) TARIFS (en € HORS TAXES par mois) — repris de votre site actuel.
        Modifiez librement les montants.
     ---------------------------------------------------------------------- */
  tva: 0.20, // 20 %

  statuts: [
    { id:"societe",     label:"Société (SARL, SAS, SCI…)",        base:29, qualite:"Gérant / Président" },
    { id:"auto",        label:"Auto-entreprise",                  base:15, qualite:"Entrepreneur individuel" },
    { id:"ei",          label:"Entreprise individuelle",          base:15, qualite:"Entrepreneur individuel" },
    { id:"association", label:"Association à but non lucratif",   base:9,  qualite:"Président" },
    { id:"particulier", label:"Particulier",                      base:9,  qualite:"Particulier" }
  ],

  options: {
    reexpedition: { label:"Réexpédition postale du courrier", desc:"Nous réexpédions votre courrier à l'adresse de votre choix, une fois par semaine. Timbres inclus.", prix:10 },
    numerisation: { label:"Numérisation du courrier",         desc:"Votre courrier scanné et accessible 24h/24 et 7j/7 dans votre espace en ligne sécurisé.",          prix:10 }
  },

  // Engagement & caution (conformes à votre tunnel actuel)
  dureeMinMois: 3,
  cautionMois:  3,          // caution = 3 mois de domiciliation
  fraisDossier: 0,          // frais de dossier à la souscription (0 = aucun)

  /* À VERSER À LA SOUSCRIPTION :
     "caution_plus_1mois" = 1er mois + caution (3 mois)  → recommandé
     "caution"            = caution seule (3 mois)
     "1mois"              = 1er mois seul                                   */
  souscription: "caution_plus_1mois",

  /* ----------------------------------------------------------------------
     3) PAIEMENT STRIPE — Liens de paiement (aucun code nécessaire)
        Créez vos liens dans Stripe puis collez-les ici.
        (Voir GUIDE-MISE-EN-LIGNE.md, étape « Stripe ».)
        Laissez "" pour utiliser le mode démonstration (pas de vrai paiement).
     ---------------------------------------------------------------------- */
  stripe: {
    liens: {
      societe:     "https://buy.stripe.com/test_8x2aEWfHua59h2U6ua4F200",
      auto:        "https://buy.stripe.com/test_8x2aEWfHua59h2U6ua4F200",
      ei:          "https://buy.stripe.com/test_8x2aEWfHua59h2U6ua4F200",
      association: "https://buy.stripe.com/test_8x2aEWfHua59h2U6ua4F200",
      particulier: "https://buy.stripe.com/test_8x2aEWfHua59h2U6ua4F200"
    },
    retour: "/merci/"
  },

  /* ----------------------------------------------------------------------
     4) ENVOI AUTOMATIQUE DES E-MAILS (après paiement)
        Collez ici l'URL « webhook » de votre automatisation
        (Make.com, Zapier, ou un Formspree). Voir le GUIDE.
        Tant que c'est "", les e-mails sont simulés (rien n'est envoyé).
     ---------------------------------------------------------------------- */
  endpointEnvoi: "",   // ex : "https://hook.eu1.make.com/xxxxxxxx"

  /* ----------------------------------------------------------------------
     5) ENVOI DES E-MAILS AVEC PIÈCES JOINTES (recommandé) — Web3Forms
        Permet d'envoyer à VOTRE boîte e-mail :
          • les messages du formulaire de contact (avec document joint),
          • le dossier complet après commande (CNI, justificatif, Kbis + contrat PDF).
        Comment obtenir la clé (gratuit, 30 s, sans inscription) :
          1. Allez sur https://web3forms.com
          2. Saisissez l'e-mail de réception (celui de Novadom) → vous recevez une clé.
          3. Collez la clé ci-dessous.
        Tant que c'est "", le contact bascule sur un envoi simple (sans pièce jointe).
     ---------------------------------------------------------------------- */
  web3formsKey: "",   // ex : "a1b2c3d4-1234-5678-9abc-def012345678"

  /* ----------------------------------------------------------------------
     6) (Option avancée) FORMULAIRES via Formspree — laissez "" si vous
        utilisez Web3Forms ci-dessus.
     ---------------------------------------------------------------------- */
  formspree: "",   // ex : "abcdwxyz"

  /* ----------------------------------------------------------------------
     7) DOCUMENTS demandés au client (étape dépôt de pièces)
     ---------------------------------------------------------------------- */
  documents: [
    { id:"identite",   label:"Pièce d'identité du responsable légal", desc:"CNI ou passeport en cours de validité", requis:true },
    { id:"domicile",   label:"Justificatif de domicile",              desc:"De moins de 3 mois (facture, quittance…)", requis:true },
    { id:"kbis",       label:"Extrait Kbis (si transfert de siège)",  desc:"Original de moins de 3 mois — facultatif", requis:false }
  ]
};

/* =========================================================================
   GÉNÉRATEUR DU CONTRAT DE DOMICILIATION (pré-rempli)
   --------------------------------------------------------------------------
   ⚠️  MODÈLE À FAIRE VALIDER PAR VOTRE CONSEIL JURIDIQUE avant mise en ligne.
       Rédigé selon les obligations des art. L123-11-3, R123-166-1 et suivants
       du Code de commerce. Ce n'est pas un avis juridique.
   ========================================================================= */
window.NOVADOM.genererContrat = function (d) {
  const S = window.NOVADOM.societe;
  const f = (v, ph) => v && String(v).trim()
        ? `<span class="fill">${esc(v)}</span>`
        : `<span class="fill" style="opacity:.5">${ph || "—"}</span>`;
  const euro = n => (n||0).toLocaleString('fr-FR',{minimumFractionDigits:0}) + " €";

  const mensuelHT = d.mensuelHT || 0;
  const caution   = mensuelHT * window.NOVADOM.cautionMois;

  const opts = [];
  if (d.reexpedition) opts.push("réexpédition postale hebdomadaire du courrier");
  if (d.numerisation) opts.push("numérisation du courrier (accès en ligne 24h/24, 7j/7)");
  const prestations = "mise à disposition du courrier à l'agence"
        + (opts.length ? ", " + opts.join(", ") : "");

  return `
  <article class="contract-doc">
    <h1>Contrat de domiciliation commerciale</h1>
    <p class="sub">${esc(S.agrement)} — soumis aux articles L123-11-3 et R123-166-1 et suivants du Code de commerce</p>

    <h2>Entre les soussignés</h2>
    <div class="party">
      <b>Le Domiciliataire —</b> ${esc(S.nom)}, ${esc(S.forme)}, immatriculée au ${esc(S.rcs)},
      dont le siège est situé ${esc(S.adresse)}, ${esc(S.cp)} ${esc(S.ville)},
      titulaire de l'${esc(S.agrement)}, représentée par sa direction dûment habilitée.
    </div>
    <div class="party">
      <b>Le Domicilié —</b> ${f(d.civilite)} ${f(d.prenom,"Prénom")} ${f(d.nom,"Nom")},
      agissant en qualité de ${f(d.qualite,"qualité")}
      ${d.raisonSociale ? `de la structure ${f(d.raisonSociale,"raison sociale")}` : ""}
      ${d.rcsClient ? `(RCS ${f(d.rcsClient)})` : ""},
      demeurant ${f(d.adresseClient,"adresse")} ${f(d.cpClient,"")} ${f(d.villeClient,"ville")}.
    </div>

    <h2>Article 1 — Objet</h2>
    <p>Le Domiciliataire met à disposition du Domicilié l'adresse du
       <b>${esc(S.adresse)}, ${esc(S.cp)} ${esc(S.ville)}</b> afin d'y établir le siège social
       de sa structure (${f(d.raisonSociale,"raison sociale")}), conformément à la réglementation en vigueur.</p>

    <h2>Article 2 — Identité du Domicilié</h2>
    <table class="rc">
      <tr><td>Raison sociale</td><td>${f(d.raisonSociale,"—")}</td></tr>
      <tr><td>Forme / statut</td><td>${f(d.statutLabel,"—")}</td></tr>
      <tr><td>N° RCS</td><td>${f(d.rcsClient,"—")}</td></tr>
      <tr><td>Capital social</td><td>${f(d.capital,"—")}</td></tr>
      <tr><td>Activité</td><td>${f(d.activite,"—")}</td></tr>
      <tr><td>Représentant légal</td><td>${f(d.civilite)} ${f(d.prenom,"")} ${f(d.nom,"")} — ${f(d.qualite,"")}</td></tr>
      <tr><td>Pièce d'identité</td><td>${f(d.pieceType,"—")} n° ${f(d.pieceNum,"—")}</td></tr>
      <tr><td>E-mail / téléphone</td><td>${f(d.emailClient,"—")} — ${f(d.telClient,"—")}</td></tr>
    </table>

    <h2>Article 3 — Prestations & adresse</h2>
    <p>Au titre du présent contrat, le Domiciliataire assure : ${prestations}.
       Le Domicilié est notifié de toute réception de courrier.</p>

    <h2>Article 4 — Durée</h2>
    <p>Le contrat prend effet le ${f(d.dateEffet,"date d'effet")} pour une durée minimale de
       <b>${window.NOVADOM.dureeMinMois} mois</b>, renouvelable par tacite reconduction par périodes
       successives, sauf résiliation dans les conditions de l'article 6.</p>

    <h2>Article 5 — Conditions financières</h2>
    <p>Redevance : <b>${euro(mensuelHT)} H.T / mois</b>${d.reexpedition||d.numerisation?" (options incluses)":""}.
       Caution contractuelle : <b>${euro(caution)}</b>, correspondant à ${window.NOVADOM.cautionMois} mois de
       domiciliation, destinée à couvrir les ${window.NOVADOM.cautionMois} derniers mois en cas de résiliation.</p>

    <h2>Article 6 — Résiliation & préavis</h2>
    <p>Chaque partie peut résilier moyennant un préavis de ${window.NOVADOM.dureeMinMois} mois adressé par lettre
       recommandée avec accusé de réception. Le Domicilié informe sans délai le greffe du tribunal de commerce de
       tout transfert de siège.</p>

    <h2>Article 7 — Obligations du Domicilié</h2>
    <p>Le Domicilié donne mandat au Domiciliataire de recevoir en son nom toute notification.
       Il s'engage à déclarer toute modification le concernant, à utiliser effectivement l'adresse,
       et à fournir les justificatifs requis par la loi.</p>

    <h2>Article 8 — Obligations du Domiciliataire</h2>
    <p>Le Domiciliataire met les locaux à disposition, conserve les justificatifs, tient le registre prévu par la loi,
       et communique aux autorités compétentes les informations exigées en cas de cessation.</p>

    <h2>Article 9 — Données personnelles (RGPD)</h2>
    <p>Les données collectées servent exclusivement à l'exécution du contrat et aux obligations légales du Domiciliataire.
       Le Domicilié dispose d'un droit d'accès, de rectification et d'effacement auprès de ${esc(S.email)}.</p>

    <h2>Article 10 — Droit applicable</h2>
    <p>Le présent contrat est régi par le droit français. Tout litige relève des tribunaux compétents du ressort du siège
       du Domiciliataire, à défaut d'accord amiable.</p>

    <p style="margin-top:18px">Fait à ${esc(S.ville)}, le ${f(d.dateEffet,"…")} — en deux exemplaires.</p>
    <div class="sign">
      <div>Le Domiciliataire<br><b>${esc(S.nom)}</b></div>
      <div>Le Domicilié<br><b>${f(d.prenom,"")} ${f(d.nom,"")}</b><br>« Lu et approuvé »</div>
    </div>
  </article>`;
};

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
