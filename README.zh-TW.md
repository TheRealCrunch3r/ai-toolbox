<div align="center">
<a href="README.md">English</a> · <a href="README.de.md">Deutsch</a> · <a href="README.es.md">Español</a> · <a href="README.zh-CN.md">简体中文</a> · <b>繁體中文</b><br/>
<h1>AI Toolbox —— 面向 LM Studio 本地 LLM 的一體化自主 AI Agent & 工具外掛</h1><hr/>
<br/><img src="docs/brand/emblem-256.png" alt="AI Toolbox 徽標 — 匯聚格構與軸向光束（V3）" width="96"/><br/>
<span style="letter-spacing:.28em;font-weight:bold">強大工具 · 穩固之手</span><br/>
<b>給你的本地 LLM 一雙真正的手。</b> 最完整的 LM Studio Hub 外掛——把任意本地模型變成能幹、自管理的 AI 智能體。<br/>自管理上下文讓馬拉松式會話保持存活 · 一個外掛，零膠水程式碼，預設完全離線。
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.19-2f80ed?style=flat-square" alt="version v1.9.19"/></a> <a href="#the-tool-arsenal-113-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-113%20ready--made-7c3aed?style=flat-square" alt="tools 113 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-71%20suites%20%C2%B7%201020%20green-3fb950?style=flat-square" alt="tests 71 suites · 1020 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=flat-square" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=flat-square" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=flat-square&logo=node.js" alt="runtime Node ≥ 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> · <a href="QUICK_START.md">Quick Start</a> · <a href="ARCHITECTURE.md">Architecture</a> · <a href="TOOLS_REFERENCE.md">Tool Reference</a> · <a href="CHANGELOG_v4.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> · <a href="SECURITY.md">Security</a><br/>
<code>安裝：將 <b>dist/</b> 資料夾複製進 LM Studio → 在 Plugins（外掛）中啟用（Node.js 20+）</code>
</div>


**LM Studio 的 AI Agent 工具箱** —— 113 個本地 LLM 工具：檔案編輯、程式庫搜尋、RAG、瀏覽器自動化、Git & GitHub。

**給你的本地 LLM 裝上真正的手。** LM Studio Hub 上最完整的外掛 —— 把任意本地模型變成一個有能力、自我管理的 AI Agent，具備安全的檔案編輯、絕不掛起的程式庫搜尋、背景建置、無頭瀏覽器自動化、Git & GitHub 工作流、OCR、圖表產生和語意 RAG；**自管理上下文**讓馬拉松式會話保持存活。一個外掛，零膠水程式碼，預設完全離線。

> `v1.9.19` · `113 個即用工具` · `1020 項測試通過（71 個套件）` · `5 種語言本機化` · `MIT` · `Node 20+`

> ⚠️ **譯文聲明** —— 本檔案為 [README.md](README.md) 的繁體中文版。英文版為準（canonical），如有出入以 README.md 為準；原文變更時請同步更新本檔案。

[!IMPORTANT] LM Studio 不支援自動更新。如遇問題，請先手動更新：移除目前版本並從外掛網站重新下載。注意即使你的版本已過時，LM Studio 仍可能顯示「已安裝」提示。

## 目錄

[為什麼選 AI Toolbox（對比其他外掛）] · [正面對比評測] · [功能概觀] · [快速上手（2 分鐘）] · [設定與工具開關 —— 完全控制，零程式碼] · [安全姿態 —— 按重要標準打造] · [架構內幕（供好奇者）] · [工具軍火庫：113 個工具] · [版本亮點 —— 完整歷史見 CHANGELOG_v4.md（活躍），v1–v3 在 docs/history/]

*目錄為純文字列表（無錨點連結）；各節標題對應下文標題。*

---

## 為什麼選 AI Toolbox（對比其他 LM Studio 外掛）

*基於 2026 年 8 月對約 115 個 LM Studio Hub 外掛的調研（約 40 個工具箱，僅 9 個具備真正的檔案工具）。*
**圖例：** 🥇 整個領域唯一 · ⭐ 罕見（≤ 少數幾個） · 🛡️ 突出的安全工程

