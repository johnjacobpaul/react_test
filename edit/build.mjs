// Build: pulls inline <style>/<script> out of index.src.html, minifies them,
// writes content-hashed files to dist/assets/, and emits a slim dist/index.html.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';
import { minify as minifyHtml } from 'html-minifier-terser';

const SRC = 'index.src.html';
const OUT = 'dist';

let html = readFileSync(SRC, 'utf8');

// 1. Park the <noscript> block (it contains its own <style> that must stay inline).
const noscripts = [];
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (m) => {
  noscripts.push(m);
  return `<!--NOSCRIPT_${noscripts.length - 1}-->`;
});

// 2. Extract CSS.
const css = [];
html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, body) => {
  css.push(body);
  return '';
});

// 3. Extract inline JS (leave any <script src=...> alone).
const js = [];
html = html.replace(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_, body) => {
  js.push(body);
  return '';
});

console.log(`extracted: ${css.length} style block(s), ${js.length} script block(s)`);

// 4. Minify.
const cssOut = (await transform(css.join('\n'), { loader: 'css', minify: true })).code;
// Concatenate in original order. ';' guards against a missing trailing semicolon.
// No bundling/format option on purpose: top-level functions (closeModal, used by
// inline onclick="" attributes) must stay global, and esbuild won't rename them.
const jsOut = (await transform(js.join('\n;\n'), { loader: 'js', minify: true, legalComments: 'none' })).code;

// 5. Hash + write.
const hash = (s) => createHash('sha256').update(s).digest('base64url').slice(0, 8);
const cssName = `index-${hash(cssOut)}.css`;
const jsName = `index-${hash(jsOut)}.js`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/assets`, { recursive: true });
writeFileSync(`${OUT}/assets/${cssName}`, cssOut);
writeFileSync(`${OUT}/assets/${jsName}`, jsOut);

// 6. Re-link in <head>. Relative paths so it works at a domain root or in a subfolder,
// matching the page's other relative references (logos/, projects/, capability/).
html = html.replace(
  '</head>',
  `<link rel="stylesheet" href="assets/${cssName}"><script defer src="assets/${jsName}"></script></head>`
);

// 7. Restore <noscript>, then minify the HTML itself.
html = html.replace(/<!--NOSCRIPT_(\d+)-->/g, (_, i) => noscripts[Number(i)]);
html = await minifyHtml(html, {
  collapseWhitespace: true,
  conservativeCollapse: true, // keep one space where whitespace separates inline text
  removeComments: true,
  minifyCSS: true,            // the <noscript><style> block
});

writeFileSync(`${OUT}/index.html`, html);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`dist/index.html          ${kb(html.length)}`);
console.log(`dist/assets/${cssName}  ${kb(cssOut.length)}`);
console.log(`dist/assets/${jsName}   ${kb(jsOut.length)}`);
