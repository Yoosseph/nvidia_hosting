import { readChatStream, type StreamDelta } from "./stream.ts";

type ChatRequest = {
  model: string;
  messages: { role: "user" | "assistant"; content: string }[];
  apiKey?: string;
  signal: AbortSignal;
  onDelta: (delta: StreamDelta) => void;
  onWaiting?: () => void;
};

type Runtime = { fetcher?: typeof fetch; firstTokenMs?: number; idleMs?: number; totalMs?: number; waitingMs?: number };

export async function requestChat(options: ChatRequest, runtime: Runtime = {}) {
  const controller = new AbortController();
  const stop = () => controller.abort(options.signal.reason);
  options.signal.addEventListener("abort", stop, { once: true });
  if (options.signal.aborted) stop();
  const timeout = (message: string) => controller.abort(new Error(message));
  let inactivity = setTimeout(() => timeout("NVIDIA did not start responding. Try again or choose another model."), runtime.firstTokenMs ?? 90_000);
  const total = setTimeout(() => timeout("The response took too long. Try again or ask for a shorter answer."), runtime.totalMs ?? 300_000);
  const waiting = setTimeout(() => options.onWaiting?.(), runtime.waitingMs ?? 10_000);
  let hasContent = false;
  function deliver(delta: StreamDelta) {
    if (delta.content || delta.reasoning) {
      hasContent = true;
      clearTimeout(waiting);
      clearTimeout(inactivity);
      inactivity = setTimeout(() => timeout("NVIDIA stopped responding. Your partial response is saved; try again or choose another model."), runtime.idleMs ?? 60_000);
    }
    options.onDelta(delta);
  }
  try {
    controller.signal.throwIfAborted();
    const response = await (runtime.fetcher ?? fetch)("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}) },
      body: JSON.stringify({ model: options.model, messages: options.messages }),
      signal: controller.signal,
    });
    controller.signal.throwIfAborted();
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "The request failed. Please try again.");
    }
    if (!response.body) throw new Error("The model returned an empty response.");
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const payload = await response.json();
      if (payload.error) throw new Error("The model returned an error. Try again or choose another model.");
      const message = payload.choices?.[0]?.message;
      deliver({ content: message?.content ?? "", reasoning: message?.reasoning_content ?? message?.reasoning ?? "" });
    } else {
      await readChatStream(response.body, deliver, controller.signal);
    }
    controller.signal.throwIfAborted();
    if (!hasContent) throw new Error("The model returned no text. Try another chat model.");
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    throw error;
  } finally {
    clearTimeout(inactivity); clearTimeout(total); clearTimeout(waiting);
    options.signal.removeEventListener("abort", stop);
  }
}
