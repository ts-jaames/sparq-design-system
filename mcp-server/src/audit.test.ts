import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditSnippet, formatAudit } from "./audit.js";

describe("auditSnippet", () => {
  it("passes a snippet that uses tokens and a focus-visible outline", () => {
    const code = `
      .name { color: var(--sparq-ink); background: var(--sparq-ground); }
      .sparq-focus:focus { outline: none; }
      .sparq-focus:focus-visible { outline: 2px solid var(--sparq-accent); }
    `;
    assert.deepEqual(auditSnippet(code), []);
    assert.match(formatAudit(code), /^COMPLIANT/);
  });

  it("flags hex, rgb, hsl, emoji, dashes, shadow, and a bare outline reset", () => {
    const code = `
      color: #E75437; background: rgb(0, 0, 0); border-color: hsl(10, 80%, 50%);
      border: 1px dashed #ccc;
      box-shadow: 0 8px 24px rgba(0,0,0,.4);
      button:focus { outline: none; }
      status: "done 😀";
    `;
    const violations = auditSnippet(code);
    assert.ok(violations.some((item) => item.startsWith("HARDCODED_COLOR")));
    assert.ok(violations.some((item) => item.startsWith("EMOJI_FOUND")));
    assert.ok(violations.some((item) => item.startsWith("DASHED_BORDER")));
    assert.ok(violations.some((item) => item.startsWith("ELEVATION_SHADOW")));
    assert.ok(violations.some((item) => item.startsWith("FOCUS_REMOVED")));
  });

  it("allows a U+FE0E text marker", () => {
    const code = `gap.textContent = "⚑\\uFE0E";`;
    assert.deepEqual(auditSnippet(code), []);
  });
});
