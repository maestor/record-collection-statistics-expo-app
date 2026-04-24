import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = resolve(root, "src/api/generated/record-collection-api.ts");
const input = process.env.OPENAPI_URL ?? "http://127.0.0.1:3003/openapi.json";

await mkdir(dirname(output), { recursive: true });

const child = spawn(
  process.execPath,
  [
    resolve(root, "node_modules/openapi-typescript/bin/cli.js"),
    input,
    "--output",
    output,
  ],
  { stdio: "inherit" },
);

const code = await new Promise((resolveCode) => {
  child.on("close", resolveCode);
});

if (code !== 0) {
  process.exit(typeof code === "number" ? code : 1);
}

