---
name: branch-manager
description: >-
  Enterprise-grade Git branch management. Use when creating branches, opening PRs,
  merging, releasing, or cleaning up stale branches. Covers Trunk-Based Flow
  with short-lived feature branches optimized for frontend CI/CD.
allowed-tools: Bash(pnpm *), Bash(git *), Bash(gh *), Bash(curl *)
---

# Branch Manager

Enterprise-grade Trunk-Based Flow for frontend teams. One command for each stage.

## Quick Start

| Task | Command |
|---|---|
| New feature | `/branch-manager` → say "create feature" |
| Open PR | `/branch-manager` → say "create PR" |
| Hotfix | `/branch-manager` → say "create hotfix" |
| Release | `/branch-manager` → say "release v1.2.0" |
| Cleanup | `/branch-manager` → say "cleanup" |

## Core Workflow

```
main ← PR ← feature/xxx
  ↑                │
  └── merge ──────┘
```

1. **Create**: branch from latest `main`, auto-prefixed (`feature/`, `fix/`, `hotfix/`, `chore/`)
2. **Develop**: commit and push as usual
3. **PR**: auto-fill template, link issues, trigger CI
4. **Review**: CI runs lint → test → build → preview deploy
5. **Merge**: squash-merge into main, auto-deploy production
6. **Cleanup**: delete merged branch locally and remotely

## Files

| File | When to read |
|---|---|
| [reference.md](reference.md) | Branch naming, Git commands, CI/CD pipeline details |
| [example.md](example.md) | Walkthrough scenarios (feature, hotfix, release) |
| `scripts/branch-create.sh` | Automated branch creation with validation |
| `scripts/pr-create.sh` | PR creation with pre-filled template |
| `scripts/branch-cleanup.sh` | Delete stale local and remote branches |

## Branch Naming

```
feature/<slug>     # feature/user-auth, feature/payment-flow
fix/<slug>         # fix/login-redirect, fix/button-alignment
hotfix/<slug>      # hotfix/xss-patch, hotfix/payment-crash
chore/<slug>       # chore/update-deps, chore/migrate-vite-6
release/v<semver>  # release/v1.2.0, release/v2.0.0
```

## CI/CD Pipeline (per branch type)

| Branch | On PR | On Merge |
|---|---|---|
| `feature/*`, `fix/*` | lint + test + build + preview | — |
| `hotfix/*` | lint + test (skip staging build) | deploy prod |
| `release/*` | full suite | deploy staging → tag |
| `chore/*` | lint only | — |
| `main` | — | E2E + deploy prod |

---

**Convention**: always branch from latest `main`. Squash-merge only. One PR = one feature/fix.
