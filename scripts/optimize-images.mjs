// Turns the original photos in assets-src/images into small, modern, responsive images:
//   static/images/opt/<folder>/<name>-<width>.avif and .webp at several widths
// and writes src/data/imageManifest.json (size, available widths and a tiny blurred placeholder per
// image) which the <Picture> component reads.
//
// Usage: npm run images        (only new or changed photos are processed)
//        npm run images -- --force
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/images';
const OUT = 'static/images/opt';
const MANIFEST = 'src/data/imageManifest.json';
const force = process.argv.includes('--force');

/** Widths to produce per folder (never larger than the original) */
const WIDTHS = {
  hero: [640, 1080, 1600, 2400],
  gallery: [480, 800, 1200, 1600],
  default: [360, 720],
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(jpe?g|png|webp)$/i.test(e.name) ? [p] : [];
  });

const manifest = fs.existsSync(MANIFEST) && !force ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const files = walk(SRC);
let made = 0;

for (const file of files) {
  const rel = path.relative(SRC, file).split(path.sep).join('/');
  const key = `/images/${rel}`;
  const folder = rel.includes('/') ? rel.split('/')[0] : 'default';
  const base = rel.replace(/\.[^.]+$/, '');
  const mtime = fs.statSync(file).mtimeMs;
  if (manifest[key]?.mtime === mtime) continue;

  const img = sharp(file).rotate();
  const { width, height } = await img.metadata();
  const widths = [...new Set((WIDTHS[folder] ?? WIDTHS.default).map((w) => Math.min(w, width)))].sort((a, b) => a - b);

  fs.mkdirSync(path.dirname(path.join(OUT, base)), { recursive: true });
  for (const w of widths) {
    const resized = sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${base}-${w}.avif`));
    await resized.clone().webp({ quality: 74, effort: 5 }).toFile(path.join(OUT, `${base}-${w}.webp`));
  }
  const blur = await sharp(file).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();

  manifest[key] = {
    w: width,
    h: height,
    widths,
    base: `/images/opt/${base}`,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
    mtime,
  };
  made++;
  process.stdout.write(`\r${made} processed: ${rel}`.padEnd(100));
}

// Drop entries whose original was deleted
for (const key of Object.keys(manifest)) {
  if (!files.some((f) => `/images/${path.relative(SRC, f).split(path.sep).join('/')}` === key)) delete manifest[key];
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log(`\nDone: ${made} new, ${Object.keys(manifest).length} images in the manifest.`);
