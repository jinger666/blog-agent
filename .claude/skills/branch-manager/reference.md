# Reference: Branch Management

## Naming Rules

| Element | Rule |
|---|---|
| Prefix | One of: `feature`, `fix`, `hotfix`, `chore`, `release` |
| Separator | Forward slash `/` after prefix, hyphens `-` in slug |
| Slug | Lowercase, 2-5 words max, descriptive |
| Version | `release/v<MAJOR>.<MINOR>.<PATCH>` — semver only |
| Length | Full branch name under 60 chars |

### Valid

```
feature/user-profile-edit
fix/mobile-nav-overflow
hotfix/csrf-token-leak
chore/eslint-v9-migration
release/v1.5.0
```

### Invalid

```
Feature/user-profile     # capital
feature_user_profile     # underscore
feat/user                # wrong prefix
fix/login-bug            # too vague — use fix/login-redirect-401
```

## Git Commands Quick Reference

### Create Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/<slug>
```

### Daily Work

```bash
git add -p                    # stage interactively
git commit -m "feat: <msg>"  # conventional commits
git push -u origin HEAD
```

### Pull Latest Main

```bash
git checkout main && git pull origin main
git checkout feature/<slug>
git rebase main               # prefer rebase over merge for clean history
```

### Create PR

```bash
gh pr create --base main --title "feat: <title>" --body-file .github/pr-template.md
```

### Merge & Clean

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull origin main
```

### Cleanup Stale Branches

```bash
# Delete local branches merged into main
git branch --merged main | grep -v "main" | xargs git branch -d

# Delete local branches where remote was deleted
git remote prune origin

# List branches with no recent activity (30 days)
git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) %(committerdate:relative)'
```

## Conventional Commits

```
feat:     new feature
fix:      bug fix
hotfix:   critical fix (skip to production)
chore:    tooling, deps, config
docs:     documentation only
refactor: code change, no behavior change
test:     add or update tests
style:    formatting, no logic change
```

## CI/CD Pipeline Details

### PR Checks (GitHub Actions)

```yaml
# Triggered on PR open, push to feature/fix/hotfix branches
jobs:
  lint:      # ESLint + Prettier
  typecheck: # tsc --noEmit
  test:      # vitest / jest --coverage
  build:     # vite build / nest build
  preview:   # Vercel preview deployment (frontend only)
```

### Merge to Main

```yaml
# Triggered on push to main
jobs:
  e2e:       # Playwright / Cypress
  deploy:    # Vercel production / Docker push
  notify:    # Slack notification on deploy
```

### Required Checks Before Merge

- [ ] Lint passes (0 errors)
- [ ] TypeScript compiles (0 errors)
- [ ] Unit tests pass (coverage >= baseline)
- [ ] Build succeeds
- [ ] At least 1 reviewer approved
- [ ] No unresolved comments
