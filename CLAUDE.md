# Règles du projet

Projet : back Java/Spring (`6a1-back`) et front Angular (`6a1-front`).

## Back

- Écriture en camelCase et en anglais
- Architecture en couches
- Pas de logique métier dans les controllers
- Utiliser les verbes et codes d'erreur HTTP
- Nommage clair des endpoints, méthodes et services
  - Pas de commentaires : le code parle de lui-même
- Écrire des tests au fur et à mesure, de différents types
- Utiliser les streams pour itérer sur des collections
- Penser aux Records

## Front

- Organiser le code par feature
- Chaque composant fait une seule chose à la fois
- Un composant doit pouvoir être réutilisable
- Utiliser des features modernes (standalone components et signals plutôt que les NgModules)
- Attention aux fuites mémoire avec les subscribe (unsubscribe / `takeUntilDestroyed` / `async` pipe)

## Audit

- Avant de déclarer une tâche terminée, lancer `.githooks/run-guard.sh --all` dans `6a1-front` et dans `6a1-back`, puis invoquer le sous-agent `auditor` (ou le skill `/audit`).
- Ne pas dire « terminé » tant que le verdict de l'auditeur n'est pas `PASS`, ou que les points restants n'ont pas été expliqués à l'utilisateur.
- Toute exception au garde doit être justifiée dans `.githooks/audit-guard.allow` du dépôt concerné (format `règle|chemin|justification`) ; une exception sans justification est refusée.
- Les hooks Claude Code (`.claude/settings.json`) et les hooks git (`git config core.hooksPath .githooks` dans chaque dépôt) lancent le garde automatiquement.
