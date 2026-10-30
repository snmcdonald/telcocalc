// Copyright (c) 2026 Shane McDonald. All rights reserved.

const STRAND_COLORS = [
  { name: "Blue", bg: "#0066ff", text: "#ffffff" },
  { name: "Orange", bg: "#ff6600", text: "#ffffff" },
  { name: "Green", bg: "#009933", text: "#ffffff" },
  { name: "Brown", bg: "#8b4513", text: "#ffffff" },
  { name: "Slate", bg: "#708090", text: "#ffffff" },
  { name: "White", bg: "#ffffff", text: "#000000" },
  { name: "Red", bg: "#cc0000", text: "#ffffff" },
  { name: "Black", bg: "#000000", text: "#ffffff" },
  { name: "Yellow", bg: "#ffff00", text: "#000000" },
  { name: "Violet", bg: "#8a2be2", text: "#ffffff" },
  { name: "Rose", bg: "#ff69b4", text: "#000000" },
  { name: "Aqua", bg: "#00ffff", text: "#000000" }
];

const TRACER_COLORS = [
  { name: "(none)", bg: "transparent", text: "#ffffff" },
  { name: "Black", bg: "#000000", text: "#ffffff" },
  { name: "Yellow", bg: "#ffff00", text: "#000000" },
  { name: "Green", bg: "#009933", text: "#ffffff" },
  { name: "Red", bg: "#cc0000", text: "#ffffff" }
];

const TUBE_LIMITS = {
  6:  { maxStrands: 72,  allowedTracers: [0] },
  12: { maxStrands: 144, allowedTracers: [0] },
  24: { maxStrands: 288, allowedTracers: [0, 1] },
  36: { maxStrands: 432, allowedTracers: [0, 1, 2] },
  48: { maxStrands: 576, allowedTracers: [0, 1, 2, 3] },
  60: { maxStrands: 720, allowedTracers: [0, 1, 2, 3, 4] }
};

const strandsPerTubeEl = document.getElementById('strands_per_tube');
const strandNumberEl = document.getElementById('strand_number');
const strandErrorEl = document.getElementById('strand_error');
const tubeColorEl = document.getElementById('tube_color');
const tracerColorEl = document.getElementById('tracer_color');
const strandColorEl = document.getElementById('strand_color');

const outStrandNumEl = document.getElementById('out_strand_num');
const outColorDescEl = document.getElementById('out_color_desc');
const previewTubeEl = document.getElementById('preview_tube');
const previewStrandEl = document.getElementById('preview_strand');
const previewTracerEl = document.getElementById('preview_tracer');

let activeSource = 'number';

function populateDropdowns() {
  tubeColorEl.innerHTML = STRAND_COLORS.map((c, i) => `<option value="${i}">${c.name}</option>`).join('');
  strandColorEl.innerHTML = STRAND_COLORS.map((c, i) => `<option value="${i}">${c.name}</option>`).join('');
  updateTracerOptions();
}

function updateTracerOptions() {
  const spt = parseInt(strandsPerTubeEl.value, 10);
  const limits = TUBE_LIMITS[spt];
  tracerColorEl.innerHTML = '';

  if (limits.allowedTracers.length === 1) {
    tracerColorEl.disabled = true;
    const c = TRACER_COLORS[0];
    tracerColorEl.innerHTML = `<option value="0">${c.name}</option>`;
  } else {
    tracerColorEl.disabled = false;
    limits.allowedTracers.forEach(idx => {
      const c = TRACER_COLORS[idx];
      tracerColorEl.innerHTML += `<option value="${idx}">${c.name}</option>`;
    });
  }
  applySelectStyle(tracerColorEl, TRACER_COLORS);
}

function applySelectStyle(selectEl, colorPalette) {
  const idx = parseInt(selectEl.value || 0, 10);
  const color = colorPalette[idx] || colorPalette[0];
  if (color.bg === 'transparent') {
    selectEl.style.backgroundColor = '#0f172a';
    selectEl.style.color = '#ffffff';
  } else {
    selectEl.style.backgroundColor = color.bg;
    selectEl.style.color = color.text;
  }
}

