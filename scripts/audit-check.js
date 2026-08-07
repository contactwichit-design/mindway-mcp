import fs from "fs";
import path from "path";

console.log("=== Mindway MCP Standalone Offline Audit Check ===");

const baseDir = process.cwd();
const srcDir = path.join(baseDir, "src");

let errors = 0;

function checkFileExists(relPath) {
  const full = path.join(baseDir, relPath);
  if (fs.existsSync(full)) {
    console.log(` [PASS] File exists: ${relPath}`);
  } else {
    console.error(` [FAIL] Missing required file: ${relPath}`);
    errors++;
  }
}

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "Dockerfile",
  ".dockerignore",
  "cloudbuild.yaml",
  ".env.example",
  "README.md",
  "SECURITY.md",
  "DEPLOYMENT.md",
  "IMPROVEMENT_PROPOSALS.md",
  "src/index.ts",
  "src/server.ts",
  "src/config.ts",
  "src/security/allowlist.ts",
  "src/security/rate-limit.ts",
  "src/security/validation.ts",
  "src/github/client.ts",
  "src/github/repository.ts",
  "src/tools/load.ts",
  "src/tools/get-entry.ts",
  "src/tools/search-public.ts",
  "src/tools/get-file.ts",
  "src/tools/context-bundle.ts",
  "src/tools/status.ts",
  "src/resources/index.ts",
  "src/prompts/mindway-start.ts"
];

for (const f of requiredFiles) {
  checkFileExists(f);
}

// Secret scanning check
console.log("\nScanning for accidental secret leaks...");
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules")) {
      scanDir(full);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(full, "utf-8");
      if (new RegExp("ghp_" + "[a-zA-Z0-9]{36}|AIzaSy" + "[a-zA-Z0-9_-]{33}|-----" + "BEGIN PRIVATE KEY-----").test(content)) {
        console.error(` [FAIL] Potential secret found in: ${full}`);
        errors++;
      }
    }
  }
}

scanDir(srcDir);

console.log("\n==========================================");
if (errors === 0) {
  console.log("AUDIT CHECK RESULT: PASS (0 defects, 0 secret leaks)");
} else {
  console.log(`AUDIT CHECK RESULT: FAIL (${errors} defects found)`);
}
console.log("==========================================");
