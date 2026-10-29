const TIP_COLORS = [
  { name: "White", bgClass: "bg-telco-white", hex: "#FFFFFF" },
  { name: "Red", bgClass: "bg-telco-red", hex: "#EF4444" },
  { name: "Black", bgClass: "bg-telco-black", hex: "#1E293B" },
  { name: "Yellow", bgClass: "bg-telco-yellow", hex: "#EAB308" },
  { name: "Violet", bgClass: "bg-telco-violet", hex: "#A855F7" }
];

const RING_COLORS = [
  { name: "Blue", bgClass: "bg-telco-blue", hex: "#3B82F6" },
  { name: "Orange", bgClass: "bg-telco-orange", hex: "#F97316" },
  { name: "Green", bgClass: "bg-telco-green", hex: "#22C55E" },
  { name: "Brown", bgClass: "bg-telco-brown", hex: "#8B4513" },
  { name: "Slate", bgClass: "bg-telco-slate", hex: "#64748B" }
];

const SUPER_BINDER_COLORS = [
  { name: "White", bgClass: "bg-telco-white", hex: "#FFFFFF" },
  { name: "Red", bgClass: "bg-telco-red", hex: "#EF4444" },
  { name: "Black", bgClass: "bg-telco-black", hex: "#1E293B" },
  { name: "Yellow", bgClass: "bg-telco-yellow", hex: "#EAB308" },
  { name: "Violet", bgClass: "bg-telco-violet", hex: "#A855F7" },
  { name: "Blue", bgClass: "bg-telco-blue", hex: "#3B82F6" },
  { name: "Orange", bgClass: "bg-telco-orange", hex: "#F97316" },
  { name: "Green", bgClass: "bg-telco-green", hex: "#22C55E" },
  { name: "Brown", bgClass: "bg-telco-brown", hex: "#8B4513" },
  { name: "Slate", bgClass: "bg-telco-slate", hex: "#64748B" }
];

const pairInput = document.getElementById('pair_number');
const selectSuperBinder = document.getElementById('super_binder_color');
const selectBinderTip = document.getElementById('binder_tip_color');
const selectBinderRing = document.getElementById('binder_ring_color');
const selectWireTip = document.getElementById('wire_tip_color');
const selectWireRing = document.getElementById('wire_ring_color');

const validationFeedback = document.getElementById('validation_feedback');
const validationText = document.getElementById('validation_text');
const visualSummaryContent = document.getElementById('visual_summary_content');
const summaryPairNumber = document.getElementById('summary_pair_number');
const summarySuperBinder = document.getElementById('summary_super_binder');
const previewSuperBinder = document.getElementById('preview_super_binder');
const summaryBinder = document.getElementById('summary_binder');
const summaryWire = document.getElementById('summary_wire');
const previewBinderTip = document.getElementById('preview_binder_tip');
const previewBinderRing = document.getElementById('preview_binder_ring');
const renderWireTipBg = document.getElementById('render_wire_tip_bg');
const renderWireTipStripe = document.getElementById('render_wire_tip_stripe');
const renderWireRingBg = document.getElementById('render_wire_ring_bg');
const renderWireRingStripe = document.getElementById('render_wire_ring_stripe');

let isUpdating = false;

function applyDropdownStyles() {
  const sbVal = parseInt(selectSuperBinder.value, 10);
  const btVal = parseInt(selectBinderTip.value, 10);
  const brVal = parseInt(selectBinderRing.value, 10);
  const wtVal = parseInt(selectWireTip.value, 10);
  const wrVal = parseInt(selectWireRing.value, 10);

  const allBgClasses = [
    'bg-telco-white', 'bg-telco-red', 'bg-telco-black', 'bg-telco-yellow', 'bg-telco-violet',
    'bg-telco-blue', 'bg-telco-orange', 'bg-telco-green', 'bg-telco-brown', 'bg-telco-slate'
  ];

  [selectSuperBinder, selectBinderTip, selectBinderRing, selectWireTip, selectWireRing].forEach(el => {
    el.classList.remove(...allBgClasses);
  });

  selectSuperBinder.classList.add(SUPER_BINDER_COLORS[sbVal].bgClass);
  selectBinderTip.classList.add(TIP_COLORS[btVal].bgClass);
  selectBinderRing.classList.add(RING_COLORS[brVal].bgClass);
  selectWireTip.classList.add(TIP_COLORS[wtVal].bgClass);
  selectWireRing.classList.add(RING_COLORS[wrVal].bgClass);
}

