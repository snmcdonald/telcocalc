// Copyright (c) 2026 Shane McDonald. All rights reserved.

const CONDUIT_DATA = [
  { metric: 16,  trade: '1/2"',   area1: 98.72,   area2: 57.74,   area3: 74.51 },
  { metric: 21,  trade: '3/4"',   area1: 174.93,  area2: 102.32,  area3: 132.03 },
  { metric: 27,  trade: '1"',     area1: 285.74,  area2: 167.13,  area3: 215.65 },
  { metric: 35,  trade: '1-1/4"', area1: 498.33,  area2: 291.48,  area3: 376.10 },
  { metric: 41,  trade: '1-1/2"', area1: 682.77,  area2: 399.36,  area3: 515.30 },
  { metric: 53,  trade: '2"',     area1: 1129.90, area2: 660.89,  area3: 852.76 },
  { metric: 63,  trade: '2-1/2"', area1: 2004.86, area2: 1172.66, area3: 1513.10 },
  { metric: 78,  trade: '3"',     area1: 3021.66, area2: 1767.38, area3: 2280.49 },
  { metric: 91,  trade: '3-1/2"', area1: 3948.97, area2: 2309.77, area3: 2980.35 },
  { metric: 103, trade: '4"',     area1: 5036.76, area2: 2946.03, area3: 3801.33 },
  { metric: 129, trade: '5"',     area1: 6916.00, area2: 4045.00, area3: 5520.00 },
  { metric: 155, trade: '6"',     area1: 9975.00, area2: 5834.00, area3: 7528.00 }
];

const refTableBody = document.getElementById('ref_table_body');
CONDUIT_DATA.forEach((row, idx) => {
  const tr = document.createElement('tr');
  tr.id = `table-row-${idx}`;
  tr.innerHTML = `
    <td><strong>${row.metric} (${row.trade})</strong></td>
    <td>${row.area1.toFixed(2)}</td>
    <td>${row.area2.toFixed(2)}</td>
    <td>${row.area3.toFixed(2)}</td>
  `;
  refTableBody.appendChild(tr);
});

const cableNumberInput = document.getElementById('cable_number');
const cableDiameterInput = document.getElementById('cable_diameter');
const cableUnitSelect = document.getElementById('cable_unit');
const conduitSizeSelect = document.getElementById('conduit_size');

const singleInputsWrapper = document.getElementById('single_inputs_wrapper');
const groupCableNumber = document.getElementById('group_cable_number');
const groupCableDiameter = document.getElementById('group_cable_diameter');
const groupMixedCables = document.getElementById('group_mixed_cables');
const mixedCablesContainer = document.getElementById('mixed_cables_container');
const btnAddMixedRow = document.getElementById('btnAddMixedRow');
const groupConduitSize = document.getElementById('group_conduit_size');

const errCableNumber = document.getElementById('err_cable_number');
const errCableDiameter = document.getElementById('err_cable_diameter');
const errMixed = document.getElementById('err_mixed');

const resultLabel = document.getElementById('result_label');
const resultOutput = document.getElementById('result_output');
const resultDetail = document.getElementById('result_detail');
const cecWarningContainer = document.getElementById('cec_warning_container');
const canvas = document.getElementById('crossSectionCanvas');
const ctx = canvas.getContext('2d');

function initMixedRows() {
  mixedCablesContainer.innerHTML = '';
  addMixedRow(2, 10, 'mm');
  addMixedRow(1, 6, 'mm');
}

function addMixedRow(qty = 1, dia = 10, unit = 'mm') {
  const rowDiv = document.createElement('div');
  rowDiv.className = 'mixed-row';
  rowDiv.innerHTML = `
    <div class="mixed-field">
      <label>Quantity</label>
      <input type="number" class="mixed-qty" min="1" max="200" value="${qty}" step="1">
    </div>
    <div class="mixed-field">
      <label>Diameter</label>
      <input type="number" class="mixed-dia" min="0.01" step="0.01" value="${dia}">
    </div>
    <div class="mixed-field">
      <label>Unit</label>
      <select class="mixed-unit">
        <option value="mm" ${unit === 'mm' ? 'selected' : ''}>mm</option>
        <option value="inch" ${unit === 'inch' ? 'selected' : ''}>inch</option>
      </select>
    </div>
    <button type="button" class="btn-delete">Remove</button>
  `;

  rowDiv.querySelector('.btn-delete').addEventListener('click', () => {
    if (mixedCablesContainer.children.length > 1) {
      rowDiv.remove();
      calculate();
    }
  });

  rowDiv.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  mixedCablesContainer.appendChild(rowDiv);
  calculate();
}

