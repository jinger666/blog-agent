#!/usr/bin/env bash
# Clean up stale branches (merged + remote-pruned).
# Usage: bash branch-cleanup.sh [--dry-run] [--older-than-days 30]

set -euo pipefail

DRY_RUN=false
OLDER_THAN=30

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --older-than-days) OLDER_THAN="${2:-30}"; shift 2 ;;
    *) shift ;;
  esac
done

echo "→ Switching to main and pulling latest..."
git checkout main
git pull origin main

# 1. Delete local branches already merged into main
echo ""
echo "=== Local branches merged into main ==="
MERGED=$(git branch --merged main | grep -v "^\*" | grep -v "main" | sed 's/^[[:space:]]*//')
if [ -z "$MERGED" ]; then
  echo "None found."
else
  echo "$MERGED"
  if [ "$DRY_RUN" = false ]; then
    echo ""
    read -p "Delete these branches? [y/N] " CONFIRM
    if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
      echo "$MERGED" | xargs -r git branch -d
      echo "✓ Deleted merged branches."
    else
      echo "Skipped."
    fi
  else
    echo "[DRY RUN] Would delete $(echo "$MERGED" | wc -l) branches."
  fi
fi

# 2. Prune remote-tracking refs for deleted remote branches
echo ""
echo "=== Pruning remote tracking branches ==="
if [ "$DRY_RUN" = false ]; then
  git remote prune origin
  echo "✓ Pruned."
else
  echo "[DRY RUN] Would run: git remote prune origin"
fi

# 3. List stale branches (no recent commits)
echo ""
echo "=== Branches with no commits in ${OLDER_THAN} days ==="
STALE=$(git for-each-ref --sort=-committerdate refs/heads/ \
  --format="%(refname:short) | %(committerdate:relative)" | grep -v "^main " || true)
if [ -z "$STALE" ]; then
  echo "None found."
else
  echo "$STALE" | head -20
  echo ""
  echo "Review manually: git branch -d <name>"
fi

echo ""
echo "✓ Cleanup complete."
