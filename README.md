# Nim Chat

A minimal React and TypeScript chat interface for NVIDIA-hosted models, built with Next.js.

- Streaming replies, saved chats, and a stop button.
- Syntax-highlighted code blocks with copy buttons.
- Light and dark themes.
- A searchable model picker with one-click switching.
- Chat renaming and a Python entry for each catalog model.

## Run locally

Requires Node.js 24 or later.

```sh
git clone https://github.com/Yoosseph/nvidia_hosting.git
cd nvidia_hosting
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). In Settings, paste your [NVIDIA API key](https://build.nvidia.com), choose a chat model, and save. You can also enter an exact model ID.

Alternatively, copy `.env.example` to `.env` and set `NVIDIA_KEY`. `NVIDIA_API_KEY` is also supported. Never put a real key in source code or a `NEXT_PUBLIC_` variable.

Click the model name at the top to search and switch models without reopening connection settings. Click the pencil beside a conversation to rename it. Enter sends; Shift+Enter inserts a newline.

Chats and theme preferences stay in this browser's local storage. Pasted keys stay in tab memory and must be entered again after a reload. Keys and prompts are sent to NVIDIA through the local server; the app does not log them.

## Models

Settings searches all catalog entries. Only API-listed text chat models are selectable. Embeddings, specialized image/audio/video models, and catalog-only downloads link to their NVIDIA instructions. Multimodal chat models can receive text here; attachments and tool execution are not implemented. Catalog presence does not guarantee account access.

The snapshot combines 80 API model IDs and all 97 website entries checked on 7 October 2026, merged into 150 unique entries. The API list refreshes at startup and through the refresh button. If unavailable, the saved snapshot remains usable.

```sh
npm run models:sync
npm run models:generate
```

The first command updates `data/nvidia-models.json` from NVIDIA. The second regenerates Python entries. Website names and page links are kept separately in `data/nvidia-catalog.json`.

## Python examples

Generated examples require Python 3.10 or later and use its standard library:

```sh
python models/nvidia/nemotron-3-super-120b-a12b.py "Explain closures"
python models/moonshotai/kimi-k3.py
python models/mit/boltz2.py --describe
```

Chat entries stream replies. Text embedding entries use `/embeddings`. Specialized and catalog-only entries show their API/deployment instructions without sending unsupported chat requests. See [models/README.md](models/README.md).

Original examples are preserved in `models/nemotron.py` and `models/kimik3.py`. Install their optional dependencies with `python -m pip install -r requirements.txt`.

## Development

```sh
npm test
npm run models:check
npm run check:secrets
npm run build
```

`app/api/` contains the server-side NVIDIA proxy, `lib/stream.ts` parses streaming events, `lib/model-catalog.ts` merges and searches models, and `components/markdown.tsx` renders code and Markdown without raw HTML.

The app binds to loopback and has no multi-user authentication. It is intended for personal local use. See [SECURITY.md](SECURITY.md) before changing its deployment model.

[Contributing](CONTRIBUTING.md) · [Publication audit](docs/security-audit.md) · [Earlier model guide](docs/model-guide.md)

The earlier guide contains historical estimates rather than verified performance measurements. Its model IDs and claims may be outdated; use the live catalog to check availability.

## License

[MIT](LICENSE). Model weights and NVIDIA's services have their own terms. This project is not affiliated with NVIDIA.
