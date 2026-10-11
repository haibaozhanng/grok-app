# scripts/ 约束

<!-- 收割自 aoci 索引（2026-10-11）；条目为收割时点的隐性约束，使用前回源码核对。 -->

- `scripts/assemble-updater-manifest.sh` — 删除并重建WORK；只接纳签名配对归档；mac无架构或universal跳过；Linux和Windows可默认x64
- `scripts/build-local.sh` — all只在Darwin构建两种mac和Windows，不包含Linux；不会自行安装缺失构建工具
- `scripts/build-release-config.mjs` — 两变量缺一即失败；编译阶段仍须保留同两变量，生成配置本身不能启用Rust注册
- `scripts/changelog-for-release.py` — 缺失或空章节退出1；无版本参数退出2
- `scripts/generate-icons.sh` — 依赖macOS sips、ImageMagick和Pillow；重建iconset并检查小托盘图标非空
- `scripts/generate-latest-json.sh` — 签名去CR且空签名失败；格式异常只警告，不验证密码学签名；URL中的冒号保留
- `scripts/package-windows-portable.sh` — 删除dist-portable后重建；不编译exe；无上传条件只保留产物；运行仍依赖WebView2和CLI
- `scripts/probe-models.sh` — 会调用在线模型；缺timeout命令则无超时保障；退出0且标记缺失记ok?，不算已确认可用
- `scripts/release-tag.sh` — 默认只建本地tag；--push才外写；现有tag或脏工作区拒绝；贡献者获取失败中止
- `scripts/setup-cross-compile.sh` — 会改默认工具链并安装工具；mac预热执行cargo xwin check，失败仅提示
- `scripts/update-contributors.py` — 只取per_page=100的第一页；dry-run仍访问网络；缺标记中止
- `scripts/verify-updater-setup.sh` — WARN不导致失败；获取失败记WARN；不校验清单平台完整性或签名有效性
