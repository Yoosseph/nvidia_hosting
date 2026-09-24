# DeepSeek

The strongest models per dollar of compute, and the most congested on the free tier. All V4-generation models are MIT-licensed with 1M-token context.

| Model | ID | Size (total / active) | Context | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|---|
| DeepSeek V4.1 Flash | `deepseek-ai/deepseek-v4.1-flash` | 552B / 8B in, 16B out | 1M | medium | 🧱 medium–high | ✅ best DeepSeek to try |
| DeepSeek V4 Pro | `deepseek-ai/deepseek-v4-pro` | 1.6T / 49B | 1M (384K out) | 🐢 slow | 🧱 **high** | ⚠️ |
| DeepSeek V4 Flash | `deepseek-ai/deepseek-v4-flash` | 284B / 13B | 1M (384K out) | medium | 🧱 medium–high | ⚠️ use V4.1 Flash instead |
| Older (V3.x, R1 distills) | `deepseek-ai/deepseek-v3.*` etc. | – | 128K | varies | medium | ❌ superseded |

## DeepSeek V4.1 Flash

Released Sept 10, 2026. It uses a new causal encoder-decoder MoE, activating 8B params for input and 16B for output. DeepSeek reports it beats V4 Pro on many benchmarks, and it adds **native image understanding**. Its KV cache is about a quarter of V4 Flash's, so long contexts are cheaper to serve.

- **Good at:** coding, math, reasoning, long documents, image+text questions.
- **Speed:** should be the fastest DeepSeek on paper. It's new, so expect launch-week queueing.
- **Verdict:** ✅ Try it first when you want DeepSeek. Keep a fallback configured.

## DeepSeek V4 Pro

1.6T total / 49B active. The base model beats V3.2 and V4 Flash across nearly everything, with big gains on knowledge-heavy and long-context evals.

- **Good at:** knowledge-heavy Q&A, hard reasoning, long-context analysis, serious coding.
- **Speed:** slow. 49B active per token plus heavy demand.
- **Bottleneck:** the worst on the platform by user reports. Queues of hundreds of requests, internal server errors, and >50% failure rates at times ([forum](https://forums.developer.nvidia.com/t/nvidia-nim-is-too-slow-via-api-for-deepseek-models/368959)). Some keys needed the "Public API Endpoints" permission before it responded at all.
- **Verdict:** ⚠️ Excellent model, painful free-tier experience. Use it for occasional one-off hard questions, not agent loops. For agents, use GLM-5.2 or Kimi K3.

## DeepSeek V4 Flash

284B / 13B active. Benchmarks say **Flash at max reasoning effort ≈ Pro at high effort** on reasoning tasks, so you rarely need Pro. A `-0731` checkpoint variant also appears in some catalogs.

- **Good at:** fast coding and agent tasks, general reasoning.
- **Verdict:** ⚠️ Was the go-to cheap coder. Now superseded by V4.1 Flash; use it only if 4.1 isn't live for you.

## Must-know settings

- Send `chat_template_kwargs: {"thinking": true, "enable_thinking": true}` (or `false` to disable) at the request root. Without it, some clients **hang forever** ([opencode#24264](https://github.com/anomalyco/opencode/issues/24264)).
- Multi-turn chats may require passing `reasoning_content` back ([opencode#24124](https://github.com/anomalyco/opencode/issues/24124)).
- Streaming tool calls have been flaky through Anthropic-compatible proxies ([forum](https://forums.developer.nvidia.com/t/deepseek-v4-pro-v4-flash-on-nvidia-nim-streaming-tool-calls-do-not-continue-in-claude-code-anthropic-compatible-agent-workflow/368085)).

## Sources

- [DeepSeek-V4 paper](https://arxiv.org/pdf/2606.19348) · [V4.1 Flash announcement](https://www.deepseek.com/en/news/deepseek-v4-1-flash/) · [V4 Pro vs Flash](https://codersera.com/blog/deepseek-v4-pro-vs-flash/)
