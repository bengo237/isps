# Cap Sûreté : deux maquettes de site

Deux propositions de site pour un cabinet de conseil et de formation au code ISPS (sûreté des navires et des installations portuaires), avec un volet cybersécurité. Site statique en HTML, CSS et JavaScript, sans dépendance ni service tiers, prêt pour GitHub Pages.

Les noms et profils de l'équipe sont fictifs. La marque « Cap Sûreté » est provisoire.

## Les deux modèles

| | Modèle 1 : Escale | Modèle 2 : Vigie |
|---|---|---|
| Approche | Conseil, épuré, une seule page | Formation et terrain, quatre pages |
| Entrée du visiteur | Diagnostic ISPS en six questions | Choix du profil (direction, sûreté, compagnie, informatique) |
| Élément central | Plan d'action calculé à partir des réponses | Explorateur interactif d'une installation portuaire, niveaux 1 à 3 |
| Parcours | Diagnostic, étapes de la mission, services, équipe, rendez-vous prérempli | Profil, explorateur, catalogue avec sélection, équipe et matrice de compétences, demande en trois étapes |
| Style | Blanc, vert de balisage, une seule police (Schibsted Grotesk) | Gris de quai, bleu nuit, orange de sécurité, police à largeur variable (Archivo) |

## Structure

```
index.html                 page de choix entre les deux modèles
choix.css
modele-1-escale/
  index.html               page unique
  mentions-legales.html
  assets/css/escale.css
  assets/js/escale.js      diagnostic, étapes, équipe, formulaire
  assets/fonts/            police et licence OFL
modele-2-vigie/
  index.html               accueil par profil et explorateur
  formations.html          catalogue, recherche, filtres, sélection
  equipe.html              matrice de compétences et parcours
  demande.html             demande en trois étapes
  mentions-legales.html
  assets/css/vigie.css
  assets/js/data.js        contenus : profils, points du plan, formations, équipe
  assets/js/vigie.js       interactions
  assets/fonts/            police et licence OFL
.nojekyll
```

Chaque dossier `modele-*` fonctionne seul : on peut le publier sans l'autre.

## Mise en ligne sur GitHub Pages

**Par l'interface web**
1. Créer un dépôt public, par exemple `cap-surete`.
2. *Add file > Upload files* : déposer le contenu du dossier (y compris `.nojekyll`).
3. *Settings > Pages* : *Deploy from a branch*, branche `main`, dossier `/ (root)`.
4. Après une à deux minutes : `https://<compte>.github.io/cap-surete/`.

**En ligne de commande**
```bash
git remote add origin https://github.com/<compte>/cap-surete.git
git push -u origin main
```
puis activer Pages comme à l'étape 3.

**Nom de domaine** : ajouter un fichier `CNAME` contenant le domaine, créer un enregistrement CNAME vers `<compte>.github.io` chez le registraire, puis cocher *Enforce HTTPS*.

## Avant l'ouverture au public

1. Choisir un modèle et, si besoin, déplacer son contenu à la racine.
2. Remplacer les profils fictifs par l'équipe réelle (modèle 1 : `index.html`, modèle 2 : `assets/js/data.js`).
3. Retirer la bande « Maquette de démonstration » (balise `<p class="demo-note">`).
4. Supprimer la ligne `<meta name="robots" content="noindex, nofollow">` de chaque page.
5. Remplacer `contact@capsurete.example` et le numéro de téléphone.
6. Compléter les mentions légales (raison sociale, RCCM, NIU, siège, directeur de la publication).
7. Faire valider les durées de formation, qui sont indicatives.

## Points à valider

- **Références** : les expériences citées ont été acquises chez de précédents employeurs. Elles restent anonymisées ; citer un nom d'installation seulement avec l'accord écrit de celle-ci.
- **Statut** : ne pas se présenter comme organisme de sûreté reconnu avant la décision de l'autorité désignée.
- **Nom** : vérifier la disponibilité de la marque (registre de commerce, OAPI, nom de domaine, réseaux sociaux).

## Données et sécurité

- Aucun cookie, aucun outil de mesure d'audience, aucune ressource chargée depuis un site tiers.
- Politique de sécurité du contenu stricte sur chaque page (scripts et styles du site uniquement).
- Les formulaires ouvrent la messagerie du visiteur : rien n'est envoyé à un serveur.
- Modèle 2 : le profil choisi et la sélection de formations sont gardés dans le navigateur du visiteur (stockage local), pour éviter de les ressaisir d'une page à l'autre.

## Propriété

Le code, les textes et les illustrations de ce dépôt sont la propriété exclusive de leur titulaire (voir `LICENSE`). Les polices Schibsted Grotesk et Archivo sont distribuées sous licence SIL Open Font License 1.1, dont le texte accompagne chaque police dans `assets/fonts/OFL.txt`.
