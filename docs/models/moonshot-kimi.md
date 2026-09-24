# Moonshot Kimi

| Model | ID | Size | Context | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|---|
| Kimi K3 | `moonshotai/kimi-k3` | 2.8T MoE (16 of 896 experts active) | 1M | 🐢 slow | 🧱 medium–high | ✅ for hard problems |
| Kimi K2.6 / K2.x | `moonshotai/kimi-k2.6` etc. | ~1T MoE | 256K | medium | medium | ⚠️ only if K3 is jammed |

## Kimi K3

Released July 16, 2026; weights opened July 27. At 2.8T parameters it's the **largest open-weight model ever released**. It's multimodal (text + images) and built for long-horizon coding and agentic tool use. It uses KDA + MLA hybrid attention and Moonshot claims about 2.5× scaling efficiency over K2.

- **Quality:** frontier. On GDPval-AA v2 (real-world tasks across 44 occupations) it scored 1,687, **third overall** behind only the top closed models. It also beat a leading closed model on Frontend Code Arena.
- **Good at:** complex multi-step agents, frontend/UI code, research synthesis, office-style deliverables, image understanding, long documents.
- **Speed:** slow. Huge models need many GPUs per replica, so fewer replicas serve everyone. Expect long time-to-first-token, especially with max reasoning.
- **Bottleneck:** launched on NIM at **60 RPM**, and early users said it "works perfectly". Popularity makes queueing likely at peak hours.
- **Verdict:** ✅ The best quality you can get for free. Use it as the "big brain" model: planning, hard bugs, final review. Don't use it for high-volume simple calls.

**Settings:** Moonshot's benchmark settings are `temperature=1.0`, with `top_p=0.95` for single-step tasks and `1.0` for agentic tasks. Lower reasoning effort if latency matters.

## Kimi K2.x

The previous generation (K2, K2.5, K2.6) is still strong at agentic coding and tool calls. If K2.6 is still in your catalog, it's a reasonable fallback when K3 is queued. Some users hit indefinite hangs until they added the "Public API Endpoints" key permission ([forum](https://forums.developer.nvidia.com/t/newer-nim-models-kimi-k2-6-deepseek-v4-pro-hang-indefinitely-or-404-possible-missing-public-api-endpoints-permission/377777)).

## Sources

- [Kimi K3 on build.nvidia.com](https://build.nvidia.com/moonshotai/kimi-k3) · [NIM API reference](https://docs.api.nvidia.com/nim/reference/moonshotai-kimi-k3) · [GitHub: MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) · [VentureBeat](https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems) · [60 RPM report](https://x.com/SourceCodeplz/status/2093309851757645880)
