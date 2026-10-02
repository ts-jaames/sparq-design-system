# Changelog

## Unreleased

- Token `--sparq-raise`: a neutral lift off the ground for hover and selected states.
- Rules for the app shell and rhythm: no top bar, open text-only navigation, mono only in uppercase, section titles as labels, when to use a hairline and when to use space, and hover and selected states.
- Token `--sparq-ink-bright` (`#FFFFFF`). `.sparq-label` now uses it, so section titles are pure white and body text stays off-white.
- Tokens `--sparq-overlay` and `--sparq-overlay-blur` for tooltips, popovers, menus, and dialogs: darker than the ground, near-opaque, blurred, no shadow.
- One filled primary per view is now allowed: `--sparq-accent-deep` fill with `--sparq-ground` text. New contrast pairs record it, and record white on the accent as disallowed.
- Copy density: internal is the default audience and gets practitioner copy. Each audience in the guardrails now has a `copy` rule.
- The nav is a single flat list with no group labels.
- Content area: left-aligned against the nav at one shared maximum width, never centred. A right rail sits beside the content without moving its left edge. Full-bleed tool layouts are exempt.

## 0.1.0 — 2 Oct 2026

Initial spec.

- Tokens for the Sparq register: near-black ground, warm ink, one accent, hairlines, IBM Plex.
- Blueprints for QuestionCard, SectionRail, and AutoFix.
- WCAG 2.2 AA floor for internal, external, and hybrid apps.
- One-stage, presentation-only adoption for existing apps.
- MCP server that runs from GitHub with `npx`, and a versioned stylesheet URL.
