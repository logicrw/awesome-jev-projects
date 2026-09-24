<div align="center">

<a href="https://logicrw.github.io/awesome-jev-projects/"><img src="public/banner-zh.svg" alt="Awesome Jev" width="100%" /></a>

# Awesome Jev — System-1 Agent 架构雷达

<p align="center">
  <a href="https://awesome.re"><img src="https://awesome.re/badge.svg" alt="Mentioned in Awesome" /></a>
  <a href="https://logicrw.github.io/awesome-jev-projects/"><img src="https://img.shields.io/badge/Live%20Radar-logicrw.github.io-d7fa91?style=flat-square&labelColor=1a201a&logo=safari" alt="Live Radar" /></a>
  <a href="#分类"><img src="https://img.shields.io/badge/Curated%20Projects-662%2B-2563eb?style=flat-square" alt="Projects Count" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-d97706.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://github.com/logicrw/awesome-jev-projects/issues/new?template=project.yml"><img src="https://img.shields.io/badge/Submissions-via%20Issue-16a34a.svg?style=flat-square" alt="Submissions via Issue" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;•&nbsp; <b>简体中文</b> &nbsp;•&nbsp; <a href="README.ja.md">日本語</a> &nbsp;•&nbsp; <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <a href="https://logicrw.github.io/awesome-jev-projects/">🌐 <b>搜索与筛选 ↗</b></a> &nbsp;｜&nbsp; <a href="#agent-skill-接入">🤖 <b>Agent Skill 接入</b></a> &nbsp;｜&nbsp; <a href="#分类">📂 <b>分类</b></a> &nbsp;｜&nbsp; <a href="https://github.com/logicrw/awesome-jev-projects/issues/new?template=project.yml">🚀 <b>提交项目 (Issue 专用通道)</b></a>
</p>

