#!/usr/bin/env python3
"""List models on NVIDIA's free API, optionally probing which chat models respond.

    python scripts/list_models.py                 # all IDs
    python scripts/list_models.py -f nvidia       # filter by substring
    python scripts/list_models.py --probe         # 1-token request to each chat-looking model
"""

import argparse
import socket
import time

from _nim import HTTPError, URLError, chat, list_models

NON_CHAT = ("embed", "rerank", "guard", "safety", "whisper", "parakeet", "riva", "reward",
            "clip", "sdxl", "flux", "stable-diffusion", "cosmos", "bge", "retriever", "ocr")


def probe(model, timeout):
    start = time.monotonic()
    try:
        chat(model, [{"role": "user", "content": "Say OK."}], max_tokens=1, timeout=timeout)
        return f"live ({time.monotonic() - start:.1f}s)"
    except HTTPError as e:
        return {404: "not hosted (404)", 429: "live, rate-limited (429)"}.get(e.code, f"HTTP {e.code}")
    except (URLError, socket.timeout, TimeoutError):
        return f"timeout (>{timeout}s)"


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("-f", "--filter", help="only IDs containing this substring")
    p.add_argument("--probe", action="store_true", help="send a 1-token request to each chat model")
    p.add_argument("--timeout", type=int, default=30)
    p.add_argument("--delay", type=float, default=1.6, help="seconds between probes (stay under ~40 RPM)")
    args = p.parse_args()

    models = list_models()
    if args.filter:
        models = [m for m in models if args.filter.lower() in m.lower()]

    if not args.probe:
        print("\n".join(models))
        print(f"\n{len(models)} models")
        return

    chat_models = [m for m in models if not any(k in m.lower() for k in NON_CHAT)]
    print(f"Probing {len(chat_models)} chat models (skipping {len(models) - len(chat_models)} non-chat)\n")
    for m in chat_models:
        print(f"{m:60} {probe(m, args.timeout)}", flush=True)
        time.sleep(args.delay)


if __name__ == "__main__":
    main()
