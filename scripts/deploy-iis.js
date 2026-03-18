#!/usr/bin/env node
/**
 * BD Navigator – Deployment Script for Windows IIS
 * 
 * Builds the frontend with SQLite backend config and packages
 * everything into a ready-to-deploy folder.
 * 
 * Usage:
 *   node scripts/deploy-iis.js [--output <path>]
 * 
 * Output: deploy/ folder (or custom path) with:
 *   ├── index.html          ← SPA entry
 *   ├── assets/             ← JS/CSS bundles
 *   ├── index.js            ← Express API (iisnode)
 *   ├── web.config          ← IIS rewrite rules
 *   ├── package.json        ← Server dependencies
 *   ├── BDNavigator.db      ← SQLite DB (if exists, else created on start)
 *   └── uploads/            ← File upload directory
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// --- Config ---
const ROOT = path.resolve(__dirname, "..");
const SERVER_DIR = path.join(ROOT, "server");
const DIST_DIR = path.join(ROOT, "dist");

const outputArg = process.argv.indexOf("--output");
const OUTPUT_DIR = outputArg !== -1 && process.argv[outputArg + 1]
  ? path.resolve(process.argv[outputArg + 1])
  : path.join(ROOT, "deploy");

// --- Helpers ---
function log(msg) { console.log(`\x1b[36m[deploy]\x1b[0m ${msg}`); }
function success(msg) { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }
function warn(msg) { console.log(`\x1b[33m⚠\x1b[0m ${msg}`); }

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

// --- Main ---
async function main() {
  log("BD Navigator IIS Deployment Script");
  log("===================================\n");

  // 1. Clean output directory
  log(`Output directory: ${OUTPUT_DIR}`);
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  success("Output directory prepared");

  // 2. Build frontend with SQLite backend
  log("Building frontend (VITE_BACKEND=sqlite)...");
  try {
    execSync("npx vite build", {
      cwd: ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        VITE_BACKEND: "sqlite",
        VITE_API_URL: "/api",
      },
    });
    success("Frontend build complete");
  } catch (e) {
    console.error("Frontend build failed!");
    process.exit(1);
  }

  // 3. Copy dist contents to output root (SPA files)
  log("Copying frontend build...");
  if (!fs.existsSync(DIST_DIR)) {
    console.error("dist/ directory not found. Build may have failed.");
    process.exit(1);
  }
  copyDir(DIST_DIR, OUTPUT_DIR);
  success(`Frontend files copied (${fs.readdirSync(DIST_DIR).length} items)`);

  // 4. Copy server files
  log("Copying server files...");
  const serverFiles = ["index.js", "web.config", "package.json"];
  for (const file of serverFiles) {
    const src = path.join(SERVER_DIR, file);
    if (copyFile(src, path.join(OUTPUT_DIR, file))) {
      success(`  ${file}`);
    } else {
      warn(`  ${file} not found, skipping`);
    }
  }

  // 5. Copy SQLite database (if exists)
  const dbSrc = path.join(ROOT, "BDNavigator.db");
  if (copyFile(dbSrc, path.join(OUTPUT_DIR, "BDNavigator.db"))) {
    success("SQLite database copied");
  } else {
    warn("No existing BDNavigator.db found – will be created on first start");
  }

  // 6. Create uploads directory
  fs.mkdirSync(path.join(OUTPUT_DIR, "uploads"), { recursive: true });
  success("uploads/ directory created");

  // 7. Install server dependencies
  log("Installing server dependencies...");
  try {
    execSync("npm install --production", {
      cwd: OUTPUT_DIR,
      stdio: "inherit",
    });
    success("Server dependencies installed");
  } catch (e) {
    warn("npm install failed – you may need to run it manually on the server");
  }

  // 8. Summary
  console.log("\n" + "=".repeat(50));
  success("Deployment package ready!\n");
  log(`Location: ${OUTPUT_DIR}`);
  log("Contents:");
  
  const items = fs.readdirSync(OUTPUT_DIR);
  for (const item of items) {
    const stat = fs.statSync(path.join(OUTPUT_DIR, item));
    const size = stat.isDirectory() ? "DIR" : `${(stat.size / 1024).toFixed(1)} KB`;
    console.log(`  ${stat.isDirectory() ? "📁" : "📄"} ${item.padEnd(25)} ${size}`);
  }

  console.log("\n" + "─".repeat(50));
  log("Next steps:");
  console.log("  1. Copy the deploy/ folder to your IIS server");
  console.log("  2. Create a new IIS Website pointing to this folder");
  console.log("  3. Set Application Pool to 'No Managed Code'");
  console.log("  4. Ensure the App Pool user has write access to:");
  console.log("     - BDNavigator.db");
  console.log("     - uploads/");
  console.log("  5. Install iisnode if not already installed");
  console.log("  6. (Optional) Test locally: node index.js");
  console.log("");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
