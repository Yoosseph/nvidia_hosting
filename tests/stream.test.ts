import test from "node:test";
import assert from "node:assert/strict";
import { readChatStream } from "../lib/stream.ts";

function stream(chunks: string[]) {
  return new ReadableStream<Uint8Array>({ start(controller) { chunks.forEach(c => controller.enqueue(new TextEncoder().encode(c))); controller.close(); } });
}

test("handles split SSE events, reasoning, CRLF and completion", async () => {
  let content = "", reasoning = "", done = false;
  await readChatStream(stream(['data: {"choices":[{"delta":{"reasoning_content":"Think"}}]}\r', '\n\r\ndata: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" world"}}]}\n', '\ndata: [DONE]\n\n']), delta => { content += delta.content ?? ""; reasoning += delta.reasoning ?? ""; done ||= !!delta.done; });
  assert.equal(content, "Hello world"); assert.equal(reasoning, "Think"); assert.equal(done, true);
});

test("accepts the final event without a blank line", async () => {
  let result = "";
  await readChatStream(stream(['data: {"choices":[{"delta":{"content":"done"}}]}']), d => { result += d.content ?? ""; });
  assert.equal(result, "done");
});

test("surfaces provider errors during streaming", async () => {
  await assert.rejects(readChatStream(stream(['data: {"error":{"message":"failed"}}\n\n']), () => {}), /model returned an error/);
});

test("decodes Unicode split across network chunks", async () => {
  const bytes = new TextEncoder().encode('data: {"choices":[{"delta":{"content":"👋 café"}}]}\n\n');
  let result = "";
  const body = new ReadableStream<Uint8Array>({start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); }});
  await readChatStream(body, d => { result += d.content ?? ""; });
  assert.equal(result, "👋 café");
});

test("finish_reason completes generation even when the provider keeps the connection open", async () => {
  let cancelled = false, done = false;
  const body = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":"stop"}]}\n\n')); }, cancel() { cancelled = true; } });
  let timer: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([readChatStream(body, d => { done ||= !!d.done; }), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Chat stayed stuck generating after finish_reason")), 100); })]);
    assert.equal(done, true);
    assert.equal(cancelled, true);
  } finally { clearTimeout(timer!); }
});
