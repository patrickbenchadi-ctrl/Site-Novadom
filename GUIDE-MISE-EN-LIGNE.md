# 🚀 Guide de mise en ligne — Site Novadom

Ce guide est écrit pour être suivi **sans aucune connaissance technique**.
Prévoyez environ **1 heure** pour tout mettre en place. Suivez les étapes dans l'ordre.

Votre montage : **le site est hébergé gratuitement sur GitHub Pages**, et votre **nom de domaine `boulogne-domiciliation.com` (géré chez OVH)** pointe vers lui.

---

## 📦 Ce que vous avez reçu

Un dossier `novadom/` contenant votre site complet :

```
novadom/
├── index.html ................... Accueil
├── domiciliation-en-ligne/ ...... Le tunnel de commande (cœur du site)
├── merci/ ....................... Page après paiement (envoie le contrat)
├── tarifs-domiciliation-entreprise/
├── domiciliation-commerciale/
├── creation-entreprise/
├── contact/  ·  demande-de-rappel/
├── domiciliation/domiciliation-en-ligne/ ... Guide pratique
├── numericloud/  ·  partenaires/  ·  mentions-legales/
├── 404.html ..................... Page « introuvable »
├── CNAME ........................ Votre nom de domaine (déjà rempli)
├── sitemap.xml · robots.txt ..... Pour Google
├── assets/
│   ├── css/styles.css ........... Le design
│   └── js/
│       ├── config.js  ⭐ LE SEUL FICHIER À MODIFIER
│       ├── app.js · tunnel.js · merci.js
└── .htaccess .................... (utile seulement si un jour vous passez sur OVH/Apache)
```

> ✅ **Bonne nouvelle référencement (SEO) :** toutes vos anciennes adresses sont **conservées à l'identique** (`/tarifs-domiciliation-entreprise`, `/domiciliation-commerciale`, `/domiciliation-en-ligne`, `/creation-entreprise`, `/contact`, `/mentions-legales`, etc.). Google ne perdra pas votre historique.

---

## ⭐ ÉTAPE 0 — Personnaliser vos informations (avant tout)

Ouvrez le fichier **`assets/js/config.js`** avec un éditeur de texte (Bloc-notes, ou directement sur GitHub plus tard). C'est **le seul fichier à modifier**. Vérifiez / changez :

- vos **coordonnées** (e-mail surtout : remplacez `contact@boulogne-domiciliation.com` par votre vraie adresse) ;
- vos **tarifs** si besoin ;
- (plus loin) vos **liens Stripe** et votre **adresse d'envoi d'e-mails**.

Tout est commenté en français dans le fichier. Ne touchez à rien d'autre.

---

## 🐙 ÉTAPE 1 — Mettre le site sur GitHub

1. Créez un compte gratuit sur **https://github.com** (si ce n'est pas déjà fait).
2. En haut à droite, cliquez sur **+** puis **New repository**.
3. Donnez-lui un nom, par exemple `site-novadom`. Laissez-le **Public**. Cliquez **Create repository**.
4. Sur la page du dépôt, cliquez sur **« uploading an existing file »** (lien bleu au milieu).
5. **Glissez-déposez tout le contenu** du dossier `novadom/` (et non le dossier lui-même — son *contenu* : `index.html`, le dossier `assets`, etc.).
6. En bas, cliquez **Commit changes**.

> 💡 Astuce plus confortable : installez **GitHub Desktop** (https://desktop.github.com) — il permet de glisser-déposer et de mettre à jour le site d'un clic, sans ligne de commande.

---

## 🌍 ÉTAPE 2 — Activer GitHub Pages (l'hébergement gratuit)

> ⚠️ **Prérequis : le dépôt doit être PUBLIC.** L'hébergement GitHub Pages gratuit ne fonctionne pas sur un dépôt privé (vous verriez le message « Upgrade or make this repository public to enable Pages »). Le dépôt ne contient que le site web — aucun mot de passe ni clé secrète — donc le rendre public est sans risque ici.

**A) Rendre le dépôt public**
1. Dans votre dépôt, **Settings** (en haut) → **General** (en haut du menu de gauche).
2. Descendez tout en bas, jusqu'à la zone rouge **« Danger Zone »**.
3. Ligne **« Change repository visibility »** → **Change visibility** → **Make public**.
4. Confirmez (GitHub vous fait recopier le nom du dépôt, ex. `patrickbenchadi-ctrl/Site-Novadom`).

