import { readJson } from "./load.js";

type Stage = {
  id: string;
  title: string;
  apply: string[];
  suggest: string[];
};

type StagesFile = {
  rule: string;
  doesNotChange: string[];
  stages: Stage[];
};

function stagesFile(): StagesFile {
  return readJson<StagesFile>("adoption", "stages.json");
}

export function listStages(): Stage[] {
  return stagesFile().stages;
}

export function planAdoption(mode: "new" | "existing", notes?: string): string {
  if (mode === "new") {
    return [
      "# Sparq on a new app",
      "",
      "No SPARQ_ADOPTION.md. There is no existing operation to preserve.",
      "Build from sparq_get_component_spec. Include the behavior the spec describes.",
      "Follow WCAG 2.2 AA from the first screen.",
      "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const file = stagesFile();
  const lines = [
    "# Sparq adoption",
    "",
    file.rule,
    "",
    "This file is a checklist, not a diff. The first session writes it and stops.",
    "A later request applies one stage to one named surface.",
    "",
    "Do not change operational code:",
    ...file.doesNotChange.map((item) => `- ${item}`),
    "",
    "## Stages",
    "",
  ];

  for (const stage of file.stages) {
    lines.push(`- [ ] ${stage.title} (\`${stage.id}\`)`);
    for (const item of stage.apply) lines.push(`  - Apply: ${item}`);
    for (const item of stage.suggest) lines.push(`  - Suggest, do not code: ${item}`);
    lines.push("");
  }

  lines.push("## Suggestions");
  lines.push("");
  lines.push(
    "Behavior the screen does not yet show. Do not implement these as part of a visual stage.",
  );
  lines.push("");
  if (notes) {
    lines.push(notes);
    lines.push("");
  } else {
    lines.push(
      "Add notes here when a blueprint wants a state the screen does not have, such as isGap or a retry bound.",
    );
    lines.push("");
  }

  return lines.join("\n");
}

export function nextChange(stageId: string, fileName?: string): {
  stage: string;
  doNotCode: true;
  apply: string[];
  suggest: string[];
  file: string | null;
  stop: string;
} {
  const file = stagesFile();
  const stage = file.stages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(
      `Unknown stage "${stageId}". Use one of: ${file.stages.map((item) => item.id).join(", ")}.`,
    );
  }
  return {
    stage: stage.id,
    doNotCode: true,
    apply: stage.apply,
    suggest: stage.suggest,
    file: fileName ?? null,
    stop:
      "Apply the presentation edits only, on the named file. Do not edit handlers, state, effects, requests, validation, or routing. Do not start the next stage.",
  };
}
