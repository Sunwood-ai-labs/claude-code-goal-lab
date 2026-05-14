# Claude Code Goal Redelivery 1: Fix Forest Softlock

The first RPG build has a likely softlock:

- Village exit sends the player to Area 1 at `{ x: 1, y: 4 }`.
- Area 1 `playerStart` is also `{ x: 1, y: 4 }`.
- In `MAPS[1].tiles`, that tile and its immediate neighbors are trees/walls, so normal movement can be blocked after entering Dark Forest.

## Required Fix

Update `examples/goal-rpg/game.js` so the Dark Forest entry/start position is on a passable path tile and has a normal route to:

1. the forest spirit NPC,
2. the wisdom crystal,
3. the tower exit.

Suggested safe value:

```js
MAPS[1].playerStart = { x: 3, y: 4 }
Village exit target = { targetMap: 1, targetX: 3, targetY: 4 }
```

But you may choose a better passable coordinate if you verify it.

## Required Verification

After editing, run:

```bash
node --check examples/goal-rpg/game.js
```

Update `reports/2026-05-14-rpg-goal-delivery.md` with a short redelivery note describing:

- the softlock found,
- the fix,
- the verification command.

Completion condition:

Finish only after the forest start/entry is passable, the route is playable by normal movement, syntax check passes, and the delivery report contains the redelivery note.