btnAddMixedRow.addEventListener('click', () => {
  addMixedRow(1, 8, 'mm');
});

function getAllowableArea(conduitIndex, cableCount) {
  const row = CONDUIT_DATA[conduitIndex];
  if (cableCount === 1) return row.area1;
  if (cableCount === 2) return row.area2;
  return row.area3;
}

function getSelectedMode() {
  return document.querySelector('input[name="calc_mode"]:checked').value;
}

function highlightTableRow(index) {
  document.querySelectorAll('#ref_table_body tr').forEach(r => r.classList.remove('highlight-row'));
  if (index >= 0 && index < CONDUIT_DATA.length) {
    const row = document.getElementById(`table-row-${index}`);
    if (row) row.classList.add('highlight-row');
  }
}

function updateVisibility() {
  const mode = getSelectedMode();

  singleInputsWrapper.classList.remove('hidden');
  groupCableNumber.classList.remove('hidden');
  groupCableDiameter.classList.remove('hidden');
  groupMixedCables.classList.add('hidden');
  groupConduitSize.classList.add('hidden');

  if (mode === 'conduit_single') {
    singleInputsWrapper.classList.remove('hidden');
    resultLabel.textContent = 'Minimum Conduit Size';
  } else if (mode === 'conduit_mixed') {
    singleInputsWrapper.classList.add('hidden');
    groupMixedCables.classList.remove('hidden');
    resultLabel.textContent = 'Minimum Conduit Size (Mixed)';
  } else if (mode === 'cables') {
    singleInputsWrapper.classList.remove('hidden');
    groupCableNumber.classList.add('hidden');
    groupConduitSize.classList.remove('hidden');
    resultLabel.textContent = 'Max Number of Cables';
  } else if (mode === 'diameter') {
    singleInputsWrapper.classList.remove('hidden');
    groupCableDiameter.classList.add('hidden');
    groupConduitSize.classList.remove('hidden');
    resultLabel.textContent = 'Max Cable Diameter';
  }

  calculate();
}

