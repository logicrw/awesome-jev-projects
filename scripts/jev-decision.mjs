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
    instructions: "Does this repository contain real, executable integration or implementation of the Jev API in source code, tools, SDKs, or runtimes (rather than just prompt lists, tutorials, or unrelated content)?",
  },
  category_choice: {
    type: "choice",
    instructions: "Which category best fits this project's primary contribution?",
    criteria: {
      "Browser & OS Action": "Browser automation, DOM interaction, desktop OS controls",
      "MCP & Integrations": "Model Context Protocol tools, gateways, and MCP servers",
      "CLI & Pipelines": "Command-line tools, git hooks, build pipelines, and terminal utilities",
      "Routing & Cost Optimization": "LLM model routing, tiered dispatch, cost reduction",
      "Context GC & Filter": "Context pruning, memory compaction, history management",
      "Security & Guardrails": "Execution gates, content filtering, safety verification",
      "Evaluation & Observability": "Benchmarking, test frameworks, agent monitoring",
      "Domain & Vertical Tools": "Domain-specific vertical tools, quant finance, specialized workflows",
      "High-Frequency & Simulation": "Games, simulators, high-frequency decision loops",
      "SDK & Decision Frameworks": "SDKs, client libraries, decision abstractions, alternative runtimes",
    },
  },
  integration_depth: {
    type: "score",
    instructions: "Rate the depth and engineering substance of the Jev integration.",
    criteria: [
      "Derivative text, prompt collection, or trivial mention without executable Jev calls",
      "Wrapper, adapter, or helper library interfacing with Jev API",
      "Deep, core-logic engineering integration or drop-in Jev runtime service",
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

  const payload = {
    model,
    state,
    questions: JEV_GATE_QUESTIONS,
  };

  try {
    const signal = AbortSignal.timeout(timeoutMs);
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
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