**B) Activer Pages**
5. Revenez dans **Settings → Pages**.
6. Sous **Source**, choisissez **Deploy from a branch**.
7. Sous **Branch**, sélectionnez **`main`** et le dossier **`/ (root)`**, puis **Save**.
8. Patientez 1 à 2 minutes : une adresse temporaire apparaît (du type `https://votrecompte.github.io/Site-Novadom/`). Votre site est en ligne !

> 🔒 Bon à savoir : « public » signifie seulement que le **code du site** est visible (ce qui est normal pour un site web). Ne placez jamais de clé secrète dans le dépôt — ce n'est pas le cas ici. Les liens Stripe et l'identifiant Formspree sont prévus pour être publics.

---

## 🔗 ÉTAPE 3 — Brancher votre domaine OVH `boulogne-domiciliation.com`

> ⚠️ **À ne faire qu'une fois prêt à basculer.** Tant que vous ne configurez PAS le domaine, votre nouveau site reste visible sur l'adresse `github.io` et votre **ancien site reste en ligne** sur `boulogne-domiciliation.com`. Ne mettez pas de fichier `CNAME` dans le dépôt et ne remplissez pas « Custom domain » tant que la zone DNS n'est pas configurée — sinon l'adresse `github.io` redirige vers l'ancien site.

### A) Côté OVH (zone DNS) — à faire EN PREMIER
1. Espace client OVH → **Noms de domaine** → `boulogne-domiciliation.com` → onglet **Zone DNS**.
2. Créez / modifiez ces entrées :

| Type  | Sous-domaine | Cible / Valeur |
|-------|--------------|----------------|
| CNAME | `www`        | `patrickbenchadi-ctrl.github.io.` *(avec le point final)* |
| A     | *(vide = le domaine nu)* | `185.199.108.153` |
| A     | *(vide)*     | `185.199.109.153` |
| A     | *(vide)*     | `185.199.110.153` |
| A     | *(vide)*     | `185.199.111.153` |

3. Enregistrez et patientez la propagation (de quelques minutes à 24 h).

### B) Côté GitHub — une fois la DNS en place
4. **Settings → Pages → Custom domain** : saisissez `www.boulogne-domiciliation.com` puis **Save** (GitHub recrée alors automatiquement le fichier `CNAME`).
5. Cochez **Enforce HTTPS** (le cadenas sécurisé, gratuit — peut apparaître après quelques minutes).

> Le fichier `CNAME.a-ajouter-plus-tard.txt` fourni contient simplement le texte à saisir dans « Custom domain ». Vous n'avez rien à uploader vous-même : GitHub gère le fichier `CNAME` quand vous remplissez le champ à l'étape 4.

> ⚠️ Coupez l'ancien hébergement (o2switch) **seulement après** avoir vérifié que `https://www.boulogne-domiciliation.com` affiche bien le nouveau site.

---

## 💳 ÉTAPE 4 — Configurer le paiement Stripe

Le site utilise les **Liens de paiement Stripe** : aucune programmation, et vos clients ne saisissent jamais leur carte sur votre site (sécurité maximale).

