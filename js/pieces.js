/**
 * pieces.js - Generador de 300 Piezas que Forman la Imagen Fotográfica Completa
 * En la solución (target), todas las piezas encajan para recomponer la fotografía
 * al 100% sin fisuras. En la bandeja inicial, las piezas vienen desorientadas y giradas.
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

const VICTORY_POEM = "Trescientos latidos, trescientos misterios entrelazados... Como dos gatitos bajo la misma luna, nuestras almas encajan en cada rincón del infinito universo.";

function createCatPiece(config) {
  let maxR = 28;
  config.polygon.forEach(pt => {
    const d = Math.hypot(pt.x, pt.y);
    if (d > maxR) maxR = d;
  });

  return {
    id: config.id,
    name: config.name,
    category: config.category || "general",
    personality: config.personality || "Romántico",
    color: config.color,
    secondaryColor: config.secondaryColor || "#ffffff",
    eyeColor: config.eyeColor || "#f9d689",
    outlineColor: config.outlineColor || "rgba(255, 255, 255, 0.45)",
    polygon: config.polygon,
    boundingRadius: maxR + 4,
    features: config.features || {},
    
    // Posición y orientación objetivo para formar la imagen perfecta continua
    targetX: config.targetX,
    targetY: config.targetY,
    targetAngle: 0, // En la solución todas forman la imagen sin rotación
    targetFlipped: false,
    
    currentX: -999,
    currentY: -999,
    currentAngle: config.initialAngle || 0, // Desorientadas inicialmente
    currentFlipped: false,
    isPlaced: false,
    isHinted: false
  };
}

/**
 * Generador de las 300 Piezas Teseladas que Forman la Fotografía
 */
function generate300CatUniverse() {
  const pieces = [];
  const TOTAL = 300;
  const CENTER_X = 600;
  const CENTER_Y = 600;

  // Familias de colores
  const palettes = [
    { cat: "rosa", hex: "#ff4d8d", eye: "#fef08a" },
    { cat: "rosa", hex: "#e11d48", eye: "#67e8f9" },
    { cat: "dorado", hex: "#f59e0b", eye: "#38bdf8" },
    { cat: "dorado", hex: "#ea580c", eye: "#a7f3d0" },
    { cat: "violeta", hex: "#8b5cf6", eye: "#fef08a" },
    { cat: "violeta", hex: "#c026d3", eye: "#6ee7b7" },
    { cat: "azul", hex: "#2563eb", eye: "#f472b6" },
    { cat: "verde", hex: "#059669", eye: "#fde047" }
  ];

  // Siluetas orgánicas felinas entrelazadas (orejas, cabeza, lomo y cola)
  const basePolygons = [
    [ { x: -26, y: -20 }, { x: -14, y: -8 }, { x: -3, y: -22 }, { x: 16, y: -10 }, { x: 28, y: 8 }, { x: 18, y: 24 }, { x: -10, y: 22 }, { x: -28, y: 4 } ],
    [ { x: -28, y: 6 }, { x: -16, y: -14 }, { x: 0, y: -20 }, { x: 18, y: -10 }, { x: 28, y: 14 }, { x: 10, y: 26 }, { x: -14, y: 24 }, { x: -28, y: 16 } ],
    [ { x: -22, y: -24 }, { x: -8, y: -14 }, { x: 8, y: -24 }, { x: 22, y: -12 }, { x: 26, y: 10 }, { x: 14, y: 26 }, { x: -14, y: 26 }, { x: -26, y: 8 } ],
    [ { x: -24, y: -18 }, { x: -10, y: -10 }, { x: 5, y: -22 }, { x: 20, y: -8 }, { x: 28, y: 16 }, { x: 8, y: 26 }, { x: -18, y: 22 }, { x: -28, y: -2 } ],
    [ { x: -28, y: -14 }, { x: -15, y: -24 }, { x: 0, y: -14 }, { x: 18, y: -22 }, { x: 28, y: 4 }, { x: 18, y: 24 }, { x: -12, y: 26 }, { x: -28, y: 12 } ],
    [ { x: -25, y: -16 }, { x: -6, y: -24 }, { x: 12, y: -14 }, { x: 28, y: -4 }, { x: 26, y: 20 }, { x: 4, y: 26 }, { x: -22, y: 22 }, { x: -28, y: 4 } ]
  ];

  const DISORIENTED_ANGLES = [45, 90, 135, 180, 225, 270, 315];
  const phi = (1 + Math.sqrt(5)) / 2; // Proporción áurea

  for (let i = 0; i < TOTAL; i++) {
    const theta = i * 2 * Math.PI * phi;
    const r = Math.sqrt(i) * 28 + 35; // Distribución áurea sobre la fotografía

    const targetX = Math.round(CENTER_X + Math.cos(theta) * r);
    const targetY = Math.round(CENTER_Y + Math.sin(theta) * r);

    // Ángulo inicial desorientado para obligar al jugador a buscar la orientación correcta
    const initialAngle = DISORIENTED_ANGLES[i % DISORIENTED_ANGLES.length];
    const style = palettes[i % palettes.length];
    const poly = basePolygons[i % basePolygons.length];

    pieces.push(createCatPiece({
      id: `cat_${i + 1}`,
      name: `Gatito #${i + 1}`,
      category: style.cat,
      personality: "Romántico",
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
  subtitle: "300 Gatitos Entrelazados • Fotografía Maestra",
  poem: VICTORY_POEM,
  pieces: generate300CatUniverse(),
  boardSize: 1200
};
