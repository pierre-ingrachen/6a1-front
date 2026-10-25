# AUDIT — 6 à 1 (Angular 17 + Spring Boot 3.1)

Date : 2026-10-22 (mise à jour de l'audit du 2026-10-21, tout a été réexécuté) · Périmètre : `6a1-back/` (API Spring Boot, Java 17) et `6a1-front/` (Angular 17), plus la racine du dépôt (scripts, hooks, CI, SQL).
Mode : lecture seule. Seul fichier créé : ce `AUDIT.md`. (Seule trace d'exécution : `ng build` réécrit `6a1-front/dist/`, ignoré par git.)

Légende : **[F]** fait vérifié dans le code ou par une commande · **[H]** hypothèse à confirmer.

---

## 1. Résumé exécutif

Application saine et bien structurée pour un projet scolaire : back en couches propres, DTO en `record`, `@RestControllerAdvice` complet, **337 tests back (0 échec) et 179 tests front verts, couverture front 94 % des lignes**, front 100 % standalone/lazy-loadé avec signals et `OnPush` sur 28 composants sur 31. Le jeu est **autoritatif côté serveur** (tirage, éligibilité des postes, simulation, graine jamais exposée).

Les risques se concentrent sur l'**exposition** : aucune authentification ni limitation de débit, donc un seul client peut saturer les 1000 parties en mémoire et bloquer le jeu pendant 2 h. Swagger UI est exposé par défaut. Spring Boot 3.1.3 est hors support (Tomcat 10.1.12 et Spring 6.0.11 embarqués). La configuration de production est incomplète (pas de Dockerfile, front en `/api` alors que le back n'a pas ce préfixe, pas de proxy). Côté front, `npm audit` remonte 99 vulnérabilités, dont 10 dans les dépendances de production (aucune critique, mais 4 élevées dans `@angular/core <= 19.2.25`), et un logo de 236 ko affiché en 135 px pèse plus que tout le JS applicatif initial en transfert compressé.

| Axe | Note | Justification |
|---|---|---|
| Sécurité | **5 / 10** | Surface de données publique, donc peu d'enjeu de confidentialité, mais pas de rate limiting (DoS applicatif réel), Swagger exposé, framework EOL, CORS sans profil prod. |
| Qualité du code | **8 / 10** | Architecture claire, jeu testé en profondeur (337 tests back, 179 front, 94 % de lignes couvertes côté front) ; points faibles : couverture back non mesurée, tests d'intégration Postgres ignorés sans Docker, JPA/JDBC mélangés, erreurs HTTP avalées côté front. |
| Propreté | **6,5 / 10** | Code très propre, mais trois dépôts git imbriqués/divergents, `.DS_Store` suivi, README back obsolète, pas de Dockerfile, pas de linter front ni de couverture. |
| Éco-conception | **5,5 / 10** | JS initial raisonnable (111 ko transférés), mais logo 7× surdimensionné, polices Google externes, aucun cache HTTP ni compression configurés, 2,4 Mo de PNG de référence suivis dans git. |

---

## 2. Architecture comprise

```
Navigateur (Angular 17, standalone, lazy routes, signals)
   │  HTTP/JSON  (dev: http://localhost:8080 · prod: "/api" → reverse proxy NON fourni)
   ▼
Spring Boot 3.1.3 (Java 17)  ── pas de Spring Security, pas d'Actuator
 ├─ controllers : Player /players, Team /teams, Season /seasons, Formation /formations, Game /games
 ├─ services    : PlayerService + PercentileCalculator + SeasonStatsCache/PlayerSearchIndex (cache TTL 24 h, ExpiringLazy)
 │                game.service : GameService → DraftService / TeamDrawService / DraftEligibility
 │                               → CompetitionSimulator / MatchSimulator (Poisson) / TeamStrengthService / TeamSeasonCatalog
 ├─ DAO         : JPA (Player, Team, Season) + JdbcTemplate (stats, TeamSeasonSource) + requêtes natives
 └─ état de jeu : InMemoryGameRepository (ConcurrentHashMap, TTL 2 h, plafond 1000) + GameLocks (1 ReentrantLock / partie)
        │
        ▼
PostgreSQL (docker-compose, 127.0.0.1:5432) — tables equipe, joueur, saison, stats_joueur_saison, parcours_equipe_saison
```

Le jeu : `POST /games` (formation) → tirage d'une équipe-saison → `POST /picks` / `/moves` / `/redraws` (3 redraws) → `POST /simulation` (poules + phase finale, partie supprimée ensuite). Aucun compte, aucun score persistant, aucun classement.

Pipeline : CI GitHub Actions dans chaque sous-dépôt (`./mvnw verify`, `ng test` + `ng build`) + garde `audit-guard.sh` (hooks git et Claude Code).

---

## 3. Constats détaillés

### 3.1 Sécurité

| ID | Sévérité | Fichier:ligne | Problème | Impact | Correctif recommandé |
|---|---|---|---|---|---|
| S1 | **Élevée** [F] | `game/service/GameService.java:59-62`, `:113-119` ; `GameController.java:34-38` | `POST /games` est public et sans limitation de débit. Le plafond `game.max-active-games` (1000) est atteint après 1000 appels ; `removeIdleGames` ne purge que les parties inactives depuis plus de 2 h (`GAME_IDLE_TTL`). | Un script suffit à renvoyer `503 GameCapacityReached` à tous les joueurs pendant 2 h (déni de service applicatif). Le plafond protège la mémoire mais pas la disponibilité. | Rate limiting par IP (Bucket4j, ou limite au reverse proxy nginx `limit_req`). Plafond par IP/client. Réduire le TTL des parties non commencées (ex. 15 min si `picks` vide). |
| S2 | **Élevée** [F] | `pom.xml:46-48` | `springdoc-openapi-starter-webmvc-ui` en `compile`, aucune propriété de désactivation : `/swagger-ui.html` et `/v3/api-docs` sont servis en production. | Cartographie complète de l'API pour un attaquant ; Swagger UI 5.2.0 embarqué à maintenir. | `springdoc.api-docs.enabled=${SWAGGER_ENABLED:false}` et `springdoc.swagger-ui.enabled=…` dans un profil `prod`, ou scope `runtime` dans un profil Maven dev. |
| S3 | **Élevée** [F] puis [H] | `pom.xml:8` (`spring-boot-starter-parent 3.1.3`) ; arbre Maven : `tomcat-embed-core 10.1.12`, `spring-webmvc 6.0.11`, `jackson-databind 2.15.2`, `postgresql 42.6.0`, `snakeyaml 1.33`, `swagger-ui 5.2.0` (webjar) | Spring Boot 3.1.x est hors support OSS depuis 2024. Les versions résolues datent de 2023. [H] Plusieurs CVE publiées depuis visent ces versions (Tomcat, Spring Framework, driver PostgreSQL) ; non vérifié ici car aucun scanner (OWASP Dependency-Check, `mvn versions:`) n'a été exécuté. | Exposition à des CVE connues sur un service public. | Monter à Spring Boot 3.5.x (ou 4.x) puis `mvn org.owasp:dependency-check-maven:check` en CI ; Dependabot sur `pom.xml`. |
| S4 | **Moyenne** [F] puis [H] | `package.json` (Angular 17.1.0, `rxjs ~7.5.0`) ; `npm audit` | `npm audit` : **99 vulnérabilités** (7 faibles, 33 moyennes, 53 élevées, 6 critiques : `concurrently`, `piscina`, `proxy-addr`, `shell-quote`, `tar`, `websocket-driver`). Avec `--omit=dev` : **10** (6 moyennes, 4 élevées) ; les 6 critiques sont toutes en outillage de build/dev. Angular 17 n'est plus maintenu. Les 10 vulnérabilités de runtime (`npm audit --omit=dev`) sont des avis XSS d'`@angular/core` (i18n, SVG, namespaces, hydratation) corrigés seulement en Angular ≥ 20 [F]. | [H] L'application n'utilise ni i18n, ni SSR/hydratation, ni `innerHTML`, donc l'exploitabilité semble faible, mais ces conditions ne sont pas vérifiées exhaustivement. Le reste concerne les postes de dev et la CI ; le reste concerne les postes de dev et la CI (chaîne d'approvisionnement). | Migrer vers Angular 19/20 LTS (`ng update`), `npm audit fix` pour les correctifs sans rupture, `npm ci` strict en CI. |
| S5 | **Moyenne** [F] | `config/CorsConfig.java:12-18` | CORS : origine par défaut `http://localhost:4200`, configurable par `app.cors.allowed-origins` mais **aucune valeur de prod** n'existe dans `application.properties`. Pas de `allowedMethods`, donc GET/HEAD/POST seulement (correct pour l'instant). Pas de joker `*` (bien). | Si la prod oublie la propriété, le front déployé est bloqué (panne) ; si quelqu'un met `*` pour dépanner, l'API s'ouvre à tout site. | Créer `application-prod.properties` avec l'origine réelle ; valider qu'elle n'est ni vide ni `*` au démarrage. |
| S6 | **Moyenne** [F] | `environments/environment.prod.ts:3` ; `application.properties` | Le front de prod appelle `/api/...` mais aucun contrôleur n'est préfixé `/api` et aucun proxy (nginx, `proxy.conf`) ni `server.servlet.context-path` n'existe dans le dépôt. | En l'état, un déploiement tel quel donne des 404 sur toute l'API. Risque de contournement « à la hâte » (CORS ouvert). | Documenter/fournir le reverse proxy (`location /api/ { proxy_pass …/; }`) ou fixer `server.servlet.context-path=/api`. |
| S7 | **Moyenne** [F] | `game/controller/GameController.java:40-63` | Aucune authentification ; le seul secret est l'UUID de la partie (122 bits aléatoires : non devinable). Un UUID obtenu (URL partagée, logs du proxy) permet de jouer à la place du joueur. | Faible tant qu'il n'y a ni score persistant ni classement. Deviendra un problème dès qu'un score ou un pseudo sera enregistré. | Aujourd'hui, acceptable : à documenter. Si classement : jeton de partie signé renvoyé à la création et exigé en en-tête. |
| S8 | **Faible** [F] | `game/service/GameService.java:81-94` | Intégrité du jeu : très bonne. Le serveur seul tire les équipes (`TeamDrawService`, `Random(seed + drawCount × stride)`), vérifie le joueur proposé (`DraftService.java:36-39`), le poste (`:47`), la case libre (`:44`) ; la graine n'est pas dans `GameView`. Réserve : le résultat est déterministe par partie, donc un client peut rejouer `/picks` sur plusieurs parties pour comparer des tirages. | Sans classement, aucun enjeu. | Rien d'obligatoire. Si un classement apparaît, ne persister que les scores calculés serveur et rate-limiter la création de parties. |
| S9 | **Faible** [F] | `GameLocks.java:25-27`, `GameService.java:104-111` | Course sur les verrous : `release()` retire le verrou de la map alors qu'un autre thread peut déjà l'attendre ; un nouveau thread créerait alors un second verrou pour le même id. | Pour `simulate`, la partie est supprimée donc aucune corruption possible ; la fenêtre est négligeable. | Laisser tel quel, ou verrouiller via `ConcurrentHashMap.compute` côté dépôt. |
| S10 | **Faible** [F] | `application.properties` (3 lignes) | Aucun réglage défensif : `server.error.include-stacktrace` est à `never` par défaut (bien, et `GlobalExceptionHandler.java:29-33` masque les 500), mais pas de limite de taille de requête explicite, pas de timeouts, pas d'en-têtes de sécurité (`X-Content-Type-Options`, CSP). | Durcissement manquant, pas de faille directe. | `server.tomcat.max-swallow-size`, `spring.mvc.async.request-timeout`, en-têtes via le reverse proxy (CSP stricte côté Angular). |
| S11 | **Faible** [F] | `.env` (non suivi, `.gitignore` l'ignore), `.env.sample` | Secrets : pas de mot de passe en dur dans le code ni dans l'historique visible des dépôts. `.env.sample` vide, `docker-compose` n'expose Postgres que sur `127.0.0.1` (bien). | Aucun. [H] La robustesse du mot de passe réel du `.env` n'a pas été vérifiée. | RAS ; à la mise en ligne, secrets via variables d'environnement de la plateforme. |
| S12 | **Faible** [F] | `src/index.html:9-11` | Le navigateur charge Roboto et Material Icons depuis `fonts.googleapis.com` : l'IP de chaque visiteur est transmise à Google. | Écart RGPD (transfert à un tiers sans consentement), voir aussi §3.4. | Héberger les polices (`@fontsource`, déjà utilisé pour Nunito). |
| S13 | **Info** [F] | injections, XSS, CSRF | **Aucune injection SQL** : toutes les requêtes sont des constantes ou des paramètres liés (`:season`, `?`, `:teamId`). `String.formatted` dans `PlayerSeasonStatsDao.java:36` n'insère que des noms de colonnes issus de l'enum `Stat`. **Aucun XSS** : pas d'`innerHTML`, de `bypassSecurityTrust*`, ni de `[innerHTML]` dans le front. **CSRF non applicable** : API sans cookie ni session. | — | À conserver. |

### 3.2 Qualité du code et architecture

| ID | Sévérité | Fichier:ligne | Problème | Impact | Correctif recommandé |
|---|---|---|---|---|---|
| Q1 | **Moyenne** [F] | `DAO/PlayerSeasonStatsDao.java:38-44`, `services/PlayerSearchIndex.java:50-52` | `findAllAppearances` charge **toute** la table `stats_joueur_saison` (jointures joueur/équipe, tri) en mémoire pour l'index de recherche, puis chaque recherche fait un `contains` linéaire sur la liste. | Pic mémoire/CPU au premier appel et à chaque expiration (24 h) ; temps de réponse dépendant de la taille de la table. Mesuré : 11 647 lignes dans `stats_joueur_saison` (base locale), donc acceptable aujourd'hui. | Index trigramme Postgres (`pg_trgm`) + `ILIKE` borné à 20 résultats, ou précalculer l'index au démarrage. |
| Q2 | **Moyenne** [F] | `DAO/*` + `models/Player.java`, `Team.java`, `Season.java` | Accès aux données hétérogène : 3 entités JPA (lecture seule, sans relations), mais l'essentiel passe par `JdbcTemplate` ou requêtes natives. Pas de `@Transactional(readOnly = true)` sur les services. | Deux styles à maintenir ; rien de grave car pas de relations donc **pas de N+1** [F]. | Choisir un style : JDBC pour tout le lecture seule, ou projections Spring Data. Ajouter `readOnly = true` aux services de lecture. |
| Q3 | **Moyenne** [F] | `exceptions/GlobalExceptionHandler.java`, `CatalogExceptionHandler.java`, `game/controller/GameExceptionHandler.java` | Trois `@RestControllerAdvice` à `@Order` explicites (HIGHEST/LOWEST). Fonctionne et testé (`ExceptionHandlersTest`) mais dispersé. Le handler générique `Exception.class` masque aussi des 4xx Spring (couvert par `handleExceptionInternal`). | Lisibilité. | Regrouper en un seul advice par module, ou une hiérarchie `DomainException` avec un statut. |
| Q4 | **Faible** [F] puis [H] | `controllers/TeamController.java:40`, `PlayerController.java:34` | [F] `season` n'est validée que par le type `Short` (pas de `@Min/@Max`). [H] D'après le code, une saison inexistante donne une liste vide (200) sur `/teams/{id}/players` mais un 404 sur `/players/{id}/stats` ; non testé en appel réel. | Comportements probablement incohérents selon l'endpoint. | `@Min(2010)` / ou 400 si la saison n'existe pas, via `SeasonService`. |
| Q5 | **Faible** [F] | `game/service/GameService.java:104-111` | `locked()` attrape `GameNotFoundException` pour libérer le verrou : logique de nettoyage mêlée au flux d'erreur. | Lisibilité. | Libérer dans `GameLocks` quand `GameRepository.findById` est vide. |
| Q6 | **Faible** [F] | `game/service/GameService.java:96-98`, `services/PlayerService.java:72` | `PlayerService.evictCaches()` n'est appelé nulle part dans `src/main` (grep). | Code mort (testé uniquement). | Supprimer, ou l'exposer via un endpoint d'administration protégé. |
| Q7 | **Faible** [F] | `game/model/Game.java:46-75` | `Game` est un `record` immuable (bien) ; `withDraw` recopie le `Set` à chaque tirage. Négligeable aux tailles en jeu (≤ 11 picks). | Aucun. | Rien. |
| Q8 | **Moyenne** [F] | `6a1-front/src/app/utils/load-state.ts:15-17` | `toLoadState` avale toute erreur (`catchError(() => of(error))`) : plus de log, plus de distinction 404/500/réseau, aucun `HttpInterceptor`. | Diagnostic impossible en production ; messages d'erreur UI identiques pour tout. | Intercepteur d'erreurs (journalisation + message selon le statut) ; garder `LoadState` pour l'UI. |
| Q9 | **Faible** [F] | `app.routes.ts:30-33`, `package.json` | Pas de route `**` (404), pas de garde sur `joueurs/:playerId` si l'id n'est pas numérique. Pas de `provideRouter(withComponentInputBinding())`. | UX en cas d'URL invalide : page vide. | Route wildcard vers un composant « introuvable ». |
| Q10 | **Faible** [F] | `*.html` : 89 `@if/@for`, 0 `*ngIf/*ngFor` ; 53 attributs `aria-*/alt/role` | Syntaxe moderne, attributs d'accessibilité présents. [H] Que chaque `(click)` soit porté par un élément natif interactif (`button`, `a`) n'a pas été contrôlé élément par élément. | Aucun constaté. | Ajouter un test a11y (axe) en CI. |
| Q11 | **Info** [F] | Mémoire / fuites | Souscriptions maîtrisées : `takeUntilDestroyed` (`game-page.component.ts:129,281`, `competition-simulation.component.ts:81`), `toSignal` ailleurs, `drawTimer` désabonné (`game-page.component.ts:125,137`). Pas de `any` dans le code applicatif (seulement dans des commentaires de `polyfills.ts`). | — | À conserver. |
| Q12 | **Moyenne** [F] | Tests | **Back : `./mvnw test` → 337 tests, 0 échec, 14 ignorés** : les 4 classes d'intégration (`PlayerSeasonStatsDaoIntegrationTest`, `PlayerApiEndToEndTest`, `JdbcTeamSeasonSourceIntegrationTest`, `BackSkeletonApplicationTests`) portent `@Testcontainers(disabledWithoutDocker = true)` et ont été **sautées silencieusement faute de Docker** sur cette machine. Un `BUILD SUCCESS` sans Docker ne prouve donc rien sur les requêtes SQL. Logique du jeu très couverte (`DraftServiceTest` 313 l., `GameServiceTest`, `CompetitionSimulatorTest`, `GameLocksTest`, calibration de difficulté). Manques : pas de mesure de couverture back (aucun JaCoCo dans `pom.xml`), pas de test de charge/concurrence sur `/games`, pas de test du plafond côté HTTP. Front : `ng test --browsers=ChromeHeadlessCI` → **179 tests, 0 échec** ; couverture Karma : **93,99 % lignes, 92,81 % instructions, 81,39 % branches, 89,92 % fonctions**. | Couverture back inconnue ; en CI, `disabledWithoutDocker` masquerait une panne de Docker. | Ajouter JaCoCo avec seuil (ex. 80 % lignes sur `game.*`), un test e2e du plafond ; en CI, retirer `disabledWithoutDocker` pour que l'absence de Docker fasse échouer le build. |

### 3.3 Propreté du code

| ID | Sévérité | Fichier:ligne | Problème | Impact | Correctif recommandé |
|---|---|---|---|---|---|
| P1 | **Élevée** [F] | racine (`git status`), `6a1-back/.git`, `6a1-front/.git` | Trois dépôts git imbriqués : le dépôt racine voit `back-skeleton/` et `front-skeleton/` **supprimés** et `6a1-back/`, `6a1-front/` **non suivis** (`??`), tandis que chacun possède son propre `.git` (remotes distincts). `01_schema.sql` / `02_data.sql` existent en double (racine, 3,9 Mo, et `6a1-back/initdb/`). | Le dépôt racine ne reflète plus le projet ; risque de perte ou de commits incohérents ; 3,9 Mo dupliqués. | Choisir : monorepo (retirer les `.git` internes) ou dépôts séparés (retirer `6a1-*` du dépôt racine), puis supprimer les doublons SQL de la racine. |
| P2 | **Moyenne** [F] | `6a1-back/README.MD` | Le README du back est un TP : « Copie-colle le `.env.sample`… docker compose up… plugin IntelliJ ». Aucune instruction pour lancer l'API, les profils, les tests, les variables, l'OpenAPI. Le README racine est le support de cours (« Set up cours Java Spring Boot »). | Un nouveau lecteur ne sait pas lancer ni déployer le projet. | README du projet : prérequis, `npm run dev`, variables d'env, tests, déploiement. |
| P3 | **Moyenne** [F] | `6a1-back/docker-compose.yml:5` | `image: postgres` sans tag (donc `latest`). | Build non reproductible : une montée majeure de Postgres peut casser `initdb/`. | `image: postgres:16-alpine`. Ajouter un `healthcheck`. |
| P4 | **Moyenne** [F] | `6a1-back/`, `6a1-front/` | Aucun `Dockerfile`, aucun `.dockerignore` ; pas de linter Angular (`ng lint` absent : pas de cible `lint` dans `angular.json`), pas d'ESLint/Prettier en CI (Prettier 2.8 présent mais non appliqué en vérification), pas de Checkstyle/Spotless côté Java. | Qualité de style non garantie automatiquement ; déploiement non décrit. | `ng add @angular-eslint/schematics`, `prettier --check` en CI, Spotless. Dockerfile multi-étapes (voir E8). |
| P5 | **Faible** [F] | `6a1-back/.DS_Store` suivi malgré `.gitignore` ; `.DS_Store` à la racine | Fichiers système versionnés. | Bruit. | `git rm --cached .DS_Store` dans chaque dépôt. |
| P6 | **Faible** [F] | `6a1-front/src/reference/bench.png` (747 Ko), `lineup.png` (1,8 Mo) | 2,5 Mo d'images de référence (comparaison visuelle) suivies dans git, hors du build. | Poids du dépôt et du clone. | Git LFS ou dossier hors dépôt ; `scripts/lineup-visual-diff.mjs` les référence : à documenter. |
| P7 | **Faible** [F] | `6a1-front/package.json` | `playwright`, `pixelmatch`, `pngjs`, `concurrently`, `@types/pngjs` en `devDependencies` seulement pour des scripts annexes ; `tsconfig` : `noUnusedLocals` absent. | Installation plus lourde (Playwright). | Activer `noUnusedLocals/Parameters`, isoler les scripts visuels. |
| P8 | **Faible** [F] | `src/app/game/game-page/game-page.component.ts` (292 l.) | Plus gros composant : orchestre tirage, redraw, déplacement, simulation et état. Contredit « un composant = une chose » (CLAUDE.md). | Maintenabilité. | Extraire un service d'état de partie (signals) ; le composant ne garde que l'affichage. |
| P9 | **Info** [F] | `mvnw`, `@Order`, aucun `TODO/FIXME/System.out/printStackTrace` dans `src/main` ; 0 commentaire résiduel | Conformité au CLAUDE.md : camelCase, aucun commentaire, streams, records. | — | À conserver. |
| P11 | **Faible** [F] | historique git du dépôt racine (commits `cc79fc3`, `f397d6b`, `4168364`) ; HEAD : `webapp-hello-world/docker-compose.yml:8`, `webapp-hello-world/src/main/resources/application.properties:3` | Mots de passe de démonstration (`toor`, `password`) présents dans l'historique et dans l'exemple `webapp-hello-world/` du support de cours. Aucun secret trouvé dans l'historique de `6a1-back` ni `6a1-front` (recherche `password/secret/api_key/token` sur `.env`, `.properties`, `.yml`, `.ts`). | Valeurs de TP, hors périmètre du projet 6 à 1 ; aucun secret réel. [H] Une recherche dédiée (gitleaks) n'a pas été faite. | Ne pas réutiliser ces valeurs ; passer gitleaks avant publication. |
| P10 | **Info** [F] | `.claude/`, `scripts/audit-guard.sh`, `.githooks/` | Garde-fou automatisé (hooks git + Claude Code + CI) cohérent avec la règle d'audit. `.claude/scheduled_tasks.lock` est un fichier d'exécution à ignorer. | Bruit mineur. | Ajouter `.claude/scheduled_tasks.lock` au `.gitignore`. |

### 3.4 Éco-conception (RGESN / GreenIT) et RGPD

Mesures de `ng build --configuration production` : JS initial **422,89 ko bruts / 111,38 ko transférés** (main 332 ko, polyfills 33 ko, styles 54 ko, runtime 3 ko) ; 12 chunks paresseux, dont `compare` 99 ko et `game-page` 72 ko ; `dist/` total 1,4 Mo. Le budget `initial` (500 ko d'alerte) est respecté.

| ID | Sévérité | Fichier:ligne | Problème | Impact | Correctif recommandé |
|---|---|---|---|---|---|
| E1 | **Moyenne** [F] | `src/assets/logo_6a1.png` (918×525, 236 ko) ; `navbar.component.html:5-7` (affiché à 135×82,5 px) ; `index.html:7` (favicon) | Image 6,8× trop grande en largeur, en PNG, chargée sur **chaque page** (navbar) et comme favicon. | Le logo à lui seul pèse ~2× le JS initial transféré (111 ko). Gain estimé [H] : WebP/AVIF 270×165 (retina) ≈ 10-15 ko, soit **≈ −220 ko par première visite**. | Redimensionner, convertir en WebP/AVIF, `width/height` natifs + `fetchpriority="high"` ; favicon dédié 32 px. |
| E2 | **Moyenne** [F] | `src/index.html:9-11` | Polices : Roboto (Google Fonts) + **Material Icons** (police d'icônes complète) + Nunito Sans. Le build embarque 4 sous-ensembles de Nunito (cyrillique, vietnamien…) en `woff` + `woff2` (`dist/*.woff*`), alors que le site est en français. Requêtes tierces avant le premier rendu (`preconnect`). | +2-3 requêtes tierces bloquantes ; octets inutiles dans `styles.css` (54 ko dont des dizaines de `@font-face`). [H] Material Icons ≈ 100+ ko si non mis en cache. RGPD : voir S12. | Importer seulement `@fontsource/nunito-sans/latin-500.css` et `latin-800.css` ; remplacer la police d'icônes par des SVG ou `@fontsource/material-icons` en sous-ensemble ; supprimer Roboto si inutilisée. |
| E3 | **Moyenne** [F] | `application.properties` | Aucune compression ni cache HTTP : pas de `server.compression.enabled`, pas de `Cache-Control`/ETag sur `/seasons`, `/teams`, `/formations`, `/players/*/stats`. Ces données ne changent qu'avec une nouvelle saison. Le back a un cache mémoire (24 h) mais le navigateur re-télécharge à chaque visite. | Octets et CPU inutiles sur des réponses JSON statiques. [H] Compression JSON ≈ −75 à −85 %. | `server.compression.enabled=true`, `spring.web.resources.cache.cachecontrol.max-age=…`, `CacheControl.maxAge(1, HOURS)` + `ShallowEtagHeaderFilter` sur les GET du catalogue. |
| E4 | **Moyenne** [F] | `DAO/PlayerSeasonStatsDao.java:38-44` | Chargement complet de `stats_joueur_saison` pour la recherche, puis conservation en RAM 24 h ; `SeasonStatsCache` conserve en plus un snapshot de toutes les statistiques par saison consultée (jusqu'à 16 saisons). | Mémoire JVM proportionnelle aux données (acceptable) ; coût de (re)chargement toutes les 24 h pour des données quasi figées. | Allonger/retirer le TTL (données historiques) ; ne charger que `joueur_id, nom, saison, équipe` (déjà le cas pour l'index) ; projeter les colonnes nécessaires. |
| E5 | **Faible** [F] | `routes`, `teams/team-list` | `GET /teams` renvoie tout sans pagination, mais le jeu de données est petit (équipes de C1) ; `TeamController.findAllTeams` n'est pas paginé. Recherche joueurs limitée à 20 résultats (bien). | Négligeable aujourd'hui. | Pagination seulement si le catalogue grandit. |
| E6 | **Faible** [F] | `app.config.ts:7`, `build 108.73937…js` | `provideAnimationsAsync()` charge un chunk de 62,5 ko (16,5 ko transférés) pour les animations Material. | Peu coûteux mais embarqué pour des transitions mineures. | Retirer si `@angular/material` n'utilise que l'autocomplete/icônes (vérifier avec `NoopAnimations`). |
| E7 | **Faible** [F] | `competition-simulation.component.ts:162` | Seul « polling » : un `interval` pour jouer l'animation de simulation, désabonné via `takeUntilDestroyed`. Aucun polling réseau. | Aucun. | À conserver. |
| E8 | **Moyenne** [F] | absence de `Dockerfile` | Pas d'image applicative donc pas d'optimisation : JVM sans limites mémoire (`-Xmx`, `-XX:+UseContainerSupport` par défaut), pas de JRE minimal. | [H] Une image Temurin 17 JRE alpine ≈ 200 Mo + jar ≈ 50 Mo ; sans limites, la JVM prend 1/4 de la RAM de l'hôte. | Dockerfile multi-étapes, `eclipse-temurin:17-jre-alpine`, `-XX:MaxRAMPercentage=60`, Spring Boot layered jar ; front servi par nginx avec compression et cache longue durée (assets hachés). |
| E9 | **Faible** [F] | `initdb/02_data.sql` (3,9 Mo) | 3,9 Mo de SQL d'amorçage ; 25 colonnes de stats par ligne, dont des colonnes détaillées peu affichées. | Poids du dépôt et du démarrage de la base. | Compresser (`.sql.gz` accepté par l'entrypoint Postgres) ; revoir la rétention des colonnes jamais lues par `Stat`. |
| E10 | **Info** [F] | RGPD | Aucune donnée personnelle : pas de compte, pas de cookie ; `sessionStorage` ne garde que l'UUID de la partie en cours (`game-session.service.ts:9-25`). Les données sportives concernent des joueurs professionnels, source WhoScored : **[H] vérifier la licence/CGU de WhoScored avant toute mise en ligne publique**. Aucun journal d'accès applicatif contenant des IP (logs Spring par défaut), à confirmer côté proxy. | Conforme sauf Google Fonts (S12). | Mentions légales ; durée de conservation des logs du proxy à définir. |

---

## 4. Points positifs à conserver

- **Jeu autoritatif côté serveur** : tirage seedé, validation joueur/case/poste, graine non exposée, partie supprimée après simulation, plafond de parties et TTL d'inactivité (`GameService`, `InMemoryGameRepository`).
- **Concurrence pensée** : `GameLocks` par partie, `ConcurrentHashMap.computeIfPresent`, `ExpiringLazy` en double-checked locking, tests dédiés (`GameLocksTest`, `ExpiringLazyTest`).
- **Zéro injection** : requêtes paramétrées partout ; DTO en `record`, pas d'entité exposée directement.
- **Gestion d'erreurs propre** : réponses `ErrorResponse(message)` homogènes, 500 masqués (`INTERNAL_ERROR_MESSAGE`), codes 400/404/409/503 sémantiques.
- **Tests** : 336 tests verts, intégration Testcontainers sur vrai PostgreSQL, horloge injectable (`MutableClock`), test de calibration de difficulté.
- **Front moderne** : 100 % standalone, routes `loadComponent` (lazy), signals + `toSignal`, `OnPush` sur 28/31 composants, `strict`, `strictTemplates`, nouvelle syntaxe `@if/@for`, aucune fuite de souscription repérée.
- **Hygiène** : `.env` ignoré, Postgres lié à `127.0.0.1`, `open-in-view=false`, bundle initial à 111 ko transférés, CI sur les deux dépôts et garde-fou automatisé.

---

## 5. Plan d'action priorisé

### Quick wins (< 1 h)
1. Désactiver Swagger hors dev (S2) : 2 propriétés dans un `application-prod.properties`.
2. `server.compression.enabled=true` + `Cache-Control` sur les GET du catalogue (E3).
3. Redimensionner et convertir `logo_6a1.png` en WebP (E1) : **≈ −220 ko**.
4. Importer uniquement les sous-ensembles latins de Nunito et héberger les icônes (E2, S12) : retire les requêtes Google.
5. Épingler `image: postgres:16-alpine` (P3) ; `git rm --cached .DS_Store` (P5).
6. Ajouter `@Min` sur `season` et une route `**` (Q4, Q9).

### Avant rendu / mise en ligne
1. Rate limiting sur `POST /games` + TTL court pour les parties vides (S1).
2. Mise à jour de Spring Boot (3.5.x ou plus) et d'Angular, `npm audit fix`, scanner de dépendances en CI (S3, S4).
3. `application-prod.properties` : CORS réel, Swagger off, timeouts (S5, S10) ; fournir le reverse proxy `/api` (S6).
4. Dockerfile back + front (nginx) et README de lancement/déploiement (P2, P4, E8).
5. Décider de la structure git (monorepo ou dépôts séparés) et supprimer les doublons SQL (P1).
6. Ajouter JaCoCo et faire échouer la CI si Docker manque (Q12) ; intercepteur d'erreurs HTTP (Q8).
7. Vérifier la licence des données WhoScored (E10).

### Plus long terme
- ESLint/Prettier/Spotless en CI, a11y automatisée (P4, Q10).
- Recherche de joueurs via `pg_trgm` plutôt qu'index en mémoire (Q1, E4).
- Extraire l'état de partie de `game-page.component.ts` (P8).
- Si un classement ou des comptes arrivent : authentification, jeton de partie signé, persistance des scores côté serveur (S7, S8).
- Observabilité : Actuator restreint, métriques sur le nombre de parties actives.

---

## 6. Limites de l'audit

- **Non exécuté** : `ng lint` (n'existe pas), Playwright, couverture de code back (pas de JaCoCo), test de charge, scan CVE Java (OWASP Dependency-Check), **les 14 tests d'intégration Testcontainers (Docker absent le 2026-10-22)**. `mvn dependency:tree` a servi à lire les versions, pas à détecter les CVE : **S3 reste une hypothèse** quant aux CVE précises.
- **Exécuté le 2026-10-22** : `./mvnw test` (337 tests, 0 échec, 14 ignorés ; JDK 21 local alors que le `pom.xml` cible 17), `./mvnw dependency:tree`, `npm audit` (complet et `--omit=dev`), `npm outdated`, `ng build --configuration production` (mêmes tailles que le 2026-10-21), `ng test` (179 OK) avec `--code-coverage`, recherche de secrets dans l'historique git des trois dépôts. Les 337 tests avaient été annoncés « 336 verts, Docker actif » dans la version précédente de ce rapport ; ce chiffre n'a pas pu être reproduit sans Docker.
- **Chiffres éco-conception** : tailles mesurées sur le build (bruts et « transfert estimé » par Angular) ; les gains annoncés (logo, compression, polices) sont des **estimations** non mesurées en conditions réelles (pas de Lighthouse/WebPageTest).
- **Non vérifié** : un scan dédié de l'historique git (gitleaks ; seules des recherches par motif ont été faites), la robustesse du mot de passe du `.env`, l'infrastructure de déploiement (aucune n'est décrite), le contenu de `PLAN_7A0.md` et des hooks `scripts/`, le rendu visuel et l'accessibilité réelle (lecteur d'écran, contraste).
- **Hors périmètre** : `webapp-hello-world/`, `HELP/`, `projects-ideas/`, `.idea/` (IDE).

---

## 7. Suivi des corrections (2026-10-22)

Corrections validées par l'auditeur (verdict `PASS` sur l'ensemble du diff, étapes 1 à 5). Aucun contrat d'API modifié hors le `429` de `POST /games` et le `400` sur une saison hors 1900–2100 ; aucun test supprimé ni assoupli.

| ID | Statut | Note |
|---|---|---|
| S1 | **corrigé** | Limiteur par IP sur `POST /games` (défaut 20/min, `game.creation.rate-limit.*`, `429` au format `ErrorResponse`) ; parties sans pick purgées après 15 min, TTL 2 h inchangé pour les autres. |
| S2 | **corrigé** | Swagger/OpenAPI désactivé par défaut (`SWAGGER_ENABLED`) ; activé en dev par `6a1-front/scripts/back.js`. |
| S5 | **corrigé** | `application-prod.properties` : CORS via `CORS_ALLOWED_ORIGINS`, refus au démarrage si vide ou `*`. |
| S10 | **partiel** | Timeouts, taille d'en-têtes, compression en prod. Pas d'en-têtes de sécurité (CSP, `X-Content-Type-Options`). |
| S12 | **corrigé** | Roboto et Material Icons hébergés via `@fontsource` ; plus aucune requête vers Google (vérifié au navigateur). |
| E1 | **corrigé** | Logo WebP 270×154 (236 ko → 10,7 ko), favicon 32 px dédié, `width`/`height` sur l'`img`. |
| E2 | **corrigé** | Nunito Sans : sous-ensembles latins 500/800 uniquement. |
| E3 | **partiel** | Compression active ; `Cache-Control` 1 h (2xx seulement) + ETag faible sur `/seasons`, `/teams`, `/formations`. Les routes `/players/*` ne sont pas mises en cache. |
| Q4 | **corrigé** | Saison validée entre 1900 et 2100, `400` au format `ErrorResponse`. |
| Q8 | **corrigé** | Intercepteur fonctionnel qui journalise en dev uniquement ; `toLoadState` inchangé. |
| Q9 | **corrigé** | Route `**` vers un composant « Page introuvable ». |
| Q12 | **corrigé** | JaCoCo (rapport, sans seuil ; 97,9 % d'instructions) ; la CI échoue si Docker est absent ou si un test est ignoré. |
| P3 | **corrigé** | `postgres:16-alpine` + `healthcheck`, `initdb/` rejoué et vérifié sur une instance jetable. |
| P5 | **partiel** | `.DS_Store` ajouté au `.gitignore` du back (le front l'ignorait déjà) ; `6a1-back/.DS_Store` reste suivi : `git rm --cached` à faire par vous. |

Non traités : S3 et S4 (montées majeures Spring Boot et Angular, à décider ensemble), P1 (structure git, décision humaine). P10 (ignorer `.claude/scheduled_tasks.lock`) n'a pas été fait : il ne figurait pas dans les consignes détaillées de l'étape 5.
