// Focus-ring clipping detector.
//
// The ring sits at outline-offset 2px, entirely OUTSIDE the element box, so it
// is invisible wherever something paints over it (a later sibling's opaque
// background) or crops it (an ancestor's overflow, or the viewport edge under a
// sticky bar). None of that is visible in computed styles, so measure pixels.
//
// Focus is driven by real Tab keypresses: element.focus() does not reliably set
// :focus-visible in Chromium, which would hide the very ring we are checking.
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = process.argv[2] ?? "http://localhost:5173";
const PAD = 8; // ring occupies 2-4px outside the box
const MAX_STOPS = 90;
const ROUTES = ["uuid/generate", "uuid/validate", "uuid/convert", "ulid", "nanoid", "ksuid"];

const crop = async (page, box) => PNG.sync.read(await page.screenshot({ clip: box }));

function edgeBands(a, b, pad, inset) {
  const { width: w, height: h } = a;
  const differs = (x, y) => {
    const i = (y * w + x) << 2;
    return (
      Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2])
    ) > 24;
  };
  // Sample only the middle 50% of each edge. A rounded ring curves into the
  // corners of the adjacent bands, so counting corner pixels reports a side as
  // present when its whole straight run is actually covered.
  const xs = Math.floor(w * 0.25);
  const xe = Math.ceil(w * 0.75);
  const ys = Math.floor(h * 0.25);
  const ye = Math.ceil(h * 0.75);
  const bands = { top: 0, bottom: 0, left: 0, right: 0 };
  for (let x = xs; x < xe; x++) {
    for (let y = 0; y < Math.min(pad.top, h); y++) if (differs(x, y)) bands.top++;
    for (let y = Math.max(0, h - pad.bottom); y < h; y++) if (differs(x, y)) bands.bottom++;
  }
  for (let y = ys; y < ye; y++) {
    for (let x = 0; x < Math.min(pad.left, w); x++) if (differs(x, y)) bands.left++;
    for (let x = Math.max(0, w - pad.right); x < w; x++) if (differs(x, y)) bands.right++;
  }
  if (!inset) {
    for (const side of ["top", "bottom", "left", "right"]) {
      if (pad[side] < PAD) bands[side] = -1; // no room to paint => cropped
    }
  }
  return bands;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const findings = [];

for (const route of ROUTES) {
  await page.goto(`${BASE}/${route}`);
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
  await page.waitForTimeout(150);
  await page.evaluate(() => document.activeElement?.blur?.());

  const visited = new Set();
  let stops = 0;
  for (let stop = 0; stop < MAX_STOPS; stop++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(25);

    const meta = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const cls = typeof el.className === "string" ? el.className.trim() : "";
      const seen = el.dataset.frSeen === "1";
      el.dataset.frSeen = "1";
      return {
        seen,
        tag: el.tagName.toLowerCase(),
        cls,
        label: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 22),
        focusVisible: el.matches(":focus-visible"),
        outline: `${cs.outlineWidth} ${cs.outlineStyle} @${cs.outlineOffset}`,
        offset: parseFloat(cs.outlineOffset) || 0,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        skip: el.classList.contains("skip-link") || cs.outlineStyle === "none",
        scrollY: window.scrollY,
      };
    });
    if (!meta) break;
    if (meta.seen) break; // wrapped back to an element we already stamped
    visited.add(`${meta.tag}.${meta.cls}`);
    stops++;
    if (meta.skip || meta.rect.w < 2 || meta.rect.h < 2) continue;

    // Tab scrolls just enough to reveal the element, often leaving it flush
    // with the viewport edge. Centre it (scrolling does not blur) so "no room
    // for the ring" means a real sticky-bar crop, not where Tab happened to stop.
    const centred = await page.evaluate(() => {
      const el = document.activeElement;
      const sticky = el.closest(".topbar, .status");
      if (!sticky) el.scrollIntoView({ block: "center", inline: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    meta.rect = centred;

    const vw = page.viewportSize().width;
    const vh = page.viewportSize().height;
    // A negative outline-offset draws the ring INSIDE the border box, so the
    // bands to sample are the inner edges and there is nothing to crop.
    const inset = meta.offset < 0;
    const pad = inset
      ? { left: PAD, top: PAD, right: PAD, bottom: PAD }
      : {
          left: Math.min(PAD, Math.floor(meta.rect.x)),
          top: Math.min(PAD, Math.floor(meta.rect.y)),
          right: Math.min(PAD, Math.floor(vw - (meta.rect.x + meta.rect.w))),
          bottom: Math.min(PAD, Math.floor(vh - (meta.rect.y + meta.rect.h))),
        };
    const box = inset
      ? {
          x: Math.max(0, Math.floor(meta.rect.x)),
          y: Math.max(0, Math.floor(meta.rect.y)),
          width: Math.ceil(meta.rect.w),
          height: Math.ceil(meta.rect.h),
        }
      : {
          x: Math.max(0, Math.floor(meta.rect.x) - pad.left),
          y: Math.max(0, Math.floor(meta.rect.y) - pad.top),
          width: Math.ceil(meta.rect.w) + pad.left + pad.right,
          height: Math.ceil(meta.rect.h) + pad.top + pad.bottom,
        };
    if (box.width < 4 || box.height < 4 || box.y + box.height > vh) continue;

    let focused, blurred;
    try {
      focused = await crop(page, box);
      // Blur to capture the resting state, then restore focus so Tab resumes
      // from the same place; the next stop is still reached by a real keypress.
      const handle = await page.evaluateHandle(() => document.activeElement);
      await page.evaluate((el) => el.blur(), handle);
      await page.waitForTimeout(25);
      blurred = await crop(page, box);
      await page.evaluate((el) => el.focus(), handle);
      await page.waitForTimeout(15);
    } catch {
      continue;
    }

    const bands = edgeBands(focused, blurred, pad, inset);
    let missing = ["top", "right", "bottom", "left"].filter((s) => bands[s] <= 0);
    // The active tab already carries a 2px accent underline, so the inset
    // ring's bottom edge lands on pixels that are that colour either way and
    // no change is detectable. Visually the ring is complete.
    if (meta.cls.includes("tab-btn--active")) {
      missing = missing.filter((s) => s !== "bottom");
    }
    if (missing.length) {
      findings.push({
        route,
        el: `${meta.tag}${meta.cls ? "." + meta.cls.split(/\s+/).join(".") : ""}`,
        label: meta.label,
        missing,
        cropped: ["top", "right", "bottom", "left"].filter((s) => bands[s] === -1),
        focusVisible: meta.focusVisible,
      });
    }
  }
  console.error(`  [${route}] tab stops walked: ${stops}, distinct classes: ${visited.size}`);
}

await browser.close();

if (!findings.length) {
  console.log("All focus rings render on all four sides.");
} else {
  const seen = new Set();
  for (const f of findings) {
    const key = f.el + "|" + f.missing.join();
    if (seen.has(key)) continue;
    seen.add(key);
    const why = f.cropped.length ? `cropped by viewport (${f.cropped.join(",")})` : "painted over by a sibling";
    console.log(`${f.route.padEnd(14)} ${f.el}  "${f.label}"`);
    console.log(`    missing: ${f.missing.join(", ")}  --  ${why}`);
  }
  console.log(`\n${seen.size} distinct control(s) with a clipped focus ring.`);
}
process.exit(findings.length ? 1 : 0);
