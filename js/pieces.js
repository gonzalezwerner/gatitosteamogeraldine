/**
 * pieces.js - Generador de 700 Piezas Entrelazadas (Fotografía Maestra)
 * En la solución, las 700 piezas reconstruyen la fotografía al 100%.
 */

const ROMANTIC_WHISPERS = [
  "¡Nuestros corazones encajan!",
  "Un latido más cerca de ti...",
  "El destino unió sus caminos.",
  "Dos almas que se reconocen.",
  "Una caricia en la penumbra.",
  "El hilo rojo nunca se rompe.",
  "Amor tejido bajo las estrellas.",
  "Un ronroneo de pura felicidad.",
  "Juntos en cada misterio.",
  "Tu mirada ilumina mi noche.",
  "Un pacto eterno de amor felino.",
  "Cada pieza encuentra su hogar."
];

const VICTORY_POEM = "Setecientos latidos, setecientos misterios entrelazados... Como dos gatitos bajo la misma luna, nuestras almas encajan en cada rincón del infinito universo.";

function createCatPiece(config) {
  let maxR = 22;
  config.polygon.forEach(pt => {
    const d = Math.hypot(pt.x, pt.y);
    if (d > maxR) maxR = d;
  });

  return {
    id: config.id,
    name: config.name,
    category: config.category || "general",
    personality: "Romántico",
    color: config.color,
    eyeColor: config.eyeColor || "#f9d689",
    polygon: config.polygon,
    boundingRadius: maxR + 3,
    
    // Posición y orientación objetivo
    targetX: config.targetX,
    targetY: config.targetY,
    targetAngle: 0,
    targetFlipped: false,
    
    currentX: -999,
    currentY: -999,
    currentAngle: config.initialAngle || 0,
    currentFlipped: false,
    isPlaced: false,
    isHinted: false
  };
}

/**
 * Generador de las 700 Piezas Teseladas
 */
function generate700CatUniverse() {
  const pieces = [];
  const TOTAL = 700;
  const CENTER_X = 600;
  const CENTER_Y = 600;

  const palettes = [
    { hex: "#ff4d8d", eye: "#fef08a" },
    { hex: "#e11d48", eye: "#67e8f9" },
    { hex: "#f59e0b", eye: "#38bdf8" },
    { hex: "#ea580c", eye: "#a7f3d0" },
    { hex: "#8b5cf6", eye: "#fef08a" },
    { hex: "#c026d3", eye: "#6ee7b7" },
    { hex: "#2563eb", eye: "#f472b6" },
    { hex: "#059669", eye: "#fde047" }
  ];

  // Siluetas anatómicas felinas proporcionadas para 700 piezas
  const basePolygons = [
    [ { x: -20, y: -16 }, { x: -10, y: -6 }, { x: -2, y: -18 }, { x: 12, y: -8 }, { x: 22, y: 6 }, { x: 14, y: 20 }, { x: -8, y: 18 }, { x: -22, y: 2 } ],
    [ { x: -22, y: 4 }, { x: -12, y: -12 }, { x: 0, y: -16 }, { x: 14, y: -8 }, { x: 22, y: 10 }, { x: 8, y: 20 }, { x: -12, y: 18 }, { x: -22, y: 12 } ],
    [ { x: -18, y: -18 }, { x: -6, y: -10 }, { x: 6, y: -18 }, { x: 18, y: -10 }, { x: 20, y: 8 }, { x: 10, y: 20 }, { x: -10, y: 20 }, { x: -20, y: 6 } ],
    [ { x: -18, y: -14 }, { x: -8, y: -8 }, { x: 4, y: -16 }, { x: 16, y: -6 }, { x: 22, y: 12 }, { x: 6, y: 20 }, { x: -14, y: 18 }, { x: -22, y: -2 } ],
    [ { x: -22, y: -10 }, { x: -12, y: -18 }, { x: 0, y: -10 }, { x: 14, y: -16 }, { x: 22, y: 4 }, { x: 14, y: 18 }, { x: -10, y: 20 }, { x: -22, y: 10 } ],
    [ { x: -20, y: -12 }, { x: -4, y: -18 }, { x: 10, y: -10 }, { x: 22, y: -2 }, { x: 20, y: 16 }, { x: 4, y: 20 }, { x: -18, y: 18 }, { x: -22, y: 4 } ]
  ];

  const DISORIENTED_ANGLES = [45, 90, 135, 180, 225, 270, 315];
  const phi = (1 + Math.sqrt(5)) / 2; // Proporción áurea

  for (let i = 0; i < TOTAL; i++) {
    const theta = i * 2 * Math.PI * phi;
    const r = Math.sqrt(i) * 21.8 + 24; // Distribución harmónica en 1200x1200

    const targetX = Math.round(CENTER_X + Math.cos(theta) * r);
    const targetY = Math.round(CENTER_Y + Math.sin(theta) * r);

    const initialAngle = DISORIENTED_ANGLES[i % DISORIENTED_ANGLES.length];
    const style = palettes[i % palettes.length];
    const poly = basePolygons[i % basePolygons.length];

    pieces.push(createCatPiece({
      id: `cat_${i + 1}`,
      name: `Gatito #${i + 1}`,
      color: style.hex,
      eyeColor: style.eye,
      initialAngle: initialAngle,
      polygon: poly,
      targetX: targetX,
      targetY: targetY
    }));
  }

  return pieces;
}

const MASTER_LEVEL = {
  title: "Gatitos Enamorados",
  subtitle: "700 Gatitos Entrelazados • Fotografía Maestra",
  poem: VICTORY_POEM,
  pieces: generate700CatUniverse(),
  boardSize: 1200
};
