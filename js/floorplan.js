import { BUILDING, precioUnidad } from './data.js';

let svgLoaded = false;

async function ensureSvg(container) {
  if (svgLoaded) return;
  const res = await fetch('inmersivo/layouts/planta-piso.svg');
  container.innerHTML = await res.text();
  svgLoaded = true;
}

function formatPrecio(n) {
  return '$us ' + n.toLocaleString('es-BO');
}

export async function initFloorplan({ svgContainer, panel, onUnitSelected }) {
  await ensureSvg(svgContainer);

  const units = svgContainer.querySelectorAll('.unit');
  let activeUnit = null;
  let currentPiso = BUILDING.pisoBase;

  function renderPanel(letra) {
    const unit = BUILDING.unidades[letra];
    const precio = precioUnidad(letra, currentPiso);
    panel.innerHTML = `
      <h3 class="unit-panel__title">Depto ${letra}</h3>
      <p class="unit-panel__stats">PISO ${currentPiso} · ${unit.m2} M² · ${unit.dormitorios} DORM.</p>
      <img class="unit-panel__layout" src="${unit.layout}" alt="Layout depto ${letra}">
      <p class="unit-panel__price">Desde ${formatPrecio(precio)}</p>
      <button class="unit-panel__cta" id="btn-enter-unit">Entrar al depto ›</button>
    `;
    panel.querySelector('#btn-enter-unit').addEventListener('click', () => {
      onUnitSelected(letra, currentPiso);
    });
  }

  function clearPanel() {
    panel.innerHTML = '<p class="unit-panel__empty">Pasá el cursor sobre un departamento</p>';
  }

  units.forEach((unit) => {
    const letra = unit.dataset.unit;
    unit.addEventListener('mouseenter', () => {
      if (activeUnit) activeUnit.classList.remove('is-active');
      activeUnit = unit;
      unit.classList.add('is-active');
      renderPanel(letra);
    });
    unit.addEventListener('click', () => onUnitSelected(letra, currentPiso));
    unit.addEventListener('focus', () => renderPanel(letra));
  });

  const wrap = svgContainer.closest('.floorplan-wrap') || svgContainer;
  wrap.addEventListener('mouseleave', () => {
    if (activeUnit) activeUnit.classList.remove('is-active');
    activeUnit = null;
    clearPanel();
  });

  return {
    setPiso(piso) {
      currentPiso = piso;
      clearPanel();
    },
  };
}
