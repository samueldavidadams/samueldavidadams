(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // time-of-day: greeting text (where present) and a subtle background tint
  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";
  var tint = hour < 12 ? "#fbf8ef" : hour < 18 ? "#fffbf1" : "#fdf3e4";

  document.querySelectorAll("#greeting, #dockGreeting").forEach(function (el) {
    el.textContent = greeting;
  });
  document.body.style.backgroundColor = tint;

  // fade the page in on load
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("page-loaded");
    });
  });

  // spin the tab favicon — redraws the same hexagon from favicon.svg onto a
  // canvas at an increasing rotation and swaps it in as the favicon each tick
  if (!reduceMotion) {
    (function animateFavicon() {
      var iconLink = document.querySelector('link[rel="icon"]');
      if (!iconLink) return;

      var canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      var ctx = canvas.getContext("2d");
      var angle = 0;

      function drawFrame() {
        ctx.clearRect(0, 0, 32, 32);
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(angle);
        ctx.beginPath();
        var r = 13;
        for (var i = 0; i < 6; i++) {
          var a = ((Math.PI * 2) / 6) * i - Math.PI / 2;
          var x = r * Math.cos(a);
          var y = r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        var newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.type = "image/png";
        newLink.href = canvas.toDataURL("image/png");
        var old = document.querySelector('link[rel="icon"]');
        if (old) old.remove();
        document.head.appendChild(newLink);
      }

      setInterval(function () {
        angle += 0.15;
        drawFrame();
      }, 80);
    })();
  }

  // when a page is restored from the back/forward cache (e.g. iOS swipe-back),
  // it comes back exactly as it was frozen mid-fade-out — force it visible again
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("page-leaving");
    document.body.classList.add("page-loaded");
  });

  // fade out before navigating to another page on this site
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    var link = e.target.closest("a");
    if (!link || link.target === "_blank") return;
    if (link.hostname && link.hostname !== window.location.hostname) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;

    if (reduceMotion) return; // let the browser navigate immediately

    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(function () {
      window.location.href = link.href;
    }, 220);
  });
})();
