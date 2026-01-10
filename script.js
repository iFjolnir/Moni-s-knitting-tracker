const STORAGE_KEY = "row-wheel-state";

const setupScreen = document.getElementById("setup-screen");
const wheelScreen = document.getElementById("wheel-screen");
const cycleInput = document.getElementById("cycle-length");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const wheelTrack = document.getElementById("wheel-track");
const statusText = document.getElementById("status-text");

const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5];
const OFFSET_POSITIONS = {
  "-2": { y: -320, scale: 0.64 },
  "-1": { y: -210, scale: 0.74 },
  "0": { y: 0, scale: 1.08 },
  "1": { y: 210, scale: 0.78 },
  "2": { y: 330, scale: 0.72 },
  "3": { y: 440, scale: 0.68 },
  "4": { y: 540, scale: 0.64 },
  "5": { y: 640, scale: 0.6 }
};

let state = {
  length: 0,
  specialType: "add",
  position: 0,
  active: false
};

function safeModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

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

function applyTileTransform(tile, offset) {
  const settings = OFFSET_POSITIONS[offset];
  if (!settings) return;

  tile.style.setProperty(
    "--tile-transform",
    `translate(-50%, -50%) translateY(${settings.y}px) scale(${settings.scale})`
  );
  tile.style.zIndex = String(10 - Math.abs(offset));
}

function renderWheel() {
  wheelTrack.innerHTML = "";

  const tiles = orderedTiles();

  statusText.style.display = state.active ? "none" : "block";
  statusText.textContent = "NO ROW ACTIVE";

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
