---
name: audit
description: Lance le sous-agent auditor sur les changements courants des dépôts 6a1-front et 6a1-back (argument optionnel : back, front ou un chemin). À utiliser avant de déclarer une tâche terminée ou après toute modification de code.
argument-hint: "[back | front | chemin]"
---

Lance le sous-agent `auditor` (outil Agent avec `subagent_type: "auditor"`) sur les changements courants des dépôts `6a1-front` (courant) et `6a1-back` (voisin : `../6a1-back`).

Périmètre demandé : $ARGUMENTS

- Sans argument : tous les changements (`git diff HEAD` et fichiers non suivis dans les deux dépôts).
- `back` : uniquement `6a1-back`. `front` : uniquement `6a1-front`. Un chemin : uniquement ce fichier ou dossier.

Transmets le périmètre à l'agent dans son prompt, demande-lui de relancer lui-même le garde (`.githooks/run-guard.sh --all` dans chaque dépôt) et les tests sans se fier à un rapport précédent, puis affiche son rapport tel quel (verdict, problèmes 🔴🟠🟡 avec preuves). Ne corrige rien toi-même avant d'avoir affiché le rapport.
