# Live chat checks — 7 October 2026

These checks used a short public test prompt and the same configured NVIDIA key. No keys or private conversations were logged. Provider status and latency can change; a timeout does not establish that a model is permanently unavailable.

| Model | Observed result |
| --- | --- |
| `nvidia/nemotron-3-super-120b-a12b` | Responded successfully. |
| `openai/gpt-oss-20b` | Completed through the app in about 1.2 seconds; also verified in the browser. |
| `z-ai/glm-5.3` | No response within 90 seconds. NVIDIA's supplied non-streaming example also timed out when called directly, bypassing this app. |
| `moonshotai/kimi-k3` | No response within 90 seconds on a direct non-streaming request; streaming through the app also exceeded the 30-second diagnostic window. |
| `google/gemma-4-31b-it` | No response within the 30-second diagnostic window. |
| `z-ai/glm-5.3-flash` | No response within the 15-second diagnostic window. |
| `deepseek-ai/deepseek-v4.1-flash` | No response within the 15-second diagnostic window. |
| `mistralai/mistral-large-2-instruct` | NVIDIA returned HTTP 404. |
| `google/gemma-3-4b-it` | NVIDIA returned HTTP 404. |
| `ibm/granite-3.0-8b-instruct` | NVIDIA returned HTTP 404. |
| `mistralai/codestral-22b-instruct-v0.1` | NVIDIA returned HTTP 404. |
| `microsoft/phi-3.5-moe-instruct` | NVIDIA returned HTTP 404. |

The original app left only an animated indicator while waiting. The client now displays a waiting status after ten seconds, enforces first-response and inactivity deadlines, restores the prompt after a failed or stopped request, and retains partial replies. The stream parser recognizes a terminal `finish_reason` and explicitly cancels a silent stream on Stop. Regression tests cover these cases.

The real GLM browser test reached the new timeout, removed the empty assistant placeholder, restored `Hello` in the composer, and re-enabled model selection. The app cannot force a delayed or unavailable NVIDIA endpoint to respond.
