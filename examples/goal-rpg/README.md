# Goalbound Chronicle

A small browser RPG built with vanilla HTML, CSS, and JavaScript. No build tools or external dependencies required.

## How to Run

```bash
cd examples/goal-rpg
python3 -m http.server 8777
```

Then open `http://localhost:8777` in a browser.

## Controls

| Input          | Action            |
|----------------|-------------------|
| Arrow keys / WASD | Move player     |
| Z / Enter / Space  | Interact / Advance dialogue |
| A button (on-screen) | Interact    |
| D-pad (on-screen)   | Move        |

In battle: use the on-screen buttons or keys 1-4.

## Clear Verification

From the repository root:

```bash
node --check examples/goal-rpg/game.js
node scripts/verify-goal-rpg.mjs
```

Expected output:

```text
GOAL_RPG_CLEAR_OK
```

## Gameplay

1. Talk to the Village Elder and collect the **Shard of Courage** from the chest.
2. Exit east to the **Dark Forest**. Collect the **Shard of Wisdom** crystal and defeat enemies.
3. Proceed to the **Crystal Tower**. With both shards, face the **Guardian** to complete the game.
