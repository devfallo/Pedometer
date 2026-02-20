const mapPresets = [
  {
    name: "노을 해변",
    gradient: "linear-gradient(120deg, #fecaca, #fef3c7, #bae6fd)",
    pathColor: "#f97316",
    waypoints: [
      { x: 8, y: 76 },
      { x: 20, y: 65 },
      { x: 34, y: 72 },
      { x: 48, y: 60 },
      { x: 62, y: 66 },
      { x: 76, y: 54 },
      { x: 92, y: 58 },
    ],
    deco: ["🌴", "🌊", "🦀"],
  },
  {
    name: "숲속 트레일",
    gradient: "linear-gradient(120deg, #bbf7d0, #86efac, #4ade80)",
    pathColor: "#166534",
    waypoints: [
      { x: 8, y: 80 },
      { x: 18, y: 68 },
      { x: 30, y: 70 },
      { x: 42, y: 52 },
      { x: 56, y: 56 },
      { x: 70, y: 45 },
      { x: 82, y: 49 },
      { x: 92, y: 36 },
    ],
    deco: ["🌲", "🍄", "🪵"],
  },
  {
    name: "네온 시티",
    gradient: "linear-gradient(120deg, #c4b5fd, #818cf8, #22d3ee)",
    pathColor: "#1d4ed8",
    waypoints: [
      { x: 8, y: 74 },
      { x: 20, y: 74 },
      { x: 34, y: 60 },
      { x: 46, y: 60 },
      { x: 58, y: 46 },
      { x: 70, y: 46 },
      { x: 82, y: 32 },
      { x: 92, y: 32 },
    ],
    deco: ["🏙️", "🚥", "💡"],
  },
  {
    name: "사막 루트",
    gradient: "linear-gradient(120deg, #fed7aa, #fdba74, #f59e0b)",
    pathColor: "#92400e",
    waypoints: [
      { x: 8, y: 85 },
      { x: 24, y: 76 },
      { x: 36, y: 82 },
      { x: 50, y: 66 },
      { x: 66, y: 72 },
      { x: 78, y: 58 },
      { x: 92, y: 64 },
    ],
    deco: ["🌵", "🦂", "⛰️"],
  },
];

const runnerMap = {
  runner: "🏃",
  cat: "🐱",
  robot: "🤖",
  unicorn: "🦄",
};

const els = {
  goalSteps: document.getElementById("goalSteps"),
  character: document.getElementById("character"),
  startBtn: document.getElementById("startBtn"),
  newMapBtn: document.getElementById("newMapBtn"),
  motionBtn: document.getElementById("motionBtn"),
  mockStepBtn: document.getElementById("mockStepBtn"),
  mapName: document.getElementById("mapName"),
  raceTrack: document.getElementById("raceTrack"),
  racePath: document.getElementById("racePath"),
  decoLayer: document.getElementById("decoLayer"),
  finishFlag: document.getElementById("finishFlag"),
  runner: document.getElementById("runner"),
  currentSteps: document.getElementById("currentSteps"),
  goalLabel: document.getElementById("goalLabel"),
  progressBar: document.getElementById("progressBar"),
  message: document.getElementById("message"),
  installBtn: document.getElementById("installBtn"),
};

const state = {
  goal: 3000,
  steps: 0,
  active: false,
  currentMap: null,
  deferredPrompt: null,
  lastStepAt: 0,
  sensorReady: false,
  motionListenerBound: false,
};

function setRunnerPositionByRatio(ratio) {
  const points = state.currentMap?.waypoints;
  if (!points || points.length < 2) return;

  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const segmentCount = points.length - 1;
  const preciseIndex = clampedRatio * segmentCount;
  const fromIndex = Math.min(Math.floor(preciseIndex), segmentCount - 1);
  const segmentRatio = preciseIndex - fromIndex;

  const start = points[fromIndex];
  const end = points[fromIndex + 1];

  const x = start.x + (end.x - start.x) * segmentRatio;
  const y = start.y + (end.y - start.y) * segmentRatio;

  const deltaX = end.x - start.x;
  const facing = deltaX >= 0 ? 1 : -1;

  els.runner.style.left = `${x}%`;
  els.runner.style.top = `${y}%`;
  els.runner.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
}

