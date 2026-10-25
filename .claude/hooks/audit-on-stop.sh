#!/usr/bin/env bash
set -u

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
BACK="$(cd "$ROOT/../6a1-back" 2>/dev/null && pwd)"
INPUT="$(cat)"

if printf '%s' "$INPUT" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

REPORT=""
STATUS=0
for repo in "$ROOT" ${BACK:+"$BACK"}; do
  OUTPUT="$("$repo/.githooks/run-guard.sh" 2>&1)" || { STATUS=1; REPORT="$REPORT$OUTPUT"$'\n'; }
done

if [ "$STATUS" -ne 0 ]; then
  printf '%s\n\nCorrigez ces violations (ou justifiez-les dans .githooks/audit-guard.allow du dépôt concerné) avant de terminer.\n' "$REPORT" >&2
  exit 2
fi
exit 0
