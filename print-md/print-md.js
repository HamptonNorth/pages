#!/usr/bin/env node
// =============================================================================
// print-md
// Render a .md file → temp HTML using print-md.css → open in default browser
// and trigger the print dialog automatically.
//
// Usage: print-md /path/to/file.md
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { attributes: {}, body: text };
  const attributes = {};
  match[1].split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    attributes[key] = value;
  });
  return { attributes, body: text.replace(match[0], "").trim() };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fail(msg, code = 1) {
  console.error(`print-md: ${msg}`);
  process.exit(code);
}

const inputArg = process.argv[2];
if (!inputArg) fail("usage: print-md <file.md>", 2);

const mdPath = resolve(inputArg);
if (!existsSync(mdPath)) fail(`file not found: ${mdPath}`);

const cssPath = join(__dirname, "print-md.css");
if (!existsSync(cssPath)) fail(`stylesheet not found: ${cssPath}`);

const raw = readFileSync(mdPath, "utf8");
const { attributes: meta, body } = parseFrontMatter(raw);
const css = readFileSync(cssPath, "utf8");

const title = meta.title || basename(mdPath, ".md");
const dateStr =
  meta.created ||
  new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Resolve relative image paths against the source file's directory so
// ![alt](./img.png) still works when viewed from /tmp.
marked.use({
  walkTokens(token) {
    if (
      token.type === "image" &&
      token.href &&
      !/^([a-z]+:|\/|data:)/i.test(token.href)
    ) {
      token.href = pathToFileURL(resolve(dirname(mdPath), token.href)).href;
    }
  },
});

const contentHtml = marked.parse(body);

// CSS string-escape for the @page margin-box content() values.
const cssStr = (s) =>
  '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

// Per-document @page footer: full path + date on the left, "Page N / total"
// on the right. Bottom margin is enlarged here so the footer has clear room
// without overriding the user's main margin settings in print-md.css.
// Note: @page margin boxes are supported by Chromium-based browsers; Firefox
// will silently omit the footer but still print the body correctly.
const footerCss = `
@page {
  margin-bottom: 2cm;
  @bottom-left {
    content: ${cssStr(`${mdPath}  ·  ${dateStr}`)};
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 7pt;
    font-weight: lighter;
    color: #78909c;
  }
  @bottom-right {
    content: "Page " counter(page) " / " counter(pages);
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 7pt;
    font
    color: #78909c;
  }
}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
${css}
${footerCss}
</style>
</head>
<body>
<div class="md-github">
  ${contentHtml}
</div>
<script>
  window.addEventListener('load', function () {
    setTimeout(function () { window.print() }, 250)
  })
</script>
</body>
</html>
`;

const outPath = join(
  tmpdir(),
  `print-md-${randomBytes(6).toString("hex")}.html`,
);
writeFileSync(outPath, html, "utf8");

const child = spawn("xdg-open", [outPath], { detached: true, stdio: "ignore" });
child.on("error", (err) => fail(`xdg-open failed: ${err.message}`));
child.unref();
