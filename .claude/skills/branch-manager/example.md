# Examples: Real-World Scenarios

## Scenario 1: New Feature Development

**Goal**: Add user avatar upload to profile page.

```
> /branch-manager
User: "create feature for user avatar upload"

AI:
  1. git checkout main && git pull origin main
  2. git checkout -b feature/user-avatar-upload
  3. git push -u origin HEAD
  4. → Branch created. Start coding!

<developer writes code, commits>
> git add -p
> git commit -m "feat: add avatar upload to profile"
> git push

> /branch-manager
User: "create PR"

AI:
  1. git push -u origin HEAD
  2. gh pr create --base main --title "feat: add avatar upload to profile"
     --body "## Summary
     - Add drag-and-drop avatar upload
     - Support jpg/png/webp, max 2MB
     - Preview before save
     ## Test plan
     - [ ] Upload jpg < 2MB
     - [ ] Upload png > 2MB shows error
     - [ ] Drag-and-drop works on desktop"
  3. → PR #142 created. CI running: lint ✓ | test ✓ | build ✓ | preview ✓
  4. → Review requested from team

<reviewer approves>
> /branch-manager
User: "merge"

AI:
  1. gh pr merge 142 --squash --delete-branch
  2. git checkout main && git pull origin main
  3. → Merged. Production deploying...
```

---

## Scenario 2: Production Hotfix

**Goal**: Fix XSS vulnerability on search input. Skip staging, go directly to prod.

```
> /branch-manager
User: "create hotfix for search XSS"

AI:
  1. git checkout main && git pull origin main
  2. git checkout -b hotfix/search-xss-sanitize
  3. → Branch created. This hotfix will skip staging and deploy directly to prod after merge.

<developer fixes, commits>
> git add -p
> git commit -m "hotfix: sanitize search input to prevent XSS"
> git push

> /branch-manager
User: "create PR for hotfix"

AI:
  1. gh pr create --base main --title "hotfix: sanitize search input" --label hotfix
  2. → PR #143. Hotfix label triggers accelerated pipeline (skip staging).
  3. → CI: lint ✓ | test ✓ | build ✓ (skipping preview deploy)

<reviewer approves, merges>
  4. → Main updated. Deploying directly to production...

---

## Scenario 3: Release

**Goal**: Cut release v1.5.0 with changelog and tag.

```
> /branch-manager
User: "release v1.5.0"

AI:
  1. git checkout main && git pull origin main
  2. git checkout -b release/v1.5.0
  3. # Generate changelog from commits since last tag
  4. git log --oneline v1.4.0..HEAD | sort
  5. # Create release notes
  6. → Branch release/v1.5.0 created.
  7. → Review CHANGELOG.md and push when ready.

<review changelog, final QA>
> git push -u origin HEAD

> /branch-manager
User: "publish release"

AI:
  1. gh pr create --base main --title "release: v1.5.0" --label release
  2. # CI runs full suite: lint, test, build, e2e
  3. # Merge → auto-tag v1.5.0 → deploy to staging → smoke tests → deploy to prod
```

---

## Scenario 4: Stale Branch Cleanup

```
> /branch-manager
User: "cleanup"

AI:
  1. git checkout main && git pull origin main
  2. # Find merged branches
     git branch --merged main | grep -v "main"
     → feature/old-login (merged 15 days ago)
     → fix/typo-readme (merged 22 days ago)
     → fix/nav-color (merged 30 days ago)
  3. "Delete these 3 merged branches?"
  4. → Cleaned up. Also pruned remote tracking branches.
```
