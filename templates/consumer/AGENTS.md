# Sparq design system

This app uses the Sparq design system through the `sparq-design-system` MCP server.

Before any UI work, call `sparq_get_rules` and follow what it returns. Those rules are current. This file is only a pointer.

If the server is not available, do not restyle anything. Never change event handlers, state, effects, requests, validation, routing, or what a click submits as part of design system work.
