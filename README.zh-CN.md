<div align="center">
<a href="README.md">English</a> · <a href="README.de.md">Deutsch</a> · <a href="README.es.md">Español</a> · <b>简体中文</b> · <a href="README.zh-TW.md">繁體中文</a><br/>
<h1>AI Toolbox —— 面向 LM Studio 本地 LLM 的一体化自主 AI Agent & 工具插件</h1><hr/>
<br/><img src="docs/brand/emblem-256.png" alt="AI Toolbox 徽标 — 汇聚格构与轴向光束（V3）" width="96"/><br/>
<span style="letter-spacing:.28em;font-weight:bold">强大工具 · 稳妥之手</span><br/>
<b>给你的本地 LLM 一双真正的手。</b> 最完整的 LM Studio Hub 插件——把任意本地模型变成能干、自管理的 AI 智能体。<br/>自管理上下文让马拉松式会话保持存活 · 一个插件，零胶水代码，默认完全离线。
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.19-2f80ed?style=flat-square" alt="version v1.9.19"/></a> <a href="#the-tool-arsenal-113-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-113%20ready--made-7c3aed?style=flat-square" alt="tools 113 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-71%20suites%20%C2%B7%201020%20green-3fb950?style=flat-square" alt="tests 71 suites · 1020 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=flat-square" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=flat-square" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=flat-square&logo=node.js" alt="runtime Node ≥ 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> · <a href="QUICK_START.md">Quick Start</a> · <a href="ARCHITECTURE.md">Architecture</a> · <a href="TOOLS_REFERENCE.md">Tool Reference</a> · <a href="CHANGELOG_v4.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> · <a href="SECURITY.md">Security</a><br/>
<code>安装：将 <b>dist/</b> 文件夹复制进 LM Studio → 在 Plugins（插件）中启用（Node.js 20+）</code>
</div>


**LM Studio 的 AI Agent 工具箱** —— 113 个本地 LLM 工具：文件编辑、代码库搜索、RAG、浏览器自动化、Git & GitHub。

**给你的本地 LLM 装上真正的手。** LM Studio Hub 上最完整的插件 —— 把任意本地模型变成一个有能力、自我管理的 AI Agent，具备安全的文件编辑、绝不挂起的代码库搜索、后台构建、无头浏览器自动化、Git & GitHub 工作流、OCR、图表生成和语义 RAG；**自管理上下文**让马拉松式会话保持存活。一个插件，零胶水代码，默认完全离线。

> `v1.9.19` · `113 个即用工具` · `1020 项测试通过（71 个套件）` · `5 种语言本地化` · `MIT` · `Node 20+`

> ⚠️ **译文声明** —— 本文件为 [README.md](README.md) 的简体中文版。英文版为准（canonical），如有出入以 README.md 为准；原文变更时请同步更新本文件。

[!IMPORTANT] LM Studio 不支持自动更新。如遇问题，请先手动更新：移除当前版本并从插件网站重新下载。注意即使你的版本已过时，LM Studio 仍可能显示"已安装"提示。

## 目录

[为什么选 AI Toolbox（对比其他插件）] · [正面对比评测] · [功能概览] · [快速上手（2 分钟）] · [配置与工具开关 —— 完全控制，零代码] · [安全姿态 —— 按重要标准打造] · [架构内幕（供好奇者）] · [工具军火库：113 个工具] · [版本亮点 —— 完整历史见 CHANGELOG_v4.md（活跃），v1–v3 在 docs/history/]

*目录为纯文本列表（无锚点链接）；各节标题对应下文标题。*

---

## 为什么选 AI Toolbox（对比其他 LM Studio 插件）

*基于 2026 年 8 月对约 115 个 LM Studio Hub 插件的调研（约 40 个工具箱，仅 9 个具备真正的文件工具）。*
**图例：** 🥇 整个领域唯一 · ⭐ 罕见（≤ 少数几个） · 🛡️ 突出的安全工程

