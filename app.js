/* =====================================================================
   Netbird Academy — Game Engine
   Game types: bins (drag-to-category), order (sequence builder),
               match (pair matching), quiz (MCQ with optional context)
   ===================================================================== */

const STORE_KEY = 'netbird-academy-v1';
const XP_PER_ITEM = 10;
const PERFECT_BONUS = 20;

let state = loadState();
let session = null; // { level, stageIdx, firstTry, total, replay }

const appEl = document.getElementById('app');
const topbarEl = document.getElementById('topbar');

/* ---------------- persistence ---------------- */
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s.xp === 'number' && Array.isArray(s.completed)) return s;
  } catch (e) { /* corrupted store — start fresh */ }
  return { xp: 0, completed: [], stars: {} };
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

/* ---------------- helpers ---------------- */
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function currentRank() {
  let r = RANKS[0];
  for (const rank of RANKS) if (state.xp >= rank.xp) r = rank;
  return r;
}
function nextRank() {
  return RANKS.find(r => r.xp > state.xp) || null;
}
function addXP(n) {
  if (session && session.replay) return;
  state.xp += n;
  saveState();
  renderTopbar();
  floatXP(n);
}
function floatXP(n) {
  const f = el('div', 'xp-float', `+${n} XP`);
  topbarEl.appendChild(f);
  setTimeout(() => f.remove(), 1200);
}
function shake(node) {
  node.classList.remove('shake');
  void node.offsetWidth; // restart animation
  node.classList.add('shake');
}

/* ---------------- topbar ---------------- */
function renderTopbar() {
  const rank = currentRank();
  const next = nextRank();
  const pct = next
    ? Math.min(100, Math.round(((state.xp - rank.xp) / (next.xp - rank.xp)) * 100))
    : 100;
  topbarEl.innerHTML = `
    <div class="brand" id="brand">🕸️ <b>Netbird&nbsp;Academy</b></div>
    <div class="rankbox">
      <span class="rank">${rank.icon} ${rank.name}</span>
      <div class="xpbar"><div class="xpfill" style="width:${pct}%"></div></div>
      <span class="xptext">${state.xp} XP${next ? ` · ${next.xp - state.xp} to ${next.icon}` : ' · MAX RANK 👑'}</span>
    </div>`;
  topbarEl.querySelector('#brand').onclick = showHome;
}

/* ---------- visuals ---------- */
function diagramFor(id, hero) {
  const v = (typeof VISUALS !== 'undefined') && VISUALS[id];
  if (!v) return null;
  const d = el('div', 'diagram' + (hero ? ' hero' : ''));
  d.innerHTML = `<div class="dg-title">📊 ${v.t}</div>${v.html}`;
  return d;
}

/* ---------- track helpers ---------- */
function trackOf(level) {
  return TRACKS.find(t => t.levels.includes(level));
}
function trackProgress(track) {
  const done = track.levels.filter(l => state.completed.includes(l.id)).length;
  return { done, total: track.levels.length, complete: done === track.levels.length };
}

/* ============================================================
   HOME — track selector
   ============================================================ */
function showHome() {
  session = null;
  renderTopbar();
  appEl.innerHTML = '';

  const hero = el('section', 'hero', `
    <h1>Learn networking by <span class="glow">playing</span></h1>
    <p>Pick a track — universal fundamentals, or how it all works in your own repos.</p>`);
  appEl.appendChild(hero);

  const map = el('section', 'trackmap');
  TRACKS.forEach(track => {
    const p = trackProgress(track);
    const pct = Math.round((p.done / p.total) * 100);
    const card = el('div', 'trackcard' + (p.complete ? ' done' : ''));
    card.innerHTML = `
      <div class="tk-icon">${track.icon}</div>
      <div class="tk-name">${track.name}</div>
      <div class="tk-blurb">${track.blurb}</div>
      <div class="tk-bar"><div class="tk-fill" style="width:${pct}%"></div></div>
      <div class="tk-prog">${p.done}/${p.total} levels${p.complete ? ' · ✅ complete' : ''}</div>
      <div class="tk-go">${p.done ? 'Continue →' : 'Start →'}</div>`;
    card.onclick = () => showTrack(track);
    map.appendChild(card);
  });
  appEl.appendChild(map);

  const foot = el('div', 'home-foot');
  const reset = el('button', 'btn ghost small', '↺ Reset all progress');
  reset.onclick = () => {
    if (confirm('Wipe all XP, badges and progress across both tracks?')) {
      state = { xp: 0, completed: [], stars: {} };
      saveState();
      showHome();
    }
  };
  foot.appendChild(reset);
  appEl.appendChild(foot);
}

