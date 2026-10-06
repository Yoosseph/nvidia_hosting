# NVIDIA Free Model Guide

NVIDIA's [build.nvidia.com](https://build.nvidia.com) lets anyone with a free NVIDIA Developer account get an `nvapi-` key. With it you can call 100+ open-weight models on NVIDIA's DGX Cloud, and nothing is billed per token. The catalog is big, and it doesn't tell you which models are good, which are fast, or which will sit in a queue and time out.

This repo answers that. Every model page covers:

- **What it's good at**: coding, agents, chat, vision, long documents, and so on.
- **Speed**: how fast it responds on the *free hosted* endpoint.
- **Bottleneck risk**: whether it holds up or sits in a queue and times out.
- **Verdict**: worth running, situational, or skip.

> **Last updated:** September 2026. The catalog changes weekly, so run
> [`scripts/list_models.py`](../scripts/list_models.py) to see what is live for your key today, and
> [`scripts/bench.py`](../scripts/bench.py) to measure speed yourself. See [Methodology](#methodology).

---

## TL;DR: what should I use?

| I want… | Use this | Model ID | Why |
|---|---|---|---|
| **Best overall coding / agent work** | GLM-5.2 | `z-ai/glm-5.2` | Top open-weight SWE-bench Pro score; reliable tool calls |
| **Hardest reasoning, research, long tasks** | Kimi K3 | `moonshotai/kimi-k3` | Largest open model (2.8T); frontier-level quality |
| **Fast *and* smart daily driver** | Nemotron 3 Super | `nvidia/nemotron-3-super-120b-a12b` | NVIDIA's own model on NVIDIA's own infra: fast and rarely queued |
| **Raw speed / high volume** | Nemotron 3.5 Lightning | `nvidia/nemotron-3.5-lightning-30b-a3b` | 3B active params, built for throughput |
| **Cheap-to-serve strong coder** | DeepSeek V4 Flash / V4.1 Flash | `deepseek-ai/deepseek-v4-flash` | Very good per active param, but see bottleneck notes |
| **Images + text (multimodal)** | MiniMax M3 or Qwen3.5-397B | `minimaxai/minimax-m3` | Native image input plus strong agentic skill |
| **Classic, predictable, no reasoning tokens** | Llama 3.3 70B | `meta/llama-3.3-70b-instruct` | Boring and stable; fine for simple chat/extraction |
| **Tiny/instant (classification, routing)** | Llama 3.1 8B | `meta/llama-3.1-8b-instruct` | Near-instant responses |

## Scorecard (flagship chat models)

Legend: ⚡ fast · 🐢 slow · 🧱 high bottleneck risk (queues, 504s, hangs) · ✅ worth it · ⚠️ situational · ❌ skip

| Model | Size (total / active) | Quality | Free-tier speed | Bottleneck risk | Verdict |
|---|---|---|---|---|---|
| [Kimi K3](models/moonshot-kimi.md) | 2.8T / MoE | ★★★★★ | 🐢 slow | 🧱 medium–high | ✅ for hard problems only |
| [GLM-5.2](models/zai-glm.md) | 753B / ~40B | ★★★★★ | 🐢 medium–slow | medium | ✅ best coding pick |
| [DeepSeek V4 Pro](models/deepseek.md) | 1.6T / 49B | ★★★★★ | 🐢 slow | 🧱 **high** | ⚠️ great model, bad free-tier experience |
| [DeepSeek V4.1 Flash](models/deepseek.md) | 552B / 8–16B | ★★★★☆ | medium | 🧱 medium–high | ✅ if it's not queued |
| [DeepSeek V4 Flash](models/deepseek.md) | 284B / 13B | ★★★★☆ | medium | 🧱 medium–high | ⚠️ superseded by V4.1 Flash |
| [MiniMax M3](models/minimax.md) | 428B / ~23B | ★★★★☆ | medium | medium | ✅ agents + vision |
| [Nemotron 3 Ultra](models/nvidia-nemotron.md) | 550B / 55B | ★★★★☆ | 🐢 medium–slow | 🧱 medium (500s w/ reasoning) | ⚠️ |
| [Nemotron 3 Super](models/nvidia-nemotron.md) | 120B / 12B | ★★★☆☆+ | ⚡ fast | **low** | ✅ best reliability |
| [Nemotron 3.5 Lightning](models/nvidia-nemotron.md) | 30B / 3B | ★★★☆☆ | ⚡⚡ very fast | **low** | ✅ bulk/cheap tasks |
| [Qwen3.5 397B](models/qwen.md) | 397B / 17B | ★★★★☆ | medium | medium | ✅ vision/multilingual |
| [Qwen3.5 122B](models/qwen.md) | 122B / 10B | ★★★☆☆+ | ⚡ fast | low–medium | ✅ |
| [gpt-oss-120b](models/openai-gpt-oss.md) | 117B / 5.1B | ★★★☆☆ | ⚡ fast | low | ✅ solid general pick |
| [gpt-oss-20b](models/openai-gpt-oss.md) | 21B / 3.6B | ★★☆☆☆ | ⚡⚡ very fast | low | ⚠️ simple tasks |
| [Llama 3.3 70B](models/meta-llama.md) | 70B dense | ★★☆☆☆ | medium | medium (504s reported) | ⚠️ legacy |
| [Llama 3.1 8B](models/meta-llama.md) | 8B dense | ★☆☆☆☆ | ⚡⚡ very fast | low | ✅ trivial tasks only |
| [Llama 3.1 405B](models/meta-llama.md) | 405B dense | ★★☆☆☆ | 🐢 very slow | high | ❌ outclassed |
| [Mistral / Mixtral](models/mistral.md) | varies | ★★☆☆☆ | fast | low | ❌ mostly outdated |
| [Gemma](models/google-gemma.md) | 2B–31B | ★★☆☆☆–★★★☆☆ | ⚡ fast | low | ⚠️ small/on-device style work |

Quality stars are relative to each other within this list, not an absolute benchmark. Speed and bottleneck ratings describe the **free shared endpoint**, not the model on dedicated hardware.

## Docs

- [Getting started](getting-started.md): get a key, first request, SDK setup, the `chat_template_kwargs` gotcha
- [Bottlenecks & limits](bottlenecks.md): rate limits, why big models queue, how to avoid timeouts
- [Best model by use case](use-cases.md): coding, agents, RAG, vision, writing, extraction, translation
- **Model families:**
  - [DeepSeek](models/deepseek.md)
  - [Moonshot Kimi](models/moonshot-kimi.md)
  - [Z.ai GLM](models/zai-glm.md)
  - [MiniMax](models/minimax.md)
  - [NVIDIA Nemotron](models/nvidia-nemotron.md)
  - [Qwen](models/qwen.md)
  - [OpenAI gpt-oss](models/openai-gpt-oss.md)
  - [Meta Llama](models/meta-llama.md)
  - [Mistral](models/mistral.md)
  - [Google Gemma](models/google-gemma.md)
  - [Embeddings, rerankers, safety & speech](models/specialist.md)
- [Contributing benchmark results](../CONTRIBUTING.md)

## Methodology

Ratings come from three inputs:

1. **Architecture.** On a shared endpoint, decode speed tracks *active* parameters per token far more than total size. A 30B/3B-active MoE is fast; a 1.6T/49B-active MoE is slow. Dense 70B+ models are slow for their quality.
2. **Demand.** The free tier is shared. The newest and most hyped models (DeepSeek, Kimi) draw the most traffic, so they queue the most. NVIDIA's own Nemotron models are the most consistently served.
3. **Community reports** from NVIDIA Developer Forums, GitHub issues in agent tools (OpenCode, free-claude-code, etc.), and write-ups, linked on each model page.

These are **not** measured numbers from this repo yet. Run [`scripts/bench.py`](../scripts/bench.py) with your key and PR the results into [`results/`](../CONTRIBUTING.md) so the tables can carry real TTFT / tokens-per-second data.

## Disclaimer

This is a community guide, not affiliated with NVIDIA. Free-tier terms, limits and the model list are set by NVIDIA and change without notice. The free API is intended for development and prototyping, not production traffic.
