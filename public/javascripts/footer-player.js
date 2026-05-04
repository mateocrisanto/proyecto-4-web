/**
 * footer-player.js
 */
(function () {
  'use strict';

  var playlist = [
    { title: 'KLICK AUD',        src: '/songs/02092024_KLICKAUD.mp3' },
    { title: '2077',             src: '/songs/2077.mp3' },
    { title: 'Grounded',         src: '/songs/Grounded.mp3' },
    { title: 'Sonder - kibyuna', src: '/songs/Sonder_-_kibyuna_KLICKAUD.mp3' },
    { title: 'Synthwave Zen',    src: '/songs/Synthwave%20Zen%20%28Cyber%20Lo-Fi%29.mp3' }
  ];

  var currentIndex = 0;
  var audioCtx     = null;
  var analyser     = null;
  var animFrame    = null;
  var playing      = false;
  var decaying     = false;

  /* displayH[i] = altura mostrada de cada barra [0..1]
     Actúa como buffer suavizado: cada frame se interpola hacia el target */
  var displayH  = [];
  var DECAY     = 0.88;   /* factor multiplicativo por frame al pausar (~500 ms) */
  var LERP_ON   = 0.18;   /* velocidad de lerp hacia datos de audio (play)       */
  var LERP_IDLE = 0.06;   /* velocidad de lerp hacia onda idle (pausa)           */

  var audio        = document.getElementById('footer-audio');
  var canvas       = document.getElementById('footer-canvas');
  var canvasCtx    = canvas.getContext('2d');
  var btnPlay      = document.getElementById('fp-play');
  var btnPrev      = document.getElementById('fp-prev');
  var btnNext      = document.getElementById('fp-next');
  var titleEl      = document.getElementById('fp-title');
  var progressBar  = document.getElementById('fp-progress');
  var progressFill = document.getElementById('fp-progress-fill');

  function barColor(i, total, alpha) {
    var t = i / total;
    if (t < 0.33) return 'rgba(17, 193, 245, '  + alpha + ')';
    if (t < 0.66) return 'rgba(211, 116, 255, ' + alpha + ')';
    return 'rgba(244, 145, 191, ' + alpha + ')';
  }

  function resizeCanvas() {
    var footer = canvas.parentElement;
    canvas.width  = footer.clientWidth  || 1;
    canvas.height = footer.clientHeight || 1;
  }

  function loadTrack(index) {
    audio.src                = playlist[index].src;
    titleEl.textContent      = playlist[index].title;
    progressFill.style.width = '0%';
  }

  function setupAudioCtx() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    var source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  /* ── Loop único: idle / playing / decay en un solo requestAnimationFrame */
  function draw() {
    resizeCanvas();
    var w = canvas.width;
    var h = canvas.height;
    var T = Date.now() / 1000;
    var N = Math.max(1, Math.ceil(w / 6));   /* ~6 px por barra */

    /* Ajustar longitud del buffer sin perder valores */
    while (displayH.length < N) displayH.push(0);
    while (displayH.length > N) displayH.pop();

    if (playing && analyser) {
      /* ── Playing: cada barra = rango de bins de frecuencia ──────────
         Usamos el 75 % inferior del espectro (graves + medios visibles) */
      var buf      = new Uint8Array(analyser.frequencyBinCount);
      var useBins  = Math.floor(analyser.frequencyBinCount * 0.75);
      analyser.getByteFrequencyData(buf);
      for (var i = 0; i < N; i++) {
        var bin    = Math.round(i / (N - 1) * (useBins - 1));
        var target = buf[bin] / 255;
        displayH[i] += (target - displayH[i]) * LERP_ON;
      }
    } else if (decaying) {
      /* ── Decay al pausar: decaimiento exponencial hacia 0 ───────────
         A 60 fps con DECAY=0.88, tarda ~40 frames (~650 ms)            */
      var done = true;
      for (var i = 0; i < N; i++) {
        displayH[i] *= DECAY;
        if (displayH[i] > 0.004) done = false;
      }
      if (done) {
        decaying = false;
        for (var i = 0; i < N; i++) displayH[i] = 0;
      }
    } else {
      /* ── Idle: onda sinusoidal suave, fase distinta por barra ────────
         Al hacer play, displayH ya está en los valores idle → la
         transición hacia el audio es automáticamente suave (lerp)      */
      for (var i = 0; i < N; i++) {
        var tgt = (Math.sin(T * 1.4  + i * 0.30) * 0.5 + 0.5)
                * (Math.sin(T * 0.55 + i * 0.15 + 1) * 0.3 + 0.7)
                * 0.22;
        displayH[i] += (tgt - displayH[i]) * LERP_IDLE;
      }
    }

    /* ── Dibujar ─────────────────────────────────────────────────────── */
    canvasCtx.clearRect(0, 0, w, h);
    var barW = w / N;
    var gap  = Math.max(1, barW * 0.20);
    for (var i = 0; i < N; i++) {
      var bh    = Math.min(displayH[i] * h * 0.90, h * 0.95);
      var alpha = playing
        ? Math.max(0.05, displayH[i] * 0.80)
        : Math.max(0.02, displayH[i] * 0.40);
      canvasCtx.fillStyle = barColor(i, N, alpha);
      canvasCtx.fillRect(i * barW + gap / 2, h - bh, barW - gap, bh);
    }
    animFrame = requestAnimationFrame(draw);
  }

  function startPlaying() {
    setupAudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audio.play().catch(function () {});
    playing  = true;
    decaying = false;
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
    /* draw() ya está corriendo; cambia automáticamente al modo audio */
  }

  function pausePlaying() {
    audio.pause();
    playing  = false;
    decaying = true;
    btnPlay.innerHTML = '<i class="fas fa-play"></i>';
    /* draw() detecta decaying=true → aplica decay → luego pasa a idle */
  }

  btnPlay.addEventListener('click', function () {
    if (playing) pausePlaying();
    else startPlaying();
  });

  btnNext.addEventListener('click', function () {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex);
    if (playing) audio.play().catch(function () {});
  });

  btnPrev.addEventListener('click', function () {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentIndex);
    if (playing) audio.play().catch(function () {});
  });

  audio.addEventListener('ended', function () {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex);
    if (playing) audio.play().catch(function () {});
  });

  audio.addEventListener('timeupdate', function () {
    if (audio.duration) {
      progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  progressBar.addEventListener('click', function (e) {
    if (!audio.duration) return;
    var rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  window.addEventListener('resize', function () { resizeCanvas(); });

  loadTrack(0);
  resizeCanvas();
  audio.volume = 0.5;
  draw();   /* inicia el loop: arranca en modo idle, espera al botón play */

}());