/* ============================================================
   TRACK — level map for one track
   ============================================================ */
function showTrack(track) {
  session = null;
  appEl.innerHTML = '';
  window.scrollTo(0, 0);

  const head = el('section', 'track-head');
  const back = el('button', 'btn ghost small', '← All tracks');
  back.onclick = showHome;
  head.appendChild(back);
  head.appendChild(el('h2', 'track-title', `${track.icon} ${track.name}`));
  appEl.appendChild(head);

  const levels = track.levels;
  const map = el('section', 'levelmap');
  levels.forEach((lvl, i) => {
    const done = state.completed.includes(lvl.id);
    const unlocked = i === 0 || state.completed.includes(levels[i - 1].id);
    const stars = state.stars[lvl.id] || 0;
    const card = el('div', 'levelcard' + (done ? ' done' : '') + (unlocked ? '' : ' locked'));
    card.innerHTML = `
      <div class="lv-num">${unlocked ? `LEVEL ${i + 1}` : '🔒 LOCKED'}</div>
      <div class="lv-icon">${lvl.icon}</div>
      <div class="lv-title">${lvl.title}</div>
      <div class="lv-stars">${done ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : unlocked ? '▶ Play' : 'Finish previous level'}</div>
      ${done ? `<div class="lv-badge">🏅 ${lvl.badge}</div>` : ''}`;
    if (unlocked) card.onclick = () => showIntro(lvl);
    map.appendChild(card);
  });
  appEl.appendChild(map);

  if (trackProgress(track).complete) {
    const cert = el('div', 'certbtn-wrap');
    const btn = el('button', 'btn big gold', `🏆 View your ${track.certTitle} certificate`);
    btn.onclick = () => showCertificate(track);
    cert.appendChild(btn);
    appEl.appendChild(cert);
  }
}

/* ============================================================
   LEVEL INTRO — lesson cards
   ============================================================ */
function showIntro(level) {
  appEl.innerHTML = '';
  const track = trackOf(level);
  const idx = track.levels.indexOf(level);
  const wrap = el('section', 'panel');
  wrap.appendChild(el('div', 'crumb', `${track.icon} ${track.name} — Level ${idx + 1} of ${track.levels.length}`));
  wrap.appendChild(el('h2', 'level-h', `${level.icon} ${level.title}`));

  const hero = diagramFor(level.id, true);
  if (hero) wrap.appendChild(hero);

  level.lesson.forEach(html => wrap.appendChild(el('div', 'lesson-card', html)));

  const bonusCount = level.stages.filter(s => s.bonus).length;
  if (bonusCount) wrap.appendChild(el('p', 'bonus-note',
    `🎁 Includes ${bonusCount} bonus "Good to Know" round${bonusCount > 1 ? 's' : ''} for extra XP.`));

  const replay = state.completed.includes(level.id);
  if (replay) wrap.appendChild(el('p', 'replay-note', '🔁 Replay — already completed, no extra XP (but stars can improve!)'));

  const row = el('div', 'btnrow');
  const back = el('button', 'btn ghost', '← Level map');
  back.onclick = () => showTrack(track);
  const start = el('button', 'btn big', `🎮 Start (${level.stages.length} challenge${level.stages.length > 1 ? 's' : ''})`);
  start.onclick = () => {
    session = { level, stageIdx: 0, firstTry: 0, total: 0, replay };
    runStage();
  };
  row.append(back, start);
  wrap.appendChild(row);
  appEl.appendChild(wrap);
  window.scrollTo(0, 0);
}

/* ============================================================
   STAGE RUNNER
   ============================================================ */
function runStage() {
  const { level, stageIdx } = session;
  const stage = level.stages[stageIdx];
  appEl.innerHTML = '';
  window.scrollTo(0, 0);

  const wrap = el('section', 'panel' + (stage.bonus ? ' bonus-panel' : ''));
  wrap.appendChild(el('div', 'crumb',
    `${level.icon} ${level.title} — challenge ${stageIdx + 1}/${level.stages.length}`));
  if (stage.bonus) wrap.appendChild(el('div', 'bonus-banner', '🎁 BONUS ROUND — Good to Know'));
  wrap.appendChild(el('h2', 'stage-h', stage.title));
  if (stage.instructions) wrap.appendChild(el('p', 'instructions', stage.instructions));

  const dia = diagramFor(level.id, false);
  if (dia) {
    const tog = el('button', 'dg-toggle', '📊 Show concept diagram');
    dia.style.display = 'none';
    tog.onclick = () => {
      const show = dia.style.display === 'none';
      dia.style.display = show ? '' : 'none';
      tog.textContent = show ? '📊 Hide concept diagram' : '📊 Show concept diagram';
    };
    wrap.appendChild(tog);
    wrap.appendChild(dia);
  }

  const arena = el('div', 'arena');
  wrap.appendChild(arena);
  appEl.appendChild(wrap);

  const renderers = { bins: renderBins, order: renderOrder, match: renderMatch, quiz: renderQuiz, fill: renderFill };
  renderers[stage.type](stage, arena, stats => stageDone(stats, wrap));
}