> [!TIP]
> **📢 项目收录通道**：欢迎大家提交自己的 Jev 开源项目！为保障格式规范与自动化索引，本项目**统一通过 [Issue 专用模板](https://github.com/logicrw/awesome-jev-projects/issues/new?template=project.yml) 提交收录**，仓库**不接收 Pull Request**。填写仓库地址即可提交。

</div>

## 💡 **为什么关注 Jev 与 System-1 决策架构？**

构建自主智能体（Agent）时，如果把每一个分支选项都交给秒级响应的大推理模型（System 2），不仅**延迟高、成本高**，而且极易发生上下文漂移。

**TypeSafe Jev（System 1）** 是专门针对离散选择、连续打分与概率优化的百毫秒级决策模型：
- ⚡ **百毫秒内极速返回**：50–100ms 快速完成判定，保障 Agent 主循环高频敏捷。
- 🎯 **原生确定性输出**：原生支持 `Choice`（多选一）、`Score`（打分）与 `Noul`（二元逻辑与概率），免去易碎的正则提取。
- 🛡️ **严格拒绝概念炒作**：全网严选 **662+** 个绑定真实公开开源源码版本的落地项目，覆盖 17 大核心工程赛道。

### 📊 架构分工对比：System 1 (Jev) vs System 2 (大推理模型)

| 核心维度 | System 2（大推理模型） | TypeSafe Jev（System 1 决策模型） |
| :--- | :--- | :--- |
| **响应时延** | 1,500ms – 5,000ms+（秒级高延迟） | **50ms – 100ms（百毫秒极速反射）** |
| **输出结构** | 自由文本 / 易损坏的 JSON 正则提取 | **原生强类型 `Choice`、`Score`、`Noul`** |
| **Token 成本** | 高昂（$1.00 – $15.00 / 1M tokens） | **极轻量（仅占常规调用的极小零头）** |
| **上下文稳定性** | 易产生幻觉、长对话注意力漂移 | **确定性状态输入，零格式幻觉** |
| **工程核心职责** | 宏观规划、长文本总结、开放生成 | **工具路由、动作选择、安全门禁、高频循环** |

### 🎮 探索功能一览

- 🎰 **实体机械卡牌分发仓**：探索 Jev 原生决策点，支持连击抽卡计数与**逢 10 抽全屏粒子大烟花（💥 嘣！）**。
- ⚡ **毫秒级吸顶搜索与浮动过滤**：即便页面下滑，也可随时唤出浮动分类面板，支持多标签一键点选过滤。
- 🔍 **100% 绑定固定源码**：所有收录项目均核验真实 commit SHA 与具体接入点，绝无空气包装与死链。

> **[搜索与筛选 ↗](https://logicrw.github.io/awesome-jev-projects/)** · **662 个精选项目**

由社区维护的 Jev 项目与架构雷达，收录具有公开源码与清晰集成逻辑的开源项目，帮助开发者快速探索和落地 System-1 决策架构。

所有条目均已核对公开源码与实际决策逻辑，便于参考与选型。协议兼容实现会明确注明底层模型。

各项目遵循原仓库的开源许可证；特殊或未声明许可已单独注明。

## 赞助合作 · 付费展示

首发合作伙伴招募中，目前没有付费赞助商。

[查看合作方案与联系方式](https://github.com/logicrw/awesome-jev-projects/blob/main/SPONSORING.md) · [Sponsors](https://github.com/logicrw/awesome-jev-projects/blob/main/SPONSORS.md)

赞助不影响收录审核、项目描述或自然排序。

## Agent Skill 接入

安装官方技能后，可在终端或 Agent 中按赛道检索项目、读取固定版本源码证据与决策逻辑。

```bash
npx skills add logicrw/awesome-jev-projects
npx skills add https://logicrw.github.io/awesome-jev-projects/
```

[Agent Skill](https://logicrw.github.io/awesome-jev-projects/skill.md) · [llms.txt](https://logicrw.github.io/awesome-jev-projects/llms.txt) · [llms-full.txt](https://logicrw.github.io/awesome-jev-projects/llms-full.txt)

## 分类

- [浏览器与桌面 (46)](https://logicrw.github.io/awesome-jev-projects/categories/browser-os-action/)
- [命令行与流水线 (62)](https://logicrw.github.io/awesome-jev-projects/categories/cli-pipelines/)
- [分类与目录 (2)](https://logicrw.github.io/awesome-jev-projects/categories/classification-taxonomy/)
- [代码与图谱 (14)](https://logicrw.github.io/awesome-jev-projects/categories/codebase-graph-pathfinding/)
- [上下文与记忆 (38)](https://logicrw.github.io/awesome-jev-projects/categories/context-gc-filter/)
- [音乐与界面创作 (20)](https://logicrw.github.io/awesome-jev-projects/categories/creative-tools/)
- [数据与搜索 (42)](https://logicrw.github.io/awesome-jev-projects/categories/data-search/)
- [决策工具 (25)](https://logicrw.github.io/awesome-jev-projects/categories/decision-tools/)
- [行业应用 (60)](https://logicrw.github.io/awesome-jev-projects/categories/domain-vertical-tools/)
- [评测与观测 (29)](https://logicrw.github.io/awesome-jev-projects/categories/evaluation-observability/)
- [游戏与实时决策 (50)](https://logicrw.github.io/awesome-jev-projects/categories/high-frequency-simulation/)
- [MCP 与集成 (41)](https://logicrw.github.io/awesome-jev-projects/categories/mcp-integrations/)
- [模型路由与降本 (52)](https://logicrw.github.io/awesome-jev-projects/categories/routing-cost-optimization/)
- [SDK 与决策框架 (115)](https://logicrw.github.io/awesome-jev-projects/categories/sdk-decision-frameworks/)
- [SDK 与兼容接入 (6)](https://logicrw.github.io/awesome-jev-projects/categories/sdk-integrations/)
- [安全与内容审核 (56)](https://logicrw.github.io/awesome-jev-projects/categories/security-guardrails/)
- [语音与对话 (4)](https://logicrw.github.io/awesome-jev-projects/categories/voice-conversation/)

## 浏览器与桌面

- [**cua**](https://github.com/trycua/cua) — Cua 仓库的 jev-use 预览示例：Driver 观察与执行，Jev 从有界候选中选择浏览器动作。
  - **Jev 在哪一步做判断**: 读取 DOM 或可用的视觉区域描述，仅返回已提供的候选动作 ID。
  - **这个项目的用途**: 提供 Python、TypeScript 循环，以及离线与在线分开的验证路径。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/trycua/cua/) · 许可证: MIT

- [**jev-ultrafast**](https://github.com/browser-use/jev-ultrafast) — 给浏览器一个目标，让 Jev 选择操作和页面控件，需要输入文字时再调用文本模型。
  - **Jev 在哪一步做判断**: 根据当前 DOM，在一次请求里选择操作和相应控件；文本模型负责生成输入内容。
  - **这个项目的用途**: 把界面选择、文字生成与浏览器执行分开，方便查看每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-ultrafast/) · 许可证: MIT

- [**jev-desktop**](https://github.com/lahfir/agent-desktop) — 把电脑里的按钮和菜单交给 Jev 来选。它读原生无障碍结构，一步步完成桌面操作。
  - **Jev 在哪一步做判断**: Jev 同时选择动作与目标，并评估置信度和操作风险；本地策略决定是否执行或停止。
  - **这个项目的用途**: 让主 Agent 不必把整棵界面树塞进上下文。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-desktop/) · 许可证: Apache-2.0

- [**typesafe-computer-use**](https://github.com/awlevin/typesafe-computer-use) — 用 OCR 和界面状态构造候选动作，让 Jev 决定如何操作 macOS，需要写文字时再调用文本模型。
  - **Jev 在哪一步做判断**: 从确定性提取的控件与动作中选择下一步，执行器操作桌面。
  - **这个项目的用途**: 把屏幕读取、动作选择与文本生成分开。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/awlevin/typesafe-computer-use/) · 许可证: MIT

- [**Jev-cu**](https://github.com/Sac-Y/Jev-cu) — Codex Computer Use 辅助循环：界面文字候选交给 Jev，读取与执行交给桌面工具。
  - **Jev 在哪一步做判断**: 选择元素、动作、完成度和风险，本地策略决定执行、停止或要求确认。
  - **这个项目的用途**: 以文字候选表达判断输入，默认先 dry-run。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sac-y/jev-cu/) · 许可证: MIT

- [**omg.dev**](https://github.com/BennyKok/omg.dev) — omg.dev 的移动端测试脚本可让 Jev 读取可访问性树并选择下一步交互。
  - **Jev 在哪一步做判断**: 判断要操作的控件、步骤是否完成或是否受阻，再由测试执行器操作界面。
  - **这个项目的用途**: 给移动端测试加入基于当前界面状态的选择。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bennykok/omg.dev/) · 许可证: MIT

- [**jev-browser-use**](https://github.com/wy-coliney/jev-browser-use) — 给 Codex 浏览器工作流加一个 Skill：Jev 选导航、点击和滚动，Codex 保留文字输入与最终核验。
  - **Jev 在哪一步做判断**: 将页面状态与可执行候选交给 Jev，现有浏览器连接负责执行动作。
  - **这个项目的用途**: 把重复的页面选择交给独立决策步骤，复用已有浏览器连接。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wy-coliney/jev-browser-use/) · 许可证: MIT

- [**mobile-jev**](https://github.com/droidrun/mobile-jev) — 通过 Mobilerun 控制 Android 手机，网页面板与命令行可查看 Jev 的操作过程。
  - **Jev 在哪一步做判断**: 根据手机界面选择应用、控件和下一步动作，Mobilerun 执行操作。
  - **这个项目的用途**: 记录动作轨迹与请求时延，便于检查手机任务的执行过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/droidrun/mobile-jev/) · 许可证: MIT

- [**jev-voice-browser**](https://github.com/moritzkremb/jev-voice-browser) — 用语音控制 Playwright 浏览器，将逐步转写的口令交给 Jev 判断。
  - **Jev 在哪一步做判断**: 选择意图、元素、网址或原文片段，并判断口令是否完整、是否涉及敏感动作。
  - **这个项目的用途**: 界面显示概率、动作与请求时间，便于观察语音交互。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/moritzkremb/jev-voice-browser/) · 许可证: MIT

- [**jev-browser**](https://github.com/jkudish/jev-browser) — 给定任务与网址后驱动浏览器，返回最终页面、截图和逐步操作记录。
  - **Jev 在哪一步做判断**: 从 DOM 控件选择点击、输入、选择或滚动，并判断目标是否完成、流程是否卡住。
  - **这个项目的用途**: 把动作建议、实际执行与停止原因留在可检查的轨迹中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jkudish/jev-browser/) · 许可证: MIT

- [**jev-use**](https://github.com/savka777/jev-use) — 这是在 macOS 上用语音或文字下指令、由 Jev 读取 Accessibility 树并操作屏幕元素的电脑使用工具。
  - **Jev 在哪一步做判断**: Jev 根据用户指令、当前应用窗口和编号后的可操作目标列表，选择下一步应执行的操作及其目标控件。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/savka777/jev-use/) · 许可证: MIT

- [**jev-voice**](https://github.com/kevinbadi/jev-voice) — 通过本地语音识别加一次 Jev 选择调用来打开应用、输入、搜索和操控 macOS 的语音助手。
  - **Jev 在哪一步做判断**: Jev 从语音转录文本和当前屏幕可观察元素中选择要执行的操作类型及其目标参数。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kevinbadi/jev-voice/) · 许可证: MIT

- [**jev-browser**](https://github.com/Ying-Kai-Liao/jev-browser) — 浏览器自动化库、CLI 和 MCP：调用方模型给出目标与待输入文字，Jev 选择具体操作。
  - **Jev 在哪一步做判断**: 从页面候选中选择元素、动作和值，并评估完成、错误与不可逆操作。
  - **这个项目的用途**: 把浏览器动作循环与调用方规划分开，并返回状态与轨迹。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ying-kai-liao/jev-browser/) · 许可证: MIT

- [**typesafe-adblock**](https://github.com/realZachi/typesafe-adblock) — 一个实验性 Chrome 扩展，让 Jev 判断候选 DOM 元素是否是广告，再高亮或移除。
  - **Jev 在哪一步做判断**: 对元素文本、标签和链接等信息批量询问 Noul，按阈值应用页面操作。
  - **这个项目的用途**: 展示语义判断如何连接到具体页面元素。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/realzachi/typesafe-adblock/) · 许可证: MIT

- [**JevBrowserExt**](https://github.com/chy4pro/JevBrowserExt) — 把 jev-ultrafast 做成 Manifest V3 Chrome 扩展：Jev 在当前标签里选操作和 DOM 元素，只有输入文字时才调用小型对话模型。
  - **Jev 在哪一步做判断**: 一次请求选择 CLICK、TYPE\_TEXT、SELECT、SCROLL\_DOWN、SCROLL\_UP、PRESS\_ENTER、WAIT、DONE 或 BLOCKED 以及对应元素；PRESS\_ENTER 是独立按键控件。另用独立是非题核对目标是否已达成、动作是否卡住。
  - **这个项目的用途**: 在用户自己的标签里跑，不截图；操作、目标元素和输入文案可以分开检查。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chy4pro/jevbrowserext/) · 许可证: MIT

- [**jev-macos-loop**](https://github.com/jcpsimmons/jev-macos-loop) — 在 Mac 本地识别屏幕文字和控件，把文字选项交给 Jev，再点击它选中的元素。
  - **Jev 在哪一步做判断**: Jev 从本地视觉、OCR 与无障碍标签组成的有限元素列表中选择；坐标和输入执行留在 Mac。
  - **这个项目的用途**: 让原生界面点击使用可枚举目标，并在执行前复核焦点与元素状态。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jcpsimmons/jev-macos-loop/) · 许可证: AGPL-3.0

- [**jevfill**](https://github.com/imohitmayank/jevfill) — Jevfill 是一个 Chrome 扩展，可调用 Jev 根据用户粘贴的纯文本笔记自动填写网页表单。
  - **Jev 在哪一步做判断**: Jev 为每个扫描到的表单字段从用户笔记行中选择最匹配的一行并返回置信度。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/imohitmayank/jevfill/) · 许可证: MIT

- [**jev-ego**](https://github.com/romaluev/jev-ego) — 面向 ego lite 的浏览器 Agent，把页面可操作元素编号后交给 Jev 选择下一步。
  - **Jev 在哪一步做判断**: Jev 在一次请求中选择操作及目标；需要自由文本时使用单独的文字辅助模型。
  - **这个项目的用途**: 提供观察、建议和执行入口；上传、弹窗等能力仍需其他浏览器工具。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/romaluev/jev-ego/) · 许可证: 未声明

- [**jev-agent-browser**](https://github.com/forvela/jev-agent-browser) — 该项目让 Jev 选择类型化浏览器操作并由 agent-browser 执行，以完成有界的浏览、研究和分类任务。
  - **Jev 在哪一步做判断**: Jev 根据当前页面快照和历史选择下一个类型化浏览器操作及其目标引用，并判断是否达成目标或陷入停滞。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/forvela/jev-agent-browser/) · 许可证: MIT

- [**aside-jev**](https://github.com/himomohi/aside-jev) — 给 Aside 浏览器 Agent 提供 Jev 判断的 MCP 服务器与 skill。
  - **Jev 在哪一步做判断**: Agent 列出候选动作，Jev 选择候选 ID，再由 Agent 通过 Aside 执行并复核。
  - **这个项目的用途**: 把模型选择限制在应用给出的动作表内，执行结果仍需另行验证。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/himomohi/aside-jev/) · 许可证: MIT

- [**AskJev**](https://github.com/ranjan2829/AskJev) — 通过 MCP 把 Agent 接到浏览器，由 Jev 选择网页动作，并对付款、删除等操作设置确认环节。
  - **Jev 在哪一步做判断**: 从当前网页控件中选动作，并评估操作风险与不可逆程度。
  - **这个项目的用途**: 把自动操作与用户确认放在同一工作流中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ranjan2829/askjev/) · 许可证: MIT

- [**jev-browser**](https://github.com/tontoko/jev-browser) — 基于 Playwright 的 Jev 浏览器自动化工具，共用 CLI、MCP 与 TypeScript SDK。
  - **Jev 在哪一步做判断**: Jev 从页面观测中选择操作、匹配表单字段或提取结构化内容，Playwright 执行。
  - **这个项目的用途**: 支持持久会话与页面结果回读；回读不等于已验证数据库持久化。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tontoko/jev-browser/) · 许可证: Apache-2.0

- [**jev-clerk**](https://github.com/stas4000/jev-clerk) — 在 macOS 桌面上把供应商发票录入会计软件：Jev 每步从封闭动作表里选点击对象，深度模型只改剧本。
  - **Jev 在哪一步做判断**: POST \`https://api.typesafe.ai/v1/systemone\`，默认 \`jev-latest\`，每步做封闭动作 Choice。
  - **这个项目的用途**: 屏幕动作由 Jev 的封闭选择驱动；作者演示数字未经本站复测。GitHub SPDX 为空，LICENSE 文件是 MIT。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/stas4000/jev-clerk/) · 许可证: 未声明

- [**jev-yt-time-saver**](https://github.com/jaibhasin/jev-yt-time-saver) — jev-yt-time-saver：Jev 根据视频标题、频道、时长、描述和搜索意图判断每个 YouTube 视频是否浪费时间并给出浪费分数。
  - **Jev 在哪一步做判断**: Jev 根据视频标题、频道、时长、描述和搜索意图判断每个 YouTube 视频是否浪费时间并给出浪费分数。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jaibhasin/jev-yt-time-saver/) · 许可证: 未声明

- [**computer-use-jev**](https://github.com/paulsmith/computer-use-jev) — 用 Go 控制 macOS 应用，让 Jev 从可访问性树里选择控件和操作。
  - **Jev 在哪一步做判断**: 根据窗口状态选择动作、目标、是否输入文字以及任务是否结束。
  - **这个项目的用途**: 候选控件来自界面快照，可以回看选择过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/paulsmith/computer-use-jev/) · 许可证: MIT

- [**ego-jev**](https://github.com/jiangkoumo/ego-jev) — \*\*用 Jev（TypeSafe System One）驱动 ego lite 浏览器，把「下一步点哪里」的决策放进单个进程内闭环。\*\*
  - **Jev 在哪一步做判断**: Jev根据索引化元素表一次性决定下一步操作类型及其目标元素。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jiangkoumo/ego-jev/) · 许可证: MIT

- [**jev-browser**](https://github.com/Mrlyk/jev-browser) — 在交互终端中用自然语言操作浏览器，也可通过结构化 CLI 命令供 AI Agent 调用。
  - **Jev 在哪一步做判断**: Jev 根据自然语言指令从最多253个候选页面元素中选择概率最高的操作目标。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mrlyk/jev-browser/) · 许可证: Apache-2.0

- [**jev-mobile**](https://github.com/Friedjof/jev-mobile) — jev-mobile 是一个自主的 Android 子 Agent，以 TypeSafe Jev 为决策器，对 USB 连接的设备执行观察、归一化、决策、变更和验证的持久任务循环。
  - **Jev 在哪一步做判断**: Jev根据语义化界面状态和有效候选动作从限定选项中决定下一步移动端操作与笔记意图分类。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/friedjof/jev-mobile/) · 许可证: MIT

- [**jev-shield**](https://github.com/vmendes90/jev-shield) — 一个 Chrome 广告过滤扩展，用 Jev 判断信息流元素是否带有推广意图。
  - **Jev 在哪一步做判断**: 把候选 DOM 元素分批发送到 TypeSafe，以 Noul 概率配合阈值决定是否折叠。
  - **这个项目的用途**: 在本地广告规则之外增加基于文字含义的判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vmendes90/jev-shield/) · 许可证: MIT

- [**browser-use-with-jev**](https://github.com/garry-schuette/browser-use-with-jev) — 这是一个 Python 集成，保留 Browser Use 的执行引擎，由 Jev 选择具体浏览器操作，宿主模型负责生成与验证。
  - **Jev 在哪一步做判断**: Jev 从已验证的浏览器操作候选中选择下一步具体动作，遇生成、不确定或需验证时移交宿主模型。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/garry-schuette/browser-use-with-jev/) · 许可证: MIT

- [**jev-browser-local**](https://github.com/rorshopping/jev-browser-local) — 该项目把 jev-browser 接到本地 Jev 风格决策引擎与桥接服务，在本机完成浏览器操作决策和输入文本生成，无需调用云端模型。
  - **Jev 在哪一步做判断**: Jev 根据当前页面状态和候选元素列表，在每一步决定点击、输入或停止等浏览器操作。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rorshopping/jev-browser-local/) · 许可证: 未声明

- [**jev-ra**](https://github.com/brnyxx/jev-ra) — \*\*面向 CLI 编码智能体的高速浏览器操作层。\*\* Claude Code、Codex 或任何 MCP 客户端把目标交给 jev-ra。System One 决策模型 TypeSafe Jev 在一次往返中同时选出每一步的操作和目标元素。制定计划、 提供要输入的文本、读取页面内容、在 jev-ra 上交时接手，这些都由调用方的智能体完成。循环内不会再跑 第二个 LLM。
  - **Jev 在哪一步做判断**: Jev 在每一步用一次请求同时决定操作类型、目标元素、输入值、步骤有效性与目标是否达成。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/brnyxx/jev-ra/) · 许可证: MIT

- [**CUA-JEV**](https://github.com/ZJU-REAL/CUA-JEV) — CUA-JEV是一个开源参考框架，任务适配器把浏览器、桌面UI、办公应用、终端或文件系统的结构化状态转为合法、可执行、可验证的候选动作，由Jev选择具体动作及其执行通道，再由框架守卫执行、验证结果状态并继续观察，首版包含四个经Windows验证的工作流示例。
  - **Jev 在哪一步做判断**: Jev 在每一步根据结构化观察从合法的 意图×执行通道 候选动作中选择一个最优动作ID及其执行路由。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zju-real/cua-jev/) · 许可证: 未声明

- [**ego-jev**](https://github.com/ZHUBoer/ego-jev) — 该项目让 Agent 用 Ego Lite 操作浏览器，并调用 Jev 完成语义目标选择、过滤、排序、分类和文本证据判断。
  - **Jev 在哪一步做判断**: Jev 负责判断观察到的哪个链接、按钮或卡片符合用户意图，并完成过滤、排序、分类和文本证据校验。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zhuboer/ego-jev/) · 许可证: MIT

- [**jev-browser-pilot**](https://github.com/aidil2105/jev-browser-pilot) — 该项目提供有界决策层，由代码负责观察、执行与验证，Jev 模型每步只选择一个候选操作。
  - **Jev 在哪一步做判断**: Jev 根据当前页面观察文本和目标，从候选操作ID列表中选择下一步应执行的唯一操作。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/aidil2105/jev-browser-pilot/) · 许可证: MIT

- [**jev-browser-qa**](https://github.com/jonymusky/jev-browser-qa) — 该项目用 Playwright 执行并录制浏览器流程，用 Jev 判断自然语言断言、按意图选择控件和执行目标导向点击循环，并提供 JSON-flow CLI、运行看板和 Agent skill。
  - **Jev 在哪一步做判断**: Jev负责判断自然语言断言是否成立、按意图在可见控件中选择点击目标、以及在目标驱动循环中决定下一步点击。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jonymusky/jev-browser-qa/) · 许可证: MIT

- [**jev-browser-skill**](https://github.com/zurfyx/jev-browser-skill) — 这是一个让 Jev 驱动浏览器执行点击、输入和选择操作以完成指定目标的 Agent 技能，适用于 Claude Code 和 Codex。
  - **Jev 在哪一步做判断**: Jev在每一步从候选操作和页面元素中选择要执行的浏览器动作及其目标元素。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zurfyx/jev-browser-skill/) · 许可证: MIT

- [**jev-browser-skill**](https://github.com/ChenYCL/jev-browser-skill) — 在 \*\*ego lite\*\* 里的真实运行，由工具自己录制（\`run --step-screenshots\`）。左边是每一步之前 Jev 看到的页面，右边是 Jev 对这一步的校准判断以及代码控制器执行的动作。每个演示都只是一条 \`jev-browser run\` 命令。
  - **Jev 在哪一步做判断**: 根据界面状态选择下一步动作或目标；本地执行器负责操作。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chenycl/jev-browser-skill/) · 许可证: MIT

- [**jev-mobile**](https://github.com/xinwang-nwpu/jev-mobile) — \*\*Android 手机自动化 agent：一次 Jev 模型请求同时决策"做什么操作"和"操作哪个元素"，无截图、纯 A11Y 无障碍树结构化状态，ADB 直接执行。\*\*
  - **Jev 在哪一步做判断**: 每步用一次 Jev 请求同时决策做什么操作、操作哪个元素索引以及当前任务目标是否已达成。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/xinwang-nwpu/jev-mobile/) · 许可证: MIT

- [**ego-jev**](https://github.com/phd-peter/ego-jev) — 把 Ego Lite 的浏览器快照与操作接到一个有步骤上限的 Jev 决策循环。
  - **Jev 在哪一步做判断**: 只从当前快照的候选元素和支持动作中选择；输入文字时可调用另一个模型。
  - **这个项目的用途**: 用当前快照的引用执行动作，并记录每步状态。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/phd-peter/ego-jev/) · 许可证: MIT

- [**jev-demo**](https://github.com/PenglongHuang/jev-demo) — TypeSafe Jev（System One 决策模型）零依赖网页体验台：浏览器操作 / 意图识别 / Agent 上下文裁剪三大预设场景，发送状态与类型化问题，拿到带校准概率的结构化答案
  - **Jev 在哪一步做判断**: Jev 根据页面快照等状态决定下一步浏览器操作工具、目标ref与任务完成度，并完成意图路由与上下文保留判断。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/penglonghuang/jev-demo/) · 许可证: MIT

- [**jev-tweet-radar**](https://github.com/DDnim/jev-tweet-radar) — Chrome 扩展对 X 时间线里每条帖子发一次 Jev Noul 请求，显示互动价值和可选标签概率。
  - **Jev 在哪一步做判断**: 一次 System One 请求里对“是否值得互动”以及 spam、buzz、AI 等内容标签做 Noul。
  - **这个项目的用途**: 把时间线筛选做成可检查的概率，而不是生成评论文本。帖子正文会发到 TypeSafe。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ddnim/jev-tweet-radar/) · 许可证: MIT

- [**jevaluate**](https://github.com/ElshinQ/jevaluate) — 这是一个用 Jev 驱动浏览器操作网页并在不确定时停下来交给人工的开源工具，还包含 DeepSeek 截图检查、评估脚本和 Agent skill。
  - **Jev 在哪一步做判断**: Jev 从候选下一步操作或分类选项中做选择并给出置信度，低于0.8则停下转交人工。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/elshinq/jevaluate/) · 许可证: MIT

- [**JevFilterForX**](https://github.com/grayrepo-byte/jev_filter_for_x) — JevFilterForX 是一个用于 X 的浏览器扩展。它会为信息流中的帖子评分，用轻量标签解释评分，并根据你的过滤设置折叠内容。未配置 API Key 时，默认使用本地模拟评分。
  - **Jev 在哪一步做判断**: Jev 用 Choice 分类、Score 评估信息量、可行动性与原创性，用 Noul 打标签；本地阈值和噪声规则决定是否折叠帖子。
  - **这个项目的用途**: 把评分、标签和可调整的过滤阈值放进 X 信息流，折叠后仍可展开或再次隐藏帖子及其媒体附件。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/grayrepo-byte/jev_filter_for_x/) · 许可证: 未声明

- [**jevis**](https://github.com/jaewgwon/jevis) — Flutter integration\_test 包：注册允许的 UI 动作，Jev 根据当前界面选下一步并判断目标是否达成。
  - **Jev 在哪一步做判断**: 默认 \`jev-latest\` 向 \`/v1/systemone\` POST：目标是 Noul，下一步是已注册动作上的 Choice。
  - **这个项目的用途**: 把自然语言测试收成封闭动作表上的选择，而不是让模型自由点屏幕。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jaewgwon/jevis/) · 许可证: Apache-2.0

- [**cline-plugin-jev-browser**](https://github.com/abeatrix/cline-plugin-jev-browser) — Cline 的独立 Playwright 浏览器插件，通过 Vercel AI Gateway 用 Jev 选择网页操作。
  - **Jev 在哪一步做判断**: Jev 读取 DOM 目标表选择动作；需输入文字时由另外的文本模型生成。
  - **这个项目的用途**: 保存操作前后截图并在敏感动作前交还控制；完成状态仍需回读验证。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abeatrix/cline-plugin-jev-browser/) · 许可证: 未声明


## 命令行与流水线

- [**foreman**](https://github.com/thruwire/foreman) — 独立监督环读取编码工人的 diff、日志和测试，用 Jev Noul 判断卡住、跑偏、该验证，再由 Python 策略干预。
  - **Jev 在哪一步做判断**: \`AsyncTypeSafeClient.system\_one\`，默认 \`jev-latest\`，对监督问题发 Noul。
  - **这个项目的用途**: 监督不代替工人写代码；与目录里的 \`Shifty-Eye-Games/foreman-jev\` 不是同一个仓库。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thruwire/foreman/) · 许可证: MIT

- [**orchestkit**](https://github.com/yonatangross/orchestkit) — OrchestKit 可选用 Jev 给编程会话分类，符合阈值时用结果决定会话颜色。
  - **Jev 在哪一步做判断**: 将首条任务提示与分支状态分类为开发、排错等工作类型；本地规则选择采用或回退。
  - **这个项目的用途**: 用工作类型区分会话，同时保留 shadow 对照模式。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/yonatangross/orchestkit/) · 许可证: MIT

- [**jev-align**](https://github.com/sutro-sh/jev-align) — jev-align 是一个实验性 CLI，用 Jev 构建 AI Functions，通过挑选不确定样本请用户标注并用 GEPA 改进函数定义。
  - **Jev 在哪一步做判断**: Jev 对每条数据行执行二分类/多分类/多标签/等级评分判断并返回校准概率与置信度，用于筛选不确定样本和评估候选定义。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sutro-sh/jev-align/) · 许可证: Apache-2.0

- [**JevRev**](https://github.com/Alex314618-create/JevRev) — JevRev 是放在 LLM 旁边的决策层，用 JevSift 筛选方案、用 JevLoop 按轮审核单个制品、用 JevLong 观察长会话的健康状况。
  - **Jev 在哪一步做判断**: Jev 负责筛选候选方案并裁决每轮证据的下一步动作（继续、修复、验证、重规划或完成）。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/alex314618-create/jevrev/) · 许可证: MIT

- [**jev-shell-history**](https://github.com/mrnugget/jev-shell-history) — 类似于 Fish 终端样式的 Zsh 历史命令建议工具，利用 Jev 对已有历史记录根据当前上下文进行智能打分排序。
  - **Jev 在哪一步做判断**: 将当前敲入的命令前缀与本地 Zsh 历史候选组装为 Jev 请求，由 Jev 评估最佳补全项，仅做行内建议而不自动执行。
  - **这个项目的用途**: 结合了确定性本地历史的安全性与 Jev 上下文语义理解能力，避免盲目基于字符串前缀匹配造成的低质建议。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mrnugget/jev-shell-history/) · 许可证: 未声明

- [**jev-lint**](https://github.com/mizchi/jev-lint) — 一个用 Jev 校准概率对代码匹配结果做语义 lint 检查的命令行工具。
  - **Jev 在哪一步做判断**: Jev 对每个 ast-grep 匹配的代码片段回答自然语言问题，以概率判断名称、注释、测试等自我声明是否与代码实际行为矛盾。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mizchi/jev-lint/) · 许可证: MIT

- [**jgrep**](https://github.com/keltokhy/jgrep) — jgrep 是用自然语言描述替代正则表达式来过滤文本行、结构化记录、函数和 diff 片段的命令行工具，每条记录交由 Jev 作 Noul 判断后输出符合项。
  - **Jev 在哪一步做判断**: Jev 对每个输入单元（行、段落、函数、diff hunk）判断是否符合用户自然语言描述，返回概率后由本地阈值过滤。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/keltokhy/jgrep/) · 许可证: MIT

- [**SemDecide**](https://github.com/sharziki/semdecide) — 基于 Python 的语义判断 CLI，可给文本或 JSONL 管道做判断、分类、打分和过滤。
  - **Jev 在哪一步做判断**: 将输入交给 Jev，按返回概率与本地阈值生成结果及退出码。
  - **这个项目的用途**: 把结构化判断接进 Bash 和 CI，保留明确的输出与失败状态。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/semdecide/) · 许可证: MIT

- [**jev-skill-suggester**](https://github.com/win4r/jev-skill-suggester) — 用 TypeSafe Jev 为当前任务推荐一个合适的已安装 Skill。先阅读技能描述筛选，再核对候选正文片段；允许返回“无需技能”或“不确定”。用户明确指定的技能通过本地查找优先处理。
  - **Jev 在哪一步做判断**: Jev根据任务文本对已安装技能的描述和正文片段做Choice排序，并用Noul判断是否值得推荐及推荐哪一个。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/win4r/jev-skill-suggester/) · 许可证: MIT

- [**jev-calibrate**](https://github.com/smkrv/jev-calibrate) — 该工具使用标注示例调优 Jev 问题，并在留出验证集上为每个问题给出可用性结论。
  - **Jev 在哪一步做判断**: Jev 对每个标注样本回答 noul/choice/score 问题，输出概率与置信度以判定阈值与可用性 verdict。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/smkrv/jev-calibrate/) · 许可证: MIT

- [**jgrep**](https://github.com/kyu1204/jgrep) — jgrep 是用英文描述代码行为来搜索代码、git diff 和表格行的命令行工具，它把代码块与每个块一个 Noul 问题一起发给 Jev，并输出命中的 file:line，同时支持用 Noul/Choice/Score 问题检查 diff 和为 CSV/JSONL 的每一行打分。
  - **Jev 在哪一步做判断**: Jev 对每个代码块/差异块或表格行逐一判断是否符合英文描述（Noul二值判断，Rows模式还支持Choice多选和Score打分）。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kyu1204/jgrep/) · 许可证: MIT

- [**jev-axi**](https://github.com/shiftynick/jev-axi) — 在命令行调用 Jev 做 pick、rate、check、rank、triage、guard，并可接到 Agent 工具调用前的 hook。
  - **Jev 在哪一步做判断**: 把输入状态和选项转为结构化问题，返回结果或供本地安全策略使用的风险分数。
  - **这个项目的用途**: 在脚本和 Agent 工作流里复用同一套判断命令。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shiftynick/jev-axi/) · 许可证: MIT

- [**jev-cli**](https://github.com/Nasrallah-AL/jev-cli) — 名为 jevctl 的终端工具，把核验、分类与评分问题接到文本输入和脚本里。
  - **Jev 在哪一步做判断**: 把输入与固定答案集合发给 Jev，再按本地阈值输出判断和概率。
  - **这个项目的用途**: 提供可用于管道和 CI 的结构化结果，也支持检查请求和 dry-run。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nasrallah-al/jev-cli/) · 许可证: MIT

- [**slop-grader**](https://github.com/lukstei/slop-grader) — 这是一个基于规则的 CLI 工具，用 Jev 的 Score 做文档级打分、用 Choice 和 Noul 做逐行违规标记，并把结果交给 Agent 去修复文本和 Markdown 文件。
  - **Jev 在哪一步做判断**: 决策说明： 在 \`src/providers/jev.ts\` 的 \`evaluateBatch\` 中调用 \`@typesafe-ai/sdk\` (\`client.system\_one\`)，对文档级别使用 \`score\` 进行标准维度评分，对行级别使用 \`choice\` / \`noul\` 进行细粒度违规检测，并将结构化违规结果输出给下游 AI agent 自动化修复。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lukstei/slop-grader/) · 许可证: MIT

- [**jev-code**](https://github.com/rhighs/jev-code) — 一个实验性编程终端，让 Jev 逐步选择 AST 节点来组成 Python 或 Bash，也能作为命令行判断工具。
  - **Jev 在哪一步做判断**: 从有限的语法与动作选项中选择，由本地程序生成代码或执行工具。
  - **这个项目的用途**: 把编程选择和命令行判断过程显示为可回看的记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rhighs/jev-code/) · 许可证: 未声明

- [**jev-superpowers**](https://github.com/AkashPriyadarshii/jev-superpowers) — 面向编码智能体的系统化开发流程框架，融合 Jev 进行无幻觉依赖审查、完成度门禁与错误重试决策。
  - **Jev 在哪一步做判断**: 在智能体执行循环的关键检查点，利用 Jev 评估代码变更质量、测试覆盖与第三方包合法性，决定是否推进或回滚。
  - **这个项目的用途**: 将确定性代码流水线与 Jev 快速二元判断结合，防止编码 Agent 在长程任务中产生方向偏离或引入未知包。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/akashpriyadarshii/jev-superpowers/) · 许可证: MIT

- [**jev-yaba-wechat**](https://github.com/wuxie888/jev-yaba-wechat) — 微信里的话不知道怎么接？macOS 悬浮聊天助手：识别消息意图与沟通风险，GPT 生成多种话术，Jev 评估候选，一键填入微信。话我帮你想，发送你来定。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wuxie888/jev-yaba-wechat/) · 许可证: MIT

- [**jsort**](https://github.com/keltokhy/jsort) — 按自然语言描述的维度对文本行/段落/文件进行两两比较排序并输出分数与标准误的命令行工具。
  - **Jev 在哪一步做判断**: Jev 对给定的自然语言维度判断文本 A 是否比文本 B 排名更高。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/keltokhy/jsort/) · 许可证: MIT

- [**jev-test-filter**](https://github.com/mizchi/jev-test-filter) — 该工具读取 git diff，用 Jev 为每个测试评估受影响程度，并输出 vitest、jest、node:test、Playwright、cargo test 和 go test 可直接使用的过滤参数。
  - **Jev 在哪一步做判断**: Jev 以 git diff 为共享状态，对每个测试打分判断其受本次变更影响的可能性。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mizchi/jev-test-filter/) · 许可证: MIT

- [**jevyoumean**](https://github.com/syumai/jevyoumean) — jevyoumean：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/syumai/jevyoumean/) · 许可证: MIT

- [**jev-cli**](https://github.com/tumf/jev-cli) — 为 Jev 提供 CLI 和 stdio MCP 入口，输入文本或 JSON，输出结构化判断。
  - **Jev 在哪一步做判断**: 向 Jev 提交 noul、choice、score 问题，将结果输出为 JSON 或单个值。
  - **这个项目的用途**: 支持文件和 stdin 输入，可接入 Shell 脚本或 MCP 客户端。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tumf/jev-cli/) · 许可证: MIT

- [**rift**](https://github.com/exYze/rift) — Rust 编程终端 Rift 的可选 TypeSafe 决策客户端，给受限判断调用 Jev。
  - **Jev 在哪一步做判断**: 向 System One 提交状态和类型化问题，解析答案供终端工作流使用。
  - **这个项目的用途**: 在生成式编程模型之外接入独立的判断接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/exyze/rift/) · 许可证: MIT

- [**ego-jev**](https://github.com/ZephyrDeng/ego-jev) — ego-jev：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zephyrdeng/ego-jev/) · 许可证: MIT

- [**typesafe-jev-incident-router**](https://github.com/kyle-chalmers/typesafe-jev-incident-router) — typesafe-jev-incident-router：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kyle-chalmers/typesafe-jev-incident-router/) · 许可证: 未声明

- [**jev-oas-sentinel**](https://github.com/ShuhanSun/jev-oas-sentinel) — 该工具比较两个 OpenAPI 文档，用确定性检查发现结构兼容性问题，并用 TypeSafe Jev 评估变更描述中的语义风险。
  - **Jev 在哪一步做判断**: Jev 对新旧 OpenAPI 契约片段的兼容性种类、受影响语义维度、旧承诺是否保留及迁移负担进行分类与打分。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shuhansun/jev-oas-sentinel/) · 许可证: Apache-2.0

- [**jevopt**](https://github.com/Ramneet-Singh/jevopt) — jevopt：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ramneet-singh/jevopt/) · 许可证: GPL-3.0

- [**jev-assist**](https://github.com/glud123/jev-assist) — 别让贵的主模型干 grep 试错的粗活——交给 jev 排完整个仓库，主模型只负责读对的文件、写对的代码。
  - **Jev 在哪一步做判断**: Jev 对仓库内每个文件判定其与任务的相关性、对团队约定的违反情况以及待提交 diff 的风险。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/glud123/jev-assist/) · 许可证: MIT

- [**jev-cli**](https://github.com/jtsang4/jev-cli) — 在终端里问 Jev 判断题。输入文本或 JSON，再给出分类、是非或评分问题，拿回脚本能直接读取的 JSON。
  - **Jev 在哪一步做判断**: 针对同一份输入做分类、真假判断和分级评分，返回选项及其概率。
  - **这个项目的用途**: 能接收标准输入，把语义校验接进已有脚本和 CI；支持直连 TypeSafe 或走 Vercel 网关。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jtsang4/jev-cli/) · 许可证: MIT

- [**jev-cli**](https://github.com/joshLong145/jev-cli) — jev-cli 是用 Python 编写的命令行工具，用 Jev 分析 JSON、NDJSON、JSONC 和文本日志并返回带类型的判定答案。
  - **Jev 在哪一步做判断**: Jev 对每个日志窗口并行回答类型化问题包中的判定，如是否事件、严重度、类别等。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joshlong145/jev-cli/) · 许可证: 未声明

- [**jev-triage**](https://github.com/boldbug1/jev-triage) — 这是一个用 Go 编写的命令行工具，用 Jev 对每条消息进行分类并评估紧急程度和挫败感，然后按紧急程度排序输出表格、低置信度人工复核列表和 HTML 报告。
  - **Jev 在哪一步做判断**: 对每条消息同时判定所属类别、紧急程度评分和发件人是否沮丧，并用类别置信度决定是否转人工复核。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/boldbug1/jev-triage/) · 许可证: MIT

- [**jevmetrics**](https://github.com/ishantanu/jevmetrics) — jevmetrics 是一个 OpenTelemetry Collector 指标处理器，它调用 Jev 模型根据指标元数据推断操作价值，并据此注释或过滤指标。
  - **Jev 在哪一步做判断**: Jev根据指标元数据推断指标的操作价值、冗余度、保留概率和处置建议。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ishantanu/jevmetrics/) · 许可证: Apache-2.0

- [**jevsearch**](https://github.com/kylemclaren/jevsearch) — 这是一个网站搜索命令面板，先显示关键词匹配结果，再用 Jev 模型按用户意图重新排序。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kylemclaren/jevsearch/) · 许可证: MIT

- [**prompt2jev**](https://github.com/sumleo/prompt2jev) — prompt2jev：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sumleo/prompt2jev/) · 许可证: MIT

- [**typesafe-jev-calibrate-for-code-review**](https://github.com/Selmar/typesafe-jev-calibrate-for-code-review) — 该仓库记录了使用 Jev 进行代码评审的校准实验，并提供代码与注释规则集及评分脚本用于复现测量结果。
  - **Jev 在哪一步做判断**: Jev 根据给定的代码/注释状态判断是否违反注释与代码规则并给出 noul 置信分数。
  - **这个项目的用途**: 把下一步调查集中到更相关的证据上。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/selmar/typesafe-jev-calibrate-for-code-review/) · 许可证: 未声明

- [**Jev\_steer\_or\_queue**](https://github.com/Larkspur-Wang/Jev_steer_or_queue) — 编码 agent 对任务运行中收到的消息一视同仁。Claude Code 会立刻把它注入当前 turn。“改用简单点的方案”这样很合适；“做完之后顺便更新 changelog”会被混进当前任务；“停一下，别继续了”要靠模型自己愿意停。
  - **Jev 在哪一步做判断**: Jev 判断任务执行期间发来的新消息应立即转向、排队稍后处理还是中断当前任务。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/larkspur-wang/jev_steer_or_queue/) · 许可证: MIT

- [**jev-blindspot**](https://github.com/jsk4581/jev-blindspot) — 这是一个给 Claude Code 和 Codex CLI 用的侧边面板助手，先用 Jev 判断每次提交的提示词是否值得再看一遍，只有通过时才让 Agent 自身的只读无头模式读取项目并返回盲点，且不拦截提示词也不向会话添加内容。
  - **Jev 在哪一步做判断**: Jev 在每次提示提交时一次性判断该请求是否存在值得复查的盲点以及风险等级，从而决定是否触发深度分析。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jsk4581/jev-blindspot/) · 许可证: MIT

- [**jev-linkedin-slop-filter**](https://github.com/Arpit-Khandelwal/jev-linkedin-slop-filter) — jev-linkedin-slop-filter：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/arpit-khandelwal/jev-linkedin-slop-filter/) · 许可证: MIT

- [**jev-mode**](https://github.com/ddfeyes/jev-mode) — jev-mode 是把 Agent 批量语义判断移出上下文、交由 Jev 做类型化裁决的 Python 工具。
  - **Jev 在哪一步做判断**: Jev 对每条工单/文件/Agent步骤做出类型化裁决，如归属团队、是否过期、步骤是否放行。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ddfeyes/jev-mode/) · 许可证: MIT

- [**pytest-jev**](https://github.com/allebee/pytest-jev) — pytest-jev：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/allebee/pytest-jev/) · 许可证: MIT

- [**TypeSafe AI Playground**](https://github.com/markjaquith/typesafe-ai-playground) — Rust 命令行实验集，可筛查医疗隐私信息、检查代码注释、分析语气并分类行业和职业。
  - **Jev 在哪一步做判断**: 把输入文本交给 Jev，返回独立的 Noul 概率、Score 或候选分类。
  - **这个项目的用途**: 提供可直接查看结构化结果的终端实验入口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typesafe-ai-playground/) · 许可证: MIT

- [**VideoAdGuard-Jev**](https://github.com/xianggelila177/VideoAdGuard-Jev) — VideoAdGuard-Jev：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/xianggelila177/videoadguard-jev/) · 许可证: GPL-2.0

- [**ask-jev**](https://github.com/logicrw/ask-jev) — 面向 AI 编程智能体与 CLI 管道的有界决策与原文提纯工具，硬性 280ms 时限，纯 Python 标准库零依赖，全链路 Fail-Open 优雅降级。
  - **Jev 在哪一步做判断**: 决策说明： 在 ask\_decision 与 auto\_mark\_text 中调用 Jev 的 Choice 与 Noul 原语，执行快速语义裁决与物理行保真提纯。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/logicrw/ask-jev/) · 许可证: GPL-3.0

- [**codex-jev-preflight**](https://github.com/wellkilo/codex-jev-preflight) — 在 Codex 开始执行前，通过 TypeSafe Jev 获取 \`task\_type\`、\`complexity\`、\`risk\` 和 \`execution\_mode\`。判定仅作为建议上下文，并且始终 fail-open，不会阻塞任务。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wellkilo/codex-jev-preflight/) · 许可证: MIT

- [**jev-browser-skill**](https://github.com/wanghai673/jev-browser-skill) — ⚡ 快速浏览器 Skill：Jev 驱动，Codex 即用。连续执行、预置输入，一句话启动浏览器任务。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wanghai673/jev-browser-skill/) · 许可证: MIT

- [**jev-console**](https://github.com/wenchenxi/jev-console) — 给 TypeSafe 的 \*\*Jev（System One 决策模型）\*\* 做的本地小控制台 + 命令行。
  - **Jev 在哪一步做判断**: Jev 根据用户提供的 state 对 noul 是否判断、choice 多选一、score 档位打分问题给出校准概率和置信度。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wenchenxi/jev-console/) · 许可证: MIT

- [**jev-frontier-100**](https://github.com/softpudding/jev-frontier-100) — \*\*Jev 1.13.0：77.0%。\*\* 每个条件为 100 道题 × 3 轮；共保留 3,000 次有效回答。 不取最好的一轮，也不做多数投票。
  - **Jev 在哪一步做判断**: Jev 对每道四选一题目直接做出 A/B/C/D 的选项决策并返回置信度。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/softpudding/jev-frontier-100/) · 许可证: MIT

- [**jev-model-router**](https://github.com/gualican/jev-model-router) — jev-model-router：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gualican/jev-model-router/) · 许可证: MIT

- [**jev-router**](https://github.com/AABBAASS1/jev-router) — 该 CLI 向 Jev 查询任务应分配给哪个 Agent，然后打开 Claude、ChatGPT、Cursor 或 Antigravity 的应用或网页并填入提示词。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/aabbaass1/jev-router/) · 许可证: 未声明

- [**jev-skills**](https://github.com/WanLanglin/jev-skills) — jev-skills：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wanlanglin/jev-skills/) · 许可证: 未声明

- [**jev-tmmluplus-eval**](https://github.com/lianghsun/jev-tmmluplus-eval) — 该项目通过 Jev 的四选一作答接口对 TMMLU+ v1.1 繁体中文基准进行评测与计分。
  - **Jev 在哪一步做判断**: Jev 对每道 TMMLU+ 题目在 A、B、C、D 四个选项中做出四选一单选决策并返回校准概率。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lianghsun/jev-tmmluplus-eval/) · 许可证: MIT

- [**jev-toto**](https://github.com/maxlibin/jev-toto) — 这是一个 Rust 命令行工具，用于统计新加坡 TOTO 近期开奖数据，并请 Jev 模型给出每个号码的下期概率和冷热评分。
  - **Jev 在哪一步做判断**: Jev根据每个号码的历史统计判断其下期被抽中的概率以及冷到热的形态评分与置信度。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/maxlibin/jev-toto/) · 许可证: MIT

- [**jev-zork**](https://github.com/Resadan-dev/jev-zork) — jev-zork：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/resadan-dev/jev-zork/) · 许可证: MIT

- [**jevcheck**](https://github.com/sathariels/jevcheck) — jevcheck：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sathariels/jevcheck/) · 许可证: MIT

- [**jevcode**](https://github.com/miounet11/jevcode) — Jev 是 TypeSafe 的 System One 决策模型：你给它\*\*状态 + 类型化问题\*\*，它返回\*\*可直接进代码的决策\*\*（带置信度），不是聊天文案。
  - **Jev 在哪一步做判断**: Jev 判断是否值得发布、发布到哪里，以及发布版本是否合格与风险等级。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/miounet11/jevcode/) · 许可证: 未声明

- [**jevgrep**](https://github.com/allebee/jevgrep) — jevgrep：对输入文本做分类或打分，交给本地规则继续处理。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/allebee/jevgrep/) · 许可证: MIT

- [**jevscript**](https://github.com/amberwhitehead/jevscript) — 把语义判断作为语言原语的早期实验，目前实现的是 Jev 请求批处理验证脚本。
  - **Jev 在哪一步做判断**: 脚本比较单独与合并问题的回答、用量和延迟；完整语言引擎仍是设计目标。
  - **这个项目的用途**: 适合研究请求批处理，不应当作已完成的编译器或解释器。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/amberwhitehead/jevscript/) · 许可证: 未声明

- [**paper-radar-jev**](https://github.com/LYchoon/paper-radar-jev) — 以上指令會保留已存在的本機設定。編輯專案根目錄的 \`.env\`，將空白值換成自己的 key：
  - **Jev 在哪一步做判断**: 决策说明： 在 src/paper\_radar/evaluator.py 的 evaluate\_paper() 中，通过 client.system\_one(...) 将论文信息和 research profile 发送给 TypeSafe System One，并从返回的 response.nouls\[...\] 中取得概率结果作为 relevance\_score。这个位置就是项目实际进行论文相关性决策的地方。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lychoon/paper-radar-jev/) · 许可证: MIT

- [**pr-sieve**](https://github.com/Thestral12/pr-sieve) — GitHub Action 把 \`.jev.yml\` 规则编译成 Jev 问题，按数值决定 fail、comment 或 pass。
  - **Jev 在哪一步做判断**: 规则编成最多 12 个问题（\`src/types.ts\` 的 \`MAX\_JEV\_QUESTIONS\`）；\`AKIA…\` 与私钥装甲由 \`src/redact.ts\` 命中后，\`src/pipeline.ts\` 本地失败且不调用 Jev。
  - **这个项目的用途**: 不写审查文、不给补丁、不自动批准；策略读自 base 分支配置。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thestral12/pr-sieve/) · 许可证: MIT

- [**typesafe-jev-plugin**](https://github.com/arnab621/typesafe-jev-plugin) — 该插件用于创建可复用的 solution signature，并将 CSV、Excel 或文本数据集送入 Jev API 进行分类与评分后导出为 Excel 结果。
  - **Jev 在哪一步做判断**: Jev 对数据集每行数据执行 Signature 中定义的 Choice、Score 或 Noul 判断并返回结构化答案。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/arnab621/typesafe-jev-plugin/) · 许可证: 未声明

- [**typesafe-jev-tools**](https://github.com/wotai-dev/typesafe-jev-tools) — 该仓库提供一个 Claude Code hook，在写出 LLM 调用或手写分类器时注入三选一测试，提示当前判断是否需要模型、Jev 或普通代码。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wotai-dev/typesafe-jev-tools/) · 许可证: MIT

- [**jev-planner**](https://github.com/rxova/jev-planner) — jev-planner：Jev 对多Agent生成的计划打分并抉择是否需要交叉评审、哪个计划更强以及由谁来合并最终计划。
  - **Jev 在哪一步做判断**: Jev 对多Agent生成的计划打分并抉择是否需要交叉评审、哪个计划更强以及由谁来合并最终计划。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rxova/jev-planner/) · 许可证: MIT

- [**slopcheck-jev**](https://github.com/harshpuri84/slopcheck-jev) — slopcheck-jev 在终端和自动化脚本中加入文本判断。
  - **Jev 在哪一步做判断**: 对输入文本做分类或打分，交给本地规则继续处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/harshpuri84/slopcheck-jev/) · 许可证: MIT


## 分类与目录

- [**typesafe-jev-workflow**](https://github.com/GiesN/typesafe-jev-workflow) — 一个异步 LangGraph 示例：让 Jev 把模拟邮件分成发票事务和普通邮件。
  - **Jev 在哪一步做判断**: Jev 返回 invoice 或 general，图节点据此选择示例处理分支。
  - **这个项目的用途**: 把模型分类和本地工作流路由分开，方便检查每步结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/giesn/typesafe-jev-workflow/) · 许可证: 未声明

- [**jev-tree**](https://github.com/reachjalil/jev-tree) — 选项太多，一次问不下？先把目录分成树，让 Jev 逐层选分支，最后落到具体商品、事件类型或工作流。
  - **Jev 在哪一步做判断**: 每次只在当前层的候选分支里做单选，再沿选中的分支继续查找。
  - **这个项目的用途**: 不用直接截掉大目录尾部的候选，还能返回完整选择路径；失败时明确报告不可用。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reachjalil/jev-tree/) · 许可证: MIT


## 代码与图谱

- [**celesto**](https://github.com/CelestoAI/celesto) — Celesto 的 PR 审查示例在沙盒中准备检查，再比较普通模型与 Jev 对候选问题的判断。
  - **Jev 在哪一步做判断**: 检查疑似问题是否由当前变更引入、是否有证据、是否值得修复。
  - **这个项目的用途**: 将执行记录与评估结果放在同一审查界面中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/celestoai/celesto/) · 许可证: Apache-2.0

- [**Jev Review**](https://github.com/devagrawal09/jev-review) — 分阶段检查 Git diff 或整个代码库，在本地面板里展示可复核的审查线索。
  - **Jev 在哪一步做判断**: 依次判断风险、文件、证据片段、问题机制和严重程度，再按规则选择审查路径。
  - **这个项目的用途**: 把审查线索关联到具体代码，便于人工复核。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-review/) · 许可证: MIT

- [**neo4jev**](https://github.com/jexp/neo4jev) — 在 Neo4j 图谱里逐步找关系，让 Jev 在每个节点选择下一条边。
  - **Jev 在哪一步做判断**: Choice 为相邻关系分配概率，Noul 判断是否到达目标，本地 beam search 保留候选路径。
  - **这个项目的用途**: 把自然语言目标对应到可以查看的图谱路径。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/neo4jev/) · 许可证: MIT

- [**jev-code**](https://github.com/devagrawal09/jev-code) — 给编程 Agent 提供代码定位、改动意图检查、测试失败整理和审查意见分流。
  - **Jev 在哪一步做判断**: 在固定工作流中选择任务，对有限的 diff、代码或日志片段做结构化判断。
  - **这个项目的用途**: 返回下一步可检查的线索，同时说明未检查的范围。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devagrawal09/jev-code/) · 许可证: MIT

- [**Blink**](https://github.com/ellipsis-dev/blink) — 用自然语言查找文件：多个 walker 沿目录树逐层搜索。
  - **Jev 在哪一步做判断**: Jev 评估文件和目录名的相关概率，程序据此分配 walker。
  - **这个项目的用途**: 不先建向量索引；结果展示各路径获得的 walker 比例。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/blink/) · 许可证: 未声明

- [**jevgrep**](https://github.com/nassim-arifette/jevgrep) — JevGrep 是一个基于 Jev 的语义代码搜索工具，可通过 CLI 或 MCP 按行为描述查找代码，并返回带文件路径和行号的原文片段。
  - **Jev 在哪一步做判断**: Jev 对每个代码片段是否语义匹配自然语言查询进行 Noul 评分排序，以决定返回哪些源码摘录。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nassim-arifette/jevgrep/) · 许可证: MIT

- [**commit-miner**](https://github.com/devanshbatham/commit-miner) — 用 Jev 给 Git commit 的日志和 diff 分类，整理 bug 修复、安全修复、CWE 与改动类型。
  - **Jev 在哪一步做判断**: 对提交内容询问固定类别问题，保存结果供过滤和 HTML/CSV 报告使用。
  - **这个项目的用途**: 把大量提交整理成便于进一步核查的分类记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devanshbatham/commit-miner/) · 许可证: 未声明

- [**jev**](https://github.com/BorisLeMeec/jev) — Go 编写的 Claude Code 插件，用 Jev 查找相关文件、跨文件回答有界问题并处理大段读取。
  - **Jev 在哪一步做判断**: 根据问题筛选与验证代码相关性，减少直接送入 Agent 的整文件内容。
  - **这个项目的用途**: 返回可定位的文件线索和判断结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/borislemeec/jev/) · 许可证: MIT

- [**claude-jev**](https://github.com/buchmark/claude-jev) — 给 Claude Code 的审查发现、排错假设、设计方案和代码搜索结果增加一次 Jev 复核。
  - **Jev 在哪一步做判断**: 对候选缺陷、解释或选项按预设问题打分，再由阈值与本地策略处理。
  - **这个项目的用途**: 把第二次判断及概率保留下来，便于检查分歧。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/buchmark/claude-jev/) · 许可证: MIT

- [**leanest**](https://github.com/baronunread/leanest) — 在现有测试运行器前增加 Jev 筛选，根据 diff 和测试源码判断哪些测试应运行。
  - **Jev 在哪一步做判断**: Jev 评估测试与变更的关系，本地策略在不确定、调用失败或测试文件改动时选择运行。
  - **这个项目的用途**: 可用 shadow 模式对比建议；选择结果不能保证没有漏测。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/baronunread/leanest/) · 许可证: MIT

- [**PiJ**](https://github.com/tonyzdev/PiJ) — 基于 Pi 的终端编码 Agent，主模型负责推理、改代码与工具调用，Jev 提供辅助判断。
  - **Jev 在哪一步做判断**: Jev 推荐 skill、重排真实源码候选并分类工具失败；不自动重试或批准权限。
  - **这个项目的用途**: 保留原始路径、行号、源码与错误输出；作者的有限实验不代表普遍收益。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tonyzdev/pij/) · 许可证: MIT

- [**jev-graphrag**](https://github.com/neo4j-field/jev-graphrag) — 该仓库演示如何用 Jev 作为 Neo4j 知识图谱抽取与 GraphRAG 流程中的校准决策层，并包含实体去重演示和候选用例清单。
  - **Jev 在哪一步做判断**: 评估候选代码或关系与目标的相关程度，选择下一条路径。
  - **这个项目的用途**: 把下一步调查集中到更相关的证据上。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/neo4j-field/jev-graphrag/) · 许可证: 未声明

- [**jev-review-action**](https://github.com/fatwang2/jev-review-action) — 可配置的 GitHub Action，用 Jev 检查目录投稿或给 PR 分类，并更新模板评论。
  - **Jev 在哪一步做判断**: 依据固定版本仓库材料或 PR patch 回答策略问题，再由代码应用分类规则。
  - **这个项目的用途**: 把问题定义、阈值与评论格式留在可审查的配置中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/fatwang2/jev-review-action/) · 许可证: MIT

- [**jevex**](https://github.com/jimmyhealer/jevex) — jevex 是一个 MCP 工具，先索引代码库再用 Jev 对候选内容排序，告诉 Agent 应该去读哪些文件和行范围。
  - **Jev 在哪一步做判断**: Jev 对候选代码片段打分并判定谁是权威实现、相关度及下一步扩展方向。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jimmyhealer/jevex/) · 许可证: MIT


## 上下文与记忆

- [**fast-jev-compaction**](https://github.com/tamaratran/fast-jev-compaction) — 为 Claude Code 删减旧工具调用和结果，保留留下来的原文，不另写摘要。
  - **Jev 在哪一步做判断**: 分别判断工具调用与完整结果是否仍需保留，本地规则执行保留、截短或删除。
  - **这个项目的用途**: 减少摘要改写对路径、命令和报错原文的影响。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tamaratran/fast-jev-compaction/) · 许可证: MIT

- [**jev-pruner**](https://github.com/tamaratran/jev-pruner) — Claude Code 输出修剪插件，在 Bash 执行后、结果进入主模型前筛掉部分冗余文本。
  - **Jev 在哪一步做判断**: 满足长度与内容条件后，Jev 按块判断哪些输出应保留，原始内容另行归档。
  - **这个项目的用途**: 较短输出、错误和识别出的结构化或源码内容直接保留，避免把所有日志一刀切。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tamaratran/jev-pruner/) · 许可证: MIT

- [**bluenoise**](https://github.com/rokcso/bluenoise) — 为 X/Twitter 过滤帖子与回复的浏览器扩展；默认用本地规则，可选择用 Jev 检查未匹配的回复。
  - **Jev 在哪一步做判断**: 启用实验性 AI 后，将未命中规则的回复交给 Jev 评估，再由本地阈值决定是否隐藏。
  - **这个项目的用途**: 先应用可逆的本地规则，只对需要的内容追加模型判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rokcso/bluenoise/) · 许可证: MIT

- [**Winnow**](https://github.com/GhalebDweikat/winnow) — 给 Claude Code 的长日志装一道筛子。暂时不相关的内容先藏起来，想看时还能完整找回。
  - **Jev 在哪一步做判断**: 逐块判断 Read、Bash、Grep 输出是否有用；保留相关或不确定内容，隐藏高置信度无关块。
  - **这个项目的用途**: 减少进入上下文的冗余输出，并保留可召回的原文。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/winnow/) · 许可证: MIT

- [**Jev-Mem**](https://github.com/libingzheren/Jev-Mem) — Jev-Mem 用轻量 System-One 控制器组织记忆并指导多关系检索，再由 System-Two 语言模型根据检索到的证据合成答案。
  - **Jev 在哪一步做判断**: Jev 负责判定记忆类型与关系、选择检索图视图并分配遍历预算、为候选打分以及评估证据是否充分以决定停止或继续扩展检索。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/libingzheren/jev-mem/) · 许可证: MIT

- [**jev-recall**](https://github.com/samdotmak/jev-recall) — Jev Recall 针对用户请求，用 Jev 模型对每条记忆逐一判断是否相关并筛选出相关记忆。
  - **Jev 在哪一步做判断**: 对每条记忆判断它是否与当前情景相关、是否会改变助手的行为。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/samdotmak/jev-recall/) · 许可证: MIT

- [**jev-use**](https://github.com/shitianfang/jev-use) — 把 Claude Code / Codex / pi 中不需要输出文本的判断步骤交给 Jev 执行，需要写字或置信度不足的步骤按类型化契约退回 LLM。
  - **Jev 在哪一步做判断**: \`judge()\`（第 35 行）把关于同一个 state 的多个 noul / choice / score 问题打成一次调用；\`toVerdict()\`（第 100~157 行）按原语分别处理 \`noul\`、\`choice\`、\`score\` 的答案与置信度。同文件的 \`gate()\`（第 170 行）是可选的 PreToolUse 门禁，只能 deny 或 ask。置信度不足或本就不该由 Jev 决定的步骤，通过类型化 escalation 契约（\`writing\`、\`open\_ended\`、\`oversized\`、\`unsure\`、\`unreachable\`）退回 LLM，而不是让 Jev 猜。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shitianfang/jev-use/) · 许可证: MIT

- [**yoshi**](https://github.com/compozy/yoshi) — 面向 Claude Code 与 Codex 的上下文剪枝代理，通过 Jev 评估历史条目必要性并保持工具调用协议结构完整。
  - **Jev 在哪一步做判断**: 在代理转发层使用 Jev 对消息历史打分，过滤已失效的中间试错输出，仅向大模型提交精简后的有效上下文。
  - **这个项目的用途**: 降低每次交互的输入 Token 数量，加快响应首字时间，且不破坏现有客户端与服务端的协议兼容性。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/compozy/yoshi/) · 许可证: MIT

- [**azdaja**](https://github.com/kubet/azdaja) — Azdaja 是与 harness 无关的递归语言模型层，将完整资料保存在本地求值器中并只对选定内容做语义递归，可配合 Jev 进行类型化语义判断。
  - **Jev 在哪一步做判断**: Jev 对选定的源码窗口就显式问题返回Noul/Choice/Score概率，供RLM决定下一步检查、合并或探索的内容。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kubet/azdaja/) · 许可证: MIT

- [**elons-job**](https://github.com/bugkiwi/elons-job) — 本地优先的 Chrome 扩展：先用规则筛选 X 回复，再让 Jev 判断色情、性暗示和引流内容，并提供可恢复的隐藏占位符。
  - **Jev 在哪一步做判断**: 将 X 详情页回复编译为 Jev Noul 判断问题，由本地阈值、规则和重复模板信号共同决定是否隐藏。
  - **这个项目的用途**: 结合本地规则、缓存、并发与成本保护以及 Fail-Open 设计；不需要 X 官方 API，隐藏内容可以恢复。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bugkiwi/elons-job/) · 许可证: MIT

- [**jev-chat-for-twitch**](https://github.com/ethanplusai/jev-chat-for-twitch) — 这是一个 Chrome 扩展，可在 Twitch 直播旁增加一列只显示经 Jev 筛选的消息。
  - **Jev 在哪一步做判断**: Jev 对每条 Twitch 聊天消息进行分类打分，判断其是否属于用户所选意图以决定是否展示。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ethanplusai/jev-chat-for-twitch/) · 许可证: MIT

- [**jevlogs**](https://github.com/reachjalil/jevlogs) — 在 OpenTelemetry 日志进入进一步分析前，用 Jev 标注诊断价值、优先级和路由信号。
  - **Jev 在哪一步做判断**: 按日志内容打分，判断是否值得送交更深入的模型分析。
  - **这个项目的用途**: 可把判断附在日志上，同时保留原归档路径。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reachjalil/jevlogs/) · 许可证: MIT

- [**pi-fast-jev-compaction**](https://github.com/joelhooks/pi-fast-jev-compaction) — Pi 扩展：清理过时工具历史，保留原文；不足以释放上下文时交给 Pi 原生摘要。
  - **Jev 在哪一步做判断**: 分别判断调用和结果是否保留，并在送给模型的上下文中执行过滤。
  - **这个项目的用途**: 保留原始会话文件，并记录每次删减决定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joelhooks/pi-fast-jev-compaction/) · 许可证: MIT

- [**omp-jev-compaction**](https://github.com/jerryfane/omp-jev-compaction) — 为 Oh My Pi 删减工具历史的扩展，保留原文并复用旧判断以减少前缀反复改写。
  - **Jev 在哪一步做判断**: Jev 判断工具调用和结果的保留价值，扩展据此截短并附上可恢复提示。
  - **这个项目的用途**: 将删减决策记下来，在后续请求中重复应用。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jerryfane/omp-jev-compaction/) · 许可证: MIT

- [**pi-jev-context**](https://github.com/Nyarlathoteppppp/pi-jev-context) — pi-jev-context：判断内容是否相关，由本地阈值决定保留或过滤。
  - **Jev 在哪一步做判断**: 判断内容是否相关，由本地阈值决定保留或过滤。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nyarlathoteppppp/pi-jev-context/) · 许可证: MIT

- [**deepseek-harness-jev-pre-compaction**](https://github.com/wjw66/deepseek-harness-jev-pre-compaction) — 在上下文接近deepseek-harness插件，在上下文压缩阈值前，自动识别并移除低价值的工具结果，降低上下文占用
  - **Jev 在哪一步做判断**: 判断当前是否应该提前裁剪上下文，以及每个工具结果是否值得继续保留。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wjw66/deepseek-harness-jev-pre-compaction/) · 许可证: MIT

- [**fast-dev-compaction**](https://github.com/leonaaardob/fast-dev-compaction) — Codex 插件与上下文压缩工具，在会话生命周期钩子中利用 Jev 判定历史记录的保留价值并进行无损还原。
  - **Jev 在哪一步做判断**: 在会话上下文触达上限时，由 Jev 逐条评估历史消息和工具调用的保留必要性，仅剪除冗余噪音。
  - **这个项目的用途**: 相比简单的截断或整段摘要，通过离散判断保留了关键的代码定位与协议结构，防止长程编码对话失忆。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/leonaaardob/fast-dev-compaction/) · 许可证: MIT

- [**jev-compaction**](https://github.com/Waxmell114514/jev-compaction) — 该项目让 Jev 只为片段打分而不改写原文，将低分 Agent 上下文移入存储并留下可调用 expand 取回原文的指针。
  - **Jev 在哪一步做判断**: Jev 为每个工具输出片段打分，决定其留在冻结前缀中还是被移入外部存储只留指针。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/waxmell114514/jev-compaction/) · 许可证: MIT

- [**jev-skill-gate**](https://github.com/ShivamPansuriya/jev-skill-gate) — 按当前项目给 Claude Code 技能排相关度，减少默认加载的技能说明。
  - **Jev 在哪一步做判断**: 结合项目技术栈、目录与 README 判断技能相关性，再调整技能说明的可见程度。
  - **这个项目的用途**: 保留需要的说明，同时给其余技能保留手动调用入口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shivampansuriya/jev-skill-gate/) · 许可证: MIT

- [**alphaoptimizer**](https://github.com/alpha-tales/alphaoptimizer) — AlphaOptimizer 会筛选 Codex 的大型命令与工具输出，保留关键行并将完整输出暂存本地供按需读取，在配置密钥时使用 Jev 排序相关内容。
  - **Jev 在哪一步做判断**: Jev 判断每个候选文本块是否包含与当前目标相关的证据。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/alpha-tales/alphaoptimizer/) · 许可证: MIT

- [**codex-jev-compaction**](https://github.com/Wang-auspicious/codex-jev-compaction) — 为 Codex 整理任务交接上下文，用 Jev 筛选旧工具记录，并保留选中内容的原文。
  - **Jev 在哪一步做判断**: 判断符合条件的只读工具记录是否相关，本地规则保护必须保留的内容并生成交接包。
  - **这个项目的用途**: 交接包保留来源、筛选理由和原文次序。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wang-auspicious/codex-jev-compaction/) · 许可证: MIT

- [**fast-compaction-dsh**](https://github.com/kolawong/fast-compaction-dsh) — DSH 的上下文压缩插件
  - **Jev 在哪一步做判断**: 用 jev-latest 对每个工具调用做快速的 保留/截断/删除 判定，替换掉有损的压缩摘要——保留的内容逐字不动，任何东西都不会被改写。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kolawong/fast-compaction-dsh/) · 许可证: 未声明

- [**pi-jev-compaction**](https://github.com/nourhelmi/pi-jev-compaction) — 该 Pi 扩展使用 Jev 评估较旧的工具输出并将其从上下文中清除，同时保留原始会话记录以便通过检索取回。
  - **Jev 在哪一步做判断**: Jev 对最多16个陈旧工具输出打分，判断其仍被需要的概率，低于阈值则清除。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nourhelmi/pi-jev-compaction/) · 许可证: MIT

- [**jev-skill-selection**](https://github.com/redreamality/jev-skill-selection) — \*\*别再把每个 \`SKILL.md\` 都塞进提示词。\*\* 在第一条模型消息之前做 keep/drop —— 压缩上下文，省 token。
  - **Jev 在哪一步做判断**: Jev 对目录中每个技能做 keep/drop 判定，决定哪些 SKILL.md 保留进入首条消息前的提示词。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/redreamality/jev-skill-selection/) · 许可证: MIT

- [**jev-skills**](https://github.com/eran-broder/jev-skills) — 该插件把技能库移出上下文窗口，让 Jev 在每一轮判断并只注入相关的技能。
  - **Jev 在哪一步做判断**: Jev 在每一轮根据提示词和工具结果，对库中每个 skill 判定现在是否应该被注入上下文。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/eran-broder/jev-skills/) · 许可证: MIT

- [**pi-fast-jev-compaction**](https://github.com/KamilPostrozny/pi-fast-jev-compaction) — 该扩展使用 TypeSafe Jev 逐个工具调用决定旧结果在模型 Context 中的保留，不改写用户与助手正文且保持持久会话记录完整。
  - **Jev 在哪一步做判断**: Jev 逐个工具调用决定保留完整调用、仅删除结果还是完全删除调用。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kamilpostrozny/pi-fast-jev-compaction/) · 许可证: MIT

- [**pi-jev-context**](https://github.com/kevinpita/pi-jev-context) — Pi 的可逆上下文筛选扩展，用 Jev 判断旧消息是否仍值得发给主模型。
  - **Jev 在哪一步做判断**: 对历史片段做相关性判断，低分片段从后续请求隐藏，原始会话保留。
  - **这个项目的用途**: 可关闭筛选恢复完整上下文；启用时部分历史内容会发送给 TypeSafe。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kevinpita/pi-jev-context/) · 许可证: MIT

- [**your-signal**](https://github.com/MithrilMan/your-signal) — 一个自带 key 的 Chrome 扩展，让 Jev 按个人偏好给 X 信息流评分，再调整帖子的显示方式。
  - **Jev 在哪一步做判断**: 评估帖子相关性、实质内容、实用性与推广倾向，由本地权重和阈值决定高亮、折叠或隐藏。
  - **这个项目的用途**: 让个人信息流规则可调整，显示变化可恢复。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mithrilman/your-signal/) · 许可证: MIT

- [**dsh-jev**](https://github.com/Excalibur9527/dsh-jev) — DSH Plugin（DeepSeek Harness 插件）：每轮对话调用 typesafe.ai systemone(jev) 判定用户情绪/意图，结果注入模型上下文；API Key 与全部参数在 GUI 设置页配置
  - **Jev 在哪一步做判断**: Jev 对用户最新一条消息判定情绪、紧急度和应分流部门。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/excalibur9527/dsh-jev/) · 许可证: MIT

- [**jev-carryforward**](https://github.com/Dharundp6/jev-carryforward) — 这是一个按项目保存事实的 MCP 服务器，在开始任务时用 Jev 对已保存内容打分并只返回当前相关条目。
  - **Jev 在哪一步做判断**: 对每条非规则类记录判断其对当前任务是否仍有效、缺失会导致错误或重复工作，并返回概率以决定完整展示、一行展示或省略。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dharundp6/jev-carryforward/) · 许可证: MIT

- [**jev-context**](https://github.com/zbush/jev-context) — Codex 代码搜索插件：ripgrep 找候选，Jev 过滤后只返回判为相关的片段。
  - **Jev 在哪一步做判断**: 对代码片段与当前问题的相关性做判断，过滤 No 和 Unknown 结果。
  - **这个项目的用途**: 记录过滤前后载荷，可按指定 tokenizer 核算返回文本的变化。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zbush/jev-context/) · 许可证: MIT

- [**jev-toolspace**](https://github.com/xuan7zhang/jev-toolspace) — 该仓库使用 Jev 作为相关性判断器，为 tool-using LLM Agent 构建任务级工具空间，对每个请求或执行轨迹为注册表中每个工具打分并保留 top-K 工具。
  - **Jev 在哪一步做判断**: 对每个请求或任务，Jev对注册表中每个工具独立判断“回答该请求是否依赖此工具”并返回相关概率，用于选出Top-K工具空间。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/xuan7zhang/jev-toolspace/) · 许可证: 未声明

- [**openclaw-jev-compaction**](https://github.com/SqaaSSL/openclaw-jev-compaction) — 这是一个为 OpenClaw 提供的逐字上下文压缩引擎，它请 Jev 判断哪些工具调用和工具结果仍需保留并删除其余内容，且从不做总结。
  - **Jev 在哪一步做判断**: Jev 对每个工具调用及其结果分别打分，决定原文保留、截断结果还是整体删除。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sqaassl/openclaw-jev-compaction/) · 许可证: MIT

- [**pi-jev-compaction**](https://github.com/Wang-auspicious/pi-jev-compaction) — 给 Pi 做抽取式上下文压缩：让 Jev 判断旧的只读工具记录是否仍有用，保留部分直接复制原文。
  - **Jev 在哪一步做判断**: 以完整工具调用与返回为单位判断相关性，由代码移除被判为无用的记录对。
  - **这个项目的用途**: 保留原文证据和 Pi 的近期消息边界，不让 Jev 改写摘要。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wang-auspicious/pi-jev-compaction/) · 许可证: MIT

- [**pi-observational-memory-jev**](https://github.com/willfish/pi-observational-memory-jev) — 该扩展将历史切块后由 Jev 判断保留与分类，原样保存记录并用确定性渲染做压缩。
  - **Jev 在哪一步做判断**: Jev 决定每个历史候选是否保留、属于哪种固定种类，以及是否提升为持久主题文件。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/willfish/pi-observational-memory-jev/) · 许可证: MIT

- [**fast-jev-compaction-pi**](https://github.com/joslynSmall/fast-jev-compaction-pi) — 为 Pi 的上下文压缩筛选并原样保留关键工具证据，删除或截短过时的工具输出。
  - **Jev 在哪一步做判断**: Jev 接收待压缩会话的任务目标、用户和助手文本、已完成工具调用的名称与参数、结果长度和错误标记，不接收工具输出正文。 它对每个工具调用分别给出两个概率判断：是否保留“该调用及参数”，以及是否保留“完整原始结果”。本地代码再按阈值执行完整保留、截短结果或删除调用和结果；Jev 请求或解析失败时回退 Pi 原生摘要。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joslynsmall/fast-jev-compaction-pi/) · 许可证: MIT

- [**jev.tg**](https://github.com/Wing9897/jev.tg) — Laya 是選用本機模型，權重不在這個 repo。需要時再裝，第一次判斷才會下載：
  - **Jev 在哪一步做判断**: Jev 对每批 Telegram 消息逐条判断是否符合用户自然语言条件，并对整批进行类型分类。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wing9897/jev.tg/) · 许可证: 未声明

- [**pi-jev-compact**](https://github.com/ilkerulusoy/pi-jev-compact) — Pi 上下文整理扩展，默认筛除旧工具历史，另可选择把助手文字纳入候选。
  - **Jev 在哪一步做判断**: Jev 判断候选是否还需要保留，剩余文本按原样交回。
  - **这个项目的用途**: 让删减范围可配置，并保留判断记录供检查。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ilkerulusoy/pi-jev-compact/) · 许可证: 未声明


## 音乐与界面创作

- [**json-render**](https://github.com/vercel-labs/json-render) — json-render 网站里的 Jev UI 组合实验：从预定义组件与属性候选中选择，再由代码组装界面。
  - **Jev 在哪一步做判断**: 通过 Vercel AI Gateway 评估组件配置，composeSpec 把答案变成界面规格。
  - **这个项目的用途**: 提供一条与逐 Token 生成 JSON 不同的、可检查的界面组合路径。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vercel-labs/json-render/) · 许可证: Apache-2.0

- [**youtube-sponsor-detection**](https://github.com/trungdq88/youtube-sponsor-detection) — 结合实时音频与字幕由 Jev 驱动的 YouTube 视频赞助广告片段检测与自动跳过扩展。
  - **Jev 在哪一步做判断**: 提取视频字幕或音频转录切片，由 Jev 判定当前片段是否属于赞助商宣传读条，代码引擎控制时间戳与播放器快进。
  - **这个项目的用途**: 无需等待社区用户手动打点，借助 Jev 的语义判定能力实时识别个性化口播赞助，提升视频观看体验。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/trungdq88/youtube-sponsor-detection/) · 许可证: 未声明

- [**jevmeter**](https://github.com/ChetasLua/jevmeter) — 把视频转成带评分仪表的视频成片：Jev 按选定规则给字幕句子评分，再由渲染器叠加显示。
  - **Jev 在哪一步做判断**: 逐句读取转录文本，按预设问题和尺度返回分数，供时间轴上的仪表使用。
  - **这个项目的用途**: 把句子评分与对应视频片段对齐，便于逐段回看。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chetaslua/jevmeter/) · 许可证: MIT

- [**jev-paint**](https://github.com/achimala/jev-paint) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: Jev 为每个网格像素点的颜色类别输出概率分布，决定画面的色彩、明暗与轮廓形态。
  - **这个项目的用途**: 保留可编辑的组成部分与决策过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/achimala/jev-paint/) · 许可证: MIT

- [**vibecheck**](https://github.com/RafalWilinski/vibecheck) — 在 X 发帖前显示一个 Jev 评分卡，检查草稿的清晰度、语气、冒犯倾向等维度。
  - **Jev 在哪一步做判断**: 把草稿及回复/引用上下文交给 Jev，返回多个评分与发帖建议。
  - **这个项目的用途**: 在发送前集中查看对文案的不同评价角度。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rafalwilinski/vibecheck/) · 许可证: 未声明

- [**refgarden**](https://github.com/AlbionaHoti/refgarden) — 创意参考图库，汇集 The Met、NASA 与 Cosmos 的素材；本地 Explore 模式可使用 Jev。
  - **Jev 在哪一步做判断**: Jev 根据标题和描述挑选搜索词与值得突出的参考素材，不读取图片像素。
  - **这个项目的用途**: 保留素材来源链接；公开检索演示不调用 Jev，不能据此证明视觉聚类。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/albionahoti/refgarden/) · 许可证: MIT

- [**snifftest**](https://github.com/DanRWilloughby/snifftest) — Markdown 与纯文本写作检查器，用本地规则和可选 Jev 判断标记文风问题。
  - **Jev 在哪一步做判断**: 逐段判断重复结尾、套话、过度保留等语义规则，返回每条规则的概率。
  - **这个项目的用途**: 报告文件、行号和触发规则，保留原文供作者自行修改。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/danrwilloughby/snifftest/) · 许可证: MIT

- [**jevthoven**](https://github.com/cocktailpeanut/jevthoven) — 用一句话描述音乐，让 Jev 选择乐器、和声与逐小节片段，生成可编辑的多轨 MIDI。
  - **Jev 在哪一步做判断**: 从曲式、乐器、和弦和节奏候选中逐步选择，本地程序把选择转为音符。
  - **这个项目的用途**: 保留可编辑的音轨和决策记录，并支持播放与 MIDI 导出。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cocktailpeanut/jevthoven/) · 许可证: MIT

- [**ui-generator-instinct-jev**](https://github.com/joevidev/ui-generator-instinct-jev) — 描述想要的界面，Jev 从既有 shadcn/ui 组件、字段和样式中选择，应用负责渲染。
  - **Jev 在哪一步做判断**: 将界面需求拆成选择和评分问题，结果映射到有限的组件目录。
  - **这个项目的用途**: 演示用结构化选择组合 UI，Jev 本身不生成页面代码或文案。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joevidev/ui-generator-instinct-jev/) · 许可证: 未声明

- [**jev-in-blender-experiment**](https://github.com/kolibril13/jev-in-blender-experiment) — 这是一个 Blender 扩展，在三维视图侧栏增加 Jev 搜索页，可用自然语言查找并执行对应的 Blender 操作。
  - **Jev 在哪一步做判断**: Jev根据用户自然语言和Blender上下文对操作模块和具体bpy.ops算子进行分层排序选择。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kolibril13/jev-in-blender-experiment/) · 许可证: MIT

- [**ComfyUI-Jev**](https://github.com/hndrr/ComfyUI-Jev) — 该项目为 ComfyUI 提供使用 Jev 进行文本选择、条件判断、评分和数字提取的自定义节点，并可将结果传递给其他节点使用。
  - **Jev 在哪一步做判断**: Jev根据自然语言指令对输入文本状态执行候选选择、条件真假判断、打分和数值提取，并为请求选择本地Skill。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hndrr/comfyui-jev/) · 许可证: MIT

- [**slidepilot**](https://github.com/harshil1712/slidepilot) — 基于语音语义理解的 Slidev 自动翻页控制器，运行于 Cloudflare Agents 与 Jev 之上。
  - **Jev 在哪一步做判断**: 监听演讲者实时转录文本，由 Jev 评估当前页面核心要点是否已讲述完毕，并触发页面跳转或停顿。
  - **这个项目的用途**: 摆脱物理翻页笔束缚，结合确定性规则与语义完成度判定，实现自然流畅的演示文稿演讲同步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/harshil1712/slidepilot/) · 许可证: MIT

- [**bes-kelime-jev**](https://github.com/mahmut-gundogdu/bes-kelime-jev) — 这是一个土耳其语聊天小应用，无论输入什么都只用五个固定短语之一回复，具体用哪个由 Jev evaluation 模型选择。
  - **Jev 在哪一步做判断**: Jev根据用户消息从五个固定短语中选择一个词，并给出能量分数和疑问概率以决定标点。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mahmut-gundogdu/bes-kelime-jev/) · 许可证: MIT

- [**emoji-jev**](https://github.com/colinmcdermott/emoji-jev) — 该应用根据用户输入的文本调用 Jev 并行获取表情 Choice、情绪 Choice、Score 和 Boolean 结果，并将其显示为表情键盘。
  - **Jev 在哪一步做判断**: 用户每停顿一次，Jev 并行回答8个类型化问题，决定最匹配的 emoji 及其概率分布、主导情绪、情绪分数和语气布尔值。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/colinmcdermott/emoji-jev/) · 许可证: 未声明

- [**jev-cookbook**](https://github.com/paramjeetn/jev-cookbook) — jev-cookbook：在有限的素材或组件候选中选择，并由本地程序呈现结果。
  - **Jev 在哪一步做判断**: 在有限的素材或组件候选中选择，并由本地程序呈现结果。
  - **这个项目的用途**: 保留可编辑的组成部分与决策过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/paramjeetn/jev-cookbook/) · 许可证: MIT

- [**jev-got**](https://github.com/phureewat29/jev-got) — 《权力的游戏》文字冒险：大模型写剧情，Jev 判断地点、情绪和危险，再切换配乐与背景。
  - **Jev 在哪一步做判断**: 对新剧情判断 location、beat、mood、danger、inFiction 五项状态。
  - **这个项目的用途**: 用固定状态驱动界面和下一回合，不必从生成的故事里硬拆字段。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/phureewat29/got-jev/) · 许可证: 未声明

- [**let-jev-speak**](https://github.com/suidouble/let-jev-speak) — 该项目通过一次一词地反复调用分类接口，让只做分类的 Jev 拼出自由文本回答。
  - **Jev 在哪一步做判断**: Jev 通过 choice 问答逐词决定答案的下一个单词，并通过路由 choice 决定使用哪个领域词表。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/suidouble/let-jev-speak/) · 许可证: MIT

- [**jev-music-theory-1**](https://github.com/adammichaelwood/jev-music-theory-1) — 用 Jev 做和声练习、乐理选择题，并通过连续选择和弦播放电钢琴。
  - **Jev 在哪一步做判断**: 从声部、音高、时值或和弦候选中选择，代码评分或合成播放。
  - **这个项目的用途**: 把乐理测验和可听见的音乐实验放在同一项目中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/adammichaelwood/jev-music-theory-1/) · 许可证: 未声明

- [**jev-paste**](https://github.com/Anson-gzy/jev-paste) — \*\*jev-paste\*\* 是一款专为 macOS 设计的智能剪贴板实体提取与内联补全工具。
  - **Jev 在哪一步做判断**: 在有限的素材或组件候选中选择，并由本地程序呈现结果。
  - **这个项目的用途**: 保留可编辑的组成部分与决策过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/anson-gzy/jev-paste/) · 许可证: MIT

- [**jevspeak**](https://github.com/MM-sheng/jevspeak) — JevSpeak 让 Jev 对用户消息做出约13个概率性选择并形成语义中间表示，再用确定性语言编译器将其渲染成英文或中文句子。
  - **Jev 在哪一步做判断**: Jev 对每轮用户消息并行判断意图、立场、主张、限定、语气、情绪和置信度等约13个语义决策。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mm-sheng/jevspeak/) · 许可证: MIT


## 数据与搜索

- [**deep-searcher**](https://github.com/zilliztech/deep-searcher) — 开源深度研究与私域检索框架，集成 Jev 决策对搜索步长与早停做评估判断。
  - **Jev 在哪一步做判断**: Jev 在每轮检索后评估是否已获取充分信息，判定是否触发搜索早停。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zilliztech/deep-searcher/) · 许可证: Apache-2.0

- [**GPTCache**](https://github.com/zilliztech/GPTCache) — 基于 Jev 的语义缓存评估器，通过 Noul 二元判断核验缓存响应是否可复用于当前请求。
  - **Jev 在哪一步做判断**: Jev 判断当前请求与缓存上下文的语义匹配度，决定是否复用既有响应。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zilliztech/gptcache/) · 许可证: MIT

- [**memsearch**](https://github.com/zilliztech/memsearch) — memsearch：Jev 对每个候选记忆片段判断其是否包含回答查询所需的特定事实并给出noul相关性分数，用于重排序检索结果。
  - **Jev 在哪一步做判断**: Jev 对每个候选记忆片段判断其是否包含回答查询所需的特定事实并给出noul相关性分数，用于重排序检索结果。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zilliztech/memsearch/) · 许可证: MIT

- [**bootcamp**](https://github.com/milvus-io/bootcamp) — Milvus 官方实战教程：结合 Milvus 向量检索与 Jev 原语，实现搜索重排、查询路由与门禁过滤。
  - **Jev 在哪一步做判断**: Jev 在 Milvus 检索结果上做 Noul 打分排序与查询意图路由。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/milvus-io/bootcamp/) · 许可证: Apache-2.0

- [**kody**](https://github.com/kentcdodds/kody) — 可选的二段检索：先扩大混合召回，再用 Cloudflare Workers AI 上的 \`typesafe/jev\` Score 重排。
  - **Jev 在哪一步做判断**: 对每个候选发 Score 问题，按分数重排并丢掉低分结果；模型 ID 为 \`typesafe/jev\`。
  - **这个项目的用途**: 把 Jev 重排接到现有 MCP 搜索，而不是改写召回本身。许可证是 Fair Source FSL-1.1-ALv2，不是 OSI 开源。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kentcdodds/kody/) · 许可证: 未声明

- [**jev-search**](https://github.com/superagents-lab/jev-search) — 用自然语言搜网页：Jev 选择搜索来源和时间范围，再给返回的链接排序。
  - **Jev 在哪一步做判断**: 判断查询意图、来源与时间条件，并给各条搜索结果打相关性分数。
  - **这个项目的用途**: 保留链接、摘要、可调整过滤条件和来源失败提示。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/superagents-lab/jev-search/) · 许可证: MIT

- [**pg-jev**](https://github.com/realZachi/pg-jev) — 在 PostgreSQL 查询中用自然语言给数据行筛选、分类和排序。
  - **Jev 在哪一步做判断**: 将行内容交给 Jev，返回是否匹配、类别或等级分数，供 SQL 条件与排序使用。
  - **这个项目的用途**: 把语义条件与已有 SQL 查询放在一起，并复用缓存结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/realzachi/pg-jev/) · 许可证: 未声明

- [**vector-graph-rag**](https://github.com/zilliztech/vector-graph-rag) — 该项目从文档中抽取三元组并将实体与关系存为 Milvus 向量，通过向量检索、子图扩展和单次 LLM 重排回答多跳问题，并提供可选的 Jev 重排器。
  - **Jev 在哪一步做判断**: Jev 为每个候选图关系打分，判断其是否提供回答问题所需的事实或多跳中间链接。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zilliztech/vector-graph-rag/) · 许可证: MIT

- [**jev-semgrep**](https://github.com/uehaj/jev-semgrep) — 用 Jev 给每一行打“是否符合某含义”的分，可用 AND/OR/NOT 组合，并支持跨语言查询。
  - **Jev 在哪一步做判断**: 每批约 30 行，对每行向 \`jev-latest\` 发 Score 或 Noul，问它是否匹配给定含义。
  - **这个项目的用途**: 零运行时依赖的语义 grep；查询文本会发到 TypeSafe。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/uehaj/jev-semgrep/) · 许可证: 未声明

- [**pg\_typesafe**](https://github.com/giuliosmall/pg_typesafe) — 一个预览阶段的 PostgreSQL C 扩展，让 SQL 直接调用 Jev 做分类、是非判断和评分。
  - **Jev 在哪一步做判断**: 将 SQL 输入转换为 System One 请求，并把答案返回给数据库函数。
  - **这个项目的用途**: 在现有数据库查询中加入类型化语义判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/giuliosmall/pg_typesafe/) · 许可证: MIT

- [**jev-dataops**](https://github.com/RenaGao/jev-dataops) — 该项目是一个开源工作台，用于上传并筛选数据、用 JEV 评估数据质量、运行 LoRA 训练，并在保留测试集上评估模型。
  - **Jev 在哪一步做判断**: JEV 对每条数据的质量、隐私、可训练性等多维度进行打分并决定保留、人工复核或拒绝。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/renagao/jev-dataops/) · 许可证: MIT

- [**jev-curate**](https://github.com/AkashPriyadarshii/jev-curate) — Rust 数据集筛选实验，用 Jev 给文本记录评分并分流到保留或拒绝结果。
  - **Jev 在哪一步做判断**: 本地预过滤后调用 TypeSafe，按各项概率和评分阈值决定是否保留记录。
  - **这个项目的用途**: 提供本地预过滤与分数阈值，适合研究按记录筛选的数据管道。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/akashpriyadarshii/jev-curate/) · 许可证: MIT

- [**polar\_llama**](https://github.com/pnthn-ai/polar_llama) — Polars 上的并行推理库：聊天模型走各家补全接口，Jev 则按行做 Noul、Choice、Score，或对整份文档套一份类型化契约。
  - **Jev 在哪一步做判断**: 每一行一个 state，多个 typed questions 一次请求返回；Noul / Choice / Score 落成带置信度的普通列。
  - **这个项目的用途**: 把闭集判断接到现有 Polars 批处理列上，而不必再走一轮聊天补全。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pnthn-ai/polar_llama/) · 许可证: MIT

- [**duckdb-jev**](https://github.com/colliber/duckdb-jev) — 一个 DuckDB 扩展，在 SQL 中调用 Jev，并把回答转换成 ENUM、数值或 STRUCT 等类型。
  - **Jev 在哪一步做判断**: 对行文本提出 Choice、Score、Noul 问题，按问题定义生成对应 SQL 结果。
  - **这个项目的用途**: 在查询表格或 Parquet 数据时直接使用结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/colliber/duckdb-jev/) · 许可证: MIT

- [**jevframe**](https://github.com/ktaletsk/jevframe) — 该库使用 TypeSafe Jev 对 pandas 和 Polars DataFrame 的每一行提出自然语言问题，并返回带完整概率分布的文本分类、情感分析和评分结果。
  - **Jev 在哪一步做判断**: Jev 针对每一行上下文回答自然语言问题，判定情感、主题分类与等级评分并返回完整概率分布。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ktaletsk/jevframe/) · 许可证: MIT

- [**jevql**](https://github.com/kylemclaren/jevql) — 在普通 PostgreSQL 查询外加一层语义处理，用 Jev 筛选、分组和排序，无需安装数据库扩展。
  - **Jev 在哪一步做判断**: CLI 或服务层解析 jev\_\* 调用，把行文本发给 Jev，再用结果完成查询。
  - **这个项目的用途**: 通过 CLI、HTTP、MCP 与 SDK 复用同一套语义 SQL 接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kylemclaren/jevql/) · 许可证: MIT

- [**reranker**](https://github.com/hev/reranker) — 把查询和最多约 30 篇候选放进一次 Jev state，每篇一个 Noul「是否相关」，用来过滤或重排。
  - **Jev 在哪一步做判断**: 每篇文档一个 Noul 相关度；超长列表再切批并发请求，结果可按阈值丢掉或按分数排序。
  - **这个项目的用途**: 用概率当阈值或排序键，不必再接一个生成式重排器。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hev/reranker/) · 许可证: Apache-2.0

- [**every**](https://github.com/sufianetaouil/every) — 代码库全量函数语义问答工具：对代码库内每个函数发起是非问题提问，按 Noul 概率在秒级内排列出最相关的函数。
  - **Jev 在哪一步做判断**: 将自然语言问题转化为布尔/概率判断，遍历代码库函数计算匹配置信度，由本地策略排序呈现。
  - **这个项目的用途**: 以极低单次调用成本实现类似 grep 的自然语言函数级代码发现。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sufianetaouil/every/) · 许可证: MIT

- [**jev-bigquery-cloudrun**](https://github.com/jeffonelson/jev-bigquery-cloudrun) — 该仓库通过私有的 Cloud Run 适配器调用 Jev API，对 BigQuery 中的 30 张虚构支持工单按负责团队、紧急程度和阻塞情况分类，并将结果存回 BigQuery 供 SQL 查询。
  - **Jev 在哪一步做判断**: Jev 根据工单内容决定负责团队归属、紧急概率、阻塞概率以及已关闭工单的解决支持度。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jeffonelson/jev-bigquery-cloudrun/) · 许可证: 未声明

- [**jev-search**](https://github.com/larguesa/jev-search) — 这是一个用 Jev 按语义逐行检索文本的 Python 命令行工具，用作关键词搜索的补充视角。
  - **Jev 在哪一步做判断**: Jev 对每一行 l{i} 判定其是否满足查询语义意图，返回 noul 概率分数。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/larguesa/jev-search/) · 许可证: MIT

- [**jev-search-rerank-eval**](https://github.com/zhuyansen/jev-search-rerank-eval) — 中英文检索重排效果评估系统，对比 Jev 重排与词法搜索、向量检索及混合融合基线，并分析评审者自循环偏差。
  - **Jev 在哪一步做判断**: 在评估流水线中调用 Jev 判断器对 9,831 对样本和 164 个中英查询进行多级相关度评分，比较重排前后排序指标。
  - **这个项目的用途**: 为搜索算法工程师提供了严谨的定性与定量对比依据，以实测实验揭示了 Jev 在跨语种技能目录搜索中的真实收益与边界。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zhuyansen/jev-search-rerank-eval/) · 许可证: MIT

- [**JevFind**](https://github.com/Peu77/JevFind) — 这是一个由 Jev 驱动的语义代码搜索工具，可用自然语言查询找到相关文件、行范围和代码片段。
  - **Jev 在哪一步做判断**: Jev 负责判断每个文件路径和代码窗口与用户自然语言概念相关的概率。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/peu77/jevfind/) · 许可证: MIT

- [**jevsql**](https://github.com/EugeneBoondock/jevsql) — 给 SQLite 加入 Jev 语义判断，可过滤、排序、匹配记录并追踪判断所用的证据。
  - **Jev 在哪一步做判断**: 把行数据和候选问题发给 Jev，再把答案映射为 SQL 可查询结果。
  - **这个项目的用途**: 提供批处理、缓存和预算控制，并保留判断历史。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/eugeneboondock/jevsql/) · 许可证: MIT

- [**jev-in-codex**](https://github.com/teempai/jev-in-codex) — 该仓库是 Codex 插件，通过 Jev 对工作区内 JSONL 文本记录进行批量标注，生成每条记录带一个标签的输出文件以供复核。
  - **Jev 在哪一步做判断**: Jev 对输入 JSONL 中每条文本记录做出单选分类决策，输出唯一标签与置信度。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/teempai/jev-in-codex/) · 许可证: MIT

- [**jev-papers**](https://github.com/stas4000/jev-papers) — 该项目用 Jev 对 1000 篇 arXiv AI 论文各做一次 24 选一主题分类，再用 LLM judge 抽样复核并在静态页面中展示主题分布。
  - **Jev 在哪一步做判断**: Jev 为每篇论文在24个研究主题中做出单选决策并返回选项置信度与概率分布。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/stas4000/jev-papers/) · 许可证: MIT

- [**jev-reranker**](https://github.com/shinpr/jev-reranker) — 该工具从标准输入读取 JSON 候选文档，并使用 Jev 按查询对其进行重排、过滤或压缩后输出。
  - **Jev 在哪一步做判断**: Jev 根据查询判断每个候选文档或句子单元的相关性／证据得分，以决定排序、过滤或压缩保留。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shinpr/jev-reranker/) · 许可证: MIT

- [**jeveryword**](https://github.com/jkrup/jeveryword) — 该库将文本切分为带编号的词供 Jev 选择，并将选中的编号还原为原文子串，用于字段抽取、词标注和原文引用。
  - **Jev 在哪一步做判断**: Jev 负责从编号词选项中选择每个字段的起止词、定位所属句子并为每个词选择标签。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jkrup/jeveryword/) · 许可证: MIT

- [**jevsql**](https://github.com/sarathi-aiml/jevsql) — 该项目使用 Jev 回答类型化问题，再由代码组装参数化 SELECT 查询来实现自然语言转 SQL。
  - **Jev 在哪一步做判断**: Jev 决定查询意图、目标表、所属州、是否提及县以及每个数字约束对应的列和比较方向。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sarathi-aiml/jevsql/) · 许可证: 未声明

- [**jlink**](https://github.com/keltokhy/jlink) — jlink 让用户用 plain English 写出匹配规则，在本地做候选 blocking 生成记录对，再用 Jev Noul 逐对判断是否为同一实体并给出概率，然后解析链接并提供审计与引用文本。
  - **Jev 在哪一步做判断**: Jev 根据用户用自然语言给出的匹配规则，判断两个候选记录是否指向同一实体并返回匹配概率。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/keltokhy/jlink/) · 许可证: MIT

- [**llama-index-jev**](https://github.com/WiktorB2004/llama-index-jev) — 为 LlamaIndex 提供 Jev 重排序器和路由器，给检索片段评分或选择查询工具。
  - **Jev 在哪一步做判断**: 用 Score 给候选片段评相关性，用 Choice 选择查询引擎或工具。
  - **这个项目的用途**: 把 Jev 判断接入已有的检索与查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wiktorb2004/llama-index-jev/) · 许可证: MIT

- [**duckdb-jev**](https://github.com/prasanthj/duckdb-jev) — 该仓库是原生 C++ DuckDB 扩展，可直接在 SQL 中调用 Jev 进行语义判断、分类和打分，并支持批量与流式推理。
  - **Jev 在哪一步做判断**: Jev 根据 SQL 行级证据对每个问题执行 Noul 真假判断、Choice 有限分类或 Score 有序评分。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/prasanthj/duckdb-jev/) · 许可证: Apache-2.0

- [**jselect**](https://github.com/keltokhy/jselect) — jselect 根据任务挑选带来源引用的原文片段，并用 Jev 判断相关性，在 Token 预算内组装可直接供 Agent 阅读的上下文。
  - **Jev 在哪一步做判断**: Jev 对每个文本片段做出 Noul 二元判断，决定其是否为当前任务的有用证据。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/keltokhy/jselect/) · 许可证: MIT

- [**jev-311-heatmap**](https://github.com/CompleteTech-LLC-AI-Research/jev-311-heatmap) — 该项目下载 NYC 311 投诉数据，用 JEV 评估投诉描述，并在地理网格上生成可交互热力图。
  - **Jev 在哪一步做判断**: JEV根据311投诉描述判断潜在影响严重程度、安全隐患概率和所属问题类别。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/completetech-llc-ai-research/jev-311-heatmap/) · 许可证: 未声明

- [**jev-information-extraction**](https://github.com/abhishekmamdapure/jev-information-extraction) — jev-information-extraction：Jev 为每个自然语言问题从当前页面的文本块候选中选择最相关的答案块并返回概率排名。
  - **Jev 在哪一步做判断**: Jev 为每个自然语言问题从当前页面的文本块候选中选择最相关的答案块并返回概率排名。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abhishekmamdapure/jev-information-extraction/) · 许可证: 未声明

- [**jev-scout**](https://github.com/AkashPriyadarshii/jev-scout) — 用搜索结果建立真实仓库与 Rust crate 候选，再让 Jev 按需求相关性进行评分和选择。
  - **Jev 在哪一步做判断**: 比较候选信息与用户需求，对适配度和维护迹象打分，并选择候选。
  - **这个项目的用途**: 把推荐限制在检索得到的候选中，保留可点击的来源。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/akashpriyadarshii/jev-scout/) · 许可证: MIT

- [**DataJev**](https://github.com/zzz1YAO/DataJev) — DataJev 让 LLM 编写并由 Python 执行单步数据分析，再由 Jev 控制器根据压缩分析状态决定 CONTINUE、SWITCH、VERIFY 或 STOP。
  - **Jev 在哪一步做判断**: Jev 根据压缩后的分析状态决定下一步是继续深挖、切换方向、验证发现还是停止分析。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zzz1yao/datajev/) · 许可证: MIT

- [**hfjev**](https://github.com/hemanth/hfjev) — hfjev 可加载 Hugging Face 数据集，并使用 Choice、Score 和 Noul 等 Jev 原语对每一行进行类型化语义分类。
  - **Jev 在哪一步做判断**: Jev对每条Hugging Face数据集文本在情感、主题、深度、剧透等类型化维度上并行做出Choice多选、Score打分和Noul门禁判定。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/hfjev/) · 许可证: MIT

- [**jevpdf**](https://github.com/kylemclaren/jevpdf) — 打开 PDF 并用自己的话提问，应用用 Jev 判断每一行是否回答问题并高亮匹配行。
  - **Jev 在哪一步做判断**: Jev 对 PDF 每一行回答“该行是否回答用户查询”并给出 noul 分数用于高亮与排序。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kylemclaren/jevpdf/) · 许可证: MIT

- [**jevsome-projects**](https://github.com/ozers/jevsome-projects) — 一个 Jev 项目目录与发现流水线，保存接入证据，并可用 Jev 辅助分类。
  - **Jev 在哪一步做判断**: 配置 key 后，把项目状态和候选类别交给 Jev；未配置时使用本地分类规则。
  - **这个项目的用途**: 把项目索引与具体源码证据放在一起。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ozers/jevsome-projects/) · 许可证: MIT

- [**jev-bfs**](https://github.com/komikat/jev-bfs) — 基于 Jev 引导的维基百科链接竞速寻路器：利用 Jev 评估出站链接相关性，在终端实时寻径两词条之间的最短路径。
  - **Jev 在哪一步做判断**: 在 BFS 搜索树的每个分支点，由 Jev 对当前页面的出站链接进行语义启发式打分并剪枝。
  - **这个项目的用途**: 结合传统图搜索算法与概率决策，显著缩减维基百科多跳路径的搜索空间。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/komikat/jev-bfs/) · 许可证: MIT

- [**jev-research-pipeline**](https://github.com/shimo4228/jev-research-pipeline) — 该项目是一个每日研究监测管道，确定性 Python 控制流程，TypeSafe Jev 按研究问题筛选来源，Qwen 撰写 Obsidian 笔记。
  - **Jev 在哪一步做判断**: 对每个（抓取来源、开放研究问题）二元组，Jev 先回答是否相关/方法可迁移/证据兼容等 Noul 门控，再给出加权 Score 维度，由代码按阈值路由到保留/待审/丢弃。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shimo4228/jev-research-pipeline/) · 许可证: MIT

- [**jev-retrieval**](https://github.com/romeromarcelo/jev-retrieval) — 这是一个用 Rust 编写的代码与文档检索命令行工具，先用本地 BM25 召回候选文件，再用 Jev 的 Noul 逐窗口验证相关性，最后用 Choice 重排并输出带分数的文件路径与行号。
  - **Jev 在哪一步做判断**: Jev 对每个候选文件的文本窗口做 Noul 二元相关性门禁过滤，再用每通道一次的 Choice 多选一重排确定最终文件排序和校准分数。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/romeromarcelo/jev-retrieval/) · 许可证: Apache-2.0


## 决策工具

- [**killmyidea**](https://github.com/monteduro/killmyidea) — 创业点子评估演示，用 Jev 的多项评分给出 KILL、FIX 或 SHIP 标签。
  - **Jev 在哪一步做判断**: Jev 回答评分、分类和清晰度问题，本地加权与门槛计算最终标签。
  - **这个项目的用途**: 展示结构化评估过程，不是市场验证、商业成功预测或投资建议。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/monteduro/killmyidea/) · 许可证: 未声明

- [**jevify**](https://github.com/altryne/jevify) — 一个 Agent Skill，帮助找出项目中适合用 Jev 的判断环节，并设计问题与对照实验。
  - **Jev 在哪一步做判断**: 围绕应用场景设计 Noul、Choice、Score 问题包，附脚本可调用 API 运行案例。
  - **这个项目的用途**: 把接入想法、问题设计与验证方法放在一起。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/altryne/jevify/) · 许可证: MIT

- [**hermes-jev**](https://github.com/keeltrace/hermes-jev) — Hermes Agent 的异步 Jev 辅助决策系统，用于相关性、完成度、恢复路径和可选工具准入等判断。
  - **Jev 在哪一步做判断**: Jev 在后台评估有边界的问题，Hermes 保留推理与执行职责，并记录判断来源。
  - **这个项目的用途**: 让模型判断有可追踪回执，同时可按配置减少对主流程的阻塞。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/keeltrace/hermes-jev/) · 许可证: MIT

- [**jev-belay**](https://github.com/valentynkit/jev-belay) — Claude Code 的 Stop 钩子：本地先看本轮是否改过文件、是否已有通过的检查，只有这时才问 Jev 结束语是不是未经核实的完成声明。
  - **Jev 在哪一步做判断**: 四个问题：结束语是否声称完成、是否声称检查已通过、该任务是否值得跑检查，以及 complete / partial / blocked / other。
  - **这个项目的用途**: 有通过的检查就不发请求；出错则放行，避免钩子把会话卡死。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/valentynkit/jev-belay/) · 许可证: MIT

- [**wechat-jev-assistant**](https://github.com/yushen100/wechat-jev-assistant) — Windows 微信对话分析助手：本地读取、脱敏、TypeSafe Jev 判断与加密历史
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/yushen100/wechat-jev-assistant/) · 许可证: 未声明

- [**jev-commit**](https://github.com/valentynkit/jev-commit) — commit-msg 钩子：一次 Jev 请求对照暂存 diff 给提交说明打五个 Noul，默认只警告。默认拦住提交的是本地正则腰带对新增行的高置信命中；secret\_shaped Noul 只在 --strict 时参与拦截。
  - **Jev 在哪一步做判断**: 一次请求里五个 Noul：说明是否可核对、是否与 hunk 相符、是否留下调试代码、是否有未提及改动、新增行是否像密钥。默认拦截来自正则腰带；secret\_shaped 只在 --strict 下参与拦截。
  - **这个项目的用途**: 把提交说明核对做成可设阈值的概率，而不是再读一段模型评语；接口失败时仍放行提交。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/valentynkit/jev-commit/) · 许可证: MIT

- [**claude-jev**](https://github.com/0x7067/claude-jev) — claude-jev：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/0x7067/claude-jev/) · 许可证: MIT

- [**jev-chat-windows-deepseek-jev**](https://github.com/Aimark-dai/jev-chat-windows-deepseek-jev) — Windows 微信回复助手：DeepSeek 官方生成话术，TypeSafe JEV 官方判断排序，支持可取消的 3 秒自动发送。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/aimark-dai/jev-chat-windows-deepseek-jev/) · 许可证: 未声明

- [**jev-plays-pokemon-red**](https://github.com/valentynkit/jev-plays-pokemon-red) — 在 PyBoy 上玩 Pokemon Red：代码负责路线和算术，只在游戏真正分叉时让 Jev 从已合法的动作里选一个。
  - **Jev 在哪一步做判断**: 在合法动作上做 Choice；战斗回合另问本回合是否会倒下、是否该逃跑；无法识别的答案走代码默认。
  - **这个项目的用途**: 模型只做闭集选择，不规划整局；失败时不会比脚本更松。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/valentynkit/jev-plays-pokemon-red/) · 许可证: MIT

- [**jev.nvim**](https://github.com/valentynkit/jev.nvim) — Neovim 插件：用自然语言问当前 buffer，Treesitter 按函数切开，Jev 给每个函数打概率；全部命中按概率进入 quickfix。
  - **Jev 在哪一步做判断**: 把同一问题套到每个函数的源码上，返回概率；装不下就拆成多次请求。全部命中写入 quickfix，只有达到阈值的才打 virtual text 标记。
  - **这个项目的用途**: 用问题而不是正则找“会拼 SQL”这类跨语言形状，并直接接上已有的 quickfix 编辑流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/valentynkit/jev.nvim/) · 许可证: MIT

- [**jev-bot**](https://github.com/nssmd/jev-bot) — jev-bot：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nssmd/jev-bot/) · 许可证: MIT

- [**Jev-in-the-Loop**](https://github.com/Tongyun1/Jev-in-the-Loop) — \*\*Jev-in-the-Loop 致力于研究如何用 Jev 加速各类需要 LLM 做决策的任务。\*\* 从选择下一步操作，到推进一段工作流，我们探索把 Jev 引入决策循环，让智能体从理解意图更快地走向完成任务。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tongyun1/jev-in-the-loop/) · 许可证: MIT

- [**jev-skip**](https://github.com/valentynkit/jev-skip) — Chrome 扩展：只读字幕，把片段交给 Jev 分类（段数或 Token 预算超限就拆请求），在进度条上画出五类片段，并对达到阈值的 sponsor、self\_promo、intro、outro、recap 自动跳过。
  - **Jev 在哪一步做判断**: 每个字幕片段一个 Choice：content、sponsor、intro、outro、self\_promo、recap 或 other。绘制并跳过的是 PAINTED 五类（sponsor、self\_promo、intro、outro、recap）里概率达到阈值的片段；content 和 other 不跳过。
  - **这个项目的用途**: 不必等 SponsorBlock 人工打点；没有字幕就不判断、也不跳过。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/valentynkit/jev-skip/) · 许可证: MIT

- [**jev-laya-benchmark**](https://github.com/harrymunro/jev-laya-benchmark) — jev-laya-benchmark：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/harrymunro/jev-laya-benchmark/) · 许可证: MIT

- [**jev-predict-skill**](https://github.com/DanielKillenberger/jev-predict-skill) — 一个可供 Agent 执行的 skill 配方，根据规则和证据预测另一个 skill 的闭集结论。
  - **Jev 在哪一步做判断**: 先用 Jev 判断任务是否可拆成闭集问题，再从原 skill 的候选结论中选择。
  - **这个项目的用途**: 附带 API 调用与结果检查示例；它预测结论，不执行目标 skill。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/danielkillenberger/jev-predict-skill/) · 许可证: 未声明

- [**jev-chat-windows-laya**](https://github.com/ZJemYoung/jev-chat-windows-laya) — Windows 版微信聊天副驾（上游 fork）：本地 laya 判断引擎免密钥运行 + 修复高缩放屏抓取错位 Windows fork of jev-chat: key-free local laya judge + DPI-aware screen capture fix
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zjemyoung/jev-chat-windows-laya/) · 许可证: MIT

- [**jev-codex-router-skill**](https://github.com/455-dIAO/jev-codex-router-skill) — 按任务需求选择 \*\*模型 × 推理强度\*\*，把路由流程装进一个可分享的 Codex Skill。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/455-diao/jev-codex-router-skill/) · 许可证: 未声明

- [**jev-slop-guard**](https://github.com/davertor/jev-slop-guard) — jev-slop-guard：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/davertor/jev-slop-guard/) · 许可证: MIT

- [**jev-playground**](https://github.com/Little-Planet-Labs/jev-playground) — 在网页里输入状态与选择题或评分题，查看 Jev 的回答和概率分布。
  - **Jev 在哪一步做判断**: 把多道 Noul、Choice、Score 问题放在同一次请求里。
  - **这个项目的用途**: 不用先写业务代码就能尝试问题与候选答案。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/little-planet-labs/jev-playground/) · 许可证: 未声明

- [**jev-skill-router**](https://github.com/shimo4228/jev-skill-router) — 这是一个 Claude Code 插件，每次收到提示就请 Jev 从已安装技能中挑选最多一个合适的技能，并默认以 shadow 模式只记录结果而不干预对话。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shimo4228/jev-skill-router/) · 许可证: MIT

- [**jev-triage**](https://github.com/ccai40359-wq/jev-triage) — jev-triage：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ccai40359-wq/jev-triage/) · 许可证: MIT

- [**Jevatar**](https://github.com/AppChainAI/Jevatar) — 密钥只存在于服务端，不下发到浏览器。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/appchainai/jevatar/) · 许可证: MIT

- [**jevchat**](https://github.com/kt3k/jevchat) — 一个聊天式 Jev 演示：回答从预先定义或自定义的选项里选择，而不是生成长文。
  - **Jev 在哪一步做判断**: 把回答风格映射成 Choice 选项，也从问题片段中选择聊天标题。
  - **这个项目的用途**: 在聊天界面查看选项及其概率，并尝试自己的答案集合。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kt3k/jevchat/) · 许可证: 未声明

- [**typesafe-jev-ruby**](https://github.com/dtheofr/typesafe-jev-ruby) — typesafe-jev-ruby：把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **Jev 在哪一步做判断**: 把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dtheofr/typesafe-jev-ruby/) · 许可证: MIT

- [**turing-jail**](https://github.com/bugkiwi/turing-jail) — 由 TypeSafe Jev System One 驱动的三关 AI 审讯游戏：通过求情、逻辑与悖论测试，争取获得释放。
  - **Jev 在哪一步做判断**: 每一关评估 prisoner\_response 的释放概率、求情、逻辑与悖论信号，同时用 Choice 识别说服策略、用 Score 评估说服力。
  - **这个项目的用途**: 把结构化 Jev 判断变成可玩的反馈、门槛和排行榜结果，让用户直观看见不同论证如何影响释放概率。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bugkiwi/turing-jail/) · 许可证: 未声明


## 行业应用

- [**ai-hedge-fund**](https://github.com/virattt/ai-hedge-fund) — 一个教育用途的 AI 对冲基金原型，其中可选 Jev 适配器把结构化判断接到基金决策流程。
  - **Jev 在哪一步做判断**: 把策略问题转为 System One 请求，再把原生答案转换成项目统一的结果格式。
  - **这个项目的用途**: 在同一研究流程里选择使用 Jev 或其他模型后端。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/virattt/ai-hedge-fund/) · 许可证: MIT

- [**jev-trader**](https://github.com/jarrodwatts/jev-trader) — 在 Monad 的 Kuru MON-USDC 订单簿上尝试做市，Jev 可按新区块选择买卖方向。
  - **Jev 在哪一步做判断**: 开启 Jev 模式后读取订单簿并选择方向，代码模拟成交或按配置提交 post-only 限价单。
  - **这个项目的用途**: 默认 mock 模型；无私钥时为 dry run，模拟结果不证明可获利。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jarrodwatts/jev-trader/) · 许可证: MIT

- [**jev-chat-windows**](https://github.com/jev-chat/jev-chat-windows) — 微信（Windows 4.x）旁挂的回复辅助：窗口截图 + 本地离线 OCR 读对方消息 → Jev 判断意图 → 3 条候选一键填入，发送永远手动
  - **Jev 在哪一步做判断**: Jev 先判断对方意图、情绪与紧张度，再对三条候选回复进行排序并给出胜出概率选出推荐回复。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-chat/jev-chat-windows/) · 许可证: 未声明

- [**tax-doc-classifier**](https://github.com/kyotofin/tax-doc-classifier) — 税务文档页面分类器，用 Jev 从预先定义的 IRS 表格与页面类型中选择类别。
  - **Jev 在哪一步做判断**: 提取 PDF 页面的文本后发送给 Jev，返回表格类型、页面类型及置信度。
  - **这个项目的用途**: 将固定表格目录与每页分类结果连接起来，供后续文档流程使用。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kyotofin/tax-doc-classifier/) · 许可证: Apache-2.0

- [**jev-trade**](https://github.com/aowang-ai/jev-trade) — 一个 Hyperliquid 交易机器人实验，用 Jev 判断做多、做空，以及开仓、平仓或等待。
  - **Jev 在哪一步做判断**: 每个资产账户读取行情后单独调用 Jev，执行器按选择提交或撤销订单。
  - **这个项目的用途**: 把模型决策、订单执行与看板状态分开记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/aowang-ai/jev-trade/) · 许可证: 未声明

- [**332\_lab-jev-chat**](https://github.com/Liyucheng1997/332_lab-jev-chat) — Jev Chat Assistant for Windows - 电脑版微信意图判断与 DeepSeek 建议回复
  - **Jev 在哪一步做判断**: Jev 判断对方真实意图、危险等级、需求、是否应立即回复和最佳动作，并对三条候选回复进行排序优选。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/liyucheng1997/332_lab-jev-chat/) · 许可证: MIT

- [**jev-eval-agent**](https://github.com/vinilana/jev-eval-agent) — 智能体工具选择基准测试平台，在包含 100 个模拟工具的个人助理环境下对比大模型直接选工具与 Jev 路由的效率。
  - **Jev 在哪一步做判断**: 利用 Jev 对上百个工具元数据进行两级离散筛选和相关性判定，把候选工具集从百级快速裁剪至少量候选。
  - **这个项目的用途**: 解决了多工具智能体因长提示词导致的上下文膨胀与选择幻觉问题，显著降低了大模型的规划耗时。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vinilana/jev-eval-agent/) · 许可证: 未声明

- [**Prism**](https://github.com/irfndi/prism-liquidity-agent) — 观察 Solana 流动性池的 Agent，Jev 提供影子判断与规则结果对照。
  - **Jev 在哪一步做判断**: 评估入池分布、毒性交易流、持有及压力信号，记录用于校准。
  - **这个项目的用途**: 为确定性交易规则提供可比较的旁路信号，不承诺收益。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/prism-liquidity-agent/) · 许可证: MIT

- [**Working-Memory-Jev**](https://github.com/AustinAWay/Working-Memory-Jev) — 这是一个在本地运行的教学辅助工具，它使用 Jev API 分析英语教学文本在各阅读步骤中的主动分组、来源连接和需求变化，并与1–5槽位预算进行比较。
  - **Jev 在哪一步做判断**: Jev 对文本熟悉度、激活/背景状态、分组和关系归属做出有界选择，以估计每一步的记忆负荷。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/austinaway/working-memory-jev/) · 许可证: 未声明

- [**jev-seo**](https://github.com/AgriciDaniel/jev-seo) — 从一个首页网址对任意网站做实时SEO审计，抓取网站并结合52条规则与Jev判断打分，生成PDF、XLSX和Markdown三份报告。
  - **Jev 在哪一步做判断**: Jev 对每个抓取页面判断页面类型、搜索意图、商业重要性、有用性、原创性及处置建议等语义问题。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/agricidaniel/jev-seo/) · 许可证: MIT

- [**HA-Jev**](https://github.com/AboveColin/HA-Jev) — 把 Jev 的判断变成 Home Assistant 传感器，例如检查衣服是否洗完后一直没取。
  - **Jev 在哪一步做判断**: 读取选定设备与实体状态，返回概率、选项或分数，再由配置阈值触发自动化。
  - **这个项目的用途**: 把自然语言条件接入已有的传感器、通知和场景。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abovecolin/ha-jev/) · 许可证: MIT

- [**jev-social**](https://github.com/socai-io/jev-social) — 该项目由 Jev 逐步选择 Instagram、TikTok 和 LinkedIn 的搜索、打开主页或帖子、读取评论及下载视频等操作，并由 socai 在真实浏览器中执行后整理成带引用的报告。
  - **Jev 在哪一步做判断**: Jev 在每一步从具体只读操作候选中选择平台路由和下一个要执行的搜索/打开/读取/下载或结束操作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/socai-io/jev-social/) · 许可证: MIT

- [**jev-seo**](https://github.com/AkashPriyadarshii/jev-seo) — Rust SEO/GEO 命令行与 MCP 实验工具，结合网页检查、DuckDuckGo 查询和可选 Jev 评分。
  - **Jev 在哪一步做判断**: 给搜索意图、内容直接性和内容缺口分类，并按自定义 rubric 估计可引用性。
  - **这个项目的用途**: 把本地检查、搜索结果和模型评分整理成可查看的报告。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/akashpriyadarshii/jev-seo/) · 许可证: MIT

- [**clash-jev**](https://github.com/bytelabs-oss/clash-jev) — clash-jev：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bytelabs-oss/clash-jev/) · 许可证: MIT

- [**jev-reviewer**](https://github.com/choxos/jev-reviewer) — 为系统综述从论文与补充材料中挑出原文证据，供研究者逐条核对并导出提取表。
  - **Jev 在哪一步做判断**: Jev 选择能回答问题的候选行号，代码复制原文并保留文件和页码等位置。
  - **这个项目的用途**: 把引用、来源位置和人工确认状态对应起来，方便回查。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/choxos/jev-reviewer/) · 许可证: MIT

- [**JevScout**](https://github.com/hqman/JevScout) — 供编程 Agent 调用的求职检索演示 Skill，通过 Chrome 浏览公司招聘页，用 Jev 筛选 AI 与软件工程职位并保存结果。
  - **Jev 在哪一步做判断**: Jev 用 Choice 识别页面类型，用 Noul 评估招聘链接、职位相关性、筛选控件和候选人匹配度；本地阈值决定导航、打开职位与保存。
  - **这个项目的用途**: 把招聘入口、职位筛选和详情匹配连成一次 CLI 流程，输出本地 JSON 与 Markdown 报告。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hqman/jevscout/) · 许可证: 未声明

- [**Jev-Trades**](https://github.com/zadescoxp/Jev-Trades) — 用实时加密货币行情练习模拟交易。Jev 给出交易判断，面板展示虚拟仓位和技术指标，不连真实下单接口。
  - **Jev 在哪一步做判断**: 读取已完成的分钟 K 线与技术指标，对启用的资产返回结构化交易判断；Python 按置信度和仓位限制更新模拟账户。
  - **这个项目的用途**: 把行情、模型信号和模拟持仓放在一起观察，便于检查决策过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zadescoxp/jev-trades/) · 许可证: Apache-2.0

- [**jev-linkmap**](https://github.com/stas4000/jev-linkmap) — 该项目抓取网站内容并生成候选内部链接，由 Jev 判断是否值得链接及选择原文中的锚文本，并支持用深模型复核分歧来改写 rubric。
  - **Jev 在哪一步做判断**: Jev对每个候选目标判断是否值得加内链，并从正文已有短语中选择最诚实的锚文本或选无。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/stas4000/jev-linkmap/) · 许可证: 未声明

- [**typesafe-ai-playground**](https://github.com/TypeSafeAI/typesafe-playground) — TypeSafe AI Jev 社区试验场，内置 110 个分类、对话路由、提取与决策实验用例，支持移动端交互与 A/B 对比。
  - **Jev 在哪一步做判断**: 在 Next.js 服务端路由中向 Jev 发起状态与提问负载，实时展示离散判定分布、推理耗时与置信度。
  - **这个项目的用途**: 提供开箱即用的 Web 可视化界面，方便开发者直观调试 Jev 提示词、观察决策原语边界并对比不同模型表现。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bunsdev/typesafe-ai-playground/) · 许可证: MIT

- [**jevernetes**](https://github.com/sunil-sadasivan/jevernetes) — Jevernetes 在终端和本地仪表盘中实时采集 Kubernetes 日志，支持用 Jev 做语义搜索和分析、查看上下文，并把选中的日志证据整理后交给 coding Agent。
  - **Jev 在哪一步做判断**: Jev 对每条日志组判断是否值得调查的重要性、严重度和类别，以及是否匹配用户搜索问题。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sunil-sadasivan/jevernetes/) · 许可证: Apache-2.0

- [**jev\_project\_context**](https://github.com/poiuyjie/jev_project_context) — 科研项目很少死于结果丢失——它们死于\*\*上下文\*\*丢失：那个数字是哪份配置跑出来的、为什么选这个基线、哪些结果已被作废、哪些只是假设。这个 skill 把 AI 智能体（Claude Code、ZCode 及任何兼容 skills 的智能体）变成一个守纪律的实验记录员：10 个操作、受控有效性词表、溯源门、只读审计。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/poiuyjie/jev_project_context/) · 许可证: MIT

- [**jevmory**](https://github.com/romiluz13/jevmory) — jevmory：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/romiluz13/jevmory/) · 许可证: MIT

- [**jevtest**](https://github.com/joshhu/jevtest) — 情緒測謊器：嘴上說「好」，心裡真的好嗎？用 TypeSafe Jev（System One 模型）透過 OpenRouter 即時判斷，並與一般 LLM 對照
  - **Jev 在哪一步做判断**: Jev 判断对方回复背后的真实含义、火气等级以及是否需要马上主动关心。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joshhu/jevtest/) · 许可证: 未声明

- [**ask-jev**](https://github.com/kuhung/ask-jev) — 面向中国大陆年轻人的复古新野蛮主义 (Neo-Brutalism) 生活微决策老管家。专治“买不买”、“花不花”、“用不用”、“中午吃什么”、“去不去”等内耗纠结，直截了当给结论。
  - **Jev 在哪一步做判断**: Jev 对用户的是非纠结、二选一和冲动程度问题做出执行或劝退的最终裁决。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kuhung/ask-jev/) · 许可证: 未声明

- [**jev-2048**](https://github.com/ARCJ137442/jev-2048) — An instrumented 2048 web lab where every move is a Jev (TypeSafe AI System One) Choice, with no heuristic fallback | 用 Jev 决策模型驱动每一步的 2048 网页实验台，概率、置信度、延迟与成本全部摊开可见，且刻意不做启发式兜底
  - **Jev 在哪一步做判断**: Jev 在每回合对上、下、左、右四个方向执行一次 Choice，从中选出最佳移动方向。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/arcj137442/jev-2048/) · 许可证: MIT

- [**JEV-Paper-Radar**](https://github.com/Eliot5566/JEV-Paper-Radar) — 该项目每天早上用 Jev 根据用户以自然语言描述的兴趣为 arXiv 新论文评分，并把入选论文生成网页和 RSS 呈现出来。
  - **Jev 在哪一步做判断**: Jev 对每篇论文的标题摘要针对每个用户兴趣输出校准概率（Noul），并判断论文类型与代码是否发布。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/eliot5566/jev-paper-radar/) · 许可证: MIT

- [**jev-usecases**](https://github.com/kenhuangus/jev-usecases) — jev-usecases：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kenhuangus/jev-usecases/) · 许可证: MIT

- [**jevchess**](https://github.com/choxos/jevchess) — 该项目是让Jev与OpenRouter大模型、Stockfish引擎或人类实时对弈、回放并统计战绩的单页国际象棋应用。
  - **Jev 在哪一步做判断**: Jev在每一手从全部合法走法中以Choice选出最佳着法并以Score给出局面评估。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/choxos/jevchess/) · 许可证: MIT

- [**Jev\_Ontology**](https://github.com/dagfinndybvig/Jev_Ontology) — 该项目用 LLM 编写本体，用 Jev 对客服工单和图书馆图像按本体分类，并用 Jev 的分类结果反馈修订本体。
  - **Jev 在哪一步做判断**: Jev 对每张客服工单执行 Choice 选择，决定其在本体层级中所属的最具体子类。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dagfinndybvig/jev_ontology/) · 许可证: 未声明

- [**jev-trip**](https://github.com/liaoyuhua/jev-trip) — Jev Trip 是一个可解释的单日行程规划器，由 LLM 提出活动草案并由 Jev 筛选候选以及核对交通与行程。
  - **Jev 在哪一步做判断**: Jev 负责筛选候选地点、比较交通方案优劣、回答偏好契合与体验重复等类型化问题并审查行程违规。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/liaoyuhua/jev-trip/) · 许可证: MIT

- [**work-with-jev**](https://github.com/Adkid-Zephyr/work-with-jev) — \*\*工作群消息太多？用 Jev 挑出需要你处理的事，整理成一份跨群待办。\*\*
  - **Jev 在哪一步做判断**: Jev 判断每条工作消息是否与当前用户相关、是否需行动、是否紧急、有无参考价值，并返回概率以分入四类。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/adkid-zephyr/work-with-jev/) · 许可证: MIT

- [**dbt\_jev**](https://github.com/smithclay/dbt_jev) — dbt\_jev：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/smithclay/dbt_jev/) · 许可证: MIT

- [**jev-for-engineers**](https://github.com/Foadsf/jev-for-engineers) — 机械与电气工程的八组 Jev 小实验：分派设计任务、检查仿真日志、匹配零件，再由 Python 规则决定怎么处理。
  - **Jev 在哪一步做判断**: 对工程文本做分类、候选选择与风险判断；尺寸计算和最终处置仍交给普通代码。
  - **这个项目的用途**: 用合成样例看清工程判断如何接入程序；示例阈值需要用自己的数据重测。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/foadsf/jev-for-engineers/) · 许可证: MIT

- [**jev-storyboard-lab**](https://github.com/jimmyliao/jev-storyboard-lab) — jev-storyboard-lab：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jimmyliao/jev-storyboard-lab/) · 许可证: MIT

- [**jev-trading**](https://github.com/EthanAlgoX/jev-trading) — 1. Keep \*\*Demo\*\* selected (\`演示体验\`). 2. Click \*\*Try a decision\*\* (\`体验一次决策\`). 3. Review the action, probabilities, and data quality on the right. 4. Open a record in \*\*Recent analyses\*\* (\`最近分析\`) or select \*\*Export evidence\*\* (\`导出完整依据\`).
  - **Jev 在哪一步做判断**: Jev 根据行情、基本面、新闻与持仓情况在买入/卖出/持有三个动作中做出分类决策并返回概率分布。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ethanalgox/jev-trading/) · 许可证: 未声明

- [**JevEmon**](https://github.com/daniel4x/JevEmon) — JevEmon从宝可梦火红ROM内存读取地图与队伍状态，让Jev在可到达目的地中选择行走目标并指挥野生宝可梦对战，从主角家一路走到常青市。
  - **Jev 在哪一步做判断**: Jev从已验证可达的目的地列表中选择下一站行走目标，遇野怪时再选择出招或换宠。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/daniel4x/jevemon/) · 许可证: GPL-3.0

- [**jevscan**](https://github.com/jevbook/jevscan) — 读取 EVM Token 市场特征，输出关注或回避等风险判断，提供库、CLI 和 MCP 接口。
  - **Jev 在哪一步做判断**: 默认用本地规则计算；配置 TypeSafe key 后才把特征送给 Jev 做结构化判断。
  - **这个项目的用途**: 把行情特征、判断来源和分数放在一起，便于检查风险信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jevbook/jevscan/) · 许可证: MIT

- [**JevSeek**](https://github.com/morcoan/JevSeek) — 本地编码桌面与 CLI 智能体，将 Jev 的动作路由与 DeepSeek 的代码参数生成分层解耦协同。
  - **Jev 在哪一步做判断**: 由 Jev 根据当前工作区状态与用户意图快速判定下一步工具类型，再交由大语言模型补全具体参数。
  - **这个项目的用途**: 结合了 Jev 的毫秒级离散路由能力与生成模型的强代码生成能力，降低端到端思考延迟并节省 Token 消耗。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/morcoan/jevseek/) · 许可证: MIT

- [**jevsume**](https://github.com/unownone/jevsume) — 给简历做一次结构化体检。既检查措辞、结构和机器可读性，也能对照具体职位描述，看这份简历是否匹配。
  - **Jev 在哪一步做判断**: 对提取出的简历文本与职位要求逐项判断和打分，再由 Worker 汇总成页面里的评审结果。
  - **这个项目的用途**: 能保存输入、问题与输出，方便回看每次评审；没有 API key 时运行的是模拟结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/unownone/jevsume/) · 许可证: 未声明

- [**sqlite3-jev**](https://github.com/mattn/sqlite3-jev) — 将 TypeSafe Jev 判断能力下沉为 SQLite 自定义 SQL 函数的 C 语言扩展：直接在 SQL 查询中实现语义打分与选择。
  - **Jev 在哪一步做判断**: 在 SQLite 执行引擎中注册 jev\_choice、jev\_score 等自定义函数，在查询扫描行时直接调用 Jev API。
  - **这个项目的用途**: 无需额外编写业务胶水代码，即可在大规模结构化关系型数据上执行行级语义分类与推理。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mattn/sqlite3-jev/) · 许可证: MIT

- [**cairn-jev-lab**](https://github.com/Cairn-ink/cairn-jev-lab) — 這是一個實驗性的記憶收錄評估工具。輸入原文與候選記憶，Jev 評估證據，程式依據明確規則回傳「保存、略過、待定」。適合讓開發者在交給 agent 自動記憶之前，先測試自己的標準。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cairn-ink/cairn-jev-lab/) · 许可证: MIT

- [**heyreach-jev-bot**](https://github.com/matthew004-web/heyreach-jev-bot) — 该项目使用 Jev 为 HeyReach 中的潜在客户和首条消息变体打分，为每位客户挑选最佳消息，并将结果写回为潜在客户名单和 DRAFT 营销活动。
  - **Jev 在哪一步做判断**: Jev 对每个销售线索的职能匹配、资历、公司匹配、信号相关性和信号类型，以及每条首消息变体的个性化程度和风险项进行打分选择，以预测回复率并为每人挑选最佳变体。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/matthew004-web/heyreach-jev-bot/) · 许可证: 未声明

- [**jev-A-share-trader**](https://github.com/Eric-Zhou-0302/jev-A-share-trader) — \*\*八个分析维度，一份可追溯的判断。\*\*
  - **Jev 在哪一步做判断**: Jev按八个技术维度分别评估短线（2-5日）与波段（5-20日）两个周期的偏多/偏空方向及波动风险。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/eric-zhou-0302/jev-a-share-trader/) · 许可证: MIT

- [**jev-connector**](https://github.com/juanlentino/jev-connector) — jev-connector：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/juanlentino/jev-connector/) · 许可证: GPL-2.0

- [**jev-geo-audit**](https://github.com/stas4000/jev-geo-audit) — 该项目批量抓取300个公开页面并用Jev打分其被AI引用的可能性，同时用大模型法官对比一致性、成本与延迟。
  - **Jev 在哪一步做判断**: Jev 对每个页面做出1个页面类型归属的 choice 决策和8个是否满足可引用性标准的 noul 是非决策。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/stas4000/jev-geo-audit/) · 许可证: MIT

- [**robo-harness**](https://github.com/grmkris/robo-harness) — SO-101 机械臂具身智能控制工作台：整合 Bun/Effect 与 Python 驱动，利用 Jev 做关节动作边界决策与预算控制。
  - **Jev 在哪一步做判断**: 在每一步机器人运动规划中，评估空间坐标与传感器状态，由 Jev 在候选安全区间选择执行步骤。
  - **这个项目的用途**: 将 TypeSafe Jev 的低时延离散决策优势拓展至物理世界机械臂实时控制场景。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/grmkris/robo-harness/) · 许可证: 未声明

- [**tempo-jev-demo**](https://github.com/mychaelangelo/tempo-jev-demo) — 一个本地自然语言任务工作区，可将用户请求转为看板、表格、日历等视图与任务变更，并对比不同模型的表现。
  - **Jev 在哪一步做判断**: Jev 决定如何将自然语言请求转换为工作区视图类型、分组过滤以及任务、日历和清单的具体变更选项。
  - **这个项目的用途**: 保留可编辑的组成部分与决策过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mychaelangelo/tempo-jev-demo/) · 许可证: MIT

- [**jev-drive**](https://github.com/Alpha-Harper-Franklin/jev-drive) — 已实现真实 Jev API 接入、真实 RGB 的视觉推理与对照、过期响应检查、数据分组和指标工具。首轮完成 27 张录制图像的诊断实验，但尚无驾驶结果标签，也未完成 CARLA/BeamNG 闭环实验。首轮结果说明：生成视觉描述的成本不可忽略，不能把 Jev 接口便宜直接等同于整个驾驶系统更快。
  - **Jev 在哪一步做判断**: Jev 根据结构化文本状态决定车辆是继续行驶、补充观察、重新规划还是交回宿主处理。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/alpha-harper-franklin/jev-drive/) · 许可证: MIT

- [**jev-issue-radar**](https://github.com/Patrick-SCH03/jev-issue-radar) — Jev Issue Radar 是一个只读的 GitHub 重复问题分类看板，它检索候选问题并用 Jev 的 Choice 将每对问题判为重复、相关、不同或信息不足，同时并排展示双方原始报告中的选中段落供维护者审查。
  - **Jev 在哪一步做判断**: 对每对原始问题与候选问题判定重复、相关、不同或信息不足，并选择原因类别与双方原文证据行ID。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/patrick-sch03/jev-issue-radar/) · 许可证: MIT

- [**jev-prompt-optimization**](https://github.com/j341nono/jev-prompt-optimization) — 该工具使用带标注数据集，通过 EvoPrompt 或 GEPA 自动优化 TypeSafe Jev Choice 的 instructions 和各 criteria 描述。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/j341nono/jev-prompt-optimization/) · 许可证: MIT

- [**jev-test**](https://github.com/clduab11/jev-test) — jev-test：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/clduab11/jev-test/) · 许可证: MIT

- [**jev-trade**](https://github.com/Waxmell114514/jev-trade) — 把 BTC、ETH 的行情变成文字状态，让 Jev 给交易判断，再放进含延迟和费用的模拟撮合里观察。
  - **Jev 在哪一步做判断**: 代码先计算市场特征；Jev 回答有限的方向与风险问题，本地策略决定模拟仓位。
  - **这个项目的用途**: 把判断、延迟和执行成本放到同一实验记录里比较。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/waxmell114514/jev-trade/) · 许可证: 未声明

- [**jev-wrapped**](https://github.com/gaborishka/jev-wrapped) — 输入公开 Telegram 频道名称即可生成卡片，展示过去十二个月帖子类型、广告、标题党和情绪施压的构成变化，每篇帖子由 Jev 单独判定。
  - **Jev 在哪一步做判断**: Jev 对每篇帖子分别判断内容类型、是否为付费广告、是否标题党以及情绪施压程度。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gaborishka/jev-wrapped/) · 许可证: MIT

- [**jev-writer**](https://github.com/Kaos599/jev-writer) — jev-writer：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kaos599/jev-writer/) · 许可证: MIT

- [**JevTools**](https://github.com/RileyCarney/JevTools) — JevTools：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rileycarney/jevtools/) · 许可证: GPL-3.0

- [**kojev**](https://github.com/ItisNoMatter/kojev) — kojev：评估业务状态，给出供本地规则参考的分类或风险分数。
  - **Jev 在哪一步做判断**: 评估业务状态，给出供本地规则参考的分类或风险分数。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/itisnomatter/kojev/) · 许可证: MIT

- [**leadgenrationaivoiceagent**](https://github.com/sumitrevolt/leadgenrationaivoiceagent) — 营销与语音平台中的 TypeSafe 实验模块，用 Jev 为预设 Agent 角色选择专长标签。
  - **Jev 在哪一步做判断**: 把角色资料与有限专长候选交给 Choice，代码再映射为能力标签。
  - **这个项目的用途**: 提供一个业务角色分类接入示例。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sumitrevolt/leadgenrationaivoiceagent/) · 许可证: MIT

- [**tc39-atlas**](https://github.com/hemanth/tc39-atlas) — 该项目是交互式 TC39 提案语义浏览工具，使用 Jev 按采用路径、认知负担、Web 兼容风险和意图原型对 ECMAScript 提案进行分类展示。
  - **Jev 在哪一步做判断**: Jev 对每个 TC39 提案在采用路径、复杂度、动机、Web 兼容风险和意图原型等维度上执行 Choice 多选、Score 打分和 Noul 门禁判断。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/tc39-atlas/) · 许可证: 未声明

- [**tictacjev**](https://github.com/darthblanc/tictacjev) — 这是一个人类与 Jev 对弈的井字棋应用，Jev 每一步选择的格子及其置信度和候选格概率都会显示在走棋记录中。
  - **Jev 在哪一步做判断**: Jev在每个AI回合从当前空单元格中选择最佳落子位置，并返回置信度和全候选概率分布。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/darthblanc/tictacjev/) · 许可证: 未声明

- [**jev-calculator**](https://github.com/pc418/jev-calculator) — 这是一个由 Jev 逐字选择答案字符并展示每步概率分布的计算器。
  - **Jev 在哪一步做判断**: Jev 在每一步根据算式和已生成前缀，从13个字符选项中决定下一个输出字符。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pc418/jev-calculator/) · 许可证: MIT


## 评测与观测

- [**latitude-llm**](https://github.com/latitude-dev/latitude-llm) — Latitude 的可选 Jev 预分类器为对话检查打分，并记录检查选择的依据。
  - **Jev 在哪一步做判断**: 判断各项检查的适用性，满足阈值与限流条件时补充检查任务。
  - **这个项目的用途**: 记录模型、阈值、调用时间与选择原因，便于对照原流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/latitude-dev/latitude-llm/) · 许可证: MIT

- [**jev-review**](https://github.com/NiazMorshed2007/jev-review) — 供编码 Agent 使用的本地 MCP 代码质量检查器，返回多个维度的结构化评分。
  - **Jev 在哪一步做判断**: Jev 对正确性、复杂度、测试和安全等维度评分，程序汇总优先改进项。
  - **这个项目的用途**: 可比较两次检查的评分变化，代码修改仍由主 Agent 负责。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/niazmorshed2007/jev-review/) · 许可证: MIT

- [**taskuary**](https://github.com/ldbumble/taskuary) — Taskuary 的可选 Jev 判断模块，对任务运行状态检查用户定义的条件。
  - **Jev 在哪一步做判断**: 把条件转成 yes/no 概率问题，按本地阈值返回布尔结果和原始概率。
  - **这个项目的用途**: 可为任务结果增加结构化检查；不是整个消息系统都由 Jev 控制。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ldbumble/taskuary/) · 许可证: MIT

- [**supercov**](https://github.com/supercorp-ai/supercov) — 编程 Agent 的代码质量与覆盖率 CLI：Jev 检查源码属性，本地覆盖率工具帮助选择补测目标。
  - **Jev 在哪一步做判断**: 向 Jev 询问每个文件的质量属性，由程序汇总分数与优先顺序。
  - **这个项目的用途**: 把分数拆成可对照源码的命名属性，并缓存按内容得到的结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/supercorp-ai/supercov/) · 许可证: MIT

- [**Canny**](https://github.com/qkal/Canny) — 为 Claude Code 与 Codex CLI 记录执行账本，检查改动后是否有通过的验证。
  - **Jev 在哪一步做判断**: Jev 可识别完成声明和语义规则问题；阻止结束依赖账本事实与本地规则。
  - **这个项目的用途**: 区分执行证据与模型意见，Jev 不单独决定任务已通过验收。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/qkal/canny/) · 许可证: MIT

- [**goodwatch-monorepo**](https://github.com/alp82/goodwatch-monorepo) — GoodWatch 仓库内的影视特征评分实验，比较 Jev 对情绪、情节等特征的不同问法和批量方式。
  - **Jev 在哪一步做判断**: 对固定影视样本询问特征是否存在或有多明显，记录分数、耗时和 Token。
  - **这个项目的用途**: 便于对照问题尺度、输入内容与批处理设计，检查特征判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/alp82/goodwatch-monorepo/) · 许可证: MIT

- [**typesafe-ai-benchmark**](https://github.com/iammrduncan/typesafe-ai-benchmark) — 在共同的应用任务上对照 Jev 与其他结构化输出模型，记录错误、延迟、Token 与估算成本。
  - **Jev 在哪一步做判断**: 把同一任务转换成 Jev 的 Choice/Noul 问题，并把答案映射到统一的结果格式。
  - **这个项目的用途**: 保留对照方法与结果，方便检查模型差异。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/iammrduncan/typesafe-ai-benchmark/) · 许可证: MIT

- [**jev-playground**](https://github.com/mizchi/jev-playground) — MoonBit 与 TypeScript 的 Jev 实验集，覆盖棋类、浏览器、命令风险和小型语言。
  - **Jev 在哪一步做判断**: 不同实验把候选动作或判断题交给 Jev，再由对应程序执行或记录。
  - **这个项目的用途**: 提供源码、实验记录和部分可离线重放的样例，便于比较决策设计。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mizchi/jev-playground/) · 许可证: 未声明

- [**jev-benchmarks**](https://github.com/AbdelStark/jev-benchmarks) — 把 Jev 和 GLiNER 放到同一批分类题上，除了答对率，也检查概率靠不靠谱。
  - **Jev 在哪一步做判断**: 对固定文本和标签集合做分类，记录每个标签的概率、耗时和失败。
  - **这个项目的用途**: 能看清模型在哪些任务上适合自动处理，在哪些任务上容易过度自信。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abdelstark/jev-benchmarks/) · 许可证: Apache-2.0

- [**typesafe-playground**](https://github.com/kavehmz/typesafe-playground) — 可交互的 Jev 实验集，展示客服工单分流预览和三维驾驶仿真。
  - **Jev 在哪一步做判断**: 给客服消息做多项判断，或根据结构化模拟传感器选择车道与目标速度。
  - **这个项目的用途**: 把输入、概率和后续行为放在界面中对照观察。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kavehmz/typesafe-playground/) · 许可证: 未声明

- [**jevcal**](https://github.com/abhixhek/jevcal) — 用自己的标注数据评估 Jev 概率、选择置信度阈值，并检查模型更新后的变化。
  - **Jev 在哪一步做判断**: 调用决策模型处理固定问题，计算准确率、校准、覆盖率和需要升级处理的比例。
  - **这个项目的用途**: 把阈值选择与模型漂移检查接到报告和 CI 中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abhixhek/jevcal/) · 许可证: MIT

- [**jev-pref**](https://github.com/doeixd/jev-pref) — 把 AGENTS.md 中的项目偏好整理为规则，再用 Jev 检查 hunk、暂存文件或 PR。
  - **Jev 在哪一步做判断**: Jev 判断代码变更是否触及配置规则，程序将答案映射为检查结果。
  - **这个项目的用途**: 可把语义规则反馈给编码 Agent，不能替代类型检查、测试或安全审计。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/doeixd/jev-pref/) · 许可证: MIT

- [**jev-rerank-bench**](https://github.com/anessbelbati/jev-rerank-bench) — 比较 Jev、专用 reranker 和聊天模型对同一批搜索片段的排序结果。
  - **Jev 在哪一步做判断**: 用 Choice、Noul 和分档评分给候选片段排序，再计算检索指标。
  - **这个项目的用途**: 提供原始响应、评分代码和分数据集结果，便于检查比较条件。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/anessbelbati/jev-rerank-bench/) · 许可证: MIT

- [**jev-benchmark**](https://github.com/wondertwins/jev-benchmark) — 通过国际象棋和游戏 NPC 对话对象识别，测试 Jev 的选择与判断边界。
  - **Jev 在哪一步做判断**: 在合法棋步中选择，或分别判断玩家话语是否在对某个 NPC 说。
  - **这个项目的用途**: 公开标注数据、原始请求响应与评测代码。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wondertwins/jev-benchmark/) · 许可证: MIT

- [**jev-lm**](https://github.com/y0usaf/jev-lm) — 把下一个词当选择题，试着用 Jev 拼出句子；也能让它挑选本地草拟的整段续写。
  - **Jev 在哪一步做判断**: Choice 选词，Noul 判断候选续写能否接上以及是否该停止。
  - **这个项目的用途**: 用一套小实验看清决策模型拿来生成文字时会遇到什么问题。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/y0usaf/jev-lm/) · 许可证: MIT

- [**jev-chat**](https://github.com/adhyaay-karnwal/jev-chat) — 实验性聊天解码器：让 Jev 反复选择词或短语，由代码把它们拼成回答。
  - **Jev 在哪一步做判断**: 在有限词表与候选回复中做 Choice，比较逐步解码和整句选择策略。
  - **这个项目的用途**: 提供解码方法、实验轨迹和失败案例供研究。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/adhyaay-karnwal/jev-chat/) · 许可证: MIT

- [**jev-behavior-study**](https://github.com/RINNECODER/jev-behavior-study) — 针对 Jev 1.13.0 的独立行为研究，记录不同问题表述、输入条件及游戏任务下的成功与失败。
  - **Jev 在哪一步做判断**: 向固定任务发送受控变体，保存选择结果、概率和原始请求响应。
  - **这个项目的用途**: 让读者按具体案例查看证据，区分小任务通过与复杂任务能力。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rinnecoder/jev-behavior-study/) · 许可证: MIT

- [**jev-exploration**](https://github.com/SamuelSacco/jev-exploration) — 记录 Jev 能力与限制的研究仓库，包含主张审查、概率校准实验和可运行示例。
  - **Jev 在哪一步做判断**: 用固定问题与标注案例调用 Jev，保存回答并分析错误、校准及不同难度下的表现。
  - **这个项目的用途**: 把研究结论与实验代码、数据和证据账本对应起来。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/samuelsacco/jev-exploration/) · 许可证: 未声明

- [**jev-gomoku**](https://github.com/XieChengYuan/jev-gomoku) — 弈瞬：同时运行九盘 15×15 五子棋，让两位 Jev 玩家比较不同输入信息，并逐手检查请求与返回。
  - **Jev 在哪一步做判断**: 从本地规则生成的候选落点中做 Choice 判断，对比棋盘、战术事实等不同输入。
  - **这个项目的用途**: 支持带明确标记的历史回放和自带密钥的实时对战，保留逐手实验记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/xiechengyuan/jev-gomoku/) · 许可证: 未声明

- [**jev-agent-failure-benchmark**](https://github.com/TokenTrim/jev-agent-failure-benchmark) — 用 Jev 分析多 Agent 失败记录的评测项目，预测责任 Agent、关键步骤和错误类型。
  - **Jev 在哪一步做判断**: 把记录里的 Agent、步骤和错误分类作为选项，提交三组 choice 问题。
  - **这个项目的用途**: 提供评测脚本和作者结果；部分基线生成答案而 Jev 选候选，比较条件不同。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tokentrim/jev-agent-failure-benchmark/) · 许可证: Apache-2.0

- [**jev-frontend-qa**](https://github.com/Nainish-Rai/jev-frontend-qa) — 用 Jev 选择浏览器操作，再通过 DOM、HTTP 和数据库状态检查前端功能是否符合约定。
  - **Jev 在哪一步做判断**: Jev 从已观察的控件和操作中做选择；预期值和通过条件由测试代码判断。
  - **这个项目的用途**: 将模型探索过程与可验证的功能验收分开记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nainish-rai/jev-frontend-qa/) · 许可证: 未声明

- [**ask-jev**](https://github.com/omni-/ask-jev) — Windows PowerShell 工具，在 Codex 中用 :jev 审视会话里已记录的执行证据。
  - **Jev 在哪一步做判断**: 把选定记录交给 Jev，判断执行结论和证据是否充分，输出概率。
  - **这个项目的用途**: 显式触发才读取并发送记录；判断供参考，不替代实际测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/omni-/ask-jev/) · 许可证: MIT

- [**hermes-jev-north-star**](https://github.com/poponline63/hermes-jev-north-star) — Hermes 的目标验收 skill，保存要求、生成运行提示词，并检查证据是否满足要求。
  - **Jev 在哪一步做判断**: 可机器检查的部分运行本地检查，Jev 对其余语义要求判断达成程度。
  - **这个项目的用途**: 把目标与可检查条件放在一起；模型判断不替代真实验收证据。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/poponline63/hermes-jev-north-star/) · 许可证: MIT

- [**jev-eval**](https://github.com/4esv/jev-eval) — 在有标签的分类任务上比较 Jev 与 OpenRouter 模型的准确率、校准、时延和成本。
  - **Jev 在哪一步做判断**: 对相同任务收集模型判断，并计算置信区间及重复输入的稳定性。
  - **这个项目的用途**: 发布数据处理、调用与统计代码，以及特定模型的结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/4esv/jev-eval/) · 许可证: 未声明

- [**jev-flash-review**](https://github.com/TheBous/jev-flash-review) — 供编码 Agent 调用的 MCP 代码审查引擎，对提交的 diff 按规则给出结构化判断。
  - **Jev 在哪一步做判断**: Jev 按规则检查 diff，再从实际 hunk 中选证据位置并复核问题。
  - **这个项目的用途**: 调用方提供 diff 与业务边界；引擎不会自行扫描仓库，评分仍需人工复核。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thebous/jev-flash-review/) · 许可证: 未声明

- [**jev-synergy-screening**](https://github.com/PistachioAIHQ/jev-synergy-screening) — 用 Jev 筛选 ADHD 综述的论文标题和摘要，并与 Cohen Abstract Triage 标注比较。
  - **Jev 在哪一步做判断**: 围绕纳入标准回答 Choice 与 Noul 问题，本地规则组合成 include 或 exclude。
  - **这个项目的用途**: 保留不同数据切片和问法的指标，便于检查漏筛与误筛。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pistachioaihq/jev-synergy-screening/) · 许可证: 未声明

- [**foreman-jev**](https://github.com/Shifty-Eye-Games/foreman-jev) — 给 Codex 工人配一个 Jev 监督员。它评估进展，但完成前还必须跑程序员指定的验收命令。
  - **Jev 在哪一步做判断**: 对工作状态和证据做进展与完成判断，本地运行验收命令并检查源码在验证期间是否变化。
  - **这个项目的用途**: 把模型判断和实际命令结果一并留档，方便检查任务是否真的收尾。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shifty-eye-games/foreman-jev/) · 许可证: MIT

- [**jev-calibration-audit**](https://github.com/jujumilk3/jev-calibration-audit) — 通过公开 API 和数据测试 Jev 概率校准、选项措辞影响及韩文判断表现。
  - **Jev 在哪一步做判断**: 收集 Noul 与 Choice 输出，对照标签计算误差、准确率和稳定性。
  - **这个项目的用途**: 保留逐次调用数据与实验说明，便于检查结论适用范围。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jujumilk3/jev-calibration-audit/) · 许可证: MIT

- [**jev-demos**](https://github.com/Bud-ro/jev-demos) — 用迷宫测试 Jev 的空间判断，比较单步选择和一次预测多步的表现。
  - **Jev 在哪一步做判断**: 让 Jev 从方向候选中选择下一步或后续多步，再检查碰墙、绕路和到达情况。
  - **这个项目的用途**: 保留实验设置和失败结果，便于研究判断边界。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bud-ro/jev-demos/) · 许可证: 未声明


## 游戏与实时决策

- [**kev**](https://github.com/jaredpalmer/kev) — 基于 Qwen2.5-0.5B 构建的轻量级类 Jev 决策头与适配器，支持在 MacBook 本地训练、微调与端到端运行。
  - **Jev 在哪一步做判断**: 在小型基础模型上附加并联判断头，接收状态并直接输出强类型离散问题的概率分布，无需生成冗长文本。
  - **这个项目的用途**: 极度轻量化（仅 0.5B 参数），支持本地纯离线部署与低功耗边缘端决策，为探索专用判断模型提供了开源基座。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jaredpalmer/kev/) · 许可证: Apache-2.0

- [**NanoJev**](https://github.com/TianyuCodings/NanoJev) — Jev 决策模型的纳米级复刻版本，支持并行决策输出、动态候选集与完整的端到端训练评估流水线。
  - **Jev 在哪一步做判断**: 通过前向网络对多个并行问题与动态候选集进行一次性评分，输出归一化置信度并记录游戏环境中的动作路径。
  - **这个项目的用途**: 开源了从数据准备、模型训练到游戏评测的全套流程，为学术界与开源社区研究非生成式离散决策模型提供参考。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tianyucodings/nanojev/) · 许可证: MIT

- [**typesafe-mario**](https://github.com/fhshaik/typesafe-mario) — 从 NES 模拟器 RAM 和状态数据中提取环境，让 Jev 选择超级马力欧的手柄按键。
  - **Jev 在哪一步做判断**: 读取运动、敌人、地形及近期操作状态，从预设合法操作中选一项。
  - **这个项目的用途**: 不用给模型发截图，也能记录每次输入状态和选择结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/fhshaik/typesafe-mario/) · 许可证: 未声明

- [**jevpilot**](https://github.com/standardagents/jevpilot) — 在浏览器里开一辆小车，让 Jev 从提前算好的路线和速度里选下一步。
  - **Jev 在哪一步做判断**: 读取路况、附近车辆和候选轨迹，选择转向与速度；碰撞预测和紧急刹车由代码处理。
  - **这个项目的用途**: 把驾驶判断和物理计算拆开，能直接查看每次选择及其概率。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/standardagents/jevpilot/) · 许可证: 未声明

- [**jev-drone**](https://github.com/RomanSlack/jev-drone) — MuJoCo 无人机仿真实验：从相机缓冲区提取场景，Jev 提供战术动作建议。
  - **Jev 在哪一步做判断**: 根据距离扇区、障碍高度与目标状态选择机动、评估风险和目标丢失状态。
  - **这个项目的用途**: 把战术判断与本地制导、避障和飞控分层。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/RomanSlack/jev-drone/) · 许可证: MIT

- [**laya-vs-jev**](https://github.com/virajbhartiya/laya-vs-jev) — \*\*在 Apple Silicon 上本地运行开放权重的结构化决策模型。\*\*
  - **Jev 在哪一步做判断**: Jev 根据恐龙位置与障碍物状态，在 jump、duck、run 三个动作中选择最佳安全动作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/virajbhartiya/laya-vs-jev/) · 许可证: Apache-2.0

- [**jev-libero**](https://github.com/Dimweaker/jev-libero) — 在 LIBERO 仿真环境中，使用 Jev 分层选择机器人原子动作，结合可逆物理前视完成操作任务。支持 JSON 任务配置，并提供关闭微波炉、关闭抽屉的演示与完整运行记录。
  - **Jev 在哪一步做判断**: Jev 通过串行 Choice 调用选择意图 → 接触/运动方式 → 一个原子输入。引擎先用物理前视评价候选，随后执行 Jev 选中的输入，并根据新状态继续决策。动作集包括平移、旋转、开爪、合爪和保持，共 27 个输入。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dimweaker/jev-libero/) · 许可证: MIT

- [**litjev**](https://github.com/zhengxuyu/litjev) — 将开源大模型转化为 Jev 决策层的开放复现实现，基于 Qwen 等模型直接读取选项 logits 提供 System One 兼容接口。
  - **Jev 在哪一步做判断**: 复刻 Jev 的 /v1/systemone 协议（Choice、Score、Noul），通过本地模型 forward 计算选项 token 的相对概率而非生成文本。
  - **这个项目的用途**: 让开发者可在本地私有部署 Jev 兼容的离散决策服务，摆脱闭源商用 API 依赖并支持 MMLU-Pro 等评测。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zhengxuyu/litjev/) · 许可证: Apache-2.0

- [**RoboJEV**](https://github.com/lykycy123/RoboJEV) — \*\*在 MuJoCo 中，通过两阶段 JEV 控制 Franka Panda 完成三种操作任务。\*\*
  - **Jev 在哪一步做判断**: Jev 根据实测仿真状态先选择任务意图，再为末端执行器选择 X/Y/Z 方向和夹爪开合指令。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lykycy123/robojev/) · 许可证: Apache-2.0

- [**jevk5**](https://github.com/allebee/jevk5) — 该项目是一个开放决策模型，对给定状态返回 noul、choice 和 score 等类型化答案及其概率，并提供让 Jev 与该模型在相同棋盘和问题上直接对比的俄罗斯方块程序。
  - **Jev 在哪一步做判断**: Jev 在每一步 Tetris 落子时，从所有合法摆放描述中以 choice 类型决策选出最佳 placement。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/allebee/jevk5/) · 许可证: Apache-2.0

- [**OneVOneJev**](https://github.com/emrickgarrett/OneVOneJev) — 在浏览器里和 Jev 玩 1v1 射击。它读取结构化战况，选择走位、瞄准和开火。
  - **Jev 在哪一步做判断**: 每个决策 tick 同时询问移动、视角、开镜、开火与跳跃；API 不可用时使用启发式逻辑。
  - **这个项目的用途**: 在持续交互的游戏中观察结构化决策。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/one-v-one-jev/) · 许可证: 未声明

- [**laya-vs-jev-arena**](https://github.com/PromptEngineer48/laya-vs-jev-arena) — 该项目让本地开源 Laya 与 API 驱动的 Jev 在贪吃蛇竞速和格斗对战中同场竞技，每一步动作都由模型实时决策。
  - **Jev 在哪一步做判断**: 在贪吃蛇中决定转向方向与是否冲刺，在格斗中决定移动攻击格挡动作与是否重击。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/promptengineer48/laya-vs-jev-arena/) · 许可证: MIT

- [**tsai-sc**](https://github.com/phyous/tsai-sc) — 让 Jev 操作原版 StarCraft shareware 的 Strongarm 关卡，读取状态与推理时暂停游戏。
  - **Jev 在哪一步做判断**: 从结构化游戏状态中选择命令，再通过鼠标和键盘输入执行。
  - **这个项目的用途**: 作者提供关卡胜利录像与校验报告；这是有限任务实验，不是实时竞技基准。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/phyous/tsai-sc/) · 许可证: MIT

- [**typesafe-snake**](https://github.com/sorrycc/typesafe-snake) — 由 TypeSafe Jev 模型自动操作的贪吃蛇游戏，每 tick 执行一次原子决策，合法移动与物理事实均由本地代码生成。
  - **Jev 在哪一步做判断**: 将当前蛇身坐标、食物位置与合法转向候选组装为状态，由 Jev 选择下一步最佳转向（UP/DOWN/LEFT/RIGHT）。
  - **这个项目的用途**: 验证了 Jev 在离散空间快速做二元/多元选择的单步决策能力，且底层严格杜绝撞墙等非法动作。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sorrycc/typesafe-snake/) · 许可证: 未声明

- [**jev-reflex-autonomy-lab**](https://github.com/khordoo/jev-reflex-autonomy-lab) — jev-reflex-autonomy-lab：Jev 作为 System 1 反射层，为每架无人机从 HOLD、转向、加减速等飞行动作中选择下一个最佳动作。
  - **Jev 在哪一步做判断**: Jev 作为 System 1 反射层，为每架无人机从 HOLD、转向、加减速等飞行动作中选择下一个最佳动作。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/khordoo/jev-reflex-autonomy-lab/) · 许可证: MIT

- [**live-jev**](https://github.com/vinilana/live-jev) — 浏览器里的俯视小车模拟器，用 Jev 选择车道与速度，并可与聊天模型对跑。
  - **Jev 在哪一步做判断**: Jev 批量回答变道、速度、危险程度和行人让行问题，本地规则执行动作。
  - **这个项目的用途**: 同一条种子路线可比较两种控制器；紧急制动另有本地逻辑。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vinilana/live-jev/) · 许可证: 未声明

- [**jev-askable-arm**](https://github.com/TarunTomar122/jev-askable-arm) — 在 ManiSkill 模拟机械臂中，让 Jev 把英文目标拆成一连串预设动作。
  - **Jev 在哪一步做判断**: 根据仿真坐标、夹爪和物体状态，从约三十个动作原语中选择动作及目标。
  - **这个项目的用途**: 将动作选择与 Python 的底层控制分开。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/taruntomar122/jev-askable-arm/) · 许可证: MIT

- [**jev-doom-agent**](https://github.com/lukaske/jev-doom-agent) — 在浏览器里跑两份 Doom 引擎，让 Jev 根据游戏状态选择战术动作。
  - **Jev 在哪一步做判断**: 读取结构化血量、弹药和可见目标，从战术宏中选一项，再交给本地控制器执行。
  - **这个项目的用途**: 能在相同起点对照不同策略，并查看每次模型决策。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lukaske/jev-doom-agent/) · 许可证: 未声明

- [**jev\_deep\_rl**](https://github.com/taodav/jev_deep_rl) — 该项目将 Jev 作为 Gymnasium 和 Atari 环境中的策略，通过游戏专用适配器把观测转换为结构化状态并选择合法动作，同时记录奖励与决策而不训练模型权重。
  - **Jev 在哪一步做判断**: Jev 根据结构化游戏状态通过单个 Choice 问题选择合法的下一步动作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/taodav/jev_deep_rl/) · 许可证: 未声明

- [**jevscape**](https://github.com/Skyvern-AI/jevscape) — RuneBench 的 Jev 扩展，使用 rs-sdk 的有界动作目录驱动 RuneScape 游戏任务。
  - **Jev 在哪一步做判断**: 按游戏状态选择目标动作、当前 tick 干预与下一次询问间隔。
  - **这个项目的用途**: 提供动作分布面板、运行记录和 burst/tick 两种控制方式。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/skyvern-ai/jevscape/) · 许可证: 未声明

- [**heist-one**](https://github.com/AbdelStark/heist-one) — 可观察的浏览器潜行游戏，由 Jev 驱动守卫的强类型状态判断，而确定性代码引擎控制物理世界与移动规律。
  - **Jev 在哪一步做判断**: 在游戏主循环或事件触发时，由 Jev 判定守卫的警觉状态（怀疑、警报、搜寻），并将决策输出实时同步给渲染引擎。
  - **这个项目的用途**: 探索了利用 Jev 作为游戏 NPC 离散决策大脑的可行性，使 AI 行为既具备语义理解力又受确定性游戏规则约束。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abdelstark/heist-one/) · 许可证: MIT

- [**JevBird**](https://github.com/leftspace89/JevBird) — 让 Jev 玩 Python 版 Flappy Bird：程序先模拟路线，再让模型选择。
  - **Jev 在哪一步做判断**: 每遇到新的管道，Jev 从候选路线中选一条，游戏执行该路线的拍翅计划。
  - **这个项目的用途**: 可在画面中查看候选轨迹、概率和最终选择。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/leftspace89/jevbird/) · 许可证: MIT

- [**doom-jev**](https://github.com/AmoghCreator/doom-jev) — 让 Jev 玩 Doom：看结构化战况，决定往哪走、瞄谁和什么时候开火。
  - **Jev 在哪一步做判断**: 选择宏观目标、敌人、移动、转向、跳跃与开火；几何逻辑接手细微瞄准。
  - **这个项目的用途**: 把游戏运行和网络推理分开，不必每一帧都等待模型。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/amoghcreator/doom-jev/) · 许可证: 未声明

- [**jev\_vampire\_survivors**](https://github.com/oldmoldycake/jev_vampire_survivors) — 该项目让 Jev 模型通过 BepInEx 插件和 Python 大脑在原生 Linux 版 Steam 游戏 Vampire Survivors 中选择角色、关卡、升级和移动方向，并通过浏览器仪表盘实时展示决策。
  - **Jev 在哪一步做判断**: Jev根据实时游戏状态决定所选角色、关卡、每次升级选项和每秒四次的行走方向。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/oldmoldycake/jev_vampire_survivors/) · 许可证: MIT

- [**jev-little-airways**](https://github.com/lbotinelly/jev-little-airways) — 小岛机场模拟器，让 Jev 判断飞机航路、避让、紧急广播与降落顺序。
  - **Jev 在哪一步做判断**: 把飞机和周边交通状态转为问题，Jev 的回答驱动模拟器动作。
  - **这个项目的用途**: 可查看请求、回答与模拟状态；仓库也提供 mock 路径。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lbotinelly/jev-little-airways/) · 许可证: MIT

- [**jev-arena-nanojev**](https://github.com/liao96312/jev-arena-nanojev) — 完全本地的 NanoJev 网格决策游戏实验场，支持中文 Pygame、多关卡与 GTX 1660S 训练
  - **Jev 在哪一步做判断**: 显式切换到 Jev API 代理后，由 Jev 对当前局面的合法候选动作进行评估打分并选择移动、攻击、射击等战术动作。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/liao96312/jev-arena-nanojev/) · 许可证: 未声明

- [**jev-robotics-demo**](https://github.com/FazalAAli/jev-robotics-demo) — MuJoCo 机械臂叠方块演示：程序提出候选动作，Jev 选择目标、抓放和是否完成。
  - **Jev 在哪一步做判断**: 在候选目标、是否抓放、任务是否完成之间做 Choice 和 Noul。
  - **这个项目的用途**: 动作候选在本地物理副本里生成，选择交给 Jev；作者对照数字未经本站复测。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/fazalaali/jev-robotics-demo/) · 许可证: MIT

- [**soupbase**](https://github.com/spoonnotfound/soupbase) — 汤底 Soupbase 是中英文海龟汤游戏，由 Jev 判定玩家提问和还原内容；应用代码校验结构化结果与置信度，决定是否通关。支持私有创作、链接分享和自行部署。
  - **Jev 在哪一步做判断**: 两类判断均使用 Choice；没有使用 Score 或 Noul。提示与主动揭晓读取已保存内容，不依赖模型生成。这里选择游戏分类，不主张高频性能，也不声明未经测量的速度、成本或准确率。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/spoonnotfound/soupbase/) · 许可证: MIT

- [**jev-flappy-bird**](https://github.com/hosseintoussi/jev-flappy-bird) — jev-flappy-bird：读取当前状态，在可用动作中做选择。
  - **Jev 在哪一步做判断**: 读取当前状态，在可用动作中做选择。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hosseintoussi/jev-flappy-bird/) · 许可证: MIT

- [**jev-gamepilot**](https://github.com/newuser7171/jev-gamepilot) — 该项目是基于 Laya 和 TypeSafe Jev System One 的自主游戏 Agent，可捕获游戏画面并在 Windows PC 游戏和 Android 手机游戏上执行操作。
  - **Jev 在哪一步做判断**: Jev根据障碍物类型与距离选择跳跃、低头或正常奔跑，并评估碰撞威胁等级与是否需要空中快速下落。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/newuser7171/jev-gamepilot/) · 许可证: 未声明

- [**jevtown**](https://github.com/gaborishka/jevtown) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: Jev 为每个 AI 人格决定对帖子的具体反应（滑过、点赞、转发、屏蔽、购买等）及曝光与追问的概率。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gaborishka/jevtown/) · 许可证: MIT

- [**jev-broadcast-lab**](https://github.com/4anti/jev-broadcast-lab) — 一个以国际象棋为主的 Jev 实验台，也能试工单分类、文档匹配和审核。
  - **Jev 在哪一步做判断**: 从 chess.js 算出的合法走法中选择一步；Stockfish 分数只给操作者看。
  - **这个项目的用途**: 可以同时观察模型选步和本地棋力评估，检查两者的差别。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/4anti/jev-broadcast-lab/) · 许可证: 未声明

- [**jev-chess**](https://github.com/hemanth/jev-chess) — 该项目使用 TypeSafe AI System One 的 Choice、Score 和 Noul 原语，将自然语言走棋意图解析为合法走法，并提供局面评估、历史棋手风格对手和整局对局分类。
  - **Jev 在哪一步做判断**: Jev 负责将自然语言走棋意图解析为合法走法，并对走法的锐度、战略主题、王翼攻击风险和棋风人格维度进行打分与选择。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/jev-chess/) · 许可证: 未声明

- [**jev-flappy-bird**](https://github.com/jaibhasin/jev-flappy-bird) — 该项目是一个浏览器 Flappy Bird 游戏，包含人类模式和由 Jev 选择 flap 或 wait 动作的物理模式。
  - **Jev 在哪一步做判断**: Jev 从多个候选12步 flap/wait 动作序列中选择最可能保持存活并通过下一个管道的一个序列。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jaibhasin/jev-flappy-bird/) · 许可证: 未声明

- [**jev-gpt**](https://github.com/florian-hoenicke/jev-gpt) — 用级联 Choice 把 Jev 当成逐词分类器，在词树上逐层选出下一个词。
  - **Jev 在哪一步做判断**: POST \`/v1/systemone\`，\`jev-latest\`，每层一个 \`type: choice\` 问题。
  - **这个项目的用途**: 展示 Jev 不生成长文时如何拼出短句；仓库没有 LICENSE 文件。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/florian-hoenicke/jev-gpt/) · 许可证: 未声明

- [**jev-market-reflex**](https://github.com/zzsong1023/jev-market-reflex) — 该项目将实时加密货币市场数据输入 Jev，生成类型化的买入/卖出/持有决策并应用于模拟纸面投资组合。
  - **Jev 在哪一步做判断**: Jev根据每个交易对的实时盘口与动量特征，在BUY/SELL/HOLD中做出带置信度和概率的短周期纸交易选择。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zzsong1023/jev-market-reflex/) · 许可证: MIT

- [**jev-play-ping-pong**](https://github.com/Icohen007/jev-play-ping-pong) — 让 Jev 在浏览器乒乓球游戏中选择发球方向、回球角度和力度。
  - **Jev 在哪一步做判断**: 读取球台结构化遥测，通过 Choice 选择接触方向与击球节奏，再由代码执行输入。
  - **这个项目的用途**: 保留动作、时延与对局记录，便于复查一次游戏过程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/icohen007/jev-play-ping-pong/) · 许可证: MIT

- [**jev-rl**](https://github.com/Bring-AI/jev-rl) — \*\*JEV Reinforcement Learning\*\* · 让 JEV 当裁判，让强化学习智能体学会玩游戏。
  - **Jev 在哪一步做判断**: JEV 对每一次游戏状态转移按6级标准打分，决定Agent该步获得的奖励值。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bring-ai/jev-rl/) · 许可证: MIT

- [**jevarena**](https://github.com/raihankhan-rk/jevarena) — 两个 Jev Agent 在并排的浏览器 Snake 游戏里对战，观众可以查看每步方向选择。
  - **Jev 在哪一步做判断**: 根据结构化棋盘状态，从当前允许的方向按钮中选择点击目标。
  - **这个项目的用途**: 把候选按钮、操作概率和游戏进展一起显示。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/raihankhan-rk/jevarena/) · 许可证: MIT

- [**mk-jev-fly-brain**](https://github.com/lavallee/mk-jev-fly-brain) — 在 mk.js 格斗游戏中比较果蝇连接组脉冲仿真、Jev 和规则策略。
  - **Jev 在哪一步做判断**: Jev 读取格斗状态，从与其他控制器相同的七个动作中选择下一步。
  - **这个项目的用途**: 用不同控制组、对局档案和实验说明比较各部分贡献。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lavallee/mk-jev-fly-brain/) · 许可证: MIT

- [**tsai-civ2**](https://github.com/phyous/tsai-civ2) — Jev 玩原版《文明 II》实验框架：在浏览器中运行经典游戏引擎，实时输出各行动的概率分布并做出决策。
  - **Jev 在哪一步做判断**: 每回合读取游戏地图与单位状态，由 Jev 评估城市建造、科技研发、外交姿态与行动走位。
  - **这个项目的用途**: 探索 Jev 实时概率分布在复杂策略博弈与长期规划环境下的落地表现。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/phyous/tsai-civ2/) · 许可证: 未声明

- [**can-jev-bayes**](https://github.com/TomRichner/can-jev-bayes) — 该项目在多臂老虎机任务上评估 Jev 的序列决策，并测试贝叶斯统计信息和决策建议能否改善其选择。
  - **Jev 在哪一步做判断**: Jev根据各臂的历史收益和贝叶斯后验统计决定下一轮选择哪一臂或预测最优臂概率。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tomrichner/can-jev-bayes/) · 许可证: Apache-2.0

- [**jev-clash-royale-test**](https://github.com/JanDalhuysen/jev-clash-royale-test) — Clash Royale 风格沙盒里，Jev 在一次请求中决定是否出牌、出哪张、哪条路和站位深度。
  - **Jev 在哪一步做判断**: \`should\_play\` Noul 加上手牌 Choice、路线 Choice 和站位 Choice，一次 \`systemOne\`。
  - **这个项目的用途**: 把出牌选择做成可检查的概率；package.json 写 ISC，仓库没有 LICENSE 文件。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jandalhuysen/jev-clash-royale-test/) · 许可证: 未声明

- [**jev-factorio-agent**](https://github.com/CompleteDotTech/jev-factorio-agent) — 这是一个由 Jev 驱动的 Factorio Agent，Jev 负责目标和下一步行动等快速宏观决策，确定性代码负责游戏规则、选项过滤与执行。
  - **Jev 在哪一步做判断**: Jev 负责快速宏观决策，包括目标选择、下一步行动和卡住检测。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/completedottech/jev-factorio-agent/) · 许可证: MIT

- [**jev-practice-speed**](https://github.com/tubone24/jev-practice-speed) — 这是一个 WebGL 卡牌游戏 Speed，玩家与以 Jev 为大脑的 CPU 对战，并实时显示 Jev 的决策速度和判断准确率。
  - **Jev 在哪一步做判断**: Jev 判断每种手牌×牌堆组合能否合法叠放并选出当前最优出牌，同时对局面压力打分。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tubone24/jev-practice-speed/) · 许可证: 未声明

- [**jev-synthetic-survey**](https://github.com/jjd-lab/jev-synthetic-survey) — jev-synthetic-survey：读取当前状态，在可用动作中做选择。
  - **Jev 在哪一步做判断**: 读取当前状态，在可用动作中做选择。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jjd-lab/jev-synthetic-survey/) · 许可证: MIT

- [**jev-table-tennis**](https://github.com/LiuHao-1443/jev-table-tennis) — 一句话：\*\*这是一台用来观察一个决策模型「自己会不会打球」的仪器，顺便很好玩。\*\*
  - **Jev 在哪一步做判断**: Jev 根据球的位置速度文本决定球到达右侧挡板时中心 y 应在哪个区间（即挡板目标位置）。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/liuhao-1443/jev-table-tennis/) · 许可证: MIT

- [**snake-jev**](https://github.com/siroccomask/snake-jev) — Jev 并行概率驱动的贪吃蛇实时游戏控制：在每个游戏 Tick 仅需一次并发 API 调用即可选出最佳转向。
  - **Jev 在哪一步做判断**: 实时扫描蛇头四周障碍与食物方位，由 Jev 同时对上下左右四个方向输出存活与逼近概率。
  - **这个项目的用途**: 验证了 Jev 在高频、确定性帧率要求下的并发低时延决策表现。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/siroccomask/snake-jev/) · 许可证: MIT

- [**typesafe-jev-traffic-demo**](https://github.com/trycatchkamal/typesafe-jev-traffic-demo) — 该项目轮询观塘绕道与启福道交叉口的实时交通传感器数据，交由 Jev 判断信号相位优先级，并用本地状态机执行信号切换，在本地仪表盘上展示决策过程。
  - **Jev 在哪一步做判断**: 读取当前状态，在可用动作中做选择。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/trycatchkamal/typesafe-jev-traffic-demo/) · 许可证: 未声明

- [**jev-experiments**](https://github.com/mittal-parth/jev-experiments) — 让 Jev 玩 Chrome 小恐龙和本地射击竞技场，Python 根据结构化判断执行动作。
  - **Jev 在哪一步做判断**: 从游戏状态中判断跳跃、蹲伏、移动、瞄准和开火，执行器应用本地规则。
  - **这个项目的用途**: 把状态、模型答案和执行动作在检查界面中对照查看。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mittal-parth/jev-experiments/) · 许可证: 未声明


## MCP 与集成

- [**vellum-assistant**](https://github.com/vellum-ai/vellum-assistant) — Vellum Assistant 中的可选 Jev provider，可把会话状态与明确的问题交给 TypeSafe。
  - **Jev 在哪一步做判断**: 将状态和问题包发送到 System One，再把结构化答案返回给 Assistant。
  - **这个项目的用途**: 在已有助手中接入选择、概率和评分判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vellum-ai/vellum-assistant/) · 许可证: MIT

- [**jev-mcp**](https://github.com/jkudish/jev-mcp) — 给 Agent 提供核对引用、筛查内容、查找、重排、分类、比较和提取等八个 MCP 判断工具。
  - **Jev 在哪一步做判断**: 用 Choice、Noul 等问题评估证据支持、内容风险和候选相关性。
  - **这个项目的用途**: 把判断结果和概率交回调用方，由调用方执行阈值与拦截策略。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-mcp/) · 许可证: MIT

- [**typesafe-mcp**](https://github.com/itsmostafa/typesafe-mcp) — 让 Claude Code、Claude Desktop、Codex 和 Pi 通过 MCP 或扩展向 Jev 提问，获取结构化判断。
  - **Jev 在哪一步做判断**: 把状态和 Choice、Score、Noul 问题交给 Jev，返回答案与概率。
  - **这个项目的用途**: 让调用方能检查回答，再直接接到自己的分支判断中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typesafe-mcp/) · 许可证: MIT

- [**pi-jev**](https://github.com/TheoOliveira/pi-jev) — 为 Pi Agent 按任务寻找工具与技能，并提供结构化判断和可选的历史筛选。
  - **Jev 在哪一步做判断**: 判断候选工具、技能和历史记录与当前任务的相关性，供本地规则决定加载或保留。
  - **这个项目的用途**: 让能力按需进入 Agent 工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/theooliveira/pi-jev/) · 许可证: MIT

- [**pi-typesafe**](https://github.com/DevMortimer/pi-typesafe) — Pi 的 Jev 扩展，提供判断工具、终端试验命令和供其他扩展复用的 API。
  - **Jev 在哪一步做判断**: 通过共享客户端批量提交判断题，验证响应并记录用量与可用性。
  - **这个项目的用途**: 统一密钥与客户端管理，其他扩展可复用同一决策接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devmortimer/pi-typesafe/) · 许可证: MIT

- [**Jevbridge**](https://github.com/gamesonrblx/Jevbridge) — 通过 ACP、MCP 和命令行，把 Jev 或普通模型接成同一套结构化判断接口。
  - **Jev 在哪一步做判断**: 将状态和有界问题发送给选定后端，统一解析结果，并支持离线规则后端。
  - **这个项目的用途**: 让 Agent 在共同接口下比较或替换判断后端。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gamesonrblx/jevbridge/) · 许可证: MIT

- [**synkora-ai**](https://github.com/getsynkora/synkora-ai) — Synkora Agent 平台内置可选 TypeSafe 客户端与工具，用于分类、评分和是非判断。
  - **Jev 在哪一步做判断**: 把工作流状态和命名问题发送给 Jev，并将结构化答案交还 Agent。
  - **这个项目的用途**: 让现有平台工作流调用同一组判断能力。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/getsynkora/synkora-ai/) · 许可证: MIT

- [**plasmallm**](https://github.com/joshuaeroman/plasmallm) — KDE Plasma 桌面助手中的 Jev Decisions 适配器，在部件里显示结构化判断结果。
  - **Jev 在哪一步做判断**: 把当前消息转换为决策问题，通过 TypeSafe 或兼容 Decisions 端点取得回答。
  - **这个项目的用途**: 在已有桌面助手界面里试用决策模型。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joshuaeroman/plasmallm/) · 许可证: GPL-2.0

- [**jev-mcp**](https://github.com/blakestone-x/jev-mcp) — 把 Jev 的分类、打分、是非判断和候选匹配封装为 MCP 工具。
  - **Jev 在哪一步做判断**: MCP 服务器调用 TypeSafe SDK，返回选项、概率与结构化评分。
  - **这个项目的用途**: 让支持 MCP 的客户端复用同一套判断接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/blakestone-x/jev-mcp/) · 许可证: MIT

- [**jevwire**](https://github.com/Brainwires/jevwire) — 为 Agent 提供 Jev 的 MCP 工具、嵌入式库和 Claude Code hooks。
  - **Jev 在哪一步做判断**: 把排序、核验、动作检查和下一步选择交给 Jev，代码解释回答并应用策略。
  - **这个项目的用途**: 同一决策模块可从 MCP 或宿主程序调用，hooks 行为依具体配置。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/brainwires/jevwire/) · 许可证: MIT

- [**jev-mcp**](https://github.com/rashedInt32/jev-mcp) — 把 Jev 分类、评分、是非判断和批量提问封装成 MCP 工具，也提供 Claude Code 插件。
  - **Jev 在哪一步做判断**: 使用 Choice、Score、Noul 调用 TypeSafe 并返回结构化答案。
  - **这个项目的用途**: 让 MCP 客户端直接使用这些判断类型。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rashedint32/jev-mcp/) · 许可证: MIT

- [**jev-as-quant**](https://github.com/jiayylu/jev-as-quant) — \*\*把 System-1 决策模型（Laya / Jev）当作量化系统里的"判断层"，并和 Claude（System 2）组合使用。\*\* 从需求分析、任务判断、架构设计、代码实现到模拟实验的完整项目，结论好的坏的都报告。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jiayylu/jev-as-quant/) · 许可证: Apache-2.0

- [**jev-classifier**](https://github.com/felpsdev/jev-classifier) — 连接编码 Agent 的本地 Jev 工具路由网关，同时提供 MCP 建议接口。
  - **Jev 在哪一步做判断**: Jev 从当前工具候选中选下一步；不同适配器可记录建议或影响实际工具选择。
  - **这个项目的用途**: 保留决策日志，部分客户端仅观察或自行决定是否采纳。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/felpsdev/jev-classifier/) · 许可证: MIT

- [**jev-codex-plugin**](https://github.com/integrate-your-mind/jev-codex-plugin) — 该 Codex 插件提供 Jev 决策咨询、失败命令诊断和基于证据的完成情况检查功能。
  - **Jev 在哪一步做判断**: Jev 比较可用候选项并选出最优工具/模型/策略，或对失败原因与完成证据给出分类评估。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/integrate-your-mind/jev-codex-plugin/) · 许可证: MIT

- [**jev-skill-router**](https://github.com/himomohi/jev-skill-router) — jev-skill-router：通过工具接口提供选择、评分或概率判断。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/himomohi/jev-skill-router/) · 许可证: MIT

- [**jev-mcp**](https://github.com/BYK/jev-mcp) — 以评测为重点的 Jev MCP 服务，可单次提问、批量处理并比较问题和阈值。
  - **Jev 在哪一步做判断**: 对状态运行 Choice、Score、Noul，再用标注样本计算准确率与校准等指标。
  - **这个项目的用途**: 让问题设计与阈值选择有可检查的样本结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/byk/jev-mcp/) · 许可证: MIT

- [**jev-mcp**](https://github.com/rajasekharponakala/jev-mcp) — 该项目是封装 Jev 模型的 MCP 服务器，为 Agent 提供类型化的 noul 判断、多选和评分结果。
  - **Jev 在哪一步做判断**: 对输入的 state 内容执行 noul 二值判断、choice 多选分类或 score 等级评分的类型化决策。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rajasekharponakala/jev-mcp/) · 许可证: AGPL-3.0

- [**jev-mcp**](https://github.com/Songokou1983/jev-mcp) — 本地 MCP server，把 TypeSafe Jev（System One 决策模型）暴露成 Claude Code / Codex 等 MCP 客户端的原生 tool。
  - **Jev 在哪一步做判断**: Jev 负责执行推理链上的高频小决策，包括分类、是否校验、评分和批量判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/songokou1983/jev-mcp/) · 许可证: 未声明

- [**jev-mcp-server**](https://github.com/wangkuangkuang/jev-mcp-server) — Jev 官方三种问题类型（choice/score/noul）的 Python MCP 服务器，外加批量 classify 与一键写入 5 家 agent 客户端配置的安装器，附实测延迟与成本数据。
  - **Jev 在哪一步做判断**: Jev 对 choice 多选一、score 等级打分、noul 二元判断及批量 classify 请求返回校准概率与置信度完成决策。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wangkuangkuang/jev-mcp-server/) · 许可证: MIT

- [**jev-mcp-spring**](https://github.com/Ashfaqbs/jev-mcp-spring) — 该项目是基于 Java/Spring Boot 的 MCP server，通过 HTTP 将 TypeSafe Jev 封装为可供 MCP 客户端调用的类型化判断工具。
  - **Jev 在哪一步做判断**: Jev 对输入状态执行标签分类、有序打分、是否校验以及合并前声明核验与风险评估并返回结构化判定。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ashfaqbs/jev-mcp-spring/) · 许可证: Apache-2.0

- [**jev-rust-review**](https://github.com/kindintelligence/jev-rust-review) — 这是一个为 Claude Code 提供的 Rust 代码审查插件，用 MCP 服务器运行 rustc、Clippy 与 cargo-semver-checks 并结合 Jev 对变更代码做语义审查。
  - **Jev 在哪一步做判断**: Jev 对每个变更单元回答类型化问题，完成分流标记和缺陷验证（是否成立、严重程度、是否值得报告）。
  - **这个项目的用途**: 把下一步调查集中到更相关的证据上。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kindintelligence/jev-rust-review/) · 许可证: MIT

- [**jev-workbench**](https://github.com/molis-ai/jev-workbench) — 在本地网页定义、试跑与发布 Jev 判断函数，供后端和 Agent 调用固定版本。
  - **Jev 在哪一步做判断**: 把分类、证据判断等条件定义为 Noul、Choice 或 Score 问题后调用 TypeSafe。
  - **这个项目的用途**: 让多个调用方复用同一个有版本的判断函数。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/molis-ai/jev-workbench/) · 许可证: MIT

- [**n8n-nodes-jev**](https://github.com/rahulthakore16/n8n-nodes-jev) — 该 n8n 社区节点将文本或 JSON 状态发送给 Jev，通过 Choice、Score 和 Noul 操作返回带概率和置信度的类型化决策，并保留原始输入、模型版本、Token 用量和延迟以供工作流使用。
  - **Jev 在哪一步做判断**: Jev 将工单、邮件等输入状态转换为 Choice分类、Score评分和Noul是否概率等类型化决策供工作流路由使用。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rahulthakore16/n8n-nodes-jev/) · 许可证: MIT

- [**n8n-nodes-typesafe-jev**](https://github.com/n3ndor/n8n-nodes-typesafe-jev) — n8n 的社区 TypeSafe Jev 节点，让工作流提交结构化判断题。
  - **Jev 在哪一步做判断**: 从输入 item 构造状态和问题，调用 Jev，再附加或单独输出答案。
  - **这个项目的用途**: 可用表单或 JSON 配置问题，也可把节点作为 Agent 工具。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/n3ndor/n8n-nodes-typesafe-jev/) · 许可证: MIT

- [**tenbin**](https://github.com/simota/tenbin) — 一套供编程 Agent 设计 Jev 判断流程的文档、MCP server 和 Skill，支持问题检查、批量评估与阈值校准。
  - **Jev 在哪一步做判断**: 调用 Choice、Score、Noul 处理样本，并把评估结果用于本地阈值设计。
  - **这个项目的用途**: 让问题设计、样本测量和运行时规则有对应关系。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/simota/tenbin/) · 许可证: MIT

- [**typesafe-jev-mcp**](https://github.com/anasbekheit/typesafe-jev-mcp) — 该仓库是为 TypeSafe 的 Jev 模型提供服务的 MCP server，只暴露一个 evaluate 工具，用于接收 state 和类型化问题并返回带概率的 noul、choice 或 score 答案。
  - **Jev 在哪一步做判断**: Jev 根据输入的 state 对 noul、choice、score 类型的结构化问题进行评估并返回带概率的决策结果。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/anasbekheit/typesafe-jev-mcp/) · 许可证: MIT

- [**typesafe-jev-opencode**](https://github.com/moisesfilho/typesafe-jev-opencode) — typesafe-jev-opencode 把 Jev 的结构化判断做成 Agent 可调用的工具。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/moisesfilho/typesafe-jev-opencode/) · 许可证: MIT

- [**jev\_ampcode**](https://github.com/thesammykins/jev_ampcode) — 给 Amp 的方案比较插件：只比较已经提供的选项、证据和偏好。
  - **Jev 在哪一步做判断**: 用 Jev Choice 比较有限候选，并返回概率和可供人工继续处理的结果。
  - **这个项目的用途**: 让方案比较保留明确的候选与输入依据。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thesammykins/jev_ampcode/) · 许可证: 未声明

- [**jev-agent-kit**](https://github.com/walidboulanouar/jev-agent-kit) — jev-agent-kit：通过工具接口提供选择、评分或概率判断。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/walidboulanouar/jev-agent-kit/) · 许可证: MIT

- [**jev-agent-toolkit**](https://github.com/reiswaffel78/jev-agent-toolkit) — 该仓库提供便携式 Agent Skill，教编码 Agent 将 Jev 用作有界判断层，并附带可选 MCP 桥及面向代码、浏览器研究、Blender 和 Unreal Engine 的工作流。
  - **Jev 在哪一步做判断**: Jev 对工单的子系统归属、严重程度及退款与安全意图进行有界语义判断并返回校准概率。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reiswaffel78/jev-agent-toolkit/) · 许可证: MIT

- [**jev-eyes**](https://github.com/LeddoEngano/jev-eyes) — jev-eyes 在本地把图片转成 Jev 可决策的文字和布局状态，并提供 CLI、MCP server 和 Agent skill。
  - **Jev 在哪一步做判断**: Jev基于OCR文本与空间布局构成的state判断图像内容属性以及是否需要升级到视觉模型。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/leddoengano/jev-eyes/) · 许可证: MIT

- [**jev-in-mcp**](https://github.com/chy4pro/jev-in-mcp) — jev-in-mcp：通过工具接口提供选择、评分或概率判断。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chy4pro/jev-in-mcp/) · 许可证: MIT

- [**jev-mcp**](https://github.com/CodeIA-Academy/jev-mcp) — 该项目是一个无依赖的本地 MCP 服务器，将 Jev 作为 ask\_jev 和 list\_jev\_models 工具提供给 Agent 使用。
  - **Jev 在哪一步做判断**: Jev 根据传入的 state 对 choice/score/noul 类型问题返回带概率和置信度的分类、评分或真值判断，供代理决定路由与后续动作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/codeia-academy/jev-mcp/) · 许可证: MIT

- [**jev-mcp**](https://github.com/ieee0824/jev-mcp) — サーバー自身はリポジトリのファイルを読んだり、実行履歴を収集したり、ツールを実行したりしません。判断材料と有限個の候補は呼び出し側が用意します。Jevは自由文のplannerやコマンド生成器として使いません。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ieee0824/jev-mcp/) · 许可证: 未声明

- [**jev-review-mcp**](https://github.com/jiawei686/jev-review-mcp) — 将 git diff 转化为一个\*\*有类型的决策\*\* —— 无需冗长文本，宿主 agent 也无需了解任何 Jev API。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jiawei686/jev-review-mcp/) · 许可证: MIT

- [**jev-routing**](https://github.com/nekowasabi/jev-routing) — jev-routing：通过工具接口提供选择、评分或概率判断。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nekowasabi/jev-routing/) · 许可证: MIT

- [**jev-screen-mcp**](https://github.com/jiawei686/jev-screen-mcp) — 将文本转化为一个\*\*有类型的决策\*\* —— 无需冗长文本，宿主 agent 也无需了解任何 Jev API。
  - **Jev 在哪一步做判断**: 通过工具接口提供选择、评分或概率判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jiawei686/jev-screen-mcp/) · 许可证: MIT

- [**jev-toolkit**](https://github.com/jbt95/jev-toolkit) — 该仓库为 TypeSafe/Jev 提供一个基于 stdio 的 MCP 服务器，包含判断、排序和验证工具，并将调用记录在本地事件日志中。
  - **Jev 在哪一步做判断**: Jev 根据调用方提供的状态对 choice/score/noul 问题作出结构化判断，以支撑 ask、rank 与 verify 三类工具决策。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jbt95/jev-toolkit/) · 许可证: MIT

- [**mcp-server-jev**](https://github.com/MattiooFR/mcp-server-jev) — 该项目为 Codex、Claude 等 MCP 客户端提供 jev\_evaluate 工具，使用 Jev 对提供的文本进行分类、判断和打分。
  - **Jev 在哪一步做判断**: 对调用方提供的 state 内容执行 noul 二值判断、choice 分类选择和 score 等级评分的类型化决策。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mattioofr/mcp-server-jev/) · 许可证: MIT

- [**openclaw-typesafe-ai**](https://github.com/Olli0103/openclaw-typesafe-ai) — OpenClaw 的独立社区插件，只注册一个需显式调用的 typesafe\_decide 工具。
  - **Jev 在哪一步做判断**: 把调用者提供的状态和问题发到 TypeSafe，返回 Jev 结构化决策。
  - **这个项目的用途**: 不注册聊天 provider、自动 hooks 或后台服务，也不是抓取或验证码处理插件。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/olli0103/openclaw-typesafe-ai/) · 许可证: MIT

- [**openrouter-jev-mcp**](https://github.com/ctmx/openrouter-jev-mcp) — 该项目是通过 OpenRouter 提供 Jev Choice、Score 和 Noul 类型化决策的 Python 网关和 MCP 服务器，供编码 Agent 调用。
  - **Jev 在哪一步做判断**: Jev 对代码 diff 状态执行根因多选一分类、安全风险连续打分和是否可上线的二元门禁判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ctmx/openrouter-jev-mcp/) · 许可证: MIT


## 模型路由与降本

- [**litellm**](https://github.com/BerriAI/litellm) — LiteLLM 的复杂度路由器可选用 Jev 判断请求应交给哪个模型档位。
  - **Jev 在哪一步做判断**: 将请求映射到预设复杂度类别，再由 LiteLLM 路由策略选择后端。
  - **这个项目的用途**: 让模型分流使用可检查的复杂度判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/berriai/litellm/) · 许可证: 未声明

- [**oh-my-pi**](https://github.com/can1357/oh-my-pi) — Oh My Pi 编程 Agent 内含可选的 TypeSafe 判断提供器，供小型决策流程调用。
  - **Jev 在哪一步做判断**: 将 Agent 的状态与有界问题发送给 Jev，并解析结构化回答。
  - **这个项目的用途**: 在现有 Agent 流程里接入可替换的判断提供器。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/can1357/oh-my-pi/) · 许可证: MIT

- [**jev-model-router**](https://github.com/davila7/claude-code-templates) — claude-code-templates 社区仓库中的 Jev 路由模组，为 Claude Code 子 Agent 建议模型与思考档位。
  - **Jev 在哪一步做判断**: 评估任务级别、推理需求和生产风险，由本地策略映射成调用配置。
  - **这个项目的用途**: 把模型选择规则单独配置，便于核对每次路由原因。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/davila7/claude-code-templates/) · 许可证: MIT

- [**openchamber**](https://github.com/openchamber/openchamber) — OpenChamber 可选开启自动模型路由：Jev 看消息属于哪类任务，再使用该类绑定的模型和思考档位。
  - **Jev 在哪一步做判断**: Choice 判断任务类别；另可用 Noul 判断自动批准的权限是否应留给用户确认。
  - **这个项目的用途**: 把模型选择和权限提示接进现有会话界面，并记录失败回退原因。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/openchamber/openchamber/) · 许可证: MIT

- [**firstmate**](https://github.com/kunchenguid/firstmate) — Firstmate 可选用 Jev 看任务简报并匹配派工规则，再由本地规则选择 Agent 配置。
  - **Jev 在哪一步做判断**: 将任务简报与候选规则发送给 Jev，按匹配概率及本地条件解析执行配置。
  - **这个项目的用途**: 把语义匹配与最终派工规则分开。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kunchenguid/firstmate/) · 许可证: MIT

- [**atomic**](https://github.com/bastani-inc/atomic) — Atomic 编程 Agent 的可选 Jev 决策后端，为路由等流程提供受限的结构化选择。
  - **Jev 在哪一步做判断**: 将预定义的问题交给 Jev，解码答案后由调用方应用；常规模型仍负责生成代码。
  - **这个项目的用途**: 让结构化决策与文本生成使用各自的接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bastani-inc/atomic/) · 许可证: 未声明

- [**hermes-jev-skills**](https://github.com/kerpopule/hermes-jev-skills) — 该仓库为 Hermes Agent 提供基于 Jev 的八个 SKILL.md 技能，负责模型路由、记忆筛选、转录压缩、技能选择以及计算机和浏览器操作决策。
  - **Jev 在哪一步做判断**: Jev 决定每一轮用哪个模型、加载哪个技能、保留哪些记忆片段与对话轮次，以及下一步 GUI/浏览器操作。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kerpopule/hermes-jev-skills/) · 许可证: MIT

- [**vexjoy-agent**](https://github.com/notque/vexjoy-agent) — 给 VexJoy 的任务分派增加一条 Jev 路线。输入需求后，判断该选哪位专长 Agent、哪项技能和哪条工作流。
  - **Jev 在哪一步做判断**: 先判断是否需要路由，再从实际清单中选择候选；非法选择或调用失败交回原有流程。
  - **这个项目的用途**: 提供可对照的路由实验入口；项目文档明确说当前评测不足以把它提升为默认路线。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/notque/vexjoy-agent/) · 许可证: MIT

- [**jev-router**](https://github.com/gargpratyush/jev-router) — Claude Code / CLI 代理：Jev 给任务复杂度打分，并在当前账号可用的模型里选一个，再由本地策略决定是否更换。
  - **Jev 在哪一步做判断**: 三个 Score 衡量任务、推理和工具复杂度，再在可用模型上做 Choice；置信不足或 Jev 失败则保持当前模型。
  - **这个项目的用途**: 把模型选择做成可检查的闭集判断；Jev 不可用时不打断当前会话。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gargpratyush/jev-router/) · 许可证: MIT

- [**WrongStack**](https://github.com/WrongStack/WrongStack) — 给 WrongStack 编程 Agent 增加一个可选分派助手。遇到多个相近的专长 Agent 时，用 Jev 判断谁更适合当前任务。
  - **Jev 在哪一步做判断**: 从候选角色中选一个，同时判断有没有任何候选真正适合；不合适时交回原有策略。
  - **这个项目的用途**: 分派结果带有可检查的概率，也能明确表示没有合适人选。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wrongstack/wrongstack/) · 许可证: MIT

- [**jev-codex-router**](https://github.com/0xNatoshi/jev-codex-router) — 每轮先让 Jev 判断任务类型与难度，再由本地策略为 Codex 选模型、思考深度和速度档。
  - **Jev 在哪一步做判断**: 对当前轮次的任务层级与推理需求分类，本地规则据此选择模型配置。
  - **这个项目的用途**: 把模型分配规则和判断记录放在本地，便于回看与调整。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jev-codex-router/) · 许可证: MIT

- [**skillbox**](https://github.com/kitze/skillbox) — 自建一个有版本管理的 Agent 技能库，还能选配 Jev 推荐：告诉它当前任务，从你有权限使用的技能里挑更相关的。
  - **Jev 在哪一步做判断**: 对候选技能逐项评估任务相关度，再由应用整理推荐结果。
  - **这个项目的用途**: 技能查找不只依赖关键词；未配置或调用失败时仍可使用确定性搜索。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kitze/skillbox/) · 许可证: MIT

- [**JevRouter**](https://github.com/BillionsBobby/JevRouter) — 把模型、Subagent、Skill、MCP 和 CLI 能力放进候选集，由 Jev 选择下一步用哪个。
  - **Jev 在哪一步做判断**: 用 Choice 评估候选能力，路由器另外检查可用性、权限、风险和确认策略。
  - **这个项目的用途**: 将模型选择结果与执行策略分别记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/billionsbobby/jevrouter/) · 许可证: MIT

- [**grok-bot-jev**](https://github.com/Bodila51/grok-bot-jev) — 该项目为 Grok Bot 提供一个 Python 路由器，它在执行高成本操作前调用 Jev 对请求分类并返回明确的路由动作，同时附带可供 Grok Bot 技能使用的模板和示例。
  - **Jev 在哪一步做判断**: Jev 在执行昂贵的研究、浏览器、重试或子代理工作之前，决定执行 reuse\_cache、stop\_retry、research\_capped 等路由动作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bodila51/grok-bot-jev/) · 许可证: MIT

- [**hono-jev-router**](https://github.com/yusukebe/hono-jev-router) — Hono 的实验性 HTTP 语义路由器，让请求描述决定走哪个处理函数。
  - **Jev 在哪一步做判断**: Jev 判断请求与各路由描述的匹配概率，程序选择首个达到阈值的路由。
  - **这个项目的用途**: 适合尝试按语义分流；作者明确禁止把它当作鉴权或授权边界。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/yusukebe/hono-jev-router/) · 许可证: MIT

- [**loki**](https://github.com/wundercorp/loki) — Loki 可选接入 Jev：提供类型化判断工具，并在新会话开始时从当前 gateway 的模型中选择档位。
  - **Jev 在哪一步做判断**: 评估首个任务需要的能力，由本地策略选择同一 gateway 的模型并保持会话路由。
  - **这个项目的用途**: 把模型路由作为显式选项，避免把每一轮都当作重新选模型的机会。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wundercorp/loki/) · 许可证: MIT

- [**stuntd**](https://github.com/bladedevoff/stuntd) — stuntd 是一个本地代理，用于记录应用向 Jev 兼容服务或 OpenAI 兼容服务发出的类型化决策请求，并为每个决策点在冻结的 Laya 编码器上训练小的模型头，在置信度足够时本地作答，否则回退到上游服务。
  - **Jev 在哪一步做判断**: Jev 负责回答每个请求中的 Choice 分类、Score 评分和 Noul 是否判断，运行时再决定由本地训练头还是上游提供者回答。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bladedevoff/stuntd/) · 许可证: Apache-2.0

- [**JevLoop**](https://github.com/zjunlp/JevLoop) — \*\*你的 agent loop 里每一个岔路口都是一次完整的大模型调用。而它们没有一个是「生成」。\*\*
  - **Jev 在哪一步做判断**: Jev 负责裁决 Agent 循环中的每个分叉：是否需行动、选哪个工具、风险定级与是否需人工授权、步骤是否成功、是否完成及能否交付。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zjunlp/jevloop/) · 许可证: Apache-2.0

- [**sabi**](https://github.com/vizuh/sabi) — Sabi 位于编码 harness 与模型提供方之间。harness 保持自己原有的 agent 循环；Sabi 决定每一轮推理由哪个模型、哪一级推理强度（reasoning effort）和哪个提供方来服务——贯穿整条轨迹持续决策，而不只在第一次提示时决定。
  - **Jev 在哪一步做判断**: Jev 根据轨迹证据判断是否存在真实问题及下一步难度，以选择 cheap/mid/strong 路由层级和继续/委托/派生等控制器动作。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vizuh/sabi/) · 许可证: MIT

- [**muse-jev-playbook**](https://github.com/Bodila51/muse-jev-playbook) — 该仓库提供在 Agent 执行高成本操作前使用 Jev 进行分流、分类、评分和门控的决策层 playbook，包含置信度策略、问题模板和参考路由。
  - **Jev 在哪一步做判断**: Jev根据目标状态并行回答choice/score/noul问题，决定是直接执行、限额执行、重试、还是升级人工。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bodila51/muse-jev-playbook/) · 许可证: MIT

- [**pi-jev-router**](https://github.com/mejiasd3v/pi-jev-router) — 面向 Pi 编程助手的自动模型路由器：通过 Vercel AI Gateway 集成 Jev，自动为不同编码任务分配合适模型。
  - **Jev 在哪一步做判断**: 根据当前代码上下文与用户提问快速评估难度，动态选择小模型或前沿模型处理。
  - **这个项目的用途**: 为 Pi 终端工具链提供开箱即用的智能化降本分流机制。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mejiasd3v/pi-jev-router/) · 许可证: MIT

- [**typesafe-skill-router**](https://github.com/DECRUX9812/typesafe-skill-router) — 一个默认关闭的 Hermes Agent 插件，先用 Jev 从可用 Skill 中挑出与当前请求相关的一项建议。
  - **Jev 在哪一步做判断**: 评估请求与技能目录；有合适项时追加建议，没有把握或调用失败时不注入。
  - **这个项目的用途**: 让 Agent 先看到一项有针对性的技能提示，同时保留忽略建议的空间。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/decrux9812/typesafe-skill-router/) · 许可证: MIT

- [**jev-router**](https://github.com/prismhq/jev-router) — 基于 LiteLLM 与 Jev 构建的开源模型路由器：根据输入任务复杂度与上下文自动选择性价比最高的大模型。
  - **Jev 在哪一步做判断**: 通过 System-1 单次前向推理对输入 Prompt 评定推理需求档位，再由本地 LiteLLM 路由分发请求。
  - **这个项目的用途**: 无需复杂的启发式正则即可实现高吞吐的任务分级与模型降本调度。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/prismhq/jev-router/) · 许可证: MIT

- [**dejevu**](https://github.com/idovmamane/dejevu) — dejevu：给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **Jev 在哪一步做判断**: 给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/idovmamane/dejevu/) · 许可证: MIT

- [**jev-router**](https://github.com/rajdhakad9826/jev-router) — 基于 Jev 评分概率与期望损失最小化（Expected Loss Minimization）实现的成本敏感型大模型路由器。
  - **Jev 在哪一步做判断**: 决策说明： 在 classify 方法中使用 Jev score 对模型能力层级进行概率评分，后续结合成本损失矩阵计算最优模型。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rajdhakad9826/jev-router/) · 许可证: MIT

- [**laya-jev-lab**](https://github.com/yibie/laya-jev-lab) — 该仓库对比 Jev 与 Laya 在中文客服工单分类上的测量结果，并提供本地优先的 cascade 实验脚本。
  - **Jev 在哪一步做判断**: Jev 对每条中文客服消息执行 choice 分类决策，判断其所属类别。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/yibie/laya-jev-lab/) · 许可证: MIT

- [**Jev-Auto-Router**](https://github.com/miniLV/Jev-Auto-Router) — 架构中，Jev 负责每次调用的模型与推理档位选择；本地 Responses 代理负责保持 Codex 会话和工具循环连续；任务结束后独立验收。Router Compass 把选路、实际用量和验收结果放在一起，回答一个问题：\*\*少用旗舰模型之后，任务是否仍然正确完成，整体开销是否真的下降？\*\*
  - **Jev 在哪一步做判断**: Jev 为每次有意义的模型调用从宿主可请求的（模型, 推理档位）候选对中做一次 Choice 选择。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/minilv/jev-auto-router/) · 许可证: Apache-2.0

- [**switchboard**](https://github.com/ruban-24/switchboard) — Switchboard 是面向 Claude Code 和 Codex 的本地模型路由工具，它用 Jev 评估新对话任务并按置信度规则选择模型与推理强度，然后在后续对话、工具调用和恢复会话中固定该选择。
  - **Jev 在哪一步做判断**: Jev 对新会话任务的能力档位、上下文是否充足及各候选模型的最低充分推理努力度做出结构化 choice 判断。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ruban-24/switchboard/) · 许可证: Apache-2.0

- [**tool-prune**](https://github.com/hemanth/tool-prune) — 该项目为 AI Agent 提供校准化的工具选择与 schema 裁剪功能，可在调用 LLM 前筛选出相关候选工具，并支持离线 TurboQuant 与云端 TypeSafe System One（Jev）双引擎。
  - **Jev 在哪一步做判断**: Jev 对用户意图做原子决策：用 choice 选出最匹配的工具并给出校准概率，用 noul 判断是否需要开放式创造性生成。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/tool-prune/) · 许可证: MIT

- [**opencode-jev-orchestrator**](https://github.com/aaronshaf/opencode-jev-orchestrator) — OpenCode 编排器：会话停在廉价父模型上，Jev 判定本轮偏难时才通过工具拉起更强的子 Agent。
  - **Jev 在哪一步做判断**: 三个 Score 衡量任务、推理和工具复杂度，再 Choice 选出 fast / balanced / strong / long；本地策略决定停留、升级或并行。
  - **这个项目的用途**: 会话停在廉价父模型上；只有判定为难的轮次才另开更强的子 Agent。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/aaronshaf/opencode-jev-orchestrator/) · 许可证: MIT

- [**jev-codex-model-and-effort-router**](https://github.com/gholtzap/jev-codex-model-and-effort-router) — 该项目在每次 Codex 消息时由 Jev 按请求复杂度选择 model 和 effort，并提供 macOS 菜单栏应用来管理路由偏好与可选池。
  - **Jev 在哪一步做判断**: Jev 根据每次 Codex 请求的复杂度选择应使用的模型和 effort 等级。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gholtzap/jev-codex-model-and-effort-router/) · 许可证: 未声明

- [**jev-codex-pilot**](https://github.com/Charlyhno-eng/jev-codex-pilot) — JEV Codex Pilot 将待办任务转为受控开发流程，由 JEV 评估任务并推荐 Codex 模型与推理深度，同时提供 Kanban 看板、实时进度、Token 用量和 AGENTS.md 上下文管理。
  - **Jev 在哪一步做判断**: JEV对每个任务进行任务类型分类、复杂度打分和任务精确度评估，以推荐合适的Codex模型和推理深度。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/charlyhno-eng/jev-codex-pilot/) · 许可证: MIT

- [**jev-model-router**](https://github.com/satviksinha/jev-model-router) — 这是一个用于 Claude Code 的模型路由器，每轮对话前用 Jev 选择层级和思考强度并把请求路由到对应模型。
  - **Jev 在哪一步做判断**: Jev 决定每一轮对话应由哪个层级（haiku/sonnet/opus/fable）回答以及思考强度。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/satviksinha/jev-model-router/) · 许可证: MIT

- [**jev-smart-router**](https://github.com/rmosleydb/jev-smart-router) — 这是一个 Databricks App，它使用 JEV 为每条消息选择最合适的路由选项，然后在对应的 Databricks Foundation Model API 端点上执行推理并返回回复。
  - **Jev 在哪一步做判断**: JEV 根据对话文本从用户定义的路由选项中选择最适合处理最新消息的那个选项。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rmosleydb/jev-smart-router/) · 许可证: MIT

- [**tiershift**](https://github.com/iamvatsalpatel/tiershift) — 基于 YAML 声明策略的模型分级路由工具，在约 180 毫秒内通过 Jev 将请求路由到满足要求的最低成本模型。
  - **Jev 在哪一步做判断**: 无需微调训练数据，利用纯文本 YAML 规则由 Jev 对请求进行离散分类判断，命中阈值即向下分流。
  - **这个项目的用途**: 支持 TypeScript 与 Python 双语言生态，极低决策延迟，帮助团队透明化控制大模型调用成本。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/iamvatsalpatel/tiershift/) · 许可证: MIT

- [**todo-jev**](https://github.com/maker-KK/todo-jev) — 结合 skill 条件和环境检查的任务路由实验，推荐规则、skill 或大模型处理路径。
  - **Jev 在哪一步做判断**: Jev 分类请求并匹配候选 skill；没有密钥或调用失败时使用启发式回退。
  - **这个项目的用途**: 已实现分类与推荐，执行处理器仍返回示例响应，需要自行接入实际执行。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/maker-kk/todo-jev/) · 许可证: MIT

- [**chat2jev**](https://github.com/Chandler-Sun/chat2jev) — 把 OpenAI 兼容的 Chat Completions 请求转换成 TypeSafe System One（Jev）的 \*\*State / Questions\*\*，对照文字生成与结构化判断的结果，并把可复用的问题发布为代理路由。
  - **Jev 在哪一步做判断**: Jev 根据转换后的 State 对 Questions 作出结构化判断，如工单分诊的部门选择、是否退款及其概率和工具路由选择。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chandler-sun/chat2jev/) · 许可证: MIT

- [**Janus**](https://github.com/FirasSX914/Janus) — 模型适用性测量与路由框架，评估业务数据在 Jev 与传统大模型之间的收益边界并执行最优动态分发。
  - **Jev 在哪一步做判断**: 通过内置的 TypeSafe 提供者向 Jev 发起基准测试请求，统计离散判断准确度与延迟，生成自动化路由策略。
  - **这个项目的用途**: 用实测数据消除模型选型主观臆断，在保证任务成功率的同时实现系统整体调用的成本最小化。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/firassx914/janus/) · 许可证: MIT

- [**jev-model-router**](https://github.com/lucianfialho/jev-model-router) — 该库使用 Jev 对请求进行分类，并从 OpenRouter 实时模型目录中筛选出满足约束的最便宜可用模型。
  - **Jev 在哪一步做判断**: Jev 负责对用户请求进行领域、复杂度和长上下文/视觉/延迟需求的分类，以决定选择哪个价位的模型。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lucianfialho/jev-model-router/) · 许可证: MIT

- [**jev-route**](https://github.com/mcftira/jev-route) — jev-route 是按任务难度和数据敏感度做路由的路由器，先用 Jev 云端决策并记录完整决策日志，再从日志中蒸馏出本地路由模型。
  - **Jev 在哪一步做判断**: Jev 对脱敏后的请求摘要并行判断任务难度、数据敏感度、PII 有无和任务领域并返回校准概率分布，用于路由分级。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mcftira/jev-route/) · 许可证: Apache-2.0

- [**jev-router-playground**](https://github.com/hugo-alves/jev-router-playground) — 模型路由实验页：让 Jev 从候选模型中选择，再由你比较各模型的实际回答。
  - **Jev 在哪一步做判断**: 根据任务与候选模型说明选择模型，显示概率及运行记录。
  - **这个项目的用途**: 可导出选择结果，检查路由是否符合自己的回答偏好。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hugo-alves/jev-router-playground/) · 许可证: MIT

- [**jev-routing-experiment**](https://github.com/TokenTrim/jev-routing-experiment) — 该仓库把 Jev 用作 LLM 路由器，在 RouterArena 和 LLMRouterBench 查询上为每个查询选择模型并用各自官方评分方法计分。
  - **Jev 在哪一步做判断**: Jev 对输入查询按冻结难度量表进行 Score 评分，以决定将其路由到哪个候选大模型并权衡准确率与成本。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tokentrim/jev-routing-experiment/) · 许可证: Apache-2.0

- [**jevbus**](https://github.com/zkjoie/jevbus) — 这是一个流式事件总线，为每个事件向 Jev 请求概率判断，并据此决定订阅路由、投递、复核或丢弃，同时记录 Ledger、重试、熔断与死信。
  - **Jev 在哪一步做判断**: 对每个事件向 Jev 发送载荷与每个订阅对应的类型化问题，用返回的校准概率决定投递、复核或丢弃。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zkjoie/jevbus/) · 许可证: Apache-2.0

- [**openclaw-jev-plugin**](https://github.com/herval/openclaw-jev-plugin) — 该插件在语言模型运行前使用 Jev 概率判断群聊消息是否需要回复，并按工作量和风险为 Agent 选择轻量、标准或重量模型档位。
  - **Jev 在哪一步做判断**: 给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/herval/openclaw-jev-plugin/) · 许可证: 未声明

- [**Codex Jev Router**](https://github.com/suenot/codex-jev-router) — Jev 判断简短的 Codex 子代理任务摘要，本地规则再按置信度选择模型和推理档位；不确定时回退到 Sol。
  - **Jev 在哪一步做判断**: 用 Choice 选择子代理档位，并用 Noul 判断任务是否异常困难。
  - **这个项目的用途**: 只在创建子代理时路由，并把门槛与回退逻辑保留在本地代码。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/codex-jev-router-suenot/) · 许可证: MIT

- [**jev-agent-hooks**](https://github.com/onlyjq04/jev-agent-hooks) — jev-agent-hooks：给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **Jev 在哪一步做判断**: 给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/onlyjq04/jev-agent-hooks/) · 许可证: MIT

- [**jev-lab**](https://github.com/Pasblinn/jev-lab) — jev-lab：给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **Jev 在哪一步做判断**: 给任务分类或评估难度，由本地策略决定模型与处理路径。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pasblinn/jev-lab/) · 许可证: MIT

- [**jev-research**](https://github.com/sherajdev/jev-research) — 一份 Jev 与 Herdr 协作指南，附有把任务分给不同 Agent 的路由原型。
  - **Jev 在哪一步做判断**: 根据任务与仓库状态选择执行者，并给出风险和派发准备情况的判断。
  - **这个项目的用途**: 提供可以阅读和修改的多 Agent 派工示例。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sherajdev/jev-research/) · 许可证: MIT

- [**stuntdouble**](https://github.com/ReallyArtificial/stuntdouble) — stuntdouble 是一个零依赖 Node 代理，转发应用发往 Jev 的请求并同步询问 Kev、Laya 等本地模型，然后记录所有回答并生成两者决策是否一致的替换评估报告。
  - **Jev 在哪一步做判断**: Jev 对每个请求中的 noul、choice、score 问题给出结构化决策答案，代理以此为基准判断本地模型能否替换。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reallyartificial/stuntdouble/) · 许可证: MIT

- [**jev-decision-gateway**](https://github.com/kuldeepsinh19/jev-decision-gateway) — 把是否继续、用哪个工具、要不要校验交给 Jev，只有策略允许时才调用生成式 LLM。
  - **Jev 在哪一步做判断**: \`TypeSafeClient.systemOne\` 回答策略问题；适配器根据答案决定是否把请求交给生成模型。
  - **这个项目的用途**: 把贵的生成调用挡在 Jev 门禁之后；作者给出的省调用数字未经本站复测。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kuldeepsinh19/jev-decision-gateway/) · 许可证: MIT

- [**jev-demo**](https://github.com/minghanminghan/jev-demo) — Jev 客服分流演示：先批量回答路由问题，再沿分类结果处理用户请求。
  - **Jev 在哪一步做判断**: 同一请求评估多层分类、转人工意愿与挫折程度，低置信度时交接。
  - **这个项目的用途**: 把分类和人工交接放在同一流程里，生成回复另由应用处理。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/minghanminghan/jev-demo/) · 许可证: 未声明

- [**jev-gateway**](https://github.com/TexasOct/jev-gateway) — 制定不同的模型使用策略，达到控制模型成本/更高效的agent工作效率。
  - **Jev 在哪一步做判断**: jev主要负责根据我们自定义的规则进行模型分流，策略与模型打标允许自定义，支持选择和打分。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/texasoct/jev-gateway/) · 许可证: AGPL-3.0


## SDK 与决策框架

- [**composio**](https://github.com/ComposioHQ/composio) — Composio 的可选 TypeSafe provider，用 Jev 从工具与有限参数选项中做判断。
  - **Jev 在哪一步做判断**: 将工具或操作条件转成结构化问题，读取 Jev 答案后交由本地调用逻辑处理。
  - **这个项目的用途**: 把结构化判断接到已有工具调用接口中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/composiohq/composio/) · 许可证: MIT

- [**ai**](https://github.com/vercel/ai) — AI SDK 中的 TypeSafe provider，让 TypeScript 应用通过统一 evaluate 接口调用 Jev。
  - **Jev 在哪一步做判断**: 把选择、评分和是非问题转换为 TypeSafe System One 请求，并解析结构化结果。
  - **这个项目的用途**: 在 AI SDK 应用中复用统一的调用接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vercel/ai/) · 许可证: 未声明

- [**eliza**](https://github.com/elizaOS/eliza) — Eliza 源码中的可选 TypeSafe HTTP 适配器，默认没有注册到 Agent 运行时。
  - **Jev 在哪一步做判断**: 只有业务代码显式调用 systemOne 才发送状态和问题，返回经校验的结构化答案。
  - **这个项目的用途**: 提供一个可复用的服务端接入模块，不代表 Eliza 已在实际业务中使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/elizaos/eliza/) · 许可证: MIT

- [**langchainjs**](https://github.com/langchain-ai/langchainjs) — LangChain.js 的可选 TypeSafeClassifier 集成，把状态和预设问题交给 Jev。
  - **Jev 在哪一步做判断**: 通过 invoke 调用 TypeSafe，解析 choice、noul、score 及其概率。
  - **这个项目的用途**: 可把结构化判断接入 LangChain 流程，无需把它包装成聊天生成。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/langchain-ai/langchainjs/) · 许可证: MIT

- [**rig-typesafeai**](https://github.com/0xPlaygrounds/rig) — Rig 仓库中的实验性 TypeSafe crate，用 Rust 类型组织 Jev 的问题与答案。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 复用问题与答案的字段布局，并验证答案是否符合问题。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/0xplaygrounds/rig/) · 许可证: MIT

- [**req\_llm**](https://github.com/agentjido/req_llm) — ReqLLM 的 TypeSafe provider，让 Elixir 应用通过 evaluate 接口调用 Jev。
  - **Jev 在哪一步做判断**: 提交状态与判断题，将答案放入统一响应对象，并保留原始 provider 数据。
  - **这个项目的用途**: 把决策 API 与聊天生成分开，便于在 Elixir 程序中处理结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/agentjido/req_llm/) · 许可证: Apache-2.0

- [**simple-jev**](https://github.com/featherless-ai/simple-jev) — 将任意开源大语言模型转化为分类器与 Jev 兼容端点的适配服务，无需额外训练专用分类头。
  - **Jev 在哪一步做判断**: 通过分析输入文本在模型词表中的 logits 分布，将候选项映射为标准 Jev 离散概率输出。
  - **这个项目的用途**: 允许开发者使用现有的 Hugging Face 或 vLLM 兼容服务快速搭建私有 Jev 决策代理，降低尝试门槛。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/featherless-ai/simple-jev/) · 许可证: Apache-2.0

- [**jev-skill**](https://github.com/wuyoscar/jev-skill) — 该项目是 Jev 用例、工作流和 Agent Skills 的集合，并提供基于标准库的 Python 决策封装脚本。
  - **Jev 在哪一步做判断**: Jev 根据传入的 state 证据和 questions 对 choice、noul、score 类型问题执行类型化决策。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/wuyoscar/jev-skill/) · 许可证: MIT

- [**openjev**](https://github.com/razorback16/openjev) — 一个兼容 Jev System One 接口的独立决策服务，使用开源 DiffusionGemma 模型运行。
  - **Jev 在哪一步做判断**: 接受与 Jev 相似的状态和 Noul、Choice、Score 问题，由本地模型产生概率结果。
  - **这个项目的用途**: 让现有 TypeSafe SDK 尝试连接自托管的兼容服务。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/razorback16/openjev/) · 许可证: Apache-2.0

- [**instructor-php**](https://github.com/cognesy/instructor-php) — Instructor PHP 的 Polyglot 模块内置 TypeSafe Decision 驱动。
  - **Jev 在哪一步做判断**: 将业务状态和类型化问题转换为 Jev 请求，再映射为 PHP 决策响应。
  - **这个项目的用途**: PHP 应用可通过统一 Decision 接口使用 Jev，而不自行拼装 HTTP 数据。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cognesy/instructor-php/) · 许可证: MIT

- [**pi-fabric**](https://github.com/monotykamary/pi-fabric) — 给 Pi 的工具运行时加上可编程的 Jev 决策循环。先写好观察、判断和执行步骤，再让它按预算在前台或后台运行。
  - **Jev 在哪一步做判断**: 对程序提交的状态做单选、是非判断或评分；循环和动作执行由本地程序控制。
  - **这个项目的用途**: 适合把反复发生的小判断写成可复用流程；Jev 是需要配置的可选能力。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/monotykamary/pi-fabric/) · 许可证: MIT

- [**openai-scala-client**](https://github.com/cequence-io/openai-scala-client) — 让 Scala 应用也能接入 Jev。这个多模型客户端新增了独立 TypeSafe 模块，用状态和判断题获取结构化答案。
  - **Jev 在哪一步做判断**: 调用 System One 返回单选、评分和是非概率；可把受支持的封闭 JSON Schema 转成判断题。
  - **这个项目的用途**: 能沿用 Scala 的异步接口和错误处理；Jev 是额外支持的 provider，不承担普通聊天生成。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cequence-io/openai-scala-client/) · 许可证: MIT

- [**typesafe-sdk-js**](https://github.com/typesafe-ai/typesafe-sdk-js) — TypeSafe 组织发布的 JavaScript 与 TypeScript SDK，提供 Jev 请求和回答类型。
  - **Jev 在哪一步做判断**: systemOne 提交状态与命名问题，并按问题类型推导返回答案。
  - **这个项目的用途**: 支持 ESM、CommonJS 和 TypeScript 类型声明，便于直接接入应用。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typesafe-ai/typesafe-sdk-js/) · 许可证: MIT

- [**typesafe-sdk-python**](https://github.com/typesafe-ai/typesafe-sdk-python) — TypeSafe 官方 Python SDK，提供 Jev System One 的同步、异步客户端及问题和回答类型。
  - **Jev 在哪一步做判断**: system\_one 将上下文与选择、评分或是非问题提交到 API，并按问题名称解析返回的回答。
  - **这个项目的用途**: 在 Python 中复用请求、类型化回答和连接管理，支持 with 与 async with。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typesafe-ai/typesafe-sdk-python/) · 许可证: MIT

- [**runline**](https://github.com/Michaelliv/runline) — Runline 的 TypeSafe 插件，把 Jev 判断作为 Agent JavaScript 可调用的动作。
  - **Jev 在哪一步做判断**: evaluate、choice、score、noul 等动作提交问题并保留模型答案和用量。
  - **这个项目的用途**: 可在 Runline 的插件流程中组合判断，不会自动检查所有 Shell 命令安全性。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/michaelliv/runline/) · 许可证: 未声明

- [**jev-dsh-decision**](https://github.com/Devin-AXIS/jev-dsh-decision) — Jev DSH 决策引擎｜面向 Agent Harness 的结构化决策插件。原生支持 DeepSeek Harness，通过 iPolloWork 支持 OpenCode、Codex Harness。
  - **Jev 在哪一步做判断**: Jev 根据任务在当前可用工具、Skill 和 Agent 之间选择最合适项并对产出质量进行结构化评分。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devin-axis/jev-dsh-decision/) · 许可证: 未声明

- [**ai**](https://github.com/hackclub/ai) — Hack Club AI 代理中的 Jev 转发接口，复用已有鉴权、限额和用量记录。
  - **Jev 在哪一步做判断**: 把获准用户的结构化请求转发到 TypeSafe，返回模型结果并记录用量。
  - **这个项目的用途**: 为现有代理增加决策 API 入口，不是 MCP 工具服务器。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hackclub/ai/) · 许可证: 未声明

- [**effect-agent**](https://github.com/danieljvdm/effect-agent) — Effect Agent 的 TypeSafe 决策 provider，支持类型化问题集与可选模型选择。
  - **Jev 在哪一步做判断**: Jev 回答概率、选择和评分问题，应用按结果执行状态转换或选择模型。
  - **这个项目的用途**: 将判断纳入 Effect 的依赖与错误处理流程，重试和超时由应用配置。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/danieljvdm/effect-agent/) · 许可证: MIT

- [**jevbench**](https://github.com/fstandhartinger/jevbench) — 该仓库提供 JevBench 基准，向 Jev 类决策模型输入状态和有界评分规则，并对返回的类型化答案按 Intelligence、Calibration、Speed 和 Cost 四个维度计分。
  - **Jev 在哪一步做判断**: Jev 根据输入的 state 和有界 rubric，对 noul/choice/score 三类问题返回类型化答案及每个选项的概率分布。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/fstandhartinger/jevbench/) · 许可证: MIT

- [**advocaat**](https://github.com/pithings/advocaat) — 用简短的 TypeScript 调用向 Jev 提问。把同一份数据里的多个判断一次写好，直接拿到概率、选项和分数。
  - **Jev 在哪一步做判断**: 将带类型的问题转成 System One 请求，并把命名答案映射回调用方。
  - **这个项目的用途**: 减少手写请求和解析代码，也支持通过 Vercel 网关调用。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pithings/advocaat/) · 许可证: MIT

- [**ruby\_decision\_model**](https://github.com/obie/ruby_decision_model) — Ruby 决策模型客户端，可通过 TypeSafe 原生接口或 OpenRouter 调用 Jev。
  - **Jev 在哪一步做判断**: 用统一 Client 提交状态与类型化问题，解析选择、概率、评分及用量。
  - **这个项目的用途**: 只依赖 Ruby 标准库，可在统一接口下切换 provider。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/obie/ruby_decision_model/) · 许可证: MIT

- [**jeview**](https://github.com/andududu/jeview) — Jeview 是一个本地网关，把代码发往 Jev 的每次调用转发出去，存入本地 SQLite 数据库，并在实时地图上展示。
  - **Jev 在哪一步做判断**: Jeview 自身不做决策，所有经网关转发的 System One 请求均由 Jev 负责回答和裁决。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/andududu/jeview/) · 许可证: MIT

- [**ask-jev-skill**](https://github.com/shantanugoel/ask-jev-skill) — Hermes Agent 与通用智能体的 Jev 技能扩展：为代理提供封闭选项评估与置信度不足时的升级决策机制。
  - **Jev 在哪一步做判断**: 为 Agent 工作流在多动作选择时调用 Jev 评估候选意图；低置信度时交由人工或上级模型处理。
  - **这个项目的用途**: 为自主智能体增加确定性的窄域决策保护，减少无限轮循环幻觉。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shantanugoel/ask-jev-skill/) · 许可证: MIT

- [**solar-mini4-jev**](https://github.com/hunkim/solar-mini4-jev) — 该项目提供兼容 Jev System One 接口形态的封装，通过统一的状态与问题结构调用 Solar Mini4 处理 noul、choice 和 score 类型问题。
  - **Jev 在哪一步做判断**: 在基准对比中由真实 Jev 回答 noul/choice/score 结构化决策问题作为对照基线。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hunkim/solar-mini4-jev/) · 许可证: 未声明

- [**jev**](https://github.com/dannote/jev) — 把 Jev 接成 Elixir/OTP 异步进程，在 GenServer 中用模式匹配处理返回结果。
  - **Jev 在哪一步做判断**: 将应用状态和 Choice、Score、Noul 问题发往 TypeSafe，再以消息返回答案。
  - **这个项目的用途**: 可在现有消息处理和监督机制里组织决策流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dannote/jev/) · 许可证: MIT

- [**jev-capability-atlas**](https://github.com/Zaious/jev-capability-atlas) — \*\*機制上\*\*：它很快、很便宜，只能做「選一個選項/打個分/回答是非」這種窄判斷，不會寫文字解釋自己在想什麼。因為答案空間是你自己先定義好的，它\*\*結構上不可能吐出選項清單以外的東西\*\*——這跟自由生成文字的模型偶爾格式跑掉、甚至生出一個你沒列的分類，是不同等級的保證，不是機率低，是型別上不可能（但這只保證答案落在清單裡，不保證選到的那個是對的，細節見下面「不是瞎猜」那節）。
  - **Jev 在哪一步做判断**: Jev 在各测试套件中执行窄判断，如引用支持度、反讽识别、历史问答等选项选择与是非打分决策。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zaious/jev-capability-atlas/) · 许可证: MIT

- [**minojev**](https://github.com/zeredy879/minojev) — 独立实现的 System-1 决策模型：一次前向传播输出 Choice、Noul(Boolean)、Score 的校准概率分布，全程零输出 token，可在笔记本 CPU 上离线训练。
  - **Jev 在哪一步做判断**: minojev 是独立开源复现（不调用 TypeSafe API）：自研 backbone + 决策头，从隐藏状态直接读取 Choice / Boolean(等价 Noul) / Score 分布，温度校准在 dev 集拟合。迷宫 Demo 中每步一次前向回答 9 个问题（1 个四向 Choice + 4 个安全 Noul + 1 个距离 Score），代码用安全概率做掩码后执行动作。附带六个业务领域（客服、审核、代码评审、退款、分诊、线索）的合成数据集与后训练流程。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zeredy879/minojev/) · 许可证: MIT

- [**jevalyn**](https://github.com/Ray-Hughes/jevalyn) — Jevalyn 是 Rails 应用的决策层，封装 Jev System One API，用 noul、choice 和 score 三种类型化问题返回结构化判定，并提供 Guardrail 和 Router 辅助控制流程。
  - **Jev 在哪一步做判断**: Jev 根据输入 state 对 noul、choice、score 类型问题给出类型化答案，用于决定紧急度、归属部门和严重程度等业务路由。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ray-hughes/jevalyn/) · 许可证: MIT

- [**jev-to-answer**](https://github.com/csskrtao/jev-to-answer) — 把困惑写下来，让大模型整理可能，让 Jev 给出一个方向。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/csskrtao/jev-to-answer/) · 许可证: 未声明

- [**swift-typesafe**](https://github.com/ainame/swift-typesafe) — 社区 Swift TypeSafe 客户端，提供类型化问题、动态问题与响应解析。
  - **Jev 在哪一步做判断**: 通过 systemOne 发送 Jev 问题，用 Swift 类型或动态映射表示答案。
  - **这个项目的用途**: 可在支持的平台上集成；具体 Swift 与系统版本要求见固定版本 README。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ainame/swift-typesafe/) · 许可证: MIT

- [**discern**](https://github.com/doeixd/discern) — Effect 的语义控制流库：把 Jev 的 Choice / Noul / Score 答案变成带类型的分支。阈值由调用方提供，低于阈值的答案走显式的 \`Uncertain\` 分支（编译器强制处理），而不是被四舍五入成最高分标签；procedure 路由先用确定性谓词筛选候选，只剩一个时完全跳过模型调用。
  - **Jev 在哪一步做判断**: \*\*单文件证据（provider 接入与决策调用在同一源码文件中）/ Single-file evidence — provider wiring and the decision call live in the same file:\*\*
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/doeixd/discern/) · 许可证: MIT

- [**typesafe-ai**](https://github.com/Twister915/typesafe-ai) — 一个 Rust TypeSafe 客户端，提供异步 reqwest 或阻塞 ureq 后端，并可观察重试过程。
  - **Jev 在哪一步做判断**: 提交同一状态下的多个 Jev 问题，解析枚举形式的回答、概率和用量。
  - **这个项目的用途**: 可按应用选择同步或异步调用，同时保留可检查的错误信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/twister915/typesafe-ai/) · 许可证: Apache-2.0

- [**super-jev**](https://github.com/Kevthetech143/super-jev) — 一个 TypeScript 决策执行框架，把证据、Jev 判断、允许的动作和结果记录串起来。
  - **Jev 在哪一步做判断**: 提交类型化问题，校验答案后由领域规则选择注册工具，并检查权限与参数。
  - **这个项目的用途**: 保留每次判断、工具调用和结果的本地追踪记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kevthetech143/super-jev/) · 许可证: MIT

- [**swift-jev**](https://github.com/d-date/swift-jev) — 为 TypeSafe AI Jev 提供 Swift 类型安全库与可从终端调用的 JSON 命令行工具。
  - **Jev 在哪一步做判断**: 将客户工单状态一次性交给 Jev，用 choice 选部门、noul 判紧急度、score 评沮丧度并返回校准概率。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/d-date/swift-jev/) · 许可证: MIT

- [**typesafe-sdk-go**](https://github.com/Tangerg/typesafe-sdk-go) — 一个 Go TypeSafe SDK，用 Go 数据类型定义问题并读取 Jev 的选择、分数与概率。
  - **Jev 在哪一步做判断**: 校验请求后调用 System One，将响应解码为类型化答案。
  - **这个项目的用途**: 把鉴权、请求和错误处理封装进可复用的 Go 客户端。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tangerg/typesafe-sdk-go/) · 许可证: MIT

- [**go-jev**](https://github.com/mattn/go-jev) — 这是为 Jev 提供结构化判定结果的 Go SDK 和命令行工具，可请求 yes/no、choice 和 score 类型的答案。
  - **Jev 在哪一步做判断**: Jev根据输入的文本状态对 noul 是否判断、choice 选项选择、score 等级评分做出类型化决策。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/mattn/go-jev/) · 许可证: MIT

- [**SpecPi**](https://github.com/TannerMidd/SpecPi) — Pi 编码 Agent 的配置与扩展集合，包含可选 Jev 顾问，用于能力建议和工作流检查。
  - **Jev 在哪一步做判断**: Jev 评估候选能力、输出和任务状态；扩展按各项开关应用建议或记录结果。
  - **这个项目的用途**: 顾问调用失败会回到原流程；不是自动保证更优参数或更低成本。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/tannermidd/specpi/) · 许可证: MIT

- [**typesafeai-dotnet-sdk**](https://github.com/saibimajdi/typesafeai-dotnet-sdk) — 适用于 .NET 8+ 的 TypeSafe AI / Jev 客户端 SDK，支持 Choice、Score 与 Noul 决策原语与强类型响应解析。
  - **Jev 在哪一步做判断**: 在 TypeSafeClient 中封装 System One API 请求，以并行 HTTP 管道评估 typed questions 并映射为不可变 C# 记录。
  - **这个项目的用途**: 为 C# / .NET 生态提供原生的 Jev 异步客户端支持，具备依赖注入扩展、指数退避重试与强类型错误处理。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/saibimajdi/typesafeai-dotnet-sdk/) · 许可证: MIT

- [**zod-jev**](https://github.com/jomatsu/zod-jev) — 为 Zod 校验增加语义规则，例如描述是否匹配或文本是否包含个人信息。
  - **Jev 在哪一步做判断**: 把同次解析的语义条件合并为 Jev Noul 问题，再按概率返回通过、拒绝或不可用。
  - **这个项目的用途**: 沿用 Zod 的错误结构，将语义校验问题定位到字段。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jomatsu/zod-jev/) · 许可证: MIT

- [**jev\_jsonschema**](https://github.com/Kiln-AI/jev_jsonschema) — 该库将 JSON Schema 转换为 Jev 问题集，调用 SystemOne API 后再将答案解码为符合原 Schema 的 JSON。
  - **Jev 在哪一步做判断**: Jev 针对输入 state 回答由 Schema 属性转换而来的每个问题（枚举选择、布尔判断、整数打分），决定各字段的取值与概率分布。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kiln-ai/jev_jsonschema/) · 许可证: MIT

- [**jev-dsl**](https://github.com/inanna-malick/jev-dsl) — 一个早期 Haskell DSL，用表达式描述带标签的 Jev 问题，生成请求并解析对应答案。
  - **Jev 在哪一步做判断**: 用类型推导与标签处理器把 Choice 答案接到事先定义的程序分支。
  - **这个项目的用途**: 将问题、返回类型与分支代码放在同一套可检查定义中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/inanna-malick/jev-dsl/) · 许可证: MIT

- [**jev-rs**](https://github.com/yijunyu/jev-rs) — 这是一个 Rust 编写的 Jev 兼容引擎，可在一次 prefill 中让任意 LLM 返回关于一段 state 的 noul、choice 和 score 类型判断及其概率，并可作为 MCP 工具供 Agent 调用。
  - **Jev 在哪一步做判断**: Jev 根据输入的 state 文本对 noul、choice、score 等类型化问题给出带概率的判断。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/yijunyu/jev-rs/) · 许可证: Apache-2.0

- [**jevgo**](https://github.com/devbackend/jevgo) — jevgo：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devbackend/jevgo/) · 许可证: MIT

- [**daf-jev**](https://github.com/docxology/daf-jev) — 把 Jev 常用零件装成一个 Python 工具箱：提问、批量跑样本、看校准情况，再把结果接到程序或 MCP。
  - **Jev 在哪一步做判断**: 构造 Noul、Choice、Score 问题，接收概率后由本地函数组合评分、路由及置信度门槛。
  - **这个项目的用途**: 同一套接口覆盖调用、失败记录和评估，便于比较问法与阈值。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/docxology/daf-jev/) · 许可证: MIT

- [**jev-dspy-lab**](https://github.com/jmanhype/jev-dspy-lab) — 该项目为 DSPy 工作流中的 Jev 决策提供可离线复现的校准、置信度门控和选择风险基准测试。
  - **Jev 在哪一步做判断**: Jev 对支持工单路由等字段执行 choice/score/noul 决策并输出置信度，用于置信度门控与弃答判断。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jmanhype/jev-dspy-lab/) · 许可证: MIT

- [**jev-ood-calibration**](https://github.com/scienthoon/jev-ood-calibration) — 该仓库用规则生成的客服工单和三个公开基准来检验 Jev 返回概率的校准情况，并提供数据生成、评测与复现脚本及原始结果。
  - **Jev 在哪一步做判断**: Jev对每张合成支持工单的所属队列、是否愤怒和优先级分别做出choice、boolean、score决策并返回校准概率。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/scienthoon/jev-ood-calibration/) · 许可证: MIT

- [**JevOps**](https://github.com/endomorphosis/JevOps) — JevOps 是一个 TypeSafe / Jev 内核，提供门控、缓存、任务网格和 Lean IR 相关模块，但本身不编写 Lean 代码。
  - **Jev 在哪一步做判断**: Jev 作为门控对候选方案执行 choice/score/noul 结构化评估，以决定是否放行或选择最优分支。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/endomorphosis/jevops/) · 许可证: AGPL-3.0

- [**typesafe-sdk**](https://github.com/joshmn/typesafe-sdk) — TypeSafe System One 的社区 Ruby 客户端，默认使用 jev-latest。
  - **Jev 在哪一步做判断**: 用 Choice、Score、Noul 构造问题，发送请求后按答案类型提供访问接口。
  - **这个项目的用途**: Ruby 程序可直接读取选择、分数和概率。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/joshmn/typesafe-sdk/) · 许可证: MIT

- [**hermes-jev-plugin**](https://github.com/ajensenwaud/hermes-jev-plugin) — 该插件为 Hermes Agent 提供四个基于 TypeSafe Jev 的决策工具，分别用于二元判断、选项路由、评分和批量评估。
  - **Jev 在哪一步做判断**: Jev 根据错误文本、代码 diff 或任务描述，对是否可重试、归属子系统、严重度等类型化问题返回带概率的结构化判定。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ajensenwaud/hermes-jev-plugin/) · 许可证: MIT

- [**jev-ai-sdk-form-router**](https://github.com/vercel-labs/jev-ai-sdk-form-router) — jev-ai-sdk-form-router：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vercel-labs/jev-ai-sdk-form-router/) · 许可证: MIT

- [**jev-go**](https://github.com/Stumble/jev-go) — 社区 Go SDK 与命令行，支持 TypeSafe 直连和 Vercel AI Gateway。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/stumble/jev-go/) · 许可证: MIT

- [**jevlang**](https://github.com/sumanmichael/jevlang) — 该项目为 Python 提供 .jev 语言扩展，将 ~ 提问和 jev/case 分支在导入时改写为对 TypeSafe Jev 分类器的调用。
  - **Jev 在哪一步做判断**: Jev 根据输入文本判断是否符合某描述、情绪等级位置以及应在多个候选标签中选择哪一个。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sumanmichael/jevlang/) · 许可证: MIT

- [**jevriel**](https://github.com/thehan-co/jevriel) — 这是一个帮助 AI Agent 使用 TypeSafe JEV 构建决策点、升级现有 LLM 工作流并测量效果的 skill 和插件。
  - **Jev 在哪一步做判断**: JEV根据传入的状态对路由选择、相关性排序、候选抽取和证据支持度等有界问题返回类型化选择与评分以决定下一步。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thehan-co/jevriel/) · 许可证: Apache-2.0

- [**learn-jev-end-to-end**](https://github.com/harshithsunku/learn-jev-end-to-end) — 这是一个免费的动手教程项目，用 12 个 Notebook 教你用 Jev 快脑加 LLM 慢脑构建 13 种 AI 工具。
  - **Jev 在哪一步做判断**: Jev 作为快脑负责邮件分类、诈骗判断、漏洞类型判定、安全放行/拦截等小型决策。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/harshithsunku/learn-jev-end-to-end/) · 许可证: MIT

- [**open-bonsai-jev**](https://github.com/NicolaiLassen/open-bonsai-jev) — 该仓库把字母选项的选择题交给模型，并从一次前向传播的下一个 Token 分布中直接读出 Jev 风格的类型化概率判定。
  - **Jev 在哪一步做判断**: Jev 对给定问题在候选选项上做出类型化 choice 决策并返回概率分布，作为本地模型的对照基准。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nicolailassen/open-bonsai-jev/) · 许可证: MIT

- [**questions**](https://github.com/nitoba/questions) — TypeScript 决策库：用 Zod 或原生问题描述判断，默认请求 TypeSafe Jev，也可改用 Vercel 或生成式适配器。
  - **Jev 在哪一步做判断**: 把 state 和 Choice / Score / Noul 发到 \`/v1/systemone\`，默认模型 \`jev-latest\`。
  - **这个项目的用途**: 同一套问题定义可以换 TypeSafe、Vercel 或生成式后端，不改调用代码。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nitoba/questions/) · 许可证: MIT

- [**typesafe\_sdk**](https://github.com/nshkrdotcom/typesafe_sdk) — 面向 Elixir 的 TypeSafe SDK，把 Jev 的类型化问题与概率答案接到 Elixir 应用。
  - **Jev 在哪一步做判断**: 构造状态和 Noul、Choice、Score 请求，解析 System One 的回答。
  - **这个项目的用途**: 复用 Elixir 数据结构与客户端封装接入判断接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nshkrdotcom/typesafe_sdk/) · 许可证: MIT

- [**typesafe-ai-rs**](https://github.com/gilljon/typesafe-ai-rs) — 独立维护的 Rust SDK，提供异步与阻塞客户端、重试和响应元数据。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gilljon/typesafe-ai-rs/) · 许可证: MIT

- [**goodall**](https://github.com/bensyverson/goodall) — Go Agent 库中的可选 TypeSafe 包，允许把 Jev 当工具或路由判断使用，而不替代对话模型。
  - **Jev 在哪一步做判断**: 通过独立客户端提交类型化问题，可用于工具调用、回合路由和邮件分类示例。
  - **这个项目的用途**: 把语义判断与生成模型的 Agent 循环分开接入。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bensyverson/goodall/) · 许可证: MIT

- [**jev-android**](https://github.com/dougsong/jev-android) — 这是一个 Kotlin Android UI 自动化 SDK，由 TypeSafe Jev 或 DeepSeek 从当前屏幕控件中选择操作并通过无障碍服务执行，并附带示例应用。
  - **Jev 在哪一步做判断**: Jev根据当前屏幕可操作控件、历史动作效果和进度上下文选择下一步操作及其目标控件。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dougsong/jev-android/) · 许可证: MIT

- [**jev-go**](https://github.com/Gaurav-Gosain/jev-go) — Go 版 TypeSafe System One 客户端，提供类型化问题、答案与批量调用辅助。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gaurav-gosain/jev-go/) · 许可证: MIT

- [**zio-typesafe-ai**](https://github.com/jamesward/zio-typesafe-ai) — Scala 3 / ZIO 的 Jev 客户端：用 NamedTuple 一次提交多个 Noul、Choice、Score，答案按同样字段名返回。
  - **Jev 在哪一步做判断**: 把状态和类型化问题编成 System One 请求，解码 Probability、Choice 分布和 Score。
  - **这个项目的用途**: 在 ZIO 里用编译期字段名对接 Jev，避免手写 JSON 和字符串键查找。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jamesward/zio-typesafe-ai/) · 许可证: Apache-2.0

- [**everything-about-jev**](https://github.com/qingshungLI/everything-about-jev) — 这里整理了 Jev 的使用方法、示例代码、社区项目和讨论。如果你刚听说这个模型，可以先读下面的介绍，再选一个 demo 跑起来。
  - **Jev 在哪一步做判断**: 根据客服消息内容决定应路由到哪个队列（账单、技术或其他并转人工复核）。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/qingshungli/everything-about-jev/) · 许可证: MIT

- [**jev**](https://github.com/virolea/jev) — 该 Gem 是 Typesafe Jev 模型 API 的 Ruby 客户端，可在一次查询中并行提出多个问题并读取 noul、choice 和 score 类型的答案。
  - **Jev 在哪一步做判断**: Jev 根据传入的 state 并行判断 ask 的真值概率、choose 的最优选项和 score 的等级分布。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/virolea/jev/) · 许可证: MIT

- [**Jev**](https://github.com/cobusgreyling/Jev) — 该仓库是 Jev 的非官方展示与操作实验台，用智能家居演示、交互实验、示例脚本、TypeScript harness CLI 和 Agent skills 说明 Choice、Score、Noul 并行判断与置信度路由的用法。
  - **Jev 在哪一步做判断**: Jev 对同一 state 并行执行 Choice/Score/Noul 类型化判定并返回置信度，由代码据此做路由与执行。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cobusgreyling/jev/) · 许可证: MIT

- [**jev-builder**](https://github.com/collapseindex/jev-builder) — 这是一个在浏览器中填写文本和问题来生成 Jev 请求、复制请求并多次运行查看答案稳定性的表单工具。
  - **Jev 在哪一步做判断**: Jev根据用户粘贴的文本对用户自定义的是非、评分或多选项问题作出判断。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/collapseindex/jev-builder/) · 许可证: 未声明

- [**jev-java**](https://github.com/gudcks0305/jev-java) — 该项目是 TypeSafe Jev、OpenRouter 和 Vercel AI Gateway 的非官方 Java SDK，可将应用状态作为 Choice、Noul 和 Score 类型化问题批量提交并返回类型化 Jev 判断结果，同时提供 Spring Boot 自动配置和 WebClient 传输支持。
  - **Jev 在哪一步做判断**: 根据输入状态文本由Jev做出部门路由选择、紧急与否的概率判断和严重程度评分。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gudcks0305/jev-java/) · 许可证: MIT

- [**jev-web-analyzer**](https://github.com/replynodes/jev-web-analyzer) — jev-web-analyzer：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/replynodes/jev-web-analyzer/) · 许可证: Apache-2.0

- [**jevex**](https://github.com/jvsteiner/jevex) — Jev 指挥工具循环的 Agent 实验，聊天模型负责参数与最终文字，MCP 工具执行操作。
  - **Jev 在哪一步做判断**: Jev 选择下一步动作并审批具体调用，执行结果回到下一轮状态。
  - **这个项目的用途**: 把决策、内容生成和工具执行分开，附带作者的比较实验。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jvsteiner/jevex/) · 许可证: MIT

- [**jevrag**](https://github.com/ajanm007/jevrag) — 该项目为 RAG 流程提供可插拔的决策层，通过统一的 state → Decision → confidence → action 接口实现检索停止、分块、上下文选择、回答拒答和缓存信任五类决策，并以 Jev 作为首个可替换后端，同时提供校准评估工具。
  - **Jev 在哪一步做判断**: Jev 根据检索状态对证据充分性、块边界、上下文选择、答案弃答和缓存信任五个 RAG 决策点给出类型化答案与置信度。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ajanm007/jevrag/) · 许可证: MIT

- [**limpet**](https://github.com/noplan-inc/limpet) — 编程智能体专用 Stop Hook 门禁：防止 Coding Agent 过早宣布完工，用 Jev 依据自然语言规则客观裁定完成度。
  - **Jev 在哪一步做判断**: 在 Agent 触发终止指令时拦截，由 Jev 核对任务提示词与上下文是否满足预定验收条件。
  - **这个项目的用途**: 用轻量级规则裁判阻止代理偷懒或伪造完成，显著提高自动化开发交付完整度。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/noplan-inc/limpet/) · 许可证: MIT

- [**pi-typesafe-jev**](https://github.com/legacybridge-tech/pi-typesafe-jev) — 为 Pi 扩展注入 TypeSafe Jev 的 5 种窄域判断工具：把决策权交给模型的同时将动作阈值保留给宿主应用。
  - **Jev 在哪一步做判断**: 将选择、评分与是非等五类标准判定封装为 Pi 工具，供主代理在需要结构化裁决时调用。
  - **这个项目的用途**: 严格分离“语义评估”与“业务执行”，确保自动化脚本始终处于受控逻辑内。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/legacybridge-tech/pi-typesafe-jev/) · 许可证: 未声明

- [**typesafe-sdk-java**](https://github.com/Premo-Cloud/typesafe-sdk-java) — 社区维护的 Java TypeSafe 客户端，并提供 Spring Boot Starter 来配置 Jev 调用。
  - **Jev 在哪一步做判断**: 将 Java 状态与 Noul、Choice、Score 问题发送到 System One，并解析类型化结果。
  - **这个项目的用途**: 在 Java 和 Spring Boot 项目中复用请求、配置与错误处理。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/premo-cloud/typesafe-sdk-java/) · 许可证: MIT

- [**typesafe-sdk-rust**](https://github.com/codeitlikemiley/typesafe-sdk-rust) — TypeSafe API 的 Rust 客户端，提供异步与可选阻塞调用，以及带类型的问题和答案封装。
  - **Jev 在哪一步做判断**: 构造 Jev 请求，处理鉴权、网络调用和结构化响应解析。
  - **这个项目的用途**: 让 Rust 应用复用接口模型和通信逻辑。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/codeitlikemiley/typesafe-sdk-rust/) · 许可证: MIT

- [**ask-jev-ai**](https://github.com/waynesutton/ask-jev-ai) — ask-jev-ai：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/waynesutton/ask-jev-ai/) · 许可证: 未声明

- [**jev-architecture-research**](https://github.com/g0runmezadam/jev-architecture-research) — 该仓库是针对 Jev 决策模型的黑盒逆向工程研究档案，整理实验记录、证据矩阵与架构分析文档。
  - **Jev 在哪一步做判断**: Jev 负责执行部门路由的 choice 选择和退款意图的 noul 判断等类型化决策。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/g0runmezadam/jev-architecture-research/) · 许可证: MIT

- [**jev-does-not-play-dice**](https://github.com/KantaHayashiAI/jev-does-not-play-dice) — 该项目对公平随机事件和预测文档上Jev概率输出的可复现离线评测与校准分析。
  - **Jev 在哪一步做判断**: Jev在公平随机事件中从多个候选结果中多选一并输出概率分布，同时对固定命题进行二元真假概率判断。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kantahayashiai/jev-does-not-play-dice/) · 许可证: MIT

- [**jev-layer**](https://github.com/typakon4/jev-layer) — jev-layer 只负责路由有界决策并记录证据；host 保留执行、权限、审批、重试、恢复和最终结果的所有权。
  - **Jev 在哪一步做判断**: Jev 从宿主提供的候选能力集合中选择唯一应处理当前请求的能力。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typakon4/jev-layer/) · 许可证: MIT

- [**jev-pilot**](https://github.com/h0j5bz0adh0-stack/jev-pilot) — 该项目是基于 TypeSafe Jev 的自主 Agent 快速决策与仲裁安全引擎，提供候选方案选择、操作拦截、循环检测、事实核验和意图路由功能。
  - **Jev 在哪一步做判断**: Jev 负责在候选方案中仲裁优胜者、评估操作危险度与动作类型、并判断Agent是否陷入循环或存在幻觉。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/h0j5bz0adh0-stack/jev-pilot/) · 许可证: MIT

- [**jev-sdk-java**](https://github.com/luigivis/jev-sdk-java) — jev-sdk-java：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/luigivis/jev-sdk-java/) · 许可证: MIT

- [**jev-starter**](https://github.com/hamakyo/jev-starter) — 在 TypeSafe SDK 上补充决策阈值、备用路径、人工复核和评测模式的 TypeScript 工具集。
  - **Jev 在哪一步做判断**: Jev 返回结构化判断，应用策略再选择自动处理、fallback 或人工复核。
  - **这个项目的用途**: 把模型调用、执行策略和评测分开组织。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hamakyo/jev-starter/) · 许可证: MIT

- [**Jev4Mellea**](https://github.com/SoundBlaster/Jev4Mellea) — 这是一个将 Jev 语义检查接入 Mellea 的 Python 适配器，用于验证文本、分类文本或按有序量表评分。
  - **Jev 在哪一步做判断**: Jev 负责对候选文本执行 Noul 验证、Choice 分类和 Score 评分等语义判定。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/soundblaster/jev4mellea/) · 许可证: Apache-2.0

- [**jevclient**](https://github.com/AboveColin/jevclient) — Jev 的异步 Python 客户端，一次请求可提交多个结构化判断问题。
  - **Jev 在哪一步做判断**: 通过 aiohttp 调用 TypeSafe 接口，把分类、分数与概率解析为对象。
  - **这个项目的用途**: 便于在现有异步程序中批量提问，不需要解析模型生成的文字。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abovecolin/jevclient/) · 许可证: MIT

- [**jevgo**](https://github.com/fgn/jevgo) — 社区 Go 客户端，核心只依赖标准库，另有可选 Langfuse 追踪模块。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/fgn/jevgo/) · 许可证: MIT

- [**typesafe-ai-jev-example**](https://github.com/ItBayMax/typesafe-ai-jev-example) — 想快速搞明白「System One 模型到底怎么用」「值不值得接进我的项目」， 从这里开始比读文档快。
  - **Jev 在哪一步做判断**: Jev 负责工单分类、函数调用意图、简历维度定位、声明真伪核查与候选相关性等语义判断，代码依据其概率分布与置信度做路由和阈值控制。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/itbaymax/typesafe-ai-jev-example/) · 许可证: MIT

- [**typesafe-ai-rails**](https://github.com/GenieRobot/typesafe-ai-rails) — Ruby on Rails 官方风格集成插件，为 ActiveModel/ActiveRecord 模型引入 Jev 分类、评分与决策策略支持。
  - **Jev 在哪一步做判断**: 在 Rails 模型生命周期或服务层中调用 Jev System One API，执行业务状态判断并自动记录决策日志。
  - **这个项目的用途**: 极简化 Rails 应用接入 Jev 的流程，提供 Railtie 自动加载、配置生成器与结构化决策策略模式。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/genierobot/typesafe-ai-rails/) · 许可证: MIT

- [**typesafe-go**](https://github.com/2389-research/typesafe-go) — 只依赖 Go 标准库的 TypeSafe System One 客户端，用于提交 Jev 问题并读取结构化答案。
  - **Jev 在哪一步做判断**: 把 Go 中定义的状态和 Noul、Choice、Score 问题转换为请求，校验并解析返回值。
  - **这个项目的用途**: 在 Go 程序中复用请求、类型映射和错误处理代码。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/2389-research/typesafe-go/) · 许可证: MIT

- [**typesafe-go**](https://github.com/zhirschtritt/typesafe-go) — 无第三方依赖的非官方 Go 客户端，支持 System One 请求和模型列表。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zhirschtritt/typesafe-go/) · 许可证: MIT

- [**typesafe-jev-examples**](https://github.com/rajivkuriakose/typesafe-jev-examples) — 该仓库提供通过 OpenRouter 调用 Jev 完成工单分类和文章重排序的可运行示例。
  - **Jev 在哪一步做判断**: Jev 对工单应分诊到哪个部门、是否紧急及业务影响等作类型化判断，并对候选文章是否真正回答用户问题作相关性判断。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/rajivkuriakose/typesafe-jev-examples/) · 许可证: MIT

- [**claude-jev-mod**](https://github.com/chrishan17/claude-jev-mod) — 1. 在 \`~/.claude/settings.json\` 的 \`env\` 里打开函数式 hooks： \`"CLAUDE\_CODE\_ENABLE\_FUNCTION\_HOOKS": "1"\` 2. 会话里执行： 3. 在同一个 \`env\` 块里填上你手上任意一家的密钥（上表任选一行），重启 Claude Code。
  - **Jev 在哪一步做判断**: Jev 根据传入的命令与上下文状态，对是否具破坏性、难以撤销等 choice/score/noul 问题返回校准概率，供钩子决定是否拦截。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/chrishan17/claude-jev-mod/) · 许可证: MIT

- [**jev**](https://github.com/kataras/jev) — jev：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kataras/jev/) · 许可证: MIT

- [**jev\_dart**](https://github.com/Solido/jev_dart) — 这是 Jev 的纯 Dart 客户端，用于发送状态和类型化问题并返回可供代码分支的结构化答案，可用于 CLI、服务端和 Flutter 应用。
  - **Jev 在哪一步做判断**: Jev 根据输入文本在 billing/technical/other 之间做 Choice 分类，并用 Noul 判断是否紧急。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/solido/jev_dart/) · 许可证: MIT

- [**jev\_playground**](https://github.com/JYeswak/jev_playground) — 该仓库用 Jev 对给定状态做类型化提问并返回概率与置信度，提供二十个可一键运行的示例、统一失败处理的客户端封装和可复算的测量记录，用于判断哪些场景值得用模型分数驱动代码。
  - **Jev 在哪一步做判断**: Jev 对给定状态做类型化判断，例如是否放行/拦截消息、选择最优降本手段等，并返回概率与置信度供代码做阈值路由。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jyeswak/jev_playground/) · 许可证: MIT

- [**jev-by-example**](https://github.com/ReallyArtificial/jev-by-example) — 该仓库提供十个可运行的 JavaScript 示例，用小型 Jev 判断结合应用逻辑演示 Agent 决策。
  - **Jev 在哪一步做判断**: Jev 在记忆调和、证据缺口、重试对账等十个场景中以 Choice/Score/Noul 做出类型化判断以决定下一步提案。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reallyartificial/jev-by-example/) · 许可证: MIT

- [**jev-go**](https://github.com/guillemus/jev-go) — 接口精简的非官方 Go SDK，可调用 Jev 并列出可用模型。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/guillemus/jev-go/) · 许可证: 未声明

- [**jev-go-sdk**](https://github.com/ajayk/jev-go-sdk) — jev-go-sdk：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ajayk/jev-go-sdk/) · 许可证: Apache-2.0

- [**jev-is-not-odd**](https://github.com/ItzSupra13/jev-is-not-odd) — jev-is-not-odd：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/itzsupra13/jev-is-not-odd/) · 许可证: 未声明

- [**jev-lab**](https://github.com/q93304989-bit/jev-lab) — 最简 Jev 调用演示器：单页分类器，把请求 JSON、概率分布、confidence、耗时与 token 都摊开给你看
  - **Jev 在哪一步做判断**: Jev根据输入文本在自定义类别上做choice分类，给出各标签概率分布与confidence。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/q93304989-bit/jev-lab/) · 许可证: MIT

- [**jev-lab**](https://github.com/llt22/jev-lab) — Jev 把自然语言状态转换成带类型的决策：\*\*Noul\*\* 做是/否判断，\*\*Choice\*\* 从候选项中选择，\*\*Score\*\* 做有序评分。本仓库既是 Jev 生态导航，也是一个独立实验室，提供原始数据、负面结果和完整复现脚本。
  - **Jev 在哪一步做判断**: Jev 根据自然语言需求对仪表盘组件的选用、父子挂载和排序问题做出 choice 选择。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/llt22/jev-lab/) · 许可证: 未声明

- [**jev-labs**](https://github.com/copyleftdev/jev-labs) — 该项目在 Jev 周围构建共识内核，用 5 个 Agent 投票、稳定性门限和 quorum 机制对药房场景做出决定或升级，并包含 TLA+ 规约、Rust 内核与仿真工具。
  - **Jev 在哪一步做判断**: Jev 对每条药房处方记录返回校准概率，内核经稳定性门限和5取3 quorum投票决定放行、拒绝或升级给人工药师。
  - **这个项目的用途**: 在连续交互中观察决策效果；频率依实际运行而定。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/copyleftdev/jev-labs/) · 许可证: MIT

- [**jev-msw**](https://github.com/royalpinto007/jev-msw) — 该仓库为 Jev API 提供基于 MSW 的模拟处理器，让测试无需真实请求即可确定性地返回决策结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/royalpinto007/jev-msw/) · 许可证: MIT

- [**jev-skills**](https://github.com/laguagu/jev-skills) — 该仓库为使用 Jev 构建应用的 Agent 提供实用技能与示例，涵盖 API 设置、决策模式、路由、排序与证据检查。
  - **Jev 在哪一步做判断**: 对每个声明与证据段落对判定 supports/contradicts/irrelevant，再合成为 supported/contradicted/conflicting/not\_stated/review。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/laguagu/jev-skills/) · 许可证: MIT

- [**jev-tab-order**](https://github.com/proshunsuke/jev-tab-order) — jev-tab-order：由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **Jev 在哪一步做判断**: 由业务代码定义问题，客户端负责提交 Jev 请求并解析结构化结果。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/proshunsuke/jev-tab-order/) · 许可证: MIT

- [**jevcore**](https://github.com/litshing/jevcore) — JEV core 是向 Jev 发起有界批量判断请求的纯标准库客户端，包含成本守卫、缓存、校准、Harness 与命令行工具。
  - **Jev 在哪一步做判断**: Jev 对每个条目回答类型化问题（如是否过时可丢弃）的 noul/score/choice 判断。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/litshing/jevcore/) · 许可证: 未声明

- [**jevinf**](https://github.com/zerodegress/jevinf) — Jev 这一系决策模型的推理引擎：每条候选路径按分段前向计算并复用前缀，上面架一层符合 Jev wire 契约的服务。目前接上的后端是 NanoJev。
  - **Jev 在哪一步做判断**: Jev 根据事件状态对计费、紧急程度、负责团队和客户情绪等问题做出是否判断、选项选择和程度打分。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zerodegress/jevinf/) · 许可证: MIT

- [**jevish**](https://github.com/hemanth/jevish) — jevish 是一个 JavaScript 语义模式匹配与零样本判断库，使用 Jev 的 Choice 做标签分类、使用 Noul 做布尔判定，并支持本地与云端 Jev 协同执行。
  - **Jev 在哪一步做判断**: 当本地零依赖引擎置信度不足时，由云端 Jev System One 裁决零样本标签多选一和布尔谓词真假。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/jevish/) · 许可证: MIT

- [**jevpolicy**](https://github.com/Sanoy24/jevpolicy) — JevPolicy 是一个 TypeScript 决策运行时，它把来自 Jev 的概率性判断转换为版本化、确定性、可重放且可观测的应用决策。
  - **Jev 在哪一步做判断**: Jev 对支持工单类别、风险等类型化问题返回概率信号，供策略规则做最终路由决策。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/sanoy24/jevpolicy/) · 许可证: Apache-2.0

- [**Jevs-Garage**](https://github.com/JGalego/Jevs-Garage) — 该仓库收录多个小型可查看示例，用 Jev 把现实状态转为类型化判断，再由 Python 策略决定下一步操作。
  - **Jev 在哪一步做判断**: Jev 将各场景的实时状态转化为 Choice、Score、Noul 类型化概率判断，供确定性策略决定执行 bounded 动作还是安全回退。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jgalego/jevs-garage/) · 许可证: 未声明

- [**qualm**](https://github.com/qddegtya/qualm) — TypeScript 的 Jev 判断封装，把不确定结果作为显式 unsure 分支处理。
  - **Jev 在哪一步做判断**: 保留判断概率与选项类型，低置信度时交给调用方提供的回退分支。
  - **这个项目的用途**: 用类型约束提醒开发者处理不确定性，不保证模型判断一定正确。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/qddegtya/qualm/) · 许可证: MIT

- [**typesafe-go**](https://github.com/cole-gillespie/typesafe-go) — 非官方 Go SDK，支持类型化答案、重试和 context 取消。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/cole-gillespie/typesafe-go/) · 许可证: MIT

- [**typesafe-rs**](https://github.com/AbdelStark/typesafe-rs) — Jev 的社区 Rust 客户端，支持异步请求、可选阻塞接口及本地 mock 测试。
  - **Jev 在哪一步做判断**: 向 TypeSafe 提交状态和命名问题，解析 choice、score、noul 答案。
  - **这个项目的用途**: 提供客户端配置、重试与错误类型，可与异步或同步 Rust 程序组合。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/abdelstark/typesafe-rs/) · 许可证: MIT

- [**typesafe-sdk-php**](https://github.com/Butochnikov/typesafe-sdk-php) — 面向 PHP 8.2+ 的社区 TypeSafe SDK，提供同步调用与基于 Guzzle 的异步请求。
  - **Jev 在哪一步做判断**: 把应用状态和问题发送给 Jev，解析 Choice、Score 或 Noul 答案。
  - **这个项目的用途**: 封装请求和响应解析，便于在应用中接入结构化判断。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/butochnikov/typesafe-sdk-php/) · 许可证: MIT

- [**typesafe-sdk-swift**](https://github.com/marandaneto/typesafe-sdk-swift) — 使用 Swift Package Manager、Swift 并发和 URLSession 调用 TypeSafe 的实验性 Swift SDK。
  - **Jev 在哪一步做判断**: 将状态和类型化问题发送到 System One，以 async/await 获取结构化答案。
  - **这个项目的用途**: 让 Swift 应用复用 Jev 请求与响应处理。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/marandaneto/typesafe-sdk-swift/) · 许可证: MIT

- [**typesafe-ai-ruby**](https://github.com/hnegishi/typesafe-ai-ruby) — 无第三方运行时依赖的 Ruby 客户端，把 Choice / Score / Noul 发到 TypeSafe System One。
  - **Jev 在哪一步做判断**: \`system\_one\` POST 到 \`/v1/systemone\`，默认 \`https://api.typesafe.ai\` 与 \`jev-latest\`。
  - **这个项目的用途**: 给 Ruby 程序一条标准库路径去问 Jev，不必再包一层生成式 SDK。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hnegishi/typesafe-ai-ruby/) · 许可证: MIT

- [**TypeSafeSDK**](https://github.com/DotNetVibeCoderz/Vibe_SDK) — 非官方 .NET 客户端向 TypeSafe \`/v1/systemone\` 发送 state 与 typed questions；父仓库还混有与 Jev 无关的 SDK。
  - **Jev 在哪一步做判断**: \`TypeSafeClient.SystemOneAsync\` POST \`{Endpoint}/v1/systemone\`，默认 \`https://api.typesafe.ai\` 与 \`jev-latest\`。
  - **这个项目的用途**: 给 .NET 一条 HTTP 路径问 Jev；不要把父仓库里的其他 SDK 当成 Jev 集成。与已收录的 \`saibimajdi/typesafeai-dotnet-sdk\` 不是同一仓库。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dotnetvibecoderz/vibe_sdk/) · 许可证: MIT


## SDK 与兼容接入

- [**langchain**](https://github.com/langchain-ai/langchain) — 给 Python LangChain 流程加一个可选 Jev 分类节点，返回类别、概率和等级评分。
  - **Jev 在哪一步做判断**: TypeSafeClassifier 将 JSON 状态及类型化问题发送到 /v1/systemone，支持同步与异步 Runnable 调用。
  - **这个项目的用途**: 把结构化判断接进已有 LangChain 流程与追踪接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/langchain-ai/langchain/) · 许可证: MIT

- [**pydantic-ai**](https://github.com/pydantic/pydantic-ai) — Pydantic AI 的可选 Jev 模型：把输出模型里的布尔和枚举字段变成问题，拿回符合类型的判断。
  - **Jev 在哪一步做判断**: TypeSafeModel 将支持的 output\_type 字段编译为类型化问题，经 TypeSafeProvider 请求 API 后还原输出。
  - **这个项目的用途**: 决策型 Agent 可以复用 Pydantic 输出定义，并与其他模型作对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/pydantic/pydantic-ai/) · 许可证: MIT

- [**ax**](https://github.com/ax-llm/ax) — Ax 框架提供 TypeSafe 接口，可用布尔或有限类别签名调用 Jev，也可读原生答案。
  - **Jev 在哪一步做判断**: 将支持的签名映射到 Jev 问题，或直接发送原生 System One 请求。
  - **这个项目的用途**: 在 Ax 工作流中复用结构化签名与 Jev 概率结果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ax-llm/ax/) · 许可证: Apache-2.0

- [**ruby\_llm-typesafe**](https://github.com/kieranklaassen/ruby_llm-typesafe) — 为 RubyLLM 2 添加 TypeSafe provider，通过结构化输出接口调用 Jev 的三类判断。
  - **Jev 在哪一步做判断**: 用 Schema 构造 Noul、Choice、Score 问题，再把结果交回 RubyLLM 应用。
  - **这个项目的用途**: 在现有 RubyLLM 程序里复用明确的结构化判断接口。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kieranklaassen/ruby_llm-typesafe/) · 许可证: MIT

- [**laravel-typesafe-jev**](https://github.com/Butochnikov/laravel-typesafe-jev) — 把 Jev 接入 Laravel，提供配置、依赖注入、Facade 和可记录请求的测试替身。
  - **Jev 在哪一步做判断**: 复用社区 PHP SDK 发出三类判断请求，保留类型、异步 Promise 和异常。
  - **这个项目的用途**: Laravel 服务与队列任务可以沿用自己的配置和测试方式。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/butochnikov/laravel-typesafe-jev/) · 许可证: MIT

- [**jev-resilience**](https://github.com/Vicente-MD/jev-resilience) — 给 Spring WebFlux 检查“HTTP 200 但正文其实报错”的响应。
  - **Jev 在哪一步做判断**: Jev 判断响应正文是否是隐藏错误或维护通知，超过阈值就抛出业务异常。
  - **这个项目的用途**: 让现有错误处理能看到状态码掩盖的失败。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/vicente-md/jev-resilience/) · 许可证: 未声明


## 安全与内容审核

- [**agentgateway**](https://github.com/agentgateway/agentgateway) — Agentgateway 仓库里的 Jev 护栏示例，通过 webhook 检查模型请求和回复。
  - **Jev 在哪一步做判断**: Jev 对越狱、有害内容和秘密泄露评分，示例按阈值或评估错误拒绝请求。
  - **这个项目的用途**: 展示网关接入方式；模型评分不能保证阻挡全部攻击。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/agentgateway/agentgateway/) · 许可证: Apache-2.0

- [**Agent**](https://github.com/AgentiLoop/Agent) — 原生 macOS Agent 内的可选 Jev 命令风险顾问，配有 TypeSafeKit 客户端。
  - **Jev 在哪一步做判断**: 对已通过本地规则的 Shell 命令追加破坏性判断，达到配置阈值时拒绝。
  - **这个项目的用途**: API 故障通常放行并提示，不能把它当作完整的系统安全防护。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/agentiloop/agent/) · 许可证: 未声明

- [**jev-experiments**](https://github.com/dabit3/jev-experiments) — 一组 Jev 开发工具实验，其中 Commit Sentry 对暂存 diff 的片段进行语义风险检查。
  - **Jev 在哪一步做判断**: 逐片段判断密钥泄漏、破坏性变更等风险，由本地规则决定警告或阻止提交。
  - **这个项目的用途**: 把问题标签与对应 diff 放在提交前，便于开发者检查。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dabit3/jev-experiments/) · 许可证: 未声明

- [**unclutter**](https://github.com/kitze/unclutter) — 用 Jev 帮浏览器扩展识别网页中的广告、促销与订阅弹窗，并保存可复用的隐藏规则。
  - **Jev 在哪一步做判断**: 对候选页面元素做结构化判断，再由扩展应用本地隐藏规则。
  - **这个项目的用途**: 把一次页面判断转成可重复使用的规则。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kitze/unclutter/) · 许可证: MIT

- [**interlinked-cli**](https://github.com/QuentinCody/interlinked-cli) — Interlinked 在编程 Agent 的本地检查之外，提供可选 Jev 判断与证据检查。
  - **Jev 在哪一步做判断**: 评估测试名称、文档声明和对应证据等输入，给规则流程补充语义判断。
  - **这个项目的用途**: 把模型建议与确定性规则分开，保留检查记录。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/quentincody/interlinked-cli/) · 许可证: MIT

- [**pi-jev**](https://github.com/y0usaf/pi-jev) — Pi 编码 Agent 扩展：执行前提示工具风险，执行后检查秘密泄露与失败类型。
  - **Jev 在哪一步做判断**: Jev 给破坏性、越权和输出风险打分，配置决定提示还是请求确认。
  - **这个项目的用途**: 默认只观察；API 出错时放行，不能作为独立的安全边界。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/y0usaf/pi-jev/) · 许可证: MIT

- [**pi-warden**](https://github.com/DevMortimer/pi-warden) — 给 Pi Agent 加项目规则、越界操作、重复失败和完成声明的检查。
  - **Jev 在哪一步做判断**: 用 Jev 判断写入是否违反规则、操作是否不可逆或偏离任务，并把结果反馈到 Agent。
  - **这个项目的用途**: 把规则问题和需要确认的操作带回当前工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/devmortimer/pi-warden/) · 许可证: MIT

- [**jevals**](https://github.com/openlayer-ai/jevals) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/openlayer-ai/jevals/) · 许可证: MIT

- [**captaincore**](https://github.com/CaptainCore/captaincore) — WordPress 运维工具 CaptainCore 的 Jev 命令，可询问结构化问题，并给恶意代码扫描结果排复核优先级。
  - **Jev 在哪一步做判断**: 把扫描规则、命中片段与文件上下文交给 Jev，判断真阳性可能性和建议处理方式。
  - **这个项目的用途**: 将规则扫描产生的候选问题整理为供人工复核的队列。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/captaincore/captaincore/) · 许可证: MIT

- [**Jev-Moderation-Bot**](https://github.com/brainstormity/Jev-Moderation-Bot) — 一个 Discord 审核机器人，让 Jev 检查垃圾消息和诈骗链接，并按本地规则逐级警告或禁言。
  - **Jev 在哪一步做判断**: 评估单条消息或成员近期消息的风险，由 Bot 执行删除、提醒及超时处理。
  - **这个项目的用途**: 把判断、处置记录与人工纠正入口放在同一审核流程中。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/brainstormity/jev-moderation-bot/) · 许可证: MIT

- [**jev-guard**](https://github.com/leepokai/jev-guard) — 在编程 Agent 调工具前后加一道检查：操作是否危险、是不是用户要求的、返回内容里有没有诱导 Agent 越界的指令。
  - **Jev 在哪一步做判断**: 结合会话对工具风险、用户意图与提示注入迹象做判断，由本地规则决定放行、提醒或拦截。
  - **这个项目的用途**: 把风险检查接到多种 Agent 的工具流程；确认能力因客户端而异，也不能替代沙箱。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/leepokai/jev-guard/) · 许可证: MIT

- [**is-malicious**](https://github.com/luantak/is-malicious) — 命令行代码库恶意行为扫描器，在运行未知代码前利用 Jev 分析源码、CI 配置与构建脚本的可疑行为。
  - **Jev 在哪一步做判断**: 将待检文件内容切片与安全规则输入 Jev，由 Jev 判断代码是否包含数据外发、混淆加载或凭据嗅探等风险。
  - **这个项目的用途**: 在不直接执行脚本的安全沙箱前置阶段提供多维度危险信号预警，帮助开发者排查供应链中毒隐患。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/luantak/is-malicious/) · 许可证: MIT

- [**jev-edge**](https://github.com/kiwi0719/jev-edge) — 该项目是在 nginx/OpenResty 等网关入口处运行的三层请求过滤器，用 TypeSafe Jev 判断提示注入和滥用，并具备 fail-open、缓存和热更新能力。
  - **Jev 在哪一步做判断**: Jev 对网关入站请求文本是否为提示注入或滥用进行打分，返回概率以决定放行、拦截或旁路观察。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kiwi0719/jev-edge/) · 许可证: Apache-2.0

- [**pi-jev-auto-mode**](https://github.com/jomatsu/pi-jev-auto-mode) — 给 Pi 的命令和文件操作增加规则检查，再由 Jev 评估需要进一步判断的操作。
  - **Jev 在哪一步做判断**: 本地规则先处理拒绝和允许项，Jev 再检查 bash、write、edit 的授权与风险。
  - **这个项目的用途**: 保留规则与判断记录，方便调整操作门槛。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jomatsu/pi-jev-auto-mode/) · 许可证: MIT

- [**jevvy**](https://github.com/PanAchy/jevvy) — 为 OpenCode 等编码Agent自动放行无害的 shell 命令，对不确定命令保留人工审核。
  - **Jev 在哪一步做判断**: Jev 用四个 Noul 问题判断 shell 命令是否有害、敏感、不可信或被遮蔽，以决定自动放行还是继续人工确认。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/panachy/jevvy/) · 许可证: MIT

- [**hermes-jev-approvals**](https://github.com/anpicasso/hermes-jev-approvals) — Hermes 的实验性命令审批插件，只替换 auxiliary.approval 判断任务。
  - **Jev 在哪一步做判断**: Jev 返回 APPROVE、DENY 或 ESCALATE，由本地阈值和策略决定最终处理。
  - **这个项目的用途**: 展示审批接入方式；作者明确标为概念验证，不能当作生产安全保证。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/anpicasso/hermes-jev-approvals/) · 许可证: MIT

- [**jev-security-scan**](https://github.com/win4r/jev-security-scan) — 输出文件和行号、脱敏后的证据、风险类别、模型概率及未扫描范围。支持 Codex、Claude Code，也可以作为独立 Python 命令行工具使用。
  - **Jev 在哪一步做判断**: Jev 对每个代码分块判断是否属于九类安全风险并复核证据位置与执行上下文以决定风险结论。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/win4r/jev-security-scan/) · 许可证: MIT

- [**JevPR**](https://github.com/HexyeDEV/JevPR) — JevPR 是一个 GitHub App，它接收拉取请求 webhook 并把整理后的上下文发送给 Jev，再根据返回的 LOW、NORMAL 或 SPECIALIST 等决策映射为批准、请求评审或更新检查等操作。
  - **Jev 在哪一步做判断**: Jev根据PR标题、分支、标签和文件diff判断破坏性变更、安全敏感度、生产基础设施变更及整体与单文件风险分数。
  - **这个项目的用途**: 把语义判断接进已有的数据查询流程。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hexyedev/jevpr/) · 许可证: Apache-2.0

- [**pi-jev-sentinel**](https://github.com/harshwasan/pi-jev-sentinel) — 这是一个 Pi coding-agent 扩展，用 Jev 检查工具调用的意图和风险，并筛查工具输出和回复中的注入指示，同时隐去密钥后再发送。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/harshwasan/pi-jev-sentinel/) · 许可证: MIT

- [**jev-auto-approve**](https://github.com/metalbear-co/jev-auto-approve) — 这是一个 GitHub Action，调用 Jev 并行询问多个是否问题，仅当所有置信度达标时自动批准 PR，否则跳过并评论分数。
  - **Jev 在哪一步做判断**: Jev 对每个问题给出 yes/no 校准概率，判断 PR 是否可合并、测试是否充分、是否需要人工审查，只有全部达到阈值才批准。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/metalbear-co/jev-auto-approve/) · 许可证: MIT

- [**jev-guard**](https://github.com/muratcakmak/jev-guard) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/muratcakmak/jev-guard/) · 许可证: MIT

- [**jev-block-android-ad**](https://github.com/ufec/jev-block-android-ad) — Android 通知与短信过滤实验：先执行本地验证码等规则，再让 Jev 判断消息是否是广告噪声。
  - **Jev 在哪一步做判断**: 对通过本地门槛的文本做类别判断，由本地映射决定允许或拦截。
  - **这个项目的用途**: 将验证码优先放行与不确定时放行的策略写在代码中，方便检查。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/ufec/jev-block-android-ad/) · 许可证: MIT

- [**dsh-jev**](https://github.com/zhangxaochen/dsh-jev) — 它补上 dsh 自己没有的那一层语义判断：引入 ~150ms 极低延迟的非生成式决策原语（Noul、Choice、Score），做\*\*动态工具剪枝\*\*（省 Prompt Token、降首字延迟）、\*\*语义死循环阻断\*\*与\*\*高危执行安全门禁\*\*。判定走 System One 而非生成式采样，所以快、可复现，且成本可忽略：\*\*每次判定 ≈ $0.00013\*\*（2026-09-20 实测 2,254 次判决，每次输入 12.4KiB，按 $0.042/M 输入 token 计费、输出免费）。
  - **Jev 在哪一步做判断**: Jev 负责判断工具相关性排序、轨迹是否陷入语义死循环以及高风险 shell/文件操作是否放行。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/zhangxaochen/dsh-jev/) · 许可证: MIT

- [**jev-phishing-bench**](https://github.com/anisselbd/jev-phishing-bench) — jev-phishing-bench：Jev 负责判断每封邮件是否为钓鱼邮件、链接是否可点击，并对五个钓鱼信号给出概率。
  - **Jev 在哪一步做判断**: Jev 负责判断每封邮件是否为钓鱼邮件、链接是否可点击，并对五个钓鱼信号给出概率。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/anisselbd/jev-phishing-bench/) · 许可证: 未声明

- [**jev-tool-permissions**](https://github.com/NicolasMontone/jev-tool-permissions) — 为 Vercel AI SDK 提供工具调用审批与工具列表筛选。
  - **Jev 在哪一步做判断**: 确定性规则先处理；Jev 判断剩余调用风险和工具相关性，再由阈值映射结果。
  - **这个项目的用途**: 审批调用失败时要求人工确认；分类判断仍不能保证识别全部风险。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/nicolasmontone/jev-tool-permissions/) · 许可证: 未声明

- [**pi-jev-guard**](https://github.com/Reindeer-AI/pi-jev-guard) — 该 Pi 扩展在写入前使用 TypeSafe Jev 检查提议的代码修改是否违反 Markdown 规则，并返回违规规则原文与行号范围。
  - **Jev 在哪一步做判断**: Jev 判断提议的代码修改是否引入或加重了对每条 Markdown 规则块的违反。
  - **这个项目的用途**: 把下一步调查集中到更相关的证据上。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/reindeer-ai/pi-jev-guard/) · 许可证: 未声明

- [**agi-jev-containment**](https://github.com/carlosedm10/agi-jev-containment) — 该项目是本地 Agent 监控栈，用 Jev 和 Sentinel 对工具调用链评分并触发只升级的 L1–L5 处置，同时将事件存入 Neo4j 并在 AngryRobot 仪表盘展示。
  - **Jev 在哪一步做判断**: Jev 根据Agent动作链判定 criticality L0-L5、意图、越权、数据滥用与隐蔽性，为升级门控提供分级依据。
  - **这个项目的用途**: 把下一步调查集中到更相关的证据上。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/carlosedm10/agi-jev-containment/) · 许可证: 未声明

- [**jev-model-tokengate**](https://github.com/Thanh-Mathieu95/jev-model-tokengate) — 该项目是一个 OpenAI 兼容的流式代理，在Token到达用户前用滑动缓冲加并行评估进行拦截，实现零泄漏的内容过滤。
  - **Jev 在哪一步做判断**: Jev 对每个待释放的滑动窗口文本并行给出5个安全标准的0-1 noul分数，以决定放行该批次还是丢弃缓冲并切断流。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/thanh-mathieu95/jev-model-tokengate/) · 许可证: MIT

- [**safer-with-jev**](https://github.com/andrelandgraf/safer-with-jev) — 给 HTTP 请求装一道内容门禁。Jev 先检查注入指令或不安全内容，通过了再转发到指定地址。
  - **Jev 在哪一步做判断**: 检查请求内容是否允许通过；本地代码在 pass 时转发，review 或 block 时拦住。
  - **这个项目的用途**: 把内容检查放到上游请求前，直接复用现有 HTTP 服务。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/typesafe-on-neon/) · 许可证: 未声明

- [**ego-jev-ultrafast**](https://github.com/shikaizhong-design/ego-jev-ultrafast) — 核心机制不变：DOM 快照 → 编号动作表 → TypeSafe (Jev) 一次请求同时选 「操作 + 目标元素」（实测中位 0.6–1.9s/步，见 \`bench/BENCHMARK.md\`）， 小模型只在需要打字时生成字段文本。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/shikaizhong-design/ego-jev-ultrafast/) · 许可证: 未声明

- [**jev-enforce**](https://github.com/erkamyaman/jev-enforce) — jev-enforce：Jev 针对每条 CLAUDE.md 规则判定当前回复或代码编辑是否违反该规则。
  - **Jev 在哪一步做判断**: Jev 针对每条 CLAUDE.md 规则判定当前回复或代码编辑是否违反该规则。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/erkamyaman/jev-enforce/) · 许可证: MIT

- [**jev-engineering**](https://github.com/codejunkie99/jev-engineering) — 该仓库提供关于在 Agent 工作流中使用 Jev 类型化决策的技术论文、图表和离线示例，说明观察、模型判断、确定性策略与结果验证的分离。
  - **Jev 在哪一步做判断**: Jev 判断声明是否被来源段落完全支持、两者关系类型及声明的范围扩张程度。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/codejunkie99/jev-engineering/) · 许可证: 未声明

- [**jev-guard**](https://github.com/ClemensSchartmueller/jev-guard) — jev-guard 是适用于 Claude Code、Codex CLI 和 Antigravity 的跨 Agent 安全门插件，可在工具调用执行前进行本地边界与敏感文件检查并调用 Jev 模型评估。
  - **Jev 在哪一步做判断**: Jev 对拦截到的工具调用评估是否包含在工作区内、破坏潜力等级和违规类别，以决定放行、确认或拦截。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/clemensschartmueller/jev-guard/) · 许可证: MIT

- [**jev-judgment**](https://github.com/HyunjunJeon/jev-judgment) — 给编程 Agent 增加授权、操作风险和失败原因的判断检查。
  - **Jev 在哪一步做判断**: 依据对话与命令结果，判断是否需要询问用户、操作是否越界、失败能否重试。
  - **这个项目的用途**: 把需要停下确认的节点显式记录下来。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hyunjunjeon/jev-judgment/) · 许可证: MIT

- [**oc-plugins**](https://github.com/OpeOginni/oc-plugins) — OpenCode 插件集合中的 oc-auto-perms，用 Jev 按自然语言规则检查工具操作意图。
  - **Jev 在哪一步做判断**: 将拟执行操作与权限规则交给 Jev，再由本地逻辑选择允许、拒绝或询问用户。
  - **这个项目的用途**: 让权限规则与每次工具操作的判断对应起来。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/OpeOginni/oc-plugins/) · 许可证: 未声明

- [**open-jev-approvals**](https://github.com/alexj11324/open-jev-approvals) — agent 要执行工具时，hook 会拦住这次调用，交给 TypeSafe Jev 审查，再由 本地政策给出 \`allow\` 或 \`deny\`。走第三方 API 时，harness 自带的审批往往 不可用，这个门就是那种场景下的 auto mode。Jev 负责审查，本地政策负责 裁决。Jev 给不出结论时放行——拒绝必须有「这个动作确实危险」的正面证据。
  - **Jev 在哪一步做判断**: 每次拦截到工具调用时，由Jev回答风险、授权、危害和范围等固定问题以决定放行还是拒绝。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/alexj11324/open-jev-approvals/) · 许可证: MIT

- [**actiongate-jev**](https://github.com/omkarghugarkar007/actiongate-jev) — ActionGate 是面向 AI Agent 工具调用的授权网关，结合确定性策略与 Jev 评估提议动作，并对获批的精确动作签发一次性许可，在 MCP 与 HTTP 执行边界进行核销。
  - **Jev 在哪一步做判断**: Jev 判断Agent提议的工具调用是否与用户意图一致，为是否签发一次性许可提供证据。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/omkarghugarkar007/actiongate-jev/) · 许可证: Apache-2.0

- [**antivirus**](https://github.com/newuser7171/antivirus) — 从文件静态特征构造状态，让 Jev 给出裁决、0–4 严重度和若干是非指标，再由本地规则决定隔离、放行或复核。
  - **Jev 在哪一步做判断**: Choice：clean / suspicious\_pua / malicious；Score：威胁 0–4；Noul：加壳混淆、远控下载、持久化、注入规避。
  - **这个项目的用途**: 把启发式特征变成可设阈值的结构化判断，而不是一段杀毒评语；本站未运行或验证防护效果。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/newuser7171/antivirus/) · 许可证: 未声明

- [**claude-jev-plugin**](https://github.com/dr-dimitru/claude-jev-plugin) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/dr-dimitru/claude-jev-plugin/) · 许可证: BSD-3-Clause

- [**grok-jev-guard**](https://github.com/0xwhrari/grok-jev-guard) — 该项目是在 Grok Bot 工具操作执行前进行本地硬性检查和 Jev 类型化判断并返回明确执行动作的预检与审批层。
  - **Jev 在哪一步做判断**: Jev 对已脱敏任务状态进行意图分类、审批预期、破坏性、范围匹配度和风险评分的类型化判断。
  - **这个项目的用途**: 按任务分配模型资源；具体成本收益需看项目测试。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/0xwhrari/grok-jev-guard/) · 许可证: MIT

- [**jev-cvss**](https://github.com/Red5d/jev-cvss) — 用 Jev 从漏洞描述中选择 CVSS 指标，再由 Python 计算 v3.0、v3.1 或 v4.0 分数。
  - **Jev 在哪一步做判断**: 将攻击条件与影响映射为离散指标；数值计算由本地 CVSS 公式完成。
  - **这个项目的用途**: 可以检查每个选中的指标及最终向量，而不只看一个总分。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/red5d/jev-cvss/) · 许可证: MIT

- [**jev-decisions**](https://github.com/bojansandhaus/jev-decisions) — 该插件为 Hermes 等 Agent 提供 Jev 评审工具，用于审查风险操作、核对证据支持以及记录本地决策历史。
  - **Jev 在哪一步做判断**: Jev 根据提交的计划、证据和状态，对风险、证据支持度和选项适配度做出 noul/score/choice 类型的量化决策。
  - **这个项目的用途**: 把选择和打分接进现有程序；暂无可核验的性能对照。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/bojansandhaus/jev-decisions/) · 许可证: MIT

- [**jev-pii-checker**](https://github.com/coo-quack/jev-pii-checker) — 把文本交给 TypeSafe Jev 做 PII 类别 Noul 和敏感度 Score，再用正则与分词标出跨度。
  - **Jev 在哪一步做判断**: 对每个文本块并行询问 12 类 PII 是否出现，并给出 none / low / high 敏感度。
  - **这个项目的用途**: 判定在 TypeSafe 服务器上完成；本地只提取跨度，不能当作离线保密扫描。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/coo-quack/jev-pii-checker/) · 许可证: MIT

- [**jevshield**](https://github.com/lgy1027/jevshield) — 该项目是基于 Jev 的 Agent 工具调用安全门，通过单次 Choice/Noul/Score 评估拦截高风险操作，并提供本地启发式兜底和 LangChain 集成。
  - **Jev 在哪一步做判断**: Jev 对每次 Agent 工具调用一次性评估风险等级、是否不可逆破坏及爆炸半径，以决定放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/lgy1027/jevshield/) · 许可证: Apache-2.0

- [**reflex**](https://github.com/kaustav1996/reflex) — 这是一个基于 Pi coding Agent 的编码助手与个人助理，Jev 会检查每次工具调用、对话轮次和语音转录，代码据此决定放行、询问或拦截、选择模型档位并核验完成状态。
  - **Jev 在哪一步做判断**: Jev 对每个工具调用、轮次和语音转录回答是否破坏性、是否触及秘密、风险等级以及模型层级等问题，代码据此决定放行、询问或拦截。
  - **这个项目的用途**: 让界面选择与执行分开，便于检查每一步。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/kaustav1996/reflex/) · 许可证: MIT

- [**claude-jev-warden**](https://github.com/connectedGraph/claude-jev-warden) — 该项目为 Claude Code 提供 PreToolUse 钩子，在 Write 与 Edit 落盘前用 TypeSafe Jev 评估草稿并拦截未达标的写入，同时附带命令行审计工具和 SVG 对比示例。
  - **Jev 在哪一步做判断**: Jev 判定 SVG 是否为精美且包含车轮转动、脚踏和猴体动态的连续动画，并给出质量分与驳回/通过裁决。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/connectedgraph/claude-jev-warden/) · 许可证: MIT

- [**dsh-jev-verify**](https://github.com/xienda/dsh-jev-verify) — Jev 不生成文本：给定 \\\`state\\\` 与类型化问题，它用\*\*一次并行 API 调用\*\*返回\*\*带校准概率的类型化判定\*\*（官方宣称 ~70–500ms）。本插件把它封装成 Agent 工具，附加可选的\*\*自动护栏\*\*（风险/循环检测），并且坚持「验证过的才叫有效」：
  - **Jev 在哪一步做判断**: Jev根据给定state对choice/score/noul问题做类型化判定，并对可疑shell命令做风险判定、对重复工具调用做停滞判定。
  - **这个项目的用途**: 增加一组可记录、可对照的判断信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/xienda/dsh-jev-verify/) · 许可证: MIT

- [**guardrail-chatbot-jev**](https://github.com/taman-spirit/guardrail-chatbot-jev) — 这是一个聊天机器人内容安全库，用 Jev 对用户输入、模型回复和多轮对话按同一策略文件给出可执行的裁决。
  - **Jev 在哪一步做判断**: Jev 对用户输入、模型输出和完整对话给出命名问题的校准概率，以决定放行、标记、人工审核或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/taman-spirit/guardrail-chatbot-jev/) · 许可证: 未声明

- [**jev-chrome-extension**](https://github.com/gavansmyth-arch/jev-chrome-extension) — 把 Jev 的结构化判断接进程序；具体用途与决策流程请查看项目源码。
  - **Jev 在哪一步做判断**: 评估内容是否满足安全或证据要求，由本地策略放行或拦截。
  - **这个项目的用途**: 给现有流程增加可检查的判断环节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/gavansmyth-arch/jev-chrome-extension/) · 许可证: 未声明

- [**jev-kit**](https://github.com/jonathanavis96/jev-kit) — 该仓库为 Claude Code 提供运行 TypeSafe 的 Jev 所需的工具调用防护、Tier Guard、文件搜索、浏览器 Agent、代码评审、复核与压缩等组件及安装器。
  - **Jev 在哪一步做判断**: Jev 对Agent每一次工具调用进行裁决，决定放行、警告、改写还是阻止。
  - **这个项目的用途**: 让现有 Agent 通过通用接口使用 Jev。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/jonathanavis96/jev-kit/) · 许可证: MIT

- [**jev-preflight**](https://github.com/muse0509/jev-preflight) — jev-preflight：Jev 对行为回归、鉴权等八个风险轴一次性打分，判断本轮变更是否达到需复查的高风险阈值。
  - **Jev 在哪一步做判断**: Jev 对行为回归、鉴权等八个风险轴一次性打分，判断本轮变更是否达到需复查的高风险阈值。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/muse0509/jev-preflight/) · 许可证: MIT

- [**jev-reasoning-navigator**](https://github.com/AndreuVM/jev-reasoning-navigator) — jev-reasoning-navigator：Jev 对候选推理块评估是否存在幻觉/循环、首个发散步骤位置、缺陷类型以及进度与新颖性评分。
  - **Jev 在哪一步做判断**: Jev 对候选推理块评估是否存在幻觉/循环、首个发散步骤位置、缺陷类型以及进度与新颖性评分。
  - **这个项目的用途**: 在现有程序中复用接入代码，减少重复处理接口细节。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/andreuvm/jev-reasoning-navigator/) · 许可证: 未声明

- [**jev-secret-detection**](https://github.com/teyhouse/jev-secret-detection) — 利用 Jev 模型检验代码片段中的真实凭据泄露：评估小模型在代码安全门禁与敏感密钥识别中的表现。
  - **Jev 在哪一步做判断**: 将文件代码片段输入 Jev 判定是否存在硬编码密钥风险，返回布尔与置信评分。
  - **这个项目的用途**: 验证低延迟无生成模型在 CI/CD pre-commit 安全静态扫描中的可行性与准确率。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/teyhouse/jev-secret-detection/) · 许可证: 未声明

- [**profanity-checker**](https://github.com/4rays/profanity-checker) — profanity-checker：Jev 判断输入文本是否含亵渎语言，以及用户名是否含字面或伪装（谐音/形近）的亵渎内容。
  - **Jev 在哪一步做判断**: Jev 判断输入文本是否含亵渎语言，以及用户名是否含字面或伪装（谐音/形近）的亵渎内容。
  - **这个项目的用途**: 减少后续处理的冗余信息。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/4rays/profanity-checker/) · 许可证: MIT

- [**traffic-guard**](https://github.com/hemanth/traffic-guard) — 该项目是为传入 HTTP 请求提供流量分类与拦截判断的网关，提供 Node.js 与 Python 实现，并可选用 TypeSafe System One 通过 Noul、Choice 和 Score 进行语义评估。
  - **Jev 在哪一步做判断**: Jev 并行回答 is\_bot/is\_attack/is\_spoofed 是否拦截、traffic\_type 分类多选一、risk\_level 风险打分，以决定放行/挑战/限速/拦截。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/traffic-guard/) · 许可证: 未声明

- [**pkg-gate**](https://github.com/hemanth/pkg-gate) — pkg-gate 是在安装前评估 npm 生命周期脚本的门禁工具，它使用 TypeSafe System One 以 Choice 判断意图、以 Score 评估威胁严重程度、以 Noul 判断机密访问和远程执行，并输出 allow、warn 或 block 的判定结果。
  - **Jev 在哪一步做判断**: 对每个 preinstall/install/postinstall 脚本并行判定意图分类、威胁评分与窃密/远程执行概率，以决定放行、告警或拦截。
  - **这个项目的用途**: 把语义判断接到已有的命令行工作流。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/hemanth/pkg-gate/) · 许可证: MIT


## 语音与对话

- [**aiavatarkit**](https://github.com/uezo/aiavatarkit) — AIAvatarKit 的可选 Jev 组件根据转写内容判断用户是否结束发言。
  - **Jev 在哪一步做判断**: 评估当前话语是否完整、是否准备继续说，并影响轮次结束门槛。
  - **这个项目的用途**: 给仅靠静音时长的轮次判断增加语义信号。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/uezo/aiavatarkit/) · 许可证: Apache-2.0

- [**OpenWhisper**](https://github.com/Knuckles92/OpenWhisper) — 语音听写与会议记录应用，可选用 Jev 检查话题变化、面向记录助手的指令和敏感文本。
  - **Jev 在哪一步做判断**: 对转录片段做有边界的判断，辅助触发会议检查点、记录操作或远程文本清理前的筛查。
  - **这个项目的用途**: 把概率判断与本地阈值、开关和失败回退分开，方便检查每项功能。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/knuckles92/openwhisper/) · 许可证: MIT

- [**jev-system-one**](https://github.com/haseeb-heaven/jev-system-one) — 终端问答界面由 OpenAI 写回答，Jev 决定回答方式、检查草稿并判断是否重写。
  - **Jev 在哪一步做判断**: 判断回答模式、深度、不确定性和草稿质量，再把结果交给 LangGraph 流程。
  - **这个项目的用途**: 可同时查看最终回答与结构化决策报告。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/haseeb-heaven/jev-system-one/) · 许可证: MIT

- [**ha-conversation-jev**](https://github.com/luxus/ha-conversation-jev) — Home Assistant 的对话扩展：简单灯光指令走设备服务，其余请求交给 Grok。
  - **Jev 在哪一步做判断**: Jev 对语句和已公开设备做分类，程序据此选灯光服务或对话分支。
  - **这个项目的用途**: 为有限的灯光操作提供独立路径，不代表支持所有家居设备命令。
  - [项目详情与固定源码](https://logicrw.github.io/awesome-jev-projects/projects/luxus/ha-conversation-jev/) · 许可证: 未声明

## 本地开发

Node.js 22+

```bash
npm ci --ignore-scripts
npm run dev
npm test
npm run build
npm run build:readme
```

## 自动化与安全机制

网站为纯静态架构，不收集敏感凭据，所有展示数据均来自公开开源代码。Actions 采用短期仓库 Token，最小权限运行，不执行第三方未核验代码。

## 访问统计与透明度

采用轻量无 Cookie 的 Cloudflare Web Analytics 进行基础性能与访问汇总，尊重 DNT/GPC。

## 提交项目

欢迎提交项目！请提供仓库地址、简要用途以及 Jev 在代码中的实际决策逻辑位置。

[提交项目](https://github.com/logicrw/awesome-jev-projects/issues/new?template=project.yml)

## 收录与安全说明

- [本轮目录审核记录](docs/catalog-review-2026-09-19.md)
- [Security](SECURITY.md)

发现安全问题请勿在公开 Issue 中粘贴 Token、私钥或其他凭据。

MIT © [logicrw](https://github.com/logicrw) · [X @0xLogicrw](https://x.com/0xLogicrw) — directory code only; project licenses are separate.
