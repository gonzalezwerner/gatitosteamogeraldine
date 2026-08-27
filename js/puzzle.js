/**
 * puzzle.js - Motor de 700 Piezas con Bloqueo Permanente de Piezas Encajadas
 * Las piezas colocadas quedan fijas en el tablero y no se desarman al tocarlas.
 */

class RomanticCatPuzzle {
  constructor(options) {
    this.bgCanvas = document.getElementById('bg-artwork-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.boardCanvas = options.boardCanvas;
    this.boardCtx = this.boardCanvas.getContext('2d');
    this.gameCanvas = options.gameCanvas;
    this.gameCtx = this.gameCanvas.getContext('2d');

    this.particleEngine = options.particleEngine;
    this.audio = options.audio;
    this.onProgressUpdate = options.onProgressUpdate;
    this.onLevelComplete = options.onLevelComplete;
    this.onPieceSelected = options.onPieceSelected;

    this.pieces = [];
    this.selectedPiece = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isDragging = false;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.lastTapTime = 0;
    this.isCompleted = false;

    // Fotografía real de los gatitos
    this.catImage = new Image();
    this.catImageLoaded = false;
    this.catImage.src = 'img/romantic_cats.jpg';
    this.catImage.onload = () => {
      this.catImageLoaded = true;
      if (this.onImageReady) this.onImageReady();
    };

    // Solo 1 pista por partida
    this.hintsLeft = 1;

    // Cámara y Zoom
    this.cameraZoom = 1;
    this.cameraPanX = 0;
    this.cameraPanY = 0;
    this.baseScale = 1;
    this.boardBaseSize = 1200;
    this.initialPinchDist = null;
    this.initialPinchZoom = 1;

    // Tolerancia de encaje magnético
    this.snapToleranceDist = 48;
    this.snapToleranceAngle = 30;

    this.setupEvents();
    this.renderLoop = this.renderLoop.bind(this);
    requestAnimationFrame(this.renderLoop);
  }

  loadLevel(levelData) {
    this.boardBaseSize = levelData.boardSize || 1200;
    this.pieces = JSON.parse(JSON.stringify(levelData.pieces));
    this.hintsLeft = 1;
    this.isCompleted = false;
    
    this.pieces.forEach(p => {
      p.currentX = -999;
      p.currentY = -999;
      p.isPlaced = false;
      p.isHinted = false;
    });

    this.selectedPiece = null;
    this.resetCamera();
    this.resize();

    this.loadProgress();

    const placed = this.getPlacedCount();
    this.isCompleted = (placed === this.pieces.length);

    this.drawBackgroundArtwork();
    this.drawBoard();
    if (this.onProgressUpdate) {
      this.onProgressUpdate(placed, this.pieces.length);
    }
  }

  resetCamera() {
    this.cameraZoom = 1;
    this.cameraPanX = 0;
    this.cameraPanY = 0;
    this.drawBackgroundArtwork();
    this.drawBoard();
  }

  zoomIn() {
    this.cameraZoom = Math.min(4.0, this.cameraZoom * 1.35);
    this.drawBackgroundArtwork();
    this.drawBoard();
    if (this.audio) this.audio.playSparkle(750);
  }

  zoomOut() {
    this.cameraZoom = Math.max(0.4, this.cameraZoom / 1.35);
    this.drawBackgroundArtwork();
    this.drawBoard();
    if (this.audio) this.audio.playSparkle(650);
  }

  resize() {
    const parent = this.gameCanvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    if (this.bgCanvas) {
      this.bgCanvas.width = width;
      this.bgCanvas.height = height;
    }
    this.boardCanvas.width = width;
    this.boardCanvas.height = height;
    this.gameCanvas.width = width;
    this.gameCanvas.height = height;

    const padding = 8;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    this.baseScale = Math.min(availableWidth / this.boardBaseSize, availableHeight / this.boardBaseSize);

    this.drawBackgroundArtwork();
    this.drawBoard();
  }

  getPlacedCount() {
    return this.pieces.filter(p => p.isPlaced).length;
  }

  applyCameraTransform(ctx) {
    const cw = this.gameCanvas.width;
    const ch = this.gameCanvas.height;
    ctx.translate(cw / 2 + this.cameraPanX, ch / 2 + this.cameraPanY);
    ctx.scale(this.baseScale * this.cameraZoom, this.baseScale * this.cameraZoom);
    ctx.translate(-this.boardBaseSize / 2, -this.boardBaseSize / 2);
  }

  getViewportWorldBounds() {
    const cw = this.gameCanvas.width;
    const ch = this.gameCanvas.height;
    const effScale = this.baseScale * this.cameraZoom;
    const left = (0 - (cw / 2 + this.cameraPanX)) / effScale + this.boardBaseSize / 2;
    const top = (0 - (ch / 2 + this.cameraPanY)) / effScale + this.boardBaseSize / 2;
    const width = cw / effScale;
    const height = ch / effScale;
    return { left: left - 40, top: top - 40, right: left + width + 40, bottom: top + height + 40 };
  }

  drawBackgroundArtwork() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    ctx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

    ctx.save();
    this.applyCameraTransform(ctx);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1200);
    skyGrad.addColorStop(0, '#0d0418');
    skyGrad.addColorStop(0.5, '#160824');
    skyGrad.addColorStop(1, '#090212');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1200, 1200);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const starCoords = [
      [150, 120], [320, 90], [880, 110], [1050, 160], [120, 350], [1080, 380],
      [190, 620], [1010, 640], [140, 890], [1060, 900], [280, 1050], [920, 1060]
    ];
    starCoords.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Revelar la imagen solo al completar el 100%
    if (this.isCompleted && this.catImageLoaded) {
      ctx.globalAlpha = 1.0;
      ctx.drawImage(this.catImage, 0, 0, 1200, 1200);
    }

    ctx.restore();
  }

  drawBoard() {
    const ctx = this.boardCtx;
    ctx.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);

    ctx.save();
    this.applyCameraTransform(ctx);

    ctx.strokeStyle = 'rgba(255, 117, 160, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 1184, 1184);

    const viewBounds = this.getViewportWorldBounds();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 117, 160, 0.25)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';

    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (p.targetX < viewBounds.left || p.targetX > viewBounds.right || p.targetY < viewBounds.top || p.targetY > viewBounds.bottom) {
        continue;
      }

      ctx.save();
      ctx.translate(p.targetX, p.targetY);
      if (p.targetAngle !== 0) ctx.rotate((p.targetAngle * Math.PI) / 180);
      if (p.targetFlipped) ctx.scale(-1, 1);

      ctx.beginPath();
      const poly = p.polygon;
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let j = 1; j < poly.length; j++) {
        ctx.lineTo(poly[j].x, poly[j].y);
      }
      ctx.closePath();

      if (p.isPlaced) {
        ctx.fillStyle = 'rgba(255, 77, 141, 0.02)';
        ctx.fill();
      } else if (p.isHinted) {
        ctx.fillStyle = 'rgba(249, 214, 137, 0.4)';
        ctx.strokeStyle = '#f9d689';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fill();
      } else {
        ctx.stroke();
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  renderLoop() {
    const ctx = this.gameCtx;
    ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    ctx.save();
    this.applyCameraTransform(ctx);

    const viewBounds = this.getViewportWorldBounds();

    // 1. Piezas colocadas (fijas)
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (!p.isPlaced || p === this.selectedPiece) continue;
      if (p.currentX < viewBounds.left || p.currentX > viewBounds.right || p.currentY < viewBounds.top || p.currentY > viewBounds.bottom) continue;
      this.drawRealCatPiece(ctx, p, p.currentX, p.currentY, p.currentAngle, p.currentFlipped, false);
    }

    // 2. Piezas activas sueltas en el tablero (no colocadas)
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (p.isPlaced || p.currentX < -100 || p === this.selectedPiece) continue;
      if (p.currentX < viewBounds.left || p.currentX > viewBounds.right || p.currentY < viewBounds.top || p.currentY > viewBounds.bottom) continue;
      this.drawRealCatPiece(ctx, p, p.currentX, p.currentY, p.currentAngle, p.currentFlipped, false);
    }

    // 3. Pieza seleccionada activa
    if (this.selectedPiece && !this.selectedPiece.isPlaced) {
      this.drawRealCatPiece(
        ctx,
        this.selectedPiece,
        this.selectedPiece.currentX,
        this.selectedPiece.currentY,
        this.selectedPiece.currentAngle,
        this.selectedPiece.currentFlipped,
        true
      );
    }

    ctx.restore();

    requestAnimationFrame(this.renderLoop);
  }

  drawRealCatPiece(ctx, piece, x, y, angle, flipped, isSelected) {
    ctx.save();
    ctx.translate(x, y);
    if (angle !== 0) ctx.rotate((angle * Math.PI) / 180);
    if (flipped) ctx.scale(-1, 1);

    ctx.beginPath();
    const poly = piece.polygon;
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y);
    }
    ctx.closePath();

    ctx.save();
    ctx.clip();

    if (this.catImageLoaded) {
      ctx.drawImage(this.catImage, -piece.targetX, -piece.targetY, 1200, 1200);
    } else {
      ctx.fillStyle = piece.color;
      ctx.fill();
    }
    ctx.restore();

    if (isSelected) {
      ctx.strokeStyle = '#ffd689';
      ctx.lineWidth = 2.8;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.0;
    }
    ctx.stroke();

    ctx.restore();
  }

  setupEvents() {
    const canvas = this.gameCanvas;

    const screenToWorld = (screenX, screenY) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      const cw = canvas.width;
      const ch = canvas.height;
      const effScale = this.baseScale * this.cameraZoom;

      const worldX = (clientX - (cw / 2 + this.cameraPanX)) / effScale + this.boardBaseSize / 2;
      const worldY = (clientY - (ch / 2 + this.cameraPanY)) / effScale + this.boardBaseSize / 2;
      return { x: worldX, y: worldY };
    };

    const handlePointerDown = (e) => {
      if (e.touches && e.touches.length === 2) {
        this.isDragging = false;
        this.isPanning = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.initialPinchDist = Math.hypot(dx, dy);
        this.initialPinchZoom = this.cameraZoom;
        this.panStart.x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        this.panStart.y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        return;
      }

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const pos = screenToWorld(clientX, clientY);

      let hitPiece = null;

      // 1. Prioridad: Si hay una pieza seleccionada y NO está colocada
      if (this.selectedPiece && !this.selectedPiece.isPlaced && this.selectedPiece.currentX > -100) {
        const dist = Math.hypot(pos.x - this.selectedPiece.currentX, pos.y - this.selectedPiece.currentY);
        if (dist <= 50) {
          hitPiece = this.selectedPiece;
        }
      }

      // 2. Buscar únicamente entre piezas NO colocadas (!p.isPlaced)
      // Las piezas ya colocadas quedan bloqueadas fijas en el tablero
      if (!hitPiece) {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
          const p = this.pieces[i];
          if (!p.isPlaced && p.currentX > -100 && this.isPointInPieceGenerous(pos.x, pos.y, p)) {
            hitPiece = p;
            break;
          }
        }
      }

      if (hitPiece) {
        this.selectPiece(hitPiece);
        this.isDragging = true;
        this.isPanning = false;
        this.dragOffset.x = pos.x - hitPiece.currentX;
        this.dragOffset.y = pos.y - hitPiece.currentY;

        if (this.audio) this.audio.playMew();
        if (navigator.vibrate) navigator.vibrate(10);
      } else {
        this.isPanning = true;
        this.panStart.x = clientX;
        this.panStart.y = clientY;
      }
    };

    const handlePointerMove = (e) => {
      if (e.touches && e.touches.length === 2 && this.initialPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = currentDist / this.initialPinchDist;
        this.cameraZoom = Math.min(4.0, Math.max(0.35, this.initialPinchZoom * factor));

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.cameraPanX += (midX - this.panStart.x);
        this.cameraPanY += (midY - this.panStart.y);
        this.panStart.x = midX;
        this.panStart.y = midY;

        this.drawBackgroundArtwork();
        this.drawBoard();
        return;
      }

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (this.isDragging && this.selectedPiece && !this.selectedPiece.isPlaced) {
        const pos = screenToWorld(clientX, clientY);
        this.selectedPiece.currentX = pos.x - this.dragOffset.x;
        this.selectedPiece.currentY = pos.y - this.dragOffset.y;

        const distToTarget = Math.hypot(this.selectedPiece.currentX - this.selectedPiece.targetX, this.selectedPiece.currentY - this.selectedPiece.targetY);
        if (distToTarget < 20 && this.selectedPiece.currentAngle === this.selectedPiece.targetAngle) {
          this.selectedPiece.currentX += (this.selectedPiece.targetX - this.selectedPiece.currentX) * 0.35;
          this.selectedPiece.currentY += (this.selectedPiece.targetY - this.selectedPiece.currentY) * 0.35;
        }
      } else if (this.isPanning) {
        const dx = clientX - this.panStart.x;
        const dy = clientY - this.panStart.y;
        this.cameraPanX += dx;
        this.cameraPanY += dy;
        this.panStart.x = clientX;
        this.panStart.y = clientY;
        this.drawBackgroundArtwork();
        this.drawBoard();
      }
    };

    const handlePointerUp = () => {
      this.initialPinchDist = null;
      if (this.selectedPiece && this.isDragging && !this.selectedPiece.isPlaced) {
        this.isDragging = false;
        this.trySnapPiece(this.selectedPiece);
      }
      this.isDragging = false;
      this.isPanning = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp, { passive: false });

    canvas.addEventListener('click', () => {
      const now = Date.now();
      if (now - this.lastTapTime < 320 && this.selectedPiece && !this.selectedPiece.isPlaced) {
        this.rotateSelectedPiece(45);
      }
      this.lastTapTime = now;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || !this.selectedPiece || this.selectedPiece.isPlaced) {
        if (e.deltaY < 0) this.zoomIn();
        else this.zoomOut();
      } else {
        const delta = e.deltaY > 0 ? 45 : -45;
        this.rotateSelectedPiece(delta);
      }
    }, { passive: false });
  }

  isPointInPieceGenerous(x, y, piece) {
    const dx = x - piece.currentX;
    const dy = y - piece.currentY;
    const radius = Math.max(piece.boundingRadius * 1.5, 42);
    return Math.hypot(dx, dy) <= radius;
  }

  selectPiece(piece) {
    this.selectedPiece = piece;
    if (this.onPieceSelected) {
      this.onPieceSelected(piece);
    }
  }

  selectPieceFromTray(pieceId) {
    const piece = this.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    // Si ya está colocada, no hacer nada (queda fija)
    if (piece.isPlaced) return;

    if (piece.currentX < -50) {
      const bounds = this.getViewportWorldBounds();
      piece.currentX = (bounds.left + bounds.right) / 2 + (Math.random() - 0.5) * 20;
      piece.currentY = (bounds.top + bounds.bottom) / 2 + (Math.random() - 0.5) * 20;
    }

    this.selectPiece(piece);
    if (this.audio) this.audio.playMew();
  }

  rotateSelectedPiece(deltaAngle = 45) {
    if (!this.selectedPiece || this.selectedPiece.isPlaced) return;
    this.selectedPiece.currentAngle = (this.selectedPiece.currentAngle + deltaAngle + 360) % 360;
    if (this.audio) this.audio.playSparkle(720);
    if (navigator.vibrate) navigator.vibrate(8);
    this.trySnapPiece(this.selectedPiece);
  }

  flipSelectedPiece() {
    if (!this.selectedPiece || this.selectedPiece.isPlaced) return;
    this.selectedPiece.currentFlipped = !this.selectedPiece.currentFlipped;
    if (this.audio) this.audio.playSparkle(800);
    if (navigator.vibrate) navigator.vibrate(12);
    this.trySnapPiece(this.selectedPiece);
  }

  trySnapPiece(piece) {
    if (piece.isPlaced) return true;

    const dist = Math.hypot(piece.currentX - piece.targetX, piece.currentY - piece.targetY);
    const angleDiff = Math.abs((piece.currentAngle - piece.targetAngle + 360) % 360);
    const flipMatches = (piece.currentFlipped === piece.targetFlipped);

    if (dist <= this.snapToleranceDist && (angleDiff <= this.snapToleranceAngle || angleDiff >= 360 - this.snapToleranceAngle) && flipMatches) {
      // Bloqueo permanente en la posición y orientación objetivo
      piece.currentX = piece.targetX;
      piece.currentY = piece.targetY;
      piece.currentAngle = piece.targetAngle;
      piece.currentFlipped = piece.targetFlipped;
      piece.isPlaced = true;
      piece.isHinted = false;
      this.selectedPiece = null;

      const cw = this.gameCanvas.width;
      const ch = this.gameCanvas.height;
      const effScale = this.baseScale * this.cameraZoom;
      const screenX = (piece.targetX - this.boardBaseSize / 2) * effScale + cw / 2 + this.cameraPanX;
      const screenY = (piece.targetY - this.boardBaseSize / 2) * effScale + ch / 2 + this.cameraPanY;

      if (this.particleEngine) {
        this.particleEngine.createPieceSnapBurst(screenX, screenY, piece.color);
      }

      if (this.audio) {
        this.audio.playPieceSnapChime(1.0 + (this.getPlacedCount() / this.pieces.length) * 0.5);
      }

      if (navigator.vibrate) {
        navigator.vibrate([18, 40, 20]);
      }

      this.triggerRomanticWhisper();
      this.drawBoard();

      const placed = this.getPlacedCount();
      const total = this.pieces.length;
      if (this.onProgressUpdate) {
        this.onProgressUpdate(placed, total);
      }

      if (this.onPieceSelected) {
        this.onPieceSelected(null);
      }

      this.saveProgress(false);

      if (placed === total) {
        this.isCompleted = true;
        this.drawBackgroundArtwork();
        setTimeout(() => {
          if (this.onLevelComplete) {
            this.onLevelComplete(MASTER_LEVEL);
          }
        }, 500);
      }

      return true;
    }
    return false;
  }

  triggerRomanticWhisper(customMsg) {
    const toast = document.getElementById('romantic-toast');
    const msg = document.getElementById('toast-message');
    if (!toast || !msg) return;

    msg.textContent = customMsg || ROMANTIC_WHISPERS[Math.floor(Math.random() * ROMANTIC_WHISPERS.length)];
    toast.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  showHint() {
    if (this.hintsLeft <= 0) {
      this.triggerRomanticWhisper("🔒 Ya has usado tu única pista");
      return;
    }

    const unplaced = this.pieces.filter(p => !p.isPlaced);
    if (unplaced.length === 0) return;

    this.hintsLeft--;
    const nextPiece = unplaced[0];
    this.pieces.forEach(p => p.isHinted = false);
    nextPiece.isHinted = true;
    
    // Centrar la cámara en el objetivo
    const cw = this.gameCanvas.width;
    const ch = this.gameCanvas.height;
    const effScale = this.baseScale * this.cameraZoom;
    this.cameraPanX = -(nextPiece.targetX - this.boardBaseSize / 2) * effScale;
    this.cameraPanY = -(nextPiece.targetY - this.boardBaseSize / 2) * effScale;

    this.selectPieceFromTray(nextPiece.id);
    this.drawBackgroundArtwork();
    this.drawBoard();
    
    if (this.audio) this.audio.playSparkle(920);
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    this.triggerRomanticWhisper("✨ ¡Has usado tu única pista romántica!");
    this.updateHintButtonUI();
    this.saveProgress(false);
  }

  updateHintButtonUI() {
    const hintText = document.getElementById('hint-text');
    const btnHint = document.getElementById('btn-hint');
    if (!btnHint || !hintText) return;

    if (this.hintsLeft <= 0) {
      hintText.textContent = "🔒 Pista (0)";
      btnHint.classList.add('disabled');
      btnHint.disabled = true;
    } else {
      hintText.textContent = `✨ Pista (${this.hintsLeft})`;
      btnHint.classList.remove('disabled');
      btnHint.disabled = false;
    }
  }

  saveProgress(showToast = true) {
    try {
      const saveData = {
        hintsLeft: this.hintsLeft,
        cameraZoom: this.cameraZoom,
        cameraPanX: this.cameraPanX,
        cameraPanY: this.cameraPanY,
        placedPieces: this.pieces.map(p => ({
          id: p.id,
          isPlaced: p.isPlaced,
          currentX: p.currentX,
          currentY: p.currentY,
          currentAngle: p.currentAngle,
          currentFlipped: p.currentFlipped
        }))
      };
      localStorage.setItem('gatitos_realistic_save', JSON.stringify(saveData));
      if (showToast) {
        this.triggerRomanticWhisper("💌 ¡Progreso guardado con éxito!");
        if (this.audio) this.audio.playSparkle(880);
      }
    } catch (e) {
      console.warn("No se pudo guardar en localStorage", e);
    }
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem('gatitos_realistic_save');
      if (!raw) return false;
      const saveData = JSON.parse(raw);

      if (typeof saveData.hintsLeft === 'number') {
        this.hintsLeft = saveData.hintsLeft;
      }
      if (saveData.cameraZoom) this.cameraZoom = saveData.cameraZoom;
      if (saveData.cameraPanX) this.cameraPanX = saveData.cameraPanX;
      if (saveData.cameraPanY) this.cameraPanY = saveData.cameraPanY;

      if (Array.isArray(saveData.placedPieces)) {
        saveData.placedPieces.forEach(saved => {
          const p = this.pieces.find(item => item.id === saved.id);
          if (p && saved.isPlaced) {
            p.isPlaced = true;
            p.currentX = saved.currentX;
            p.currentY = saved.currentY;
            p.currentAngle = saved.currentAngle;
            p.currentFlipped = saved.currentFlipped;
          }
        });
      }

      this.updateHintButtonUI();
      return true;
    } catch (e) {
      console.warn("No se pudo cargar el progreso", e);
      return false;
    }
  }

  autoSolve() {
    const stepDelay = 12;

    this.pieces.forEach((p, idx) => {
      setTimeout(() => {
        p.currentX = p.targetX;
        p.currentY = p.targetY;
        p.currentAngle = p.targetAngle;
        p.currentFlipped = p.targetFlipped;
        p.isPlaced = true;
        p.isHinted = false;

        if (idx % 25 === 0) {
          const cw = this.gameCanvas.width;
          const ch = this.gameCanvas.height;
          const effScale = this.baseScale * this.cameraZoom;
          const screenX = (p.targetX - this.boardBaseSize / 2) * effScale + cw / 2 + this.cameraPanX;
          const screenY = (p.targetY - this.boardBaseSize / 2) * effScale + ch / 2 + this.cameraPanY;
          if (this.particleEngine) this.particleEngine.createPieceSnapBurst(screenX, screenY, p.color);
          if (this.audio) this.audio.playPieceSnapChime(1.0 + (idx / this.pieces.length) * 0.4);
        }

        if (idx % 15 === 0 || idx === this.pieces.length - 1) {
          this.drawBoard();
          if (this.onProgressUpdate) {
            this.onProgressUpdate(this.getPlacedCount(), this.pieces.length);
          }
        }

        if (idx === this.pieces.length - 1) {
          this.isCompleted = true;
          this.drawBackgroundArtwork();
          setTimeout(() => {
            if (this.onLevelComplete) {
              this.onLevelComplete(MASTER_LEVEL);
            }
          }, 350);
        }
      }, idx * stepDelay);
    });
  }
}

window.RomanticCatPuzzle = RomanticCatPuzzle;
