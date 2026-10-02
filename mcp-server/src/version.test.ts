import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { repoPath } from "./paths.js";
import { cssUrl, packageVersion, versionInfo } from "./version.js";

describe("version", () => {
  const version = packageVersion();

  it("pins the stylesheet to the minor version", () => {
    const [major, minor] = version.split(".");
    assert.equal(
      cssUrl(version),
      `https://cdn.jsdelivr.net/gh/ts-jaames/sparq-design-system@${major}.${minor}/tokens/sparq-tokens.css`,
    );
  });

  it("keeps the changelog and the landing page on the package version", () => {
    assert.match(versionInfo().changelog, new RegExp(`## ${version.replace(/\./g, "\\.")}`));
    const landing = readFileSync(repoPath("index.html"), "utf8");
    assert.ok(landing.includes(`>${version}</p>`), "index.html shows a different version");
  });

  it("serves the full consumer rules", () => {
    const rules = readFileSync(repoPath("rules", "consumer.md"), "utf8");
    assert.match(rules, /sparq_get_rules/);
    assert.match(rules, /Never change event handlers/);
  });
});
