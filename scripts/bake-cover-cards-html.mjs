import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const exportsDir = path.join(projectRoot, "exports");
const outputPath = path.join(exportsDir, "cover-cards-baked.html");

function toDataUriSvg(svgText) {
  return `data:image/svg+xml,${encodeURIComponent(svgText)
    .replace(/%0A/g, "")
    .replace(/%09/g, "")
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")}`;
}

function parseExportMap(jsText) {
  const match = jsText.match(/export\s*\{([^}]+)\};?\s*$/s);
  if (!match) {
    throw new Error("Could not parse export map in App bundle.");
  }

  const raw = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const map = {};

  for (const item of raw) {
    const pair = item.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
    if (!pair) continue;
    map[pair[2]] = pair[1];
  }

  if (!map.A || !map.R || !map.c || !map.j) {
    throw new Error("Missing required exports (A, R, c, j) in App bundle.");
  }

  return map;
}

function pickHref(htmlText, pattern) {
  const match = htmlText.match(pattern);
  return match ? match[1] : "";
}

async function findLogoPath() {
  const assetsDir = path.join(distDir, "assets");
  const files = await readdir(assetsDir);
  const logo = files.find((name) => /^hiai-logo-.*\.svg$/i.test(name));
  if (!logo) {
    throw new Error("Could not find hashed hiai-logo SVG in dist/assets.");
  }
  return path.join(assetsDir, logo);
}

async function main() {
  const coverHtmlPath = path.join(distDir, "cover-cards.html");
  const coverHtml = await readFile(coverHtmlPath, "utf8").catch(() => null);
  if (!coverHtml) {
    throw new Error("dist/cover-cards.html not found. Run `npm run build` first.");
  }

  const appJsHref =
    pickHref(coverHtml, /<link\s+rel="modulepreload"[^>]*href="([^"]*App-[^"]+\.js)"/i) ||
    "/assets/App.js";
  const coverCssHref =
    pickHref(coverHtml, /<link\s+rel="stylesheet"[^>]*href="([^"]*coverCards-[^"]+\.css)"/i) ||
    "";

  const appJsPath = path.join(distDir, appJsHref.replace(/^\/+/, ""));
  const coverCssPath = coverCssHref
    ? path.join(distDir, coverCssHref.replace(/^\/+/, ""))
    : "";
  const logoPath = await findLogoPath();

  const [appJsRaw, coverCssRaw, logoRaw] = await Promise.all([
    readFile(appJsPath, "utf8"),
    coverCssPath ? readFile(coverCssPath, "utf8") : Promise.resolve(""),
    readFile(logoPath, "utf8"),
  ]);

  const logoDataUri = toDataUriSvg(logoRaw);
  const appJs = appJsRaw.replace(/"\/assets\/hiai-logo-[^"]+\.svg"/g, `"${logoDataUri}"`);
  const exportMap = parseExportMap(appJs);

  const runtimeBootstrap = `
${exportMap.c}.createRoot(document.getElementById("root")).render(
  ${exportMap.j}.jsx(${exportMap.R}.StrictMode, { children: ${exportMap.j}.jsx(${exportMap.A}, {}) })
);
`;

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Counter Cover (Cards) - Baked</title>
    <style>${coverCssRaw}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${appJs}
${runtimeBootstrap}
    </script>
  </body>
</html>
`;

  await mkdir(exportsDir, { recursive: true });
  await writeFile(outputPath, html, "utf8");

  console.log(`Saved baked page: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
