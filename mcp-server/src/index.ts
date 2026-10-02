#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { nextChange, planAdoption } from "./adoption.js";
import { formatAudit } from "./audit.js";
import { readJson, readText } from "./load.js";
import {
  listComponents,
  loadBlueprint,
  normalizeFramework,
  renderSpec,
} from "./spec.js";
import { cssUrl, fontsUrl, packageVersion, versionInfo } from "./version.js";

const server = new McpServer({
  name: "sparq-design-system",
  version: packageVersion(),
});

function text(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

server.registerTool(
  "sparq_get_rules",
  {
    description:
      "Fetch the current Sparq rules for a consumer app. Call this before any UI work.",
    inputSchema: {},
  },
  async () => text(readText("rules", "consumer.md")),
);

server.registerTool(
  "sparq_get_version",
  {
    description:
      "Fetch the Sparq version, the pinned stylesheet URL, the font URL, and the changelog.",
    inputSchema: {},
  },
  async () => text(versionInfo()),
);

server.registerTool(
  "sparq_get_tokens",
  {
    description:
      "Fetch the Sparq stylesheet URL, CSS custom properties, contrast pairs, surface classes, and text markers.",
    inputSchema: {},
  },
  async () => {
    const flat = readJson<Record<string, unknown>>("tokens", "sparq-tokens.json");
    const css = readText("tokens", "sparq-tokens.css");
    return text({
      version: packageVersion(),
      cssUrl: cssUrl(),
      fontsUrl,
      link: "Link cssUrl and fontsUrl. Do not copy the stylesheet into the app.",
      ...flat,
      css,
    });
  },
);

server.registerTool(
  "sparq_list_components",
  {
    description: "List Sparq blueprint names.",
    inputSchema: {},
  },
  async () => text({ components: listComponents() }),
);

server.registerTool(
  "sparq_get_component_spec",
  {
    description:
      "Get a UI pattern spec and a short skeleton for react, vue, svelte, html, or vanilla-css. On an existing app, treat behavior as a suggestion.",
    inputSchema: {
      componentName: z
        .string()
        .describe("QuestionCard, SectionRail, or AutoFix"),
      framework: z
        .enum(["react", "vue", "svelte", "html", "vanilla-css"])
        .optional()
        .describe("Target framework. Defaults to react."),
    },
  },
  async ({ componentName, framework }) => {
    const blueprint = loadBlueprint(componentName);
    const target = normalizeFramework(framework);
    return text({
      blueprint,
      framework: target,
      skeleton: renderSpec(blueprint, target),
    });
  },
);

server.registerTool(
  "sparq_get_guardrails",
  {
    description:
      "Fetch visual rules and the audience profile: internal, external, or hybrid.",
    inputSchema: {
      audience: z.enum(["internal", "external", "hybrid"]).optional(),
    },
  },
  async ({ audience }) => {
    const all = readJson<{
      audiences: Record<string, unknown>;
      visual: string[];
      floor: string;
      operational: string;
    }>("guardrails", "audiences.json");
    if (!audience) return text(all);
    return text({
      floor: all.floor,
      operational: all.operational,
      visual: all.visual,
      audience: all.audiences[audience],
    });
  },
);

server.registerTool(
  "sparq_get_a11y",
  {
    description:
      "Fetch the WCAG 2.2 AA floor. It applies to internal and external apps.",
    inputSchema: {},
  },
  async () => text(readJson("a11y", "wcag-2.2.json")),
);

server.registerTool(
  "sparq_get_orb",
  {
    description:
      "Fetch the AI-movement orb map. Orbs are presentational and sit beside a word.",
    inputSchema: {
      state: z.enum(["working", "listening", "searching", "breathing"]).optional(),
    },
  },
  async ({ state }) => {
    const map = readJson<{
      states: Record<string, Record<string, unknown>>;
      rules: string[];
    }>("motion", "orb-states.json");
    if (!state) return text(map);
    return text({ state, ...map.states[state], rules: map.rules });
  },
);

server.registerTool(
  "sparq_audit_snippet",
  {
    description:
      "Audit a snippet for hardcoded color, emoji, dashed borders, elevation shadows, and removed focus outlines. This does not change the snippet.",
    inputSchema: {
      codeSnippet: z.string(),
      fileExtension: z.string().optional(),
    },
  },
  async ({ codeSnippet }) => text(formatAudit(codeSnippet)),
);

server.registerTool(
  "sparq_plan_adoption",
  {
    description:
      "Return a SPARQ_ADOPTION.md body for an existing app, or a note that a new app does not need one. Does not edit product code.",
    inputSchema: {
      mode: z.enum(["new", "existing"]).optional(),
      notes: z
        .string()
        .optional()
        .describe("Inventory notes or behavioral gaps to record as suggestions."),
    },
  },
  async ({ mode, notes }) => text(planAdoption(mode ?? "existing", notes)),
);

server.registerTool(
  "sparq_next_change",
  {
    description:
      "Return one presentational stage. Behavioral gaps are marked do-not-code. Does not edit operational code.",
    inputSchema: {
      stage: z
        .string()
        .describe(
          "connect, ground-ink, type, seams, accent, focus, or ai-movement",
        ),
      fileName: z.string().optional(),
    },
  },
  async ({ stage, fileName }) => text(nextChange(stage, fileName)),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
