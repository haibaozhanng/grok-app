# 根目录文件 约束

<!-- 收割自 aoci 索引（2026-10-11）；条目为收割时点的隐性约束，使用前回源码核对。 -->

- `.gitattributes` — 二进制由Git自动识别，不强制转换其字节
- `AGENTS.md` — rules与overview用于全量认知；maintain完整机器批次绑定源码后才可更新，不能只按文件名猜写
- `CHANGELOG.md` — 版本记录反映当时变更，不替代当前源码行为或测试证据
- `CONTRIBUTING.md` — 默认连接真实grok agent stdio；Mock仅显式启用，发标签前必须先写对应版本变更记录
- `README.md` — 应用通过ACP驱动本地Grok Build CLI，不内嵌该CLI
- `README_EN.md` — 功能说明需结合当前源码和CLI能力核验
- `SECURITY.md` — 钥匙串迁移不涵盖独立agent-home中provider的config.toml凭据；自动化YOLO只用于可信任务
- `index.html` — 初始文档标zh-CN与dark，运行时语言主题另由应用管理
- `package.json` — build调用Tauri，build:ui先tsc再Vite；依赖构建白名单仅esbuild
- `pnpm-lock.yaml` — 声明范围与最终解析版本不同，构建环境应使用冻结锁文件安装