| 能力 | 对你有什么用 | 领域地位 |
|---|---|---|
| 🧠 **自管理上下文**（`AutoTracker` + `ContextGuard`） | Token 阈值在*工具链中途*触发（75% / 90%），自动摘要并压缩对话，先于溢出 —— 长 Agent 会话持续工作而不是死掉。Prompt 流水线内置项目关键词检测。 | ⭐ **没有一家被调研的竞品有任何上下文/token 管理** —— 其他所有"记忆"工具都只是裸的存/列/查 CRUD |
| 🌐 **跨项目记忆**（`switch_context`、项目注册表） | 回忆*另一个*已注册项目上周做了什么决定。新近度×频率评分、TTL 剪枝、切换前先确认（Step 0.7）。 | ⭐ **所有被调研插件中均不存在** |
| 🏷️ **带置信度标签的结果 + 聚类感知的工具选择**（`confidenceTypes`、`toolPriority`） | 每条自动追踪的事实都标注 EXTRACTED / INFERRED / AMBIGUOUS —— 让你能区分 Agent *知道*的和它在猜的；当 113 个工具竞争一个回合时，聚类感知优先级保证正确的工具在语法限制下依然可用。 | 🥇 **没有一家被调研竞品对结果置信度做标签** —— 也没有其他插件能在不丢弃工具的情况下塞进这么多 |
| 🧬 **基于 AST 的代码重构**（`refactor_code`） | 重命名 / 移动函数 / 提取函数 / 清理无用 import —— 语法安全的 AST 变换，失败时**自动回滚**，不是正则文本瞎改。 | 🥇 **约 115 个被调研插件中唯一基于 AST 的重构工具** |
| 🔍 **不可能挂起的搜索**（`ripgrep`、`find_replace_all`） | 原生 ripgrep 跑在与宿主线程隔离的 worker 里，带 3 秒墙钟看门狗；Rust 方言正则自动降级为固定字符串并通过 `pattern_mode` 说明；多文件替换支持 dry-run。 | 🛡️ 竞品提供的是无界 grep 循环 —— 这个在物理上不可能无限转圈 |
| 💾 **安全文件编辑**（`replace_text_in_file`、`line_operations`） | 每次编辑都先写 `.bak` 备份，模式锚定插入，行指纹校验，写入后 MD5 完整性检查。一次调用即可恢复任意文件（`restore_from_bak`）。 | 🛡️ **三层护栏**防旧行号损坏 —— 竞品最多提供重命名式备份外壳 |
| ⏸️ **非阻塞后台命令**（`run_background_command` + monitor/cancel） | 启动长时间构建和任务，继续聊天，随时查状态，需要时取消。无需 Docker。 | ⭐ 最接近的竞品**要求 Docker**；这个在插件宿主中原生运行 |
| 🌍 **真正的浏览器自动化**（Puppeteer 套件） | 无头 Chromium，带持久会话和 UI 交互 —— 不是一锤子"抓个页面"调用。 | 竞品的"访问网站"插件 ⚠️ *只是静态爬虫* |
| 📊 **本地语义 RAG，任意格式**（`rag_index_pdf/docx/xlsx`、`rag_query_vector`、`rag_web_content`） | 对 PDF、Word 文档和电子表格建立向量索引 —— 外加按查询相关的网页抽取。一套工具替代竞品的 2–4 个独立插件。数据不出你的机器。 | 🛡️ 有界分块：**毒长度文档不会 OOM**（已对一个 1690 页的 PDF 验证） |
| 🧪 **替你跑测试套件**（`run_tests`） | 从 `package.json` 自动识别 Jest / Mocha / Vitest 并执行，结果回到聊天里。 | ⭐ 领域中没有任何其他工具箱做到这一点 |
| 📈 **数据可视化作为工具调用**（`generate_chart`） | 柱状 / 折线 / 饼图 / 环形 / 散点 / 雷达 → 图片文件，渲染器不可用时回退 HTML。 | 🥇 **调研时整个领域没有任何数据可视化插件** |
| 🗺️ **结构化规划与实时进度**（`create_plan`、`get_plan`、`update_plan_step`） | 多步计划经由真实状态机跟踪（pending → in_progress → done，blocked 重试），带完成度指标。 | ⭐ 罕见 —— 大多数工具箱根本没有规划原语 |

---

## 与 Beledarian 的 LM Studio Tools 正面对比

