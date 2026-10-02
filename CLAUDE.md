# Sparq design system

This repository is the spec. It is not a component library for one framework.

Tokens in `tokens/tokens.json` are the source of truth. Run `npm run build:tokens` after a token edit. Do not hand-edit `tokens/sparq-tokens.css` or `tokens/sparq-tokens.json`.

## Register

Near-black ground, warm ink, one accent, hairlines, IBM Plex Sans for prose and IBM Plex Mono for labels and numbers. No cards, dashed zones, elevation shadows, or filled accent buttons as the default control.

`tokens/sparq-tokens.css` declares variables and opt-in classes only. Linking it must not restyle a consumer app.

## Blueprints

`blueprints/*.json` describe structure, ARIA, token roles, and behavior. No Tailwind class strings. Behavior in a blueprint is for a new build. On an existing app it is a suggestion.

## Adoption

`adoption/stages.json` is one visual stage at a time. A stage may change color, type, borders, spacing, and focus styling. It does not change handlers, state, effects, requests, validation, routing, or what a click submits.

## Accessibility

WCAG 2.2 AA applies to internal and external apps. Contrast pairs are checked when tokens are built. Approved text on the ground stays at or above 4.5:1. Accent text is not placed on the off-white ink.

## MCP

The server in `mcp-server/` reads these files. It does not write into consumer apps. Tools return text the consumer's agent applies under `templates/consumer/AGENTS.md`.
