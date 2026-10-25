# Plan : jeu type 7a0 (Ligue des Champions)

## Règles du jeu

1. Tirage au sort d'une équipe-saison au hasard (ex : Borussia Dortmund 2012/13).
2. À chaque tour, l'utilisateur peut :
   - choisir un joueur de l'équipe tirée pour le mettre dans la sienne ;
   - ou tirer une autre année de la même équipe (ex : Dortmund 2016/17) ;
   - ou tirer une autre équipe de la même année (ex : Real Madrid 2012/13).
3. Après 11 choix, l'équipe du joueur est complète.
4. Un moteur de simulation joue la compétition : phase de poules, puis phase à élimination directe, en comparant l'équipe du joueur à l'équipe affrontée (ex : mon équipe contre PSG 2016/17).
5. Le joueur ne gagne la Ligue des Champions que s'il a fait de très bons choix.
   - En finale, l'adversaire est une équipe qui a réellement joué une finale.
   - En demi-finale, l'adversaire est une équipe qui a réellement atteint les demi-finales.
   - Même principe pour chaque tour.

## 1. Données à préparer

- **Force d'une équipe-saison** : indice calculé par couple (équipe, saison) à partir des notes.
  - Équipe adverse : ses 11 meilleurs joueurs, un par poste selon la formation.
  - Équipe du joueur : les 11 joueurs choisis.
  - Les deux utilisent la même fonction, sinon la comparaison est biaisée.
- **Force par ligne** : attaque, milieu, défense, gardien, plutôt qu'un seul chiffre. Une équipe déséquilibrée est pénalisée.
- **Tour atteint** : `eliminationRound` (dans `PlayerSeasonStats`) donne le tour d'élimination de chaque équipe-saison. On en déduit les pools d'adversaires : poules, 8es, quarts, demies, finale, vainqueur.
- **Filtre de fiabilité** : ignorer les joueurs avec trop peu de minutes (tirage et force des adversaires).
- **Postes** : normaliser `position` en 4 lignes (gardien, défenseur, milieu, attaquant) via une table de correspondance.

## 2. Phase de draft (11 choix)

**Modèle de partie** : id, équipe-saison en cours de tirage, joueurs choisis, choix restants, relances restantes.

**Actions possibles à chaque tour** : choisir un joueur (consomme un choix), relancer sur une autre année, relancer sur une autre équipe.

**Questions de règles à trancher**
- Relances : illimitées ou non ? Recommandation : quota limité (3 à 5), ou une relance qui coûte un choix.
- Formation : imposée (1 gardien, 4 défenseurs, 3 milieux, 3 attaquants) ou libre ? Recommandation : imposée.
- Doublons : interdire le même joueur deux fois, même sur deux saisons.

**Endpoints**
- `POST /games` : crée la partie et tire la première équipe.
- `POST /games/{id}/picks` : choisit un joueur.
- `POST /games/{id}/redraws` avec `{type: "season" | "team"}` : relance.
- `GET /games/{id}` : état de la partie.

Le tirage et l'état de la partie sont gérés côté serveur (anti-triche).

## 3. Moteur de simulation

**Structure de la compétition**
- **Poules** : 8 matchs (ou autre format) contre des équipes tirées dans un pool de phase de ligue. Classement par points, qualification selon le rang.
- **Phases finales** : 8es, quarts, demies, finale. Chaque adversaire est tiré dans le pool de ceux qui ont réellement atteint ce tour.
- **Adversaires** : tirage aléatoire sans réutiliser une même équipe (même sur une autre saison), et sans reprendre un adversaire déjà rencontré en poule.

**Simulation d'un match**
- Comparer les forces par ligne pour obtenir une espérance de buts de chaque côté.
- Tirer les buts avec une loi de Poisson : l'outsider garde une chance.
- En élimination directe : prolongations et tirs au but en cas d'égalité (ou aller-retour).
- Calibrage : une équipe de rêve gagne souvent mais pas toujours, une équipe moyenne presque jamais. Réglé par un coefficient d'écart de force.

**Rejouabilité et vérification**
- `Random` seedé, graine stockée dans la partie : résultat rejouable, tests déterministes.
- Test de calibrage : simuler des milliers de compétitions et vérifier la distribution (ex : moins de 2 % de victoires pour une équipe médiocre).

**Endpoint**
- `POST /games/{id}/simulation` : lance la compétition, renvoie le détail de chaque match (adversaire, score, tour) et le résultat final. 409 si la draft n'est pas terminée.

## 4. Architecture back

- **Records** : `TeamSeason`, `DraftState`, `MatchResult`, `CompetitionResult`, `LineStrength`.
- **Services** : `TeamDrawService`, `DraftService`, `TeamStrengthService`, `MatchSimulator`, `CompetitionSimulator`, `GameService`.
- **Contrôleurs** : validation et traduction en codes HTTP uniquement, aucune logique métier.
- Streams pour tous les calculs sur les collections.

## 5. Front (feature `game/`, standalone + signals)

- `draft-board` : terrain avec les 11 emplacements.
- `team-draw-card` : l'équipe-saison tirée et ses joueurs.
- `redraw-actions` : boutons « autre année » et « autre équipe », quota restant.
- `player-card` : composant réutilisable pour un joueur.
- `competition-result` : arbre de la compétition avec les scores.
- `game.service` : appels HTTP, `async` pipe ou `takeUntilDestroyed`.
- `computed` signals pour la force de l'équipe en cours de construction.

## 6. Tests

- **Unitaires** : `TeamStrengthService`, `MatchSimulator` (avec seed), `DraftService` (formation, quotas, doublons).
- **Calibrage statistique** : N simulations pour vérifier les probabilités de victoire selon la qualité de l'équipe.
- **Intégration** : endpoints (409 si draft incomplète, 404 si partie inconnue, 400 si choix invalide).
- **Front** : `draft-board`, `redraw-actions`.

## 7. Ordre de réalisation

1. Normaliser les postes, calculer la force d'une équipe-saison, construire les pools d'adversaires par tour.
2. `MatchSimulator` testé avec seed.
3. `CompetitionSimulator` et test de calibrage (régler la difficulté avant toute UI).
4. Draft : tirage, choix, relances, quota.
5. Endpoints et orchestration.
6. UI de la draft, puis UI de la compétition.
7. Finitions : historique des parties, classement, partage de l'équipe.

Risque principal : le calibrage de la simulation, d'où son passage avant l'interface.

## Décisions en attente

- Relances limitées ou illimitées ?
- Formation imposée ou libre ?
