// Yellow glowing stars that fall down the left and right sides of every page
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var layer = document.createElement("div");
  layer.className = "falling-stars";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var STARS_PER_SIDE = 9;
  var SIDE_WIDTH = 14; // percent of the screen width on each side

  function setUpStar(star) {
    var onLeft = star.dataset.side === "left";
    var pos = Math.random() * SIDE_WIDTH;
    star.style.left = (onLeft ? pos : 100 - SIDE_WIDTH + pos) + "%";
    star.style.fontSize = (10 + Math.random() * 16) + "px";
    star.style.animationDuration = (6 + Math.random() * 7) + "s, " + (1 + Math.random() * 1.5) + "s";
  }

  ["left", "right"].forEach(function (side) {
    for (var i = 0; i < STARS_PER_SIDE; i++) {
      var star = document.createElement("span");
      star.className = "falling-star";
      star.textContent = "★";
      star.dataset.side = side;
      setUpStar(star);
      // Start at a random point so the stars don't all fall together
      star.style.animationDelay = (-Math.random() * 12) + "s, 0s";
      star.addEventListener("animationiteration", function (e) {
        if (e.animationName === "star-fall") setUpStar(e.target);
      });
      layer.appendChild(star);
    }
  });
})();
