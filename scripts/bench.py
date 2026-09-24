#!/usr/bin/env python3
"""Benchmark free NVIDIA-hosted models: time-to-first-token, tokens/sec, failures.

    export NVIDIA_API_KEY=nvapi-...
    python scripts/bench.py                               # default model set
    python scripts/bench.py -m z-ai/glm-5.2 --runs 5
    python scripts/bench.py --out results/2026-09-24.md   # write a Markdown report

Thinking is disabled by default (via chat_template_kwargs) so models are compared
on raw generation speed. Use --thinking to measure with reasoning on.
"""

import argparse
import datetime
import os
import socket
import statistics
import time

from _nim import HTTPError, URLError, stream_chat

DEFAULT_MODELS = [
    "moonshotai/kimi-k3",
    "z-ai/glm-5.2",
    "deepseek-ai/deepseek-v4-pro",
    "deepseek-ai/deepseek-v4.1-flash",
    "deepseek-ai/deepseek-v4-flash",
    "minimaxai/minimax-m3",
    "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3.5-lightning-30b-a3b",
    "qwen/qwen3.5-397b-a17b",
    "qwen/qwen3.5-122b-a10b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.1-8b-instruct",
]

PROMPT = (
    "Write a Python function `merge_intervals(intervals)` that merges overlapping "
    "intervals, then explain its time complexity in two sentences."
)


def run_once(model, args):
    extra = {"chat_template_kwargs": {"thinking": args.thinking, "enable_thinking": args.thinking}}
    try:
        return stream_chat(model, [{"role": "user", "content": PROMPT}],
                           max_tokens=args.max_tokens, timeout=args.timeout, extra=extra), None
    except HTTPError as e:
        return None, f"HTTP {e.code}"
    except (URLError, socket.timeout, TimeoutError) as e:
        return None, f"timeout/{type(e).__name__}"
    except Exception as e:  # malformed stream etc. -- record it, keep benchmarking
        return None, type(e).__name__


def fmt(x, unit=""):
    return "–" if x is None else f"{x:.1f}{unit}"


def med(values):
    values = [v for v in values if v is not None]
    return statistics.median(values) if values else None


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("-m", "--model", action="append", help="model ID (repeatable); default: curated set")
    p.add_argument("--runs", type=int, default=3)
    p.add_argument("--max-tokens", type=int, default=400)
    p.add_argument("--timeout", type=int, default=180)
    p.add_argument("--delay", type=float, default=2.0, help="seconds between requests")
    p.add_argument("--thinking", action="store_true", help="enable reasoning/thinking mode")
    p.add_argument("--out", help="write Markdown report to this path")
    args = p.parse_args()

    models = args.model or DEFAULT_MODELS
    rows = []
    for model in models:
        stats, errors = [], []
        for i in range(args.runs):
            s, err = run_once(model, args)
            if err:
                errors.append(err)
            else:
                stats.append(s)
            print(f"{model} run {i + 1}/{args.runs}: "
                  + (err or f"ttft {fmt(s['ttft'], 's')}, {fmt(s['tok_per_s'])} tok/s, total {fmt(s['total'], 's')}"),
                  flush=True)
            time.sleep(args.delay)
        rows.append((model, med([s["ttft"] for s in stats]), med([s["tok_per_s"] for s in stats]),
                     med([s["total"] for s in stats]), len(errors), sorted(set(errors))))

    now = datetime.datetime.now().astimezone()
    lines = [
        f"# Benchmark {now:%Y-%m-%d %H:%M %Z}",
        "",
        f"runs={args.runs} · max_tokens={args.max_tokens} · thinking={'on' if args.thinking else 'off'} "
        f"· timeout={args.timeout}s · medians of successful runs",
        "",
        "| Model | TTFT | Tokens/s | Total | Failures |",
        "|---|---|---|---|---|",
    ]
    for model, ttft, tps, total, nfail, errs in rows:
        fail = f"{nfail}/{args.runs}" + (f" ({', '.join(errs)})" if errs else "")
        lines.append(f"| `{model}` | {fmt(ttft, 's')} | {fmt(tps)} | {fmt(total, 's')} | {fail} |")
    report = "\n".join(lines) + "\n"

    print("\n" + report)
    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w") as f:
            f.write(report)
        print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
