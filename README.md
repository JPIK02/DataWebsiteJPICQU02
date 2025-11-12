# GitHub Pages — Starter (statique)

Ce dépôt est prêt pour déployer un site **statique** via **GitHub Pages** avec une **Action**.

## Utilisation rapide
1. Créez un dépôt GitHub vide et poussez ces fichiers (**branche `main`**).
2. Dans **Settings → Pages**, mettez **Build and deployment → Source: GitHub Actions**.
3. Sur chaque `git push` de `main`, l'Action va publier votre site.

URL finale : `https://<votre-utilisateur>.github.io/<nom-du-depot>/`  
(ou votre domaine personnalisé, voir plus bas)

## Déploiement local (optionnel)
Pas nécessaire : c'est un site statique (juste HTML/CSS).

## Domaine personnalisé (optionnel)
- Ajoutez un enregistrement **CNAME** de votre domaine vers `<utilisateur>.github.io` chez votre registrar.
- Ajoutez un fichier `CNAME` à la racine du dépôt contenant votre domaine : `www.mondomaine.com`.
- Activez **Enforce HTTPS** dans **Settings → Pages**.

---

_Starter créé automatiquement pour vous._