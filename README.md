# Sparq design system

A framework-agnostic spec for Sparq apps: CSS custom properties, semantic blueprints, WCAG 2.2 AA, and an MCP server that Claude Code and Cursor can query.

The visual register is a near-black ground, warm off-white ink, one accent, and hairlines. IBM Plex Sans carries prose. IBM Plex Mono carries labels, stamps, and numbers. Cards, dashed drop zones, and filled accent buttons are not part of the system.

Linking the stylesheet does not restyle an existing app. It only declares variables and classes.

## Use it in an app

Nothing to clone. Add the server to the app's `.cursor/mcp.json` (Cursor) or `.mcp.json` (Claude Code):

```json
{
  "mcpServers": {
    "sparq-design-system": {
      "command": "npx",
      "args": ["-y", "github:ts-jaames/sparq-design-system#semver:^0.1.0"]
    }
  }
}
```

The first start downloads and builds the server, which takes several seconds. Later starts use the cache.

Copy [`templates/consumer/AGENTS.md`](templates/consumer/AGENTS.md) to the app root, and [`templates/consumer/CLAUDE.md`](templates/consumer/CLAUDE.md) if you use Claude Code. That file is a pointer. The full rules come from `sparq_get_rules`, so they stay current without editing the app.

Link the stylesheet and fonts. Do not copy the CSS file into the app.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;500;600&family=IBM+Plex+Sans:wght@400;600&display=swap" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ts-jaames/sparq-design-system@0.1/tokens/sparq-tokens.css" />
```

Opening prompts for a new app, an existing app, and a single stage are in [`templates/consumer/PROMPTS.md`](templates/consumer/PROMPTS.md).

## Updates

Both the server and the stylesheet are pinned to a minor version, `0.1`.

- A patch release, such as `0.1.1`, reaches every app on its own. The stylesheet URL resolves to the newest `0.1.x` tag. The server picks it up when the npx cache refreshes; run `npx clear-npx-cache` or remove `~/.npm/_npx` to force it.
- A minor release, such as `0.2.0`, can restyle apps that use the changed tokens. Apps move to it on purpose, by changing `0.1` to `0.2` in both places.

`sparq_get_version` returns the current version, the pinned URLs, and the changelog, so an agent can say when an app is behind. See [`CHANGELOG.md`](CHANGELOG.md).

## Existing app

The first session writes `SPARQ_ADOPTION.md` and stops. The app should look the same after the stylesheet is linked.

Later, one stage runs on one named surface:

1. Connect
2. Ground and ink
3. Type
4. Seams
5. Accent
6. Focus
7. AI movement

A stage may change color, type, borders, spacing, and focus styling. It may name a control the way the control already works. It does not change handlers, state, effects, requests, validation, routing, or what a click submits. If a pattern wants a different state, that is written as a suggestion and left uncoded.

## Tools

`sparq_get_rules`, `sparq_get_version`, `sparq_get_tokens`, `sparq_list_components`, `sparq_get_component_spec`, `sparq_get_guardrails`, `sparq_get_a11y`, `sparq_get_orb`, `sparq_audit_snippet`, `sparq_plan_adoption`, `sparq_next_change`.

`sparq_get_component_spec` takes `react`, `vue`, `svelte`, `html`, or `vanilla-css`.

## Accessibility

Every app, internal or external, targets WCAG 2.2 Level AA. Approved text colors on `#1A1A1A` clear 4.5:1. Accent on the off-white ink is disallowed. APCA is not the conformance test.

## Orbs

`motion/thinking-orbs/` is [thinking-orbs 0.3.1](https://github.com/Jakubantalik/thinking-orbs), MIT. `motion/orbs.js` mounts a canvas. The canvas is hidden from assistive tech. The word beside it is the name. States: `working`, `listening`, `searching`, `breathing`.

## Develop

```
npm install
npm test
```

`npm install` builds the server. `npm test` rebuilds the tokens and the server, then checks the auditor, contrast pairs, blueprints, adoption text, and that the changelog and landing page match the package version.

```
tokens/tokens.json          source of truth
tokens/sparq-tokens.css     generated variables and opt-in classes
tokens/sparq-tokens.json    generated values, contrast pairs, markers
blueprints/                 QuestionCard, SectionRail, AutoFix
guardrails/audiences.json   internal, external, hybrid
a11y/wcag-2.2.json          accessibility floor for every audience
adoption/stages.json        one visual stage at a time
rules/consumer.md           rules served by sparq_get_rules
motion/                     vendored thinking-orbs and a vanilla mount
mcp-server/                 stdio MCP server
templates/consumer/         pointer rules, MCP config, prompts
index.html                  SDS landing
CHANGELOG.md                release notes
```

To preview the landing page, run `python3 -m http.server 8080` from the repo root and open `http://127.0.0.1:8080/`.

## Release

1. Edit `tokens/tokens.json` or the specs, then run `npm test`.
2. Bump `version` in `package.json`, add a `CHANGELOG.md` entry, and update the version and changelog on `index.html`.
3. Commit, tag `vX.Y.Z`, and push the tag.