| 能力 | 對你有什麼用 | 領域地位 |
|---|---|---|
| 🧠 **自管理上下文**（`AutoTracker` + `ContextGuard`） | Token 閾值在*工具鏈中途*觸發（75% / 90%），自動摘要並壓縮對話，先於溢出 —— 長 Agent 會話持續工作而不是死掉。Prompt 管線內建專案關鍵字偵測。 | ⭐ **沒有任何一家被調研的競爭者有任何上下文/token 管理** —— 其他所有「記憶」工具都只是裸的存/列/查 CRUD |
| 🌐 **跨專案記憶**（`switch_context`、專案登錄表） | 回憶*另一個*已註冊專案上週做了什麼決定。新近度×頻率評分、TTL 修剪、切換前先確認（Step 0.7）。 | ⭐ **所有被調研外掛中均不存在** |
| 🏷️ **帶信心度標籤的結果 + 叢集感知的工具選擇**（`confidenceTypes`、`toolPriority`） | 每條自動追蹤的事實都標註 EXTRACTED / INFERRED / AMBIGUOUS —— 讓你能區分 Agent *知道*的和它在猜的；當 113 個工具競爭一個回合時，叢集感知優先級保證正確的工具在文法限制下依然可用。 | 🥇 **沒有任何被調研的競爭者對結果信心度做標籤** —— 也沒有其他外掛能在不丟棄工具的情況下塞進這麼多 |
| 🧬 **基於 AST 的程式碼重構**（`refactor_code`） | 重新命名 / 移動函式 / 擷取函式 / 清理無用 import —— 語法安全的 AST 變換，失敗時**自動回滾**，不是正規表示式文字瞎改。 | 🥇 **約 115 個被調研外掛中唯一基於 AST 的重構工具** |
| 🔍 **不可能掛起的搜尋**（`ripgrep`、`find_replace_all`） | 原生 ripgrep 跑在與宿主執行緒隔離的 worker 裡，帶 3 秒牆鐘看門狗；Rust 方言正規表示式自動降級為固定字串並透過 `pattern_mode` 說明；多檔案取代支援 dry-run。 | 🛡️ 競爭者提供的是無界 grep 迴圈 —— 這個在物理上不可能無限轉圈 |
| 💾 **安全檔案編輯**（`replace_text_in_file`、`line_operations`） | 每次編輯都先寫 `.bak` 備份，模式錨定插入，行指紋校驗，寫入後 MD5 完整性檢查。一次呼叫即可還原任何檔案（`restore_from_bak`）。 | 🛡️ **三層護欄**防舊行號損毀 —— 競爭者最多提供重新命名式備份外殼 |
| ⏸️ **非阻塞背景命令**（`run_background_command` + monitor/cancel） | 啟動長時間建置和任務，繼續聊天，隨時查狀態，需要時取消。無需 Docker。 | ⭐ 最接近的競爭者**要求 Docker**；這個在外掛宿主中原生執行 |
| 🌍 **真正的瀏覽器自動化**（Puppeteer 套件） | 無頭 Chromium，帶持久會話和 UI 互動 —— 不是一錘子「抓個頁面」呼叫。 | 競爭者的「訪問網站」外掛 ⚠️ *只是靜態爬蟲* |
| 📊 **本機語意 RAG，任意格式**（`rag_index_pdf/docx/xlsx`、`rag_query_vector`、`rag_web_content`） | 對 PDF、Word 文件和試算表建立向量索引 —— 外加按查詢相關的網頁擷取。一套工具替代競爭者的 2–4 個獨立外掛。資料不出你的機器。 | 🛡️ 有界分塊：**毒長度文件不會 OOM**（已對一個 1690 頁的 PDF 驗證） |
| 🧪 **替你跑測試套件**（`run_tests`） | 從 `package.json` 自動辨識 Jest / Mocha / Vitest 並執行，結果回到聊天裡。 | ⭐ 領域中沒有任何其他工具箱做到這一點 |
| 📈 **資料視覺化作為工具呼叫**（`generate_chart`） | 長條 / 折線 / 餅圖 / 環形 / 散點 / 雷達 → 圖片檔案，渲染器不可用時回退 HTML。 | 🥇 **調研時整個領域沒有任何資料視覺化外掛** |
| 🗺️ **結構化規劃與即時進度**（`create_plan`、`get_plan`、`update_plan_step`） | 多步計畫經由真實狀態機追蹤（pending → in_progress → done，blocked 重試），帶完成度指標。 | ⭐ 罕見 —— 大多數工具箱根本沒有規劃原語 |

---

## 與 Beledarian 的 LM Studio Tools 正面對比

