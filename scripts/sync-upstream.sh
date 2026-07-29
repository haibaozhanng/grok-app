#!/usr/bin/env bash
# Sync RongleCat/grok-app into this fork, then merge into personal/main.
# Usage: bash scripts/sync-upstream.sh [--no-personal]
set -euo pipefail
cd "$(dirname "$0")/.."

NO_PERSONAL=0
if [[ "${1:-}" == "--no-personal" ]]; then
  NO_PERSONAL=1
fi

echo "==> fetch origin + upstream"
git fetch origin
git fetch upstream

echo "==> update local main from upstream/main"
git checkout main
if git merge --ff-only upstream/main; then
  echo "main fast-forwarded to upstream/main"
else
  echo "ff-only failed; merging upstream/main into main"
  git merge upstream/main -m "merge: sync upstream/main into main"
fi

echo "==> push origin/main"
git push origin main

if [[ "$NO_PERSONAL" -eq 1 ]]; then
  echo "done (skipped personal/main)"
  exit 0
fi

if git show-ref --verify --quiet refs/heads/personal/main; then
  echo "==> merge main into personal/main"
  git checkout personal/main
  git merge main -m "merge: sync main into personal/main"
  git push origin personal/main
  echo "done: personal/main updated"
else
  echo "no local personal/main — skip"
fi
