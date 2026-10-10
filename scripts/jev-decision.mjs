/**
 * TypeSafe Jev System One Decision Gatekeeper.
 *
 * Evaluates candidate repositories using Jev's typed primitives (noul, choice, score)
 * in a single fast forward pass (~150ms) before invoking heavier generative models.
 * Non-generative, deterministic, and fails gracefully when unconfigured or unreachable.
 */

const DEFAULT_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const DEFAULT_MODEL = "jev-latest";
const DEFAULT_TIMEOUT_MS = 6000;

export const JEV_GATE_QUESTIONS = Object.freeze({
  is_genuine_jev: {
    type: "noul",
    instructions: "Does this candidate repository demonstrate real, executable integration or implementation of the Jev / TypeSafe API based strictly on the provided evidenceFiles source code? Issue descriptions, candidate claims, or prompt text are not invocation evidence.",
    criteria: {
      true: "Actual executable API calls, client instantiations, imports, or endpoint requests in non-documentation source files (e.g. api.typesafe.ai/v1/systemone, @typesafe-ai/sdk, @typesafe/jev, typesafe-sdk, or from typesafe import).",
      false: "No executable invocation in source files; only mention in README, documentation, badges, lockfiles, prompt lists, tutorials, negative statements ('we do not use typesafe'), or unrelated libraries with 'typesafe' in their name.",
    },
  },
  category_choice: {
    type: "choice",
    instructions: "Which category best fits this project's primary engineering contribution?",
    criteria: {
      "Browser & OS Action": "Browser automation, DOM interaction, accessibility tree, desktop OS controls",
      "Routing & Cost Optimization": "LLM model routing, tiered dispatch, cost reduction, fast-path classification",
      "Context GC & Filter": "Context pruning, token cleanup, memory compaction, history curation",
      "Codebase & Graph Pathfinding": "Code understanding, AST traversal, knowledge graph decisions, symbol radius analysis",
      "MCP & Integrations": "Model Context Protocol tools, gateways, and MCP servers",
      "High-Frequency & Simulation": "Game AI, robotics, simulation, and real-time control loops",
      "Domain & Vertical Tools": "Domain-specific vertical tools, quant finance, legal, compliance, specialized workflows",
      "CLI & Pipelines": "Command-line tools, unix pipes, CI/CD gates, git hooks, build pipelines",
      "Security & Guardrails": "Execution gates, prompt injection filtering, content moderation, safety verification",
      "SDK & Decision Frameworks": "SDKs, client libraries, decision abstractions, alternative runtimes",
      "Data & Search": "Information retrieval, vector search, dataset indexing, SQL extensions, web scraping",
      "Creative Tools": "Media synthesis, UI generation, generative art, music/canvas composition",
    },
  },
  integration_depth: {
    type: "score",
    instructions: "Rate the structural role of the Jev System One invocation in the tool's runtime behavior.",
    criteria: [
      "No executable System One invocation in source code; only names, prompts, tutorials, or documentation",
      "Auxiliary or wrapper invocation; program calls the API but its primary function remains intact if removed (e.g. client bindings, peripheral helpers, telemetry)",
      "Core decision spine; the primary behavior, branching, or terminal output directly hinges on this judgment (including lightweight CLIs, git hooks, routing gates, and MCP tools whose purpose is this decision)",
    ],
  },
});

/**
 * Evaluates candidate state with Jev System One.
 *
 * @param {Object} options
 * @param {Object|string} options.state - State object representing candidate evidence
 * @param {string} [options.apiKey] - TypeSafe API key (falls back to process.env.TYPESAFE_API_KEY)
 * @param {string} [options.endpoint] - API endpoint
 * @param {string} [options.model] - Model name
 * @param {typeof fetch} [options.fetchImpl] - Fetch implementation (for testing)
 * @param {number} [options.timeoutMs] - Request timeout in ms
 * @returns {Promise<Object>} Decision result
 */
export async function evaluateCandidateWithJev({
  state,
  apiKey = process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY,
  endpoint = process.env.TYPESAFE_ENDPOINT || process.env.JEV_ENDPOINT || DEFAULT_ENDPOINT,
  model = process.env.JEV_MODEL || DEFAULT_MODEL,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (!apiKey) {
    return {
      status: "skipped",
      reason: "not-configured",
      advisory: "No TYPESAFE_API_KEY configured; skipping Jev gatekeeper",
    };
  }

  if (!state || (typeof state === "object" && Object.keys(state).length === 0)) {
    return {
      status: "skipped",
      reason: "empty-state",
      advisory: "No candidate evidence state provided",
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(endpoint);
    if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
      return {
        status: "fallback",
        reason: "invalid-endpoint",
      };
    }
  } catch {
    return {
      status: "fallback",
      reason: "invalid-endpoint",
    };
  }

  const payload = {
    model,
    state,
    questions: JEV_GATE_QUESTIONS,
  };

  try {
    const signal = AbortSignal.timeout(timeoutMs);
    const response = await fetchImpl(endpoint, {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      response.body?.cancel().catch(() => {});
      return {
        status: "fallback",
        reason: `http-error-${response.status}`,
        httpStatus: response.status,
      };
    }

    const data = await response.json();
    const answers = data?.answers;

    if (!answers || typeof answers !== "object") {
      return {
        status: "fallback",
        reason: "invalid-response-structure",
      };
    }

    const noulVal = answers.is_genuine_jev?.noul;
    const probability = typeof noulVal === "number" ? noulVal : null;
    const isGenuine = probability !== null ? probability >= 0.8 : null;
    const isRejected = probability !== null ? probability < 0.2 : false;

    const categoryChoice = answers.category_choice?.choice;
    const categoryConfidence = answers.category_choice?.confidence ?? 0;
    const depthScore = answers.integration_depth?.score ?? null;

    return {
      status: "ok",
      model: data.model || model,
      isGenuine,
      isRejected,
      probability,
      category: categoryChoice,
      categoryConfidence,
      depthScore,
      answers,
    };
  } catch (error) {
    const isTimeout = error.name === "TimeoutError" || error.name === "AbortError";
    return {
      status: "fallback",
      reason: isTimeout ? "timeout" : "network-error",
      error: error.message,
    };
  }
}
