# ask_user_question 挂起分析（2026-07-29 现场日志）

## 现象

1. Agent 调用 `ask_user_question` 后，App **没有弹出**可点的问卷（或弹了但通道失败）。
2. 当前会话卡住；切换其它会话长时间 **「连接中」**。
3. 约 **303s** 后工具失败：`success: false`；重启 App 后才恢复。

## 日志证据

App log：

```text
2026-07-29T05:17:01Z  acp ask_user_question id=0 questions=2 tool_call=Some("call-915aa5b1-...")
# … 无 resolve / 无 cancel …
2026-07-29T05:22:02Z  mirror host stop / app reinit
```

Agent unified log：

```text
shell.tool.exec_done  tool_name=ask_user_question  elapsed_ms=303158  success=false
shell.turn.inference_failed  message="request cancelled"
```

Agent 侧错误形态（当次会话）：

```text
Failed to reach the client for user question: unable to receive 'ext_method' response,
channel closed: { "xaiAcpChannelFailure": "recv_failed" }
```

## 协议路径（当前代码）

```text
CLI agent tool: ask_user_question
    → ACP reverse RPC  `_x.ai/ask_user_question`
    → acp_client.rs  parse + AcpEvent::AskUserQuestion
    → session_manager  pending_ask_user_rpc_id = Some(id)
    → emit  "session://ask_user"
    → App.tsx  listen → AskUserModal 或 仅 pending 缓存
    → 用户提交/取消 → session_resolve_ask_user → respond_ask_user_question
```

相关文件：

| 层 | 文件 |
|----|------|
| 解析 / 回包 | `src-tauri/src/acp_client.rs` |
| 挂起状态 / emit | `src-tauri/src/session_manager.rs`（`pending_ask_user_rpc_id`、`resolve_ask_user`） |
| 命令 | `src-tauri/src/commands.rs` → `session_resolve_ask_user` |
| 前端监听 | `src/App.tsx` `session://ask_user` |
| 弹窗 | `src/components/AskUserModal.tsx` |

## 已定位的代码风险

### 1. 后台会话：只 toast，不弹窗，不强制桌面通知

`src/App.tsx`（`session://ask_user` listener）大意：

```ts
if (p.sessionId && p.sessionId !== viewingSessionIdRef.current) {
  pendingAskUserBySessionRef.current.set(p.sessionId, p);
  setToast(...backgroundPermission...);
  return; // 不 setAskUser → 不弹 AskUserModal
}
setAskUser(p);
```

对比权限请求：后台会有 **桌面通知 force:true**。  
**ask_user 后台路径没有 force 通知**，只 toast 一下；若用户不点回该会话，**RPC 永不 resolve** → Agent 一直等。

### 2. Host 无超时

- `pending_ask_user_rpc_id` 一旦设置，只有 `resolve_ask_user` 或会话拆掉才会清。
- **没有**「N 秒未答自动 cancelled」的逻辑。
- 空 questions 时 acp_client 会 auto-cancel；**有 questions 但 UI 没答则无限等**。

### 3. 前台仍可能失败

当次 hang 发生在正在使用的 general 会话上（日志有 `acp ask_user_question`），说明：

- 要么 `setAskUser` 没真正弹出（UI / 焦点 / cancelled listener）
- 要么弹了但 resolve 没成功回写 ACP
- 要么前端 ext 通道 `recv_failed`（与 Tauri event 链路异常有关）

需要加：emit 后确认 UI ack、失败则 auto-cancel + toast 错误。

### 4. 与「连接中」叠化

pending ask_user 时 turn 未结束，`prompt_in_flight` 仍 true；其它会话 `connect open_start` 若排队/抢进程，UI 会长期 **连接中**。  
日志里多次 `open_start` 后长时间无 `spawn_ok` / `session_open_ok` 与此吻合。

## 修复方案（建议分 PR）

### A. Host 超时（必做）

在 `session_manager`：

- 收到 `AskUserQuestion` 启动 **可配置超时**（默认 120s）
- 到期：`respond_ask_user_question(Cancelled)` + 清 `pending_ask_user_rpc_id` + emit 状态 + toast/日志
- 用户回答时 cancel timer

### B. 后台会话体验（必做）

- 与权限一致：`showDesktopNotification({ force: true, ... })`
- 侧边栏 **待回答** 角标（可与未读共用状态机）
- 可选：即使后台也短暂弹出 modal / 或顶部全局 bar

### C. UI 可靠性

- 监听后若 `setAskUser` 失败或 1s 内 modal 未挂载 → 自动 cancel + 错误 toast
- 问卷问题写入聊天 transcript，避免只靠 modal

### D. 可观测性

- App log：emit / resolve / timeout 各打一条 INFO
- 方便以后对照 `elapsed_ms` 与 UI 操作

## 验收

1. 前台提问：modal 出现，答完 turn 继续；取消 turn 不挂死。  
2. 切到其它会话再提问：有通知 + 角标；点回可答；不答超时后 agent 失败退出而非卡死。  
3. 超时后可正常发下一条消息，其它会话不会全体「连接中」。  
4. 单测：parse + timeout cancel + resolve（沿用 `acp_client` / golden fixture）。

## 非目标

- 不改 Grok Build CLI 工具定义（除非上游协议变更）。
- 个人 fork 可先合 `personal/main`；稳定后整理 PR 给 RongleCat。
