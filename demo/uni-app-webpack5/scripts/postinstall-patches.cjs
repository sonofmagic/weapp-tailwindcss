#!/usr/bin/env node
/**
 * Postinstall patches for known upstream issues.
 * - Make @dcloudio vue templateLoader handle Promise code to avoid "[object Promise]" parse errors on Node 20/22.
 *
 * Idempotent: safe to run multiple times.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function log(...args) {
  console.log('[postinstall-patches]', ...args);
}

function findPnpmDirs(startDir) {
  const dirs = [];
  let cur = startDir;
  const limit = 10;
  for (let i = 0; i < limit; i++) {
    const candidate = path.join(cur, 'node_modules', '.pnpm');
    if (fs.existsSync(candidate)) dirs.push(candidate);
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return dirs;
}

function findUniTemplateLoaderFiles() {
  const hits = [];
  // Try resolve the exact loader that this workspace will use
  try {
    const resolved = require.resolve(
      '@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js',
      { paths: [ROOT] }
    );
    if (fs.existsSync(resolved)) {
      hits.push(resolved);
      return hits;
    }
  } catch (_) {}
  // Fallback: scan pnpm dirs (may be blocked by sandbox on monorepo root)
  const pnpmDirs = findPnpmDirs(ROOT);
  for (const PNPM_DIR of pnpmDirs) {
    const entries = fs.readdirSync(PNPM_DIR);
    for (const ent of entries) {
      if (!ent.startsWith('@dcloudio+vue-cli-plugin-uni@')) continue;
      const loaderPath = path.join(
        PNPM_DIR,
        ent,
        'node_modules',
        '@dcloudio',
        'vue-cli-plugin-uni',
        'packages',
        'vue-loader',
        'lib',
        'loaders',
        'templateLoader.js'
      );
      if (fs.existsSync(loaderPath)) hits.push(loaderPath);
    }
  }
  return hits;
}

function patchTemplateLoader(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes('if (code && typeof code.then ===')) {
    log('already patched:', file);
    return false;
  }
  const needle = 'return code + `\\nexport { render, staticRenderFns, recyclableRender, components }`';
  if (!src.includes(needle)) {
    log('skip (needle not found):', file);
    return false;
  }
  const replacement =
    "if (code && typeof code.then === 'function') {\n" +
    "    const cb = loaderContext.async()\n" +
    "    code.then((resolved) => {\n" +
    "      cb(null, resolved + `\\nexport { render, staticRenderFns, recyclableRender, components }`)\n" +
    "    }, (err) => cb(err))\n" +
    "    return\n" +
    "  }\n" +
    "  return code + `\\nexport { render, staticRenderFns, recyclableRender, components }`";
  const out = src.replace(needle, replacement);
  if (out === src) {
    log('no change:', file);
    return false;
  }
  fs.writeFileSync(file, out, 'utf8');
  log('patched:', file);
  return true;
}

function main() {
  let total = 0;
  const files = findUniTemplateLoaderFiles();
  if (!files.length) {
    log('no @dcloudio/vue-cli-plugin-uni templateLoader.js found. nothing to patch.');
    return;
  }
  for (const f of files) {
    try {
      if (patchTemplateLoader(f)) total++;
    } catch (e) {
      console.warn('[postinstall-patches] failed to patch', f, e && e.message);
    }
  }
  log('done. modified files:', total, '/', files.length);
}

try {
  main();
} catch (e) {
  console.warn('[postinstall-patches] error:', e && e.message);
}
