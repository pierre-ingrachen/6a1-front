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

Prérequis : avoir créé le fichier `.env` du back (voir le README du back).

Depuis le dossier du front, lancer `npm run dev`. Cette commande :
1. démarre la base de données (`docker compose up -d` dans le back) ;
2. lance le back Spring Boot et le front Angular dans le même terminal (logs `back` en bleu, `front` en vert).

`Ctrl+C` arrête le back et le front. Le conteneur Docker reste actif ; pour l'arrêter : `cd ../6a1-back && docker compose down`.

### Scripts disponibles

| Commande | Action |
|---|---|
| `npm start` | Lance le front (`ng serve`) |
| `npm run db` | Démarre la base de données via Docker |
| `npm run back` | Lance le back (`./mvnw spring-boot:run`) |
| `npm run dev` | Lance la base, le back et le front ensemble |
