#!/usr/bin/env bash
# Create a branch from latest main with proper naming convention.
# Usage: bash branch-create.sh <type> <slug>
# Example: bash branch-create.sh feature user-avatar-upload

set -euo pipefail

TYPE="${1:-}"
SLUG="${2:-}"

# Validate type
case "$TYPE" in
  feature|fix|hotfix|chore|release) ;;
  *)
    echo "Usage: branch-create.sh <feature|fix|hotfix|chore|release> <slug>"
    echo "Example: branch-create.sh feature user-avatar-upload"
    exit 1
    ;;
esac

# Validate slug
if [ -z "$SLUG" ]; then
  echo "Error: slug is required"
  exit 1
fi

# Normalize slug: lowercase, spaces/hyphens/underscores to hyphens, strip non-alnum
SLUG=$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

if [ ${#SLUG} -lt 2 ]; then
  echo "Error: slug too short (min 2 chars after normalization)"
  exit 1
fi

BRANCH="${TYPE}/${SLUG}"

echo "→ Switching to main..."
git checkout main
echo "→ Pulling latest main..."
git pull origin main
echo "→ Creating branch: $BRANCH"
git checkout -b "$BRANCH"

echo "✓ Ready on $BRANCH"
echo "  Next: write code, then run pr-create.sh"
