export const NVIDIA_URL = "https://integrate.api.nvidia.com/v1";

export function getKey(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return supplied || process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY;
}

// Restrict the local proxy to same-origin browser requests.
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  // Next.js can normalize request.url to localhost even when the browser uses 127.0.0.1.
  // Only serve the personal app through loopback, including requests without Origin.
  try {
    const target = new URL(`${url.protocol}//${host}`);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) return false;
    return !origin || new URL(origin).origin === target.origin;
  } catch { return false; }
}

export function providerError(status: number) {
  if (status === 401 || status === 403) return "NVIDIA rejected the API key or access to this model. Check your key and model access in Settings.";
  if (status === 404) return "This model is unavailable at NVIDIA's chat endpoint. Choose another model or check its exact model ID.";
  if (status === 429) return "NVIDIA's rate limit or quota was reached. Please wait a moment and try again.";
  if (status === 400 || status === 422) return "This model could not accept the chat request. Check that it supports chat completions and try a new conversation.";
  return `NVIDIA could not complete the request (${status}). Please try again.`;
}
