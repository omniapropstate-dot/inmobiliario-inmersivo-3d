import { createBuildingScene } from './building.js';
import { initFloorplan } from './floorplan.js';
import { initTour } from './tour.js';

const stages = {
  building: document.getElementById('stage-building'),
  floorplan: document.getElementById('stage-floorplan'),
  interior: document.getElementById('stage-interior'),
};
const stageLabel = document.getElementById('stage-label');
const breadcrumbEl = document.getElementById('breadcrumb');
const hint = document.getElementById('building-hint');
const defaultHint = hint.textContent;

let currentPiso = null;
let currentUnit = null;

function showStage(name) {
  Object.values(stages).forEach((el) => el.classList.remove('is-active'));
  stages[name].classList.add('is-active');
}

function renderBreadcrumb() {
  const path = [{ label: 'Edificio', go: 'building' }];
  if (currentPiso) path.push({ label: `Piso ${currentPiso}`, go: 'floorplan' });
  if (currentUnit) path.push({ label: `Depto ${currentUnit}`, go: 'interior' });

  breadcrumbEl.innerHTML = '';
  path.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'breadcrumb__item' + (i === path.length - 1 ? ' is-active' : '');
    btn.textContent = item.label;
    btn.addEventListener('click', () => goTo(item.go));
    breadcrumbEl.appendChild(btn);
  });
}

function goTo(stageName) {
  if (stageName === 'building') {
    tour.stop();
    building.resetView();
    currentPiso = null;
    currentUnit = null;
    stageLabel.textContent = 'Vista exterior';
  } else if (stageName === 'floorplan') {
    tour.stop();
    currentUnit = null;
    stageLabel.textContent = `Planta · piso ${currentPiso}`;
  } else if (stageName === 'interior') {
    stageLabel.textContent = `Depto ${currentUnit} · piso ${currentPiso}`;
  }
  renderBreadcrumb();
  showStage(stageName);
}

const building = createBuildingScene(document.getElementById('building-canvas'), {
  onFloorHover(piso) {
    hint.textContent = piso ? `Piso ${piso} · click para ver la planta` : defaultHint;
  },
  async onFloorClick(piso) {
    hint.style.opacity = '0';
    await building.flyToFloor(piso);
    currentPiso = piso;
    floorplanApi.setPiso(piso);
    stageLabel.textContent = `Planta · piso ${piso}`;
    renderBreadcrumb();
    showStage('floorplan');
    hint.style.opacity = '1';
    building.pause();
  },
});

const tour = initTour({
  panoEl: document.getElementById('pano'),
  switcherEl: document.getElementById('room-switcher'),
});

const floorplanApi = await initFloorplan({
  svgContainer: document.getElementById('floorplan-svg'),
  panel: document.getElementById('unit-panel'),
  onUnitSelected(letra, piso) {
    currentUnit = letra;
    currentPiso = piso;
    stageLabel.textContent = `Depto ${letra} · piso ${piso}`;
    renderBreadcrumb();
    showStage('interior');
    tour.start();
  },
});

document.getElementById('btn-back-to-building').addEventListener('click', () => goTo('building'));
document.getElementById('btn-back-to-floorplan').addEventListener('click', () => goTo('floorplan'));

renderBreadcrumb();
