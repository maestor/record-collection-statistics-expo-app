import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const generated = resolve(root, "src/api/generated/record-collection-api.ts");
const temp = resolve(root, "src/api/generated/record-collection-api.check.tmp.ts");
const input = process.env.OPENAPI_URL ?? "http://127.0.0.1:3003/openapi.json";

const child = spawn(
  process.execPath,
  [
    resolve(root, "node_modules/openapi-typescript/bin/cli.js"),
    input,
    "--output",
    temp,
  ],
  { stdio: "inherit" },
);

const code = await new Promise((resolveCode) => {
  child.on("close", resolveCode);
});

if (code !== 0) {
  process.exit(typeof code === "number" ? code : 1);
}

const [current, next] = await Promise.all([
  readFile(generated, "utf8"),
  readFile(temp, "utf8"),
]);
await rm(temp, { force: true });

if (current !== next) {
  console.error("Generated API types are stale. Run npm run generate:api-types.");
  process.exit(1);
}

