import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextChange, planAdoption } from "./adoption.js";
import { listComponents, loadBlueprint, renderSpec } from "./spec.js";

describe("adoption", () => {
  it("writes a checklist for an existing app and does not prescribe a reskin", () => {
    const plan = planAdoption("existing", "Gap action still submits empty text.");
    assert.match(plan, /SPARQ adoption|Sparq adoption/);
    assert.match(plan, /`connect`/);
    assert.match(plan, /`foundation`/);
    assert.match(plan, /`surfaces`/);
    assert.match(plan, /Surface batches/);
    assert.match(plan, /sparq_check_diff/);
    assert.match(plan, /Do not change operational code/);
    assert.match(plan, /empty text/);
    assert.match(plan, /Suggest, do not code/);
  });

  it("skips the migration file for a new app", () => {
    const plan = planAdoption("new");
    assert.match(plan, /No SPARQ_ADOPTION.md/);
  });

  it("returns one surfaces batch with a file limit and the gate", () => {
    const change = nextChange("surfaces", ["src/App.vue"], "Interview");
    assert.equal(change.stage, "surfaces");
    assert.equal(change.doNotCode, true);
    assert.deepEqual(change.files, ["src/App.vue"]);
    assert.equal(change.batch, "Interview");
    assert.equal(change.maxFiles, 15);
    assert.match(change.suggest.join(" "), /tab order/i);
    assert.match(change.gate.join(" "), /sparq_check_diff/);
    assert.match(change.stop, /Do not start the next pass/);
  });

  it("maps an older stage id to its pass", () => {
    const change = nextChange("ground-ink");
    assert.equal(change.stage, "foundation");
    assert.equal(change.maxFiles, null);
    assert.match(change.note ?? "", /now part of "foundation"/);
    assert.throws(() => nextChange("nope"), /Unknown stage/);
  });
});

describe("specs", () => {
  it("lists the three patterns and renders a vue skeleton without tailwind", () => {
    assert.deepEqual(listComponents(), [
      "auto-fix",
      "question-card",
      "section-rail",
    ]);
    const spec = renderSpec(loadBlueprint("QuestionCard"), "vue");
    assert.match(spec, /<template>/);
    assert.match(spec, /sparq-mark/);
    assert.equal(spec.includes("space-y-"), false);
    assert.match(renderSpec(loadBlueprint("AutoFixBanner"), "html"), /data-orb="working"/);
  });
});
