import test from "node:test";
import assert from "node:assert/strict";
import { buildModelCatalog, searchModels } from "../lib/model-catalog.ts";

test("catalog aliases preserve exact API IDs and avoid duplicate options", () => {
  const models = buildModelCatalog(["z-ai/glm-5.3", "nvidia/ai-synthetic-video-detector"], [{path:"/z-ai/glm-5-3",name:"glm-5-3"},{path:"/nvidia/synthetic-video-detector",name:"synthetic-video-detector"}]);
  assert.equal(models.length, 2);
  assert.equal(models.find(m => m.provider === "z-ai")?.id, "z-ai/glm-5.3");
});

test("search matches provider, case, punctuation and multiple terms", () => {
  const models = buildModelCatalog(["z-ai/glm-5.3", "nvidia/nemotron-3-super-120b-a12b"], []);
  assert.equal(searchModels(models, "GLM 5-3")[0]?.id, "z-ai/glm-5.3");
  assert.equal(searchModels(models, "NVIDIA super").length, 1);
  assert.equal(searchModels(models, "does not exist").length, 0);
});

test("live availability overrides stale snapshot and distinguishes embeddings", () => {
  const models = buildModelCatalog(["nvidia/old-model", "nvidia/nemotron-3-embed-1b"], [{path:"/mit/boltz2",name:"Boltz-2"}], ["nvidia/nemotron-3-embed-1b", "nvidia/new-model"]);
  assert.equal(models.find(m => m.id === "nvidia/old-model")?.apiAvailable, false);
  assert.equal(models.find(m => m.id === "nvidia/new-model")?.apiAvailable, true);
  assert.equal(models.find(m => m.id.includes("embed"))?.kind, "embeddings");
  assert.equal(models.find(m => m.id === "mit/boltz2")?.apiAvailable, false);
});
