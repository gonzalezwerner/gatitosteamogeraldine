/**
 * particles.js - Motor de Partículas Ultrarromántico de Alto Rendimiento (120 FPS)
 * Efectos de encaje hiper-románticos: Lluvia de sakura 3D, corazones iridiscentes,
 * destellos de diamantes cósmicos y ondas de choque doradas.
 */

class RomanticParticleEngine {
  constructor(fxCanvas, ambientCanvas) {
    this.fxCanvas = fxCanvas;
    this.fxCtx = fxCanvas ? fxCanvas.getContext('2d', { alpha: true }) : null;
    this.ambientCanvas = ambientCanvas;
    this.ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d', { alpha: true }) : null;

    this.particles = [];
    this.ambientPetals = [];
    this.isRunning = true;
    this.time = 0;

    this.resize();
    this.initAmbientPetals(28);
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (this.fxCanvas) {
      const parent = this.fxCanvas.parentElement;
      this.fxCanvas.width = parent ? parent.clientWidth : window.innerWidth;
      this.fxCanvas.height = parent ? parent.clientHeight : window.innerHeight;
    }
    if (this.ambientCanvas) {
      this.ambientCanvas.width = window.innerWidth;
      this.ambientCanvas.height = window.innerHeight;
    }
  }

  initAmbientPetals(count) {
    this.ambientPetals = [];
    const w = this.ambientCanvas ? this.ambientCanvas.width : window.innerWidth;
    const h = this.ambientCanvas ? this.ambientCanvas.height : window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.ambientPetals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 8 + Math.random() * 12,
        vx: 0.4 + Math.random() * 0.8,
        vy: 0.7 + Math.random() * 1.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.025 + Math.random() * 0.035,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.35 + Math.random() * 0.45,
        color: Math.random() > 0.4 ? '#ff9dbf' : '#ffd1dc'
      });
    }
  }

  /**
   * Explosión Ultrarromántica y Espectacular al Encajar una Pieza
   */
  createPieceSnapBurst(x, y, baseColor = '#ff4d8d') {
    const palette = ['#ff4d8d', '#ffd689', '#ff75a0', '#fbcfe8', '#ffffff', '#c084fc', '#f472b6'];

    // 1. Corazones Iridiscentes que flotan hacia arriba y giran
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 3.0 + Math.random() * 5.0;
      this.particles.push({
        type: 'heart',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        gravity: 0.04,
        size: 11 + Math.random() * 11,
        alpha: 1,
        life: 1,
        decay: 0.016 + Math.random() * 0.012,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12
      });
    }

    // 2. Pétalos de Sakura que se arremolinan en 3D
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.2 + Math.random() * 4.0;
      this.particles.push({
        type: 'petal',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        gravity: 0.05,
        size: 9 + Math.random() * 9,
        alpha: 1,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        color: Math.random() > 0.3 ? '#ff94b8' : '#fecdd3',
        flip: Math.random() * Math.PI,
        flipSpeed: 0.09 + Math.random() * 0.08,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // 3. Destellos de Diamantes Cósmicos (Estrellas de 8 puntas)
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.8 + Math.random() * 5.5;
      this.particles.push({
        type: 'diamondStar',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        alpha: 1,
        life: 1,
        decay: 0.026 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? '#fff6db' : '#f9d689'
      });
    }

    // 4. Doble Onda de Choque Luminosa (Anillo Oro + Anillo Rosa)
    this.particles.push({
      type: 'shockwave',
      x: x,
      y: y,
      radius: 4,
      maxRadius: 105,
      alpha: 1,
      decay: 0.026,
      color: '#ffd689',
      lineWidth: 3.5
    });
    this.particles.push({
      type: 'shockwave',
      x: x,
      y: y,
      radius: 2,
      maxRadius: 80,
      alpha: 1,
      decay: 0.032,
      color: '#ff4d8d',
      lineWidth: 2.5
    });
  }

  drawHeart(ctx, x, y, size, color, alpha, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    const topCurve = size * 0.3;
    ctx.moveTo(0, topCurve);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
    ctx.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, (size + topCurve) / 1.4, 0, size);
    ctx.bezierCurveTo(0, (size + topCurve) / 1.4, size / 2, (size + topCurve) / 2, size / 2, topCurve);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPetal3D(ctx, x, y, size, color, alpha, flip, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(Math.cos(flip), 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.75, -size * 0.4, size * 0.75, size * 0.4, 0, size);
    ctx.bezierCurveTo(-size * 0.75, size * 0.4, -size * 0.75, -size * 0.4, 0, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawDiamondStar(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, -size * 1.6);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.lineTo(size * 1.6, 0);
    ctx.lineTo(size * 0.3, size * 0.3);
    ctx.lineTo(0, size * 1.6);
    ctx.lineTo(-size * 0.3, size * 0.3);
    ctx.lineTo(-size * 1.6, 0);
    ctx.lineTo(-size * 0.3, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.time += 0.016;

    // 1. Renderizar Efectos de Encaje (Corazones, Ondas, Sakura)
    if (this.fxCtx && this.fxCanvas) {
      const ctx = this.fxCtx;
      ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.type === 'shockwave') {
          p.radius += (p.maxRadius - p.radius) * 0.12;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.radius >= p.maxRadius * 0.98) {
            this.particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.lineWidth;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.stroke();
          ctx.restore();
        } else if (p.type === 'heart') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.rotSpeed;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.drawHeart(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.alpha), p.rotation);
        } else if (p.type === 'petal') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.flip += p.flipSpeed;
          p.rotation += 0.02;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.drawPetal3D(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.alpha), p.flip, p.rotation);
        } else if (p.type === 'diamondStar') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.drawDiamondStar(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.alpha));
        }
      }
    }

    // 2. Renderizar Lluvia Ambiental Suave de Sakura
    if (this.ambientCtx && this.ambientCanvas) {
      const ctx = this.ambientCtx;
      ctx.clearRect(0, 0, this.ambientCanvas.width, this.ambientCanvas.height);
      const w = this.ambientCanvas.width;
      const h = this.ambientCanvas.height;

      for (let i = 0; i < this.ambientPetals.length; i++) {
        const p = this.ambientPetals[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x > w + 20) {
          p.x = -20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.3, p.size * 0.7, p.size * 0.3, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.3, -p.size * 0.7, -p.size * 0.3, 0, -p.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    if (this.isRunning) {
      requestAnimationFrame(this.animate);
    }
  }
}

window.RomanticParticleEngine = RomanticParticleEngine;
