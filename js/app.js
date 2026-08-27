/**
 * app.js - Orquestador para Geraldine con Preloader 3D de Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const boardCanvas = document.getElementById('board-canvas');
  const gameCanvas = document.getElementById('game-canvas');
  const fxCanvas = document.getElementById('fx-canvas');
  const ambientCanvas = document.getElementById('ambient-canvas');
  
  const progressBarFill = document.getElementById('progress-bar-fill');
  const statusText = document.getElementById('status-text');
  const trayCount = document.getElementById('tray-count');
  const piecesTray = document.getElementById('pieces-tray');
  const pieceControlsOverlay = document.getElementById('piece-controls-overlay');
  const islandProgress = document.getElementById('island-progress');
  const dynamicIsland = document.getElementById('dynamic-island');

  const btnHelp = document.getElementById('btn-help');
  const instructionsModal = document.getElementById('instructions-modal');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');
  const gestureTipText = document.getElementById('gesture-tip-text');

  const btnSave = document.getElementById('btn-save');
  const btnHint = document.getElementById('btn-hint');
  const btnSound = document.getElementById('btn-sound');
  const soundEmoji = document.getElementById('sound-emoji');
  const btnRestart = document.getElementById('btn-restart');
  const btnRotateLeft = document.getElementById('btn-rotate-left');
  const btnRotateRight = document.getElementById('btn-rotate-right');
  const btnFlip = document.getElementById('btn-flip');
  const btnReplay = document.getElementById('btn-replay');
  const btnToggleFrame = document.getElementById('btn-toggle-frame');
  const btnSolveNow = document.getElementById('btn-solve-now');
  
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  
  const deviceContainer = document.getElementById('device-container');

  let puzzle = null;
  let particleEngine = null;
  let cinematic = null;

  // 1. Inicializar Preloader 3D Cósmico con Three.js
  const preloader = new Romantic3DPreloader({
    onComplete: () => {
      unlockAudio();
      window.romanticAudio.playKittenSnapSound(0);
    }
  });

  // 2. Inicializar Motores
  particleEngine = new RomanticParticleEngine(fxCanvas, ambientCanvas);
  cinematic = new RomanticVictoryCinematic({ audio: window.romanticAudio });

  puzzle = new RomanticCatPuzzle({
    boardCanvas,
    gameCanvas,
    particleEngine,
    audio: window.romanticAudio,
    onProgressUpdate: (placed, total) => {
      const pct = Math.round((placed / total) * 100);
      progressBarFill.style.width = `${pct}%`;
      trayCount.textContent = total - placed;
      if (islandProgress) islandProgress.textContent = `${pct}%`;

      if (placed === 0) {
        statusText.innerHTML = `<span class="heart-pulse">💗</span> Para Geraldine con amor: toca un gatito abajo...`;
      } else if (placed < total) {
        statusText.innerHTML = `<span class="heart-pulse">💖</span> ${placed} de ${total} piezas unidas para Geraldine (${pct}%)...`;
      } else {
        statusText.innerHTML = `<span class="heart-pulse">✨</span> ¡El mosaico de Geraldine está completo!`;
      }

      updateTrayCards();
    },
    onPieceSelected: (piece) => {
      if (piece) {
        pieceControlsOverlay.classList.add('visible');
        highlightTrayCard(piece.id);
      } else {
        pieceControlsOverlay.classList.remove('visible');
      }
    },
    onLevelComplete: (levelData) => {
      cinematic.start(levelData);
    }
  });

  puzzle.onImageReady = () => {
    buildTray(MASTER_LEVEL.pieces);
  };

  // 3. Iniciar Partida
  function initGame(isReset = false) {
    if (isReset) {
      localStorage.removeItem('gatitos_realistic_save');
    }
    puzzle.loadLevel(MASTER_LEVEL);
    buildTray(MASTER_LEVEL.pieces);
    puzzle.updateHintButtonUI();
    pieceControlsOverlay.classList.remove('visible');
  }

  // 4. Construir Bandeja con Miniaturas
  function buildTray(pieces) {
    piecesTray.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const limit = Math.min(pieces.length, 60);

    for (let i = 0; i < limit; i++) {
      const p = pieces[i];
      const card = document.createElement('div');
      card.className = 'tray-cat-card' + (p.isPlaced ? ' placed' : '');
      card.id = `tray-card-${p.id}`;
      card.title = p.name;
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');

      const miniCanvas = document.createElement('canvas');
      miniCanvas.className = 'tray-cat-canvas';
      miniCanvas.width = 54;
      miniCanvas.height = 54;
      renderRealPieceThumbnail(miniCanvas, p);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tray-cat-name';
      nameSpan.textContent = p.name;

      card.appendChild(miniCanvas);
      card.appendChild(nameSpan);

      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        unlockAudio();
        puzzle.selectPieceFromTray(p.id);
      });

      fragment.appendChild(card);
    }

    piecesTray.appendChild(fragment);
  }

  function renderRealPieceThumbnail(canvas, piece) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 54, 54);
    ctx.save();
    ctx.translate(27, 27);
    ctx.scale(0.8, 0.8);

    ctx.beginPath();
    const poly = piece.polygon;
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y);
    }
    ctx.closePath();

    ctx.save();
    ctx.clip();

    if (puzzle.catImageLoaded) {
      ctx.drawImage(puzzle.catImage, -piece.targetX, -piece.targetY, 1200, 1200);
    } else {
      ctx.fillStyle = piece.color;
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  function updateTrayCards() {
    puzzle.pieces.forEach(p => {
      const card = document.getElementById(`tray-card-${p.id}`);
      if (card) {
        card.classList.toggle('placed', p.isPlaced);
      }
    });
  }

  function highlightTrayCard(pieceId) {
    document.querySelectorAll('.tray-cat-card').forEach(c => c.classList.remove('selected'));
    const target = document.getElementById(`tray-card-${pieceId}`);
    if (target) {
      target.classList.add('selected');
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // 5. Gestión de Audio
  let audioUnlocked = false;
  function unlockAudio() {
    if (!audioUnlocked) {
      window.romanticAudio.init();
      audioUnlocked = true;
    }
  }
  window.addEventListener('pointerdown', unlockAudio, { once: true });

  // 6. Botones y Eventos
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      unlockAudio();
      instructionsModal.classList.add('active');
    });
  }

  if (btnCloseInstructions) {
    btnCloseInstructions.addEventListener('click', () => {
      unlockAudio();
      instructionsModal.classList.remove('active');
      localStorage.setItem('gatitos_saw_instructions', 'true');
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      unlockAudio();
      puzzle.saveProgress(true);
    });
  }

  if (btnHint) {
    btnHint.addEventListener('click', () => {
      unlockAudio();
      puzzle.showHint();
    });
  }

  btnSound.addEventListener('click', () => {
    unlockAudio();
    const isUnmuted = window.romanticAudio.toggleMute();
    if (soundEmoji) soundEmoji.textContent = isUnmuted ? '🔊' : '🔇';
  });

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      unlockAudio();
      puzzle.zoomIn();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      unlockAudio();
      puzzle.zoomOut();
    });
  }

  if (btnZoomReset) {
    btnZoomReset.addEventListener('click', () => {
      unlockAudio();
      puzzle.resetCamera();
    });
  }

  btnRestart.addEventListener('click', () => {
    unlockAudio();
    if (confirm("¿Deseas reiniciar el mosaico y comenzar de nuevo?")) {
      initGame(true);
    }
  });

  btnRotateLeft.addEventListener('click', () => {
    unlockAudio();
    puzzle.rotateSelectedPiece(-45);
  });

  btnRotateRight.addEventListener('click', () => {
    unlockAudio();
    puzzle.rotateSelectedPiece(45);
  });

  btnFlip.addEventListener('click', () => {
    unlockAudio();
    puzzle.flipSelectedPiece();
  });

  btnReplay.addEventListener('click', () => {
    cinematic.stop();
    initGame(true);
  });

  if (dynamicIsland) {
    dynamicIsland.addEventListener('click', () => {
      dynamicIsland.classList.toggle('expanded');
      unlockAudio();
      window.romanticAudio.playMew();
      if (navigator.vibrate) navigator.vibrate([10, 20]);
    });
  }

  if (btnToggleFrame) {
    btnToggleFrame.addEventListener('click', () => {
      deviceContainer.classList.toggle('iphone-framed');
      setTimeout(() => {
        puzzle.resize();
        particleEngine.resize();
      }, 250);
    });
  }

  if (btnSolveNow) {
    btnSolveNow.addEventListener('click', () => {
      unlockAudio();
      puzzle.autoSolve();
    });
  }

  // Tips de gestos rotativos dedicados
  const gestureTips = [
    { icon: "💖", text: "Para Geraldine con todo mi amor eterno" },
    { icon: "🤏", text: "Pellizca con 2 dedos para hacer Zoom" },
    { icon: "🔄", text: "Toca 2 veces rápido sobre un gatito para girarlo" },
    { icon: "🖐️", text: "Arrastra el gatito hacia su silueta para encajarlo" },
    { icon: "✨", text: "Usa la pista con cuidado: ¡solo tienes 1 uso!" }
  ];
  let tipIndex = 0;
  setInterval(() => {
    tipIndex = (tipIndex + 1) % gestureTips.length;
    const item = gestureTips[tipIndex];
    if (gestureTipText) {
      gestureTipText.textContent = item.text;
      const icon = document.querySelector('.gesture-icon');
      if (icon) icon.textContent = item.icon;
    }
  }, 4200);

  window.addEventListener('resize', () => {
    puzzle.resize();
    particleEngine.resize();
  });

  if (window.innerWidth >= 500 && window.innerHeight >= 700) {
    deviceContainer.classList.add('iphone-framed');
  }

  // Iniciar juego
  initGame(false);
});
