import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "tokens", "tokens.json");
const cssPath = join(root, "tokens", "sparq-tokens.css");
const flatPath = join(root, "tokens", "sparq-tokens.json");

const source = JSON.parse(readFileSync(sourcePath, "utf8"));

function lin(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(foreground, background) {
  if (!foreground.startsWith("#") || !background.startsWith("#")) {
    return null;
  }
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function resolveRef(ref) {
  const path = ref.replace(/^\{|\}$/g, "").split(".");
  let node = source;
  for (const key of path) {
    node = node?.[key];
  }
  if (!node || node.$value === undefined) {
    throw new Error(`Unresolved token reference ${ref}`);
  }
  return node.$value;
}

function cssValue(type, value) {
  if (type === "fontFamily" && Array.isArray(value)) {
    return value
      .map((family) => (/\s/.test(family) ? `"${family}"` : family))
      .join(", ");
  }
  if (type === "cubicBezier" && Array.isArray(value)) {
    return `cubic-bezier(${value.join(", ")})`;
  }
  return String(value);
}

function variableName(group, key) {
  if (group === "color" || group === "space") return `--sparq-${key}`;
  if (group === "font") return `--sparq-font-${key}`;
  if (group === "typography" || group === "effect") return `--sparq-${key}`;
  if (group === "motion" && key === "ease") return "--sparq-ease";
  if (group === "motion" && key === "duration") return "--sparq-dur";
  throw new Error(`No CSS name for ${group}.${key}`);
}

const flat = {};
const declarations = [];

for (const [group, tokens] of Object.entries(source)) {
  if (group.startsWith("$") || group === "contrast") continue;
  for (const [key, token] of Object.entries(tokens)) {
    const name = variableName(group, key);
    const value = cssValue(token.$type, token.$value);
    flat[name] = {
      value,
      type: token.$type,
      group,
      description: token.$description ?? null,
    };
    declarations.push(`  ${name}: ${value};`);
  }
}

const contrast = [];
for (const [id, token] of Object.entries(source.contrast)) {
  const spec = token.$value;
  const foreground = resolveRef(spec.foreground);
  const background = resolveRef(spec.background);
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) {
    throw new Error(`Contrast pair ${id} needs hex colors`);
  }
  const rounded = Math.round(ratio * 100) / 100;
  if (spec.allowed && rounded < spec.minRatio) {
    throw new Error(
      `${id} is ${rounded}:1 and must clear ${spec.minRatio}:1`,
    );
  }
  contrast.push({
    id,
    foreground,
    background,
    ratio: rounded,
    minRatio: spec.minRatio,
    allowed: spec.allowed,
    role: spec.role,
    note: spec.note ?? null,
  });
}

const css = `/* Generated from tokens/tokens.json. Do not edit by hand.
   Declares variables and opt-in classes only.
   Linking this file does not restyle an existing app.
*/

:root {
${declarations.join("\n")}
}

.sparq-rule {
  border: 0;
  border-top: 1px solid var(--sparq-rule);
  height: 0;
  margin: 0;
}

.sparq-label {
  font-family: var(--sparq-font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: var(--sparq-track-label);
  text-transform: uppercase;
  color: var(--sparq-ink-bright);
}

.sparq-prose {
  font-family: var(--sparq-font-sans);
  font-weight: 400;
  letter-spacing: var(--sparq-title-tracking);
  line-height: 1.55;
  max-width: var(--sparq-measure);
  color: var(--sparq-ink);
}

.sparq-figure {
  font-family: var(--sparq-font-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: var(--sparq-ink);
}

.sparq-mark {
  border-left: 1px solid var(--sparq-accent);
  padding-left: 9px;
}

.sparq-hit {
  min-width: var(--sparq-hit-min);
  min-height: var(--sparq-hit-min);
}

.sparq-focus:focus {
  outline: none;
}

.sparq-focus:focus-visible {
  outline: var(--sparq-focus-width) solid var(--sparq-accent);
  outline-offset: var(--sparq-focus-offset);
}

.sparq-arrive {
  position: relative;
}

.sparq-arrive::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--sparq-accent);
  transform-origin: left;
  animation: sparq-stamp-arrive var(--sparq-dur) var(--sparq-ease) forwards;
}

@keyframes sparq-stamp-arrive {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --sparq-dur: 1ms;
  }

  .sparq-arrive::after {
    animation: none;
    transform: none;
    opacity: 1;
  }
}

@media (prefers-contrast: more) {
  :root {
    --sparq-rule: rgba(237, 234, 228, 0.55);
    --sparq-rule-strong: rgba(237, 234, 228, 0.8);
  }
}

@media (forced-colors: active) {
  .sparq-rule {
    border-top-color: CanvasText;
  }

  .sparq-mark {
    border-left-color: Highlight;
  }

  .sparq-focus:focus-visible {
    outline-color: Highlight;
  }

  .sparq-prose,
  .sparq-figure,
  .sparq-label {
    color: CanvasText;
  }
}
`;

const flatDocument = {
  name: "sparq",
  source: "tokens/tokens.json",
  variables: flat,
  contrast,
  markers: {
    gap: "⚑\uFE0E",
    warning: "⚠\uFE0E",
  },
  classes: [
    "sparq-rule",
    "sparq-label",
    "sparq-prose",
    "sparq-figure",
    "sparq-mark",
    "sparq-hit",
    "sparq-focus",
    "sparq-arrive",
  ],
};

writeFileSync(cssPath, css);
writeFileSync(flatPath, `${JSON.stringify(flatDocument, null, 2)}\n`);
console.log(`wrote ${cssPath}`);
console.log(`wrote ${flatPath}`);
