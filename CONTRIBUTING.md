# Contributing

The most valuable contribution is **real measurements**. Speed and reliability on the free tier change by the week and even by the hour.

## Add benchmark results

```bash
export NVIDIA_API_KEY="nvapi-..."
python scripts/bench.py --runs 3 --out results/$(date +%Y-%m-%d)-$(whoami).md
```

This writes a Markdown table with time-to-first-token, tokens/sec, total latency and failure count for each model. Open a PR adding the file under `results/`, and mention your time zone and time of day in the PR description.

Benchmark specific models:

```bash
python scripts/bench.py -m z-ai/glm-5.2 -m moonshotai/kimi-k3 --runs 5
```

## Update a model page

- Keep the table format: **ID · size · speed · bottleneck · verdict**.
- Link a source for every claim (forum thread, GitHub issue, model card, benchmark).
- Separate *measured* from *expected*. Measured claims should cite a file in `results/`.
- If a model gets retired from the free endpoint, don't delete it. Mark it `❌ retired (YYYY-MM)`.

## Add a new model

1. Confirm it's live with `python scripts/list_models.py --probe`.
2. Add it to the relevant family page in `docs/models/` (or create one).
3. Add a row to the scorecard in `README.md` and, if it's a top pick, to `docs/use-cases.md`.
4. Add its ID to `DEFAULT_MODELS` in `scripts/bench.py`.
