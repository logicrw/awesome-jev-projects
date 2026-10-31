# 任务委托：Awesome Jev 审查流水线架构审核与第一性原理优化方案

> **致 Claude Code (Opus 5.5 xhigh):**  
> 本任务由仓库维护者委托。请你跳出现有代码实现的思维惯性，基于**第一性原理**与**业界前沿最佳实践**，对本项目的 Issue 自动化审查与上下文管道进行全面架构审核，并输出一份深度优化方案报告。

---

## 1. 业务背景与现行架构

- **项目定位**：`awesome-jev-projects` 是一个收录 Jev / TypeSafe System One 离散/连续决策架构与生态工具的开源雷达（目前全库 864+ 项目）。
- **运行模式**：通过 GitHub Actions 24/7 全天候无人值守运行，监听社区提交的收录 Issue（模板化 Issue），完成自动化审核、查重、分类定性、生成中英双语摘要、沙箱测试校验并自动合入落库上线。

### 现行四级过滤漏斗
1. **代码硬筛（0 Token 消耗）**：收到 Issue 先算标题和正文哈希。内容无变动、纯机器人发帖或缺少有效仓库链接，本地静态脚本直接退出，根本不碰模型。
2. **Jev 门禁初筛（极低成本）**：走 System One 快速二元门禁（调用 Jev 接口），只核验闭集客观事实：是否存在真实公开源码、是否实质调用了 Jev API。借此就地拦掉大部分无代码教程、空泛讨论与水贴。
3. **高阶模型深度审查（按需唤醒）**：只有通过门禁的项目，才唤醒高阶模型（如 DeepSeek-Flash / Claude / Muse）做复杂语义仲裁（判断是真正集成还是蹭热度、辨别投递意图、技术拓扑定性并提取架构证据链 claims 与双语摘要）。
4. **沙箱测试硬验收与落库**：本地跑通 500+ 项单元测试与构建审计（0 凭据泄露、0 契约破坏），全部绿灯后才自动落库、生成不可变收据并推向生产，自动 Close Issue。

### 现行预算与配额体系
- **单次审查硬上限**：`caseTokens = 6000`（输入限制 `maxMessagesBytes = 5KB`，约 1,200~1,500 Token；输出限制 512/2048 Token）。
- **全局每日预算池**：全局每日 `60,000 Token`，单个作者每日 `12,000 Token`，单个仓库每日 `6,000 Token`。
- **预授权机制（Budget Ledger）**：单次任务启动前预锁 6,000 Token，实际执行完成后结算退回多余配额（真实生产中普通项目单次仅消耗 380~550 Token，复杂项目约 950~1,000 Token）。
- **防御原则**：严格执行 **Fail-Closed（宁缺毋滥）**。算不出、超时或格式不符，绝不自动落库。

---

## 2. 遭遇的实战痛点与根因剖析

在最近的实战中，自动化流水线连续发生**假阴性（误杀）**，导致正经提交被拒绝，最终仍需维护者人工排查并手动落库：

### 典型案例
- **Issue #119 (`jev-chat/jev-chat-jarvis`)**：Android 客户端（Kotlin 实现，调用 `/v1/systemone` 接口）。
- **Issue #121 (`jev-chat/jev-chat-jarvis-ios`)**：iOS 键盘客户端（Swift / SwiftUI 实现，调用 Jev Choice/Score 原语）。
- **现象**：两者均被高阶模型判定为 `rejected`（“模型判断本次内容不属于可收录的 Jev 相关投稿；本轮自动审查已结束”）。

