// =============================================
// Keystroke Arcade — Game Layer
// Drives the shared practice.js engine against LEVELS/WORLDS data.
// =============================================

const PROGRESS_KEY = 'nvimguide.game.progress.v1';

// --- Monkey-patch the engine's late-bound hooks ---
checkGoal = checkLevelGoal;
updateStatusLine = updateGameStatusLine;

// --- Game-only state (separate from practice.js's currentExercise) ---
let currentLevel = 0;
let levelCleared = false;
let progress = null;
let expandedWorldId; // undefined = not yet auto-picked

// =============================================
// PROGRESS PERSISTENCE
// =============================================
function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { version: 1, levels: {}, lastPlayed: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { version: 1, levels: {}, lastPlayed: null };
    return {
      version: 1,
      levels: (parsed.levels && typeof parsed.levels === 'object') ? parsed.levels : {},
      lastPlayed: parsed.lastPlayed || null
    };
  } catch (e) {
    return { version: 1, levels: {}, lastPlayed: null };
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch (e) {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

function recordLevelResult(id, stars, keyCount) {
  const prev = progress.levels[id];
  if (!prev) {
    progress.levels[id] = { stars: stars, bestKeyCount: keyCount, completed: true };
  } else {
    const better = stars > prev.stars || (stars === prev.stars && keyCount < prev.bestKeyCount);
    progress.levels[id] = {
      stars: better ? stars : prev.stars,
      bestKeyCount: better ? keyCount : prev.bestKeyCount,
      completed: true
    };
  }
  progress.lastPlayed = id;
  saveProgress(progress);
}

function isLevelUnlocked(level) {
  if (level.unlock === null) return true;
  const req = progress.levels[level.unlock];
  return !!(req && req.completed);
}

function getLevelProgress(id) {
  return (progress.levels && progress.levels[id]) || null;
}

// =============================================
// GOAL CHECKING / STATUS LINE — engine hooks
// =============================================
function checkLevelGoal() {
  const lvl = LEVELS[currentLevel];
  if (levelCleared || !lvl.check(state)) return;
  levelCleared = true;

  const par = lvl.par;
  let stars;
  if (state.keyCount <= par) stars = 3;
  else if (state.keyCount <= Math.ceil(par * 1.5)) stars = 2;
  else stars = 1;

  recordLevelResult(lvl.id, stars, state.keyCount);
  showLevelClearedCard(stars, state.keyCount, par);
}

function updateGameStatusLine() {
  const sl = document.getElementById('statusline');
  const modeName = {
    normal: 'NORMAL', insert: 'INSERT', visual: 'VISUAL',
    vline: 'V-LINE', vblock: 'V-BLOCK', command: 'COMMAND',
    search: 'SEARCH', replace: 'REPLACE'
  }[state.mode] || 'NORMAL';
  const modeClass = {
    insert: 'insert-mode', visual: 'visual-mode', vline: 'visual-mode',
    command: 'command-mode', search: 'command-mode', replace: 'replace-mode'
  }[state.mode] || '';

  if (sl) sl.className = modeClass;
  const modeEl = document.getElementById('status-mode');
  if (modeEl) modeEl.textContent = state.recording ? `RECORDING @${state.recording}` : modeName;
  const posEl = document.getElementById('status-pos');
  if (posEl) posEl.textContent = `${state.cursor.row + 1}:${state.cursor.col + 1}  ${LEVELS[currentLevel].filename}`;

  updateHud();
}

// Live keystroke/par/star readout — the HUD's signature scoring element
function updateHud() {
  const lvl = LEVELS[currentLevel];
  const keys = state.keyCount;
  const par = lvl.par;

  let tier, starsFilled;
  if (keys <= par) { tier = 'tier-gold'; starsFilled = 3; }
  else if (keys <= Math.ceil(par * 1.5)) { tier = 'tier-silver'; starsFilled = 2; }
  else { tier = 'tier-bronze'; starsFilled = 1; }

  const keysEl = document.getElementById('hud-keys');
  const parEl = document.getElementById('hud-par');
  const starsEl = document.getElementById('hud-stars');
  if (keysEl) { keysEl.textContent = keys; keysEl.className = tier; }
  if (parEl) parEl.textContent = par;
  if (starsEl) {
    starsEl.textContent = '★'.repeat(starsFilled) + '☆'.repeat(3 - starsFilled);
    starsEl.className = tier;
  }
}

// =============================================
// SUCCESS CARD (extends #success-flash)
// =============================================
function showLevelClearedCard(stars, keyCount, par) {
  const el = document.getElementById('success-flash');
  if (!el) return;
  const tierClass = stars === 3 ? 'tier-gold' : stars === 2 ? 'tier-silver' : 'tier-bronze';
  const starGlyphs = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  const hasNext = currentLevel < LEVELS.length - 1;

  el.className = `success-flash show arcade-clear ${tierClass}`;
  el.innerHTML =
    `<div class="clear-title">LEVEL CLEARED</div>` +
    `<div class="clear-stars">${starGlyphs}</div>` +
    `<div class="clear-stats">${keyCount} keystrokes &middot; par ${par}</div>` +
    `<div class="clear-actions">` +
      `<button class="btn btn-secondary" onclick="retryLevel()">Retry</button>` +
      (hasNext
        ? `<button class="btn btn-primary" onclick="goNextLevel()">Next Level →</button>`
        : `<button class="btn btn-primary" onclick="showMapView()">Back to Map →</button>`) +
    `</div>`;
}

function clearSuccessCard() {
  const el = document.getElementById('success-flash');
  if (!el) return;
  el.className = 'success-flash';
  el.innerHTML = '';
}

function retryLevel() { resetLevel(); }
function goNextLevel() {
  const next = LEVELS[currentLevel + 1];
  if (next && isLevelUnlocked(next)) loadLevel(currentLevel + 1);
}

// =============================================
// LEVEL LOAD / RESET / HINT
// =============================================
function worldAccent(worldId) {
  if (worldId === 'motion-mines') return 'var(--green)';
  if (worldId === 'operator-outpost') return 'var(--world-cyan)';
  if (worldId === 'text-object-temple') return 'var(--yellow)';
  return 'var(--accent)';
}

function worldGlyph(worldId) {
  if (worldId === 'motion-mines') return 'hjkl';
  if (worldId === 'operator-outpost') return 'd2w';
  if (worldId === 'text-object-temple') return 'i(';
  return '?';
}

function loadLevel(idx) {
  currentLevel = idx;
  levelCleared = false;
  const lvl = LEVELS[idx];
  state = freshState(lvl);

  // Hidden insurance elements practice.js's own boot writes to unconditionally.
  const filenameEl = document.getElementById('editor-filename');
  if (filenameEl) filenameEl.textContent = lvl.filename;
  const instrEl = document.getElementById('task-instruction');
  if (instrEl) instrEl.innerHTML = `<span class="goal-label">Goal:</span> ${lvl.goal}`;

  // HUD identity
  const world = WORLDS.find(w => w.id === lvl.world);
  const dotEl = document.getElementById('hud-world-dot');
  if (dotEl) dotEl.style.background = worldAccent(lvl.world);
  const wlEl = document.getElementById('hud-worldlevel');
  if (wlEl) wlEl.textContent = `${world ? world.name.toUpperCase() : lvl.world.toUpperCase()} · LVL ${String(lvl.worldOrder).padStart(2, '0')}`;

  // Flavor text on start, crossfades to the level title after 2.5s (per design spec 3.3)
  const titleEl = document.getElementById('hud-title');
  if (titleEl) {
    clearTimeout(titleEl._flavorTimer);
    titleEl.style.transition = 'none';
    titleEl.style.opacity = '1';
    if (lvl.flavor) {
      titleEl.textContent = lvl.flavor;
      titleEl._flavorTimer = setTimeout(() => {
        titleEl.style.transition = 'opacity 0.3s';
        titleEl.style.opacity = '0';
        setTimeout(() => {
          titleEl.textContent = `"${lvl.title}"`;
          titleEl.style.opacity = '1';
        }, 300);
      }, 2500);
    } else {
      titleEl.textContent = `"${lvl.title}"`;
    }
  }

  const parEl = document.getElementById('hud-par');
  if (parEl) parEl.textContent = lvl.par;
  updateHud();

  const hintEl = document.getElementById('hud-hint');
  if (hintEl) { hintEl.style.display = 'none'; hintEl.innerHTML = ''; }

  clearSuccessCard();

  showPlayView();
  render();
  document.getElementById('vim-editor').focus();
}

function resetLevel() {
  loadLevel(currentLevel);
}

function showLevelHint() {
  const lvl = LEVELS[currentLevel];
  const hintEl = document.getElementById('hud-hint');
  if (!hintEl) return;
  const isOpen = hintEl.style.display !== 'none' && hintEl.innerHTML !== '';
  if (isOpen) {
    hintEl.style.display = 'none';
    hintEl.innerHTML = '';
  } else {
    hintEl.innerHTML = `<span class="hint-label">Hint:</span> ${lvl.hint}`;
    hintEl.style.display = 'block';
  }
}

// =============================================
// VIEW SWITCHING
// =============================================
function showMapView() {
  renderWorldMap();
  document.getElementById('view-map').style.display = '';
  document.getElementById('view-play').style.display = 'none';
}

function showPlayView() {
  document.getElementById('view-map').style.display = 'none';
  document.getElementById('view-play').style.display = 'flex';
}

// =============================================
// WORLD MAP RENDERING
// =============================================
function worldLevels(worldId) {
  return LEVELS.filter(l => l.world === worldId).sort((a, b) => a.worldOrder - b.worldOrder);
}

function computeWorldStats(worldId) {
  const levels = worldLevels(worldId);
  let earned = 0;
  let started = false;
  levels.forEach(l => {
    const p = getLevelProgress(l.id);
    if (p) { earned += p.stars; started = true; }
  });
  const boss = levels[levels.length - 1];
  const bossProgress = getLevelProgress(boss.id);
  return {
    levels,
    earned,
    max: levels.length * 3,
    unlocked: isLevelUnlocked(levels[0]),
    started,
    boss,
    cleared: !!(bossProgress && bossProgress.completed)
  };
}

function pickAutoExpandWorld() {
  const sorted = WORLDS.slice().sort((a, b) => a.order - b.order);
  const entries = sorted.map(w => ({ w, stats: computeWorldStats(w.id) }));
  let hit = entries.find(({ stats }) => stats.earned > 0 && stats.earned < stats.max);
  if (!hit) hit = entries.find(({ stats }) => stats.unlocked && !stats.started);
  if (!hit) hit = entries[0];
  return hit ? hit.w.id : null;
}

function pickNextLevel() {
  return LEVELS.find(l => {
    const p = getLevelProgress(l.id);
    return isLevelUnlocked(l) && !(p && p.completed);
  }) || null;
}

function buildNode(level, displayIndex, nextLevel) {
  const wrap = document.createElement('div');
  wrap.className = 'arcade-node-wrap';

  const p = getLevelProgress(level.id);
  const unlocked = isLevelUnlocked(level);
  const stars = p ? p.stars : 0;
  const isNext = !!(nextLevel && nextLevel.id === level.id);
  const levelIdx = LEVELS.indexOf(level);

  const circle = document.createElement('div');
  circle.className = 'arcade-node' + (unlocked ? '' : ' locked') + (isNext ? ' node-next' : '');
  if (unlocked) {
    circle.textContent = String(displayIndex).padStart(2, '0');
    circle.style.cursor = 'pointer';
    circle.onclick = () => loadLevel(levelIdx);
  } else {
    circle.style.cursor = 'not-allowed';
  }
  wrap.appendChild(circle);

  const pips = document.createElement('div');
  pips.className = 'arcade-pips';
  if (!unlocked) {
    pips.innerHTML = '<span class="pip-locked">⌀</span>';
  } else {
    const tierColor = stars === 3 ? 'var(--tier-gold)' : stars === 2 ? 'var(--tier-silver)' : stars === 1 ? 'var(--tier-bronze)' : 'var(--fg3)';
    let html = '';
    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      html += `<span style="color:${filled ? tierColor : 'var(--fg3)'}">${filled ? '★' : '☆'}</span>`;
    }
    pips.innerHTML = html;
  }
  wrap.appendChild(pips);

  if (isNext) {
    const cap = document.createElement('div');
    cap.className = 'arcade-next-caption';
    cap.textContent = 'next';
    wrap.appendChild(cap);
  }

  return wrap;
}

function buildBossNode(level) {
  const wrap = document.createElement('div');
  wrap.className = 'arcade-boss-wrap';

  const unlocked = isLevelUnlocked(level);
  const p = getLevelProgress(level.id);
  const cleared = !!(p && p.completed);
  const levelIdx = LEVELS.indexOf(level);

  const diamond = document.createElement('div');
  diamond.className = 'arcade-boss' + (!unlocked ? ' locked' : cleared ? ' cleared' : ' uncleared');
  if (unlocked) {
    diamond.style.cursor = 'pointer';
    diamond.onclick = () => loadLevel(levelIdx);
  } else {
    diamond.style.cursor = 'not-allowed';
  }
  wrap.appendChild(diamond);

  const cap = document.createElement('div');
  cap.className = 'arcade-boss-caption';
  cap.textContent = 'BOSS';
  cap.style.color = !unlocked ? 'var(--fg3)' : cleared ? 'var(--fg3)' : 'var(--red)';
  wrap.appendChild(cap);

  return wrap;
}

function renderWorldMap() {
  if (expandedWorldId === undefined) expandedWorldId = pickAutoExpandWorld();
  const nextLevel = pickNextLevel();

  const container = document.getElementById('world-list');
  if (!container) return;
  container.innerHTML = '';

  const sortedWorlds = WORLDS.slice().sort((a, b) => a.order - b.order);

  sortedWorlds.forEach((world, wIdx) => {
    const stats = computeWorldStats(world.id);
    const isExpanded = expandedWorldId === world.id;

    const rowEl = document.createElement('div');
    rowEl.className = 'arcade-world' + (stats.unlocked ? '' : ' locked');

    const accent = worldAccent(world.id);
    const glyph = worldGlyph(world.id);

    const header = document.createElement('div');
    header.className = 'arcade-world-header';
    const glyphStyle = stats.unlocked
      ? 'color:var(--orange);background:var(--bg4);'
      : 'color:var(--fg3);background:var(--bg2);';
    const titleColor = stats.unlocked ? accent : 'var(--fg3)';
    header.innerHTML =
      `<span class="arcade-world-glyph" style="${glyphStyle}"><kbd>${glyph}</kbd></span>` +
      `<span class="arcade-world-title" style="color:${titleColor}">WORLD ${String(world.order).padStart(2, '0')} · ${world.name.toUpperCase()}` +
      (stats.cleared ? `<span class="world-cleared-check">✓</span>` : '') +
      `</span>` +
      `<span class="arcade-world-stats">${stats.unlocked ? `★${stats.earned}/${stats.max}` : 'locked'}</span>` +
      `<span class="arcade-world-chevron">${isExpanded ? '▾' : '▸'}</span>`;

    if (stats.unlocked) {
      header.style.cursor = 'pointer';
      header.onclick = () => {
        expandedWorldId = isExpanded ? null : world.id;
        renderWorldMap();
      };
    } else {
      header.style.cursor = 'not-allowed';
    }
    rowEl.appendChild(header);

    if (!stats.unlocked) {
      const prevWorld = sortedWorlds[wIdx - 1];
      const caption = document.createElement('div');
      caption.className = 'arcade-world-caption';
      caption.textContent = prevWorld ? `Clear the ${prevWorld.name} boss to unlock` : 'Locked';
      rowEl.appendChild(caption);
    } else if (isExpanded) {
      const rail = document.createElement('div');
      rail.className = 'arcade-rail';
      const regularLevels = stats.levels.slice(0, -1);

      regularLevels.forEach((lvl, i) => {
        rail.appendChild(buildNode(lvl, i + 1, nextLevel));
        const p = getLevelProgress(lvl.id);
        const earned = !!(p && p.stars >= 1);
        const conn = document.createElement('div');
        conn.className = 'arcade-connector' + (earned ? ' earned' : '');
        rail.appendChild(conn);
      });

      rail.appendChild(buildBossNode(stats.boss));
      rowEl.appendChild(rail);
    }

    container.appendChild(rowEl);
  });
}

// =============================================
// BOOT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  progress = loadProgress();
  showMapView();
});
