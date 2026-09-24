# Qwen (Alibaba)

Qwen has the widest range of sizes and the best multilingual coverage of any open family. Which Qwen versions have a **free hosted** endpoint varies; many newer ones (Qwen3.6/3.8) are published on NGC as downloadable NIM containers first. Run `scripts/list_models.py --probe` to see what you can actually call.

| Model | ID | Size (total / active) | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|
| Qwen3.5 397B-A17B | `qwen/qwen3.5-397b-a17b` | 397B / 17B | medium | medium | ✅ vision + multilingual |
| Qwen3.5 122B-A10B | `qwen/qwen3.5-122b-a10b` | 122B / 10B | ⚡ fast | low–medium | ✅ |
| Qwen3-Coder 480B | `qwen/qwen3-coder-480b-a35b-instruct` | 480B / 35B | medium–slow | medium | ⚠️ outclassed by GLM-5.2 |
| Qwen2.5 / 2.5-Coder (7B–32B) | `qwen/qwen2.5-*` | dense | fast | low | ❌ legacy |

## Qwen3.5 397B-A17B

A natively multimodal VLM: vision, chat, RAG and agents. NVIDIA published a guide on building [multimodal agents with it on GPU-accelerated endpoints](https://developer.nvidia.com/blog/develop-native-multimodal-agents-with-qwen3-5-vlm-using-nvidia-gpu-accelerated-endpoints/).

- **Good at:** screenshot/document understanding, OCR-ish tasks, multilingual (especially CJK) chat, RAG.
- **Verdict:** ✅ A strong alternative to MiniMax M3 for vision, and better at non-English text.

## Qwen3.5 122B-A10B

A mid-size agent-ready model with 10B active params.

- **Good at:** everyday coding, tool calling, multilingual chat at decent speed.
- **Verdict:** ✅ Comparable niche to Nemotron 3 Super. Pick whichever is less busy. Nemotron is usually faster on NVIDIA's endpoint.

## Qwen3-Coder

Was the top open coder in 2025. GLM-5.2, Kimi K3 and DeepSeek V4 have passed it. ⚠️ Use it only as a fallback.

## Newer Qwen (3.6 / 3.8)

Qwen3.8-27B (Apache-2.0) and Qwen3.8-Flash-Next (125B / 6B active, 262K native context) exist on NGC for self-hosting. If they show up as free hosted endpoints, Flash-Next's 6B active params should make it very fast. Treat them as **unverified** until you've probed them.

## Sources

- [Qwen3.5-397B on NGC](https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/containers/qwen3.5-397b-a17b) · [Qwen3.8-Flash-Next on GB300 (NVIDIA blog)](https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-on-nvidia-gb300-nvl72-for-agentic-coding/)
