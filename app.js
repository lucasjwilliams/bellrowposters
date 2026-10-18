'use strict';

const CHANGELOG = [
  {
    version: '0.1', date: '2026-10-18', changes: [
      'First version: choose your numbers of bells and rows, rename them or add your own, style the poster, then print, download or share it',
    ],
  },
];
const VERSION = CHANGELOG[0].version;

const PLACES = '1234567890ET';
const STAGES = [5, 6, 7, 8, 10, 12];

const THEMES = [
  { name: 'Navy', main: '#1f3a68', light: '#dfe7f3' },
  { name: 'Green', main: '#4a7a35', light: '#e3efd9' },
  { name: 'Burgundy', main: '#7a1f35', light: '#f3dfe4' },
  { name: 'Bronze', main: '#8a5a1c', light: '#f4e8d6' },
  { name: 'Slate', main: '#333a42', light: '#e6e8eb' },
];

const bells = (n) => Array.from({ length: n }, (_, i) => i + 1);
const asRow = (list) => list.map((b) => PLACES[b - 1]).join('');

const odds = (n) => bells(n).filter((b) => b % 2);
const evens = (n) => bells(n).filter((b) => !(b % 2));

function crossJoin(front, back) {
  const list = [...front, ...back];
  const k = front.length;
  [list[k - 1], list[k]] = [list[k], list[k - 1]];
  return asRow(list);
}

function jacks(n) {
  const pairs = [];
  for (let b = 2; b < n; b += 2) pairs.unshift(bells(n - 1).slice(b - 1, b + 1));
  return asRow([1, ...pairs.flat(), n]);
}

const RULES = {
  rounds: (n) => asRow(bells(n)),
  queens: (n) => asRow([...odds(n), ...evens(n)]),
  kings: (n) => asRow([...odds(n).reverse(), ...evens(n)]),
  princes: (n) => crossJoin(odds(n).reverse(), evens(n)),
  princesses: (n) => crossJoin(odds(n), evens(n)),
  jokers: (n) => asRow([1, ...bells(n - 1).slice(1).reverse(), n]),
  jacks,
  tittums: (n) => { const h = Math.ceil(n / 2); return asRow(bells(h).flatMap((b) => (b + h <= n ? [b, b + h] : [b]))); },
  backRounds: (n) => asRow([...bells(n - 1).reverse(), n]),
};

const LIBRARY = [
  { name: 'Rounds', rule: 'rounds', on: true },
  { name: 'Queens', rule: 'queens', on: true },
  { name: 'Kings', rule: 'kings', on: true },
  { name: 'Whittingtons', values: { 5: '12534', 6: '125346', 7: '1275346', 8: '12753468', 10: '1297534680', 12: '12E97534680T' }, on: true },
  { name: 'Tittums', rule: 'tittums', on: true },
  { name: 'Exploding Tittums', values: { 5: '34251', 6: '342516', 7: '4536271', 8: '45362718', 10: '5647382910', 12: '675849302E1T' }, on: true },
  { name: 'Hagdyke', values: { 5: '34125', 6: '341256', 7: '1256347', 8: '12563478', 10: '5612783490', 12: '1278349056ET' }, on: true },
  { name: 'Rollercoaster', values: { 5: '32145', 6: '321654', 7: '3214765', 8: '32147658', 10: '3216549870', 12: '32147658E09T' }, on: true },
  { name: 'See-saw', values: { 5: '32145', 6: '321456', 7: '4321567', 8: '43215678', 10: '5432167890', 12: '6543217890ET' }, on: true },
  { name: 'Wrap', values: { 5: '32154', 6: '321654', 7: '3217654', 8: '43218765', 10: '5432109876', 12: '654321TE0987' }, on: true },
  { name: 'Back rounds', rule: 'backRounds', on: true },
  { name: 'Princes', rule: 'princes' },
  { name: 'Princesses', rule: 'princesses' },
  { name: 'Jokers', rule: 'jokers' },
  { name: 'Jacks', rule: 'jacks' },
];

function libraryValues(entry) {
  return Object.fromEntries(STAGES.map((n) => [n, entry.rule ? RULES[entry.rule](n) : entry.values[n] || '']));
}

function standardRows() {
  return LIBRARY.map((entry, i) => ({
    lib: i,
    name: entry.name,
    values: libraryValues(entry),
    included: !!entry.on,
    added: false,
  }));
}

const DEFAULT_TITLE = 'Named Rows';
const DEFAULT_STAGES = [];

