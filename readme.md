# Nim Chat

A simple React + TypeScript chat workspace built with Next.js. Chat with NVIDIA-hosted text models, stream replies, and read code in syntax-highlighted blocks with copy buttons.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The server binds to loopback for personal use.

Use the existing `NVIDIA_KEY` in `.env`, set `NVIDIA_API_KEY`, or paste a key into Settings. Pasted keys remain in tab memory and are sent only to the local server and NVIDIA. Never use a `NEXT_PUBLIC_` environment variable for secrets.

Choose a model in Settings or enter any exact NVIDIA model ID. The catalog is loaded live from NVIDIA. Only models supporting `https://integrate.api.nvidia.com/v1/chat/completions` can use this text interface; vision inputs, audio, image generation, embeddings, and models hosted at separate endpoints are not supported. Model availability and access depend on NVIDIA and your key.

Enter sends; Shift+Enter adds a newline. Stop cancels generation. Conversations are stored in this browser's local storage; delete them from the sidebar. Code is displayed and copied, not executed. Settings and model selection are disabled during a response.

## Validate

```sh
npm test
npm run typecheck
npm run build
```

`app/api` contains the server-side NVIDIA proxy, `lib/stream.ts` parses streaming events, and `components/markdown.tsx` renders Markdown without enabling raw HTML. The original Python scripts are preserved.

This is a personal local app. Add authentication and per-user key handling before exposing a deployment using a shared server API key to other people.
