import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function bundle(entry) {
  const result = await build({
    entryPoints: [path.join(root, "src", `${entry}.ts`)],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: ["es2018"],
    charset: "utf8",
    logLevel: "silent",
  });
  return result.outputFiles[0].text.trim();
}

async function render(name) {
  const templatePath = path.join(root, "templates", `${name}.template.html`);
  const outputPath = path.join(root, `${name}.html`);
  const [template, script] = await Promise.all([
    fs.readFile(templatePath, "utf8"),
    bundle(name),
  ]);
  const rendered = template.replace("/*__SCRIPT__*/", script);
  await fs.writeFile(outputPath, rendered, "utf8");
}

await render("front");
await render("back");
