# App 日志排查 2026-07-29

来源：`~/Library/Application Support/com.grokapp.grok-app/logs/app.log.2026-07-29`  
+ `agent-home/logs/unified.jsonl`

## 分类

| 类型 | 数量级 | 是否 App 缺陷 | 处理 |
|------|--------|---------------|------|
| `path_scope: denied` `/Applications/Grok.app` | ~3600 | 噪音 + 越权探测 | 限流 WARN；会话 cwd 自动 grant |
| `path_scope: denied` `Documents/代码仓库/...` | ~4000 | 工作区未加入「受信任项目」时预期拒访 | 会话 connect 时 grant cwd；仍建议把仓库加为项目 |
| `tool_output_error` (MySQL / read_file / search_replace) | 少 | Agent 工具执行失败，非 Host 崩溃 | 不改 Host；看具体任务 |
| `acp rescue: parked session still streaming` | 3 | 切会话时 demote 竞态，已有 rescue | 观察；已有恢复路径 |
| `ask_user` hang / `request cancelled` | 已分析 | Host 丢事件 + 无超时 | 已在 `personal/main` 修复 |
| OIDC `Refresh token has been revoked` | 1 | 登录态过期 | 重新登录官方账号 / `grok login` |
| `shell.turn.inference_failed` cancelled | 若干 | 用户 Stop / 重启 | 正常 |

## 本次代码改动

1. 队列待发提示词可编辑（点击文案 / 编辑按钮 → 载入输入框）
2. `path_scope` 拒访日志 60s 同路径限流
3. `session` connect 时 `grant_path(cwd)` 减少误杀预览