function stageDone(stats, wrap) {
  // stats: { firstTry, total }
  session.firstTry += stats.firstTry;
  session.total += stats.total;
  const perfect = stats.firstTry === stats.total;
  if (perfect) addXP(PERFECT_BONUS);

  const sum = el('div', 'stage-summary pop');
  sum.innerHTML = `
    <div class="sum-emoji">${perfect ? '🌟' : stats.firstTry / stats.total >= 0.6 ? '✅' : '😅'}</div>
    <div class="sum-title">${perfect ? 'PERFECT! +' + PERFECT_BONUS + ' XP bonus' : 'Challenge complete'}</div>
    <div class="sum-detail">${stats.firstTry}/${stats.total} first-try correct</div>`;
  const btn = el('button', 'btn big',
    session.stageIdx + 1 < session.level.stages.length ? 'Next challenge →' : 'Finish level 🏁');
  btn.onclick = () => {
    session.stageIdx++;
    if (session.stageIdx < session.level.stages.length) runStage();
    else levelComplete();
  };
  sum.appendChild(btn);
  wrap.appendChild(sum);
  btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function levelComplete() {
  const { level, firstTry, total, replay } = session;
  const acc = total ? firstTry / total : 1;
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;

  const firstClear = !state.completed.includes(level.id);
  if (firstClear) state.completed.push(level.id);
  state.stars[level.id] = Math.max(state.stars[level.id] || 0, stars);
  saveState();
  renderTopbar();

  appEl.innerHTML = '';
  const wrap = el('section', 'panel complete pop');
  wrap.innerHTML = `
    <div class="confetti">🎉</div>
    <h2>Level complete!</h2>
    <div class="big-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <div class="earned-badge">🏅 Badge earned: <b>${level.badge}</b></div>
    <div class="sum-detail">${firstTry}/${total} first-try correct${replay ? ' · replay (no XP)' : ''}</div>`;
  const track = trackOf(level);
  const levels = track.levels;
  const row = el('div', 'btnrow center');
  const home = el('button', 'btn ghost', 'Level map');
  home.onclick = () => showTrack(track);
  row.appendChild(home);

  const idx = levels.indexOf(level);
  if (idx + 1 < levels.length) {
    const next = el('button', 'btn big', `Next: ${levels[idx + 1].icon} ${levels[idx + 1].title} →`);
    next.onclick = () => showIntro(levels[idx + 1]);
    row.appendChild(next);
  } else {
    const cert = el('button', 'btn big gold', `🏆 Claim your ${track.certTitle} certificate`);
    cert.onclick = () => showCertificate(track);
    row.appendChild(cert);
  }
  wrap.appendChild(row);
  appEl.appendChild(wrap);
  window.scrollTo(0, 0);
}

/* ============================================================
   CERTIFICATE
   ============================================================ */
function showCertificate(track) {
  track = track || TRACKS[0];
  appEl.innerHTML = '';
  const levels = track.levels;
  const totalStars = levels.reduce((s, l) => s + (state.stars[l.id] || 0), 0);
  const maxStars = levels.length * 3;
  const footer = track.id === 'aas'
    ? `<p class="cert-formula">enable_networking + Teleport = the BX50 access story</p>
       <p class="cert-motto">Isolate by default. Reach by identity, not by IP.</p>`
    : `<p class="cert-formula">Netbird = WireGuard + ICE/STUN/TURN + Management Server</p>
       <p class="cert-motto">No port forwarding. No static routes. It just works.</p>`;
  const wrap = el('section', 'panel cert pop');
  wrap.innerHTML = `
    <div class="cert-inner">
      <div class="cert-crown">${track.icon}</div>
      <h1>${track.certTitle}</h1>
      <p class="cert-sub">${track.certSub}</p>
      <p>has conquered all ${levels.length} levels of the ${track.name}</p>
      <div class="cert-stars">${'★'.repeat(Math.min(totalStars, maxStars))} <span>(${totalStars}/${maxStars} stars · ${state.xp} XP total)</span></div>
      <div class="cert-badges">${levels.map(l => `<span title="${l.badge}">${l.icon}</span>`).join('')}</div>
      ${footer}
    </div>`;
  const back = el('button', 'btn ghost', '← Level map');
  back.onclick = () => showTrack(track);
  wrap.appendChild(back);
  appEl.appendChild(wrap);
}

/* ============================================================
   GAME: BINS — drag items into category bins
   ============================================================ */
function renderBins(stage, arena, onDone) {
  let firstTry = 0, placed = 0;
  const wrongOnce = new Set();
  let selected = null;

  const binsRow = el('div', 'bins-row');
  const zones = {};
  stage.bins.forEach(b => {
    const z = el('div', 'bin');
    z.dataset.bin = b.id;
    z.innerHTML = `<div class="bin-label">${b.label}</div><div class="bin-items"></div>`;
    z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('over'); });
    z.addEventListener('dragleave', () => z.classList.remove('over'));
    z.addEventListener('drop', e => {
      e.preventDefault(); z.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      const chip = pool.querySelector(`[data-id="${id}"]`);
      if (chip) attempt(chip, b.id, z);
    });
    z.addEventListener('click', () => { if (selected) attempt(selected, b.id, z); });
    zones[b.id] = z;
    binsRow.appendChild(z);
  });

  const feedback = el('div', 'feedback');
  const pool = el('div', 'pool');
  shuffle(stage.items).forEach((item, i) => {
    const chip = el('div', 'chip', item.text);
    chip.draggable = true;
    chip.dataset.id = String(i);
    chip._item = item;
    chip.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', chip.dataset.id);
      selectChip(chip);
    });
    chip.addEventListener('click', e => {
      e.stopPropagation();
      selectChip(selected === chip ? null : chip);
    });
    pool.appendChild(chip);
  });

  function selectChip(chip) {
    pool.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    selected = chip;
    if (chip) chip.classList.add('selected');
  }

  function attempt(chip, binId, zone) {
    const item = chip._item;
    if (item.bin === binId) {
      if (!wrongOnce.has(item.text)) { firstTry++; addXP(XP_PER_ITEM); }
      chip.classList.remove('selected');
      chip.classList.add('placed');
      chip.draggable = false;
      zone.querySelector('.bin-items').appendChild(chip);
      zone.classList.add('flash-good');
      setTimeout(() => zone.classList.remove('flash-good'), 500);
      feedback.className = 'feedback good';
      feedback.innerHTML = `✅ <b>${item.text}</b> — ${item.explain}`;
      selected = null;
      placed++;
      if (placed === stage.items.length)
        setTimeout(() => onDone({ firstTry, total: stage.items.length }), 400);
    } else {
      wrongOnce.add(item.text);
      shake(chip); shake(zone);
      feedback.className = 'feedback bad';
      feedback.innerHTML = `❌ <b>${item.text}</b> doesn't belong there — try again!`;
    }
  }

  arena.append(binsRow, feedback, pool);
}