Hub 上最接近的直接竞品：同样的活儿（给本地 LLM 提供工具），构建方式截然不同。AI Toolbox 领先之处：

| AI Toolbox 有而他们没有的 |
|---|
| ✅ **AST 级重构**（重命名、移动函数、清理无用 import）—— 语法安全变换带自动回滚，不是字符串编辑 |
| ✅ **真正的 RAG：** 基于 PDF / DOCX / XLSX 的本地向量索引，带页级溯源 —— 不只是关键词搜索 |
| ✅ **图像与数据可视化：** 对截图和屏幕捕捉做 OCR、图片元数据 + 对比、图表生成 |
| ✅ **113 个工具** vs ~49 —— 由 71 个套件共 1020 项通过的测试支撑 |
| ✅ **崩溃 resilient 的写入 + 失败回滚：** 一次失败的编辑永远不会损坏你的文件 |

我们此前的 i18n 缺口已关闭：**现在提供 5 种语言**（en · de · es · zh-CN · zh-TW），每种都是完整翻译集 —— 并且有反 stub 测试守护套件，保证别名/回退语言不会静默退化。我们宁可直接告诉你，也不假装它不存在。

---

## 看它干活 —— 一个回合，十个工具

> **你：** *"重构 `auth.ts` —— 把 token 刷新逻辑提取成独立模块，把辅助函数挪过去，跑一遍我们的测试套件，如果全绿就开个 PR。"*
>
> → `refactor_code`（AST 提取 + 移动函数，自动回滚已就位）→ `run_tests`（自动识别 **Jest**：全部 ✅）→ `gh_create_pr` —— **一个回合。零复制粘贴。零手把手。**

---

## 功能概览

### 安全文件编辑与搜索
就地替换 · 按行锚定插入 · 超大文件分块读取 · diff · 目录树 —— 并且**每次写入都先备份**（`.bak`，一次调用恢复）。全项目物理上不可能挂起的搜索（`ripgrep`：worker 隔离的原生扫描带 3 秒墙钟看门狗，默认剪掉 `node_modules` 之类的目录）外加多文件 dry-run 替换。

### 尊重语法的代码重构
AST 驱动的重命名、函数移动与提取，带自动回滚 —— Agent 像开发者一样重构，而不是像 `sed`。

### 长任务不丢线索
在**后台**启动构建和 watcher，继续聊天，按需轮询或取消。沙箱 JS/Python 处理快速逻辑；需要时上完整 shell（管道、重定向、环境变量）—— 但*默认关闭*。测试套件自己跑：自动识别 runner，结果回到聊天里。

### 网页研究与浏览器自动化
多引擎搜索带自动回退 · 干净的页面文本抽取 · **真正的无头浏览器**带持久会话（不是一锤子爬虫）· 任意 GET/POST JSON 调用的 HTTP 客户端 —— SSRF 防护。

### Git & GitHub 工作流，解放双手
本地：status、diff、add、commit、log、checkout、**stash**、**blame**。远程：issues、PR、评论、diff、push —— 走你已信任的 `gh` CLI。

### 它真能读的数据
PDF、Word 文档与电子表格 → **本地语义向量搜索**（数据不出你的机器）。对截图和桌面捕捉做 OCR；图片元数据与对比。只读 SQLite，注入免疫的参数化查询。你的 Agent 字面上*看得见*屏幕。

### 比聊天窗口更长寿的记忆
决定、模式和配置按项目持久 —— **并且跨项目**：类型作用域、TTL 剪枝、新近度×频率评分的召回、切换前先确认（`switch_context`）。ContextGuard 让马拉松会话存活：75% 自动摘要，90% 压缩 —— 就在链路中途。

### 看得见的输出
从原始数据渲染图表到图片文件（柱状/折线/饼图/环形/散点/雷达）。实时生成 HTML/CSS/JS 组件并在浏览器中预览，把数据抽取回聊天。

---

## 快速上手（2 分钟）

**前置条件：** LM Studio（最新版）· Node.js 20+ · *可选：* GitHub 远程操作需 `gh` CLI → https://cli.github.com/

