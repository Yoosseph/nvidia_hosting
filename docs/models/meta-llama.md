# Meta Llama

The catalog still has plenty of Llama models. Mostly they're older and **dense**: every parameter runs on every token, so they're slow for the quality you get. Their one real advantage is that they're predictable. There are no reasoning tokens and no special kwargs, and every tool supports them.

| Model | ID | Speed | Bottleneck | Verdict |
|---|---|---|---|---|
| Llama 3.1 8B Instruct | `meta/llama-3.1-8b-instruct` | ⚡⚡ very fast | low | ✅ trivial tasks |
| Llama 3.3 70B Instruct | `meta/llama-3.3-70b-instruct` | medium | medium (504s reported) | ⚠️ legacy |
| Llama 3.1 405B Instruct | `meta/llama-3.1-405b-instruct` | 🐢 very slow | high | ❌ |
| Llama 4 Scout / Maverick | `meta/llama-4-scout-17b-16e-instruct`, `meta/llama-4-maverick-17b-128e-instruct` | fast | low | ⚠️ |
| Llama 3.2 11B / 90B Vision | `meta/llama-3.2-11b-vision-instruct` | medium | low | ⚠️ basic vision only |
| Llama Guard | `meta/llama-guard-*` | fast | low | see [specialist](specialist.md) |

## Notes

- **3.1 8B:** great as a router, classifier, or keyword extractor. Don't ask it to code anything real.
- **3.3 70B:** decent writing and instruction following, but any modern MoE (Nemotron 3 Super, gpt-oss-120b, Qwen3.5-122B) beats it and is faster. 504 Gateway Timeouts have been reported ([forum](https://forums.developer.nvidia.com/t/experiencing-504-gateway-timeout-slower-inference-speed-with-llama3-3-70b-on-nim-api/330894)).
- **3.1 405B:** huge, dense and slow, and outclassed by models with 10× fewer active params. Skip it.
- **Llama 4 Scout/Maverick:** MoE with 17B active and fast, but quality is middling for 2026. Fine for long-context summarization (Scout has a very long context window).
- **Vision (3.2):** works for simple captioning. Use Qwen3.5-397B, MiniMax M3 or Kimi K3 for anything serious.
