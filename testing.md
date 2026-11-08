---
layout: page
title: Game Testing
permalink: /testing/
js:
  - "/assets/js/game-testing.js"
---

<div class="secret-box">
  <p class="secret-intro">
    Phong is giving out codes to people who want to test his game, type in a code to try a game before it is released.
  </p>

  <form id="tester-form" class="secret-form" autocomplete="off">
    <label for="tester-code">Enter your tester code:</label>
    <div class="secret-row">
      <input id="tester-code" type="text" placeholder="Type your code here" spellcheck="false">
      <button type="submit">Test it 🧪</button>
    </div>
    <p id="tester-msg" class="secret-msg" role="status"></p>
  </form>
</div>