### 深入复盘揭示的致命根因
1. **上下文提取管道（Context Pipeline）失灵**：
   - 在 `scripts/project-source.mjs` 中，素材排序算法硬编码了 `只要路径包含 readme 权重 +40`，且 `maxFiles = 8`；
   - 遭遇现实复杂结构：`jev-chat-jarvis` 仓库包含多语言文档（`.github/README.md`, `.github/README.vi.md`, `.github/README.zh-CN.md`, `cn/README.md`... 等整整 8 个 README）；
   - **配额挤兑**：8 个 README 占满了全部配额，导致真正的代码文件（`JudgeClient.kt`, `JevQuestions.kt`）根本没有被送给模型！
   - 模型被迫在“只有一堆 README、没有一行实际代码”的残缺上下文中做决断，严格按 System Prompt 规则（“纯文档无代码必须排除”）给出了排除判定。
2. **移动端与复杂单体工程深层目录盲区**：
   - Android 代码位于 `cn/app/src/main/java/...`，iOS 代码位于 `Shared/...`；
   - 若作者未在 Issue 中直接粘贴精准的行链接，静态贪婪采样规则很难在几万个文件中自动感知到这些深层源码。
3. **Fail-Closed 过于极端，缺乏柔性分流**：
   - 系统将“缺少代码证据”粗暴等同于“该项目无关”，直接定性为拒收；
   - 缺乏像编译器一样的“警告/信息补全/延迟重试”渐进式降级流。
4. **6,000 Token 的硬性紧身衣是否画地为牢**：
   - 现在的输入被 5KB / 1500 Token 的 Evidence Bundle 死死锁死；
   - 在现代长上下文模型单价极低（每百万 Token 几毛钱）的今天，6,000 Token 的硬上限是否导致了“因噎废食”？

---

## 3. 审核与方案设计要求

请基于第一性原理，站在 2026 年现代 AI 基础设施与 Agent 架构的前沿视角，打破现有脚本实现的思维惯性，充分发挥创造力与想象力，就以下四大核心维度展开深度审核并给出优化方案：

### 维度一：上下文供给与证据采样管道重构（Context & Evidence Pipeline）
- 如何从根本上杜绝“文档挤兑代码”的荒谬现象？
- 针对多模块、跨语言、深层目录（如 monorepo、移动端项目、微服务），如何设计更高召回率且防污染的代码搜寻机制？
- 是否应该引入符号感知（Symbol-aware）、AST 骨架分析、ripgrep/启发式搜索，还是支持模型自主交互式“按需探查”（Agentic Exploration / Tool Use）？

### 维度二：Token 预算体系与动态伸缩（Dynamic Budgeting）
- 6,000 Token 的硬上限在当下是否过时？
- 如果放宽，合理的甜点位在哪里？（16k / 32k / 64k？）
- 如何设计“两阶段或三阶段弹性预算”（例如：Stage 1 廉价小切片初筛 → 遭遇模糊/多模块时，Stage 2 弹性追加预算提供大上下文深查）？
- 在放宽 Token 的同时，如何依靠确定性状态机防范死循环与账单暴走？

### 维度三：决策模型与置信度分级（Decision Taxonomy & Fallbacks）
- 现有的二元对立（Admit vs Exclude）是否存在缺陷？
- 如何设计更加智能的分流策略？（例如：`Admit` 直接合入、`Provisional/Needs-Evidence` 针对性追问、`Pending-Review` 沉淀观察列表、`Exclude` 确定性拒绝）。
- 模型在无法确定证据时，应该如何精准向社区提交者发起补全邀请，而不是冷冰冰的一刀切拒收？

### 维度四：端到端架构演进与前瞻设计（Architectural Vision）
- 如果不考虑对现有那几个 Node.js 脚本的修修补补，从零设计一套行业顶级的“开源仓库自主收录与审查 Agent”，整体架构应该如何演进？
- 结合你的丰富工程经验，给出最具颠覆性、可行性与美感的方案架构。

---

## 4. 交付形式
请通读当前仓库的相关实现代码（主要集中在 `scripts/project-source.mjs`、`scripts/source-enrichment.mjs`、`scripts/review-budget.mjs`、`scripts/budget-quota.mjs`、`scripts/issue-ingestion.mjs`），并将你的完整审核分析与方案落地设计输出为一份结构化报告：
`docs/architecture-review-and-proposals.md`
