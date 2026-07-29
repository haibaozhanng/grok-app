# Personal roadmap

优先级：先修稳定性，再加体验。

## P0 — 稳定性

### 1. `ask_user_question` 挂起 / 全会话像卡死

见 [ask-user-hang.md](./ask-user-hang.md)。

目标：

- Host 侧有超时，未回答则自动 `cancelled`，不无限占 turn
- 后台会话提问：桌面通知 + 未读/待答标识（不能只 toast）
- UI 未挂上时不能静默丢事件
- 失败时 Agent 立刻拿到明确错误，而不是等 5 分钟

### 2. 连接中假死

- 重连 `open_start` 无结果时要有超时与 UI 失败态
- pending ask_user / permission 时不要误显示「连接中」可继续发消息

## P1 — 体验

### 3. 会话「未读」标识 ✅ (`personal/feat-unread-complete-chime`)

- 非当前会话 turn 完成 → spinner 换成未读圆点
- 点进该会话清除
- 应用内 toast + 完成音效 + force 桌面通知（即使窗口在前台看别的会话）

### 4. 通知策略可调

- 完成通知对「其它会话」已 force（见上）
- 可选：当前会话完成也响一声（未做，默认静默因为人在看）

## P2 — 其它个性化

- 按使用再填（主题、默认权限、快捷键等）

## 分支建议

| 功能 | 分支名 |
|------|--------|
| ask_user 修复 | `personal/fix-ask-user-hang` |
| 未读标识 | `personal/feat-unread-badge` |
| 合入个人主线 | `personal/main` |
