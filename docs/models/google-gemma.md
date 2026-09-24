# Google Gemma

Gemma models are small, open and fast. The newest generation (Gemma 4) comes in dense and MoE variants up to ~31B. Artificial Analysis rated Gemma 4 31B at 39, the best US open-weight model before Nemotron 3 Ultra.

| Model | ID (examples) | Speed | Verdict |
|---|---|---|---|
| Gemma 4 (≈31B dense / MoE) | `google/gemma-4-*` | ⚡ fast | ✅ small-model pick |
| Gemma 3 / 2, CodeGemma | `google/gemma-3-*`, `google/gemma-2-*` | ⚡ fast | ❌ legacy |

## Notes

- **Good at:** quick multilingual chat, summarization, light vision (Gemma 3+ accept images), prototyping things you'll later run **locally**. The same weights run on a laptop GPU.
- **Weaker at:** long agentic coding runs.
- If you plan to deploy on-device eventually, prototype with Gemma here so the behavior matches.
- Check exact IDs with `scripts/list_models.py -f google`.
