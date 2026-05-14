import fs from "node:fs";
import vm from "node:vm";

const elements = new Map();

function createElement(id) {
  const classSet = new Set(id.endsWith("-screen") && id === "title-screen" ? ["screen", "active"] : []);
  const listeners = {};
  return {
    id,
    textContent: "",
    innerHTML: "",
    disabled: false,
    style: {},
    classList: {
      add: (...names) => names.forEach((name) => classSet.add(name)),
      remove: (...names) => names.forEach((name) => classSet.delete(name)),
      contains: (name) => classSet.has(name)
    },
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    click: () => {
      if (listeners.click) listeners.click();
    },
    getContext: () => ({
      clearRect() {},
      fillRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      fill() {},
      fillText() {},
      set fillStyle(_) {},
      set font(_) {},
      set textAlign(_) {}
    })
  };
}

function el(id) {
  if (!elements.has(id)) elements.set(id, createElement(id));
  return elements.get(id);
}

const math = Object.create(Math);
math.random = () => 0;

const context = {
  console,
  Math: math,
  document: {
    getElementById: el,
    addEventListener() {}
  },
  setTimeout: (fn) => fn(),
  clearTimeout() {}
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("../examples/goal-rpg/game.js", import.meta.url), "utf8"), context);

const {
  DIR,
  G,
  MAPS,
  movePlayer,
  interact,
  advanceDialogue,
  playerAttack,
  playerSpecial
} = context;

function fail(message) {
  throw new Error(message);
}

function clearDialogue() {
  let guard = 20;
  while (context.G.dialogue && guard-- > 0) advanceDialogue();
  if (context.G.dialogue) fail("dialogue did not close");
}

function move(dir, times = 1, options = {}) {
  for (let i = 0; i < times; i++) {
    const before = `${context.G.area}:${context.G.px},${context.G.py}`;
    movePlayer(dir);
    if (context.G.battle && !options.allowBattle) fail(`unexpected battle at ${context.G.area}:${context.G.px},${context.G.py}`);
    if (context.G.dialogue) clearDialogue();
    const after = `${context.G.area}:${context.G.px},${context.G.py}`;
    if (before === after) fail(`movement blocked at ${before}`);
  }
}

function assertState(condition, message) {
  if (!condition) fail(message);
}

el("btn-start").click();
assertState(context.G.screen === "game", "game did not start");

move(DIR.RIGHT, 4);
move(DIR.DOWN, 3);
interact();
clearDialogue();
assertState(context.G.shards.includes("勇気の欠片"), "courage shard missing");

move(DIR.DOWN, 1);
move(DIR.RIGHT, 6);
assertState(context.G.area === 1, "did not enter forest");
clearDialogue();

move(DIR.DOWN, 2);
move(DIR.RIGHT, 3);
move(DIR.UP, 1);
assertState(context.G.shards.includes("知恵の欠片"), "wisdom shard missing");
assertState(context.G.hp === context.G.maxHp && context.G.energy === context.G.maxEnergy, "crystal did not restore HP/EN");
clearDialogue();

move(DIR.DOWN, 1);
move(DIR.RIGHT, 4);
move(DIR.DOWN, 1);
move(DIR.RIGHT, 2);
move(DIR.DOWN, 1);
assertState(context.G.area === 2, "did not enter tower");
clearDialogue();

move(DIR.UP, 5, { allowBattle: true });
assertState(context.G.battle && context.G.battle.enemyId === "guardian", "guardian battle did not start");
assertState(el("enemy-hp-text").textContent === "HP: 26/26", "guardian initial HP text is wrong");
playerSpecial();
assertState(context.G.battle && context.G.battle.hp === 18, "guardian HP did not decrease internally after special");
assertState(el("enemy-hp-text").textContent === "HP: 18/26", "guardian HP text did not update after special");
assertState(el("enemy-hp-bar").style.width === `${18 / 26 * 100}%`, "guardian HP bar did not update after special");

let guard = 20;
while (context.G.screen !== "ending" && guard-- > 0) {
  if (!context.G.battle) break;
  if (context.G.energy >= 3) playerSpecial();
  else playerAttack();
}

assertState(context.G.screen === "ending", "ending screen was not reached");
assertState(el("btn-special").disabled, "special button should be disabled when EN is below 3");
assertState(el("ending-stats").innerHTML.includes("勇気の欠片"), "ending stats missing courage shard");
assertState(el("ending-stats").innerHTML.includes("知恵の欠片"), "ending stats missing wisdom shard");

console.log("GOAL_RPG_CLEAR_OK");
console.log(`steps=${context.G.steps} battlesWon=${context.G.battlesWon} hp=${context.G.hp} en=${context.G.energy}`);