/* ============================================================
   GAME: FILL — drag tokens into blanks to complete a
   command / config / scenario template
   ============================================================ */
function renderFill(stage, arena, onDone) {
  let firstTry = 0, filled = 0;
  const total = stage.blanks.length;
  const wrongOnce = new Set();
  let selected = null;

  // Build the template with inline blank slots (no innerHTML → '<' and '>' are safe)
  const tpl = el('div', 'fill-template');
  stage.template.split(/(\{\d+\})/).forEach(seg => {
    const m = seg.match(/^\{(\d+)\}$/);
    if (m) {
      const idx = +m[1];
      const slot = el('span', 'blank');
      slot.dataset.blank = String(idx);
      slot.textContent = '＿＿';
      slot.addEventListener('dragover', e => { if (!slot.classList.contains('filled')) { e.preventDefault(); slot.classList.add('over'); } });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => {
        e.preventDefault(); slot.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const chip = pool.querySelector(`[data-id="${id}"]`);
        if (chip) attempt(chip, idx, slot);
      });
      slot.addEventListener('click', () => { if (selected) attempt(selected, idx, slot); });
      tpl.appendChild(slot);
    } else if (seg) {
      tpl.appendChild(document.createTextNode(seg));
    }
  });

  const feedback = el('div', 'feedback');
  const pool = el('div', 'pool');
  shuffle(stage.tokens).forEach((tok, i) => {
    const chip = el('div', 'chip');
    chip.textContent = tok;
    chip.draggable = true;
    chip.dataset.id = String(i);
    chip._tok = tok;
    chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.id); selectChip(chip); });
    chip.addEventListener('click', e => { e.stopPropagation(); selectChip(selected === chip ? null : chip); });
    pool.appendChild(chip);
  });

  function selectChip(chip) {
    pool.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    selected = chip;
    if (chip) chip.classList.add('selected');
  }

  function attempt(chip, idx, slot) {
    if (slot.classList.contains('filled')) return;
    const blank = stage.blanks[idx];
    if (chip._tok === blank.answer) {
      if (!wrongOnce.has(idx)) { firstTry++; addXP(XP_PER_ITEM); }
      slot.textContent = chip._tok;
      slot.classList.add('filled');
      chip.remove();
      selected = null;
      feedback.className = 'feedback good';
      feedback.innerHTML = `✅ <b>${escapeHtml(blank.answer)}</b> — ${blank.explain}`;
      filled++;
      if (filled === total) setTimeout(() => onDone({ firstTry, total }), 400);
    } else {
      wrongOnce.add(idx);
      shake(chip); shake(slot);
      feedback.className = 'feedback bad';
      feedback.innerHTML = `❌ <b>${escapeHtml(chip._tok)}</b> doesn't go there — try another blank or token.`;
    }
  }

  arena.append(tpl, feedback, el('p', 'pool-label', '👇 Drag (or tap) a token into each blank:'), pool);
}

