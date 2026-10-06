# Python models

Each catalog entry has a Python file under its provider, for example:

```sh
python models/nvidia/nemotron-3-super-120b-a12b.py "Write a Python hello world"
python models/moonshotai/kimi-k3.py
python models/mit/boltz2.py --describe
```

Generated examples use the standard-library client in `_client.py`. Set `NVIDIA_API_KEY` or `NVIDIA_KEY`, or use the root `.env` file. No API key is embedded in source files. Python 3.10 or later is required.

Chat entries stream text and keep conversation history. Embedding entries call `/embeddings` with a text query. Some embedding models require other input formats; check their NVIDIA page if text queries are rejected. Specialized and catalog-only entries provide metadata and a link to their own API/deployment instructions; they do not send a fake chat request. `--describe` and `--help` never call an API.

The original `nemotron.py` and `kimik3.py` examples are preserved in this folder. Those two use the optional packages in the root `requirements.txt`.

Regenerate entries from the checked-in catalogs with `npm run models:generate`. Refresh the API snapshot with `npm run models:sync`; website catalog URLs are kept separately in `data/nvidia-catalog.json`.