const state = {
  stages: [...DEFAULT_STAGES],
  rows: standardRows(),
  title: DEFAULT_TITLE,
  subtitle: '',
  orientation: 'portrait',
  pages: 1,
  titleAll: false,
  headAll: false,
  theme: THEMES[0],
};

const $ = (id) => document.getElementById(id);

const IS_TOUCH = matchMedia('(pointer: coarse)').matches;

const IS_WEBKIT_PRINT = /iP(hone|ad|od)/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  || (/Safari/.test(navigator.userAgent) && !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS|Android/.test(navigator.userAgent));
if (IS_WEBKIT_PRINT) document.documentElement.classList.add('safari-print');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isRow(value, n) {
  return value.length === n && [...PLACES.slice(0, n)].every((p) => value.includes(p));
}

function selectedStages() {
  return STAGES.filter((n) => state.stages.includes(n));
}

function hasAnyValue(row) {
  return selectedStages().some((n) => row.values[n]);
}

function renderStages() {
  $('stage-list').innerHTML = STAGES.map((n) => `
    <label><input type="checkbox" value="${n}" ${state.stages.includes(n) ? 'checked' : ''}> ${n} bells</label>`).join('');
  $('stage-list').querySelectorAll('input').forEach((box) => {
    box.addEventListener('change', () => {
      const n = +box.value;
      state.stages = box.checked ? [...state.stages, n] : state.stages.filter((s) => s !== n);
      renderRowList();
      renderPoster();
    });
  });
}