/* ============================================================
   GAME: ORDER — "what happens next?" sequence builder
   ============================================================ */
function renderOrder(stage, arena, onDone) {
  let current = 0, firstTry = 0, mistakeOnCurrent = false;

  const slotsCol = el('div', 'slots');
  stage.steps.forEach((s, i) => {
    const slot = el('div', 'slot' + (i === 0 ? ' active' : ''));
    slot.dataset.idx = String(i);
    slot.innerHTML = `<span class="slot-num">${i + 1}</span><span class="slot-text">${i === 0 ? 'What happens first?' : ''}</span>`;
    slot.addEventListener('dragover', e => { if (i === current) { e.preventDefault(); slot.classList.add('over'); } });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', e => {
      e.preventDefault(); slot.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      const chip = pool.querySelector(`[data-id="${id}"]`);
      if (chip && i === current) attempt(chip);
    });
    slotsCol.appendChild(slot);
  });

  const feedback = el('div', 'feedback');
  const pool = el('div', 'pool');
  let selected = null;

  shuffle(stage.steps.map((s, i) => ({ ...s, idx: i }))).forEach(step => {
    const chip = el('div', 'chip wide', step.text);
    chip.draggable = true;
    chip.dataset.id = String(step.idx);
    chip._step = step;
    chip.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', chip.dataset.id));
    chip.addEventListener('click', () => attempt(chip));
    pool.appendChild(chip);
  });

  function attempt(chip) {
    const step = chip._step;
    const slot = slotsCol.children[current];
    if (step.idx === current) {
      if (!mistakeOnCurrent) { firstTry++; addXP(XP_PER_ITEM); }
      mistakeOnCurrent = false;
      slot.classList.remove('active');
      slot.classList.add('filled');
      slot.querySelector('.slot-text').innerHTML = `${step.text}<small>${step.explain}</small>`;
      chip.remove();
      feedback.className = 'feedback good';
      feedback.innerHTML = `✅ Step ${current + 1} locked in!`;
      current++;
      if (current < stage.steps.length) {
        const next = slotsCol.children[current];
        next.classList.add('active');
        next.querySelector('.slot-text').textContent = 'What happens next?';
      } else {
        setTimeout(() => onDone({ firstTry, total: stage.steps.length }), 400);
      }
    } else {
      mistakeOnCurrent = true;
      shake(chip); shake(slot);
      feedback.className = 'feedback bad';
      feedback.innerHTML = `❌ Not yet — something else happens at step ${current + 1}.`;
    }
  }

  arena.append(slotsCol, feedback, el('p', 'pool-label', '👇 Pick (or drag) the next step:'), pool);
}

/* ============================================================
   GAME: MATCH — pair left terms with right definitions
   ============================================================ */
