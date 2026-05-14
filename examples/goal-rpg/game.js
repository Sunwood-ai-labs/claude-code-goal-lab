"use strict";

/* ========================================================
   Goalbound Chronicle — game engine
   ======================================================== */

// ---- constants ----
var T = 32; // tile size in px
var COLS = 15;
var ROWS = 10;

var TILE = {
  FLOOR: 0, WALL: 1, WATER: 2,
  GRASS: 3, PATH: 4, TREE: 5,
  DOOR: 6, CHEST: 7, NPC: 8,
  STAIR: 9, CRYSTAL: 10, BOSS: 11
};

var TILE_COLOR = {};
TILE_COLOR[TILE.FLOOR]   = "#2c2c3a";
TILE_COLOR[TILE.WALL]    = "#111118";
TILE_COLOR[TILE.WATER]   = "#1a3a5c";
TILE_COLOR[TILE.GRASS]   = "#1e4a2a";
TILE_COLOR[TILE.PATH]    = "#3a3428";
TILE_COLOR[TILE.TREE]    = "#0f3318";
TILE_COLOR[TILE.DOOR]    = "#6b4226";
TILE_COLOR[TILE.CHEST]   = "#8a6e2a";
TILE_COLOR[TILE.NPC]     = "#2c2c3a";
TILE_COLOR[TILE.STAIR]   = "#3a3a50";
TILE_COLOR[TILE.CRYSTAL] = "#1a4a5c";
TILE_COLOR[TILE.BOSS]    = "#3a1a1a";

var DIR = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
var DX = [0, 0, -1, 1];
var DY = [-1, 1, 0, 0];

// ---- maps (3 areas) ----
// prettier-ignore
var MAPS = [];

// Area 0 — Village
MAPS[0] = {
  name: "始まりの村",
  nameEn: "Village",
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,3,3,4,4,4,3,3,3,4,4,4,3,1],
    [1,3,3,3,4,3,4,3,3,3,4,3,4,3,1],
    [1,3,3,3,4,3,4,4,4,4,4,3,4,3,1],
    [1,4,4,4,4,3,3,8,3,3,4,4,4,3,1],
    [1,3,3,4,3,3,3,3,3,3,3,4,3,3,1],
    [1,3,3,4,3,4,4,4,4,3,3,4,4,3,1],
    [1,3,3,3,3,4,3,7,3,3,3,3,3,3,1],
    [1,3,3,3,3,4,4,4,4,3,3,3,3,9,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  playerStart: { x: 3, y: 4 },
  npcs: [
    {
      x: 7, y: 4, id: "elder",
      name: "村の長老", symbol: "長",
      dialogue: [
        "おお、冒険者よ。よく来た。",
        "この世界は「ゴールの欠片」を失い、秩序が崩れつつある。",
        "二つの欠片を集め、水晶塔の守護者を倒せば、世界は救われる。",
        "まずはこの村の宝箱から「勇気の欠片」を受け取りなさい。"
      ],
      after: "冒険の旅、無事を祈るぞ。"
    }
  ],
  chests: [
    { x: 7, y: 7, id: "shard_courage", item: "勇気の欠片", opened: false }
  ],
  exits: [
    { x: 13, y: 8, targetMap: 1, targetX: 3, targetY: 4, label: "暗闇の森へ" }
  ]
};

