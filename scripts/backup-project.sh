#!/usr/bin/env bash
# Backup locale del progetto (esclude node_modules, .next, git)
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_ROOT="${HOME}/Backups/mychauffeur-new"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${BACKUP_ROOT}/${STAMP}"

mkdir -p "$BACKUP_ROOT"

rsync -a \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env.local' \
  "$PROJECT_DIR/" "$DEST/"

# Copia .env.local separatamente (permessi ristretti) se esiste
if [[ -f "$PROJECT_DIR/.env.local" ]]; then
  install -m 600 "$PROJECT_DIR/.env.local" "$DEST/.env.local"
fi

echo "Backup creato: $DEST"

# Mantieni solo gli ultimi 48 backup (~24h se ogni 30 min)
cd "$BACKUP_ROOT"
count=0
for dir in $(ls -1dt */ 2>/dev/null); do
  count=$((count + 1))
  if [[ $count -gt 48 ]]; then
    rm -rf "$dir"
  fi
done