function drawMapPath(map) {
  const pathPoints = map.waypoints.map((point) => `${point.x},${point.y}`).join(" ");
  els.racePath.setAttribute("points", pathPoints);
  els.racePath.style.stroke = map.pathColor;

  els.decoLayer.innerHTML = "";
  map.deco.forEach((emoji, idx) => {
    const marker = document.createElement("span");
    marker.className = "map-deco";
    marker.textContent = emoji;
    marker.style.left = `${15 + idx * 30}%`;
    marker.style.top = `${10 + (idx % 2 === 0 ? 8 : 0)}%`;
    els.decoLayer.appendChild(marker);
  });

  const finishPoint = map.waypoints[map.waypoints.length - 1];
  els.finishFlag.style.left = `${finishPoint.x}%`;
  els.finishFlag.style.top = `${finishPoint.y}%`;
}

function randomMap() {
  const pick = mapPresets[Math.floor(Math.random() * mapPresets.length)];
  state.currentMap = pick;
  els.mapName.textContent = `맵: ${pick.name}`;
  els.raceTrack.style.backgroundImage = pick.gradient;
  drawMapPath(pick);
  setRunnerPositionByRatio(0);
}

function setCharacter() {
  els.runner.textContent = runnerMap[els.character.value] ?? "🏃";
}

function resetRace() {
  state.steps = 0;
  state.goal = Math.max(100, Number(els.goalSteps.value) || 3000);
  els.goalLabel.textContent = String(state.goal);
  els.currentSteps.textContent = "0";
  els.progressBar.style.width = "0%";
  setRunnerPositionByRatio(0);
  els.runner.classList.add("running");
  els.message.textContent = "좋아요! 걸어서 캐릭터를 결승선까지 보내보세요.";
}

function updateProgress(stepDelta = 1) {
  if (!state.active) return;

  state.steps += stepDelta;
  const ratio = Math.min(state.steps / state.goal, 1);
  const width = Math.round(ratio * 100);

  els.currentSteps.textContent = String(state.steps);
  els.progressBar.style.width = `${width}%`;
  setRunnerPositionByRatio(ratio);

  if (ratio >= 1) {
    state.active = false;
    els.runner.classList.remove("running");
    els.message.textContent = "🎉 골인! 목표 걸음 수를 달성했어요.";
  } else {
    els.message.textContent = `달리는 중... ${state.goal - state.steps} 걸음 남았어요!`;
  }
}

function startRace() {
  if (!state.sensorReady) {
    els.message.textContent = "먼저 '센서 권한 요청'을 눌러 센서를 활성화해 주세요.";
    return;
  }

  setCharacter();
  resetRace();
  randomMap();
  state.active = true;
}

function handleMotion(event) {
  if (!state.active || !event.accelerationIncludingGravity) return;

  const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
  const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  const now = Date.now();

  if (magnitude > 13 && now - state.lastStepAt > 320) {
    state.lastStepAt = now;
    updateProgress(1);
  }
}

async function enableMotionTracking() {
  if (typeof DeviceMotionEvent === "undefined") {
    state.sensorReady = true;
    els.startBtn.disabled = false;
    els.motionBtn.disabled = true;
    els.message.textContent = "이 기기는 모션 센서를 지원하지 않아 테스트 모드로 시작해요.";
    return;
  }

  try {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== "granted") {
        state.sensorReady = false;
        els.message.textContent = "센서 권한이 거부되어 게임을 시작할 수 없어요.";
        return;
      }
    }

    if (!state.motionListenerBound) {
      window.addEventListener("devicemotion", handleMotion, { passive: true });
      state.motionListenerBound = true;
    }

    state.sensorReady = true;
    els.motionBtn.disabled = true;
    els.startBtn.disabled = false;
    els.message.textContent = "센서 연결 완료! 이제 도전 시작 버튼으로 달릴 수 있어요.";
  } catch (error) {
    state.sensorReady = false;
    els.message.textContent = `센서 권한 요청 실패: ${error.message}`;
  }
}

function initPwaInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    els.installBtn.hidden = false;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    els.installBtn.hidden = true;
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      els.message.textContent = "오프라인 기능 등록에 실패했어요.";
    });
  }
}

els.startBtn.addEventListener("click", startRace);
els.newMapBtn.addEventListener("click", randomMap);
els.character.addEventListener("change", setCharacter);
els.motionBtn.addEventListener("click", enableMotionTracking);
els.mockStepBtn.addEventListener("click", () => updateProgress(10));

setCharacter();
randomMap();
els.startBtn.disabled = true;
initPwaInstall();
registerServiceWorker();
