/**
 * preloader3d.js - Preloader 3D Ultrarromántico del Espacio Cósmico con Three.js
 * Galaxia de Polvo Estelar, Nebulosa en forma de Corazón 3D, Lluvia de Sakura Cósmica
 * y Dedicatoria de Amor Infinito para Geraldine.
 */

class Romantic3DPreloader {
  constructor(options) {
    this.container = document.getElementById('romantic-3d-preloader');
    this.canvasContainer = document.getElementById('preloader-canvas-container');
    this.progressBar = document.getElementById('preloader-fill');
    this.percentText = document.getElementById('preloader-percent');
    this.captionText = document.getElementById('preloader-caption');
    this.btnEnter = document.getElementById('btn-enter-universe');
    this.onComplete = options.onComplete;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.heartPoints = null;
    this.galaxyPoints = null;
    this.sakuraPoints = null;
    
    this.progress = 0;
    this.isLoaded = false;
    this.animId = null;

    this.phrases = [
      "Tejiendo las estrellas más hermosas para Geraldine... 🌌",
      "Alineando los 700 latidos de nuestro universo felino... 🐾💖",
      "Encendiendo la luna llena de nuestro amor eterno... 🌙✨",
      "Geraldine, eres mi constelación favorita en todo el cosmos... 🌸",
      "Preparando el mosaico de amor más hermoso del mundo... 💍"
    ];

    if (window.THREE) {
      this.initThree();
    } else {
      this.fallbackLoad();
    }
  }

  initThree() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    this.camera.position.z = 280;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.create3DHeartNebula();
    this.create3DGalaxy();
    this.create3DSakura();

    this.mouseX = 0;
    this.mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      this.mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = (e.touches[0].clientX - window.innerWidth / 2) * 0.001;
        this.mouseY = (e.touches[0].clientY - window.innerHeight / 2) * 0.001;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    this.animate = this.animate.bind(this);
    this.animate();

    this.simulateProgress();
  }

  create3DHeartNebula() {
    const particleCount = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color('#ff4d8d');
    const c2 = new THREE.Color('#ffd689');
    const c3 = new THREE.Color('#c084fc');

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const scale = 5.2 + Math.random() * 1.8;
      const hx = (16 * Math.pow(Math.sin(t), 3)) * scale;
      const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
      const hz = (Math.random() - 0.5) * 45;

      positions[i * 3] = hx + (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = hy + (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = hz;

      const mixedColor = Math.random() > 0.5 ? c1.clone().lerp(c2, Math.random()) : c1.clone().lerp(c3, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    this.heartPoints = new THREE.Points(geometry, material);
    this.scene.add(this.heartPoints);
  }

  create3DGalaxy() {
    const count = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gold = new THREE.Color('#fff0b8');
    const rose = new THREE.Color('#ff75a0');

    for (let i = 0; i < count; i++) {
      const angle = i * 0.12;
      const radius = 30 + Math.pow(Math.random(), 1.5) * 350;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 200;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = Math.random() > 0.5 ? gold : rose;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.galaxyPoints = new THREE.Points(geometry, material);
    this.galaxyPoints.rotation.x = Math.PI / 3;
    this.scene.add(this.galaxyPoints);
  }

  create3DSakura() {
    const count = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 4.8,
      color: 0xffb7c5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.sakuraPoints = new THREE.Points(geometry, material);
    this.scene.add(this.sakuraPoints);
  }

  simulateProgress() {
    let phraseIndex = 0;
    const interval = setInterval(() => {
      this.progress += Math.floor(Math.random() * 12) + 6;
      if (this.progress > 100) this.progress = 100;

      if (this.progressBar) this.progressBar.style.width = `${this.progress}%`;
      if (this.percentText) this.percentText.textContent = `${this.progress}%`;

      if (this.progress % 25 === 0 || Math.random() < 0.25) {
        phraseIndex = (phraseIndex + 1) % this.phrases.length;
        if (this.captionText) this.captionText.textContent = this.phrases[phraseIndex];
      }

      if (this.progress >= 100) {
        clearInterval(interval);
        this.isLoaded = true;
        if (this.captionText) this.captionText.innerHTML = `✨ ¡Todo listo con amor para <strong>Geraldine</strong>! 🐾💖`;
        if (this.btnEnter) {
          this.btnEnter.classList.add('visible');
          this.btnEnter.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.dismiss();
          });
        }
        if (this.container) {
          this.container.addEventListener('pointerdown', () => this.dismiss(), { once: true });
        }
      }
    }, 120);
  }

  fallbackLoad() {
    this.simulateProgress();
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.001;

    if (this.heartPoints) {
      this.heartPoints.rotation.y = time * 0.2 + this.mouseX * 2;
      this.heartPoints.rotation.x = Math.sin(time * 0.3) * 0.15 + this.mouseY * 2;
      
      const beat = 1 + Math.sin(time * 3.5) * 0.06;
      this.heartPoints.scale.set(beat, beat, beat);
    }

    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.z = time * 0.08;
    }

    if (this.sakuraPoints) {
      const pos = this.sakuraPoints.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.6;
        if (pos[i + 1] < -300) pos[i + 1] = 300;
      }
      this.sakuraPoints.geometry.attributes.position.needsUpdate = true;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dismiss() {
    if (this.container) {
      this.container.style.pointerEvents = 'none';
      this.container.classList.add('fade-out');
      if (this.onComplete) this.onComplete();
      setTimeout(() => {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.container.style.display = 'none';
      }, 700);
    }
  }
}

window.Romantic3DPreloader = Romantic3DPreloader;
