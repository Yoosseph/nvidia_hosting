# OpenAI gpt-oss

OpenAI's open-weight models (Apache-2.0). They use MXFP4-quantized MoE with a very small active-param count, so they're fast and cheap to serve.

| Model | ID | Size (total / active) | Context | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|---|
| gpt-oss-120b | `openai/gpt-oss-120b` | 117B / 5.1B | 128K | ⚡ fast | low | ✅ |
| gpt-oss-20b | `openai/gpt-oss-20b` | 21B / 3.6B | 128K | ⚡⚡ very fast | low | ⚠️ simple tasks |

## gpt-oss-120b

- **Quality:** Artificial Analysis index ~33, a bit below Nemotron 3 Super (36). Good reasoning for its speed, with adjustable reasoning effort (low/medium/high).
- **Good at:** general Q&A, math, structured JSON output, tool calling, English-centric tasks.
- **Weaker at:** large agentic coding jobs, non-English, and anything needing up-to-date knowledge.
- **Verdict:** ✅ A dependable fast generalist. Set `reasoning_effort: low` for snappy replies.

## gpt-oss-20b

- **Good at:** lightweight chat, classification, short summaries.
- **Verdict:** ⚠️ Fine, but Nemotron 3.5 Lightning is usually both smarter and at least as fast on this endpoint.
