
// ====================
const STORAGE_KEY = "row-wheel-state";
// STATE

// ====================
const setupScreen = document.getElementById("setup-screen");
let state = {
const wheelScreen = document.getElementById("wheel-screen");
  tiles: [],        // ordered wheel
const cycleInput = document.getElementById("cycle-length");
  active: false     // whether the first tile is active
const startBtn = document.getElementById("start-btn");
};
const resetBtn = document.getElementById("reset-btn");

const wheelTrack = document.getElementById("wheel-track");
// ====================
const statusText = document.getElementById("status-text");
// ELEMENTS

// ====================
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5];
const setupScreen = document.getElementById("setup-screen");
const OFFSET_POSITIONS = {
const wheelScreen = document.getElementById("wheel-screen");
  "-2": { y: -320, scale: 0.64 },

  "-1": { y: -210, scale: 0.74 },
const cycleInput = document.getElementById("cycle-length");
  "0": { y: 0, scale: 1.08 },
const startBtn = document.getElementById("start-btn");
  "1": { y: 210, scale: 0.78 },

  "2": { y: 330, scale: 0.72 },
const doneStack = document.getElementById("done-stack");
  "3": { y: 440, scale: 0.68 },
const futureStack = document.getElementById("future-stack");
  "4": { y: 540, scale: 0.64 },
const statusText = document.getElementById("status-text");
  "5": { y: 640, scale: 0.6 }

};
// ====================

// INIT
let state = {
// ====================
  length: 0,
startBtn.addEventListener("click", () => {
  specialType: "add",
  const length = parseInt(cycleInput.value, 10);
  position: 0,
  if (!length || length < 2) return;
  active: false

};
  // build the wheel

  state.tiles = [];
function safeModulo(value, modulo) {
  for (let i = 0; i < length; i++) {
  return ((value % modulo) + modulo) % modulo;
    state.tiles.push({
}
      label: i === 0 ? "+" : String(i)

    });
function buildTiles(length, specialType) {
  }
  const specialLabel = specialType === "reduce" ? "−" : "+";

  return Array.from({ length }, (_, index) => ({
  state.active = false;
    label: index === 0 ? specialLabel : String(index)
  saveState();
  }));
  showWheel();
}
  renderWheel();

});
function showSetup() {

  setupScreen.classList.add("active");
// ====================
  wheelScreen.classList.remove("active");
// SCREEN SWITCH
}
// ====================

function showWheel() {
function showWheel() {
  setupScreen.classList.remove("active");
  setupScreen.classList.remove("active");
  wheelScreen.classList.add("active");
  wheelScreen.classList.add("active");
}
}


// ====================
function saveState() {
// RENDER
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
// ====================
}
function renderWheel() {

  doneStack.innerHTML = "";
function loadState() {
  futureStack.innerHTML = "";
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
  if (!state.active) {
    showSetup();
    statusText.textContent = "NO ROW ACTIVE";
    return;
  } else {
  }
    statusText.textContent = "";

  }
  state = JSON.parse(saved);

  showWheel();
  state.tiles.forEach((tileData, index) => {
  renderWheel();
    const tile = document.createElement("div");
}
    tile.classList.add("tile");

    tile.textContent = tileData.label;
function orderedTiles() {

  const tiles = buildTiles(state.length, state.specialType);
    // FIRST TILE = current position in the wheel
  return tiles.map((_, index) => tiles[(state.position + index) % state.length]);
    if (index === 0 && state.active) {
}
      tile.classList.add("active");

      tile.addEventListener("click", finishRow);
function renderTile(tileData, options = {}) {
      doneStack.appendChild(tile);
  const tile = document.createElement("div");
    } 
  tile.classList.add("tile");
    else if (index === 0 && !state.active) {
  tile.textContent = tileData.label;
      tile.addEventListener("click", startRow);

      futureStack.appendChild(tile);
  if (options.stateClass) {
    } 
    tile.classList.add(options.stateClass);
    else {
  }
      futureStack.appendChild(tile);

    }
  if (options.isClickable) {
  });
    tile.classList.add("tile--clickable");
}
    tile.setAttribute("role", "button");

    tile.setAttribute("tabindex", "0");
// ====================
    tile.addEventListener("click", options.onClick);
// ACTIONS
    tile.addEventListener("keydown", (event) => {
// ====================
      if (event.key === "Enter" || event.key === " ") {
function startRow() {
        event.preventDefault();
  state.active = true;
        options.onClick();
  saveState();
      }
  renderWheel();
    });
}
  } else if (options.isDimmed !== false) {

    tile.classList.add("tile--inactive");
function finishRow() {
  }
  const finished = state.tiles.shift(); // remove first tile

  state.tiles.push(finished);           // send it to the end
  return tile;
  state.active = false;                 // pause
}
  saveState();

  renderWheel();
function applyTileTransform(tile, offset) {
}
  const settings = OFFSET_POSITIONS[offset];

  if (!settings) return;
// ====================

// STORAGE
  tile.style.setProperty(
// ====================
    "--tile-transform",
function saveState() {
    `translate(-50%, -50%) translateY(${settings.y}px) scale(${settings.scale})`
  localStorage.setItem("row-wheel-state", JSON.stringify(state));
  );
}
  tile.style.zIndex = String(10 - Math.abs(offset));

}
function loadState() {

  const saved = localStorage.getItem("row-wheel-state");
function renderWheel() {
  if (!saved) return;
  wheelTrack.innerHTML = "";


  state = JSON.parse(saved);
  const tiles = orderedTiles();
  showWheel();

  renderWheel();
  statusText.style.display = state.active ? "none" : "block";
}
  statusText.textContent = "NO ROW ACTIVE";


loadState();
  VISIBLE_OFFSETS.forEach((offset) => {
    if (!state.active && offset === 0) {
      return;
    }

    let tileIndex = 0;
    if (offset < 0) {
      tileIndex = safeModulo(offset, state.length);
    } else {
      let relativeOffset = offset;
      if (!state.active) {
        relativeOffset -= 1;
      }
      tileIndex = safeModulo(relativeOffset, state.length);
    }
    const tileData = tiles[tileIndex];
    const isActive = offset === 0 && state.active;
    const isNext = offset === 1 && !state.active;

    const tile = renderTile(tileData, {
      stateClass: isActive ? "tile--active" : "",
      isClickable: isActive || isNext,
      onClick: isActive ? finishRow : isNext ? startRow : null,
      isDimmed: !isActive && !isNext
    });

    if (offset < 0) {
      tile.classList.add("tile--done");
    }

    applyTileTransform(tile, offset);
    wheelTrack.appendChild(tile);
  });
}

function startRow() {
  state.active = true;
  saveState();
  renderWheel();
}

function finishRow() {
  state.position = (state.position + 1) % state.length;
  state.active = false;
  saveState();
  renderWheel();
}

function resetWheel() {
  localStorage.removeItem(STORAGE_KEY);
  state = {
    length: 0,
    specialType: "add",
    position: 0,
    active: false
  };
  cycleInput.value = "";
  document.querySelector("input[name='special'][value='add']").checked = true;
  showSetup();
}

startBtn.addEventListener("click", () => {
  const length = Number.parseInt(cycleInput.value, 10);
  if (!length || length < 2) {
    cycleInput.focus();
    return;
  }

  const specialType = document.querySelector("input[name='special']:checked").value;

  state = {
    length,
    specialType,
    position: 0,
    active: false
  };

  saveState();
  showWheel();
  renderWheel();
});

resetBtn.addEventListener("click", resetWheel);

loadState();