// Area 1 — Dark Forest
MAPS[1] = {
  name: "暗闇の森",
  nameEn: "Dark Forest",
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,5,5,4,5,5,5,5,4,5,5,5,5,5,1],
    [1,5,5,4,5,2,2,5,4,5,5,2,5,5,1],
    [1,5,5,4,4,4,4,4,4,4,4,4,5,5,1],
    [1,5,5,4,5,5,5,5,5,5,4,5,5,5,1],
    [1,5,8,4,5,5,10,5,5,5,4,5,5,5,1],
    [1,5,5,4,4,4,4,4,4,4,4,5,5,5,1],
    [1,5,5,5,5,5,5,5,5,5,4,4,4,5,1],
    [1,5,5,5,5,5,5,5,5,5,5,5,9,5,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  playerStart: { x: 3, y: 4 },
  npcs: [
    {
      x: 2, y: 5, id: "spirit",
      name: "森の精霊", symbol: "精",
      dialogue: [
        "……旅人よ、ここは危険な場所。",
        "奥に眠る「知恵の欠片」は強力な魔物に守られている。",
        "気をつけて進むのだ。……幸運を。"
      ],
      after: "……気をつけて。"
    }
  ],
  chests: [],
  exits: [
    { x: 12, y: 8, targetMap: 2, targetX: 7, targetY: 8, label: "水晶塔へ" }
  ],
  encounters: [
    { x: 9, y: 2, enemy: "shadow_wolf" },
    { x: 4, y: 7, enemy: "dark_slime" },
    { x: 8, y: 5, enemy: "shadow_wolf" },
    { x: 11, y: 6, enemy: "dark_slime" }
  ],
  crystals: [
    { x: 6, y: 5, id: "shard_wisdom", item: "知恵の欠片", collected: false }
  ]
};

// Area 2 — Crystal Tower
MAPS[2] = {
  name: "水晶塔",
  nameEn: "Crystal Tower",
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,0,0,0,0,0,0,0,0,0,0,0,6,1],
    [1,6,0,0,0,0,0,11,0,0,0,0,0,6,1],
    [1,6,0,0,0,0,0,0,0,0,0,0,0,6,1],
    [1,6,0,0,0,0,0,0,0,0,0,0,0,6,1],
    [1,6,0,0,0,0,0,0,0,0,0,0,0,6,1],
    [1,6,0,0,0,0,0,0,0,0,0,0,0,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  playerStart: { x: 7, y: 8 },
  npcs: [],
  chests: [],
  exits: [],
  encounters: [],
  crystals: [],
  boss: { x: 7, y: 3, id: "guardian" }
};

// ---- enemies ----
var ENEMIES = {
  shadow_wolf: { name: "シャドウウルフ", hp: 15, atk: 5, def: 2, exp: "影に潜む狼。" },
  dark_slime:  { name: "ダークスライム", hp: 12, atk: 4, def: 3, exp: "闇を纏ったスライム。" },
  guardian:    { name: "塔の守護者",     hp: 26, atk: 6, def: 4, exp: "水晶塔を守る強大な魔物。" }
};

// ---- game state ----
var G = {};

function initState() {
  G = {
    screen: "title",
    area: 0,
    px: MAPS[0].playerStart.x,
    py: MAPS[0].playerStart.y,
    hp: 30, maxHp: 30,
    energy: 10, maxEnergy: 10,
    shards: [],
    dialogue: null,
    battle: null,
    defeatedEncounters: {},
    openedChests: {},
    collectedCrystals: {},
    bossDefeated: false,
    defending: false,
    steps: 0,
    battlesWon: 0
  };
}

// ---- DOM refs ----
var $ = function(id) { return document.getElementById(id); };

var elTitle    = $("title-screen");
var elGame     = $("game-screen");
var elEnding   = $("ending-screen");
var elCanvas   = $("map-canvas");
var ctx        = elCanvas.getContext("2d");
var elDialogue = $("dialogue-box");
var elSpeaker  = $("dialogue-speaker");
var elText     = $("dialogue-text");
var elBattle   = $("battle-panel");
var elEnemyName= $("enemy-name");
var elEnemyBar = $("enemy-hp-bar");
var elEnemyHpTx= $("enemy-hp-text");
var elBattleLog= $("battle-log");

// ---- screen switching ----
function showScreen(name) {
  elTitle.classList.remove("active");
  elGame.classList.remove("active");
  elEnding.classList.remove("active");
  if (name === "title")  elTitle.classList.add("active");
  if (name === "game")   elGame.classList.add("active");
  if (name === "ending") elEnding.classList.add("active");
  G.screen = name;
}

