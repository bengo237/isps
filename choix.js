/* Page de choix : halo qui suit le pointeur sur les deux cartes */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll(".model"), function (m) {
    m.addEventListener("pointermove", function (e) {
      var r = m.getBoundingClientRect();
      m.style.setProperty("--mx", (e.clientX - r.left) + "px");
      m.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();
