import { run } from "@epure/minidoc";
import { nodeFs } from "@epure/minidoc/node";
import { rm } from "node:fs/promises";
import { apiMd, guideMd, rescript, typescript } from "./transform-md";

const root = new URL("../", import.meta.url);
const output = new URL("../../dist/", import.meta.url);

export async function build(): Promise<void> {
  await run({
    fs: nodeFs(root),
    glob: "content/**/config.yaml",
    transform: { apiMd, guideMd, rescript, typescript },
  });
}

if (import.meta.main) {
  await rm(output, { recursive: true, force: true });
  await build();
}
