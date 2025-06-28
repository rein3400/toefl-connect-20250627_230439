import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readManifest(manifestPath) {
  try {
    const data = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(data);
    return Array.isArray(manifest) ? manifest : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function findAiFiles(dir) {
  const aiFiles = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (path.extname(entry.name).toLowerCase() === ".ai") {
        const relativePath = path.relative(dir, fullPath).split(path.sep).join("/");
        aiFiles.push(relativePath);
      }
    }
  }
  await walk(dir);
  return aiFiles;
}

async function appendMissingAiFile(manifestPath, searchDir) {
  const rawManifest = await readManifest(manifestPath);
  const manifest = rawManifest.map(p => p.replace(/\\/g, "/"));
  const aiFiles = await findAiFiles(searchDir);
  const missing = aiFiles.filter(file => !manifest.includes(file));
  if (missing.length === 0) {
    console.log("No missing AI files to append.");
    return;
  }
  const combined = [...manifest, ...missing];
  const deduped = Array.from(new Set(combined));
  await fs.writeFile(manifestPath, JSON.stringify(deduped, null, 2));
  console.log(`Appended ${missing.length} missing AI file(s):`, missing);
}

(async () => {
  const [,, manifestArg = "aiPlan.json", dirArg = "."] = process.argv;
  const manifestPath = path.isAbsolute(manifestArg)
    ? manifestArg
    : path.resolve(__dirname, manifestArg);
  const searchDir = path.isAbsolute(dirArg)
    ? dirArg
    : path.resolve(__dirname, dirArg);
  try {
    await appendMissingAiFile(manifestPath, searchDir);
  } catch (err) {
    console.error("Error appending missing AI files:", err);
    process.exit(1);
  }
})();