# 6a1-front — Champions League Dream Team

Application Angular 17 pour explorer les statistiques de la Ligue des champions (2010/11 → 2025/26) et jouer à **Dream Team** : composer une équipe de 11 joueurs à partir d'effectifs tirés au hasard, puis la voir affronter une campagne de Ligue des champions simulée.

L'API associée est le dépôt [6a1-back](https://github.com/pierre-ingrachen/6a1-back).

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Prérequis](#prérequis)
3. [Lancer le projet](#lancer-le-projet)
4. [Scripts](#scripts)
5. [URL de l'API](#url-de-lapi)
6. [Architecture](#architecture)
7. [Tests et qualité](#tests-et-qualité)
8. [Intégration continue et hooks git](#intégration-continue-et-hooks-git)
9. [Maquette de la composition](#maquette-de-la-composition)
10. [Consignes et agents IA](#consignes-et-agents-ia)

## Fonctionnalités

| Route | Page |
|---|---|
| `/` | Accueil et accès rapides |
| `/jeu` | Jeu Dream Team : choix de la formation, draft, re-tirages, simulation, résultats |
| `/teams` | Clubs : choix d'une équipe et d'une saison, effectif trié |
| `/joueurs` | Recherche de joueurs |
| `/joueurs/:playerId` | Fiche d'un joueur : statistiques par saison et percentiles |
| `/compare` | Comparaison de deux joueurs, statistique par statistique |
| `/lineup` | Démonstration du composant de composition d'équipe (pelouse, maillots, formations), disponible en développement uniquement |
| `**` | Page 404 |

## Prérequis

- [Node.js](https://nodejs.org/en/download) (version LTS) et npm
- Google Chrome (pour les tests Karma)
- Docker (base de données) et Java 17 (back), uniquement pour lancer toute la pile

Angular CLI n'est pas à installer globalement : les scripts npm utilisent la version du projet.

## Lancer le projet

Installer les dépendances (une seule fois) :

```bash
npm install
```

### Front seul

```bash
npm start
```

Puis ouvrir `http://localhost:4200/`. Les pages qui appellent l'API ont besoin du back (`http://localhost:8080`).

### Front + back + base de données en une commande

Les dépôts front et back doivent être clonés **côte à côte** dans le même dossier parent :

```
mon-dossier/
├── 6a1-back/
└── 6a1-front/
```

Prérequis : Docker Desktop lancé, et le fichier `.env` du back créé (voir le README du back). Le script charge ce `.env` automatiquement (compatible Windows, macOS et Linux).

Depuis le dossier du front :

```bash
npm run dev
```

Cette commande :
1. démarre la base de données (`docker compose up -d` dans le back) ;
2. lance le back Spring Boot et le front Angular dans le même terminal (logs `back` en bleu, `front` en vert). Swagger est activé en local sur `http://localhost:8080/swagger-ui/index.html`.

`Ctrl+C` arrête le back et le front. Le conteneur Docker reste actif ; pour l'arrêter : `docker compose -f ../6a1-back/docker-compose.yml down`.

## Scripts

| Commande | Action |
|---|---|
| `npm start` | Lance le front (`ng serve`, mode développement) |
| `npm run build` | Build de production dans `dist/front-skeleton` |
| `npm run watch` | Build de développement en continu |
| `npm test` | Tests unitaires Karma/Jasmine (mode interactif) |
| `npm run db` | Démarre la base de données via Docker |
| `npm run back` | Lance le back (Maven wrapper, avec le `.env`) |
| `npm run dev` | Lance la base, le back et le front ensemble |

## URL de l'API

Les services HTTP n'écrivent aucune URL en dur : ils passent par `ApiUrlService`, qui préfixe chaque chemin avec `environment.apiUrl`.

| Environnement | Fichier | Valeur de `apiUrl` |
|---|---|---|
| Développement (`ng serve`) | `src/environments/environment.ts` | `http://localhost:8080` |
| Production (`ng build`) | `src/environments/environment.prod.ts` | `/api` |

En production, `/api` est une URL relative : le front doit être servi derrière un reverse proxy qui redirige `/api/*` vers le back en retirant le préfixe `/api` (par exemple `location /api/ { proxy_pass http://back:8080/; }` avec nginx). Pour pointer directement vers un back hébergé ailleurs, remplacer la valeur par son URL complète avant le build, et ajouter l'origine du front dans `app.cors.allowed-origins` côté back.

## Architecture

Le code est organisé **par fonctionnalité**, avec des composants standalone, des signals et le chargement différé des routes (aucun NgModule). Les imports sont relatifs à `src/app` (`baseUrl` dans `tsconfig.json`, ex. `import … from "services/api-url.service"`).

```
src/app/
├── app.config.ts, app.routes.ts   Providers (router, HttpClient, animations) et routes chargées à la demande
├── home/         Accueil et animation « dream team »
├── game/         Jeu : page, tirage, plateau, banc, simulation, résultats
│   ├── services/    GameApiService (HTTP), GameSessionService (état de la partie)
│   ├── models/      Types de l'API du jeu
│   └── utils/       Fonctions pures (placement, formations, chronologie des matchs…)
├── lineup/       Composition d'équipe réutilisable : pelouse, maillots, formations
├── teams/        Liste des clubs, cartes et tri des joueurs
├── players/      Recherche et fiche joueur
├── compare/      Comparaison de deux joueurs
├── shared/       Éléments d'interface partagés
├── navbar/, not-found/
├── services/     Services du catalogue : ApiUrlService, TeamService, PlayerService, SeasonService
├── models/       Types du catalogue
└── utils/        LoadState, tri, libellés, intercepteur d'erreurs HTTP
```

Principes suivis :

- **Un composant, une responsabilité** : les composants sont petits et réutilisables ; la logique pure vit dans des fonctions testées (`utils/`).
- **Signals et `OnPush`** pour l'état et le rendu.
- **Pas de fuite mémoire** : les abonnements passent par le pipe `async`, `toSignal` ou `takeUntilDestroyed`.
- **État de chargement uniforme** : `toLoadState` transforme un `Observable` en `idle` / `loading` / `loaded` / `error`, pour afficher chargement et erreurs de la même façon partout.
- **Erreurs HTTP** journalisées en développement par `httpErrorLoggingInterceptor`.
- **Styles** : SCSS, Angular Material (`src/theme.scss`) et Bootstrap (`src/bootstrap/`).

## Tests et qualité

```bash
npm test                                              # Karma en mode interactif
npx ng test --watch=false --browsers=ChromeHeadlessCI # exécution unique, comme en CI
```

Les tests couvrent les services (`HttpTestingController`), les fonctions utilitaires et les composants principaux. Le rapport de couverture est généré dans `coverage/front-skeleton/`.

## Intégration continue et hooks git

- **CI** (`.github/workflows/ci.yml`, à chaque push et pull request) : garde de règles, tests Karma en Chrome headless, puis `ng build`.
- **Garde de règles** (`.githooks/audit-guard.sh`) : détecte les violations de règles sur les fichiers modifiés (`--all` pour tout le dépôt), notamment les `subscribe` sans nettoyage, les flux HTTP sans gestion d'erreur et les URL en dur. Les exceptions sont déclarées avec leur justification dans `.githooks/audit-guard.allow` (vide à ce jour ; format `règle|chemin|justification`).
- **Hook pre-commit** : lance le garde avant chaque commit. Après un clone, l'activer avec :
  ```bash
  git config core.hooksPath .githooks
  ```

## Maquette de la composition

La page `/lineup` doit rester fidèle à l'image de référence `src/reference/lineup.png`. Le script de comparaison visuelle (`npm start` doit tourner) capture la page, affiche le pourcentage de pixels différents, écrit `diff.png` et enregistre des captures à 360, 768, 1280 et 1920 px :

```bash
node scripts/lineup-visual-diff.mjs [dossier-de-sortie]   # défaut : scripts/out
```

Il utilise Playwright (`npx playwright install chromium` la première fois) ; l'URL se change avec `LINEUP_URL`.

## Consignes et agents IA

Les consignes données à Claude Code pour les deux dépôts sont versionnées ici :

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Règles du projet (back, front, audit) |
| `.claude/agents/auditor.md` | Sous-agent d'audit en lecture seule (verdict PASS/FAIL avec preuves) |
| `.claude/commands/audit.md` | Commande `/audit [back \| front \| chemin]` |
| `.claude/settings.json`, `.claude/hooks/` | Hooks : le garde de règles tourne après chaque édition et à la fin de chaque tâche |
| `docs/ia/PLAN_7A0.md` | Plan initial du jeu |
| `docs/ia/AUDIT.md` | Rapport d'audit du 22/10/2026 (historique, les chiffres ont pu évoluer depuis) |

Ouvrir Claude Code dans `6a1-front`, avec `6a1-back` cloné à côté. Le test du garde se lance avec `bash .githooks/audit-guard.test.sh`.