Hub 上最接近的直接競爭者：同樣的活兒（給本地 LLM 提供工具），建構方式截然不同。AI Toolbox 領先之處：

| AI Toolbox 有而他們沒有的 |
|---|
| ✅ **AST 級重構**（重新命名、移動函式、清理無用 import）—— 語法安全變換帶自動回滾，不是字串編輯 |
| ✅ **真正的 RAG：** 基於 PDF / DOCX / XLSX 的本機向量索引，帶頁級溯源 —— 不只是關鍵字搜尋 |
| ✅ **影像與資料視覺化：** 對截圖和螢幕擷取做 OCR、圖片中繼資料 + 對比、圖表產生 |
| ✅ **113 個工具** vs ~49 —— 由 71 個套件共 1020 項通過的測試支撐 |
| ✅ **崩潰 resilient 的寫入 + 失敗回滾：** 一次失敗的編輯永遠不會損毀你的檔案 |

我們此前的 i18n 缺口已關閉：**現在提供 5 種語言**（en · de · es · zh-CN · zh-TW），每種都是完整翻譯集 —— 並且有反 stub 測試守護套件，保證別名/回退語言不會靜默退化。我們寧可直接告訴你，也不假裝它不存在。

---

## 看它幹活 —— 一個回合，十個工具

> **你：** *«重構 `auth.ts` —— 把 token 刷新邏輯擷取成獨立模組，把輔助函式挪過去，跑一遍我們的測試套件，如果全綠就開個 PR。»*
>
> → `refactor_code`（AST 擷取 + 移動函式，自動回滾已就位）→ `run_tests`（自動辨識 **Jest**：全部 ✅）→ `gh_create_pr` —— **一個回合。零複製貼上。零手把手。**

---

## 功能概觀

### 安全檔案編輯與搜尋
就地取代 · 按行錨定插入 · 超大檔案分塊讀取 · diff · 資料夾樹 —— 並且**每次寫入都先備份**（`.bak`，一次呼叫還原）。全專案物理上不可能掛起的搜尋（`ripgrep`：worker 隔離的原生掃描帶 3 秒牆鐘看門狗，預設修剪 `node_modules` 之類的目錄）外加多檔案 dry-run 取代。

### 尊重語法的程式碼重構
AST 驅動的重新命名、函式移動與擷取，帶自動回滾 —— Agent 像開發者一樣重構，而不是像 `sed`。

### 長任務不丟線索
在**背景**啟動建置和 watcher，繼續聊天，按需輪詢或取消。沙箱 JS/Python 處理快速邏輯；需要時上完整 shell（管線、重新導向、環境變數）—— 但*預設關閉*。測試套件自己跑：自動辨識 runner，結果回到聊天裡。

### 網頁研究與瀏覽器自動化
多引擎搜尋帶自動回退 · 乾淨的頁面文字擷取 · **真正的無頭瀏覽器**帶持久會話（不是一錘子爬蟲）· 任意 GET/POST JSON 呼叫的 HTTP 客戶端 —— SSRF 防護。

### Git & GitHub 工作流，解放雙手
本機：status、diff、add、commit、log、checkout、**stash**、**blame**。遠端：issues、PR、留言、diff、push —— 走你已信任的 `gh` CLI。

### 它真能讀的資料
PDF、Word 文件與試算表 → **本機語意向量搜尋**（資料不出你的機器）。對截圖和桌面擷取做 OCR；圖片中繼資料與對比。唯讀 SQLite，注入免疫的參數化查詢。你的 Agent 字面上*看得見*螢幕。

### 比聊天視窗更長壽的記憶
決定、模式和設定按專案持久 —— **並且跨專案**：型別作用域、TTL 修剪、新近度×頻率評分的召回、切換前先確認（`switch_context`）。ContextGuard 讓馬拉松會話存活：75% 自動摘要，90% 壓縮 —— 就在鏈路中途。

### 看得見的輸出
從原始資料渲染圖表到圖片檔案（長條/折線/餅圖/環形/散點/雷達）。即時產生 HTML/CSS/JS 元件並在瀏覽器中預覽，把資料擷取回聊天。

---

## 快速上手（2 分鐘）

**前置條件：** LM Studio（最新版）· Node.js 20+ · *可選：* GitHub 遠端操作需 `gh` CLI → https://cli.github.com/

