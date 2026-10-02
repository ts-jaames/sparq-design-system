import { listJson, readJson } from "./load.js";

export type BlueprintNode = {
  element: string;
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
  children?: BlueprintNode[];
};

export type Blueprint = {
  name: string;
  purpose: string;
  aria: Record<string, string>;
  structure: BlueprintNode;
  tokenRoles: string[];
  behavioralRules: string[];
  legalOrbStates?: string[];
  adoption: { apply: string; suggest: string[] };
};

const FRAMEWORKS = ["react", "vue", "svelte", "html", "vanilla-css"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

const ALIASES: Record<string, string> = {
  questioncard: "question-card",
  "question-card": "question-card",
  sectionrail: "section-rail",
  "section-rail": "section-rail",
  autofix: "auto-fix",
  autofixbanner: "auto-fix",
  "auto-fix": "auto-fix",
  "auto-fix-banner": "auto-fix",
};

export function normalizeFramework(value: string | undefined): Framework {
  const name = (value ?? "react").toLowerCase();
  if ((FRAMEWORKS as readonly string[]).includes(name)) return name as Framework;
  throw new Error(
    `Unknown framework "${value}". Use one of: ${FRAMEWORKS.join(", ")}.`,
  );
}

export function listComponents(): string[] {
  return listJson("blueprints").map((file) => file.replace(/\.json$/, ""));
}

export function loadBlueprint(componentName: string): Blueprint {
  const key = componentName.toLowerCase().replace(/[\s_]/g, "");
  const file = ALIASES[key] ?? ALIASES[componentName.toLowerCase()];
  if (!file) {
    throw new Error(
      `Unknown component "${componentName}". Known: ${listComponents().join(", ")}.`,
    );
  }
  return readJson<Blueprint>("blueprints", `${file}.json`);
}

function attrs(node: BlueprintNode, framework: Framework): string {
  const source = { ...(node.attrs ?? {}) };
  if (node.className) source.class = node.className;
  return Object.entries(source)
    .map(([name, value]) => {
      const attr = framework === "react" && name === "class" ? "className" : name;
      return `${attr}="${value}"`;
    })
    .join(" ");
}

function html(node: BlueprintNode, framework: Framework, depth: number): string {
  const pad = "  ".repeat(depth);
  const open = attrs(node, framework);
  const children = node.children ?? [];
  const start = open ? `<${node.element} ${open}>` : `<${node.element}>`;
  if (children.length === 0) {
    return `${pad}${start}${node.text ?? ""}</${node.element}>`;
  }
  const body = children.map((child) => html(child, framework, depth + 1)).join("\n");
  const text = node.text ? `\n${pad}  ${node.text}` : "";
  return `${pad}${start}${text}\n${body}\n${pad}</${node.element}>`;
}

function wrap(framework: Framework, name: string, body: string): string {
  if (framework === "react") {
    return `export function ${name}() {\n  return (\n${body}\n  );\n}`;
  }
  if (framework === "vue") {
    return `<template>\n${body}\n</template>`;
  }
  if (framework === "svelte") {
    return `<script>\n  // Presentation only. Wire existing state from the caller.\n</script>\n\n${body}`;
  }
  if (framework === "vanilla-css") {
    return `<!-- Classes come from sparq-tokens.css. Do not add a framework stylesheet. -->\n${body}`;
  }
  return body;
}

export function renderSpec(blueprint: Blueprint, framework: Framework): string {
  const body = html(blueprint.structure, framework, framework === "react" ? 2 : 0);
  return [
    `# ${blueprint.name} (${framework})`,
    "",
    blueprint.purpose,
    "",
    "Use var(--sparq-*) or the sparq-* classes. Do not hardcode hex.",
    "Numbers use tabular-nums via .sparq-figure.",
    "Status markers, when text, use U+FE0E: ⚑︎ gap, ⚠︎ warning.",
    "",
    "## Structure",
    "",
    wrap(framework, blueprint.name, body),
    "",
    "## Behavior for a new build",
    "",
    ...blueprint.behavioralRules.map((rule) => `- ${rule}`),
    "",
    "## Existing app",
    "",
    `Apply: ${blueprint.adoption.apply}`,
    ...blueprint.adoption.suggest.map((item) => `Suggest, do not code: ${item}`),
  ].join("\n");
}
