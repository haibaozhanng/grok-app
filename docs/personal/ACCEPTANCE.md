# 修复版验收指引（personal/main）

调试入口：本仓库 `pnpm dev`（Tauri 开发窗口，**不是** `/Applications/Grok.app` 安装包）。

当前分支应含：

| 提交 | 内容 |
|------|------|
| `6030c67` / `c7c7dc0` | ask_user 挂死、stop「no active session」 |
| `cd43c85` | 其它会话完成 → 未读点 + toast + 音效 |
| `5825ec6` | 队列待发提示词可编辑；path_scope 限流 + cwd grant |

---

## 0. 启动前（可与官方版并存）

### 并存说明

| 方式 | 能否和 `/Applications/Grok.app` 同时开 |
|------|----------------------------------------|
| 旧行为（release 单实例） | 否：第二个进程会退出并聚焦已开窗口 |
| **本 fork debug**（`pnpm dev`） | **可以**：debug 构建**不注册** single-instance |
| 数据目录 | 默认仍共用 `~/Library/Application Support/com.grokapp.grok-app/`，**会话/设置会串** |

**推荐验收命令（官方继续用、dev 用独立数据目录）：**

```bash
cd "/Users/zhanghaibao/Documents/代码仓库/grok-app"
git checkout personal/main && git pull
pnpm install

# 独立数据目录，不碰官方版的会话库
export GROK_APP_HOME="$HOME/Library/Application Support/com.grokapp.grok-app-dev"
mkdir -p "$GROK_APP_HOME"
pnpm dev
```

- 第一次 `pnpm dev` 编译可能 1～3 分钟；窗口标题仍可能是 **Grok**，以「你刚启动的 dev 进程」为准。
- **不必退出**官方版；若曾用未改过的代码启动 dev，会被 single-instance 顶掉——拉最新 `personal/main` 再编一次即可。
- 独立 `GROK_APP_HOME` 下需重新登录/加项目（与官方数据隔离）。

若故意共用官方数据（不推荐并行写）：

```bash
# 不设 GROK_APP_HOME，与官方同一目录 —— 请勿两边同时狂点会话
pnpm dev
```

设置建议：

- 已登录 / CLI 可用  
- 权限可先「完全访问」方便点  
- 「回合完成时桌面通知」打开

---

## 1. Stop 不再卡死（必测）

| # | 步骤 | 期望 |
|---|------|------|
| 1.1 | 新会话发一条会跑一会儿的任务 | 出现红 Stop / 工作中 |
| 1.2 | 点 Stop | 停止成功，红钮消失，可继续输入 |
| 1.3 | （可选）任务跑飞后反复切会话再 Stop | **不应**再卡在「no active session」且红钮死住；最多 toast「已清除忙碌状态」 |

---

## 2. ask_user 问卷（必测）

| # | 步骤 | 期望 |
|---|------|------|
| 2.1 | 让 Agent 用选择题问你（例如「用 A 还是 B 方案」并要求选型） | 弹出 **Agent 提问** 面板，可提交/忽略 |
| 2.2 | 答完 | 回合继续，不永久卡「连接中」 |
| 2.3 | 另开会话 A 跑任务，切到 B，再让 A 提问（难复现可跳过） | A 有 toast/通知；点回 A 可答；不答约 **120s** 超时取消，不卡死全局 |

---

## 3. 未读点 + 完成提示 + 声音（必测）

| # | 步骤 | 期望 |
|---|------|------|
| 3.1 | 会话 A 发长任务（如「数到 30 并写点废话」） | 侧边栏 A 显示 **转圈** |
| 3.2 | 立刻切到会话 B（或新建 B） | A 仍转圈 |
| 3.3 | 等 A 完成 | A：**转圈 → 蓝点**；标题略加粗；**toast**「「…」已完成一轮」；**短提示音**；系统通知（若权限允许） |
| 3.4 | 点回 A | **蓝点消失** |
| 3.5 | 在 A 看完后 A 自己再跑完一轮 | 无未读点（你在看就不应标未读） |

音量：系统未静音；若无声，点一下窗口再测（WebAudio 需用户交互后 resume）。

---

## 4. 队列 / 引导可编辑（必测）

| # | 步骤 | 期望 |
|---|------|------|
| 4.1 | 会话工作中再发一条 follow-up | 上方出现 **队列**，仅有文案 + 引导 + 删除 |
| 4.2 | 点队列**文案**或 **编辑图标** | 文案进入下方输入框；该项从队列消失；toast「已载入输入框」 |
| 4.3 | 改几个字再发送 | 仍在工作时重新入队；空闲则直接发出 |
| 4.4 | 再入队一条，点 **删除** | 仅删除，不进输入框 |
| 4.5 | （可选）点 **引导** | 在 streaming 时可用；失败则 toast，项仍可删/改 |

---

## 5. path_scope / 项目（建议）

| # | 步骤 | 期望 |
|---|------|------|
| 5.1 | 侧边栏 **添加项目** → 选 `Documents/代码仓库/grok-app` → 信任 | 之后在该项目下读改文件少报 path 拒访 |
| 5.2 | 看日志（可选）`~/Library/Application Support/com.grokapp.grok-app/logs/app.log.*` | 同一拒访路径不应每秒刷屏（60s 限流） |

---

## 6. 不验收 / 已知非本次范围

- 官方安装的 `/Applications/Grok.app` **不含**这些修复，验收请用 **`pnpm dev` 窗口**（可与官方同时开，但验收操作请在 dev 窗口做）。
- 正式包仍启用单实例；仅 debug 可并存。
- MySQL 列名错误、`search_replace` 匹配失败 = Agent 任务问题，不是本版 Host 回归项。
- `fetch` MCP `McpError` 导入失败 = 本机 uv 包版本，与本次 UI/Host 修复无关。

---

## 7. 出问题怎么截/记

请记下：

1. 操作步骤（1.x / 3.x …）
2. 开发窗口截图
3. 日志尾部：

```bash
tail -n 80 ~/Library/Application\ Support/com.grokapp.grok-app/logs/app.log.$(date +%Y-%m-%d)
```

4. `git rev-parse --short HEAD`（应接近 `5825ec6` 或更新）

---

## 快速口令（全部过一遍约 10 分钟）

1. Stop 能停  
2. 问卷能弹能答  
3. 切走 → 完成 → 蓝点 + 声音 + toast → 点回消失  
4. 工作中再发 → 队列点编辑 → 改完再发  
