import test from "node:test";
import assert from "node:assert/strict";
import { checkOrigin } from "../lib/nvidia.ts";

test("accepts matching browser host even when Next normalizes the internal URL", () => {
  assert.equal(checkOrigin(new Request("http://localhost:3000/api/chat", { headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" } })), true);
});

test("rejects foreign origins, malformed origins and non-loopback hosts", () => {
  for (const origin of ["https://example.com", "null", "http://localhost:4000"]) {
    assert.equal(checkOrigin(new Request("http://localhost:3000/api/chat", { headers: { origin } })), false);
  }
  assert.equal(checkOrigin(new Request("http://localhost:3000/api/chat", { headers: { host: "example.com", origin: "http://example.com" } })), false);
});