// ---- HUD ----
function updateHUD() {
  $("hp-val").textContent = G.hp;
  $("hp-max").textContent = G.maxHp;
  $("en-val").textContent = G.energy;
  $("en-max").textContent = G.maxEnergy;
  $("shard-count").textContent = G.shards.length;
  var map = MAPS[G.area];
  $("hud-area").textContent = map.nameEn;
}

// ---- rendering ----
function drawTile(x, y, type) {
  ctx.fillStyle = TILE_COLOR[type] || "#2c2c3a";
  ctx.fillRect(x * T, y * T, T, T);

  // details
  if (type === TILE.WALL) {
    ctx.fillStyle = "#1a1a22";
    ctx.fillRect(x * T + 2, y * T + 2, T - 4, T - 4);
  }
  if (type === TILE.WATER) {
    ctx.fillStyle = "#2a5a8c";
    ctx.fillRect(x * T + 4, y * T + 4, T - 8, 4);
  }
  if (type === TILE.TREE) {
    ctx.fillStyle = "#1a5a28";
    ctx.beginPath();
    ctx.moveTo(x * T + 16, y * T + 4);
    ctx.lineTo(x * T + 28, y * T + 26);
    ctx.lineTo(x * T + 4, y * T + 26);
    ctx.fill();
    ctx.fillStyle = "#4a2a1a";
    ctx.fillRect(x * T + 13, y * T + 26, 6, 6);
  }
  if (type === TILE.CHEST) {
    ctx.fillStyle = "#d4a843";
    ctx.fillRect(x * T + 8, y * T + 10, 16, 14);
    ctx.fillStyle = "#8a6e2a";
    ctx.fillRect(x * T + 8, y * T + 10, 16, 4);
    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(x * T + 14, y * T + 14, 4, 4);
  }
  if (type === TILE.NPC) {
    // body rendered separately
  }
  if (type === TILE.STAIR) {
    ctx.fillStyle = "#5a5a7a";
    for (var s = 0; s < 4; s++) {
      ctx.fillRect(x * T + 6 + s * 2, y * T + 6 + s * 5, 20 - s * 4, 4);
    }
    ctx.fillStyle = var_gold_dim();
    ctx.fillRect(x * T + 14, y * T + 24, 4, 4);
  }
  if (type === TILE.CRYSTAL) {
    ctx.fillStyle = "#4ac8e8";
    ctx.beginPath();
    ctx.moveTo(x * T + 16, y * T + 2);
    ctx.lineTo(x * T + 26, y * T + 18);
    ctx.lineTo(x * T + 16, y * T + 30);
    ctx.lineTo(x * T + 6, y * T + 18);
    ctx.fill();
    ctx.fillStyle = "#8ae8ff";
    ctx.fillRect(x * T + 14, y * T + 12, 4, 6);
  }
  if (type === TILE.BOSS) {
    ctx.fillStyle = "#5a1a1a";
    ctx.fillRect(x * T + 4, y * T + 4, 24, 24);
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x * T + 8, y * T + 8, 16, 16);
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(x * T + 12, y * T + 12, 8, 8);
  }
  if (type === TILE.DOOR) {
    ctx.fillStyle = "#4a2a1a";
    ctx.fillRect(x * T + 4, y * T + 2, 24, 28);
    ctx.fillStyle = "#d4a843";
    ctx.fillRect(x * T + 22, y * T + 14, 4, 4);
  }
}

function var_gold_dim() { return "#8a6e2a"; }

function drawNPC(npc) {
  var x = npc.x, y = npc.y;
  // body
  ctx.fillStyle = "#d4a843";
  ctx.fillRect(x * T + 10, y * T + 6, 12, 12);
  // head
  ctx.fillStyle = "#e8dcc8";
  ctx.fillRect(x * T + 12, y * T + 2, 8, 8);
  // symbol
  ctx.fillStyle = "#0d0d12";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(npc.symbol, x * T + 16, y * T + 14);
  // robe bottom
  ctx.fillStyle = "#8a6e2a";
  ctx.fillRect(x * T + 8, y * T + 18, 16, 10);
}

