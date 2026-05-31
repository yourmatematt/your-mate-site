/**
 * Build the served GBP Checklist (accommodation) PDF from clean HTML source.
 *
 * Source : pdf-src/gbp-checklist-accommodation.html
 * Output : downloads/gbp-checklist.pdf  (overwrites the served file)
 *
 * This is the regenerable source for the binary at /downloads/gbp-checklist.pdf.
 * Do NOT confuse this with generate-gbp-pdf.cjs (stale, different document,
 * wrong output path — leave it alone).
 *
 * Usage: node build-gbp-checklist-accommodation.cjs
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const srcPath = path.join(__dirname, 'pdf-src', 'gbp-checklist-accommodation.html');
  const outPath = path.join(__dirname, 'downloads', 'gbp-checklist.pdf');

  if (!fs.existsSync(srcPath)) {
    console.error(`Source HTML not found: ${srcPath}`);
    process.exit(1);
  }

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Source : ${srcPath}`);
  console.log(`Output : ${outPath}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = pathToFileURL(srcPath).href;
  await page.goto(url, { waitUntil: 'networkidle' });

  // Belt-and-braces: wait for Google Fonts to actually load before printing
  await page.evaluate(() => document.fonts && document.fonts.ready);

  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(outPath);
  console.log(`PDF written: ${outPath}`);
  console.log(`Size       : ${Math.round(stats.size / 1024)} KB`);
})().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
