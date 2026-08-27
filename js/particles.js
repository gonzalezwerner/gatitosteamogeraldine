/**
 * particles.js - Motor de Partículas Ultrarrápido y Optimizado para 120 FPS
 * Cero sombras pesadas en bucle, reciclaje de memoria y trazados rápidos.
 */

class RomanticParticleEngine {
  constructor(fxCanvas, ambientCanvas) {
    this.fxCanvas = fxCanvas;
    this.fxCtx = fxCanvas ? fxCanvas.getContext('2d', { alpha: true }) : null;
    this.ambientCanvas = ambientCanvas;
    this.ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d', { alpha: true }) : null;

    this.particles = [];
    this.ambientPetals = [];
    this.auroraTime = 0;
    this.isRunning = true;
    this.lastFrameTime = 0;

    this.resize();
    this.initAmbientPetals(18); // Cantidad ideal y ligera
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
        size: 7 + Math.random() * 8,
        vx: 0.4 + Math.random() * 0.8,
        vy: 0.7 + Math.random() * 1.1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.35 + Math.random() * 0.4,
        color: Math.random() > 0.4 ? '#ff94b8' : '#ffd1dc'
      });
    }
  }

  createPieceSnapBurst(x, y, color = '#ff4d8d') {
    // 1. Corazones en órbita
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 3.5;
      this.particles.push({
        type: 'heart',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        size: 9 + Math.random() * 8,
        alpha: 1,
        life: 1,
        decay: 0.022 + Math.random() * 0.015,
        color: Math.random() > 0.3 ? color : '#ffd689',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }

    // 2. Chispas rápidas
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 4.0;
      this.particles.push({
        type: 'sparkle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 2,
        alpha: 1,
        life: 1,
        decay: 0.035,
        color: '#ffe6a3'
      });
    }

    // 3. Anillo de onda expansiva
    this.particles.push({
      type: 'ring',
      x: x,
      y: y,
      radius: 4,
      maxRadius: 85,
      alpha: 1,
      decay: 0.035,
      color: '#f9d689'
    });
  }

  drawHeartFast(ctx, x, y, size, color, alpha, rotation = 0) {
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

  drawPetalFast(ctx, x, y, size, color, alpha, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.7, -size * 0.4, size * 0.7, size * 0.4, 0, size);
    ctx.bezierCurveTo(-size * 0.7, size * 0.4, -size * 0.7, -size * 0.4, 0, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate(now) {
    if (!this.isRunning) return;

    // 1. Fondo ambiental (pétalos ligeros)
    if (this.ambientCtx && this.ambientCanvas) {
      const actx = this.ambientCtx;
      const aw = this.ambientCanvas.width;
      const ah = this.ambientCanvas.height;

      actx.clearRect(0, 0, aw, ah);

      for (let i = 0; i < this.ambientPetals.length; i++) {
        const p = this.ambientPetals[i];
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;

        if (p.y > ah + 20) {
          p.y = -20;
          p.x = Math.random() * aw;
        }
        if (p.x > aw + 20) p.x = -20;

        this.drawPetalFast(actx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      }
    }

    // 2. Partículas FX activas
    if (this.fxCtx && this.fxCanvas) {
      const fctx = this.fxCtx;
      fctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.type === 'ring') {
          p.radius += (p.maxRadius - p.radius) * 0.16;
          p.alpha -= p.decay;

          fctx.strokeStyle = p.color;
          fctx.lineWidth = 2;
          fctx.globalAlpha = Math.max(0, p.alpha);
          fctx.beginPath();
          fctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          fctx.stroke();

          if (p.alpha <= 0) this.particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);

        if (p.type === 'heart') {
          p.rotation += p.rotSpeed;
          this.drawHeartFast(fctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
        } else if (p.type === 'sparkle') {
          fctx.fillStyle = p.color;
          fctx.globalAlpha = p.alpha;
          fctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
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
