const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/;
const RGB = /\brgba?\(/i;
const HSL = /\bhsla?\(/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}]/u;
const EMOJI_STYLE = /\uFE0F/;
const DASHED = /border(?:-style)?\s*:\s*[^;{]*dashed|border-dashed/i;
const SHADOW = /box-shadow\s*:/i;
const OUTLINE_NONE = /outline\s*:\s*(?:none|0)\b/i;

export function auditSnippet(code: string): string[] {
  const violations: string[] = [];

  if (HEX.test(code) || RGB.test(code) || HSL.test(code)) {
    violations.push(
      "HARDCODED_COLOR: Found a raw hex, rgb, or hsl color. Use var(--sparq-*) or a sparq-* class.",
    );
  }
  if (EMOJI.test(code) || EMOJI_STYLE.test(code)) {
    violations.push(
      "EMOJI_FOUND: Do not use graphic emojis for status. Use a word, a hairline, an orb, or a U+FE0E text marker.",
    );
  }
  if (DASHED.test(code)) {
    violations.push("DASHED_BORDER: Dashed zones are not part of the Sparq register. Use a hairline.");
  }
  if (SHADOW.test(code)) {
    violations.push("ELEVATION_SHADOW: box-shadow is not used for elevation. Use open space and a hairline.");
  }
  if (missingFocusReplacement(code)) {
    violations.push(
      "FOCUS_REMOVED: outline: none or outline: 0 needs a :focus-visible outline that is not none.",
    );
  }

  return violations;
}

function missingFocusReplacement(code: string): boolean {
  if (!OUTLINE_NONE.test(code)) return false;
  const blocks = code.match(/:focus-visible[^{]*\{[^}]*\}/gi) ?? [];
  return !blocks.some((block) => /outline\s*:\s*(?!none\b|0\b)/i.test(block));
}

export function formatAudit(code: string): string {
  const violations = auditSnippet(code);
  if (violations.length === 0) {
    return "COMPLIANT: No Sparq design system violations found.";
  }
  return `VIOLATIONS:\n- ${violations.join("\n- ")}`;
}
