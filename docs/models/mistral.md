# Mistral

| Model | ID (examples) | Speed | Verdict |
|---|---|---|---|
| Mistral Large / Medium (latest in catalog) | `mistralai/mistral-large-*`, `mistralai/mistral-medium-*` | medium | ⚠️ good European-language writing |
| Devstral / Codestral | `mistralai/devstral-*`, `mistralai/codestral-*` | fast | ⚠️ fill-in-the-middle / autocomplete |
| Mistral 7B, Mixtral 8x7B / 8x22B | `mistralai/mistral-7b-instruct-v0.3`, `mistralai/mixtral-8x7b-instruct-v0.1` | fast | ❌ outdated |

## Notes

- The 7B and Mixtral generation is from 2023–24, and every modern model on this list beats it. The catalog keeps them for compatibility.
- The newer Mistral models are competent, especially for **French/German/Spanish/Italian** writing and for **code autocomplete** (Codestral-style FIM). They're rarely the best free option for agents.
- Low demand means they're rarely queued, so they make a reasonable fallback.
- Exact IDs vary; run `scripts/list_models.py -f mistralai`.
