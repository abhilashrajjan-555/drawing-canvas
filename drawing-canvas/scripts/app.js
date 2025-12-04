const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearCanvas');
const downloadBtn = document.getElementById('downloadCanvas');
const colorButtons = document.querySelectorAll('[data-color]');
const sizeButtons = document.querySelectorAll('[data-size]');
const toolButtons = document.querySelectorAll('[data-tool]');
const fillToggle = document.getElementById('fillToggle');
const fillCanvasBtn = document.getElementById('fillCanvas');
const undoBtn = document.getElementById('undoCanvas');
const redoBtn = document.getElementById('redoCanvas');
const colorPicker = document.getElementById('customColor');
const opacitySlider = document.getElementById('opacityControl');
const opacityValue = document.getElementById('opacityValue');

let drawing = false;
let hasChanges = false;
let currentColor = '#111827';
let currentSize = 5;
let currentOpacity = 1;
let currentTool = 'freehand';
let fillShapes = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;
let snapshot = null;

const history = [];
const redoStack = [];
const MAX_HISTORY = 30;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = currentSize;
ctx.strokeStyle = currentColor;
ctx.fillStyle = currentColor;

function hexToRgba(hex, alpha = 1) {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyBrushSettings() {
  const rgba = hexToRgba(currentColor, currentOpacity);
  ctx.lineWidth = currentSize;
  ctx.strokeStyle = rgba;
  ctx.fillStyle = rgba;
}

function getCanvasPos(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const point = event.touches ? event.touches[0] : event;
  return {
    x: (point.clientX - rect.left) * scaleX,
    y: (point.clientY - rect.top) * scaleY
  };
}

function setActiveButton(buttons, active) {
  buttons.forEach((btn) => btn.classList.toggle('active', btn === active));
}

function persistCanvas() {
  try {
    const data = canvas.toDataURL('image/png');
    localStorage.setItem('canvasDrawing', data);
  } catch (error) {
    console.warn('Unable to persist canvas', error);
  }
}

function saveState() {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(imageData);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    redoStack.length = 0;
    persistCanvas();
  } catch (error) {
    console.error('Unable to capture canvas state', error);
  }
}

function restorePersistedCanvas() {
  const stored = localStorage.getItem('canvasDrawing');
  if (!stored) {
    saveState();
    return;
  }

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    saveState();
  };
  img.onerror = () => {
    console.warn('Unable to load saved drawing');
    saveState();
  };
  img.src = stored;
}

function renderShape(x, y) {
  if (!snapshot) return;
  ctx.putImageData(snapshot, 0, 0);
  applyBrushSettings();

  if (currentTool === 'line') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === 'rectangle') {
    const width = x - startX;
    const height = y - startY;
    if (fillShapes) {
      ctx.fillRect(startX, startY, width, height);
    }
    ctx.strokeRect(startX, startY, width, height);
  }
  hasChanges = true;
}

function startDrawing(event) {
  event.preventDefault();
  drawing = true;
  hasChanges = false;
  const { x, y } = getCanvasPos(event);
  startX = x;
  startY = y;
  lastX = x;
  lastY = y;
  if (currentTool !== 'freehand') {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

function draw(event) {
  if (!drawing) return;
  event.preventDefault();
  const { x, y } = getCanvasPos(event);
  if (currentTool === 'freehand') {
    applyBrushSettings();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
    hasChanges = true;
  } else {
    lastX = x;
    lastY = y;
    renderShape(x, y);
  }
}

function stopDrawing() {
  if (!drawing) return;
  drawing = false;
  if (currentTool !== 'freehand' && hasChanges) {
    renderShape(lastX, lastY);
  }
  snapshot = null;
  if (hasChanges) {
    saveState();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveState();
}

function fillCanvasArea() {
  applyBrushSettings();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
}

function undoCanvas() {
  if (history.length <= 1) return;
  const current = history.pop();
  redoStack.push(current);
  const previous = history[history.length - 1];
  ctx.putImageData(previous, 0, 0);
  persistCanvas();
}

function redoCanvas() {
  if (!redoStack.length) return;
  const image = redoStack.pop();
  history.push(image);
  ctx.putImageData(image, 0, 0);
  persistCanvas();
}

function handleShortcut(event) {
  if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
    return;
  }
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === 'z') {
    event.preventDefault();
    if (event.shiftKey) {
      redoCanvas();
    } else {
      undoCanvas();
    }
  } else if (!event.metaKey && !event.ctrlKey && key === 'c') {
    event.preventDefault();
    clearCanvas();
  }
}

colorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentColor = button.dataset.color;
    colorPicker.value = currentColor;
    setActiveButton(colorButtons, button);
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentSize = Number(button.dataset.size);
    setActiveButton(sizeButtons, button);
  });
});

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentTool = button.dataset.tool;
    setActiveButton(toolButtons, button);
  });
});

fillToggle.addEventListener('change', () => {
  fillShapes = fillToggle.checked;
});

colorPicker.addEventListener('input', () => {
  currentColor = colorPicker.value;
  setActiveButton(colorButtons, null);
});

opacitySlider.addEventListener('input', () => {
  currentOpacity = Number(opacitySlider.value);
  opacityValue.textContent = `${Math.round(currentOpacity * 100)}%`;
});

clearBtn.addEventListener('click', clearCanvas);
fillCanvasBtn.addEventListener('click', fillCanvasArea);
undoBtn.addEventListener('click', undoCanvas);
redoBtn.addEventListener('click', redoCanvas);

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'my-sketch.png';
  link.click();
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
window.addEventListener('mouseup', stopDrawing);
document.addEventListener('keydown', handleShortcut);

restorePersistedCanvas();
