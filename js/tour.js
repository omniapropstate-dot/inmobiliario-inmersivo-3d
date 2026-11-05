import { TOUR_ROOMS, TOUR_ORDER } from './data.js';

function buildScenes() {
  const scenes = {};
  for (const [id, room] of Object.entries(TOUR_ROOMS)) {
    scenes[id] = {
      type: 'equirectangular',
      panorama: room.img,
      autoLoad: true,
      compass: false,
      hotSpots: room.hotSpots.map((h) => ({
        pitch: h.pitch ?? -2,
        yaw: h.yaw,
        type: 'scene',
        sceneId: h.room,
        text: TOUR_ROOMS[h.room].titulo,
      })),
    };
  }
  return scenes;
}

export function initTour({ panoEl, switcherEl }) {
  let viewer = null;

  function renderSwitcher(activeId) {
    switcherEl.innerHTML = '';
    TOUR_ORDER.forEach((id) => {
      const btn = document.createElement('button');
      btn.textContent = TOUR_ROOMS[id].titulo;
      btn.className = id === activeId ? 'is-active' : '';
      btn.addEventListener('click', () => viewer?.loadScene(id));
      switcherEl.appendChild(btn);
    });
  }

  function start() {
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }
    viewer = window.pannellum.viewer(panoEl, {
      default: { firstScene: 'sala', sceneFadeDuration: 700, autoLoad: true },
      scenes: buildScenes(),
      showControls: false,
      compass: false,
    });
    renderSwitcher('sala');
    viewer.on('scenechange', renderSwitcher);
  }

  function stop() {
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }
  }

  return { start, stop };
}
