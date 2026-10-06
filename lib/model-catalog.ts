export type CatalogEntry = { path: string; name: string };
export type ModelKind = "chat" | "embeddings" | "specialized";
export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  kind: ModelKind;
  apiAvailable: boolean;
  url: string;
};

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const catalogAliases: Record<string, string> = {
  "nvidia/synthetic-video-detector": "nvidia/ai-synthetic-video-detector",
};

export function modelKind(id: string): ModelKind {
  if (/embed/i.test(id)) return "embeddings";
  if (/rerank|nvclip|(?:^|\/)deplot$|kosmos|fuyu|(?:^|\/)neva-|(?:^|\/)vila$|nemotron-parse|reward$|synthetic-video-detector/i.test(id)) return "specialized";
  return "chat";
}

export function buildModelCatalog(apiIds: string[], catalog: CatalogEntry[], liveIds?: string[]): ModelOption[] {
  // The snapshot keeps search useful before a connection is configured. A live list,
  // when provided, replaces its availability information rather than reviving retired IDs.
  const available = new Set(liveIds ?? apiIds);
  const options = new Map<string, ModelOption>();
  for (const id of new Set([...apiIds, ...(liveIds ?? [])])) {
    options.set(normalize(id), { id, name: id.split("/").slice(1).join("/"), provider: id.split("/")[0], kind: modelKind(id), apiAvailable: available.has(id), url: `https://build.nvidia.com/${id}` });
  }
  for (const entry of catalog) {
    const catalogId = entry.path.replace(/^\//, "");
    const id = catalogAliases[catalogId] ?? catalogId;
    const existing = options.get(normalize(id));
    if (existing) {
      existing.name = entry.name;
      existing.url = `https://build.nvidia.com${entry.path}`;
    } else {
      options.set(normalize(id), { id, name: entry.name, provider: id.split("/")[0], kind: "specialized", apiAvailable: false, url: `https://build.nvidia.com${entry.path}` });
    }
  }
  return [...options.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function searchModels(models: ModelOption[], query: string): ModelOption[] {
  const terms = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  return models.filter(model => {
    const text = normalize(`${model.id} ${model.name} ${model.provider}`);
    return terms.every(term => text.includes(term));
  });
}

export function modelStatus(model: ModelOption) {
  if (!model.apiAvailable) return "Catalog only";
  if (model.kind === "embeddings") return "Embeddings";
  if (model.kind === "specialized") return "Other API";
  return "Chat";
}
