import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_KEY"),
)

while True:
    prompt = input("\nYou: ")

    if prompt.lower() in {"exit", "quit"}:
        break

    completion = client.chat.completions.create(
        model="nvidia/nemotron-3-super-120b-a12b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,
        max_tokens=2048,
    )

    print("\nNemotron:", completion.choices[0].message.content)