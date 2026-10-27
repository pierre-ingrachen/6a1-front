---
name: verify-readme
description: Vérifie que chaque affirmation des README de 6a1-front et 6a1-back correspond au code réel (fichiers, commandes, endpoints, valeurs par défaut, versions). À utiliser après toute modification du code, de la configuration ou d'un README, et avant un rendu.
argument-hint: "[back | front]"
---

Vérifie les README de `6a1-front` (dépôt courant) et de `../6a1-back` (dépôt voisin) contre le code. Périmètre demandé : $ARGUMENTS (vide : les deux dépôts). Le dossier parent des deux dépôts n'est jamais une source ni un périmètre.

Pour chaque README, lis-le en entier puis vérifie chaque affirmation par une commande ou une lecture de code, sans te fier à un rapport précédent :

1. **Fichiers et dossiers cités** : ils existent (`ls`, `git ls-files`) et sont suivis par git.
2. **Commandes** : chaque commande du README existe (`package.json`, `mvnw`, `docker-compose.yml`) et s'exécute. Quand Docker tourne, lance-les ; sinon dis explicitement ce qui n'a pas pu être exécuté.
3. **Endpoints et codes HTTP** : ils correspondent aux contrôleurs et aux gestionnaires d'erreurs.
4. **Valeurs numériques et propriétés** (limites, durées, minutes, nombre de formations, défauts de configuration) : ils correspondent au code (`grep` de la constante ou de `@Value`).
5. **Versions** (Java, Spring Boot, Angular, PostgreSQL, bibliothèques) : elles correspondent à `pom.xml` et `package.json`.
6. **État git** : si le README parle de ce qui est publié, vérifie avec `git fetch` puis `git rev-list --count origin/main..HEAD`.
7. **Installation sur Windows et macOS** : chaque étape existe pour les deux systèmes, sinon signale-le.

Rends un tableau « affirmation | verdict (exact / inexact / non vérifiable) | preuve ». Les affirmations inexactes sont listées en premier avec la correction proposée. Ne modifie aucun README avant d'avoir affiché le rapport, et ne conclus pas « exact » sur ce que tu n'as pas pu vérifier.
