# Bottlenecks & limits

"Free" doesn't mean unlimited. Here's what will slow you down and how to work around it.

## The limits

| Limit | Typical value | Notes |
|---|---|---|
| Requests per minute | **~40 RPM** (some models 60) | Per model, per account. Newer launches like Kimi K3 have been reported at 60 RPM. |
| Credits | ~1,000 on signup, up to ~5,000 on request | Some write-ups describe credits; others describe a daily request/token quota. NVIDIA has changed this more than once, so check your account page. |
| Concurrency | Not published | Many parallel streams to one model will get 429s long before you hit RPM. |
| Terms | Development / prototyping | Not licensed for production traffic. Move to a paid provider or self-hosted NIM for that. |

## Why some models "giga bottleneck"

On a shared GPU pool, three things decide whether a model feels instant or dead:

### 1. Active parameters (the biggest factor)

Most modern models are **Mixture-of-Experts (MoE)**. Only a slice of the weights ("active params") runs per token, and that slice is what sets generation speed.

| Active params per token | What to expect on the free tier |
|---|---|
| ≤ 5B (Nemotron 3.5 Lightning, gpt-oss) | Very fast, often 100+ tok/s |
| 10–25B (Nemotron 3 Super, Qwen3.5-122B, DeepSeek V4 Flash, MiniMax M3) | Fast to medium |
| 40–55B (GLM-5.2, DeepSeek V4 Pro, Nemotron 3 Ultra) | Medium to slow |
| Trillion-scale total (Kimi K3) | Slow and heavy; also needs the most GPUs per replica, so the fewest replicas exist |
| **Dense** 70B+ (Llama 3.3 70B, 3.1 405B) | Slow for the quality you get; every param is active |

### 2. Demand

The endpoint is shared by everyone. The newest open model, especially one trending on social media, gets hammered. Reported symptoms:

- DeepSeek V4 Flash/Pro: "hundreds of requests in queue" followed by internal server errors, and failing more than half the time for some users ([forum](https://forums.developer.nvidia.com/t/nvidia-nim-is-too-slow-via-api-for-deepseek-models/368959))
- Llama 3.3 70B: 504 Gateway Timeouts and slower speeds ([forum](https://forums.developer.nvidia.com/t/experiencing-504-gateway-timeout-slower-inference-speed-with-llama3-3-70b-on-nim-api/330894))
- DeepSeek 3.1: repeated gateway timeouts ([forum](https://forums.developer.nvidia.com/t/repeated-gateway-timeout-errors-with-deepseek-3-1/345504))
- Nemotron 3 Ultra: HTTP 500 with reasoning enabled while Super works ([forum](https://forums.developer.nvidia.com/t/nemotron-3-ultra-550b-returns-http-500-through-hosted-nim-endpoint-while-super-120b-works/380727))

**Rule of thumb:** NVIDIA's own Nemotron models are the most consistently available, because NVIDIA is showcasing them. Hyped third-party frontier models are the least available in their first weeks.

### 3. Reasoning tokens

"Thinking" models can spend thousands of hidden tokens before the first visible word. A 20-second wait for a reply may be a model that's working fine and just thinking. For latency-sensitive work:

- Turn thinking off (`chat_template_kwargs`, see [Getting started](getting-started.md#reasoning-models-hang-without-chat_template_kwargs)), or
- Use a non-reasoning model (Llama, Mistral, Nemotron with `/no_think`).

## How to avoid getting stuck

1. **Stream.** Always use `stream: true` for big models. It avoids gateway timeouts on long generations and shows you right away whether the model is alive.
2. **Raise client timeouts** to 300s+ for Kimi K3 / DeepSeek V4 Pro / GLM-5.2. Some agent tools default to 5–60s.
3. **Have a fallback chain.** For example: `z-ai/glm-5.2` → `nvidia/nemotron-3-super-120b-a12b` → `nvidia/nemotron-3.5-lightning-30b-a3b`. LiteLLM and most routers support this.
4. **Retry with backoff** on 429/500/502/503/504 (e.g. 2s, 4s, 8s, 16s). Don't hammer.
5. **Route by task.** Use a fast model for classification, extraction and summarization, and save the slow giants for the hard 10%.
6. **Cap `max_tokens`.** Runaway reasoning is the most common cause of "it never finished".
7. **Check it's not you.** If one model hangs but the official Python example works, your client is probably stripping `chat_template_kwargs` or capping context ([example](https://github.com/anomalyco/opencode/issues/34026)).
8. **Measure.** Run [`scripts/bench.py`](../scripts/bench.py) at the time of day you'll actually use it. Free-tier latency varies a lot by hour.

## When to stop using the free tier

Move to paid or self-hosted inference when you need any of: predictable latency, customer-facing uptime, batch jobs at scale, long multi-agent runs, commercial guarantees, or a model that won't be retired from the catalog without notice.
