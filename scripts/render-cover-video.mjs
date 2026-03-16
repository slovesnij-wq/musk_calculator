import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const PORT = 4173;
const WIDTH = 1080;
const HEIGHT = 1080;
const DIST_DIR = path.join(projectRoot, "dist");
const OUTPUT_DIR = path.join(projectRoot, "exports");
const TMP_DIR = path.join(projectRoot, ".tmp-cover-video");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function parseArgs(argv) {
  let page = "cover.html";
  let durationSec = 108;
  let outputName = "";
  let fps = 30;
  let smooth = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--page" && argv[i + 1]) {
      page = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith("--page=")) {
      page = arg.slice("--page=".length);
      continue;
    }

    if (arg === "--duration" && argv[i + 1]) {
      durationSec = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg.startsWith("--duration=")) {
      durationSec = Number(arg.slice("--duration=".length));
      continue;
    }

    if (arg === "--output" && argv[i + 1]) {
      outputName = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      outputName = arg.slice("--output=".length);
      continue;
    }

    if (arg === "--fps" && argv[i + 1]) {
      fps = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg.startsWith("--fps=")) {
      fps = Number(arg.slice("--fps=".length));
      continue;
    }

    if (arg === "--smooth") {
      smooth = true;
      continue;
    }

    if (arg === "--no-smooth") {
      smooth = false;
    }
  }

  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    throw new Error("Duration must be a positive number of seconds.");
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error("FPS must be a positive number.");
  }

  const pageFile = page.replace(/^[/\\]+/, "");
  if (!pageFile.toLowerCase().endsWith(".html")) {
    throw new Error("Page must be an .html file inside dist.");
  }

  return {
    pageFile,
    durationSec,
    outputName: outputName.trim(),
    fps,
    smooth,
  };
}

async function startStaticServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === "/") pathname = "/index.html";
        if (pathname.endsWith("/")) pathname += "index.html";

        const normalized = path.normalize(pathname).replace(/^[/\\]+/, "");
        const filePath = path.join(rootDir, normalized);

        if (!filePath.startsWith(rootDir)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        const fileStat = await stat(filePath).catch(() => null);
        if (!fileStat || fileStat.isDirectory()) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        const data = await readFile(filePath);
        res.statusCode = 200;
        res.setHeader("Content-Type", getMimeType(filePath));
        res.end(data);
      } catch {
        res.statusCode = 500;
        res.end("Server error");
      }
    });

    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const { pageFile, durationSec, outputName, fps, smooth } = parseArgs(process.argv.slice(2));
  const durationMs = Math.round(durationSec * 1000);
  const coverUrl = `http://127.0.0.1:${PORT}/${pageFile}`;
  const slug = pageFile
    .replace(/\.html$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-");
  const finalMp4 = path.join(
    OUTPUT_DIR,
    outputName || `musk-counter-${slug}-${Math.round(durationSec)}s-${Math.round(fps)}fps.mp4`
  );
  const rawWebm = path.join(TMP_DIR, `${slug}-raw.webm`);
  const videoFilter = smooth
    ? `minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`
    : `fps=${fps}`;

  const coverFile = path.join(DIST_DIR, pageFile);
  const coverStat = await stat(coverFile).catch(() => null);
  if (!coverStat?.isFile()) {
    throw new Error(`dist/${pageFile} not found. Run \`npm run build\` first.`);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const server = await startStaticServer(DIST_DIR, PORT);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      recordVideo: {
        dir: TMP_DIR,
        size: { width: WIDTH, height: HEIGHT },
      },
    });

    const page = await context.newPage();
    await page.goto(coverUrl, { waitUntil: "networkidle" });
    await delay(durationMs);

    const video = page.video();
    await context.close();
    const videoPath = await video.path();

    await rename(videoPath, rawWebm);

    if (!ffmpegPath) {
      throw new Error("ffmpeg-static binary is not available.");
    }

    await runCommand(ffmpegPath, [
      "-y",
      "-i",
      rawWebm,
      "-t",
      String(durationSec),
      "-vf",
      videoFilter,
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-level",
      "4.1",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      finalMp4,
    ]);

    console.log(`Saved: ${finalMp4}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }

    await new Promise((resolve) => server.close(resolve));
    await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