function drawPlayer() {
  var x = G.px, y = G.py;
  // body
  ctx.fillStyle = "#3498db";
  ctx.fillRect(x * T + 10, y * T + 6, 12, 14);
  // head
  ctx.fillStyle = "#e8dcc8";
  ctx.fillRect(x * T + 12, y * T + 1, 8, 8);
  // eyes
  ctx.fillStyle = "#0d0d12";
  ctx.fillRect(x * T + 13, y * T + 4, 2, 2);
  ctx.fillRect(x * T + 17, y * T + 4, 2, 2);
  // legs
  ctx.fillStyle = "#2a5a8c";
  ctx.fillRect(x * T + 11, y * T + 20, 4, 6);
  ctx.fillRect(x * T + 17, y * T + 20, 4, 6);
  // hair
  ctx.fillStyle = "#8a4a1a";
  ctx.fillRect(x * T + 11, y * T, 10, 3);
}

function renderMap() {
  var map = MAPS[G.area];
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);

  // tiles
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      drawTile(x, y, map.tiles[y][x]);
    }
  }

  // NPCs
  for (var i = 0; i < map.npcs.length; i++) {
    drawNPC(map.npcs[i]);
  }

  // Player
  drawPlayer();
}

// ---- collision ----
function isBlocked(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  var map = MAPS[G.area];
  var t = map.tiles[y][x];
  return t === TILE.WALL || t === TILE.WATER || t === TILE.TREE;
}

// ---- movement ----
function movePlayer(dir) {
  if (G.screen !== "game") return;
  if (G.dialogue) return;
  if (G.battle) return;

  var nx = G.px + DX[dir];
  var ny = G.py + DY[dir];
  if (isBlocked(nx, ny)) return;

  G.px = nx;
  G.py = ny;
  G.steps++;

  // check encounters
  checkEncounter(nx, ny);
  // check exit
  checkExit(nx, ny);
  // check crystals
  checkCrystal(nx, ny);
  // check boss
  checkBoss(nx, ny);

  renderMap();
  updateHUD();
}

// ---- interaction (A button) ----
function interact() {
  if (G.screen !== "game") return;
  if (G.dialogue) {
    advanceDialogue();
    return;
  }
  if (G.battle) return;

  var map = MAPS[G.area];

  // check NPCs at player pos and adjacent
  for (var i = 0; i < map.npcs.length; i++) {
    var npc = map.npcs[i];
    if (isAdjacentOrOn(G.px, G.py, npc.x, npc.y)) {
      startDialogue(npc);
      return;
    }
  }

  // check chests at player pos
  for (var j = 0; j < map.chests.length; j++) {
    var ch = map.chests[j];
    if (G.px === ch.x && G.py === ch.y && !G.openedChests[ch.id]) {
      openChest(ch);
      return;
    }
  }

  // generic: check tile
  var tile = map.tiles[G.py][G.px];
  if (tile === TILE.STAIR) {
    checkExit(G.px, G.py);
  }
}

function isAdjacentOrOn(px, py, tx, ty) {
  return (Math.abs(px - tx) <= 1 && py === ty) ||
         (px === tx && Math.abs(py - ty) <= 1);
}

// ---- dialogue ----
function startDialogue(npc) {
  var hasTalked = G["talked_" + npc.id];
  var lines = hasTalked ? [npc.after] : npc.dialogue.slice();
  G["talked_" + npc.id] = true;
  G.dialogue = { speaker: npc.name, lines: lines, idx: 0 };
  showDialogueLine();
}

function showDialogueLine() {
  var d = G.dialogue;
  elSpeaker.textContent = d.speaker;
  elText.textContent = d.lines[d.idx];
  elDialogue.classList.remove("hidden");
}

function advanceDialogue() {
  var d = G.dialogue;
  d.idx++;
  if (d.idx >= d.lines.length) {
    G.dialogue = null;
    elDialogue.classList.add("hidden");
    renderMap();
    return;
  }
  showDialogueLine();
}

