# 自动化收录流水线无死角修复任务书 (Task: Implement Pipeline Fixes)

- **执行者**: Codex (GPT-6-Astra Ultra Fast)
- **审查者**: Claude Code (Opus 5.5 xhigh)
- **依据报告**: `docs/architecture-review-and-proposals.md`
- **代码仓库**: `awesome-jev-projects`

---

## 1. 核心目标与背景
近期生产环境自动化收录暴露了致命的假阴性误杀（如 Issue #119 Android、#121 iOS）。架构审查已精确定位 3 大根因：
1. `scripts/project-source.mjs`: `materialRank` 给 `readme` 硬编码 `+40` 且 `maxFiles = 8`，多语言 README 抢占全部配额，代码被挤出上下文；
2. `scripts/review-budget.mjs`: 错误地将 UTF-8 字节数 1:1 视为 Token 进行预留，5KB 的 payload 吞噬 5,760 Token，使单 Case 6,000 上限瞬间枯竭，第二轮审查必定失败；
3. `scripts/jev-decision.mjs` & `scripts/issue-ingestion.mjs`: 二元对立一刀切，在切片无代码时模型判定 `p < 0.2`，系统将其误作反例直接关闭 Issue。

现在需要对流水线实施**彻底、无死角、具备工业级鲁棒性**的修复与重构。

---

## 2. 具体修复规范 (Requirements)

### R1. 证据采样多样性与多语言/移动端支持 (`scripts/project-source.mjs`)
- **破除 README 独占配额**：
  - 根目录主 README 保留合理权重，但非根目录或多语言 README（如 `README_zh.md`, `README_ja.md`, `docs/README.md`）不得给予高权重加成（甚至降权）；
  - 最多只允许采样 1 个 README 文件。
- **强制结构分类桶配额（Category Buckets）**：
  - 在 `selected` 的候选池中，强制施行桶隔离：
    - 文档（Docs Bucket）：上限 1 个；
    - 配置/依赖清单（Config/Manifest Bucket）：上限 2 个（`package.json`, `build.gradle*`, `Cargo.toml`, `go.mod`, `pom.xml`, `Podfile`, `Package.swift` 等）；
    - 核心源码（Code Bucket）：**保底至少 5 个代码文件**（总数若达到 8）。
- **深层路径与移动端/多语言加权**：
  - 支持常见的源码树深层结构（`app/src/main/`, `src/`, `lib/`, `pkg/`, `Shared/`, `Sources/` 等），避免因路径层级深被歧视；
  - 确保包含 `jev`、`typesafe`、`client`、`service`、`judge` 等关键字的代码文件获得高优先级。

### R2. 预算核算理性化与弹性上限 (`scripts/review-budget.mjs` & `scripts/budget-quota.mjs`)
- **根治 UTF-8 字节与 Token 1:1 倒挂**：
  - 修正 `requestBudget` 中的 `reservedTokens` 计算，彻底废除 `inputUtf8Bytes` 直接当作 Token 数量的错误算法；
  - 采用合理且保守的估计：例如 `Math.ceil(inputUtf8Bytes * 0.35)` 或结合字符估计 `Math.ceil(estimated * 1.2)` + 保留安全边界，避免几 KB 的 payload 吃光数千 Token；
- **提高配额与支持多轮交互**：
  - 将单 Case 预算上限从 6,000 提升至 16,000（或根据需求提供弹性阶梯），确保双轮交互 `maxSemanticRounds: 2` 在第一轮需要补充证据时有充足的预算发起第二轮；
  - 同步更新 `scripts/budget-quota.mjs` 中的 `DEFAULT_QUOTA_LIMITS`（如 global: 120,000, owner: 24,000, repository: 16,000）以适配新的 Case 配额。

### R3. 柔性裁决与暂缓待补证状态机 (`scripts/jev-decision.mjs` & `scripts/issue-ingestion.mjs`)
- **区分“未观察到证据”与“证据确凿的反例”**：
  - 当 `p < 0.2` 时，检查送审切片中的源码文件数量。如果切片中源码文件为 0，或未检索到具体调用代码，但项目 README 或描述声明了集成，绝不能直接判定 `isRejected: true`；
  - 应输出 `status: "provisional"` 或 `needsEvidence: true`；
- **友好的 Issue 交互**：
  - 在 `scripts/issue-ingestion.mjs` 中，对 Provisional 状态不执行关单，而是发布指引评论，引导贡献者在回复中指出关键实现文件的路径，以便触发二次定向检索。

### R4. 完整单测验证与回归测试
- 运行 `DEVELOPER_DIR=/Library/Developer/CommandLineTools npm test`，现有所有单元测试必须 100% 通过（零破坏、零回归）；
- 在测试套件中新增针对以下场景的测试：
  - 模拟包含 8 个多语言 README 的 Android/iOS 仓库，断言深层代码切片必被采样且排入前列；
  - 模拟 UTF-8 字节与 Token 预算计算，断言 5KB 的 payload 不会预留超额 Token；
  - 模拟无代码切片时的 Provisional 柔性状态转移。

### R5. 安全与零执行底线
- 坚决不得执行任何被提交仓库的代码或脚本；
- 外部输入切片必须保留严格的 XML/Markdown 防注入围栏。