function renderRowList() {
  const stages = selectedStages();
  document.querySelectorAll('.needs-bells').forEach((el) => { el.hidden = !stages.length; });
  const cols = `repeat(${Math.max(1, stages.length)}, minmax(0, 1fr))`;
  const head = $('row-head');
  head.style.setProperty('--stage-cols', cols);
  head.hidden = !stages.length;
  head.innerHTML = `<span></span><span>Name</span>${stages.map((n) => `<span class="h-stage">${n} bells</span>`).join('')}`;

  const el = $('row-list');
  el.innerHTML = state.rows.map((row, i) => {
    const label = escapeHtml(row.name || `row ${i + 1}`);
    return `
    <div class="row-item ${row.included ? '' : 'off'} ${hasAnyValue(row) ? '' : 'none'}" data-i="${i}" style="--stage-cols:${cols}">
      <input type="checkbox" class="inc" ${row.included ? 'checked' : ''} aria-label="Include ${label}" title="Show this row on the poster">
      <input type="text" class="name" value="${escapeHtml(row.name)}" placeholder="Name" aria-label="Name of ${label}">
      <div class="values">
        ${stages.map((n) => {
          const v = row.values[n] || '';
          return `<label class="value"><span class="mini">${n} bells</span>
            <input type="text" data-stage="${n}" value="${escapeHtml(v)}" maxlength="${n}" placeholder="–" spellcheck="false" autocomplete="off"
              class="${v && !isRow(v, n) ? 'bad' : ''}" aria-label="${label} on ${n} bells"
              title="${v && !isRow(v, n) ? `Not a row on ${n} bells: use each of ${PLACES.slice(0, n)} once` : `${n} bells`}">
          </label>`;
        }).join('')}
      </div>
      <div class="row-end">
        ${row.added ? `<button type="button" class="remove" aria-label="Remove ${label}" title="Remove this row">✕</button>` : ''}
        <button type="button" class="drag" aria-label="Move ${label} (drag, or use the arrow keys)" title="Drag to reorder">⠿</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.row-item').forEach((item) => {
    const row = state.rows[+item.dataset.i];
    item.querySelector('.inc').addEventListener('change', (e) => {
      row.included = e.target.checked;
      item.classList.toggle('off', !row.included);
      renderPoster();
    });
    item.querySelector('.name').addEventListener('input', (e) => {
      row.name = e.target.value;
      renderPoster();
    });
    item.querySelectorAll('.value input').forEach((input) => {
      const n = +input.dataset.stage;
      input.addEventListener('input', () => {
        const v = input.value.toUpperCase().replace(/[^0-9ET]/g, '');
        if (v !== input.value) input.value = v;
        row.values[n] = v;
        const bad = v && !isRow(v, n);
        input.classList.toggle('bad', !!bad);
        input.title = bad ? `Not a row on ${n} bells: use each of ${PLACES.slice(0, n)} once` : `${n} bells`;
        item.classList.toggle('none', !hasAnyValue(row));
        renderPoster();
      });
    });
    item.querySelector('.remove')?.addEventListener('click', () => {
      state.rows.splice(state.rows.indexOf(row), 1);
      renderRowList();
      renderPoster();
    });
    const handle = item.querySelector('.drag');
    handle.addEventListener('pointerdown', (e) => startDrag(e, item));
    handle.addEventListener('keydown', (e) => {
      const i = state.rows.indexOf(row);
      const j = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1;
      if (j < 0 || j >= state.rows.length) return;
      e.preventDefault();
      [state.rows[i], state.rows[j]] = [state.rows[j], state.rows[i]];
      renderRowList();
      renderPoster();
      $('row-list').children[j].querySelector('.drag').focus();
    });
  });
}

function startDrag(e, item) {
  if (e.button !== 0) return;
  e.preventDefault();
  const list = $('row-list');
  item.classList.add('dragging');
  list.classList.add('is-dragging');
  const mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
  const move = (ev) => {
    const next = item.nextElementSibling;
    const prev = item.previousElementSibling;
    if (next && ev.clientY > mid(next)) item.before(next);
    else if (prev && ev.clientY < mid(prev)) item.after(prev);
  };
  const end = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', end);
    document.removeEventListener('pointercancel', end);
    list.classList.remove('is-dragging');
    const order = [...list.children].map((r) => state.rows[+r.dataset.i]);
    const changed = order.some((r, i) => r !== state.rows[i]);
    state.rows = order;
    renderRowList();
    if (changed) renderPoster();
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

function addRow() {
  state.rows.push({
    lib: -1,
    name: '',
    values: Object.fromEntries(STAGES.map((n) => [n, ''])),
    included: true,
    added: true,
  });
  renderRowList();
  renderPoster();
  $('row-list').lastElementChild.querySelector('.name').focus();
}

function resetRows() {
  if (state.rows.some((r) => r.added) && !confirm('Reset to the standard rows? Rows you have added will be removed.')) return;
  state.rows = standardRows();
  renderRowList();
  renderPoster();
}

function splitRows(rows, pages) {
  const n = Math.max(1, Math.min(pages, rows.length));
  const groups = [];
  let start = 0;
  for (let i = 0; i < n; i++) {
    const size = Math.ceil((rows.length - start) / (n - i));
    groups.push(rows.slice(start, start + size));
    start += size;
  }
  return groups;
}

function posterPage(rows, stages, first, startIndex) {
  const title = first || state.titleAll;
  const head = first || state.headAll;
  const widths = ['1.6fr', ...stages.map((n) => `${Math.max(1, n / 6)}fr`)].join(' ');
  return `
    <div class="poster ${state.orientation} ${title ? '' : 'no-title'} ${head ? '' : 'no-head'}" style="--rows:${rows.length}; --cols:${widths}; --main:${state.theme.main}; --light:${state.theme.light}">
      ${title ? `<h1 class="p-title">${escapeHtml(state.title)}</h1>
      ${state.subtitle ? `<p class="p-subtitle">${escapeHtml(state.subtitle)}</p>` : ''}` : ''}
      <div class="p-table">
        ${head ? `<div class="p-row p-head">
          <div class="p-name">Name</div>${stages.map((n) => `<div>${n} bells</div>`).join('')}
        </div>` : ''}
        ${rows.map((row, i) => `
          <div class="p-row ${(startIndex + i) % 2 ? 'band' : ''}">
            <div class="p-name">${escapeHtml(row.name)}</div>
            ${stages.map((n) => (row.values[n]
              ? `<div class="p-value">${escapeHtml(row.values[n])}</div>`
              : '<div class="p-value none">–</div>')).join('')}
          </div>`).join('')}
      </div>
      <p class="p-credit">Named Row Posters | rows.lucasw.uk</p>
    </div>`;
}

function fitPosterText() {
  document.querySelectorAll('#posters .p-row > div').forEach((cell) => { cell.style.fontSize = ''; });
  const overflows = (cell) => cell.scrollHeight > cell.parentElement.clientHeight || cell.scrollWidth > cell.clientWidth + 1;
  ['.p-head > div', '.p-row:not(.p-head) > .p-name', '.p-row:not(.p-head) > .p-value'].forEach((selector) => {
    const cells = [...document.querySelectorAll(`#posters ${selector}`)];
    if (!cells.length) return;
    let size = Math.min(...cells.map((cell) => parseFloat(getComputedStyle(cell).fontSize)));
    const apply = () => cells.forEach((cell) => { cell.style.fontSize = `${size}px`; });
    apply();
    for (let i = 0; i < 30 && size > 8 && cells.some(overflows); i++) {
      size -= 1;
      apply();
    }
  });
}

