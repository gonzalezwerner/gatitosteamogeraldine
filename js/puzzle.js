/**
 * puzzle.js - Motor de Mosaico Luminoso con Realce de Sombras y Zonas Oscuras
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
    this.panLast = { x: 0, y: 0 };
    this.panVelX = 0;
    this.panVelY = 0;
    this.lastTapTime = 0;
    this.isCompleted = false;

    // Fotografía real de los gatitos en 1200x1200
    this.catImage = new Image();
    this.catImageLoaded = false;
    this.catImage.src = 'img/romantic_cats.jpg';
    this.catImage.onload = () => {
      this.catImageLoaded = true;
      this.drawBackgroundArtwork();
      this.drawBoard();
      if (this.onImageReady) this.onImageReady();
    };

    this.hintsLeft = 1;
    this.storageKey = 'gatitos_geraldine_save_final_v1';

    // Cámara y Zoom
    this.cameraZoom = 1;
    this.cameraPanX = 0;
    this.cameraPanY = 0;
    this.baseScale = 1;
    this.boardBaseSize = 1200;
    this.initialPinchDist = null;
    this.initialPinchZoom = 1;

    // Tolerancia de encaje
    this.snapToleranceDist = 38;
    this.snapToleranceAngle = 28;

    this.setupEvents();
    this.renderLoop = this.renderLoop.bind(this);
    requestAnimationFrame(this.renderLoop);
  }

  loadLevel(levelData, isReset = false) {
    this.boardBaseSize = levelData.boardSize || 1200;
    
    this.pieces = levelData.pieces.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category || "general",
      personality: "Romántico",
      color: p.color,
      eyeColor: p.eyeColor || "#f9d689",
      polygon: p.polygon,
      boundingRadius: p.boundingRadius || 28,
      targetX: p.targetX,
      targetY: p.targetY,
      targetAngle: 0,
      targetFlipped: false,
      currentX: -999,
      currentY: -999,
      currentAngle: p.initialAngle || 0,
      currentFlipped: false,
      isPlaced: false,
      isHinted: false
    }));

    this.hintsLeft = 1;
    this.isCompleted = false;
    this.selectedPiece = null;
    this.resetCamera();
    this.resize();

    if (isReset) {
      this.clearAllSaves();
    } else {
      this.loadProgress();
    }

    const placed = this.getPlacedCount();
    this.isCompleted = (placed === this.pieces.length);

    this.drawBackgroundArtwork();
    this.drawBoard();
    if (this.onProgressUpdate) {
      this.onProgressUpdate(placed, this.pieces.length);
    }
  }

  clearAllSaves() {
    const keys = [
      'gatitos_geraldine_save_final_v1',
      'gatitos_geraldine_700_v1',
      'gatitos_realistic_save',
      'gatitos_save',
      'gatitos_game_save'
    ];
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  resetCamera() {
    this.cameraZoom = 1;
    this.cameraPanX = 0;
    this.cameraPanY = 0;
    this.panVelX = 0;
    this.panVelY = 0;
    this.drawBackgroundArtwork();
    this.drawBoard();
  }

  zoomIn() {
    this.cameraZoom = Math.min(4.5, this.cameraZoom * 1.3);
    this.drawBackgroundArtwork();
    this.drawBoard();
    if (this.audio) this.audio.playSparkle(750);
  }

  zoomOut() {
    this.cameraZoom = Math.max(0.35, this.cameraZoom / 1.3);
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
    return { left: left - 60, top: top - 60, right: left + width + 60, bottom: top + height + 60 };
  }

  screenToWorld(screenX, screenY) {
    const rect = this.gameCanvas.getBoundingClientRect();
    const clientX = screenX - rect.left;
    const clientY = screenY - rect.top;
    const cw = this.gameCanvas.width;
    const ch = this.gameCanvas.height;
    const effScale = this.baseScale * this.cameraZoom;

    const worldX = (clientX - (cw / 2 + this.cameraPanX)) / effScale + this.boardBaseSize / 2;
    const worldY = (clientY - (ch / 2 + this.cameraPanY)) / effScale + this.boardBaseSize / 2;
    return { x: worldX, y: worldY };
  }

  worldToScreen(worldX, worldY) {
    const rect = this.gameCanvas.getBoundingClientRect();
    const cw = this.gameCanvas.width;
    const ch = this.gameCanvas.height;
    const effScale = this.baseScale * this.cameraZoom;

    const screenX = (worldX - this.boardBaseSize / 2) * effScale + cw / 2 + this.cameraPanX + rect.left;
    const screenY = (worldY - this.boardBaseSize / 2) * effScale + ch / 2 + this.cameraPanY + rect.top;
    return { x: screenX, y: screenY };
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

    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (p.isHinted) {
        ctx.save();
        ctx.translate(p.targetX, p.targetY);
        ctx.beginPath();
        const poly = p.polygon;
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let j = 1; j < poly.length; j++) {
          ctx.lineTo(poly[j].x, poly[j].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(249, 214, 137, 0.45)';
        ctx.strokeStyle = '#f9d689';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderLoop() {
    if (!this.isPanning && !this.isDragging && (Math.abs(this.panVelX) > 0.1 || Math.abs(this.panVelY) > 0.1)) {
      this.cameraPanX += this.panVelX;
      this.cameraPanY += this.panVelY;
      this.panVelX *= 0.91;
      this.panVelY *= 0.91;

      const maxPan = this.boardBaseSize * this.baseScale * this.cameraZoom * 0.9;
      if (Math.abs(this.cameraPanX) > maxPan) this.panVelX *= 0.5;
      if (Math.abs(this.cameraPanY) > maxPan) this.panVelY *= 0.5;

      this.drawBackgroundArtwork();
      this.drawBoard();
    }

    const ctx = this.gameCtx;
    ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    ctx.save();
    this.applyCameraTransform(ctx);

    const viewBounds = this.getViewportWorldBounds();

    // 1. Dibujar piezas colocadas
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (!p.isPlaced || p === this.selectedPiece) continue;
      if (p.currentX < viewBounds.left || p.currentX > viewBounds.right || p.currentY < viewBounds.top || p.currentY > viewBounds.bottom) continue;
      this.drawRealCatPiece(ctx, p, p.currentX, p.currentY, p.currentAngle, p.currentFlipped, false);
    }

    // 2. Dibujar piezas sueltas en el tablero
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      if (p.isPlaced || p.currentX < -100 || p === this.selectedPiece) continue;
      if (p.currentX < viewBounds.left || p.currentX > viewBounds.right || p.currentY < viewBounds.top || p.currentY > viewBounds.bottom) continue;
      this.drawRealCatPiece(ctx, p, p.currentX, p.currentY, p.currentAngle, p.currentFlipped, false);
    }

    // 3. Dibujar la pieza seleccionada arriba de todas con aura
    if (this.selectedPiece && this.selectedPiece.currentX > -100) {
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

  /**
   * Renderizado Luminoso de Piezas con Realce de Sombras
   */
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

    // Fondo iluminado para piezas sueltas
    if (!piece.isPlaced) {
      ctx.fillStyle = 'rgba(120, 50, 140, 0.35)';
      ctx.fill();
    }

    ctx.save();
    ctx.clip();

    if (this.catImageLoaded) {
      // Realce de iluminación de sombras (Shadow Lift)
      ctx.filter = 'brightness(1.3) saturate(1.25) contrast(1.08)';
      ctx.drawImage(this.catImage, -piece.targetX, -piece.targetY, 1200, 1200);

      // Si no está colocada, velo sutil de starlight
      if (!piece.isPlaced) {
        ctx.fillStyle = 'rgba(255, 210, 235, 0.1)';
        ctx.fillRect(-60, -60, 120, 120);
      }
    } else {
      ctx.fillStyle = piece.color;
      ctx.fill();
    }
    ctx.restore();

    if (isSelected) {
      ctx.strokeStyle = '#ffd689';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#ffd689';
      ctx.shadowBlur = 10;
      ctx.stroke();
    } else if (!piece.isPlaced) {
      ctx.strokeStyle = 'rgba(255, 185, 215, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(255, 117, 160, 0.45)';
      ctx.shadowBlur = 5;
      ctx.stroke();
    }

    ctx.restore();
  }

  setupEvents() {
    const canvas = this.gameCanvas;

    const getTouchPos = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    };

    const handlePointerDown = (e) => {
      if (e.touches && e.touches.length === 2) {
        this.isDragging = false;
        this.isPanning = true;
        this.panVelX = 0;
        this.panVelY = 0;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.initialPinchDist = Math.hypot(dx, dy);
        this.initialPinchZoom = this.cameraZoom;
        this.panStart.x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        this.panStart.y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.panLast.x = this.panStart.x;
        this.panLast.y = this.panStart.y;
        return;
      }

      const { clientX, clientY } = getTouchPos(e);
      const worldPos = this.screenToWorld(clientX, clientY);

      let hitPiece = null;

      if (this.selectedPiece && !this.selectedPiece.isPlaced && this.selectedPiece.currentX > -100) {
        const screenPt = this.worldToScreen(this.selectedPiece.currentX, this.selectedPiece.currentY);
        const distScreen = Math.hypot(clientX - screenPt.x, clientY - screenPt.y);
        if (distScreen <= 50) {
          hitPiece = this.selectedPiece;
        }
      }

      if (!hitPiece) {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
          const p = this.pieces[i];
          if (!p.isPlaced && p.currentX > -100) {
            const screenPt = this.worldToScreen(p.currentX, p.currentY);
            const distScreen = Math.hypot(clientX - screenPt.x, clientY - screenPt.y);
            if (distScreen <= 46) {
              hitPiece = p;
              break;
            }
          }
        }
      }

      if (hitPiece) {
        this.selectPiece(hitPiece);
        this.isDragging = true;
        this.isPanning = false;
        this.panVelX = 0;
        this.panVelY = 0;
        this.dragOffset.x = worldPos.x - hitPiece.currentX;
        this.dragOffset.y = worldPos.y - hitPiece.currentY;

        if (this.audio) this.audio.playMew();
        if (navigator.vibrate) navigator.vibrate(10);
      } else {
        this.isPanning = true;
        this.isDragging = false;
        this.panVelX = 0;
        this.panVelY = 0;
        this.panStart.x = clientX;
        this.panStart.y = clientY;
        this.panLast.x = clientX;
        this.panLast.y = clientY;
      }
    };

    const handlePointerMove = (e) => {
      if (e.touches && e.touches.length === 2 && this.initialPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = currentDist / this.initialPinchDist;
        this.cameraZoom = Math.min(4.5, Math.max(0.35, this.initialPinchZoom * factor));

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.cameraPanX += (midX - this.panLast.x);
        this.cameraPanY += (midY - this.panLast.y);
        this.panLast.x = midX;
        this.panLast.y = midY;

        this.drawBackgroundArtwork();
        this.drawBoard();
        return;
      }

      const { clientX, clientY } = getTouchPos(e);

      if (this.isDragging && this.selectedPiece && !this.selectedPiece.isPlaced) {
        const worldPos = this.screenToWorld(clientX, clientY);
        this.selectedPiece.currentX = worldPos.x - this.dragOffset.x;
        this.selectedPiece.currentY = worldPos.y - this.dragOffset.y;
      } else if (this.isPanning) {
        const dx = clientX - this.panLast.x;
        const dy = clientY - this.panLast.y;
        this.cameraPanX += dx;
        this.cameraPanY += dy;

        this.panVelX = dx;
        this.panVelY = dy;

        this.panLast.x = clientX;
        this.panLast.y = clientY;

        this.drawBackgroundArtwork();
        this.drawBoard();
      }
    };

    const handlePointerUp = () => {
      this.initialPinchDist = null;
      if (this.selectedPiece && this.isDragging) {
        this.isDragging = false;
        this.trySnapPiece(this.selectedPiece);
        this.saveProgress(false);
      }
      this.isDragging = false;
      this.isPanning = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      handlePointerDown(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (e.cancelable && (this.isDragging || this.isPanning)) e.preventDefault();
      handlePointerMove(e);
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      handlePointerUp();
    }, { passive: false });

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

  selectPiece(piece) {
    if (!piece || piece.isPlaced) return;
    this.selectedPiece = piece;
    if (this.onPieceSelected) {
      this.onPieceSelected(piece);
    }
  }

  selectPieceFromTray(pieceId) {
    const piece = this.pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    if (piece.currentX < -50) {
      const bounds = this.getViewportWorldBounds();
      piece.currentX = (bounds.left + bounds.right) / 2;
      piece.currentY = (bounds.top + bounds.bottom) / 2;
    }

    this.selectPiece(piece);
    if (this.audio) this.audio.playMew();
    if (navigator.vibrate) navigator.vibrate(10);
  }

  rotateSelectedPiece(deltaAngle = 45) {
    if (!this.selectedPiece || this.selectedPiece.isPlaced) return;
    this.selectedPiece.currentAngle = (this.selectedPiece.currentAngle + deltaAngle + 360) % 360;
    if (this.audio) this.audio.playSparkle(720);
    if (navigator.vibrate) navigator.vibrate(8);
    this.trySnapPiece(this.selectedPiece);
    this.saveProgress(false);
  }

  flipSelectedPiece() {
    if (!this.selectedPiece || this.selectedPiece.isPlaced) return;
    this.selectedPiece.currentFlipped = !this.selectedPiece.currentFlipped;
    if (this.audio) this.audio.playSparkle(800);
    if (navigator.vibrate) navigator.vibrate(12);
    this.trySnapPiece(this.selectedPiece);
    this.saveProgress(false);
  }

  trySnapPiece(piece) {
    if (!piece || piece.isPlaced) return false;

    const dist = Math.hypot(piece.currentX - piece.targetX, piece.currentY - piece.targetY);
    const angleDiff = Math.abs((piece.currentAngle - piece.targetAngle + 360) % 360);
    const isAngleCorrect = (angleDiff <= this.snapToleranceAngle || angleDiff >= 360 - this.snapToleranceAngle);
    const flipMatches = (piece.currentFlipped === piece.targetFlipped);

    if (dist <= this.snapToleranceDist && isAngleCorrect && flipMatches) {
      piece.currentX = piece.targetX;
      piece.currentY = piece.targetY;
      piece.currentAngle = 0;
      piece.currentFlipped = false;
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
        this.audio.playKittenSnapSound(this.getPlacedCount());
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
        this.saveProgress(false);
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
        version: '700_v1',
        hintsLeft: this.hintsLeft,
        cameraZoom: this.cameraZoom,
        cameraPanX: this.cameraPanX,
        cameraPanY: this.cameraPanY,
        pieces: this.pieces.map(p => ({
          id: p.id,
          isPlaced: !!p.isPlaced,
          currentX: p.currentX,
          currentY: p.currentY,
          currentAngle: p.currentAngle || 0,
          currentFlipped: !!p.currentFlipped
        }))
      };
      localStorage.setItem(this.storageKey, JSON.stringify(saveData));
      if (showToast) {
        this.triggerRomanticWhisper("💌 ¡Progreso guardado para siempre!");
        if (this.audio) this.audio.playSparkle(880);
      }
    } catch (e) {
      console.warn("No se pudo guardar en localStorage", e);
    }
  }

  loadProgress() {
    try {
      const candidateKeys = [
        'gatitos_geraldine_save_final_v1',
        'gatitos_geraldine_700_v1',
        'gatitos_realistic_save',
        'gatitos_save',
        'gatitos_game_save'
      ];

      let raw = null;
      for (const k of candidateKeys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed && (Array.isArray(parsed.pieces) || Array.isArray(parsed.placedPieces))) {
              raw = item;
              break;
            }
          } catch (e) {}
        }
      }

      if (!raw) return false;
      const saveData = JSON.parse(raw);
      const pieceList = saveData.pieces || saveData.placedPieces;
      if (!Array.isArray(pieceList)) return false;

      if (typeof saveData.hintsLeft === 'number') this.hintsLeft = saveData.hintsLeft;
      if (typeof saveData.cameraZoom === 'number') this.cameraZoom = saveData.cameraZoom;
      if (typeof saveData.cameraPanX === 'number') this.cameraPanX = saveData.cameraPanX;
      if (typeof saveData.cameraPanY === 'number') this.cameraPanY = saveData.cameraPanY;

      pieceList.forEach(saved => {
        const p = this.pieces.find(item => item.id === saved.id);
        if (p) {
          if (saved.isPlaced) {
            p.isPlaced = true;
            p.currentX = p.targetX;
            p.currentY = p.targetY;
            p.currentAngle = 0;
            p.currentFlipped = false;
          } else if (typeof saved.currentX === 'number' && saved.currentX > -100) {
            p.currentX = saved.currentX;
            p.currentY = saved.currentY;
            p.currentAngle = saved.currentAngle || 0;
            p.currentFlipped = !!saved.currentFlipped;
          }
        }
      });

      this.updateHintButtonUI();
      this.saveProgress(false);
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
          if (this.audio) this.audio.playKittenSnapSound(idx);
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
          this.saveProgress(false);
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
