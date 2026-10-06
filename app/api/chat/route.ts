import { checkOrigin, getKey, NVIDIA_URL, providerError } from "@/lib/nvidia";

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!checkOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const key = getKey(request);
  if (!key) return Response.json({ error: "Add your NVIDIA API key in Settings to start chatting." }, { status: 401 });
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.model !== "string" || !body.model.trim() || !Array.isArray(body.messages) || !body.messages.length || body.messages.length > 300 || body.messages.some((m: {role?: string; content?: string}) => !m || !["user", "assistant"].includes(m.role ?? "") || typeof m.content !== "string")) {
    return Response.json({ error: "Choose a model and enter a message." }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${NVIDIA_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: body.model.trim(), messages: body.messages.map((m: {role: string; content: string}) => ({role: m.role, content: m.content})), stream: true }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(300000)]),
    });
    if (!upstream.ok) return Response.json({ error: providerError(upstream.status) }, { status: upstream.status });
    return new Response(upstream.body, { headers: {
      "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no",
    } });
  } catch {
    return Response.json({ error: "Connection to NVIDIA interrupted or timed out. Please try again." }, { status: 502 });
  }
}
