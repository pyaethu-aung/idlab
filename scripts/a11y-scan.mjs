// Standalone accessibility/layout scanner.
//
//   npm run dev          # in one shell
//   node a11y-scan.mjs   # in another
//
// Walks every route in both themes at desktop and mobile widths and reports
// text-contrast failures, undersized touch targets, and horizontal overflow.
// Contrast is measured on composited colours (parent backgrounds, inherited
// opacity) with transitions disabled, because reading a token value out of the
// stylesheet tells you nothing about what actually lands on screen.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:5173";
const ROUTES = [
  ["uuid/generate", "Generate"],
  ["uuid/validate", "Validate"],
  ["uuid/convert", "Convert"],
  ["ulid", null],
  ["nanoid", null],
  ["ksuid", null],
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const probe = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (css) => {
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const toLin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lum = (a) => 0.2126 * toLin(a[0]) + 0.7152 * toLin(a[1]) + 0.0722 * toLin(a[2]);
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
  const ratio = (a, b) => {
    const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
    return (hi + 0.05) / (lo + 0.05);
  };
  const visible = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      n = n.parentElement;
    }
    return el.getBoundingClientRect().width > 0;
  };
  // Walk up until an opaque background, compositing translucent layers.
  const groundOf = (el) => {
    let n = el;
    const layers = [];
    while (n && n.nodeType === 1) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        layers.push(c);
        if (c[3] >= 0.999) break;
      }
      n = n.parentElement;
    }
    let base =
      layers.length && layers[layers.length - 1][3] >= 0.999
        ? layers.pop().slice(0, 3)
        : [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  };
  const opacityOf = (el) => {
    let n = el;
    let o = 1;
    while (n && n.nodeType === 1) {
      o *= parseFloat(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    return o;
  };
  // WCAG 1.4.3 exempts text inside an inactive component.
  const inactive = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      if (n.disabled || n.getAttribute("aria-disabled") === "true") return true;
      n = n.parentElement;
    }
    return false;
  };

  const contrast = [];
  const seen = new Set();
  document.querySelectorAll("*").forEach((el) => {
    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    );
    if (!hasOwnText) return;
    if (el.closest(".sr-only") || el.classList.contains("skip-link")) return;
    if (!visible(el) || inactive(el)) return;
    const cs = getComputedStyle(el);
    const ground = groundOf(el);
    const fg = rgba(cs.color);
    const op = opacityOf(el);
    const cr = ratio(over([fg[0], fg[1], fg[2], fg[3] * op], ground), ground);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const need = large ? 3 : 4.5;
    if (cr >= need) return;
    const cls = typeof el.className === "string" ? el.className.trim() : "";
    const key = `${el.tagName}|${cls}`;
    if (seen.has(key)) return;
    seen.add(key);
    contrast.push({
      el: el.tagName.toLowerCase() + (cls ? "." + cls.split(/\s+/).join(".") : ""),
      text: el.textContent.trim().slice(0, 28),
      ratio: +cr.toFixed(2),
      need,
    });
  });

  const touch = [];
  const tseen = new Set();
  document
    .querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button]')
    .forEach((el) => {
      if (!visible(el) || el.classList.contains("skip-link")) return;
      const r = el.getBoundingClientRect();
      if (r.width >= 24 && r.height >= 24) return;
      const cls = typeof el.className === "string" ? el.className : "";
      if (tseen.has(cls)) return;
      tseen.add(cls);
      touch.push({ el: el.tagName.toLowerCase() + "." + cls, w: Math.round(r.width), h: Math.round(r.height) });
    });

  return {
    contrast: contrast.sort((a, b) => a.ratio - b.ratio),
    touch,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    docWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  };
};

const browser = await chromium.launch();
let failures = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const [route, mode] of ROUTES) {
    await page.goto(`${BASE}/${route}`);
    // Kill transitions so colours are read settled, not mid-interpolation.
    await page.addStyleTag({
      content: "*,*::before,*::after{transition:none !important;animation:none !important}",
    });
    if (mode) await page.waitForSelector(".mode-btn");
    for (const theme of ["dark", "light"]) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);
      await page.waitForTimeout(80);
      const r = await page.evaluate(probe);
      const label = `${vp.name.padEnd(7)} ${theme.padEnd(5)} /${route}`;
      const problems = [];
      if (r.contrast.length) problems.push(`${r.contrast.length} contrast`);
      if (r.touch.length) problems.push(`${r.touch.length} touch`);
      if (r.overflowX) problems.push(`overflow ${r.docWidth}>${r.viewportWidth}`);
      if (!problems.length) {
        console.log(`  ok    ${label}`);
      } else {
        failures += r.contrast.length + r.touch.length + (r.overflowX ? 1 : 0);
        console.log(`  FAIL  ${label}  ${problems.join(", ")}`);
        for (const c of r.contrast) console.log(`          ${c.ratio}:1 (needs ${c.need}) ${c.el} "${c.text}"`);
        for (const t of r.touch) console.log(`          ${t.w}x${t.h} ${t.el}`);
      }
    }
  }
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} problem(s) found.` : "\nAll clear.");
process.exit(failures ? 1 : 0);