// ---- chests ----
function openChest(ch) {
  G.openedChests[ch.id] = true;
  G.shards.push(ch.item);
  G.dialogue = {
    speaker: "宝箱",
    lines: ["「" + ch.item + "」を手に入れた！"],
    idx: 0
  };
  // change tile to opened chest (floor)
  MAPS[G.area].tiles[ch.y][ch.x] = TILE.FLOOR;
  showDialogueLine();
  updateHUD();
  renderMap();
}

// ---- crystals ----
function checkCrystal(px, py) {
  var map = MAPS[G.area];
  if (!map.crystals) return;
  for (var i = 0; i < map.crystals.length; i++) {
    var cr = map.crystals[i];
    if (px === cr.x && py === cr.y && !G.collectedCrystals[cr.id]) {
      G.collectedCrystals[cr.id] = true;
      G.shards.push(cr.item);
      G.hp = G.maxHp;
      G.energy = G.maxEnergy;
      map.tiles[cr.y][cr.x] = TILE.FLOOR;
      G.dialogue = {
        speaker: "クリスタル",
        lines: [
          "「" + cr.item + "」が輝きを放ち、手の中に収まった！",
          "欠片の力が勇者の魂に溶け込んでいく……。",
          "HPとENが全回復した！"
        ],
        idx: 0
      };
      showDialogueLine();
      updateHUD();
      renderMap();
      return;
    }
  }
}

// ---- exits ----
function checkExit(px, py) {
  var map = MAPS[G.area];
  if (!map.exits) return;
  for (var i = 0; i < map.exits.length; i++) {
    var ex = map.exits[i];
    if (px === ex.x && py === ex.y) {
      G.area = ex.targetMap;
      G.px = ex.targetX;
      G.py = ex.targetY;
      renderMap();
      updateHUD();
      // area transition message
      var newMap = MAPS[G.area];
      var transitionLines = [ex.label + "\n「" + newMap.name + "」に到着した。"];
      if (G.area === 2 && G.shards.length >= 2) {
        G.hp = G.maxHp;
        G.energy = G.maxEnergy;
        updateHUD();
        transitionLines.push("二つの欠片が呼応し、HPとENが全回復した。");
      }
      G.dialogue = {
        speaker: "……",
        lines: transitionLines,
        idx: 0
      };
      showDialogueLine();
      return;
    }
  }
}

// ---- encounters / battles ----
function checkEncounter(px, py) {
  var map = MAPS[G.area];
  if (!map.encounters) return;
  for (var i = 0; i < map.encounters.length; i++) {
    var enc = map.encounters[i];
    var key = G.area + "_" + i;
    if (px === enc.x && py === enc.y && !G.defeatedEncounters[key]) {
      startBattle(enc.enemy, key);
      return;
    }
  }
}

function startBattle(enemyId, encounterKey) {
  var template = ENEMIES[enemyId];
  G.battle = {
    enemyId: enemyId,
    encounterKey: encounterKey,
    name: template.name,
    hp: template.hp,
    maxHp: template.hp,
    atk: template.atk,
    def: template.def,
    playerTurn: true
  };
  G.defending = false;
  elBattle.classList.remove("hidden");
  $("map-viewport").classList.add("hidden");
  updateBattleUI();
  elBattleLog.textContent = template.exp;
}

function updateBattleUI() {
  var b = G.battle;
  elEnemyName.textContent = b.name;
  var pct = Math.max(0, b.hp / b.maxHp * 100);
  elEnemyBar.style.width = pct + "%";
  elEnemyHpTx.textContent = "HP: " + b.hp + "/" + b.maxHp;
  setBattleButtons(true);
  elBattleLog.textContent = elBattleLog.textContent || "どうする？";
}

function setBattleButtons(enabled) {
  $("btn-attack").disabled = !enabled;
  $("btn-defend").disabled = !enabled;
  $("btn-special").disabled = !enabled;
  $("btn-flee").disabled = !enabled;
}

