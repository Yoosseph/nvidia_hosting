import { checkOrigin, getKey, NVIDIA_URL, providerError } from "@/lib/nvidia";

export async function GET(request: Request) {
  if (!checkOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const key = getKey(request);
  if (!key) return Response.json({ models: [], configured: false });
  try {
    const response = await fetch(`${NVIDIA_URL}/models`, {
      headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return Response.json({ error: providerError(response.status), configured: true }, { status: response.status });
    const data = await response.json();
    const models = (data.data ?? []).map((model: { id: string }) => model.id).filter((id: unknown) => typeof id === "string").sort();
    return Response.json({ models, configured: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Couldn't load NVIDIA's catalog. You can still enter a model ID manually.", configured: true }, { status: 502 });
  }
}
