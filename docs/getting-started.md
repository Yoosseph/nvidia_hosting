# Getting started

## 1. Get a key

1. Go to [build.nvidia.com](https://build.nvidia.com) and sign in (joining the NVIDIA Developer Program is free; just an email, no credit card).
2. Open **Settings → API Keys** ([build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys)) and generate a key. It starts with `nvapi-`.
3. Export it:

```bash
export NVIDIA_API_KEY="nvapi-..."
```

Never commit this key. It's tied to your account.

## 2. The endpoint

The API is **OpenAI-compatible**:

| | |
|---|---|
| Base URL | `https://integrate.api.nvidia.com/v1` |
| Chat | `POST /v1/chat/completions` |
| List models | `GET /v1/models` |
| Auth | `Authorization: Bearer $NVIDIA_API_KEY` |

### curl

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/nemotron-3-super-120b-a12b",
    "messages": [{"role": "user", "content": "Explain MoE models in two sentences."}],
    "max_tokens": 512,
    "stream": false
  }'
```

### Python (OpenAI SDK)

```python
from openai import OpenAI
import os

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"],
    timeout=300,  # big models can take minutes; the default is too short for some tools
)

resp = client.chat.completions.create(
    model="z-ai/glm-5.2",
    messages=[{"role": "user", "content": "Write a Python function that dedupes a list, preserving order."}],
    max_tokens=1024,
    stream=True,
)
for chunk in resp:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Node / TypeScript

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

const res = await client.chat.completions.create({
  model: "moonshotai/kimi-k3",
  messages: [{ role: "user", content: "Summarize the CAP theorem." }],
});
console.log(res.choices[0].message.content);
```

## 3. Find out which models are live for you

`/v1/models` lists the whole catalog, including retired models and models that exist only as downloadable containers. It does **not** tell you which ones have a working free endpoint. Use the script in this repo, which actually probes each one:

```bash
python scripts/list_models.py            # list IDs
python scripts/list_models.py --probe    # send a 1-token request to each chat model and report which respond
```

## 4. Gotchas that make models look broken

### Reasoning models hang without `chat_template_kwargs`

Several hybrid "thinking" models on NIM (DeepSeek V4 family, some Nemotron and Qwen models) expect a `chat_template_kwargs` object at the **root** of the request body to turn thinking on or off. Some client libraries (e.g. the Vercel AI SDK used by OpenCode) strip unknown fields. The request then hangs with no tokens until it times out. See [opencode#24264](https://github.com/anomalyco/opencode/issues/24264).

```python
resp = client.chat.completions.create(
    model="deepseek-ai/deepseek-v4-flash",
    messages=[...],
    extra_body={"chat_template_kwargs": {"thinking": True, "enable_thinking": True}},
    stream=True,
)
```

Want speed and don't need chain-of-thought? Set thinking to `False`. For Nemotron models, the model card usually documents a `/think` / `/no_think` system prompt switch or an equivalent kwarg.

### Multi-turn with reasoning models

DeepSeek V4 returns `reasoning_content`. Some clients error with *"reasoning_content must be passed back"* in multi-turn chats ([opencode#24124](https://github.com/anomalyco/opencode/issues/24124)). If you hit this, send prior assistant turns back exactly as received, or disable thinking.

### Tool calls in streaming mode

People have reported that streamed tool calls from DeepSeek V4 on NIM don't continue correctly in Anthropic-compatible agent proxies (e.g. running Claude Code through a translator). If an agent stalls after the first tool call, try `stream: false` or a different model (GLM-5.2, Kimi K3 and Nemotron 3 Super handle tool calls more cleanly).

### Client-side context caps

Some SDKs hard-cap context (e.g. 262,144 tokens) even when the model supports 1M ([opencode#25056](https://github.com/anomalyco/opencode/issues/25056)). The model isn't the problem there; check your client.

### New models 404 or hang forever

When a model has just been added, the endpoint may briefly 404 or hang. It may also need the **"Public API Endpoints"** permission on your key ([forum thread](https://forums.developer.nvidia.com/t/newer-nim-models-kimi-k2-6-deepseek-v4-pro-hang-indefinitely-or-404-possible-missing-public-api-endpoints-permission/377777)). Regenerate your key with that scope, or wait a few days.

## 5. Use it from coding tools

Any tool that accepts an "OpenAI-compatible" provider works: set the base URL and key above and paste a model ID. Tools people commonly wire up: OpenCode, Cline, Continue, Aider, LiteLLM, Open WebUI, and Claude Code via a proxy such as [free-claude-code](https://github.com/Alishahryar1/free-claude-code), which defaults to `nvidia/nemotron-3-super-120b-a12b`.

For agent tools, see [Best model by use case → Coding agents](use-cases.md#coding-agents).
