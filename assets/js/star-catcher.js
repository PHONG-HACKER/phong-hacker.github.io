// Easter egg: secret code check + the Star Catcher mini game
(function () {
  var SECRET = "U1RBUkRVU1Q="; // the code, lightly scrambled so it isn't plain text here
  var UNLOCK_KEY = "phong-easter-egg-unlocked";
  var BEST_KEY = "phong-star-catcher-best";

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

    var rocket, things, score, lives, spawnTimer, speed, running, keys = {}, lastTime, hurtFlash, pops;

    function reset() {
      rocket = { x: W / 2, y: H - 50, w: 44, h: 54, target: W / 2 };
      things = []; pops = [];
      score = 0; lives = 3; spawnTimer = 0; speed = 2.2; hurtFlash = 0;
    }

    function spawn() {
      var bad = Math.random() < Math.min(0.18 + score * 0.006, 0.45);
      things.push({
        x: 20 + Math.random() * (W - 40), y: -20,
        r: bad ? 14 + Math.random() * 8 : 13,
        vy: speed * (0.8 + Math.random() * 0.6),
        bad: bad, spin: Math.random() * Math.PI
      });
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

    function drawAsteroid(x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath();
      for (var k = 0; k < 9; k++) {
        var a = (Math.PI * 2 / 9) * k;
        var rad = r * (k % 2 ? 0.8 : 1);
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.shadowColor = "#ff3b3b"; ctx.shadowBlur = 14;
      ctx.fillStyle = "#c2412f"; ctx.fill();
      ctx.fillStyle = "#8a2a1f";
      ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.3, r * 0.25, r * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawRocket() {
      var x = rocket.x, y = rocket.y;
      ctx.save();
      // flame
      ctx.fillStyle = "rgba(255,160,40," + (0.6 + Math.random() * 0.4) + ")";
      ctx.beginPath(); ctx.moveTo(x - 9, y + 20); ctx.lineTo(x, y + 34 + Math.random() * 10); ctx.lineTo(x + 9, y + 20); ctx.fill();
      // fins
      ctx.fillStyle = "#d45cff";
      ctx.beginPath(); ctx.moveTo(x - 12, y + 4); ctx.lineTo(x - 22, y + 22); ctx.lineTo(x - 10, y + 20); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 12, y + 4); ctx.lineTo(x + 22, y + 22); ctx.lineTo(x + 10, y + 20); ctx.fill();
      // body
      ctx.shadowColor = "#a98bff"; ctx.shadowBlur = 14;
      ctx.fillStyle = "#eae6ff";
      ctx.beginPath();
      ctx.moveTo(x, y - 27);
      ctx.quadraticCurveTo(x + 15, y - 8, x + 12, y + 22);
      ctx.lineTo(x - 12, y + 22);
      ctx.quadraticCurveTo(x - 15, y - 8, x, y - 27);
      ctx.fill();
      // window
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#4aa8ff";
      ctx.beginPath(); ctx.arc(x, y - 4, 6, 0, Math.PI * 2); ctx.fill();
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
      ctx.textAlign = "right";
      ctx.fillText("❤️".repeat(lives), W - 14, 32);
      ctx.textAlign = "left";
    }

    function update(dt) {
      // move rocket
      if (keys.left) rocket.target -= 7 * dt;
      if (keys.right) rocket.target += 7 * dt;
      rocket.target = Math.max(22, Math.min(W - 22, rocket.target));
      rocket.x += (rocket.target - rocket.x) * Math.min(1, 0.25 * dt);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = Math.max(14, 42 - score * 0.6);
      }
      speed = 2.2 + score * 0.05;

      for (var i = things.length - 1; i >= 0; i--) {
        var t = things[i];
        t.y += t.vy * dt; t.spin += 0.03 * dt;
        var dx = t.x - rocket.x, dy = t.y - rocket.y;
        if (Math.abs(dx) < t.r + 14 && Math.abs(dy) < t.r + 24) {
          things.splice(i, 1);
          if (t.bad) {
            lives--; hurtFlash = 12;
            if (lives <= 0) return gameOver();
          } else {
            score++;
            pops.push({ x: t.x, y: t.y, life: 30 });
          }
          continue;
        }
        if (t.y > H + 30) things.splice(i, 1);
      }
      pops.forEach(function (p) { p.life -= dt; p.y -= 0.8 * dt; });
      pops = pops.filter(function (p) { return p.life > 0; });
      if (hurtFlash > 0) hurtFlash -= dt;
    }

    function draw(dt) {
      drawBackground(dt);
      things.forEach(function (t) {
        if (t.bad) drawAsteroid(t.x, t.y, t.r, t.spin); else drawStar(t.x, t.y, t.r, t.spin);
      });
      drawRocket();
      ctx.font = "bold 18px sans-serif"; ctx.fillStyle = "#ffe44d"; ctx.textAlign = "center";
      pops.forEach(function (p) { ctx.globalAlpha = p.life / 30; ctx.fillText("+1", p.x, p.y); });
      ctx.globalAlpha = 1; ctx.textAlign = "left";
      if (hurtFlash > 0) { ctx.fillStyle = "rgba(255,40,40," + hurtFlash / 30 + ")"; ctx.fillRect(0, 0, W, H); }
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
      overlayTitle.textContent = newBest ? "🏆 New best score!" : "Game over!";
      overlayText.textContent = "You caught " + score + " star" + (score === 1 ? "" : "s") + ". Best: " + best;
      startBtn.textContent = "↻ Play again";
      overlay.hidden = false;
    }

    // controls
    function pointerTo(clientX) {
      var rect = canvas.getBoundingClientRect();
      rocket.target = (clientX - rect.left) * (W / rect.width);
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
    startBtn.addEventListener("click", start);

    reset();
    draw(0);
  }
})();
