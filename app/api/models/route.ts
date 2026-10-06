import { checkOrigin, getKey, NVIDIA_URL, providerError } from "@/lib/nvidia";
import snapshot from "@/data/nvidia-models.json";

export async function GET(request: Request) {
  if (!checkOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const key = getKey(request);
  try {
    const response = await fetch(`${NVIDIA_URL}/models`, {
      cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return Response.json({ models: snapshot.models, error: `${providerError(response.status)} Showing saved models.`, configured: Boolean(key) }, { headers: { "Cache-Control": "no-store" } });
    const data = await response.json();
    const models = (data.data ?? []).map((model: { id: string }) => model.id).filter((id: unknown) => typeof id === "string").sort();
    return Response.json({ models, configured: Boolean(key) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ models: snapshot.models, error: "Catalog unavailable. Showing saved models.", configured: Boolean(key) }, { headers: { "Cache-Control": "no-store" } });
  }
}
