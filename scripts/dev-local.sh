#!/usr/bin/env bash
# Local Next.js dev launcher — ensures this process soft file-descriptor limit
# is high enough before Turbopack watches the tree (avoids EMFILE → blank 404s
# on macOS when launchctl maxfiles soft limit is very low, e.g. 256).
#
# Safe / portable:
# - Adjusts only this process (and children via inheritance).
# - Uses soft limit (`ulimit -S`) and never lowers an already-sufficient value.
# - Does not change launchctl / system-wide maxfiles.
# - If the hard limit is too low to raise (e.g. prior `ulimit -n 256` capped both),
#   prints a warning and still starts Next.
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET_SOFT=10240
FALLBACK_SOFT=4096
MIN_OK=4096

if command -v ulimit >/dev/null 2>&1; then
  before="$(ulimit -S -n 2>/dev/null || ulimit -n 2>/dev/null || echo unknown)"
  after="$before"

  if [[ "$before" =~ ^[0-9]+$ ]] && (( before < TARGET_SOFT )); then
    if ulimit -S -n "$TARGET_SOFT" 2>/dev/null; then
      after="$(ulimit -S -n 2>/dev/null || echo "$TARGET_SOFT")"
    elif ulimit -S -n "$FALLBACK_SOFT" 2>/dev/null; then
      after="$(ulimit -S -n 2>/dev/null || echo "$FALLBACK_SOFT")"
    elif ulimit -n "$TARGET_SOFT" 2>/dev/null; then
      after="$(ulimit -n 2>/dev/null || echo "$TARGET_SOFT")"
    elif ulimit -n "$FALLBACK_SOFT" 2>/dev/null; then
      after="$(ulimit -n 2>/dev/null || echo "$FALLBACK_SOFT")"
    else
      after="$(ulimit -S -n 2>/dev/null || ulimit -n 2>/dev/null || echo unknown)"
    fi
  fi

  printf '[dev-local] process soft nofile: %s -> %s (launchctl untouched)\n' "$before" "$after" >&2

  if [[ "$after" =~ ^[0-9]+$ ]] && (( after < MIN_OK )); then
    printf '[dev-local] WARNING: soft nofile still low (%s). If you see EMFILE, run in this shell: ulimit -n %s\n' \
      "$after" "$TARGET_SOFT" >&2
  fi
fi

exec npx next dev --port 3002 --hostname 127.0.0.1 "$@"