1. **安裝** —— 把資料夾放進去，在 LM Studio 設定中啟用外掛
2. **開關** —— 開啟你想要的工具類別（Execution & Browser 按設計預設關閉）
3. *（可選）* 在終端執行一次 `gh auth login` 解鎖 GitHub 遠端工具
4. **開始聊** —— 你的 Agent 現在手邊有 **113 個工具**，嚴格按你的設定門控

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 71 suites / 1020 tests green (owner-verified 10.10 TWO-TIER CLOSE-OUT — FIX A + FIX B, gate round 3 ~12:05; prior canon 69/1003 @ 09.10 [FIX #21 mid-loop forced-save, r7] · prior arcs: 68/990 @ 08.10 [LEVER-1], 68/987 @ 07.10 [Arc C sweep — entry unlogged], 65/952 @ 06.10 [DOC-PIN gate] 64/941 @ 06.10 [i18n gate], 64/938 @ 06.10 ×2 [F1 ~16:57 · PLAN-SEAM ~18:0x], 63/931 @ 05.10, 63/930 @ 04.10 ×3, 61/917 @ 04.10, 893/59 @ 02.10, 874/58 @ ~21.5 s on 01.10, 860/56 @ 29.09, 857/56 @ 28.09)
```

---

## 設定與工具開關 —— 完全控制，零程式碼

| 控件 | 作用 |
|---|---|
| 🎛️ **細粒度門控** | 每個工具家族在 LM Studio 設定介面中獨立開關 |
| 👑 **上帝模式** | 一個開關全開（僅限高手 —— Execution 預設關閉是有原因的） |
| 🔁 **ContextGuard** | 設定 token 閾值 + 摘要模型；看自動壓縮如何保住長會話 |
| 🧮 **自動追蹤** | 背景追蹤決定與任務完成，結果帶信心度標籤 |

---

## 安全姿態 —— 按重要標準打造

- 🛡️ 每個會修改檔案的工具都先寫 `.bak` —— 還原只需一次呼叫（`restore_from_bak`）
- 🛡️ `ripgrep` / `find_replace_all`：worker 隔離掃描（宿主執行緒不會被卡死），3 秒牆鐘看門狗，Rust 方言自動降級透過 `pattern_mode` + 提示明示
- 🛡️ RAG 與網頁路徑：有界讀取（250K–500K 字元預算）、每次 fetch 嘗試 30 秒中止、分塊迴圈*必然終止* —— 毒文件不會 OOM 外掛宿主
- 🛡️ JS/Python 沙箱執行；完整 shell 可用但**預設關閉**
- 完整威脅模型與揭露流程 → [SECURITY.md](SECURITY.md)

---

## 架構內幕（供好奇者）

聲明式工具登錄表，閉包式相依注入 · 全非同步 + 崩潰 resilient 的原子寫入（`atomicWrite` 工具函式，失敗回滾）· 經由原生 SDK API 的动态上下文視窗偵測 · 信心度標籤結果（`EXTRACTED | INFERRED | AMBIGUOUS`）· 面向文法限制修剪的叢集感知工具優先級。

深入 → [ARCHITECTURE.md](ARCHITECTURE.md) · 開發指南見本檔案下文

---

## 工具軍火庫：橫跨所有家族的 113 個工具，全部由你開關

一個外掛替代一整面貨架。以下是每個家族、它覆蓋什麼、以及預設狀態：

| 家族 | 數量 | 給你的 Agent 什麼 | 預設 |
|---|---|---|---|
| 📁 **檔案系統** | 24 | 讀/寫/編輯/搜尋 —— 路徑校驗、備份、超大檔案分塊讀取、diff、專案樹、worker 隔離的 `ripgrep` 搜尋（3 秒看門狗）+ 結構化內容掃描（`pattern_scan`）+ 帶指紋護欄的行級手術（`line_operations`，2023.09 Q6 併入） | ✅ |
| 🧬 **重構與 Recode 引擎** | `refactor_code` + 規則 | AST 重新命名 · 移動函式 · 擷取 · 清理無用 import —— 外加可插拔規則引擎（死程式碼提示、型別推斷、非同步現代化）帶 dry-run diff | ✅ |
| 🔍 **文字處理** | 3 | 正規表示式變換（`sed` 類）、結構化擷取（`awk` 類）、即時 Markdown 表格（行級手術已移入檔案系統，2023.09 Q6） | ✅ |
| 📋 **任務規劃** | 4 | 目標 + 步驟計畫，經由真實狀態機帶即時完成度指標 —— blocked 步驟乾淨重試 · `remove_plan` 確認門控 + 自然完成自動移除（05.10） | ✅ |
| ⚡ **執行** | 5 | 沙箱 JS & Python（eval/require 被攔截）· 完整 shell 與原生終端（opt-in）· **自動執行你專案的測試套件**（辨識 Jest/Mocha/Vitest） | 混合 |
| 🧠 **上下文與記憶** | 22 | 自動摘要、帶 TTL 修剪與啟發式召回的型別化記憶、事件追蹤 —— **外加跨專案**：註冊/搜尋/切換專案，會話索引瀏覽器 + 一次呼叫的唯讀恢復引導（`restore_session_context`，25.09） | ✅ |
| 📊 **向量 RAG** | 7 | 對你的程式庫*以及* PDF · Word 文件 · 試算表做語意搜尋 + 按查詢相關的網頁擷取 —— 本機、有界、OOM 免疫 | ✅ |
| 💾 **備份與還原** | 5 | 全資料夾 ZIP 快照（`create_backup`/`restore_backup`）、清單、清理 —— 外加底層支撐一切的逐編輯 `.bak` 系統 | ✅ |
| 📈 **資料視覺化** | 1 | `generate_chart`：長條 / 折線 / 餅圖 / 環形 / 散點 / 雷達 → 圖片檔案帶 HTML 回退 · 同一開關下的姊妹工具：`markdown_preview`、`get_repeat_tool_advice`（DOC-PIN） | ✅ |
| 🖼️ **影像處理** | 4 | OCR（`image_to_text`）· 中繼資料檢查（`describe_image`）· 桌面截圖（`screenshot_desktop`）· 位元組級對比（`compare_images`） | ✅ |
| 📄 **文件解析** | 1 | PDF / DOCX / TXT 直接進入對話，二進位安全 | ✅ |
| 🌐 **網頁研究** | 3 | 多引擎搜尋帶回退 · 乾淨的頁面文字擷取 | ✅ |
| 🌍 **瀏覽器自動化** | 5 | 真正的無頭 Chromium：開啟頁面、持久會話、UI 互動、HTML 預覽 | ✗ opt-in |
| 🐙 **Git & GitHub** | 15 | 完整本機 git 含 **stash 與 blame** · 經你的 `gh` CLI 操作 issues/PR/留言/diff/push | ✗ opt-in |
| ⏳ **背景命令** | 3 | 跑長任務不阻塞聊天 —— 監視 stdout/stderr，隨時取消。無需 Docker。 | ✗ opt-in |
| 📡 **HTTP 客戶端** | 3 | 任意方法請求帶重試/逾時，JSON GET/POST 助手 —— SSRF 防護 | ✗ opt-in |
| 🎨 **UI 產生** | 3 | 在瀏覽器中建構並預覽即時 HTML/CSS/JS 元件 · 把資料擷取回來 | ✗ opt-in |
| 🗃️ **資料庫** | 1 | 唯讀 SQLite，注入免疫的參數化查詢 | ✗ opt-in |

> *數量均經程式碼核驗（source-of-truth 審計，2026 年 9 月）；暴露的工具數始終取決於開關設定。*

> *每個工具的參數、預設值與範例 → [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md)（對照原始碼審計）。教學：[DOCUMENTATION.md](DOCUMENTATION.md) · [QUICK_START.md](QUICK_START.md)*

---

## 版本亮點（完整歷史 → CHANGELOG_v4.md —— 活躍；v1–v3 在 docs/history/）

| 版本 | 頭條 |
|---|---|
| **v1.9.18** | 🔒 Suite D 共用檔案遺失寫修復 —— snap→rename 臨界區上的按路徑程序內鎖（新增 `sharedFileLock.ts`，接入兩個寫入方）· 🧾 EOL-FIX v4 —— 混合/CRLF 檔案上 `replace_text_in_file` 的位元組級精確行尾往返 + 經 `get_file_metadata` 報告的編輯前 eol/bom 可見性（同弧內關閉 TS7022 tsc gate 阻塞）· 🧯 PIPELINE HYGIENE D 25.09 —— Tool Execution Pipeline 統一結果分類學 + finalizeContent 不變量、按回合重置 toolsProvider guard、describeError lint 清零、jest RC#4 mapper；全套 836/51 綠 + eslint 乾淨；docs CHANGELOG_v3 + ARCHITECTURE 已更新 |
| **v1.9.17** | 💾 工具門控設定檔 —— 持久化工具開關（rev 29，14.09 發布）· 🔍 ripgrep TOOL SWAP + 統一專案登錄表 + worker 池抖動修復（rev 30，最後一次 GitHub 發布於 15.09）—— 全部 rev-31 工作（DE-STRAngle、AutoTracker F1+F2、叢集感知工具排序、CWD 狀態遷移、SPEC-C）隨 v1.9.18 交付；⏳ v1.9.18 / rev 33 發布待定（owner 決定） |
| **v1.9.16** | 🔍 `web_search` 零結果回退修復 —— 死/空引擎不再中斷鏈條 · rev 28：重裝 + 重新啟動當天現場驗證（被阻塞的 `ddg-api` 跳過 → `ddg-fetch` 返回結果） |
| **v1.9.15** | ⚡ B' ripgrep phase-1 預過濾用於 `pattern_scan`（位元組級一致的 JS 回退保證）· rev 27：`ripgrep` 提升為執行期相依，修復 Hub 安裝時靜默丟失快速路徑 —— 已在使用者機器上現場驗證 |
| **v1.9.14** | 🧠 `get_memory` 本機檔案解析護欄 —— 無鍵的自動上下文記錄不再中止讀取（hotfix） |
| **v1.9.13** | 🔍 `grep_files` 改用 ripgrep 正規表示式引擎（程序內 WASM 預過濾，透明回退保留所有掛起護欄；該工具在 14.09 TOOL SWAP 中移除 → 獨立原生 `ripgrep`）· 所有工具結果帶 `executedTool` 事實戳 · Tier-1 死程式碼清除（~90 KB） |
| **v1.9.12** | 🆕 `pattern_scan` 遞迴內容搜尋（不安全正規表示式自動降級為字面值；256 KB / 萬行硬上限）· puppeteer `connected` 屬性讀取修復 · 死檔案清除 —— MD 文件全面同步 |
| **v1.9.10** | 🔧 OOM 加固套件：有界 web/RAG 讀取、分塊不動點終止、`rag_web_content` 去重 —— 外掛宿主堆在毒載荷下安全了 |
| **v1.9.9** | ⏱️ `grep_files` 截止時限（部分結果 + `aborted` 旗標）· AutoTracker token 增量在*長工具鏈內部*觸發閾值 · 即時 `chat used ≈ N tok` DELTA 日誌 |
| **v1.9.8** | 🔒 僅顯式專案註冊 · 掛起預防（`max_depth`、行上限）· Step-0.7 關鍵字偵測 + 惰性登錄表同步消滅「project not found」迴圈 |
| **v1.9.7** | 💾 處處崩潰 resilient 的原子寫入 —— 隨機暫存檔名、失敗回滾、零阻塞 I/O |
| **v1.9.5–6** | 🧠 Graphify 啟發的智慧：信心度標籤結果、hub 排除叢集、叢集感知工具優先級 · 消除 `shell:true` 棄用 |
| **v1.8.x** | 🛡️ 三層行編輯護欄 · SDK v1.x token 計數精度（與側邊欄誤差 <0.3%）· 聲明式登錄表重構（~80 行 if/else → 20 條目登錄表） |

---

## 核心相依

`@lmstudio/sdk` ^1.5.0 · `puppeteer` ^24 · `isomorphic-git` ^1.38 · `sharp` ^0.35.3 · `tesseract.js` ^7 · `pdf-parse` / `mammoth` / `xlsx`（文件管線）· `ripgrep` ^0.3.1（WASM 正規表示式引擎，惰性載入）· `@dqbd/tiktoken`（ContextGuard）· `zod`（執行期驗證）

---

## 授權

**MIT** —— 可自由使用、修改、分發。見 [LICENSE](LICENSE)。

---

*AI Toolbox 是一個一體化 LM Studio 外掛與本地 LLM 的 AI Agent 工具箱：安全的檔案工具、絕不掛起的程式庫搜尋、背景建置、無頭瀏覽器自動化、Git & GitHub 工作流、OCR、資料視覺化、覆蓋 PDF/DOCX/XLSX 的本機語意 RAG、跨專案記憶、自管理上下文視窗 —— 113 個即用工具呼叫，你的模型零膠水程式碼即可使用。*