function calculate() {
  cecWarningContainer.innerHTML = '';
  const mode = getSelectedMode();

  if (mode === 'conduit_single') {
    const unit = cableUnitSelect.value;
    let numCables = parseInt(cableNumberInput.value, 10);
    let dia = parseFloat(cableDiameterInput.value);

    let valid = true;
    if (isNaN(numCables) || numCables < 1 || numCables > 200) {
      errCableNumber.style.display = 'block';
      valid = false;
    } else {
      errCableNumber.style.display = 'none';
    }

    if (isNaN(dia) || dia <= 0) {
      errCableDiameter.style.display = 'block';
      valid = false;
    } else {
      errCableDiameter.style.display = 'none';
    }

    if (!valid) {
      resultOutput.textContent = '--';
      resultDetail.textContent = 'Please fix input errors above.';
      highlightTableRow(-1);
      drawCrossSectionSingle(0, 0, 0);
      return;
    }

    let diaMM = (unit === 'inch') ? dia * 25.4 : dia;
    const singleArea = Math.PI * Math.pow(diaMM / 2, 2);
    const totalArea = numCables * singleArea;

    let foundIndex = -1;
    for (let i = 0; i < CONDUIT_DATA.length; i++) {
      if (getAllowableArea(i, numCables) >= totalArea) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      const c = CONDUIT_DATA[foundIndex];
      resultOutput.textContent = `${c.metric} mm (${c.trade})`;
      resultDetail.innerHTML = `
        Total Cable Area: <strong>${totalArea.toFixed(1)} mm²</strong><br>
        Allowable Area: <strong>${getAllowableArea(foundIndex, numCables).toFixed(1)} mm²</strong>
      `;
      highlightTableRow(foundIndex);
      drawCrossSectionSingle(foundIndex, numCables, diaMM);
    } else {
      resultOutput.textContent = 'Exceeds Standard EMT';
      resultDetail.textContent = 'Required area exceeds maximum standard EMT capacity.';
      highlightTableRow(-1);
      drawCrossSectionSingle(CONDUIT_DATA.length - 1, numCables, diaMM);
    }

  } else if (mode === 'conduit_mixed') {
    let totalCount = 0;
    let totalArea = 0;
    let mixedList = [];
    let valid = true;

    const rows = mixedCablesContainer.querySelectorAll('.mixed-row');
    rows.forEach(r => {
      const qty = parseInt(r.querySelector('.mixed-qty').value, 10);
      const dia = parseFloat(r.querySelector('.mixed-dia').value);
      const unit = r.querySelector('.mixed-unit').value;

      if (isNaN(qty) || qty < 1 || isNaN(dia) || dia <= 0) {
        valid = false;
      } else {
        totalCount += qty;
        const diaMM = (unit === 'inch') ? dia * 25.4 : dia;
        const area = qty * Math.PI * Math.pow(diaMM / 2, 2);
        totalArea += area;
        mixedList.push({ qty, diaMM });
      }
    });

    if (!valid || totalCount > 200 || totalCount < 1) {
      errMixed.style.display = 'block';
      resultOutput.textContent = '--';
      resultDetail.textContent = 'Please check mixed cable quantities and diameters.';
      highlightTableRow(-1);
      drawCrossSectionMixed(0, []);
      return;
    } else {
      errMixed.style.display = 'none';
    }

    let foundIndex = -1;
    for (let i = 0; i < CONDUIT_DATA.length; i++) {
      if (getAllowableArea(i, totalCount) >= totalArea) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      const c = CONDUIT_DATA[foundIndex];
      resultOutput.textContent = `${c.metric} mm (${c.trade})`;
      resultDetail.innerHTML = `
        Total Cables: <strong>${totalCount}</strong> | Total Area: <strong>${totalArea.toFixed(1)} mm²</strong><br>
        Allowable Area (${totalCount === 1 ? '53%' : totalCount === 2 ? '31%' : '40%'}): <strong>${getAllowableArea(foundIndex, totalCount).toFixed(1)} mm²</strong>
      `;
      highlightTableRow(foundIndex);
      drawCrossSectionMixed(foundIndex, mixedList);
    } else {
      resultOutput.textContent = 'Exceeds Standard EMT';
      resultDetail.textContent = 'Required area exceeds maximum standard EMT capacity.';
      highlightTableRow(-1);
      drawCrossSectionMixed(CONDUIT_DATA.length - 1, mixedList);
    }

  } else if (mode === 'cables') {
    const conduitIdx = parseInt(conduitSizeSelect.value, 10);
    const unit = cableUnitSelect.value;
    let dia = parseFloat(cableDiameterInput.value);

    if (isNaN(dia) || dia <= 0) {
      errCableDiameter.style.display = 'block';
      resultOutput.textContent = '--';
      return;
    } else {
      errCableDiameter.style.display = 'none';
    }

    let diaMM = (unit === 'inch') ? dia * 25.4 : dia;
    const singleArea = Math.PI * Math.pow(diaMM / 2, 2);

    let maxCount = 0;
    for (let count = 1; count <= 200; count++) {
      if (count * singleArea <= getAllowableArea(conduitIdx, count)) {
        maxCount = count;
      } else {
        break;
      }
    }

    if (maxCount >= 200) {
      maxCount = 200;
      cecWarningContainer.innerHTML = '<span class="cec-badge">CEC Limit Reached (200 Cables Max)</span>';
    }

    const c = CONDUIT_DATA[conduitIdx];
    resultOutput.textContent = `${maxCount} Cables`;
    resultDetail.innerHTML = `
      Conduit: <strong>${c.metric} mm (${c.trade})</strong><br>
      Cable Dia: <strong>${dia} ${unit}</strong>
    `;
    highlightTableRow(conduitIdx);
    drawCrossSectionSingle(conduitIdx, maxCount, diaMM);

  } else if (mode === 'diameter') {
    const conduitIdx = parseInt(conduitSizeSelect.value, 10);
    const unit = cableUnitSelect.value;
    let numCables = parseInt(cableNumberInput.value, 10);

    if (isNaN(numCables) || numCables < 1 || numCables > 200) {
      errCableNumber.style.display = 'block';
      resultOutput.textContent = '--';
      return;
    } else {
      errCableNumber.style.display = 'none';
    }

    const allowArea = getAllowableArea(conduitIdx, numCables);
    const maxSingleArea = allowArea / numCables;
    const maxDiaMM = 2 * Math.sqrt(maxSingleArea / Math.PI);
    const displayDia = (unit === 'inch') ? (maxDiaMM / 25.4) : maxDiaMM;

    const c = CONDUIT_DATA[conduitIdx];
    resultOutput.textContent = `${displayDia.toFixed(2)} ${unit}`;
    resultDetail.innerHTML = `
      Conduit: <strong>${c.metric} mm (${c.trade})</strong><br>
      Number of Cables: <strong>${numCables}</strong>
    `;
    highlightTableRow(conduitIdx);
    drawCrossSectionSingle(conduitIdx, numCables, maxDiaMM);
  }
}