function renderPoster() {
  const posters = $('posters');
  $('page-size').textContent = `@page { size: A4 ${state.orientation}; margin: 0; }`;
  const stages = selectedStages();
  const rows = state.rows.filter((r) => r.included && hasAnyValue(r));
  if (!stages.length || !rows.length) {
    posters.innerHTML = `<div class="poster ${state.orientation}"><div class="poster-empty">${stages.length ? 'Tick at least one row.' : 'Choose at least one number of bells.'}</div></div>`;
  } else {
    let start = 0;
    posters.innerHTML = splitRows(rows, state.pages).map((group, i) => {
      const html = posterPage(group, stages, i === 0, start);
      start += group.length;
      return html;
    }).join('');
    fitPosterText();
  }
  fitPreview();
}

function fitPreview() {
  const frame = $('poster-frame');
  const posters = $('posters');
  frame.style.maxWidth = '';
  const scale = Math.min(1, frame.clientWidth / posters.offsetWidth);
  posters.style.transform = `scale(${scale})`;
  frame.style.height = `${posters.offsetHeight * scale}px`;
  frame.style.maxWidth = `${posters.offsetWidth * scale}px`;
}

function toBase64Url(bytes) {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipeThrough(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

function encodeRow(row) {
  const lib = row.lib >= 0 ? LIBRARY[row.lib] : null;
  const std = lib ? libraryValues(lib) : null;
  const values = {};
  STAGES.forEach((n) => { if (!std || row.values[n] !== std[n]) values[n] = row.values[n]; });
  const out = [row.lib, row.included ? 1 : 0];
  if (!lib || row.name !== lib.name) out.push(row.name);
  else out.push(0);
  if (Object.keys(values).length) out.push(values);
  return out;
}

function decodeRow([lib, included, name, values = {}]) {
  const entry = lib >= 0 ? LIBRARY[lib] : null;
  return {
    lib: entry ? lib : -1,
    name: name === 0 && entry ? entry.name : String(name ?? ''),
    values: { ...(entry ? libraryValues(entry) : Object.fromEntries(STAGES.map((n) => [n, '']))), ...values },
    included: !!included,
    added: !entry,
  };
}

async function encodeState() {
  const data = { s: state.stages, r: state.rows.map(encodeRow) };
  if (state.title !== DEFAULT_TITLE) data.t = state.title;
  if (state.subtitle) data.st = state.subtitle;
  if (state.theme !== THEMES[0]) data.c = THEMES.indexOf(state.theme);
  if (state.orientation !== 'portrait') data.o = 'l';
  if (state.pages > 1) data.n = state.pages;
  if (state.titleAll) data.ta = 1;
  if (state.headAll) data.ha = 1;
  const json = new TextEncoder().encode(JSON.stringify(data));
  return toBase64Url(await pipeThrough(json, new CompressionStream('deflate-raw')));
}

async function decodeState(s) {
  const bytes = await pipeThrough(fromBase64Url(s), new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function applyState(data) {
  state.stages = (data.s || DEFAULT_STAGES).filter((n) => STAGES.includes(n));
  state.rows = (data.r || []).map(decodeRow);
  state.title = data.t ?? DEFAULT_TITLE;
  state.subtitle = data.st ?? '';
  state.theme = THEMES[data.c] || THEMES[0];
  state.orientation = data.o === 'l' ? 'landscape' : 'portrait';
  state.pages = data.n || 1;
  state.titleAll = data.ta === 1;
  state.headAll = data.ha === 1;
  syncControls();
}

function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('orientation').value = state.orientation;
  $('pages').value = String(state.pages);
  $('page-options').hidden = state.pages < 2;
  $('title-all').checked = state.titleAll;
  $('head-all').checked = state.headAll;
  $('swatches').querySelectorAll('.swatch').forEach((s) => s.classList.toggle('on', THEMES[+s.dataset.i] === state.theme));
  renderStages();
  renderRowList();
  renderPoster();
}

async function share() {
  const btn = $('share');
  try {
    const url = `${location.href.split(/[?#]/)[0]}#p=${await encodeState()}`;
    history.replaceState(null, '', url);
    $('share-url').value = url;
    $('share-box').hidden = false;
    $('share-url').select();
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Link copied!';
    } catch {
      btn.textContent = 'Copy the link below';
    }
  } catch (err) {
    alert(`Sorry, the link couldn't be made: ${err.message}`);
  }
  setTimeout(() => { btn.textContent = 'Copy share link'; }, 2500);
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('it took too long')), ms)),
  ]);
}

