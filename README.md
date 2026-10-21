# FrontSkeleton

## Les installations nécessaires
- Node JS : https://nodejs.org/en/download
- Angular : `npm install -g @angular/cli`
- Docker (pour la base de données) et Java 17 (pour le back)

## Avant de lancer le projet

Lancer `npm i`

## Pour lancer le projet
`npm run dev`

### Front seul
Lancer `npm start` et se rendre sur `http://localhost:4200/`

### Front + back + base de données en une commande
Les dépôts front et back doivent être clonés **côte à côte** dans le même dossier parent :

```
mon-dossier/
├── 6a1-back/
└── 6a1-front/
```

Prérequis : Docker Desktop lancé, et le fichier `.env` du back créé (voir le README du back). Le script charge ce `.env` automatiquement (compatible Windows, macOS et Linux).

Depuis le dossier du front, lancer `npm run dev`. Cette commande :
1. démarre la base de données (`docker compose up -d` dans le back) ;
2. lance le back Spring Boot et le front Angular dans le même terminal (logs `back` en bleu, `front` en vert).

`Ctrl+C` arrête le back et le front. Le conteneur Docker reste actif ; pour l'arrêter : `docker compose -f ../6a1-back/docker-compose.yml down`.

### Scripts disponibles

| Commande | Action |
|---|---|
| `npm start` | Lance le front (`ng serve`) |
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
