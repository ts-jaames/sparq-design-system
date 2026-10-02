import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextChange, planAdoption } from "./adoption.js";
import { listComponents, loadBlueprint, renderSpec } from "./spec.js";

describe("adoption", () => {
  it("writes a checklist for an existing app and does not prescribe a reskin", () => {
    const plan = planAdoption("existing", "Gap action still submits empty text.");
    assert.match(plan, /SPARQ adoption|Sparq adoption/);
    assert.match(plan, /connect/);
    assert.match(plan, /ai-movement/);
    assert.match(plan, /Do not change operational code/);
    assert.match(plan, /empty text/);
    assert.match(plan, /Suggest, do not code/);
  });

  it("skips the migration file for a new app", () => {
    const plan = planAdoption("new");
    assert.match(plan, /No SPARQ_ADOPTION.md/);
  });

  it("returns one stage and marks behavior as do-not-code", () => {
    const change = nextChange("focus", "src/App.vue");
    assert.equal(change.stage, "focus");
    assert.equal(change.doNotCode, true);
    assert.equal(change.file, "src/App.vue");
    assert.match(change.suggest.join(" "), /tab order/i);
    assert.match(change.stop, /Do not start the next stage/);
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
