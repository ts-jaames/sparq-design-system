import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkDiff } from "./diff.js";

function fileDiff(path: string, removed: string[], added: string[]): string {
  return [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    `@@ -10,${removed.length} +10,${added.length} @@`,
    ...removed.map((line) => `-${line}`),
    ...added.map((line) => `+${line}`),
  ].join("\n");
}

describe("checkDiff", () => {
  it("passes a className change on a line that keeps its handler", () => {
    const diff = fileDiff(
      "src/Interview.tsx",
      [`<button onClick={submit} className="rounded bg-orange-500">Next</button>`],
      [`<button onClick={submit} className="sparq-hit sparq-focus primary">Next</button>`],
    );
    const report = checkDiff(diff, "surfaces");
    assert.equal(report.pass, true);
    assert.deepEqual(report.revert, []);
    assert.deepEqual(report.review, []);
  });

  it("passes stylesheet edits and the Sparq stylesheet link", () => {
    const diff = [
      fileDiff("src/styles/app.css", [".card { box-shadow: 0 4px 8px #000; }"], [".card { border-bottom: 1px solid var(--sparq-rule); }"]),
      fileDiff("index.html", [], [
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ts-jaames/sparq-design-system@0.2/tokens/sparq-tokens.css" />`,
      ]),
    ].join("\n");
    const report = checkDiff(diff, "connect");
    assert.equal(report.pass, true);
    assert.equal(report.fileCount, 2);
  });

  it("flags an added handler, hook, request, and changed submit type", () => {
    const diff = fileDiff(
      "src/Upload.tsx",
      [`<button type="submit" className="btn">Save</button>`],
      [
        `const [open, setOpen] = useState(false);`,
        `useEffect(() => { fetch("/api/status"); }, []);`,
        `<button type="button" onClick={() => setOpen(true)} className="sparq-hit">Save</button>`,
      ],
    );
    const report = checkDiff(diff, "surfaces");
    assert.equal(report.pass, false);
    const reasons = report.revert.map((item) => item.reason).join(" ");
    assert.match(reasons, /hook or effect/);
    assert.match(reasons, /event handler|state update/);
    assert.match(reasons, /form or validation attribute/);
  });

  it("flags a removed handler and locked files", () => {
    const diff = [
      fileDiff("src/Nav.tsx", [`<a href="/home" onClick={track} className="pill">Home</a>`], [`<a href="/home" className="sparq-prose">Home</a>`]),
      fileDiff("package.json", [`"version": "1.0.0"`], [`"version": "1.0.1"`]),
      fileDiff("src/api/client.ts", [`const base = "/v1";`], [`const base = "/v2";`]),
    ].join("\n");
    const report = checkDiff(diff, "surfaces");
    assert.equal(report.pass, false);
    assert.ok(report.revert.some((item) => item.file === "src/Nav.tsx" && /removes/.test(item.reason)));
    assert.ok(report.revert.some((item) => item.file === "package.json"));
    assert.ok(report.revert.some((item) => item.file === "src/api/client.ts"));
  });

  it("sends copy changes to review and component files in foundation to review", () => {
    const diff = fileDiff("src/components/Header.tsx", [`<h1>How should the tool start?</h1>`], [`<h1>Start from</h1>`]);
    const report = checkDiff(diff, "foundation");
    assert.equal(report.pass, true);
    assert.ok(report.review.some((item) => /component file/.test(item.reason)));
    assert.ok(report.review.some((item) => /not recognised/.test(item.reason)));
  });

  it("stops a surfaces batch over the file limit and ignores Sparq files in the count", () => {
    const parts = Array.from({ length: 16 }, (_, index) =>
      fileDiff(`src/screens/S${index}.css`, [".a { color: red; }"], [".a { color: var(--sparq-ink); }"]),
    );
    parts.push(fileDiff("SPARQ_ADOPTION.md", [], ["- [x] Foundation"]));
    const report = checkDiff(parts.join("\n"), "surfaces");
    assert.equal(report.fileCount, 16);
    assert.equal(report.overBudget, true);
    assert.equal(report.pass, false);
    assert.match(report.next, /over the limit of 15/);
  });

  it("allows an orb beside an existing status word", () => {
    const diff = fileDiff(
      "src/Status.vue",
      [`<span class="status">Working</span>`],
      [`<span class="status"><canvas data-orb="working" aria-hidden="true"></canvas>Working</span>`],
    );
    assert.equal(checkDiff(diff, "surfaces").pass, true);
  });
});