function renderVisuals(pairNum) {
  visualSummaryContent.classList.remove('hidden');

  const sbVal = parseInt(selectSuperBinder.value, 10);
  const btVal = parseInt(selectBinderTip.value, 10);
  const brVal = parseInt(selectBinderRing.value, 10);
  const wtVal = parseInt(selectWireTip.value, 10);
  const wrVal = parseInt(selectWireRing.value, 10);

  const sbObj = SUPER_BINDER_COLORS[sbVal];
  const btObj = TIP_COLORS[btVal];
  const brObj = RING_COLORS[brVal];
  const wtObj = TIP_COLORS[wtVal];
  const wrObj = RING_COLORS[wrVal];

  summaryPairNumber.textContent = `Pair ${pairNum}`;
  summarySuperBinder.textContent = sbObj.name;
  previewSuperBinder.style.backgroundColor = sbObj.hex;

  summaryBinder.textContent = `${btObj.name} / ${brObj.name}`;
  summaryWire.textContent = `${wtObj.name} / ${wrObj.name}`;

  previewBinderTip.style.backgroundColor = btObj.hex;
  previewBinderRing.style.backgroundColor = brObj.hex;

  renderWireTipBg.style.backgroundColor = wtObj.hex;
  renderWireTipStripe.style.background = `repeating-linear-gradient(45deg, transparent, transparent 8px, ${wrObj.hex} 8px, ${wrObj.hex} 14px)`;

  renderWireRingBg.style.backgroundColor = wrObj.hex;
  renderWireRingStripe.style.background = `repeating-linear-gradient(45deg, transparent, transparent 8px, ${wtObj.hex} 8px, ${wtObj.hex} 14px)`;

  applyDropdownStyles();
}

function handlePairNumberInput() {
  if (isUpdating) return;
  isUpdating = true;

  const rawVal = pairInput.value.trim();
  const pair = parseInt(rawVal, 10);

  if (rawVal === "" || isNaN(pair)) {
    showValidation("Please enter a valid numeric Telco Pair number.");
    pairInput.style.borderColor = 'var(--error-color)';
    visualSummaryContent.classList.add('hidden');
    isUpdating = false;
    return;
  } else if (pair < 1 || pair > 6000) {
    showValidation("Pair number must be between 1 and 6000.");
    pairInput.style.borderColor = 'var(--error-color)';
    visualSummaryContent.classList.add('hidden');
    isUpdating = false;
    return;
  } else {
    clearValidation();
    pairInput.style.borderColor = 'var(--border-color)';
  }

  const zeroPair = pair - 1;
  const pairIn25 = zeroPair % 25;
  const wireTipIdx = Math.floor(pairIn25 / 5);
  const wireRingIdx = pairIn25 % 5;

  const binderIdx = Math.floor(zeroPair / 25) % 24;
  const binderTipIdx = Math.floor(binderIdx / 5);
  const binderRingIdx = binderIdx % 5;

  const superBinderIdx = Math.floor(zeroPair / 600);

  selectSuperBinder.value = superBinderIdx;
  selectBinderTip.value = binderTipIdx;
  selectBinderRing.value = binderRingIdx;
  selectWireTip.value = wireTipIdx;
  selectWireRing.value = wireRingIdx;

  renderVisuals(pair);
  isUpdating = false;
}

function handleDropdownChange() {
  if (isUpdating) return;
  isUpdating = true;

  const superBinderIdx = parseInt(selectSuperBinder.value, 10);
  const binderTipIdx = parseInt(selectBinderTip.value, 10);
  const binderRingIdx = parseInt(selectBinderRing.value, 10);
  const wireTipIdx = parseInt(selectWireTip.value, 10);
  const wireRingIdx = parseInt(selectWireRing.value, 10);

  if (binderTipIdx === 4 && binderRingIdx === 4) {
    showValidation("Invalid Binder: Tip (Violet) and Ring (Slate) combination does not exist.");
    pairInput.value = "";
    pairInput.style.borderColor = 'var(--error-color)';
    visualSummaryContent.classList.add('hidden');
    isUpdating = false;
    return;
  }

  const pairIn25 = (wireTipIdx * 5) + wireRingIdx + 1;
  const binderIndex = (binderTipIdx * 5) + binderRingIdx;
  const calculatedPair = (superBinderIdx * 600) + (binderIndex * 25) + pairIn25;

  pairInput.value = calculatedPair;
  clearValidation();
  pairInput.style.borderColor = 'var(--border-color)';

  renderVisuals(calculatedPair);
  isUpdating = false;
}

function showValidation(msg) {
  validationFeedback.classList.remove('hidden');
  validationFeedback.className = "validation-msg error";
  validationText.textContent = msg;
}

function clearValidation() {
  validationFeedback.classList.add('hidden');
}

pairInput.addEventListener('input', handlePairNumberInput);
pairInput.addEventListener('change', handlePairNumberInput);

selectSuperBinder.addEventListener('change', handleDropdownChange);
selectBinderTip.addEventListener('change', handleDropdownChange);
selectBinderRing.addEventListener('change', handleDropdownChange);
selectWireTip.addEventListener('change', handleDropdownChange);
selectWireRing.addEventListener('change', handleDropdownChange);

window.addEventListener('DOMContentLoaded', () => {
  handlePairNumberInput();
});
