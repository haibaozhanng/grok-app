# Personal fork notes（haibaozhanng/grok-app）

本仓库是 [RongleCat/grok-app](https://github.com/RongleCat/grok-app) 的 fork，用于个人功能，同时尽量同步上游。

## 本地路径

```text
/Users/zhanghaibao/Documents/代码仓库/grok-app
```

## Remotes

| 名称 | URL | 用途 |
|------|-----|------|
| `origin` | `https://github.com/haibaozhanng/grok-app.git` | 自己的 fork（推送个人分支） |
| `upstream` | `https://github.com/RongleCat/grok-app.git` | 上游官方 |

## 分支策略

| 分支 | 含义 |
|------|------|
| `main` | 尽量与上游 `upstream/main` 对齐（可定期 reset/merge） |
| `personal/main` | **个人主线**：合入未读、ask_user 修复等自定义功能 |
| `personal/*` | 单功能分支（如 `personal/unread`、`personal/ask-user-timeout`） |

推荐日常开发在 `personal/main` 或从它拉 feature 分支。

## 同步上游（推荐流程）

```bash
cd "/Users/zhanghaibao/Documents/代码仓库/grok-app"
git fetch upstream
git checkout main
git merge --ff-only upstream/main   # 若失败再改用 merge 无 ff
git push origin main

# 把上游变更合进个人主线
git checkout personal/main
git merge main
# 解决冲突后
git push origin personal/main
```

快捷脚本：

```bash
bash scripts/sync-upstream.sh
```

## 回馈上游

- 通用修复（如 ask_user 超时、未读标识若上游也需要）：从 `personal/*` 整理干净提交，PR 到 `RongleCat/grok-app`
- 纯个人偏好：只留在 `personal/main`，不要塞进上游 PR

## 构建 / 开发

见上游 [docs/BUILD.md](../BUILD.md)。本机大致：

```bash
pnpm install
pnpm dev          # 完整桌面端
pnpm typecheck && pnpm test
```

安装自己编的 App 会覆盖 `/Applications/Grok.app` 时，先确认版本与备份。

## 文档

- [roadmap.md](./roadmap.md) — 个性化功能与 bug 修复清单
- [ask-user-hang.md](./ask-user-hang.md) — 已复现的 ask_user 挂起分析
