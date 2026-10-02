import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { repoPath } from "./paths.js";

type Pair = {
  id: string;
  foreground: string;
  background: string;
  ratio: number;
  minRatio: number;
  allowed: boolean;
  role: string;
};

describe("generated tokens", () => {
  const css = readFileSync(repoPath("tokens", "sparq-tokens.css"), "utf8");
  const flat = JSON.parse(
    readFileSync(repoPath("tokens", "sparq-tokens.json"), "utf8"),
  ) as { contrast: Pair[]; classes: string[] };
  const source = JSON.parse(
    readFileSync(repoPath("tokens", "tokens.json"), "utf8"),
  ) as { color: Record<string, { $value: string }> };

  it("includes every color token value", () => {
    for (const token of Object.values(source.color)) {
      assert.ok(
        css.includes(token.$value),
        `missing ${token.$value} in sparq-tokens.css`,
      );
    }
  });

  it("ships hairline classes and not card utilities", () => {
    for (const name of [
      "sparq-rule",
      "sparq-label",
      "sparq-prose",
      "sparq-figure",
      "sparq-mark",
    ]) {
      assert.ok(css.includes(`.${name}`));
      assert.ok(flat.classes.includes(name));
    }
    assert.equal(css.includes("sparq-panel"), false);
    assert.equal(css.includes("sparq-inset"), false);
    assert.equal(css.includes("dashed"), false);
  });

  it("keeps approved pairs at or above their minimum", () => {
    const textPairs = flat.contrast.filter(
      (pair) => pair.allowed && pair.role === "text",
    );
    assert.ok(textPairs.length >= 6);
    for (const pair of flat.contrast.filter((item) => item.allowed)) {
      assert.ok(
        pair.ratio >= pair.minRatio,
        `${pair.id} is ${pair.ratio}, minimum ${pair.minRatio}`,
      );
    }
  });

  it("records accent on ink as disallowed", () => {
    const pair = flat.contrast.find((item) => item.id === "accent-on-ink");
    assert.ok(pair);
    assert.equal(pair?.allowed, false);
    assert.ok((pair?.ratio ?? 0) < 4.5);
  });
});
