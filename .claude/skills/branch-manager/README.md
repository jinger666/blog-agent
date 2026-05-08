# Branch Manager Skill

企业级 Git 分支管理技能，基于 Trunk-Based Flow，为前端团队 CI/CD 优化。

## 快速开始

在 Claude Code 中通过 `/branch-manager` 调用：

```
/branch-manager → 创建分支 / 创建 PR / 合并 / 发布 / 清理
```

## 目录

| 文件 | 内容 |
|---|---|
| `SKILL.md` | 入口文件：触发词、核心流程、CI/CD 流水线矩阵 |
| `reference.md` | 分支命名规范、Git 命令速查、Conventional Commits |
| `example.md` | 4 个实战场景（功能开发、热修复、发布、清理） |
| `scripts/branch-create.sh` | 从最新 main 创建规范分支 |
| `scripts/pr-create.sh` | 自动生成标题/正文/标签并创建 PR |
| `scripts/branch-cleanup.sh` | 清理已合并和过期分支 |

## 分支命名

```
feature/<简短描述>    # 新功能    → CI: lint + test + build 预览
fix/<简短描述>        # Bug 修复  → CI: lint + test + build 预览
hotfix/<简短描述>     # 紧急修复  → CI: lint + test（跳过 staging，直推生产）
chore/<简短描述>      # 工程杂项  → CI: lint only
release/v<语义版本>   # 发布分支  → CI: full + staging + tag
```

## 开发工作流

```
                   feature/user-avatar
main ───────────────────────────────────
  ↑                  │
  │    feature/payment
  │       │
  ├───────┴── PR → squash merge → main
  │
  └── 始终从最新 main 创建分支
```

1. 从 `main` 创建功能分支
2. 开发并提交（使用 Conventional Commits）
3. 推送并创建 PR（CI 自动运行 lint/test/build）
4. Code review + CI 全部通过
5. Squash-merge 到 main（自动部署生产）
6. 清理已合并分支

## 脚本使用

```bash
# 创建功能分支
bash .claude/skills/branch-manager/scripts/branch-create.sh feature user-avatar

# 创建 PR（自动检测分支类型并生成标题）
bash .claude/skills/branch-manager/scripts/pr-create.sh

# 创建 Draft PR
bash .claude/skills/branch-manager/scripts/pr-create.sh --draft

# 清理已合并分支（仅预览）
bash .claude/skills/branch-manager/scripts/branch-cleanup.sh --dry-run

# 清理已合并分支（实际执行）
bash .claude/skills/branch-manager/scripts/branch-cleanup.sh
```

## CI/CD 流水线

| 分支类型 | 创建 PR 时 | 合并后 |
|---|---|---|
| `feature/*` `fix/*` | lint → test → build → Vercel Preview | — |
| `hotfix/*` | lint → test（跳过 staging build）| 直推生产 |
| `release/*` | lint → test → build → E2E | staging → tag → 生产 |
| `chore/*` | lint only | — |
| `main` | — | E2E → 生产部署 |

## 合并前必检项

- [ ] Lint 零错误
- [ ] TypeScript 编译通过
- [ ] 单元测试通过（覆盖率 ≥ 基线）
- [ ] Build 成功
- [ ] 至少 1 人 approve
- [ ] 无未解决的 review 评论
