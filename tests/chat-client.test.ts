import test from "node:test";
import assert from "node:assert/strict";
import { requestChat } from "../lib/chat-client.ts";

const encoder = new TextEncoder();
const options = () => ({ model: "z-ai/glm-5.3", messages: [{ role: "user" as const, content: "Hello" }], signal: new AbortController().signal, onDelta: () => {} });
const timing = { firstTokenMs: 15, idleMs: 15, totalMs: 100, waitingMs: 5 };

async function within<T>(promise: Promise<T>, ms = 250): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Chat stayed stuck generating")), ms); })]); }
  finally { clearTimeout(timer!); }
}

test("a provider that never sends headers times out and cancels the request", async () => {
  let signal: AbortSignal | undefined;
  let waiting = false;
  const fetcher: typeof fetch = async (_, init) => {
    signal = init?.signal as AbortSignal;
    return new Promise((_, reject) => signal!.addEventListener("abort", () => reject(signal!.reason), { once: true }));
  };
  await assert.rejects(within(requestChat({ ...options(), onWaiting: () => { waiting = true; } }, { ...timing, fetcher })), /NVIDIA.*start responding/);
  assert.equal(signal?.aborted, true);
  assert.equal(waiting, true);
});

test("a stream that sends text then stalls times out and preserves received text", async () => {
  let content = "";
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')); }, cancel() { cancelled = true; } });
  const fetcher: typeof fetch = async () => new Response(body, { headers: { "Content-Type": "text/event-stream" } });
  await assert.rejects(within(requestChat({ ...options(), onDelta: d => { content += d.content ?? ""; } }, { ...timing, fetcher })), /stopped responding/);
  assert.equal(content, "Hello");
  assert.equal(cancelled, true);
});

test("Stop cancels a silent open stream promptly", async () => {
  const stop = new AbortController();
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const fetcher: typeof fetch = async () => new Response(body);
  const task = requestChat({ ...options(), signal: stop.signal }, { ...timing, fetcher });
  setTimeout(() => stop.abort(), 5);
  await assert.rejects(within(task), { name: "AbortError" });
  assert.equal(cancelled, true);
});

test("accepts a complete JSON response from a provider that does not stream", async () => {
  let content = "";
  const fetcher: typeof fetch = async () => Response.json({ choices: [{ message: { content: "Hello" } }] });
  await requestChat({ ...options(), onDelta: d => { content += d.content ?? ""; } }, { ...timing, fetcher });
  assert.equal(content, "Hello");
});

test("finishing a reply clears the delayed waiting status", async () => {
  let waiting = false;
  const fetcher: typeof fetch = async () => new Response('data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":"stop"}]}\n\n', { headers: { "Content-Type": "text/event-stream" } });
  await requestChat({ ...options(), onWaiting: () => { waiting = true; } }, { ...timing, fetcher });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(waiting, false);
});
