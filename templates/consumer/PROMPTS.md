# Opening prompts

## Connect

This app uses the Sparq design system. Add an MCP server named `sparq-design-system` to `.cursor/mcp.json` and `.mcp.json`, keeping any servers already there:

```json
{
  "command": "npx",
  "args": ["-y", "github:ts-jaames/sparq-design-system#semver:^0.2.0"]
}
```

Copy `AGENTS.md` and `CLAUDE.md` from https://github.com/ts-jaames/sparq-design-system/tree/main/templates/consumer to the repo root. If either file exists, append the Sparq section. Do not change product code. Then stop so I can reload.

## New app

Build the first screen with the Sparq design system. The app is new. Call `sparq_get_rules`, link `cssUrl` and `fontsUrl` from `sparq_get_tokens`, and implement the patterns I name from `sparq_get_component_spec`. Do not write a SPARQ_ADOPTION.md.

## Existing app

This app already exists and is connected to Sparq. Call `sparq_get_rules`. Then call `sparq_plan_adoption` with mode `existing`, and write the result to `SPARQ_ADOPTION.md`. Do not edit product code in this turn.

## Next visual stage

Apply the next Sparq stage to this file only. Call `sparq_next_change`. Change presentation only. If a state needs to change to match a pattern, record the suggestion in `SPARQ_ADOPTION.md` and do not change operational code.
