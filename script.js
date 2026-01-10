const STORAGE_KEY = "row-wheel-state";

const setupScreen = document.getElementById("setup-screen");
const wheelScreen = document.getElementById("wheel-screen");
const cycleInput = document.getElementById("cycle-length");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const doneStack = document.getElementById("done-stack");
const futureStack = document.getElementById("future-stack");
const activeSlot = document.getElementById("active-slot");
const statusText = document.getElementById("status-text");

let state = {
  length: 0,
  specialType: "add",
  position: 0,
  active: false
};

function buildTiles(length, specialType) {
  const specialLabel = specialType === "reduce" ? "−" : "+";
  return Array.from({ length }, (_, index) => ({
    label: index === 0 ? specialLabel : String(index)
  }));
}

function showSetup() {
  setupScreen.classList.add("active");
  wheelScreen.classList.remove("active");
}

function showWheel() {
  setupScreen.classList.remove("active");
  wheelScreen.classList.add("active");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    showSetup();
    return;
  }

  state = JSON.parse(saved);
  showWheel();
  renderWheel();
}

function orderedTiles() {
  const tiles = buildTiles(state.length, state.specialType);
  return tiles.map((_, index) => tiles[(state.position + index) % state.length]);
}

function renderTile(tileData, options = {}) {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  tile.textContent = tileData.label;

  if (options.stateClass) {
    tile.classList.add(options.stateClass);
  }

  if (options.isClickable) {
    tile.classList.add("tile--clickable");
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.addEventListener("click", options.onClick);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        options.onClick();
      }
    });
  } else if (options.isDimmed !== false) {
    tile.classList.add("tile--inactive");
  }

  return tile;
}

function renderWheel() {
  doneStack.innerHTML = "";
  futureStack.innerHTML = "";
  activeSlot.querySelectorAll(".tile").forEach((tile) => tile.remove());

  const tiles = orderedTiles();
  const doneCount = state.position;
  const futureCount = state.length - 1 - doneCount;
  const futureTiles = tiles.slice(1, 1 + futureCount);
  const doneTiles = tiles.slice(1 + futureCount).reverse();

  statusText.style.display = state.active ? "none" : "block";
  statusText.textContent = "NO ROW ACTIVE";

  if (state.active) {
    const activeTile = renderTile(tiles[0], {
      stateClass: "tile--active",
      isClickable: true,
      onClick: finishRow
    });
    activeSlot.appendChild(activeTile);
  } else {
    const nextTile = renderTile(tiles[0], {
      stateClass: "tile--active",
      isClickable: true,
      onClick: startRow
    });
    futureStack.appendChild(nextTile);
  }

  doneTiles.forEach((tileData) => {
    const tile = renderTile(tileData, {
      stateClass: "tile--done",
      isClickable: false,
      isDimmed: false
    });
    doneStack.appendChild(tile);
  });

  futureTiles.forEach((tileData) => {
    const tile = renderTile(tileData, {
      isClickable: false
    });
    futureStack.appendChild(tile);
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
