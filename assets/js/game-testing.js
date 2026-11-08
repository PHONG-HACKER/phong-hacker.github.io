// Game Testing page: tester codes unlock games that aren't released yet.
(function () {
  // Add tester codes here, one per line, like this:
  //   "MYCODE123": { name: "My New Game", url: "https://phong-hacker.github.io/my-new-game/" },
  // Codes work with capital or small letters.
  var CODES = {
  };

  var form = document.getElementById("tester-form");
  var input = document.getElementById("tester-code");
  var msg = document.getElementById("tester-msg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var guess = input.value.trim().toUpperCase().replace(/\s+/g, "");
    var game = CODES[guess];
    if (game) {
      msg.textContent = "✅ Code accepted! Opening " + game.name + "…";
      msg.className = "secret-msg good";
      window.location.href = game.url;
    } else {
      msg.textContent = guess ? "❌ That code doesn't work. Check it and try again!" : "Type a code first!";
      msg.className = "secret-msg bad";
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  });
})();