1. **安装** —— 把文件夹放进去，在 LM Studio 设置中启用插件
2. **开关** —— 打开你想要的工具类别（Execution & Browser 按设计默认关闭）
3. *（可选）* 在终端执行一次 `gh auth login` 解锁 GitHub 远程工具
4. **开聊** —— 你的 Agent 现在手边有 **113 个工具**，严格按你的配置门控

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 71 suites / 1020 tests green (owner-verified 10.10 TWO-TIER CLOSE-OUT — FIX A + FIX B, gate round 3 ~12:05; prior canon 69/1003 @ 09.10 [FIX #21 mid-loop forced-save, r7] · prior arcs: 68/990 @ 08.10 [LEVER-1], 68/987 @ 07.10 [Arc C sweep — entry unlogged], 65/952 @ 06.10 [DOC-PIN gate] 64/941 @ 06.10 [i18n gate], 64/938 @ 06.10 ×2 [F1 ~16:57 · PLAN-SEAM ~18:0x], 63/931 @ 05.10, 63/930 @ 04.10 ×3, 61/917 @ 04.10, 893/59 @ 02.10, 874/58 @ ~21.5 s on 01.10, 860/56 @ 29.09, 857/56 @ 28.09)
```

---

## 配置与工具开关 —— 完全控制，零代码

| 控件 | 作用 |
|---|---|
| 🎛️ **细粒度门控** | 每个工具家族在 LM Studio 设置界面中独立开关 |
| 👑 **上帝模式** | 一个开关全开（仅限高手 —— Execution 默认关闭是有原因的） |
| 🔁 **ContextGuard** | 设定 token 阈值 + 摘要模型；看自动压缩如何保住长会话 |
| 🧮 **自动追踪** | 后台跟踪决定与任务完成，结果带置信度标签 |

---

## 安全姿态 —— 按重要标准打造

- 🛡️ 每个会修改文件的工具都先写 `.bak` —— 恢复只需一次调用（`restore_from_bak`）
- 🛡️ `ripgrep` / `find_replace_all`：worker 隔离扫描（宿主线程不会被卡死），3 秒墙钟看门狗，Rust 方言自动降级通过 `pattern_mode` + 提示明示
- 🛡️ RAG 与网页路径：有界读取（250K–500K 字符预算）、每次 fetch 尝试 30 秒中止、分块循环*必然终止* —— 毒文档不会 OOM 插件宿主
- 🛡️ JS/Python 沙箱执行；完整 shell 可用但**默认关闭**
- 完整威胁模型与披露流程 → [SECURITY.md](SECURITY.md)

---

## 架构内幕（供好奇者）

声明式工具注册表，闭包式依赖注入 · 全异步 + 崩溃 resilient 的原子写入（`atomicWrite` 工具函数，失败回滚）· 经由原生 SDK API 的动态上下文窗口检测 · 置信度标签结果（`EXTRACTED | INFERRED | AMBIGUOUS`）· 面向语法限制剪枝的聚类感知工具优先级。

深入 → [ARCHITECTURE.md](ARCHITECTURE.md) · 开发指南见本文件下文

---

## 工具军火库：横跨所有家族的 113 个工具，全部由你开关

一个插件替代一整面货架。以下是每个家族、它覆盖什么、以及默认状态：

| 家族 | 数量 | 给你的 Agent 什么 | 默认 |
|---|---|---|---|
| 📁 **文件系统** | 24 | 读/写/编辑/搜索 —— 路径校验、备份、超大文件分块读取、diff、项目树、worker 隔离的 `ripgrep` 搜索（3 秒看门狗）+ 结构化内容扫描（`pattern_scan`）+ 带指纹护栏的行级手术（`line_operations`，2023.09 Q6 并入） | ✅ |
| 🧬 **重构与 Recode 引擎** | `refactor_code` + 规则 | AST 重命名 · 移动函数 · 提取 · 清理无用 import —— 外加可插拔规则引擎（死代码提示、类型推断、异步现代化）带 dry-run diff | ✅ |
| 🔍 **文本处理** | 3 | 正则变换（`sed` 类）、结构化抽取（`awk` 类）、即时 Markdown 表格（行级手术已移入文件系统，2023.09 Q6） | ✅ |
| 📋 **任务规划** | 4 | 目标 + 步骤计划，经由真实状态机带实时完成度指标 —— blocked 步骤干净重试 · `remove_plan` 确认门控 + 自然完成自动移除（05.10） | ✅ |
| ⚡ **执行** | 5 | 沙箱 JS & Python（eval/require 被拦截）· 完整 shell 与原生终端（opt-in）· **自动运行你项目的测试套件**（识别 Jest/Mocha/Vitest） | 混合 |
| 🧠 **上下文与记忆** | 22 | 自动摘要、带 TTL 剪枝与启发式召回的类型化记忆、事件追踪 —— **外加跨项目**：注册/搜索/切换项目，会话索引浏览器 + 一次调用的只读恢复引导（`restore_session_context`，25.09） | ✅ |
| 📊 **向量 RAG** | 7 | 对你的代码库*以及* PDF · Word 文档 · 电子表格做语义搜索 + 按查询相关的网页抽取 —— 本地、有界、OOM 免疫 | ✅ |
| 💾 **备份与恢复** | 5 | 全目录 ZIP 快照（`create_backup`/`restore_backup`）、列表、清理 —— 外加底层支撑一切的逐编辑 `.bak` 系统 | ✅ |
| 📈 **数据可视化** | 1 | `generate_chart`：柱状 / 折线 / 饼图 / 环形 / 散点 / 雷达 → 图片文件带 HTML 回退 · 同一开关下的姊妹工具：`markdown_preview`、`get_repeat_tool_advice`（DOC-PIN） | ✅ |
| 🖼️ **图像处理** | 4 | OCR（`image_to_text`）· 元数据检查（`describe_image`）· 桌面截图（`screenshot_desktop`）· 字节级对比（`compare_images`） | ✅ |
| 📄 **文档解析** | 1 | PDF / DOCX / TXT 直接进入对话，二进制安全 | ✅ |
| 🌐 **网页研究** | 3 | 多引擎搜索带回退 · 干净的页面文本抽取 | ✅ |
| 🌍 **浏览器自动化** | 5 | 真正的无头 Chromium：打开页面、持久会话、UI 交互、HTML 预览 | ✗ opt-in |
| 🐙 **Git & GitHub** | 15 | 完整本地 git 含 **stash 与 blame** · 经你的 `gh` CLI 操作 issues/PR/评论/diff/push | ✗ opt-in |
| ⏳ **后台命令** | 3 | 跑长任务不阻塞聊天 —— 监视 stdout/stderr，随时取消。无需 Docker。 | ✗ opt-in |
| 📡 **HTTP 客户端** | 3 | 任意方法请求带重试/超时，JSON GET/POST 助手 —— SSRF 防护 | ✗ opt-in |
| 🎨 **UI 生成** | 3 | 在浏览器中构建并预览实时 HTML/CSS/JS 组件 · 把数据抽取回来 | ✗ opt-in |
| 🗃️ **数据库** | 1 | 只读 SQLite，注入免疫的参数化查询 | ✗ opt-in |

> *数量均经代码核验（source-of-truth 审计，2026 年 9 月）；暴露的工具数始终取决于开关配置。*

> *每个工具的参数、默认值与示例 → [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md)（对照源码审计）。教程：[DOCUMENTATION.md](DOCUMENTATION.md) · [QUICK_START.md](QUICK_START.md)*

---

## 版本亮点（完整历史 → CHANGELOG_v4.md —— 活跃；v1–v3 在 docs/history/）

| 版本 | 头条 |
|---|---|
| **v1.9.18** | 🔒 Suite D 共享文件丢失写修复 —— snap→rename 临界区上的按路径进程内锁（新增 `sharedFileLock.ts`，接入两个写入方）· 🧾 EOL-FIX v4 —— 混合/CRLF 文件上 `replace_text_in_file` 的字节级精确行尾往返 + 经 `get_file_metadata` 报告的编辑前 eol/bom 可见性（同弧内关闭 TS7022 tsc gate 阻塞）· 🧯 PIPELINE HYGIENE D 25.09 —— Tool Execution Pipeline 统一结果分类学 + finalizeContent 不变量、按回合重置 toolsProvider guard、describeError lint 清零、jest RC#4 mapper；全套 836/51 绿 + eslint 干净；docs CHANGELOG_v3 + ARCHITECTURE 已更新 |
| **v1.9.17** | 💾 工具门控配置档 —— 持久化工具开关（rev 29，14.09 发布）· 🔍 ripgrep TOOL SWAP + 统一项目注册表 + worker 池抖动修复（rev 30，最后一次 GitHub 发布于 15.09）—— 全部 rev-31 工作（DE-STRAngle、AutoTracker F1+F2、聚类感知工具排序、CWD 状态迁移、SPEC-C）随 v1.9.18 交付；⏳ v1.9.18 / rev 33 发布待定（owner 决定） |
| **v1.9.16** | 🔍 `web_search` 零结果回退修复 —— 死/空引擎不再中断链条 · rev 28：重装 + 重启当天现场验证（被阻塞的 `ddg-api` 跳过 → `ddg-fetch` 返回结果） |
| **v1.9.15** | ⚡ B' ripgrep phase-1 预过滤用于 `pattern_scan`（字节级一致的 JS 回退保证）· rev 27：`ripgrep` 提升为运行时依赖，修复 Hub 安装时静默丢失快速路径 —— 已在用户机器上现场验证 |
| **v1.9.14** | 🧠 `get_memory` 本地文件解析护栏 —— 无键的自动上下文记录不再中止读取（hotfix） |
| **v1.9.13** | 🔍 `grep_files` 改用 ripgrep 正则引擎（进程内 WASM 预过滤，透明回退保留所有挂起护栏；该工具在 14.09 TOOL SWAP 中移除 → 独立原生 `ripgrep`）· 所有工具结果带 `executedTool` 事实戳 · Tier-1 死代码清除（~90 KB） |
| **v1.9.12** | 🆕 `pattern_scan` 递归内容搜索（不安全正则自动降级为字面量；256 KB / 万行硬上限）· puppeteer `connected` 属性读取修复 · 死文件清除 —— MD 文档全面同步 |
| **v1.9.10** | 🔧 OOM 加固套件：有界 web/RAG 读取、分块不动点终止、`rag_web_content` 去重 —— 插件宿主堆在毒载荷下安全了 |
| **v1.9.9** | ⏱️ `grep_files` 截止时限（部分结果 + `aborted` 标志）· AutoTracker token 增量在*长工具链内部*触发阈值 · 实时 `chat used ≈ N tok` DELTA 日志 |
| **v1.9.8** | 🔒 仅显式项目注册 · 挂起预防（`max_depth`、行上限）· Step-0.7 关键词检测 + 惰性注册表同步消灭"project not found"循环 |
| **v1.9.7** | 💾 处处崩溃 resilient 的原子写入 —— 随机临时文件名、失败回滚、零阻塞 I/O |
| **v1.9.5–6** | 🧠 Graphify 启发的智能：置信度标签结果、hub 排除聚类、聚类感知工具优先级 · 消除 `shell:true` 弃用 |
| **v1.8.x** | 🛡️ 三层行编辑护栏 · SDK v1.x token 计数精度（与侧边栏误差 <0.3%）· 声明式注册表重构（~80 行 if/else → 20 条目注册表） |

---

## 核心依赖

`@lmstudio/sdk` ^1.5.0 · `puppeteer` ^24 · `isomorphic-git` ^1.38 · `sharp` ^0.35.3 · `tesseract.js` ^7 · `pdf-parse` / `mammoth` / `xlsx`（文档管线）· `ripgrep` ^0.3.1（WASM 正则引擎，惰性加载）· `@dqbd/tiktoken`（ContextGuard）· `zod`（运行时校验）

---

## 许可

**MIT** —— 可自由使用、修改、分发。见 [LICENSE](LICENSE)。

---

*AI Toolbox 是一个一体化 LM Studio 插件与本地 LLM 的 AI Agent 工具箱：安全的文件工具、绝不挂起的代码库搜索、后台构建、无头浏览器自动化、Git & GitHub 工作流、OCR、数据可视化、覆盖 PDF/DOCX/XLSX 的本地语义 RAG、跨项目记忆、自管理上下文窗口 —— 113 个即用工具调用，你的模型零胶水代码即可使用。*
