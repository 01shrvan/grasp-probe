import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const widgets = [
  "softmax",
  "sort",
  "gradient-descent",
  "fourier",
  "recursion",
  "simpsons",
];

const css = readFileSync("styles.css", "utf8");
const canvasLib = readFileSync("lib/canvas.js", "utf8")
  .replace(/export function/g, "function")
  .replace(/^export \{[^}]*\};?$/gm, "");

const modules = widgets
  .map((name) => {
    const src = readFileSync(`widgets/${name}.js`, "utf8")
      .replace(/^import[^;]+;$/gm, "")
      .replace(/export default function mount/, `function mount_${name.replace(/-/g, "_")}`);
    return src;
  })
  .join("\n");

const calls = widgets
  .map((name) => {
    const fn = `mount_${name.replace(/-/g, "_")}`;
    const id = name === "gradient-descent" ? "gradient" : name;
    return `mount_${name.replace(/-/g, "_")}(document.getElementById("w-${id}"));`;
  })
  .join("\n");

let html = readFileSync("index.html", "utf8");
html = html.replace(
  '<link rel="stylesheet" href="styles.css">',
  `<style>\n${css}\n</style>`,
);
html = html.replace(
  /<script type="module">[\s\S]*?<\/script>/,
  `<script>\n${canvasLib}\n${modules}\n${calls}\n</script>`,
);

mkdirSync("dist", { recursive: true });
writeFileSync("dist/probe.html", html, "utf8");
console.log("dist/probe.html", html.length, "bytes");
