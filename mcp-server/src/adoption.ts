import { readJson } from "./load.js";

type Stage = {
  id: string;
  title: string;
  scope: string;
  replaces: string[];
  apply: string[];
  suggest: string[];
  stop: string;
};

type StagesFile = {
  rule: string;
  doesNotChange: string[];
  maxFilesPerBatch: number;
  gate: string[];
  stages: Stage[];
};

function stagesFile(): StagesFile {
  return readJson<StagesFile>("adoption", "stages.json");
}

export function listStages(): Stage[] {
  return stagesFile().stages;
}

export function maxFilesPerBatch(): number {
  return stagesFile().maxFilesPerBatch;
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
    "Each later request runs one pass: the foundation, or one surface batch.",
    "",
    "Do not change operational code:",
    ...file.doesNotChange.map((item) => `- ${item}`),
    "",
    "Before every stop:",
    ...file.gate.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Passes",
    "",
  ];

  for (const stage of file.stages) {
    lines.push(`- [ ] ${stage.title} (\`${stage.id}\`, ${stage.scope})`);
    for (const item of stage.apply) lines.push(`  - Apply: ${item}`);
    for (const item of stage.suggest) lines.push(`  - Suggest, do not code: ${item}`);
    lines.push(`  - Stop: ${stage.stop}`);
    lines.push("");
  }

  lines.push("## Surface batches");
  lines.push("");
  lines.push(
    `Group screens that share a route or feature area. A batch should change at most ${file.maxFilesPerBatch} files. List the files, and any colors or fonts hardcoded in them.`,
  );
  lines.push("");
  lines.push("- [ ] Batch 1: <route or feature area>");
  lines.push("  - Files: <paths>");
  lines.push("  - Hardcoded: <none yet>");
  lines.push("");

  lines.push("## Suggestions");
  lines.push("");
  lines.push(
    "Behavior the screen does not yet show, and hunks the gate reverted. Do not implement these as part of a pass.",
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

export function nextChange(
  stageId: string,
  files?: string[],
  batch?: string,
): {
  stage: string;
  title: string;
  scope: string;
  doNotCode: true;
  note: string | null;
  batch: string | null;
  files: string[];
  maxFiles: number | null;
  apply: string[];
  suggest: string[];
  gate: string[];
  stop: string;
} {
  const file = stagesFile();
  const stage =
    file.stages.find((item) => item.id === stageId) ??
    file.stages.find((item) => item.replaces.includes(stageId));
  if (!stage) {
    throw new Error(
      `Unknown stage "${stageId}". Use one of: ${file.stages.map((item) => item.id).join(", ")}.`,
    );
  }
  return {
    stage: stage.id,
    title: stage.title,
    scope: stage.scope,
    doNotCode: true,
    note:
      stage.id === stageId
        ? null
        : `"${stageId}" is now part of "${stage.id}". Run the whole pass.`,
    batch: batch ?? null,
    files: files ?? [],
    maxFiles: stage.id === "surfaces" ? file.maxFilesPerBatch : null,
    apply: stage.apply,
    suggest: stage.suggest,
    gate: file.gate,
    stop: `${stage.stop} Do not edit handlers, state, effects, requests, validation, or routing. Do not start the next pass.`,
  };
}