1. Créez un compte sur **https://stripe.com** et validez votre société.
2. Dans le tableau de bord Stripe : **Paiements → Liens de paiement → + Nouveau**.
3. Créez **un lien par formule** (le plus simple : un lien d'**abonnement mensuel** par statut) :
   - Société → 29 €/mois · Auto-entreprise → 15 € · Entreprise individuelle → 15 € · Association → 9 € · Particulier → 9 €.
   - *(Vous pouvez aussi gérer la caution à part, ou ajouter un montant initial.)*
4. Pour chaque lien, dans les options : **Après le paiement → Rediriger les clients** vers :
   `https://www.boulogne-domiciliation.com/merci/`
5. Copiez chaque lien (`https://buy.stripe.com/...`) et collez-le dans **`config.js`**, à l'endroit prévu :

```js
stripe: {
  liens: {
    societe:     "https://buy.stripe.com/xxxxxxxx",
    auto:        "https://buy.stripe.com/yyyyyyyy",
    ei:          "https://buy.stripe.com/...",
    association: "https://buy.stripe.com/...",
    particulier: "https://buy.stripe.com/..."
  },
  retour: "/merci/"
}
```

> Tant que ces liens sont vides `""`, le tunnel fonctionne en **mode démonstration** (pas de vrai paiement) — pratique pour tester.

---

## 📧 ÉTAPE 5 — Envoyer automatiquement le contrat par e-mail (après paiement)

Objectif : **après le paiement**, le client reçoit son **contrat marqué SPÉCIMEN**, et **vous (Novadom)** recevez le dossier complet **pour vérification et demande de signature**.

Un site « statique » ne peut pas envoyer d'e-mail seul : on utilise un petit **automate no-code**. Le plus simple est **Make.com** (ou Zapier).

### Comment ça marche (le site envoie 2 signaux)
- Au clic sur **Payer**, le site envoie un signal `initiated` contenant **toutes les informations + les pièces déposées** (pièce d'identité, justificatif…).
- Sur la page **/merci/** (donc **après le paiement réussi**), le site envoie un signal `paid` qui déclenche l'**envoi des e-mails**.

Les deux signaux portent la **même référence `ND-...`** pour les relier.

### Mise en place avec Make.com (≈ 15 min)
1. Créez un compte sur **https://www.make.com**.
2. Nouveau scénario → premier module **« Webhooks → Custom webhook »** → **Add** → copiez l'URL générée (de type `https://hook.eu1.make.com/xxxxxxxx`).
3. Collez cette URL dans **`config.js`** :
   ```js
   endpointEnvoi: "https://hook.eu1.make.com/xxxxxxxx",
   ```
4. Dans Make, ajoutez un module **« Router »** puis deux branches selon le champ **`event`** :
   - **Branche `initiated`** → module **Email / Gmail → Send an email** : destinataire = **vous (Novadom)**. Mettez en pièces jointes les fichiers reçus (champ `documents`) et le contrat (`contractHtml`). Objet : « Nouveau dossier `{{reference}}` — à vérifier ».
   - **Branche `paid`** → **deux** envois d'e-mail :
     1. **Au client** (`{{emailClient}}`) : objet « Votre contrat de domiciliation (spécimen) — `{{reference}}` ». **Joignez le PDF** : dans Make, ajoutez une pièce jointe à partir du champ **`contractPdfBase64`** (contenu encodé en base64), avec pour nom de fichier **`{{contractPdfName}}`**. C'est le contrat **pré-rempli, marqué SPÉCIMEN**. (Vous pouvez aussi mettre `{{contractHtml}}` dans le corps du message.)
     2. **À Novadom** : « Paiement confirmé `{{reference}}` — contacter le client puis envoyer à signer » (joignez aussi le PDF si besoin).

> 💡 Le site fabrique le PDF tout seul dans le navigateur du client et l'envoie en base64 dans l'événement `paid`. Dans Make/Zapier, cherchez l'option « Convert base64 to file » (ou « Create file from base64 ») pour obtenir la pièce jointe.
5. **Activez** le scénario (interrupteur en bas à gauche).

> 💡 Variante encore plus simple (sans pièces jointes automatiques) : **Formspree** (https://formspree.io). Vous collez l'URL du formulaire dans `endpointEnvoi`, et vous recevez chaque dossier par e-mail. Make reste recommandé pour tout automatiser.

> Tant que `endpointEnvoi` est vide `""`, les e-mails sont **simulés** (rien n'est envoyé) — pour tester l'affichage.

---

## ✉️ ÉTAPE 6 — Activer les formulaires Contact & Rappel

Les pages **Contact** et **Demande de rappel** sont déjà prêtes. Pour recevoir réellement les messages par e-mail, une seule manipulation :

1. Créez un formulaire gratuit sur **https://formspree.io**. Vous obtenez une adresse du type `https://formspree.io/f/abcdwxyz`.
2. Copiez **uniquement l'identifiant** à la fin (ici `abcdwxyz`) et collez-le dans **`config.js`** :
   ```js
   formspree: "abcdwxyz",
   ```
3. C'est tout. Les deux formulaires enverront leurs messages à l'adresse e-mail associée à votre compte Formspree, avec un message de confirmation affiché au visiteur.

> Si vous laissez `formspree: ""`, le bouton ouvre directement le **logiciel de messagerie** du visiteur (pré-rempli vers votre e-mail) — pratique comme solution de repli sans inscription.

---

## 📑 ÉTAPE 7 — Le contrat : à faire valider ⚠️

Le contrat généré est un **modèle conforme** aux obligations du Code de commerce (articles L123-11-3, R123-166-1 et suivants), **pré-rempli** automatiquement avec les informations du client.

> **Important :** je ne suis pas avocat. Avant d'exploiter ce contrat avec de vrais clients, **faites-le relire et valider par votre conseil juridique** (avocat ou expert-comptable). Vous pourrez ensuite ajuster les articles dans `assets/js/config.js` (fonction `genererContrat`).

Pensez aussi à **compléter les mentions légales** (`mentions-legales/index.html`) :
- l'**hébergeur** est désormais **GitHub, Inc.** (88 Colin P. Kelly Jr Street, San Francisco, CA 94107, USA) ;
- ajoutez vos **CGV** et votre **politique de confidentialité (RGPD)**.

---

## 🔐 Note importante sur les données personnelles (RGPD)

Vos clients déposent des **pièces d'identité**. Avec ce montage, ces fichiers sont transmis à votre automate (Make/Zapier) puis à votre boîte e-mail. C'est fonctionnel, mais pour une **conformité RGPD optimale** sur des documents sensibles, je vous recommande à terme :
- un **stockage sécurisé dédié** (espace client avec accès restreint), plutôt que l'e-mail ;
- une **politique de confidentialité** claire et une **durée de conservation** définie.

C'est l'objet d'une éventuelle « phase 2 » (ajout d'un back-end sécurisé). Le site actuel est prêt à fonctionner et pourra évoluer.

---

## ✏️ Modifier le site plus tard

- **Changer un texte, un tarif, un lien** → modifiez le fichier concerné sur GitHub (cliquez sur le fichier → icône crayon ✏️ → **Commit changes**). Le site se met à jour tout seul en ~1 min.
- **Les tarifs, coordonnées, Stripe, e-mails, et le contrat** sont **tous** dans `assets/js/config.js`.
- **Le design** est intégré directement dans chaque page (dans la balise `<style>` en haut du fichier `.html`). C'est ce qui garantit un affichage correct même en double-clic, hors connexion.

---

## ✅ Récapitulatif express

1. Personnaliser `config.js` (e-mail, tarifs).
2. Uploader le dossier sur GitHub.
3. Activer GitHub Pages.
4. Domaine : `www` → `votrecompte.github.io`, et 4 « A » vers GitHub, côté OVH.
5. Créer les liens Stripe → les coller dans `config.js`.
6. Créer le webhook Make/Zapier → le coller dans `config.js`.
7. Brancher Contact/Rappel sur Formspree.
8. **Faire valider le contrat** et compléter les mentions légales.

Bonne mise en ligne ! 🎉
