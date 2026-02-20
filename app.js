const mapPresets = [
  {
    name: "노을 해변",
    gradient: "linear-gradient(120deg, #fecaca, #fef3c7, #bae6fd)",
  },
  {
    name: "숲속 트레일",
    gradient: "linear-gradient(120deg, #bbf7d0, #86efac, #4ade80)",
  },
  {
    name: "네온 시티",
    gradient: "linear-gradient(120deg, #c4b5fd, #818cf8, #22d3ee)",
  },
  {
    name: "사막 루트",
    gradient: "linear-gradient(120deg, #fed7aa, #fdba74, #f59e0b)",
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
};

function randomMap() {
  const pick = mapPresets[Math.floor(Math.random() * mapPresets.length)];
  state.currentMap = pick;
  els.mapName.textContent = `맵: ${pick.name}`;
  els.raceTrack.style.backgroundImage = pick.gradient;
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
  els.runner.style.transform = "translateX(0)";
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

  const trackWidth = els.raceTrack.clientWidth - 76;
  const distance = Math.max(0, trackWidth * ratio);
  els.runner.style.transform = `translateX(${distance}px)`;

  if (ratio >= 1) {
    state.active = false;
    els.runner.classList.remove("running");
    els.message.textContent = "🎉 골인! 목표 걸음 수를 달성했어요.";
  } else {
    els.message.textContent = `달리는 중... ${state.goal - state.steps} 걸음 남았어요!`;
  }
}

function startRace() {
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
    els.message.textContent = "이 기기는 모션 센서를 지원하지 않아요. 테스트 버튼을 사용해 주세요.";
    return;
  }

  try {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== "granted") {
        els.message.textContent = "센서 권한이 거부되어 자동 감지를 사용할 수 없어요.";
        return;
      }
    }

    window.addEventListener("devicemotion", handleMotion, { passive: true });
    els.motionBtn.disabled = true;
    els.message.textContent = "센서 연결 완료! 걸으면 자동으로 걸음 수가 올라가요.";
  } catch (error) {
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
initPwaInstall();
registerServiceWorker();
