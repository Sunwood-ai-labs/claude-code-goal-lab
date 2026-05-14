# Claude Code Goal Mission: Browser RPG

Create a playable browser RPG inside this repository.

## Output Directory

Create all game files under:

```text
examples/goal-rpg/
```

## Required Files

- `examples/goal-rpg/index.html`
- `examples/goal-rpg/styles.css`
- `examples/goal-rpg/game.js`
- `examples/goal-rpg/README.md`

Do not use build tooling or external network assets. The game must run by opening `index.html` through a static local HTTP server.

## Game Requirements

Build a complete small Japanese RPG named `Goalbound Chronicle`.

The game must include:

1. A title/start screen.
2. Keyboard controls and clickable/tappable on-screen controls.
3. A visible tile/grid or map area where the player can move.
4. At least 3 areas or chapters.
5. At least 3 NPC/object interactions with Japanese dialogue.
6. At least 2 collectible goal shards or quest items.
7. A simple battle or challenge system with HP/energy.
8. A clear win/ending state.
9. A restart flow.
10. A polished visual style that feels like a tiny RPG, not a form demo.

## Design Direction

Use a distinctive "handheld stained-glass adventure" direction:

- dark ink background,
- jewel-tone map tiles,
- crisp pixel-like panels,
- readable Japanese UI,
- no purple-gradient SaaS look,
- no stock images,
- no external fonts.

## Accessibility and UX

- Show controls in the UI.
- Keep text readable on desktop and mobile widths.
- Do not rely on color alone for critical state.
- Make buttons real HTML buttons, not only canvas text.

## QA Requirements

After building, verify locally and write a delivery report at:

```text
reports/2026-05-14-rpg-goal-delivery.md
```

The delivery report must include:

- files created,
- how to run,
- gameplay checklist,
- checks performed,
- known limitations.

Acceptance checks:

- `node --check examples/goal-rpg/game.js` passes.
- Game can be served with `python3 -m http.server 8777`.
- The title screen is visible.
- Start button works.
- Player movement works by keyboard or on-screen buttons.
- At least one interaction advances dialogue or quest state.
- Ending can be reached through normal gameplay.

Completion condition:

Finish only after the game exists, the delivery report exists, and the QA checklist is complete.

