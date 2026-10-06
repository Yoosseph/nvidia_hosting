# MiniMax

| Model | ID | Size (total / active) | Context | Speed | Bottleneck | Verdict |
|---|---|---|---|---|---|---|
| MiniMax M3 | `minimaxai/minimax-m3` | 428B / ~23B | 1M (≥512K guaranteed) | medium | medium | ✅ agents + vision |
| MiniMax M2.7 / M2.x | `minimaxai/minimax-m2.7` etc. | ~230B / ~10B | ~200K | fast | low–medium | ⚠️ good fast fallback |

## MiniMax M3

Released June 1, 2026. MiniMax pitches it as the first open-weight model to combine **reasoning, agentic coding and multimodality** (native image **and video** input) in one model. It uses MiniMax Sparse Attention.

- **Benchmarks:** SWE-bench Pro **59.0%**, Terminal-Bench 2.1 **66.0%**, MCP Atlas (tool use) **74.2%**, BrowseComp **83.5** (above a leading closed model's 79.3).
- **Good at:** web-browsing/research agents, MCP tool use, coding with screenshots, video/image understanding.
- **Speed:** ~23B active. Noticeably quicker than GLM-5.2 and Kimi K3.
- **Verdict:** ✅ The best pick when your agent needs to **see** things or call many tools. GLM-5.2 is a bit stronger on pure terminal coding.

## MiniMax M2.x

Small active-parameter count, so it's fast. Still a capable coder/agent. Use it when M3 is busy or you want speed over peak quality.

## Sources

- [MiniMax M3 page](https://www.minimax.io/models/text/m3) · [VentureBeat](https://venturebeat.com/technology/minimax-m3-debuts-eclipsing-gpt-5-5-and-gemini-3-1-pro-on-key-benchmark-performance-for-just-5-10-of-the-cost) · [Artificial Analysis](https://artificialanalysis.ai/models/minimax-m3)
