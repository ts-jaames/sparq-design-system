# Agents editing this repository

Follow `CLAUDE.md`.

- Change tokens in `tokens/tokens.json`, then run `npm run build:tokens`.
- Keep blueprints semantic. Do not put framework utility classes in them.
- Do not add `.sparq-panel`, inset cards, dashed borders, or shadow utilities.
- Orbs come from the vendored MIT engine in `motion/thinking-orbs/`. Do not rewrite the engine. States live in `motion/orb-states.json`.
- Adoption tools suggest presentation changes. They do not rewrite operational code.
- Run `npm test` before finishing a change to tokens, the auditor, or adoption stages.
- Consumer rules live in `rules/consumer.md` and reach apps through `sparq_get_rules`. Keep `templates/consumer/AGENTS.md` a short pointer.
- A release bumps `package.json`, `CHANGELOG.md`, and `index.html` together, then tags `vX.Y.Z`.
