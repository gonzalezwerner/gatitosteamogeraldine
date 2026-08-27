/**
 * cinematic.js - Gran Final Cinemático Espectacular, Gigante y Ultrarromántico
 * Fuegos Artificiales en forma de Corazón, Aurora Boreal Multicapa, Gatos Cósmicos
 * de Polvo Estelar, Vals de Caja de Música y Postal de Recuerdo en Alta Resolución.
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
    this.fireworks = [];

    this.catLeft = { x: -120, y: 0, targetX: 0, alpha: 0 };
    this.catRight = { x: 900, y: 0, targetX: 0, alpha: 0 };
    this.heartConstellation = { progress: 0, alpha: 0 };

    this.initStars(100);
    this.setupListeners();
    this.animate = this.animate.bind(this);
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 3,
        twinkleSpeed: 0.03 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#ffffff' : '#ffd689'
      });
    }
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initStars(100);
      }
    });

    // Tocar o hacer clic en la pantalla lanza fuegos artificiales gigantes de corazones
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.isActive) return;
      this.launchGiantHeartFirework(e.clientX, e.clientY);
      if (this.audio) {
        this.audio.playSparkle(880 + Math.random() * 400);
        this.audio.playMew();
      }
      if (navigator.vibrate) navigator.vibrate([15, 35, 15]);
    });

    const btnSave = document.getElementById('btn-save-card');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.exportSouvenirCard());
    }

    const btnReplay = document.getElementById('btn-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        this.stop();
        if (window.location) window.location.reload();
      });
    }
  }

  start(levelData) {
    this.currentLevel = levelData;
    this.isActive = true;
    this.animTime = 0;
    this.particles = [];
    this.fireworks = [];
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerY = h * 0.36;

    this.catLeft = { x: -140, y: centerY, targetX: w * 0.5 - 48, alpha: 0 };
    this.catRight = { x: w + 140, y: centerY, targetX: w * 0.5 + 48, alpha: 0 };
    this.heartConstellation = { progress: 0, alpha: 0 };

    this.overlay.classList.add('active');

    // Vals romántico triunfal
    if (this.audio) {
      this.audio.playSparkle(1200);
      this.audio.playKittenSnapSound(0);
    }

    // Disparar salva inicial de fuegos artificiales gigantes
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (this.isActive) {
          const fx = w * 0.2 + Math.random() * w * 0.6;
          const fy = h * 0.15 + Math.random() * h * 0.3;
          this.launchGiantHeartFirework(fx, fy);
        }
      }, i * 350);
    }

    requestAnimationFrame(this.animate);
  }

  stop() {
    this.isActive = false;
    this.overlay.classList.remove('active');
  }

  /**
   * Lanzar Fuegos Artificiales Gigantes en forma de Corazón
   */
  launchGiantHeartFirework(cx, cy) {
    const palette = ['#ff4d8d', '#ffd689', '#c084fc', '#67e8f9', '#ff94b8', '#ffffff'];
    const heartPoints = 42;

    for (let i = 0; i < heartPoints; i++) {
      const t = (i / heartPoints) * Math.PI * 2;
      // Ecuación paramétrica de corazón
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      const speed = 0.26 + Math.random() * 0.08;
      const color = palette[Math.floor(Math.random() * palette.length)];

      this.particles.push({
        type: 'fireworkParticle',
        x: cx,
        y: cy,
        vx: hx * speed + (Math.random() - 0.5) * 0.5,
        vy: hy * speed + (Math.random() - 0.5) * 0.5,
        gravity: 0.035,
        size: 3.5 + Math.random() * 3,
        alpha: 1,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        color: color,
        trail: []
      });
    }

    // Destello de centro
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      this.particles.push({
        type: 'sparkle',
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        gravity: 0.02,
        size: 2.5 + Math.random() * 2,
        alpha: 1,
        life: 1,
        decay: 0.025,
        color: '#fff5db'
      });
    }
  }

  animate() {
    if (!this.isActive) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.animTime += 0.016;

    ctx.clearRect(0, 0, w, h);
    
    // 1. Aurora Boreal Cósmica Multicapa
    this.drawAuroraMultilayer(ctx, w, h);

    // 2. Estrellas del firmamento
    this.drawStars(ctx);

    // 3. Dos Gatitos Celestiales aproximándose en el cielo
    this.drawCelestialCats(ctx, w, h);

    // 4. Salvas automáticas continuas de fuegos artificiales
    if (Math.random() < 0.045) {
      const fx = w * 0.15 + Math.random() * w * 0.7;
      const fy = h * 0.12 + Math.random() * h * 0.32;
      this.launchGiantHeartFirework(fx, fy);
      if (this.audio && Math.random() < 0.3) this.audio.playSparkle(1050);
    }

    // 5. Partículas activas y estelas
    this.drawParticles(ctx);

    requestAnimationFrame(this.animate);
  }

  drawAuroraMultilayer(ctx, w, h) {
    const t = this.animTime;

    // Capa 1: Resplandor Rosa y Magenta
    const grad1 = ctx.createRadialGradient(
      w * 0.5 + Math.sin(t * 0.7) * 160,
      h * 0.38 + Math.cos(t * 0.6) * 90,
      40,
      w * 0.5,
      h * 0.42,
      w * 0.9
    );
    grad1.addColorStop(0, 'rgba(255, 77, 141, 0.32)');
    grad1.addColorStop(0.4, 'rgba(168, 85, 247, 0.22)');
    grad1.addColorStop(0.8, 'rgba(56, 189, 248, 0.12)');
    grad1.addColorStop(1, 'rgba(10, 4, 16, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    // Capa 2: Ondas celestiales de seda polar
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#ffd689';
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3 + Math.sin(t) * 40);
    ctx.bezierCurveTo(
      w * 0.33, h * 0.2 + Math.cos(t * 1.2) * 50,
      w * 0.66, h * 0.45 + Math.sin(t * 0.9) * 45,
      w, h * 0.28 + Math.cos(t) * 40
    );
    ctx.stroke();
    ctx.restore();
  }

  drawStars(ctx) {
    for (let s of this.stars) {
      const alpha = 0.4 + Math.sin(this.animTime * 4 + s.phase) * 0.5;
      ctx.save();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.15, alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawCelestialCats(ctx, w, h) {
    this.catLeft.x += (this.catLeft.targetX - this.catLeft.x) * 0.035;
    this.catRight.x += (this.catRight.targetX - this.catRight.x) * 0.035;
    this.catLeft.alpha = Math.min(1, this.catLeft.alpha + 0.02);
    this.catRight.alpha = Math.min(1, this.catRight.alpha + 0.02);

    const dist = Math.abs(this.catLeft.x - this.catLeft.targetX);

    // Gatito Izquierdo (Luz de Luna)
    this.drawGlowingCatSilhouette(ctx, this.catLeft.x, this.catLeft.y, false, '#e0e7ff', '#c084fc', this.catLeft.alpha);

    // Gatito Derecho (Luz de Sol y Oro)
    this.drawGlowingCatSilhouette(ctx, this.catRight.x, this.catRight.y, true, '#ffd689', '#ff4d8d', this.catRight.alpha);

    // Si están juntos, hacer florecer el gran Corazón Constelación
    if (dist < 12) {
      this.heartConstellation.alpha = Math.min(1, this.heartConstellation.alpha + 0.025);
      this.drawHeartConstellation(ctx, w * 0.5, h * 0.36 - 55, this.heartConstellation.alpha);
    }
  }

  drawGlowingCatSilhouette(ctx, x, y, flip, primaryColor, glowColor, alpha) {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(-25, -35);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-5, -35);
    ctx.lineTo(15, -15);
    ctx.bezierCurveTo(35, -5, 45, 20, 20, 45);
    ctx.bezierCurveTo(45, 45, 60, 25, 65, 0);
    ctx.bezierCurveTo(55, -25, 40, -40, 25, -45);
    ctx.bezierCurveTo(0, 40, -30, 35, -35, 10);
    ctx.bezierCurveTo(-45, -5, -35, -25, -25, -35);
    ctx.closePath();
    ctx.fill();

    // Corona y borde brillante
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  drawHeartConstellation(ctx, x, y, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    const size = 60 + Math.sin(this.animTime * 3) * 5;

    ctx.fillStyle = 'rgba(255, 77, 141, 0.85)';
    ctx.beginPath();
    const topCurve = size * 0.3;
    ctx.moveTo(0, topCurve);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
    ctx.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, (size + topCurve) / 1.4, 0, size);
    ctx.bezierCurveTo(0, (size + topCurve) / 1.4, size / 2, (size + topCurve) / 2, size / 2, topCurve);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffe6a3';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Huellita en el centro
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, topCurve + 16, 7, 0, Math.PI * 2);
    ctx.arc(-7, topCurve + 6, 3.5, 0, Math.PI * 2);
    ctx.arc(0, topCurve + 3, 3.5, 0, Math.PI * 2);
    ctx.arc(7, topCurve + 6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'fireworkParticle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  exportSouvenirCard() {
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 1080;
    cardCanvas.height = 1350;
    const cctx = cardCanvas.getContext('2d');

    const grad = cctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#150824');
    grad.addColorStop(0.5, '#280f3b');
    grad.addColorStop(1, '#0e0416');
    cctx.fillStyle = grad;
    cctx.fillRect(0, 0, 1080, 1350);

    cctx.strokeStyle = '#f9d689';
    cctx.lineWidth = 8;
    cctx.strokeRect(40, 40, 1000, 1270);
    cctx.strokeStyle = 'rgba(255, 77, 141, 0.4)';
    cctx.lineWidth = 2;
    cctx.strokeRect(55, 55, 970, 1240);

    cctx.fillStyle = '#ffe6a3';
    cctx.font = 'bold 52px "Playfair Display", Georgia, serif';
    cctx.textAlign = 'center';
    cctx.fillText('Gatitos Enamorados', 540, 140);

    cctx.fillStyle = '#ff75a0';
    cctx.font = 'italic 28px "Outfit", sans-serif';
    cctx.fillText(this.currentLevel ? this.currentLevel.title : 'Mosaico del Destino', 540, 190);

    const gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
      cctx.drawImage(gameCanvas, 140, 240, 800, 600);
    }

    cctx.fillStyle = '#ffffff';
    cctx.font = 'italic 34px "Dancing Script", cursive, sans-serif';
    const poem = this.currentLevel ? this.currentLevel.poem : "Nuestras almas encajan para siempre.";
    this.wrapText(cctx, `"${poem}"`, 540, 930, 880, 48);

    const dedication = document.getElementById('dedication-name')?.value || "Geraldine";
    cctx.fillStyle = '#f9d689';
    cctx.font = 'bold 36px "Outfit", sans-serif';
    cctx.fillText(`Con todo mi amor para: ${dedication} 🐾💖`, 540, 1140);

    cctx.fillStyle = '#d4b8cf';
    cctx.font = '22px "Outfit", sans-serif';
    cctx.fillText('Unidos por siempre bajo las estrellas', 540, 1200);

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
