import { writeFile } from "node:fs/promises";

const source = "https://integrate.api.nvidia.com/v1/models";
const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`NVIDIA catalog returned HTTP ${response.status}. The saved snapshot was preserved.`);
const data = await response.json();
if (!Array.isArray(data.data) || !data.data.every(model => typeof model.id === "string")) throw new Error("Unexpected catalog format. The saved snapshot was preserved.");
const models = [...new Set(data.data.map(model => model.id))].sort();
if (!models.length) throw new Error("NVIDIA returned no models. The saved snapshot was preserved.");
await writeFile(new URL("../data/nvidia-models.json", import.meta.url), JSON.stringify({ source, updatedAt: new Date().toISOString(), models }, null, 2) + "\n");
console.log(`Saved ${models.length} API models. Run npm run models:generate to refresh Python examples.`);
