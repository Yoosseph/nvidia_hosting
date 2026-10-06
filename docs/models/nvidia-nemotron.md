# NVIDIA Nemotron

NVIDIA's own open models, served on NVIDIA's own endpoint. That's why they are the **most reliable and fastest** option on the free tier. They use hybrid Mamba-2 + Transformer MoE architectures designed for throughput.

| Model | ID | Size (total / active) | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning | `nvidia/nemotron-3.5-lightning-30b-a3b` | 30B / 3B | ⚡⚡ very fast | **low** | ✅ bulk / latency-critical |
| Nemotron 3 Super | `nvidia/nemotron-3-super-120b-a12b` | 120B / 12B | ⚡ fast | **low** | ✅ **best reliable daily driver** |
| Nemotron 3 Ultra | `nvidia/nemotron-3-ultra-550b-a55b` | 550B / 55B | medium–slow | 🧱 medium | ⚠️ |
| Older Nemotron (Llama-based 49B/70B/253B, Nano 9B, etc.) | `nvidia/llama-3.*-nemotron-*` | – | varies | low–medium | ❌ superseded by Nemotron 3 |

## Nemotron 3 Super: the safe default

Released March 11, 2026. It uses a hybrid Mamba2-Transformer **LatentMoE** with multi-token prediction.

- **Throughput:** NVIDIA reports up to **2.2× the throughput of gpt-oss-120b** and **7.5× that of Qwen3.5-122B** at 8K in / 64K out. Across API providers it measures ~145–500 tok/s.
- **Quality:** Artificial Analysis Intelligence Index ~36. It's clearly below GLM-5.2, Kimi K3 and DeepSeek V4, but solid for most everyday coding and agent steps.
- **Good at:** multi-agent pipelines, tool calling, code, cybersecurity triage, long generations.
- **Why people use it:** it just works. It's the default model in popular "free Claude Code" proxies for exactly that reason.
- **Verdict:** ✅ Put it first when reliability matters more than peak smarts, and use it as the fallback for everything else.

## Nemotron 3.5 Lightning: the speed demon

Released Aug 11, 2026. 30B total / **3B active**, a hybrid Mamba-2/MoE with some attention layers. NVIDIA ships speculative-decoding heads for it (DSpark, MTP, DFlash).

- **Good at:** classification, extraction, summarization, routing, RAG answer generation, autocomplete-style coding, anything high-volume.
- **Weaker at:** hard multi-step reasoning and large refactors.
- **Verdict:** ✅ The model to hammer with thousands of small calls. Rate limits are then the only thing slowing you down.

## Nemotron 3 Ultra

550B / 55B active. It scores **48** on the Artificial Analysis Intelligence Index, the highest of any US open-weight model at release (Super: 36, gpt-oss-120b: 33).

- **Bottleneck:** users report **HTTP 500s with reasoning enabled** on the hosted endpoint while Super works fine ([forum](https://forums.developer.nvidia.com/t/nemotron-3-ultra-550b-returns-http-500-through-hosted-nim-endpoint-while-super-120b-works/380727)). Some agent clients hang indefinitely in "thinking" ([opencode#34026](https://github.com/anomalyco/opencode/issues/34026)).
- **Verdict:** ⚠️ Worth a try when you want a US-origin model stronger than Super. For raw quality, GLM-5.2 or Kimi K3 are still better and about as available.

## Reasoning toggle

Nemotron models support reasoning on/off, usually via the system prompt (`/think` / `/no_think`) or `chat_template_kwargs`, depending on the version. Check the model card on build.nvidia.com. Turning reasoning off cuts latency dramatically.

## Sources

- [Nemotron 3 Super research page](https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/) · [Throughput notes (Raschka)](https://sebastianraschka.com/blog/2026/nemotron-3-super-throughput.html) · [DeepInfra latency benchmarks](https://deepinfra.com/blog/nvidia-nemotron-3-super-120b-api-benchmarks) · [Lightning model card](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard) · [Ultra review](https://www.buildfastwithai.com/blogs/nvidia-nemotron-3-ultra-review-2026)
