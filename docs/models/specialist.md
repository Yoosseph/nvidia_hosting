# Embeddings, rerankers, safety & speech

These aren't chat models, but they're some of the most useful free endpoints for building real apps. They're small and fast, and since few people use them, they're rarely rate-limited in practice.

## Embeddings (RAG / semantic search)

| Model | ID (examples) | Notes | Verdict |
|---|---|---|---|
| NV-Embed / Llama-Nemotron Embed | `nvidia/llama-*-nemotron-embed-*`, `nvidia/nv-embedqa-*` | Top-tier retrieval quality, long inputs | ✅ |
| Multilingual / small embedders | `nvidia/*-embed-*`, `baai/bge-m3` | Cheaper, multilingual | ✅ |

Endpoint: `POST /v1/embeddings`. Many NVIDIA embedders need `input_type: "query"` or `"passage"`, so check the model card.

## Rerankers

| Model | ID (examples) | Verdict |
|---|---|---|
| NeMo Retriever rerank | `nvidia/*-rerank-*` | ✅ Add after embeddings for a big RAG accuracy boost |

## Safety / guardrails

| Model | ID (examples) | Use |
|---|---|---|
| Llama Guard | `meta/llama-guard-*` | Classify prompts/responses as safe/unsafe |
| Nemotron safety / content-safety | `nvidia/*-content-safety*`, `nvidia/*-safety-guard*` | NeMo Guardrails integration, topic control, jailbreak detection |

## Vision-language (dedicated)

Besides the multimodal flagships (Kimi K3, MiniMax M3, Qwen3.5-397B, DeepSeek V4.1 Flash), the catalog has smaller VLMs (NVIDIA VILA/Cosmos, Llama 3.2 Vision, Phi vision). They're fine for captioning, and the flagships are better for reasoning over images.

## Speech

NVIDIA hosts Whisper-style ASR and Riva/Parakeet speech models (transcription, TTS, translation). Tools like free-claude-code use NIM's Whisper endpoint for voice notes. These use different APIs from chat, so see each model's page on build.nvidia.com.

## Tip

Look up exact IDs with:

```bash
python scripts/list_models.py | grep -Ei "embed|rerank|guard|safety|whisper|parakeet"
```
