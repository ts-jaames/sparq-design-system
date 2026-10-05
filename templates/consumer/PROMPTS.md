# Opening prompts

## Connect

This app uses the Sparq design system. Add an MCP server named `sparq-design-system` to `.cursor/mcp.json` and `.mcp.json`, keeping any servers already there:

```json
{
  "command": "npx",
  "args": ["-y", "github:ts-jaames/sparq-design-system#semver:^0.3.0"]
}
```

Copy `AGENTS.md` and `CLAUDE.md` from https://github.com/ts-jaames/sparq-design-system/tree/main/templates/consumer to the repo root. If either file exists, append the Sparq section. Do not change product code. Then stop so I can reload.

## New app

Build the first screen with the Sparq design system. The app is new. Call `sparq_get_rules`, link `cssUrl` and `fontsUrl` from `sparq_get_tokens`, and implement the patterns I name from `sparq_get_component_spec`. Do not write a SPARQ_ADOPTION.md.

## Existing app: connect and plan

This app already exists and is connected to Sparq. Call `sparq_get_rules` and `sparq_get_version`. Run the `connect` pass from `sparq_next_change`: link the stylesheet, call `sparq_plan_adoption` with mode `existing`, and write `SPARQ_ADOPTION.md`. Group the screens into surface batches by route or feature area. Pass the gate, report, and stop. The app should look unchanged.

## Foundation

Run the Sparq `foundation` pass from `sparq_next_change`. Change colors and fonts in the theme layer only, across the whole app. Do not edit component files; list hardcoded values under their batch in `SPARQ_ADOPTION.md`. Pass the gate with `sparq_check_diff`, report, and stop.

## Surface batch

Run the Sparq `surfaces` pass on batch "<batch name>" from `SPARQ_ADOPTION.md`. Change presentation only. If a state needs to change to match a pattern, record the suggestion and do not change operational code. Pass the gate with `sparq_check_diff`, report, and stop. Do not start the next batch.
