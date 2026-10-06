"""Shared CLI for generated NVIDIA model examples. Uses Python's standard library."""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = "https://integrate.api.nvidia.com/v1"


def load_key():
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            name, separator, value = line.strip().removeprefix("export ").partition("=")
            if separator and name.strip() in {"NVIDIA_API_KEY", "NVIDIA_KEY"}:
                os.environ.setdefault(name.strip(), value.strip().strip("\"'"))
    key = os.environ.get("NVIDIA_API_KEY") or os.environ.get("NVIDIA_KEY")
    if not key:
        raise ValueError("Set NVIDIA_API_KEY or NVIDIA_KEY in your environment or the root .env file.")
    return key


def request(path, payload):
    req = urllib.request.Request(
        BASE_URL + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {load_key()}", "Content-Type": "application/json"},
        method="POST",
    )
    return urllib.request.urlopen(req, timeout=300)


def chat(model_id, messages, max_tokens):
    answer = ""
    with request("/chat/completions", {"model": model_id, "messages": messages, "max_tokens": max_tokens, "stream": True}) as response:
        for raw in response:
            line = raw.decode("utf-8").strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            event = json.loads(data)
            if event.get("error"):
                raise ValueError("The model returned an error while generating.")
            for choice in event.get("choices") or []:
                content = (choice.get("delta") or {}).get("content")
                if content:
                    print(content, end="", flush=True)
                    answer += content
    print()
    if not answer:
        raise ValueError("The model returned no text. Check its input requirements.")
    return answer


def run(model_id, kind, catalog_url, api_available):
    parser = argparse.ArgumentParser(description=f"NVIDIA model: {model_id}")
    parser.add_argument("prompt", nargs="?", help="Prompt or text to embed. Omit for interactive chat.")
    parser.add_argument("--max-tokens", type=int, default=2048)
    parser.add_argument("--describe", action="store_true", help="Show model metadata without calling an API.")
    args = parser.parse_args()
    if args.describe:
        print(f"Model: {model_id}\nType: {kind}\nListed by API: {api_available}\nNVIDIA: {catalog_url}")
        return
    if not api_available or kind == "specialized":
        parser.error(f"This model needs its own API or deployment and input format. See {catalog_url}")
    if args.max_tokens < 1:
        parser.error("--max-tokens must be positive")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        if kind == "embeddings":
            text = args.prompt or input("Text: ")
            with request("/embeddings", {"model": model_id, "input": [text], "input_type": "query", "encoding_format": "float"}) as response:
                print(json.dumps(json.load(response), indent=2))
            return
        messages = []
        while True:
            prompt = args.prompt if args.prompt is not None else input("\nYou: ")
            if not prompt.strip():
                if args.prompt is not None: return
                continue
            if prompt.lower() in {"exit", "quit"}: return
            messages.append({"role": "user", "content": prompt})
            answer = chat(model_id, messages, args.max_tokens)
            messages.append({"role": "assistant", "content": answer})
            if args.prompt is not None: return
    except urllib.error.HTTPError as error:
        print(f"NVIDIA returned HTTP {error.code}. Check your key, model access, input format, and quota.", file=sys.stderr)
        raise SystemExit(1) from None
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
        # Do not echo request objects, headers, or provider response bodies.
        print(f"Request failed ({type(error).__name__}). Check your configuration and connection.", file=sys.stderr)
        raise SystemExit(1) from None
    except (EOFError, KeyboardInterrupt):
        print()
