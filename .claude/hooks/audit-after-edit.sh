#!/usr/bin/env bash
set -u

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
BACK="$(cd "$ROOT/../6a1-back" 2>/dev/null && pwd)"
INPUT="$(cat)"

FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))
except Exception:
    print("")')"

case "$FILE_PATH" in
  "$ROOT"/*) REPO="$ROOT" ;;
  "$BACK"/*) REPO="$BACK" ;;
  *) exit 0 ;;
esac

REPORT="$("$REPO/.githooks/run-guard.sh" --file "$FILE_PATH" 2>&1)"
if [ $? -ne 0 ]; then
  printf '%s\n' "$REPORT" >&2
  exit 2
fi
exit 0