function drawCrossSectionSingle(conduitIndex, count, cableDiaMM) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const canvasRadius = 90;

  ctx.beginPath();
  ctx.arc(centerX, centerY, canvasRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  if (count <= 0 || cableDiaMM <= 0) return;

  const total100PercentArea = CONDUIT_DATA[conduitIndex].area1 / 0.53;
  const conduitInnerRadiusMM = Math.sqrt(total100PercentArea / Math.PI);
  const scale = canvasRadius / conduitInnerRadiusMM;
  const r = (cableDiaMM / 2) * scale;

  let individualCables = [];
  for (let i = 0; i < count; i++) {
    individualCables.push(r);
  }

  const placedCables = [];
  const safetyGap = 1.0;

  individualCables.forEach((radius, idx) => {
    if (idx === 0) {
      const maxFloorY = canvasRadius - radius - 4;
      placedCables.push({ x: centerX, y: centerY + (maxFloorY * 0.3), r: radius });
    } else {
      let bestX = centerX;
      let bestY = centerY + canvasRadius;
      let found = false;

      for (let testY = centerY + canvasRadius - radius - 2; testY >= centerY - canvasRadius + radius + 2 && !found; testY -= 1) {
        for (let testX = centerX - canvasRadius + radius + 2; testX <= centerX + canvasRadius - radius - 2 && !found; testX += 1) {
          
          const distFromCenter = Math.sqrt(Math.pow(testX - centerX, 2) + Math.pow(testY - centerY, 2));
          if (distFromCenter + radius > canvasRadius - 1) continue;

          let collision = false;
          for (let p of placedCables) {
            const d = Math.sqrt(Math.pow(testX - p.x, 2) + Math.pow(testY - p.y, 2));
            if (d < radius + p.r + safetyGap) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            bestX = testX;
            bestY = testY;
            found = true;
          }
        }
      }

      if (found) {
        placedCables.push({ x: bestX, y: bestY, r: radius });
      } else {
        placedCables.push({ x: centerX + (Math.random() - 0.5) * 10, y: centerY + (Math.random() - 0.5) * 10, r: radius });
      }
    }
  });

  placedCables.forEach(c => {
    drawCableCircle(c.x, c.y, c.r);
  });
}

function drawCrossSectionMixed(conduitIndex, mixedList) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const canvasRadius = 90;

  ctx.beginPath();
  ctx.arc(centerX, centerY, canvasRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  if (mixedList.length === 0) return;

  const total100PercentArea = CONDUIT_DATA[conduitIndex].area1 / 0.53;
  const conduitInnerRadiusMM = Math.sqrt(total100PercentArea / Math.PI);
  const scale = canvasRadius / conduitInnerRadiusMM;

  let individualCables = [];
  mixedList.forEach(item => {
    for (let i = 0; i < item.qty; i++) {
      individualCables.push((item.diaMM / 2) * scale);
    }
  });
  individualCables.sort((a, b) => b - a);

  const placedCables = [];
  const safetyGap = 1.0;

  individualCables.forEach((r, idx) => {
    if (idx === 0) {
      const maxFloorY = canvasRadius - r - 4;
      placedCables.push({ x: centerX, y: centerY + (maxFloorY * 0.3), r });
    } else {
      let bestX = centerX;
      let bestY = centerY + canvasRadius;
      let found = false;

      for (let testY = centerY + canvasRadius - r - 2; testY >= centerY - canvasRadius + r + 2 && !found; testY -= 1) {
        for (let testX = centerX - canvasRadius + r + 2; testX <= centerX + canvasRadius - r - 2 && !found; testX += 1) {
          
          const distFromCenter = Math.sqrt(Math.pow(testX - centerX, 2) + Math.pow(testY - centerY, 2));
          if (distFromCenter + r > canvasRadius - 1) continue;

          let collision = false;
          for (let p of placedCables) {
            const d = Math.sqrt(Math.pow(testX - p.x, 2) + Math.pow(testY - p.y, 2));
            if (d < r + p.r + safetyGap) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            bestX = testX;
            bestY = testY;
            found = true;
          }
        }
      }

      if (found) {
        placedCables.push({ x: bestX, y: bestY, r });
      } else {
        placedCables.push({ x: centerX + (Math.random() - 0.5) * 10, y: centerY + (Math.random() - 0.5) * 10, r });
      }
    }
  });

  placedCables.forEach(c => {
    drawCableCircle(c.x, c.y, c.r);
  });
}

function drawCableCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, r), 0, 2 * Math.PI);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#78350f';
  ctx.stroke();

  if (r > 4) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#b45309';
    ctx.fill();
  }
}

document.querySelectorAll('input[name="calc_mode"]').forEach(radio => {
  radio.addEventListener('change', updateVisibility);
});

cableNumberInput.addEventListener('input', calculate);
cableDiameterInput.addEventListener('input', calculate);
cableUnitSelect.addEventListener('change', calculate);
conduitSizeSelect.addEventListener('change', calculate);

initMixedRows();
updateVisibility();
