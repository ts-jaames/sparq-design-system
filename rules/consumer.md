# Sparq design system rules

You are an AI coding assistant in a consumer app. Sparq is the visual and accessibility floor. It is not a license to rewrite the product.

## Visual rules

- No hardcoded hex, rgb, or hsl. Use `var(--sparq-*)` or the classes in `sparq-tokens.css`.
- Ground is near-black. Warmth stays in the ink. Do not paint the app brown.
- One accent per view, for the one thing to look at.
- Surfaces are hairlines (`.sparq-rule`, `.sparq-mark`), not cards, dashed zones, or shadows.
- Prose uses `.sparq-prose` (IBM Plex Sans). Labels, stamps, and numbers use `.sparq-label` or `.sparq-figure` (IBM Plex Mono, tabular numbers).
- Status is a word, a hairline, or an orb. Text markers for gap and warning use U+FE0E (`⚑︎`, `⚠︎`). No emoji and no icon-library status.
- Orbs sit beside a word, `aria-hidden`, and only mean AI movement.

## App shell and rhythm

- No top bar. The page title appears once, as the page's `h1`, in the Sparq title treatment: regular weight with `--sparq-title-tracking`.
- Navigation sits on the ground. No box, border, or fill around it. Nav items are text only, with no icons.
- Mono is always uppercase. Use it only for labels (`.sparq-label`) and figures (`.sparq-figure`). Anything that reads as a sentence or a name uses Plex Sans.
- Section titles inside a page use `.sparq-label`. They read as footnotes, not headings. Keep the heading element so the outline does not change.
- Hairline or space:
  - Space separates sections: `--sparq-s6` to `--sparq-s8`.
  - A hairline separates repeated items of the same kind, such as list rows, table rows, and log entries.
  - A hairline always has at least `--sparq-s2` of space on each side.
- Hover and selected: text moves to `--sparq-ink`. Any fill uses `--sparq-raise`, never a tinted or brown surface. Selected also takes `.sparq-mark`, so state is never color alone.

## Stylesheet

Link the stylesheet from the URL returned by `sparq_get_tokens` (`cssUrl`). Do not copy the file into the app. The URL is pinned to a minor version, so fixes arrive on their own and a new minor version is a deliberate change.

The stylesheet does not load fonts. Link `fontsUrl` from `sparq_get_tokens` once, in the document head or root layout.

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

## Updates

Call `sparq_get_version` when starting Sparq work. If the stylesheet URL in the app is pinned to an older minor version than the server reports, tell the person and link the changelog. Do not bump the version yourself unless asked.

## MCP tools

- `sparq_get_rules`
- `sparq_get_version`
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
