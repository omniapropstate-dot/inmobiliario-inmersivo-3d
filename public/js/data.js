export const BUILDING = {
  nombre: 'Edificio Mirador',
  pisosTotales: 8,
  pisoBase: 2,
  unidades: {
    A: { tipo: 'a', m2: 72, dormitorios: 2, layout: 'inmersivo/layouts/depto-a.svg', precioBase: 620000 },
    B: { tipo: 'b', m2: 48, dormitorios: 1, layout: 'inmersivo/layouts/depto-b.svg', precioBase: 410000 },
    C: { tipo: 'a', m2: 72, dormitorios: 2, layout: 'inmersivo/layouts/depto-a.svg', precioBase: 620000 },
    D: { tipo: 'b', m2: 48, dormitorios: 1, layout: 'inmersivo/layouts/depto-b.svg', precioBase: 410000 },
  },
};

export function precioUnidad(letra, piso) {
  const u = BUILDING.unidades[letra];
  const factor = 1 + 0.015 * (piso - BUILDING.pisoBase);
  return Math.round((u.precioBase * factor) / 1000) * 1000;
}

export const TOUR_ROOMS = {
  sala: {
    titulo: 'Sala',
    img: 'inmersivo/fotos/sala.jpg',
    hotSpots: [
      { yaw: 40, room: 'dormitorio' },
      { yaw: 160, room: 'estudio' },
    ],
  },
  dormitorio: {
    titulo: 'Dormitorio principal',
    img: 'inmersivo/fotos/dormitorio.jpg',
    hotSpots: [
      { yaw: -120, room: 'sala' },
      { yaw: 10, room: 'bano' },
    ],
  },
  bano: {
    titulo: 'Baño',
    img: 'inmersivo/fotos/bano.jpg',
    hotSpots: [{ yaw: 180, room: 'dormitorio' }],
  },
  estudio: {
    titulo: 'Dormitorio secundario',
    img: 'inmersivo/fotos/estudio.jpg',
    hotSpots: [{ yaw: -20, room: 'sala' }],
  },
};

export const TOUR_ORDER = ['sala', 'dormitorio', 'bano', 'estudio'];
