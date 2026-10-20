// Easter egg: secret code check + the Cat Star Catcher mini game
(function () {
  var SECRET = "U1RBUkRVU1Q="; // the code, lightly scrambled so it isn't plain text here
  var UNLOCK_KEY = "phong-easter-egg-unlocked";
  var BEST_KEY = "phong-cat-star-catcher-best";

  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  var form = document.getElementById("secret-form");
  var input = document.getElementById("secret-code");
  var msg = document.getElementById("secret-msg");
  var zone = document.getElementById("game-zone");

  function unlock(scroll) {
    msg.textContent = "🎉 Correct! You cracked the code! Scroll down to play!";
    msg.className = "secret-msg good";
    zone.hidden = false;
    setUpGame();
    if (scroll) zone.scrollIntoView({ behavior: "smooth" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var guess = input.value.trim().toUpperCase().replace(/\s+/g, "");
    if (btoa(guess) === SECRET) {
      save(UNLOCK_KEY, "yes");
      unlock(true);
    } else {
      msg.textContent = "❌ That's not it. Keep searching the website!";
      msg.className = "secret-msg bad";
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  });

  if (load(UNLOCK_KEY) === "yes") unlock(false);

  // ---------------- The game ----------------
  var ready = false;
  function setUpGame() {
    if (ready) return;
    ready = true;

    var canvas = document.getElementById("star-catcher");
    var ctx = canvas.getContext("2d");
    var overlay = document.getElementById("game-overlay");
    var overlayTitle = document.getElementById("game-overlay-title");
    var overlayText = document.getElementById("game-overlay-text");
    var startBtn = document.getElementById("game-start");
    var W = canvas.width, H = canvas.height;

    var best = parseInt(load(BEST_KEY), 10) || 0;
    overlayText.textContent = best ? "Best score: " + best : "";

    var bgStars = [];
    for (var i = 0; i < 70; i++) {
      bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3, s: Math.random() * 0.6 + 0.2 });
    }

    var cat, stars, score, spawnTimer, speed, running, paused = false, keys = {}, lastTime, pops, missed;

    function reset() {
      cat = { x: W / 2, y: H - 46, target: W / 2 };
      stars = []; pops = []; missed = null;
      score = 0; spawnTimer = 0; speed = 2;
    }

    function spawn() {
      // Keep each new star close enough to the last one that the cat can reach it
      var last = stars.length ? stars[stars.length - 1].x : cat.x;
      var reach = 140 + Math.max(0, 260 - score * 4);
      var x = last + (Math.random() * 2 - 1) * reach;
      x = Math.max(24, Math.min(W - 24, x));
      stars.push({ x: x, y: -20, r: 13, vy: speed * (0.85 + Math.random() * 0.3), spin: Math.random() * Math.PI });
    }

    function drawStar(x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath();
      for (var k = 0; k < 10; k++) {
        var rad = k % 2 === 0 ? r : r * 0.45;
        var a = (Math.PI / 5) * k - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.shadowColor = "#ffd000"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffe44d"; ctx.fill();
      ctx.restore();
    }

    function drawCat() {
      var x = cat.x, y = cat.y;
      ctx.save();
      ctx.shadowColor = "#a98bff"; ctx.shadowBlur = 14;
      // tail
      ctx.strokeStyle = "#f2a64a"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x + 18, y + 30); ctx.quadraticCurveTo(x + 44, y + 22, x + 36, y - 2); ctx.stroke();
      // body
      ctx.fillStyle = "#f2a64a";
      ctx.beginPath(); ctx.ellipse(x, y + 26, 24, 18, 0, 0, Math.PI * 2); ctx.fill();
      // paws up, ready to catch
      ctx.beginPath(); ctx.ellipse(x - 24, y - 4, 7, 12, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 24, y - 4, 7, 12, 0.4, 0, Math.PI * 2); ctx.fill();
      // ears
      ctx.beginPath(); ctx.moveTo(x - 20, y - 8); ctx.lineTo(x - 15, y - 30); ctx.lineTo(x - 4, y - 14); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 20, y - 8); ctx.lineTo(x + 15, y - 30); ctx.lineTo(x + 4, y - 14); ctx.fill();
      // head
      ctx.beginPath(); ctx.arc(x, y - 4, 19, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // inner ears
      ctx.fillStyle = "#ffc8d8";
      ctx.beginPath(); ctx.moveTo(x - 16, y - 12); ctx.lineTo(x - 14, y - 24); ctx.lineTo(x - 8, y - 15); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 16, y - 12); ctx.lineTo(x + 14, y - 24); ctx.lineTo(x + 8, y - 15); ctx.fill();
      // stripes
      ctx.strokeStyle = "#c97a26"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x - 5, y - 22); ctx.lineTo(x - 4, y - 15); ctx.moveTo(x + 5, y - 22); ctx.lineTo(x + 4, y - 15); ctx.stroke();
      // eyes (look up at the stars)
      ctx.fillStyle = "#1a0d3d";
      ctx.beginPath(); ctx.ellipse(x - 7, y - 7, 3.2, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 7, y - 7, 3.2, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x - 6, y - 9, 1.2, 0, Math.PI * 2); ctx.arc(x + 8, y - 9, 1.2, 0, Math.PI * 2); ctx.fill();
      // nose + mouth
      ctx.fillStyle = "#ff7aa2";
      ctx.beginPath(); ctx.moveTo(x - 2.5, y); ctx.lineTo(x + 2.5, y); ctx.lineTo(x, y + 3); ctx.fill();
      ctx.strokeStyle = "#1a0d3d"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.quadraticCurveTo(x - 3, y + 7, x - 6, y + 4);
      ctx.moveTo(x, y + 3); ctx.quadraticCurveTo(x + 3, y + 7, x + 6, y + 4); ctx.stroke();
      // whiskers
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 9, y + 1); ctx.lineTo(x - 22, y - 2); ctx.moveTo(x - 9, y + 3); ctx.lineTo(x - 22, y + 5);
      ctx.moveTo(x + 9, y + 1); ctx.lineTo(x + 22, y - 2); ctx.moveTo(x + 9, y + 3); ctx.lineTo(x + 22, y + 5);
      ctx.stroke();
      ctx.restore();
    }

    function drawBackground(dt) {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#07051a"); g.addColorStop(1, "#1a0d3d");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      bgStars.forEach(function (s) {
        s.y += s.s * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.globalAlpha = 0.5 + s.s;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function drawHud() {
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#fff"; ctx.textAlign = "left";
      ctx.fillText("⭐ " + score, 14, 32);
    }

    function update(dt) {
      if (keys.left) cat.target -= 8 * dt;
      if (keys.right) cat.target += 8 * dt;
      cat.target = Math.max(30, Math.min(W - 30, cat.target));
      cat.x += (cat.target - cat.x) * Math.min(1, 0.3 * dt);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = Math.max(30, 70 - score * 0.8);
      }
      speed = Math.min(6.5, 2 + score * 0.06);

      for (var i = stars.length - 1; i >= 0; i--) {
        var t = stars[i];
        t.y += t.vy * dt; t.spin += 0.03 * dt;
        // caught if it touches the cat's head or paws
        if (Math.abs(t.x - cat.x) < t.r + 30 && t.y > cat.y - 34 && t.y < cat.y + 10) {
          stars.splice(i, 1);
          score++;
          pops.push({ x: t.x, y: t.y, life: 30 });
          continue;
        }
        // a star hit the ground: game over!
        if (t.y > H - 6) {
          missed = t;
          return gameOver();
        }
      }
      pops.forEach(function (p) { p.life -= dt; p.y -= 0.8 * dt; });
      pops = pops.filter(function (p) { return p.life > 0; });
    }

    function draw(dt) {
      drawBackground(dt);
      stars.forEach(function (t) { drawStar(t.x, t.y, t.r, t.spin); });
      drawCat();
      ctx.font = "bold 18px sans-serif"; ctx.fillStyle = "#ffe44d"; ctx.textAlign = "center";
      pops.forEach(function (p) { ctx.globalAlpha = p.life / 30; ctx.fillText("+1", p.x, p.y); });
      ctx.globalAlpha = 1; ctx.textAlign = "left";
      if (missed) {
        // red ring around the star that got away
        ctx.strokeStyle = "#ff5a5a"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(missed.x, missed.y, 22, 0, Math.PI * 2); ctx.stroke();
      }
      drawHud();
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(3, (now - lastTime) / (1000 / 60));
      lastTime = now;
      update(dt);
      if (running) draw(dt);
      requestAnimationFrame(loop);
    }

    function start() {
      reset();
      overlay.hidden = true;
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }

    function gameOver() {
      running = false;
      draw(0);
      var newBest = score > best;
      if (newBest) { best = score; save(BEST_KEY, String(best)); }
      overlayTitle.textContent = newBest ? "🏆 New best score!" : "Oh no, a star fell!";
      overlayText.textContent = "You caught " + score + " star" + (score === 1 ? "" : "s") + ". Best: " + best;
      startBtn.textContent = "↻ Play again";
      overlay.hidden = false;
    }

    // Pause if you switch tabs, so a star doesn't fall while you're away
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && running) {
        running = false;
        paused = true;
        overlayTitle.textContent = "Paused";
        overlayText.textContent = "Score: " + score;
        startBtn.textContent = "▶ Keep playing";
        overlay.hidden = false;
      }
    });
    function resume() {
      paused = false;
      overlay.hidden = true;
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }

    // controls
    function pointerTo(clientX) {
      var rect = canvas.getBoundingClientRect();
      cat.target = (clientX - rect.left) * (W / rect.width);
    }
    canvas.addEventListener("mousemove", function (e) { if (running) pointerTo(e.clientX); });
    canvas.addEventListener("touchstart", function (e) { if (running) { pointerTo(e.touches[0].clientX); e.preventDefault(); } }, { passive: false });
    canvas.addEventListener("touchmove", function (e) { if (running) { pointerTo(e.touches[0].clientX); e.preventDefault(); } }, { passive: false });
    window.addEventListener("keydown", function (e) {
      if (!running) return;
      if (e.key === "ArrowLeft" || e.key === "a") { keys.left = true; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { keys.right = true; e.preventDefault(); }
    });
    window.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    });
    startBtn.addEventListener("click", function () { if (paused) resume(); else start(); });

    reset();
    draw(0);
  }
})();
