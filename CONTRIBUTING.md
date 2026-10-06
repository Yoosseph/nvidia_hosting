# Contributing

## Setup and checks

Use Node.js 24 or later, run `npm ci`, then `npm run dev`. Bring your own NVIDIA API key through Settings or an ignored `.env` file.

Before opening a pull request, run:

```sh
npm test
npm run models:check
npm run check:secrets
npm run build
```

Keep changes focused, explain the resulting behavior, and include relevant validation. Preserve the minimal interface and support both themes and narrow screens. Never commit keys, private prompts, environment files, or generated build output.

## Models

Update the API snapshot with `npm run models:sync`, then regenerate examples with `npm run models:generate`. Add website entries to `data/nvidia-catalog.json` only with a verified NVIDIA page link. API IDs can differ from website slugs; preserve exact API IDs and cover aliases with a test.

Generated Python files use the shared `models/_client.py`. Specialized models need their own endpoint and payload; do not represent them as working text chat models.

## Model notes and benchmarks

Existing research lives in `docs/`. Link primary sources for factual changes. Separate measured results from estimates and avoid unsupported claims about free access, quotas, speed, or quality.

Standalone benchmark helpers remain under `scripts/`:

```sh
python scripts/list_models.py
python scripts/bench.py --runs 3 --out results/benchmark.md
```

These scripts use `NVIDIA_API_KEY` from the process environment. Review reports before committing them and exclude credentials, private prompts, and machine identifiers.

Report sensitive vulnerabilities through the process in [SECURITY.md](SECURITY.md), not public issues.
