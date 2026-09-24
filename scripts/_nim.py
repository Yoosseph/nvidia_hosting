"""Tiny stdlib-only client for NVIDIA's OpenAI-compatible endpoint."""

import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE_URL = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")


def api_key():
    key = os.environ.get("NVIDIA_API_KEY")
    if not key:
        sys.exit("NVIDIA_API_KEY is not set. Get one at https://build.nvidia.com/settings/api-keys")
    return key


def _request(path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        method="POST" if data else "GET",
        headers={
            "Authorization": f"Bearer {api_key()}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream" if body and body.get("stream") else "application/json",
        },
    )
    return urllib.request.urlopen(req, timeout=timeout)


def list_models():
    with _request("/models") as resp:
        return sorted(m["id"] for m in json.load(resp)["data"])


def chat(model, messages, max_tokens=256, timeout=60, extra=None):
    """Non-streaming chat call. Returns the parsed JSON response."""
    body = {"model": model, "messages": messages, "max_tokens": max_tokens, "stream": False}
    body.update(extra or {})
    with _request("/chat/completions", body, timeout) as resp:
        return json.load(resp)


def stream_chat(model, messages, max_tokens=512, timeout=300, extra=None):
    """Streaming chat call. Returns timing stats.

    ttft counts reasoning tokens as "first token" too: it measures when the
    model starts producing anything, which is what tells you it isn't queued.
    """
    body = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    body.update(extra or {})
    start = time.monotonic()
    first = None
    chunks = 0
    usage = None
    with _request("/chat/completions", body, timeout) as resp:
        for raw in resp:
            line = raw.decode("utf-8", "replace").strip()
            if not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if payload == "[DONE]":
                break
            event = json.loads(payload)
            if event.get("usage"):
                usage = event["usage"]
            for choice in event.get("choices") or []:
                delta = choice.get("delta") or {}
                if delta.get("content") or delta.get("reasoning_content") or delta.get("reasoning"):
                    chunks += 1
                    if first is None:
                        first = time.monotonic()
    end = time.monotonic()
    tokens = (usage or {}).get("completion_tokens") or chunks
    gen_time = end - first if first else 0
    return {
        "ttft": (first - start) if first else None,
        "total": end - start,
        "tokens": tokens,
        "tok_per_s": tokens / gen_time if gen_time > 0 else None,
    }


HTTPError = urllib.error.HTTPError
URLError = urllib.error.URLError
