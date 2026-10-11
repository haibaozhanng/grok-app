# src-tauri/ 约束

<!-- 收割自 aoci 索引（2026-10-11）；条目为收割时点的隐性约束，使用前回源码核对。 -->

- `src-tauri/Cargo.lock` — Cargo生成的v4锁文件，包含跨平台依赖，不能按当前宿主手动删减
- `src-tauri/Cargo.toml` — updater为必选依赖以供ACL发现；运行注册另受构建配置和debug门控；release panic=abort
- `src-tauri/Info.plist` — 同一字典内重复该key两次，不能当成两项独立权限
- `src-tauri/build.rs` — 公钥与端点均非空才启用cfg；配置文件中有updater字段不替代编译环境变量
- `src-tauri/capabilities/default.json` — 作用域仅main窗口；ACL允许更新操作不表示插件运行时已注册
- `src-tauri/src/account.rs` — signed_in依据存在key或refresh而非未过期；热图按signals文件mtime及会话去重；刷新失败可返回标明来源的缓存
- `src-tauri/src/account_profiles.rs` — 切换先复制到默认~/.grok再同步agent-home；删除active只改索引指向，不切换当前认证；Unix快照设600
- `src-tauri/src/acp_client.rs` — 认证失败仍尝试开会话，load失败回退new；prompt按600秒空闲和4小时绝对上限；早到完成通知等3秒无流再兜底；TCP路径跳过本地spawn配置
- `src-tauri/src/acp_golden_test.rs` — 无网络及真实CLI；生成mock分片的辅助测试默认ignore
- `src-tauri/src/agent_memory.rs` — shared不改用户config；关闭同时强制--no-memory和GROK_MEMORY=0；clear未知scope回workspace且带-y
- `src-tauri/src/agent_prefs.rs` — shared直接返回；写入.claude/settings.json是整文件替换；always_approve分别映射always-approve和bypassPermissions
- `src-tauri/src/agent_subagents.rs` — 关闭强制--no-subagents和GROK_SUBAGENTS=0；开启不加flag或env；shared不改用户config
- `src-tauri/src/agents_catalog.rs` — 同名按忽略大小写合并，项目优先用户、bundled和内建；不解析定义正文；用户根固定~/.grok
- `src-tauri/src/app_update.rs` — 只查询，不下载安装；版本比较忽略预发布后缀；API成功但JSON业务解析失败不会进入HTML兜底
- `src-tauri/src/automation_runner.rs` — 启动延迟12秒、每30秒查一次；任一turn忙即跳过；每tick至多一个任务，失败释放内存fire-key下次重试；按本机时区排期