// player actions
function playerAttack() {
  if (!G.battle || !G.battle.playerTurn) return;
  var b = G.battle;
  G.defending = false;
  var dmg = Math.max(1, 6 - b.def + Math.floor(Math.random() * 3));
  b.hp -= dmg;
  elBattleLog.textContent = "冒険者の攻撃！ " + dmg + " のダメージ！";
  setBattleButtons(false);
  if (b.hp <= 0) {
    setTimeout(endBattleVictory, 600);
    return;
  }
  b.playerTurn = false;
  setTimeout(enemyTurn, 800);
}

function playerDefend() {
  if (!G.battle || !G.battle.playerTurn) return;
  G.defending = true;
  elBattleLog.textContent = "冒険者は身を守っている！";
  setBattleButtons(false);
  G.battle.playerTurn = false;
  setTimeout(enemyTurn, 800);
}

function playerSpecial() {
  if (!G.battle || !G.battle.playerTurn) return;
  if (G.energy < 3) {
    elBattleLog.textContent = "エネルギー不足！（EN 3必要）";
    return;
  }
  G.energy -= 3;
  G.defending = false;
  var dmg = Math.max(1, 12 - G.battle.def + Math.floor(Math.random() * 4));
  G.battle.hp -= dmg;
  elBattleLog.textContent = "✨ とくぎ発動！ " + dmg + " のダメージ！";
  setBattleButtons(false);
  updateHUD();
  if (G.battle.hp <= 0) {
    setTimeout(endBattleVictory, 600);
    return;
  }
  G.battle.playerTurn = false;
  setTimeout(enemyTurn, 800);
}

function playerFlee() {
  if (!G.battle || !G.battle.playerTurn) return;
  if (G.battle.enemyId === "guardian") {
    elBattleLog.textContent = "守護者からは逃げられない！";
    return;
  }
  var fled = Math.random() > 0.4;
  if (fled) {
    elBattleLog.textContent = "逃げ出した！";
    setTimeout(endBattleFlee, 600);
  } else {
    elBattleLog.textContent = "逃げられなかった！";
    setBattleButtons(false);
    G.battle.playerTurn = false;
    setTimeout(enemyTurn, 800);
  }
}

function enemyTurn() {
  var b = G.battle;
  var dmg = Math.max(1, b.atk - (G.defending ? 4 : 0) + Math.floor(Math.random() * 2));
  G.hp -= dmg;
  if (G.hp < 0) G.hp = 0;
  elBattleLog.textContent = b.name + "の攻撃！ " + dmg + " のダメージ！";
  updateHUD();

  if (G.hp <= 0) {
    setTimeout(endBattleDefeat, 600);
    return;
  }

  b.playerTurn = true;
  G.defending = false;
  setTimeout(function() {
    setBattleButtons(true);
    elBattleLog.textContent = elBattleLog.textContent + " どうする？";
  }, 500);
}

function endBattleVictory() {
  var b = G.battle;
  G.defeatedEncounters[b.encounterKey] = true;
  G.battlesWon++;
  // restore some energy
  if (G.energy < G.maxEnergy) {
    G.energy = Math.min(G.maxEnergy, G.energy + 2);
  }
  G.battle = null;
  elBattle.classList.add("hidden");
  $("map-viewport").classList.remove("hidden");
  updateHUD();
  renderMap();

  if (b.enemyId === "guardian") {
    G.bossDefeated = true;
    setTimeout(showEnding, 800);
  } else {
    G.dialogue = {
      speaker: "勝利！",
      lines: [b.name + "を倒した！"],
      idx: 0
    };
    showDialogueLine();
  }
}

function endBattleFlee() {
  G.battle = null;
  elBattle.classList.add("hidden");
  $("map-viewport").classList.remove("hidden");
  // move player back one step
  G.py = Math.min(ROWS - 2, G.py + 1);
  renderMap();
  updateHUD();
}

