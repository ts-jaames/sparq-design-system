# Sparq design system

A framework-agnostic spec for Sparq apps: CSS custom properties, semantic blueprints, WCAG 2.2 AA, and an MCP server that Claude Code and Cursor can query.

The visual register is a near-black ground, warm off-white ink, one accent, and hairlines. IBM Plex Sans carries prose. IBM Plex Mono carries labels, stamps, and numbers. Cards, dashed drop zones, and filled accent buttons are not part of the system.

Linking the stylesheet does not restyle an existing app. It only declares variables and classes.

## Layout

```
tokens/tokens.json          source of truth
tokens/sparq-tokens.css     generated variables and opt-in classes
tokens/sparq-tokens.json    generated values, contrast pairs, markers
blueprints/                 QuestionCard, SectionRail, AutoFix
guardrails/audiences.json   internal, external, hybrid
a11y/wcag-2.2.json          accessibility floor for every audience
adoption/stages.json        one visual stage at a time
motion/                     vendored thinking-orbs and a vanilla mount
mcp-server/                 stdio MCP server
templates/consumer/         rules and config to copy into an app
index.html                  SDS landing
```

## Develop

```
npm install --prefix mcp-server
npm test
npm run build
```

`npm test` rebuilds the tokens and checks the auditor, contrast pairs, blueprints, and adoption text.

## Preview

From the repo root:

```
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/` for the SDS landing. Fonts come from Google Fonts and fall back to system stacks with no network.

## MCP

Build the server, then point Claude Code (`.mcp.json`) or Cursor (`.cursor/mcp.json`) at it. The same JSON is in `templates/consumer/mcp.json`. Replace the placeholder path.

```json
{
  "mcpServers": {
    "sparq-design-system": {
      "command": "node",
      "args": ["/absolute/path/sparq-design-system/mcp-server/dist/index.js"]
    }
  }
}
```

Tools: `sparq_get_tokens`, `sparq_list_components`, `sparq_get_component_spec`, `sparq_get_guardrails`, `sparq_get_a11y`, `sparq_get_orb`, `sparq_audit_snippet`, `sparq_plan_adoption`, `sparq_next_change`.

`sparq_get_component_spec` takes `react`, `vue`, `svelte`, `html`, or `vanilla-css`.

## New app

Copy `templates/consumer/AGENTS.md` to the app root, and `templates/consumer/CLAUDE.md` if the agent reads that file. Link `tokens/sparq-tokens.css`. Ask for a pattern by name. The agent implements the spec, including its behavior, because there is no existing operation to preserve. The prompt is in `templates/consumer/PROMPTS.md`.

## Existing app

The first session writes `SPARQ_ADOPTION.md` and stops. The app should look the same after the CSS file is linked.

Later, one stage runs on one named surface:

1. Connect
2. Ground and ink
3. Type
4. Seams
5. Accent
6. Focus
7. AI movement

A stage may change color, type, borders, spacing, and focus styling. It may name a control the way the control already works. It does not change handlers, state, effects, requests, validation, routing, or what a click submits. If a pattern wants a different state, that is written as a suggestion and left uncoded.

## Accessibility

Every app, internal or external, targets WCAG 2.2 Level AA. Approved text colors on `#1A1A1A` clear 4.5:1. Accent on the off-white ink is disallowed. APCA is not the conformance test.

## Orbs

`motion/thinking-orbs/` is [thinking-orbs 0.3.1](https://github.com/Jakubantalik/thinking-orbs), MIT. `motion/orbs.js` mounts a canvas. The canvas is hidden from assistive tech. The word beside it is the name. States: `working`, `listening`, `searching`, `breathing`.
