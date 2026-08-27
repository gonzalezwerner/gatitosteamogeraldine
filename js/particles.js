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
    this.initAmbientPetals(24);
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
        size: 8 + Math.random() * 10,
        vx: 0.5 + Math.random() * 0.9,
        vy: 0.8 + Math.random() * 1.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.4 + Math.random() * 0.45,
        color: Math.random() > 0.4 ? '#ff9dbf' : '#ffd1dc'
      });
    }
  }

  /**
   * Explosión Ultrarromántica y Espectacular al Encajar una Pieza
   */
  createPieceSnapBurst(x, y, baseColor = '#ff4d8d') {
    const palette = ['#ff4d8d', '#ffd689', '#ff75a0', '#fbcfe8', '#ffffff', '#c084fc'];

    // 1. Corazones Iridiscentes que flotan hacia arriba y giran
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 2.8 + Math.random() * 4.5;
      this.particles.push({
        type: 'heart',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        gravity: 0.04,
        size: 10 + Math.random() * 10,
        alpha: 1,
        life: 1,
        decay: 0.018 + Math.random() * 0.012,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }

    // 2. Pétalos de Sakura que se arremolinan en 3D
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.5;
      this.particles.push({
        type: 'petal',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.05,
        size: 8 + Math.random() * 8,
        alpha: 1,
        life: 1,
        decay: 0.016 + Math.random() * 0.01,
        color: Math.random() > 0.3 ? '#ff94b8' : '#fecdd3',
        flip: Math.random() * Math.PI,
        flipSpeed: 0.08 + Math.random() * 0.08,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // 3. Destellos de Diamantes Cósmicos (Estrellas de 4 y 8 puntas)
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 5.0;
      this.particles.push({
        type: 'diamondStar',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        alpha: 1,
        life: 1,
        decay: 0.028 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? '#fff6db' : '#f9d689'
      });
    }

    // 4. Doble Onda de Choque Luminosa (Anillo Oro + Anillo Rosa)
    this.particles.push({
      type: 'shockwave',
      x: x,
      y: y,
      radius: 4,
      maxRadius: 95,
      alpha: 1,
      decay: 0.028,
      color: '#ffd689',
      lineWidth: 3
    });
    this.particles.push({
      type: 'shockwave',
      x: x,
      y: y,
      radius: 2,
      maxRadius: 70,
      alpha: 1,
      decay: 0.035,
      color: '#ff4d8d',
      lineWidth: 2
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
    ctx.scale(Math.cos(flip), 1); // Efecto 3D de voltereta
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
    ctx.moveTo(0, -size * 2);
    ctx.quadraticCurveTo(0, 0, size * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, size * 2);
    ctx.quadraticCurveTo(0, 0, -size * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    if (!this.isRunning) return;
    this.time += 0.016;

    // 1. Pétalos ambientales suaves de fondo
    if (this.ambientCtx && this.ambientCanvas) {
      const actx = this.ambientCtx;
      const aw = this.ambientCanvas.width;
      const ah = this.ambientCanvas.height;

      actx.clearRect(0, 0, aw, ah);

      for (let i = 0; i < this.ambientPetals.length; i++) {
        const p = this.ambientPetals[i];
        p.wobble += p.wobbleSpeed;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.rotation += p.rotSpeed;

        if (p.y > ah + 25) {
          p.y = -25;
          p.x = Math.random() * aw;
        }
        if (p.x > aw + 25) p.x = -25;

        this.drawPetal3D(actx, p.x, p.y, p.size, p.color, p.opacity, p.wobble, p.rotation);
      }
    }

    // 2. Partículas FX activas
    if (this.fxCtx && this.fxCanvas) {
      const fctx = this.fxCtx;
      fctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.type === 'shockwave') {
          p.radius += (p.maxRadius - p.radius) * 0.15;
          p.alpha -= p.decay;

          fctx.strokeStyle = p.color;
          fctx.lineWidth = p.lineWidth || 2;
          fctx.globalAlpha = Math.max(0, p.alpha);
          fctx.beginPath();
          fctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          fctx.stroke();

          if (p.alpha <= 0) this.particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) p.vy += p.gravity;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);

        if (p.type === 'heart') {
          p.rotation += p.rotSpeed;
          this.drawHeart(fctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
        } else if (p.type === 'petal') {
          p.flip += p.flipSpeed;
          this.drawPetal3D(fctx, p.x, p.y, p.size, p.color, p.alpha, p.flip, p.rotation);
        } else if (p.type === 'diamondStar') {
          this.drawDiamondStar(fctx, p.x, p.y, p.size, p.color, p.alpha);
        }

        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

window.RomanticParticleEngine = RomanticParticleEngine;
