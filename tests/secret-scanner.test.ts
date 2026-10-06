import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scanner = fileURLToPath(new URL("../scripts/check-secrets.mjs", import.meta.url));

function fixture(check: (root: string, git: (...args: string[]) => string) => void) {
  const root = mkdtempSync(join(tmpdir(), "nim-secret-test-"));
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try { git("init", "-q"); check(root, git); }
  finally {
    if (dirname(resolve(root)) !== resolve(tmpdir()) || !root.startsWith(join(tmpdir(), "nim-secret-test-"))) throw new Error("Unexpected test directory.");
    rmSync(root, { recursive: true, force: true });
  }
}

test("scanner catches removed credentials in history without printing them", () => {
  fixture((root, git) => {
    const token = "nvapi-" + "a".repeat(40);
    writeFileSync(join(root, "example.txt"), token);
    git("add", "example.txt");
    git("-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "fixture");
    writeFileSync(join(root, "example.txt"), "safe content");
    const result = spawnSync(process.execPath, [scanner, "--history"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /NVIDIA API key: history/);
    assert.equal((result.stdout + result.stderr).includes(token), false);
  });
});

test("scanner accepts environment references and detects a local secret copy", () => {
  fixture((root, git) => {
    writeFileSync(join(root, ".gitignore"), ".env\n");
    writeFileSync(join(root, "example.txt"), "apiKey: process.env.NVIDIA_API_KEY");
    git("add", ".gitignore", "example.txt");
    const safe = spawnSync(process.execPath, [scanner], { cwd: root, encoding: "utf8" });
    assert.equal(safe.status, 0);
    const secret = "private-fixture-" + "b".repeat(20);
    writeFileSync(join(root, ".env"), `NVIDIA_KEY=${secret}`);
    writeFileSync(join(root, "example.txt"), secret);
    const leaked = spawnSync(process.execPath, [scanner], { cwd: root, encoding: "utf8" });
    assert.equal(leaked.status, 1);
    assert.match(leaked.stderr, /matches a local environment secret/);
    assert.equal((leaked.stdout + leaked.stderr).includes(secret), false);
  });
});
