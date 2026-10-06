import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Report locations and rule names only. Never print matched credentials.
const rules = [
  ["NVIDIA API key", /nvapi-[A-Za-z0-9_-]{20,}/g],
  ["GitHub token", /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})/g],
  ["OpenAI-style key", /sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}/g],
  ["AWS access key", /(?:AKIA|ASIA)[A-Z0-9]{16}/g],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ["credential in URL", /https?:\/\/[^\s/:]+:[^\s/@]{8,}@/g],
  ["assigned secret", /(?:api[_-]?key|access[_-]?token|client[_-]?secret|nvidia_key)\s*[=:]\s*(?:"([A-Za-z0-9_+./=-]{20,})"|'([A-Za-z0-9_+./=-]{20,})'|([A-Za-z0-9_+/-]{20,})(?=[\s,;#]|$))/gi],
];
const secretPath = /(?:^|\/)(?:\.env(?:\..+)?|id_rsa|id_ed25519|credentials(?:\.json)?|[^/]+\.p12|[^/]+\.pfx)$/i;
const examplePath = /(?:^|\/)\.env\.(?:example|sample|template)$/i;
const placeholders = /^(?:your[-_]|example|placeholder|replace[-_]|test[-_]|dummy[-_])/i;
const findings = [];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}

// Compare local environment secrets with Git contents without exposing them.
const knownSecrets = new Set();
for (const name of [".env", ".env.local", ".env.development.local", ".env.production.local"]) {
  if (!existsSync(name)) continue;
  for (const line of readFileSync(name, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || !/(?:key|token|secret|password)/i.test(match[1])) continue;
    const value = match[2].replace(/^(["'])(.*)\1$/, "$2").replace(/\s+#.*$/, "").trim();
    if (value.length >= 8 && !placeholders.test(value)) knownSecrets.add(value);
  }
}

function scan(text, location, path, current = false) {
  if (secretPath.test(path) && !examplePath.test(path)) findings.push({ location, rule: "private credential file" });
  if (text.includes("\0")) return;
  for (const [rule, pattern] of rules) {
    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];
    if (matches.some(match => !placeholders.test(match[1] ?? match[2] ?? match[3] ?? match[0]))) findings.push({ location, rule });
  }
  for (const value of knownSecrets) {
    if (text.includes(value)) { findings.push({ location, rule: "matches a local environment secret" }); break; }
  }
  if (current && /^(?:<{7} |={7}$|>{7} )/m.test(text)) findings.push({ location, rule: "unresolved merge conflict" });
  if (/(?:[A-Z]:\\Users\\[^\\\r\n]+|\/(?:Users|home)\/[^/\s]+)/i.test(text)) findings.push({ location, rule: "personal filesystem path" });
}

const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
const paths = new Map();
for (const path of tracked) {
  const folded = path.toLowerCase();
  if (paths.has(folded) && paths.get(folded) !== path) findings.push({ location: path, rule: "filename differs only by case from another tracked file" });
  paths.set(folded, path);
}

const working = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean);
let files = 0;
for (const path of new Set(working)) {
  if (!existsSync(path)) continue;
  scan(readFileSync(path, "utf8"), `working tree: ${path}`, path, true);
  files++;
}

let blobs = 0;
let commits = 0;
if (process.argv.includes("--history")) {
  const objects = git("rev-list", "--objects", "--all", "--reflog").trim().split("\n").filter(Boolean);
  for (const object of objects) {
    const [sha, ...parts] = object.split(" ");
    const type = git("cat-file", "-t", sha).trim();
    if (type === "commit") {
      commits++;
      scan(git("cat-file", "-p", sha), `commit metadata: ${sha.slice(0, 12)}`, "");
    } else if (type === "blob") {
      const path = parts.join(" ");
      scan(git("cat-file", "-p", sha), `history: ${sha.slice(0, 12)} ${path}`, path);
      blobs++;
    }
  }
}

for (const finding of findings) console.error(`${finding.rule}: ${finding.location}`);
console.log(`Checked ${files} working files${process.argv.includes("--history") ? `, ${commits} commits and ${blobs} historical blobs` : ""}. ${findings.length} findings.`);
if (findings.length) process.exitCode = 1;
