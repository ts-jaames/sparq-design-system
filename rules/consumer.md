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
- The nav is a single flat list with no group labels. Role-gated items join the end of the same list.
- Content area:
  - Content is left-aligned against the nav. Do not centre the page with auto margins.
  - Every page uses the same maximum content width, so the left and right edges don't move between pages. Content does not have to fill the window.
  - A right rail, when a page needs one, sits to the right of the content block in the remaining space. Adding it never moves the content's left edge.
  - Full-bleed tool layouts, such as a multi-pane workspace, are exempt.
- Mono is always uppercase. Use it only for labels (`.sparq-label`) and figures (`.sparq-figure`). Anything that reads as a sentence or a name uses Plex Sans.
- Section titles inside a page use `.sparq-label`. They read as footnotes, not headings. Keep the heading element so the outline does not change.
- Hairline or space:
  - Space separates sections: `--sparq-s6` to `--sparq-s8`.
  - A hairline separates repeated items of the same kind, such as list rows, table rows, and log entries.
  - A hairline always has at least `--sparq-s2` of space on each side.
- Hover and selected: text moves to `--sparq-ink`. Any fill uses `--sparq-raise`, never a tinted or brown surface. Selected also takes `.sparq-mark`, so state is never color alone.

## Text roles

- Section titles: `.sparq-label`, which is `--sparq-ink-bright` (pure white).
- Body text, descriptions, and values: `--sparq-ink` (off-white).
- Secondary text steps down through `--sparq-ink-soft`, `--sparq-ink-muted`, and `--sparq-ink-faint`. Nothing goes below faint.
- Pure white is for section titles only. Do not use it for body text or emphasis.

## Copy density

Apps are internal unless specified as external. Internal readers are practitioners and experts, so write for them.

- A section gets a title. Add one sentence only when it states a consequence (irreversible, or leaves a gap), a blocker (why a control is disabled), or live status.
- Do not add a description that restates the title, explains the product, or says what happens next.
- Merge a question-style heading and its explanation into one short title. "How should the tool start?" plus "Add documents or start an interview" becomes "Start from".
- External and hybrid apps follow `copy` in `sparq_get_guardrails` and keep plain-language explanations.

## Controls

- One filled primary per view: `--sparq-accent-deep` fill, `--sparq-ground` text, `--sparq-accent` fill on hover. It is slim: about 4px of vertical padding at the small size and 6px at the default size.
- Never put white text on the accent. It is under 4.5:1.
- Every other control is a hairline (`--sparq-rule-strong`) or text.

## Overlays

- Tooltips, popovers, menus, and dialogs use `--sparq-overlay`, a shade darker than the ground, with `backdrop-filter: blur(var(--sparq-overlay-blur))`.
- Edge them with a `--sparq-rule` hairline. No shadow and no brown surface.
- Item hover inside an overlay uses `--sparq-raise`.

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

Adoption runs in three passes. Each pass ends at a human stop.

1. **Connect and plan** (`connect`). Link the stylesheet, call `sparq_plan_adoption` with `mode: "existing"`, and write `SPARQ_ADOPTION.md`. Group the screens into surface batches of related screens, each changing at most 15 files. Stop. The app should look unchanged.
2. **Foundation** (`foundation`). Map colors and fonts to Sparq variables in the theme layer only, across the whole app. Do not edit component files. Stop.
3. **Surfaces** (`surfaces`), one batch per request. Apply hairlines, the accent, focus and hit areas, and orbs to the screens in that batch. Stop after each batch.

For each pass:

1. Call `sparq_next_change` with the pass id, the batch name, and its files.
2. Apply the presentation edits only.
3. If the tool returns a suggestion, append it to the suggestions section. Do not code it.
4. Before stopping, pass the gate:
   1. Call `sparq_check_diff` with the pass's `git diff`, including new files, and the pass id.
   2. Revert every hunk under `revert`, record its intent as a suggestion, and run the check again.
   3. Justify or revert every line under `review`.
   4. Run the app's typecheck, tests, and build if it has them.
5. Report the changed files, the reverted hunks, and the suggestions. Check the pass or batch box. Do not start the next one.

Stop early, before the gate, if a change is ambiguous or a batch grows past its file limit.

Never change event handlers, state, effects, requests, validation, routing, or what a click submits during a pass. A behavioral gap, such as emitting `isGap` instead of empty text, stays a suggestion until someone asks for that behavior on its own.

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
- `sparq_check_diff`

Call `sparq_get_guardrails` with `internal`, `external`, or `hybrid` before writing copy on a shared surface. External views hide raw model errors and internal vocabulary. Hybrid shows diagnostics only when the person is authenticated.