function renderMatch(stage, arena, onDone) {
  let firstTry = 0, matched = 0;
  const wrongOnce = new Set();
  let selLeft = null, selRight = null;

  const grid = el('div', 'match-grid');
  const leftCol = el('div', 'match-col');
  const rightCol = el('div', 'match-col');
  grid.append(leftCol, rightCol);
  const feedback = el('div', 'feedback');

  stage.pairs.forEach((p, i) => {
    const card = el('div', 'mcard left', p.left);
    card.dataset.idx = String(i);
    card.onclick = () => pick(card, 'L');
    card.addEventListener('dragover', e => e.preventDefault());
    card.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const r = rightCol.querySelector(`[data-idx="${id}"]:not(.done)`);
      if (r) { selLeft = card; selRight = r; check(); }
    });
    leftCol.appendChild(card);
  });

  shuffle(stage.pairs.map((p, i) => ({ ...p, idx: i }))).forEach(p => {
    const card = el('div', 'mcard right', p.right);
    card.dataset.idx = String(p.idx);
    card.draggable = true;
    card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', card.dataset.idx));
    card.onclick = () => pick(card, 'R');
    rightCol.appendChild(card);
  });

  function pick(card, side) {
    if (card.classList.contains('done')) return;
    if (side === 'L') {
      leftCol.querySelectorAll('.mcard').forEach(c => c.classList.remove('selected'));
      selLeft = card; card.classList.add('selected');
    } else {
      rightCol.querySelectorAll('.mcard').forEach(c => c.classList.remove('selected'));
      selRight = card; card.classList.add('selected');
    }
    if (selLeft && selRight) check();
  }

  function check() {
    const li = selLeft.dataset.idx, ri = selRight.dataset.idx;
    const pair = stage.pairs[li];
    if (li === ri) {
      if (!wrongOnce.has(li)) { firstTry++; addXP(XP_PER_ITEM); }
      [selLeft, selRight].forEach(c => { c.classList.remove('selected'); c.classList.add('done'); });
      feedback.className = 'feedback good';
      feedback.innerHTML = `✅ <b>${pair.left}</b> — ${pair.explain}`;
      matched++;
      if (matched === stage.pairs.length)
        setTimeout(() => onDone({ firstTry, total: stage.pairs.length }), 400);
    } else {
      wrongOnce.add(li);
      shake(selLeft); shake(selRight);
      [selLeft, selRight].forEach(c => c.classList.remove('selected'));
      feedback.className = 'feedback bad';
      feedback.innerHTML = '❌ Not a match — try another combination.';
    }
    selLeft = selRight = null;
  }

  arena.append(grid, feedback);
}

/* ============================================================
   GAME: QUIZ — MCQ with optional context block
   ============================================================ */
function renderQuiz(stage, arena, onDone) {
  let qi = 0, firstTry = 0;

  function renderQuestion() {
    arena.innerHTML = '';
    const q = stage.questions[qi];
    let mistake = false;

    arena.appendChild(el('div', 'quiz-progress',
      `Question ${qi + 1} / ${stage.questions.length}`));
    if (q.context) arena.appendChild(el('pre', 'context', escapeHtml(q.context)));
    arena.appendChild(el('div', 'question', q.q));

    const feedback = el('div', 'feedback');
    const choices = el('div', 'choices');

    // shuffle choices but remember which is correct
    const order = shuffle(q.choices.map((c, i) => ({ c, i })));
    order.forEach(({ c, i }) => {
      const btn = el('button', 'choice', c);
      btn.onclick = () => {
        if (btn.disabled) return;
        if (i === q.answer) {
          if (!mistake) { firstTry++; addXP(XP_PER_ITEM); }
          btn.classList.add('correct');
          choices.querySelectorAll('.choice').forEach(b => b.disabled = true);
          feedback.className = 'feedback good';
          feedback.innerHTML = `💡 ${q.explain}`;
          const next = el('button', 'btn',
            qi + 1 < stage.questions.length ? 'Next question →' : 'Done ✓');
          next.onclick = () => {
            qi++;
            if (qi < stage.questions.length) renderQuestion();
            else onDone({ firstTry, total: stage.questions.length });
          };
          arena.appendChild(next);
          next.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          mistake = true;
          btn.classList.add('wrong');
          btn.disabled = true;
          shake(btn);
          feedback.className = 'feedback bad';
          feedback.innerHTML = '❌ Not quite — try again.';
        }
      };
      choices.appendChild(btn);
    });

    arena.append(choices, feedback);
  }

  renderQuestion();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------------- boot ---------------- */
renderTopbar();
showHome();