function calculateFromNumber() {
  const spt = parseInt(strandsPerTubeEl.value, 10);
  const maxLimit = TUBE_LIMITS[spt].maxStrands;
  const val = parseFloat(strandNumberEl.value);

  if (isNaN(val) || !Number.isInteger(val) || val < 1 || val > maxLimit) {
    strandErrorEl.textContent = `Must be an integer between 1 and ${maxLimit}`;
    strandErrorEl.classList.add('active');
    return;
  }
  strandErrorEl.classList.remove('active');

  const calcStrandNumber = val - 1;
  const tubeIdx = Math.floor(calcStrandNumber / spt) % 12;
  let tracerIdx = 0;
  if (spt > 12) {
    tracerIdx = Math.floor((calcStrandNumber - (Math.floor(calcStrandNumber / spt) * spt)) / 12);
  }
  const strandIdx = Math.floor(calcStrandNumber % 12);

  tubeColorEl.value = tubeIdx;
  tracerColorEl.value = tracerIdx;
  strandColorEl.value = strandIdx;

  applySelectStyle(tubeColorEl, STRAND_COLORS);
  applySelectStyle(tracerColorEl, TRACER_COLORS);
  applySelectStyle(strandColorEl, STRAND_COLORS);

  renderSummary(val, tubeIdx, strandIdx, tracerIdx);
}

function calculateFromColor() {
  const spt = parseInt(strandsPerTubeEl.value, 10);
  const tubeIdx = parseInt(tubeColorEl.value, 10);
  const tracerIdx = parseInt(tracerColorEl.value || 0, 10);
  const strandIdx = parseInt(strandColorEl.value, 10);

  let strandNum = 0;
  if (spt <= 12) {
    strandNum = (tubeIdx * spt) + strandIdx + 1;
  } else {
    strandNum = (tubeIdx * spt) + (tracerIdx * 12) + strandIdx + 1;
  }

  strandNumberEl.value = strandNum;
  strandErrorEl.classList.remove('active');

  applySelectStyle(tubeColorEl, STRAND_COLORS);
  applySelectStyle(tracerColorEl, TRACER_COLORS);
  applySelectStyle(strandColorEl, STRAND_COLORS);

  renderSummary(strandNum, tubeIdx, strandIdx, tracerIdx);
}

function renderSummary(num, tubeIdx, strandIdx, tracerIdx) {
  const tube = STRAND_COLORS[tubeIdx];
  const strand = STRAND_COLORS[strandIdx];
  const tracer = TRACER_COLORS[tracerIdx];

  outStrandNumEl.textContent = num;
  outColorDescEl.textContent = `Tube: ${tube.name} | Strand: ${strand.name} | Tracer: ${tracer.name}`;

  previewTubeEl.style.backgroundColor = tube.bg;
  previewStrandEl.style.backgroundColor = strand.bg;
  previewTracerEl.style.backgroundColor = (tracer.name === '(none)') ? 'transparent' : tracer.bg;
}

strandsPerTubeEl.addEventListener('change', () => {
  const spt = parseInt(strandsPerTubeEl.value, 10);
  const maxLimit = TUBE_LIMITS[spt].maxStrands;
  strandNumberEl.max = maxLimit;
  updateTracerOptions();

  if (activeSource === 'number') {
    if (parseInt(strandNumberEl.value, 10) > maxLimit) strandNumberEl.value = maxLimit;
    calculateFromNumber();
  } else {
    calculateFromColor();
  }
});

strandNumberEl.addEventListener('input', () => { activeSource = 'number'; calculateFromNumber(); });
tubeColorEl.addEventListener('change', () => { activeSource = 'color'; calculateFromColor(); });
tracerColorEl.addEventListener('change', () => { activeSource = 'color'; calculateFromColor(); });
strandColorEl.addEventListener('change', () => { activeSource = 'color'; calculateFromColor(); });

populateDropdowns();
calculateFromNumber();
