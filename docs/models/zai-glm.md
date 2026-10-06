# Z.ai GLM

| Model | ID | Size (total / active) | Context | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|---|
| GLM-5.2 | `z-ai/glm-5.2` | 753B / ~40B | 1M (128K out) | medium–slow | medium | ✅ **best coding model on the free tier** |
| GLM-5.1 / 5.x | `z-ai/glm-5.1` etc. | – | – | medium | medium | ⚠️ fallback only |

## GLM-5.2

Released June 13, 2026, MIT license. It's built specifically for **long-horizon autonomous coding** and uses IndexShare sparse attention for its 1M context.

- **Quality:** the strongest open-weight model on standard coding benchmarks at release. **62.1 on SWE-bench Pro** (above GPT-5.5's 58.6) and **81.0 on Terminal-Bench 2.1**, trailing the very top closed model by only a few points. It's within about 1% of the leader on FrontierSWE.
- **Good at:** agentic coding (multi-file edits, running tests, fixing CI), terminal/shell tasks, refactors, repo-scale reasoning.
- **Weaker at:** image input (text-only; use Kimi K3 or MiniMax M3 for vision).
- **Speed:** ~40B active puts it in the medium-slow band, faster than DeepSeek V4 Pro and Kimi K3.
- **Bottleneck:** moderate. Popular with coding-agent users, but reports of hard failures are rarer than for DeepSeek.
- **Verdict:** ✅ Make this your default in Cline / OpenCode / Aider / Claude-Code-proxy setups. Pair it with Nemotron 3 Super as a fast fallback.

## Sources

- [Z.ai docs](https://docs.z.ai/guides/llm/glm-5.2) · [VentureBeat](https://venturebeat.com/technology/z-ais-open-weights-glm-5-2-beats-gpt-5-5-on-multiple-long-horizon-coding-benchmarks-for-1-6th-the-cost) · [MorphLLM spec sheet](https://www.morphllm.com/glm-5-2)