function endBattleDefeat() {
  G.battle = null;
  elBattle.classList.add("hidden");
  $("map-viewport").classList.remove("hidden");
  // revive with low HP at start of area
  G.hp = Math.floor(G.maxHp * 0.3);
  G.energy = Math.min(G.maxEnergy, G.energy + 3);
  var start = MAPS[G.area].playerStart;
  G.px = start.x;
  G.py = start.y;
  updateHUD();
  renderMap();
  G.dialogue = {
    speaker: "……",
    lines: [
      "気を失った……。",
      "ふたたび立ち上がった。HPが少し回復した。"
    ],
    idx: 0
  };
  showDialogueLine();
}

// ---- boss ----
function checkBoss(px, py) {
  var map = MAPS[G.area];
  if (!map.boss) return;
  if (G.bossDefeated) return;
  if (px === map.boss.x && py === map.boss.y) {
    if (G.shards.length < 2) {
      G.dialogue = {
        speaker: "守護者の結界",
        lines: [
          "二つの欠片がないと、守護者に挑めない。",
          "（欠片: " + G.shards.length + "/2）"
        ],
        idx: 0
      };
      showDialogueLine();
      // push player back
      G.py = map.boss.y + 1;
      renderMap();
      return;
    }
    startBattle("guardian", "boss_" + G.area);
  }
}

// ---- ending ----
function showEnding() {
  showScreen("ending");
  $("ending-stats").innerHTML =
    "歩数: " + G.steps + "<br>" +
    "勝利数: " + G.battlesWon + "<br>" +
    "回収した欠片: " + G.shards.join("、");
}

// ---- keyboard input ----
document.addEventListener("keydown", function(e) {
  var key = e.key;
  if (G.dialogue) {
    if (key === "Enter" || key === " " || key === "z" || key === "Z") {
      advanceDialogue();
      e.preventDefault();
    }
    return;
  }
  if (G.battle) {
    if (key === "1") playerAttack();
    else if (key === "2") playerDefend();
    else if (key === "3") playerSpecial();
    else if (key === "4") playerFlee();
    return;
  }

  if (key === "ArrowUp"    || key === "w" || key === "W") { movePlayer(DIR.UP);    e.preventDefault(); }
  if (key === "ArrowDown"  || key === "s" || key === "S") { movePlayer(DIR.DOWN);  e.preventDefault(); }
  if (key === "ArrowLeft"  || key === "a" || key === "A") { movePlayer(DIR.LEFT);  e.preventDefault(); }
  if (key === "ArrowRight" || key === "d" || key === "D") { movePlayer(DIR.RIGHT); e.preventDefault(); }
  if (key === "z" || key === "Z" || key === "Enter" || key === " ") { interact(); e.preventDefault(); }
});

// ---- button input ----
$("btn-start").addEventListener("click", function() {
  initState();
  showScreen("game");
  renderMap();
  updateHUD();
});

$("btn-restart").addEventListener("click", function() {
  initState();
  // reset map tiles
  MAPS[0].tiles[7][7] = TILE.CHEST;
  MAPS[1].tiles[5][6] = TILE.CRYSTAL;
  showScreen("game");
  renderMap();
  updateHUD();
});

$("btn-up").addEventListener("click",      function() { movePlayer(DIR.UP); });
$("btn-down").addEventListener("click",    function() { movePlayer(DIR.DOWN); });
$("btn-left").addEventListener("click",    function() { movePlayer(DIR.LEFT); });
$("btn-right").addEventListener("click",   function() { movePlayer(DIR.RIGHT); });
$("btn-action").addEventListener("click",  function() { interact(); });

$("btn-dialogue-next").addEventListener("click", function() {
  if (G.dialogue) advanceDialogue();
});

$("btn-attack").addEventListener("click",  playerAttack);
$("btn-defend").addEventListener("click",  playerDefend);
$("btn-special").addEventListener("click", playerSpecial);
$("btn-flee").addEventListener("click",    playerFlee);

// ---- init ----
initState();
showScreen("title");
