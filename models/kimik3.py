import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_KEY"),
    timeout=300.0,
)

stream = client.chat.completions.create(
    model="moonshotai/kimi-k3",
    messages=[
        {
            "role": "user",
            "content": "Explain transformers in detail."
        }
    ],
    max_tokens=4096,
    temperature=1,
    reasoning_effort="max",
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta

    if delta.content:
        print(delta.content, end="", flush=True)

print()