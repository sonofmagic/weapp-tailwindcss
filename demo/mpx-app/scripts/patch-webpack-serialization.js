"use strict";

/**
 * Webpack 5.103.0 started throwing when the same serializer is registered
 * more than once. Multiple copies of @mpxjs/webpack-plugin in this monorepo
 * trigger duplicate registrations, so we guard the register call and ignore
 * the benign "already registered" error.
 */
const fs = require("fs");
const path = require("path");

function patchMakeSerializable() {
  const makeSerializablePath = require.resolve("webpack/lib/util/makeSerializable", {
    paths: [__dirname],
  });
  const source = fs.readFileSync(makeSerializablePath, "utf8");
  const alreadyPatched = source.includes('err.message.includes("already registered")');

  if (alreadyPatched) {
    return;
  }

  const target = "register(Constructor, request, name, new ClassSerializer(Constructor));";
  if (!source.includes(target)) {
    throw new Error(`Patch target not found in ${makeSerializablePath}`);
  }

  const patched = source.replace(
    target,
    [
      "\ttry {",
      "\t\tregister(Constructor, request, name, new ClassSerializer(Constructor));",
      "\t} catch (err) {",
      '\t\tif (err && typeof err.message === "string" && err.message.includes("serializer for") && err.message.includes("already registered")) {',
      "\t\t\treturn;",
      "\t\t}",
      "\t\tthrow err;",
      "\t}",
    ].join("\n")
  );

  fs.writeFileSync(makeSerializablePath, patched, "utf8");
  console.log(`Patched ${makeSerializablePath}`);
}

function dedupeMpxWebpackPlugin() {
  const resolvedPkg = require.resolve("@mpxjs/webpack-plugin/package.json", { paths: [__dirname] });
  const canonicalDir = fs.realpathSync(path.dirname(resolvedPkg));
  const version = require(resolvedPkg).version;
  const prefix = `@mpxjs+webpack-plugin@${version}`;

  const pnpmDirs = [
    path.resolve(__dirname, "..", "node_modules", ".pnpm"),
    path.resolve(__dirname, "..", "..", "..", "node_modules", ".pnpm"),
  ];

  pnpmDirs.forEach(baseDir => {
    if (!fs.existsSync(baseDir)) return;

    fs.readdirSync(baseDir)
      .filter(name => name.startsWith(prefix))
      .forEach(name => {
        const pluginDir = path.join(baseDir, name, "node_modules", "@mpxjs", "webpack-plugin");
        if (!fs.existsSync(pluginDir)) return;

        const realDir = fs.realpathSync(pluginDir);
        if (realDir === canonicalDir) return;

        fs.rmSync(pluginDir, { recursive: true, force: true });
        fs.symlinkSync(canonicalDir, pluginDir);
        console.log(`Symlinked ${pluginDir} -> ${canonicalDir}`);
      });
  });
}

dedupeMpxWebpackPlugin();
patchMakeSerializable();
