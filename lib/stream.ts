export type StreamDelta = { content?: string; reasoning?: string; done?: boolean };

export async function readChatStream(body: ReadableStream<Uint8Array>, onDelta: (delta: StreamDelta) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;
  function event(raw: string) {
    const data = raw.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trim()).join("\n");
    if (!data) return;
    if (data === "[DONE]") { done = true; onDelta({ done: true }); return; }
    const payload = JSON.parse(data);
    if (payload.error) throw new Error("The model returned an error while generating. Try again or choose another model.");
    const choice = payload.choices?.[0];
    const delta = choice?.delta;
    if (delta) onDelta({ content: delta.content ?? "", reasoning: delta.reasoning_content ?? delta.reasoning ?? "" });
    if (choice?.finish_reason === "length") onDelta({ content: "\n\n*Response reached the model's output limit. Ask it to continue.*" });
  }
  try {
    while (!done) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      buffer = buffer.replace(/\r\n/g, "\n");
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        event(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
      if (chunk.done) { if (buffer.trim()) event(buffer); break; }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
