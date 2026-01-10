// ====================
// STATE
// ====================
let state = {
  tiles: [],        // ordered wheel
  active: false     // whether the first tile is active
};

// ====================
// ELEMENTS
// ====================
const setupScreen = document.getElementById("setup-screen");
const wheelScreen = document.getElementById("wheel-screen");

const cycleInput = document.getElementById("cycle-length");
const startBtn = document.getElementById("start-btn");

const doneStack = document.getElementById("done-stack");
const futureStack = document.getElementById("future-stack");
const statusText = document.getElementById("status-text");

// ====================
// INIT
// ====================
startBtn.addEventListener("click", () => {
  const length = parseInt(cycleInput.value, 10);
  if (!length || length < 2) return;

  // build the wheel
  state.tiles = [];
  for (let i = 0; i < length; i++) {
    state.tiles.push({
      label: i === 0 ? "+" : String(i)
    });
  }

  state.active = false;
  saveState();
  showWheel();
  renderWheel();
});

// ====================
// SCREEN SWITCH
// ====================
function showWheel() {
  setupScreen.classList.remove("active");
  wheelScreen.classList.add("active");
}

// ====================
// RENDER
// ====================
function renderWheel() {
  doneStack.innerHTML = "";
  futureStack.innerHTML = "";

  if (!state.active) {
    statusText.textContent = "NO ROW ACTIVE";
  } else {
    statusText.textContent = "";
  }

  state.tiles.forEach((tileData, index) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.textContent = tileData.label;

    // FIRST TILE = current position in the wheel
    if (index === 0 && state.active) {
      tile.classList.add("active");
      tile.addEventListener("click", finishRow);
      doneStack.appendChild(tile);
    } 
    else if (index === 0 && !state.active) {
      tile.addEventListener("click", startRow);
      futureStack.appendChild(tile);
    } 
    else {
      futureStack.appendChild(tile);
    }
  });
}

// ====================
// ACTIONS
// ====================
function startRow() {
  state.active = true;
  saveState();
  renderWheel();
}

function finishRow() {
  const finished = state.tiles.shift(); // remove first tile
  state.tiles.push(finished);           // send it to the end
  state.active = false;                 // pause
  saveState();
  renderWheel();
}

// ====================
// STORAGE
// ====================
function saveState() {
  localStorage.setItem("row-wheel-state", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("row-wheel-state");
  if (!saved) return;

  state = JSON.parse(saved);
  showWheel();
  renderWheel();
}

loadState();
