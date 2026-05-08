#!/usr/bin/env bash
# Create a PR from current branch with auto-filled template.
# Usage: bash pr-create.sh [--draft]
# Prereq: gh CLI installed and authenticated.

set -euo pipefail

DRAFT=false
if [ "${1:-}" = "--draft" ]; then
  DRAFT=true
fi

# Detect branch info
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
  echo "Error: cannot create PR from main. Switch to a feature/fix branch first."
  exit 1
fi

# Extract type from branch name (feature/xxx, fix/xxx, etc.)
TYPE=$(echo "$BRANCH" | cut -d/ -f1)
SLUG=$(echo "$BRANCH" | cut -d/ -f2-)

# Determine commit prefix
case "$TYPE" in
  feature) PREFIX="feat" ;;
  fix)     PREFIX="fix" ;;
  hotfix)  PREFIX="hotfix" ;;
  chore)   PREFIX="chore" ;;
  release) PREFIX="release" ;;
  *)       PREFIX="chore" ;;
esac

# Generate title from branch slug
TITLE=$(echo "$SLUG" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1')

# Get commits on this branch not yet on main
COMMITS=$(git log main..HEAD --oneline --no-merges 2>/dev/null || git log origin/main..HEAD --oneline --no-merges)

# Build body
BODY=$(cat <<PRBODY
## Summary

$(echo "$COMMITS" | while read -r line; do echo "- ${line#* }"; done)

## Test plan

- [ ] Manual QA
- [ ] Unit tests pass
- [ ] No visual regressions

---

Closes #
PRBODY
)

# Determine labels
case "$TYPE" in
  hotfix)  LABELS="hotfix,skip-staging" ;;
  release) LABELS="release" ;;
  *)       LABELS="" ;;
esac

echo "→ Creating PR..."
echo "  Branch: $BRANCH → main"
echo "  Title:  $PREFIX: $TITLE"
echo ""

DRAFT_FLAG=""
[ "$DRAFT" = true ] && DRAFT_FLAG="--draft"

LABEL_FLAG=""
[ -n "$LABELS" ] && LABEL_FLAG="--label \"$LABELS\""

# Push if not already pushed
if ! git rev-parse --abbrev-ref @{u} >/dev/null 2>&1; then
  echo "→ Pushing branch..."
  git push -u origin HEAD
fi

# Create PR
if [ -n "$LABEL_FLAG" ]; then
  eval "gh pr create --base main --title \"$PREFIX: $TITLE\" --body \"$BODY\" $DRAFT_FLAG $LABEL_FLAG"
else
  gh pr create --base main --title "$PREFIX: $TITLE" --body "$BODY" $DRAFT_FLAG
fi

echo ""
echo "✓ PR created. Watch CI: gh pr checks"
