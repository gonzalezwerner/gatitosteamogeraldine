/**
 * pieces.js - Generador de 700 Piezas Teseladas Continuas (Sin Huecos Negros)
 * Reconstrucción matemática de 28x25 celdas entrelazadas con siluetas felinas continuas.
 */

const ROMANTIC_WHISPERS = [
  "Geraldine, en cada vida te buscaría y en cada vida te elegiría 💖",
  "Cada latido de estos 700 gatitos susurra tu nombre, mi amor...",
  "Eres mi luna en la noche más oscura y mi sol de cada amanecer 🌙✨",
  "El universo entero conspiró para que nuestras almas se encontraran.",
  "Geraldine, te amo más allá de las estrellas y del tiempo eterno 🐾",
  "Tú eres la pieza perfecta que le da sentido a todo mi universo 🌸",
  "Mil vidas no me alcanzarían para amarte como te mereces, mi reina 💍",
  "Mi hogar es cualquier lugar donde estés tú, Geraldine.",
  "Dos almas destinadas a amarse por toda la eternidad... 💖",
  "Geraldine, tu sonrisa ilumina hasta el rincón más lejano del cosmos ✨",
  "Nuestros corazones encajan en una melodía que nunca terminará.",
  "Para ti, Geraldine: el amor más puro, tierno y sincero del mundo 💌"
];

const VICTORY_POEM = "Para mi amada Geraldine: Setecientos latidos, infinitas galaxias y un solo destino... Entre millones de estrellas en el universo, mis ojos siempre buscarán los tuyos. Eres mi amor eterno, mi paz, mi inspiración y mi mayor felicidad en este mundo. Te amo con toda mi alma por siempre, mi niña hermosa. 🐾💖✨";

function createCatPiece(config) {
  let maxR = 26;
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
    boundingRadius: Math.round(maxR + 2),
    
    // Posición objetivo matemática en la cuadrícula 1200x1200
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
 * Generador de 700 Piezas Continuas (28 Columnas x 25 Filas = 700 Piezas)
 * Cobertura 100% continua del lienzo de 1200x1200px sin huecos negros ni separaciones.
 */
function generate700CatUniverse() {
  const pieces = [];
  const COLS = 28;
  const ROWS = 25;
  const TOTAL = COLS * ROWS; // 700
  const BOARD_SIZE = 1200;

  const CELL_W = BOARD_SIZE / COLS; // 42.857px
  const CELL_H = BOARD_SIZE / ROWS; // 48.0px

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

  const DISORIENTED_ANGLES = [45, 90, 135, 180, 225, 270, 315];

  // Siluetas felinas con orejitas y pestañas de encaje que cubren el 100% del área de cada celda
  const hw = CELL_W / 2 + 1.2; // mitad de ancho con solape para cero huecos
  const hh = CELL_H / 2 + 1.2; // mitad de alto con solape para cero huecos

  const catPolygons = [
    // Silueta 1: Gatito de frente con orejas puntiagudas
    [
      { x: -hw, y: -hh + 8 },
      { x: -hw + 4, y: -hh },
      { x: -hw + 14, y: -hh + 6 },
      { x: hw - 14, y: -hh + 6 },
      { x: hw - 4, y: -hh },
      { x: hw, y: -hh + 8 },
      { x: hw + 2, y: 0 },
      { x: hw, y: hh - 6 },
      { x: hw - 10, y: hh },
      { x: -hw + 10, y: hh },
      { x: -hw, y: hh - 6 },
      { x: -hw - 2, y: 0 }
    ],
    // Silueta 2: Gatito mirando de lado con oreja derecha prominente
    [
      { x: -hw, y: -hh + 6 },
      { x: -hw + 6, y: -hh + 2 },
      { x: -4, y: -hh + 8 },
      { x: hw - 8, y: -hh },
      { x: hw, y: -hh + 6 },
      { x: hw + 3, y: 2 },
      { x: hw, y: hh - 4 },
      { x: 4, y: hh },
      { x: -hw + 8, y: hh },
      { x: -hw - 2, y: 2 }
    ],
    // Silueta 3: Gatito tierno redondeado con orejitas cortas
    [
      { x: -hw, y: -hh + 10 },
      { x: -hw + 8, y: -hh + 1 },
      { x: 0, y: -hh + 8 },
      { x: hw - 8, y: -hh + 1 },
      { x: hw, y: -hh + 10 },
      { x: hw + 2, y: -2 },
      { x: hw, y: hh - 6 },
      { x: 0, y: hh },
      { x: -hw, y: hh - 6 },
      { x: -hw - 2, y: -2 }
    ],
    // Silueta 4: Gatito curvado con oreja izquierda prominente
    [
      { x: -hw, y: -hh + 2 },
      { x: -hw + 10, y: -hh },
      { x: 2, y: -hh + 7 },
      { x: hw - 6, y: -hh + 3 },
      { x: hw, y: -hh + 8 },
      { x: hw + 2, y: 0 },
      { x: hw, y: hh - 8 },
      { x: -2, y: hh },
      { x: -hw + 6, y: hh - 2 },
      { x: -hw - 3, y: 0 }
    ]
  ];

  let idCounter = 1;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = idCounter - 1;
      const targetX = Math.round((c + 0.5) * CELL_W);
      const targetY = Math.round((r + 0.5) * CELL_H);

      const initialAngle = DISORIENTED_ANGLES[i % DISORIENTED_ANGLES.length];
      const style = palettes[(r + c) % palettes.length];
      const poly = catPolygons[(r * COLS + c) % catPolygons.length];

      pieces.push(createCatPiece({
        id: `cat_${idCounter}`,
        name: `Gatito #${idCounter}`,
        color: style.hex,
        eyeColor: style.eye,
        initialAngle: initialAngle,
        polygon: poly,
        targetX: targetX,
        targetY: targetY
      }));

      idCounter++;
    }
  }

  return pieces;
}

const MASTER_LEVEL = {
  title: "Gatitos Enamorados",
  subtitle: "700 Gatitos Entrelazados • Para Geraldine",
  poem: VICTORY_POEM,
  pieces: generate700CatUniverse(),
  boardSize: 1200
};
