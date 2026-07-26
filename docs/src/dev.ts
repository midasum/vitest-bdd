import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "./build";

const roots = [new URL("../content/", import.meta.url), new URL("../assets/", import.meta.url)];
const model = new URL("../../epure-vitest/llms.txt", import.meta.url);
let timer: ReturnType<typeof setTimeout> | undefined;
let building = false;
let pending = false;

async function rebuild(): Promise<void> {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await build();
    console.log("Documentation rebuilt");
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      await rebuild();
    }
  }
}

await rebuild();

for (const root of roots) {
  watch(fileURLToPath(root), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}

watch(fileURLToPath(model), () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 100);
});
