/**
 * cinematic.js - Gran Final Cinemático Ultrarromántico
 * Encuentro de Gatos Celestiales, Fuegos Artificiales de Corazones, Aurora Boreal,
 * Vals Romántico y Generador de Postales de Recuerdo con Dedicatoria.
 */

class RomanticVictoryCinematic {
  constructor(options) {
    this.overlay = document.getElementById('cinematic-overlay');
    this.canvas = document.getElementById('cinematic-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.victoryCard = document.getElementById('victory-card');
    this.audio = options.audio;
    this.currentLevel = null;
    
    this.isActive = false;
    this.animTime = 0;
    this.particles = [];
    this.stars = [];
    this.touchFireworks = [];

    this.catLeft = { x: -100, y: 0, targetX: 0, alpha: 0 };
    this.catRight = { x: 900, y: 0, targetX: 0, alpha: 0 };
    this.heartConstellation = { progress: 0, alpha: 0 };

    this.initStars(80);
    this.setupListeners();
    this.animate = this.animate.bind(this);
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 2.5,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#fff' : '#ffd689'
      });
    }
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initStars(80);
      }
    });

    // Toque interactivo en el canvas para lanzar fuegos artificiales de amor
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.isActive) return;
      this.createTouchFirework(e.clientX, e.clientY);
      if (this.audio) this.audio.playSparkle(880 + Math.random() * 400);
      if (navigator.vibrate) navigator.vibrate([15, 30]);
    });

    // Guardar postal de recuerdo
    const btnSave = document.getElementById('btn-save-card');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.exportSouvenirCard());
    }

    // Botón contemplar
    const btnReplay = document.getElementById('btn-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        if (this.victoryCard) {
          this.victoryCard.style.display = this.victoryCard.style.display === 'none' ? 'block' : 'none';
        }
      });
    }
  }

  start(levelData) {
    this.currentLevel = levelData;
    this.isActive = true;
    this.animTime = 0;
    this.particles = [];
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Posiciones iniciales de los dos gatos cósmicos
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerY = h * 0.38;

    this.catLeft = { x: -120, y: centerY, targetX: w * 0.5 - 45, alpha: 0 };
    this.catRight = { x: w + 120, y: centerY, targetX: w * 0.5 + 45, alpha: 0 };
    this.heartConstellation = { progress: 0, alpha: 0 };

    // Actualizar textos del modal
    const levelName = document.getElementById('victory-level-name');
    if (levelName) levelName.textContent = `${levelData.title} • Completado`;

    const quote = document.getElementById('parchment-quote');
    if (quote) quote.textContent = `"${levelData.poem}"`;

    // Activar Overlay
    this.overlay.classList.add('active');

    // Iniciar vals musical
    if (this.audio) {
      this.audio.playVictoryWaltz();
    }

    // Iniciar bucle
    requestAnimationFrame(this.animate);
  }

  stop() {
    this.isActive = false;
    this.overlay.classList.remove('active');
    if (this.audio) {
      this.audio.stopVictoryWaltz();
    }
  }

  createTouchFirework(x, y) {
    const colors = ['#ff4d8d', '#ffd689', '#c084fc', '#67e8f9', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.0;
      this.particles.push({
        type: Math.random() > 0.4 ? 'heart' : 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 9,
        alpha: 1,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }
  }

  animate() {
    if (!this.isActive) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.animTime += 0.016;

    // 1. Limpiar con degradado cósmico profundo
    ctx.clearRect(0, 0, w, h);
    
    // Aurora Boreal fluida
    this.drawAurora(ctx, w, h);

    // 2. Estrellas titilantes
    this.drawStars(ctx);

    // 3. Dos Gatitos Cósmicos aproximándose y entrelazándose
    this.drawCelestialCats(ctx, w, h);

    // 4. Lluvia continua de fuegos artificiales de corazones
    if (Math.random() < 0.05) {
      const fx = w * 0.2 + Math.random() * w * 0.6;
      const fy = h * 0.15 + Math.random() * h * 0.35;
      this.createTouchFirework(fx, fy);
      if (this.audio && Math.random() < 0.4) this.audio.playSparkle(950);
    }

    // 5. Partículas activas
    this.drawParticles(ctx);

    requestAnimationFrame(this.animate);
  }

  drawAurora(ctx, w, h) {
    const time = this.animTime;
    const grad = ctx.createRadialGradient(
      w * 0.5 + Math.sin(time * 0.6) * 140,
      h * 0.4 + Math.cos(time * 0.5) * 80,
      30,
      w * 0.5,
      h * 0.45,
      w * 0.85
    );
    grad.addColorStop(0, 'rgba(255, 77, 141, 0.25)');
    grad.addColorStop(0.35, 'rgba(168, 85, 247, 0.2)');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.1)');
    grad.addColorStop(1, 'rgba(10, 4, 16, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  drawStars(ctx) {
    for (let s of this.stars) {
      const alpha = 0.4 + Math.sin(this.animTime * 4 + s.phase) * 0.5;
      ctx.save();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawCelestialCats(ctx, w, h) {
    // Interpolar movimiento hacia el centro
    this.catLeft.x += (this.catLeft.targetX - this.catLeft.x) * 0.035;
    this.catRight.x += (this.catRight.targetX - this.catRight.x) * 0.035;
    this.catLeft.alpha = Math.min(1, this.catLeft.alpha + 0.02);
    this.catRight.alpha = Math.min(1, this.catRight.alpha + 0.02);

    const dist = Math.abs(this.catLeft.x - this.catLeft.targetX);

    // Dibujar Gatito Izquierdo (Luz de Luna - Azul Plateado / Lavanda)
    this.drawGlowingCatSilhouette(ctx, this.catLeft.x, this.catLeft.y, false, '#e0e7ff', '#c084fc', this.catLeft.alpha);

    // Dibujar Gatito Derecho (Luz de Sol - Oro Rosa / Frambuesa)
    this.drawGlowingCatSilhouette(ctx, this.catRight.x, this.catRight.y, true, '#ffd689', '#ff4d8d', this.catRight.alpha);

    // Si están juntos, hacer florecer el gran Corazón Constelación
    if (dist < 10) {
      this.heartConstellation.alpha = Math.min(1, this.heartConstellation.alpha + 0.025);
      this.drawHeartConstellation(ctx, w * 0.5, h * 0.38 - 50, this.heartConstellation.alpha);
    }
  }

  drawGlowingCatSilhouette(ctx, x, y, flip, primaryColor, glowColor, alpha) {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 25;

    // Cuerpo felino elegante
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    // Cabeza y orejas
    ctx.moveTo(-25, -35);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-5, -35);
    ctx.lineTo(15, -15);
    // Espalda y cola arqueada hacia el corazón
    ctx.bezierCurveTo(35, -5, 45, 20, 20, 45);
    ctx.bezierCurveTo(45, 45, 60, 25, 65, 0); // Cola levantada
    ctx.bezierCurveTo(55, -25, 40, -40, 25, -45);
    // Pecho y patas
    ctx.bezierCurveTo(0, 40, -30, 35, -35, 10);
    ctx.bezierCurveTo(-45, -5, -35, -25, -25, -35);
    ctx.closePath();
    ctx.fill();

    // Ojo durmiente brillante
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-10, -10, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();

    ctx.restore();
  }

  drawHeartConstellation(ctx, x, y, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#ffd689';
    ctx.shadowBlur = 20;

    const size = 55 + Math.sin(this.animTime * 3) * 4;

    // Corazón resplandeciente central
    ctx.fillStyle = 'rgba(255, 77, 141, 0.75)';
    ctx.beginPath();
    const topCurve = size * 0.3;
    ctx.moveTo(0, topCurve);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
    ctx.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, (size + topCurve) / 1.4, 0, size);
    ctx.bezierCurveTo(0, (size + topCurve) / 1.4, size / 2, (size + topCurve) / 2, size / 2, topCurve);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
    ctx.closePath();
    ctx.fill();

    // Borde de oro
    ctx.strokeStyle = '#ffe6a3';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Huellita de gatito en el centro del corazón
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, topCurve + 14, 6, 0, Math.PI * 2);
    ctx.arc(-6, topCurve + 5, 3, 0, Math.PI * 2);
    ctx.arc(0, topCurve + 2, 3, 0, Math.PI * 2);
    ctx.arc(6, topCurve + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      if (p.type === 'heart') {
        p.rotation += p.rotSpeed;
        ctx.rotate(p.rotation);
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s * 0.3);
        ctx.bezierCurveTo(-s / 2, s * 0.7, 0, s * 0.9, 0, s);
        ctx.bezierCurveTo(0, s * 0.9, s / 2, s * 0.7, s / 2, s * 0.3);
        ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Generar y descargar la Postal de Recuerdo Romántica en Alta Resolución (PNG)
   */
  exportSouvenirCard() {
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 1080;
    cardCanvas.height = 1350; // Formato postal retrato
    const cctx = cardCanvas.getContext('2d');

    // 1. Fondo de terciopelo noche
    const grad = cctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#150824');
    grad.addColorStop(0.5, '#280f3b');
    grad.addColorStop(1, '#0e0416');
    cctx.fillStyle = grad;
    cctx.fillRect(0, 0, 1080, 1350);

    // 2. Borde dorado ornamental
    cctx.strokeStyle = '#f9d689';
    cctx.lineWidth = 8;
    cctx.strokeRect(40, 40, 1000, 1270);
    cctx.strokeStyle = 'rgba(255, 77, 141, 0.4)';
    cctx.lineWidth = 2;
    cctx.strokeRect(55, 55, 970, 1240);

    // 3. Título de la postal
    cctx.fillStyle = '#ffe6a3';
    cctx.font = 'bold 52px "Playfair Display", Georgia, serif';
    cctx.textAlign = 'center';
    cctx.fillText('Gatitos Enamorados', 540, 140);

    cctx.fillStyle = '#ff75a0';
    cctx.font = 'italic 28px "Outfit", sans-serif';
    cctx.fillText(this.currentLevel ? this.currentLevel.title : 'Mosaico del Destino', 540, 190);

    // 4. Dibujar el Mosaico completado en el centro
    const gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
      cctx.drawImage(gameCanvas, 140, 240, 800, 600);
    }

    // 5. Poema de amor
    cctx.fillStyle = '#ffffff';
    cctx.font = 'italic 34px "Dancing Script", cursive, sans-serif';
    const poem = this.currentLevel ? this.currentLevel.poem : "Nuestras almas encajan para siempre.";
    
    // Envolver texto del poema
    this.wrapText(cctx, `"${poem}"`, 540, 930, 880, 48);

    // 6. Dedicatoria personalizada
    const dedication = document.getElementById('dedication-name')?.value || "Mi Persona Favorita";
    cctx.fillStyle = '#f9d689';
    cctx.font = 'bold 36px "Outfit", sans-serif';
    cctx.fillText(`Con todo mi amor para: ${dedication} 🐾💖`, 540, 1140);

    cctx.fillStyle = '#d4b8cf';
    cctx.font = '22px "Outfit", sans-serif';
    cctx.fillText('Unidos por siempre bajo las estrellas', 540, 1200);

    // Descargar imagen
    const link = document.createElement('a');
    link.download = `gatitos-enamorados-${dedication.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }
}

window.RomanticVictoryCinematic = RomanticVictoryCinematic;
