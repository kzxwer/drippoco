const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const postsDir = path.join(projectRoot, "public", "posts");
const indexFile = path.join(postsDir, "index.json");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (!entry.name.toLowerCase().endsWith(".md")) {
      continue;
    }

    if (entry.name.toLowerCase() === "index.json") {
      continue;
    }

    const relativePath = path
      .relative(postsDir, fullPath)
      .split(path.sep)
      .join("/");

    files.push(relativePath);
  }

  return files;
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const files = walk(postsDir).sort((a, b) => a.localeCompare(b));
const payload = {
  generatedAt: new Date().toISOString(),
  files,
};

fs.writeFileSync(indexFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Generated posts index with ${files.length} file(s).`);
