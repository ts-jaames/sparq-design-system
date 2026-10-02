# Sparq design system

You are an AI coding assistant in a consumer app. Sparq is the visual and accessibility floor. It is not a license to rewrite the product.

## Visual rules

- No hardcoded hex, rgb, or hsl. Use `var(--sparq-*)` or the classes in `sparq-tokens.css`.
- Ground is near-black. Warmth stays in the ink. Do not paint the app brown.
- One accent per view, for the one thing to look at.
- Surfaces are hairlines (`.sparq-rule`, `.sparq-mark`), not cards, dashed zones, or shadows.
- Prose uses `.sparq-prose` (IBM Plex Sans). Labels, stamps, and numbers use `.sparq-label` or `.sparq-figure` (IBM Plex Mono, tabular numbers).
- Status is a word, a hairline, or an orb. Text markers for gap and warning use U+FE0E (`⚑︎`, `⚠︎`). No emoji and no icon-library status.
- Orbs sit beside a word, `aria-hidden`, and only mean AI movement.

## Accessibility

WCAG 2.2 AA applies to internal, external, and hybrid apps. Same floor for all three.

- Text uses approved contrast pairs. Accent text sits on the ground, not on the off-white ink.
- State is never color alone.
- Focus stays visible. Do not remove an outline unless `:focus-visible` supplies one.
- Hit areas are at least 24 by 24 CSS pixels.
- On a new screen, follow the keyboard and live-region rules from `sparq_get_a11y`.

## New app

There is no migration file. When asked to build a pattern, call `sparq_get_component_spec` and implement it, including the behavior the spec describes.

## Existing app

Linking the CSS does not restyle the app. Do not edit product UI until `SPARQ_ADOPTION.md` exists.

1. Call `sparq_plan_adoption` with `mode: "existing"`.
2. Write the result to `SPARQ_ADOPTION.md`.
3. Stop. Do not restyle in that turn.

Later, when asked for the next stage on a named surface:

1. Call `sparq_next_change` with that stage id and the file name.
2. Apply the presentation edits only, on the named files.
3. If the tool returns a suggestion, append it to the suggestions section. Do not code it.
4. Check that stage's box. Do not start the next stage.

Never change event handlers, state, effects, requests, validation, routing, or what a click submits during a stage. A behavioral gap, such as emitting `isGap` instead of empty text, stays a suggestion until someone asks for that behavior on its own.

## MCP

Use the `sparq-design-system` server:

- `sparq_get_tokens`
- `sparq_list_components`
- `sparq_get_component_spec`
- `sparq_get_guardrails`
- `sparq_get_a11y`
- `sparq_get_orb`
- `sparq_audit_snippet`
- `sparq_plan_adoption`
- `sparq_next_change`

Call `sparq_get_guardrails` with `internal`, `external`, or `hybrid` before writing copy on a shared surface. External views hide raw model errors and internal vocabulary. Hybrid shows diagnostics only when the person is authenticated.