async function downloadImage() {
  const btn = $('download');
  btn.disabled = true;
  btn.textContent = 'Rendering…';
  try {
    const pages = [...$('posters').querySelectorAll('.poster')];
    const base = state.title.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'named-rows';
    const files = [];
    for (const [i, page] of pages.entries()) {
      const maxPixels = IS_TOUCH ? 4e6 : 12e6;
      const scale = Math.min(3, Math.sqrt(maxPixels / (page.offsetWidth * page.offsetHeight)));
      const canvas = await withTimeout(html2canvas(page, {
        scale,
        backgroundColor: '#ffffff',
        onclone: (doc) => {
          doc.getElementById('posters').style.transform = 'none';
          doc.querySelectorAll('.poster').forEach((p) => { p.style.boxShadow = 'none'; });
        },
      }), 30000);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('the image was too big for this browser');
      const name = pages.length > 1 ? `${base}-${i + 1}-of-${pages.length}.png` : `${base}.png`;
      files.push(new File([blob], name, { type: 'image/png' }));
    }
    if (IS_TOUCH && navigator.canShare?.({ files })) {
      await navigator.share({ files }).catch((e) => { if (e.name !== 'AbortError') throw e; });
    } else {
      for (const file of files) {
        const a = document.createElement('a');
        a.download = file.name;
        a.href = URL.createObjectURL(file);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }
    }
  } catch (err) {
    alert(`Sorry, the image couldn't be made (${err.message}). "Print / Save as PDF" should still work.`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download as image';
  }
}

function closeOnBackdrop(dialog) {
  const outside = (e) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let pressedOutside = false;
  dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e); });
  dialog.addEventListener('click', (e) => {
    if (pressedOutside && outside(e)) dialog.close();
  });
}

function showChangelog() {
  const fmt = (d) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  $('changelog-list').innerHTML = CHANGELOG.map((v) => `
    <section>
      <h3>v${v.version}<time datetime="${v.date}">${fmt(v.date)}</time></h3>
      <ul>${v.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    </section>`).join('');
  $('changelog').showModal();
}

function initControls() {
  $('title').addEventListener('input', (e) => { state.title = e.target.value; renderPoster(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPoster(); });
  $('orientation').addEventListener('change', (e) => { state.orientation = e.target.value; renderPoster(); });
  $('pages').addEventListener('change', (e) => {
    state.pages = +e.target.value;
    $('page-options').hidden = state.pages < 2;
    renderPoster();
  });
  $('title-all').addEventListener('change', (e) => { state.titleAll = e.target.checked; renderPoster(); });
  $('head-all').addEventListener('change', (e) => { state.headAll = e.target.checked; renderPoster(); });
  $('add-row').addEventListener('click', addRow);
  $('reset-rows').addEventListener('click', resetRows);
  $('share').addEventListener('click', share);
  $('print').addEventListener('click', () => window.print());
  $('download').addEventListener('click', downloadImage);
  closeOnBackdrop($('changelog'));
  $('version').addEventListener('click', showChangelog);
  window.addEventListener('resize', fitPreview);
  const setFull = (on) => {
    $('preview').classList.toggle('full', on);
    document.body.classList.toggle('no-scroll', on);
    fitPreview();
  };
  $('preview-full').addEventListener('click', () => setFull(true));
  $('preview-close').addEventListener('click', () => setFull(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setFull(false); });

  $('swatches').innerHTML = THEMES.map((t, i) => `
    <button type="button" class="swatch" data-i="${i}" style="background:${t.main}" aria-label="${t.name}" title="${t.name}"></button>`).join('');
  $('swatches').querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.theme = THEMES[+btn.dataset.i];
      $('swatches').querySelectorAll('.swatch').forEach((s) => s.classList.toggle('on', s === btn));
      renderPoster();
    });
  });
}

async function init() {
  $('version').textContent = `v${VERSION} ${new Date(document.lastModified).getFullYear()}`;
  initControls();
  const shared = location.hash.match(/^#p=([\w-]+)/);
  if (shared) {
    try {
      applyState(await decodeState(shared[1]));
      return;
    } catch {
      alert("Sorry, that share link looks damaged, so it couldn't be opened.");
    }
  }
  syncControls();
}

init();
