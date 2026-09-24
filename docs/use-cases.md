# Best model by use case

Each row lists **Primary → Fallback → Fast/cheap option**. Model IDs are in the [README scorecard](../README.md#scorecard-flagship-chat-models).

| Use case | Primary | Fallback | Fast / cheap |
|---|---|---|---|
| [Coding agents](#coding-agents) | GLM-5.2 | Kimi K3 / MiniMax M3 | Nemotron 3 Super |
| Single-shot code generation | GLM-5.2 | DeepSeek V4.1 Flash | gpt-oss-120b |
| Code autocomplete / FIM | Codestral / Devstral | Qwen3.5-122B | Nemotron 3.5 Lightning |
| [Hard reasoning / math](#reasoning) | Kimi K3 | DeepSeek V4 Pro | DeepSeek V4.1 Flash |
| Research / web-browsing agents | MiniMax M3 | Kimi K3 | Nemotron 3 Super |
| Tool calling / MCP | MiniMax M3 | GLM-5.2 | Nemotron 3 Super |
| Images / screenshots / documents | Kimi K3 | Qwen3.5-397B, MiniMax M3 | Llama 3.2 11B Vision |
| Video understanding | MiniMax M3 | – | – |
| Very long documents (500K+ tokens) | DeepSeek V4.1 Flash | GLM-5.2, MiniMax M3 | Llama 4 Scout |
| RAG answer generation | Nemotron 3 Super | Qwen3.5-122B | Nemotron 3.5 Lightning |
| RAG retrieval | NVIDIA embed + rerank ([specialist](models/specialist.md)) | bge-m3 | – |
| Creative writing | Kimi K3 | GLM-5.2 | Llama 3.3 70B |
| Multilingual / CJK | Qwen3.5-397B | Kimi K3 | Qwen3.5-122B |
| European languages | Mistral Large/Medium | Qwen3.5-397B | Gemma 4 |
| Extraction / JSON / classification | gpt-oss-120b | Nemotron 3 Super | Nemotron 3.5 Lightning, Llama 3.1 8B |
| Chatbot (low latency) | Nemotron 3 Super (no-think) | gpt-oss-120b (low effort) | Nemotron 3.5 Lightning |
| Batch processing (thousands of calls) | Nemotron 3.5 Lightning | gpt-oss-20b | Llama 3.1 8B |
| Content moderation | Llama Guard / Nemotron safety | – | – |

## Coding agents

For tools like Cline, OpenCode, Aider, Continue, or Claude Code via a proxy:

1. **Default model:** `z-ai/glm-5.2`, the best agentic coding scores among free models.
2. **Planner / "big brain":** `moonshotai/kimi-k3` for architecture decisions and hard bugs.
3. **Fast worker / fallback:** `nvidia/nemotron-3-super-120b-a12b`. It rarely fails, so keep it configured as the fallback.
4. **Avoid in agent loops:** DeepSeek V4 Pro on the free tier (queues, tool-call streaming issues) and dense Llama 405B.

Set client timeouts to 300s+, enable streaming, and cap `max_tokens`. See [Bottlenecks](bottlenecks.md).

## Reasoning

For math, logic and science: Kimi K3 at max reasoning effort is the strongest. DeepSeek V4.1 Flash with thinking enabled gets surprisingly close and is faster. Be patient; minutes of thinking are normal.

## Latency-sensitive apps

If users are waiting on the response:

- Disable thinking.
- Use models with ≤12B active params (Nemotron 3 Super, Nemotron 3.5 Lightning, gpt-oss, Qwen3.5-122B).
- Stream tokens to the UI.
- Remember the free tier is for prototyping. Budget for a paid endpoint before launch.
