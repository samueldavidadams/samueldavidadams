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

  // reveal the dock bar, where present
  var dockBar = document.getElementById("dockBar");
  if (dockBar) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dockBar.classList.add("visible");
      });
    });
  }

  // honeycomb layout — works for any number of .hive elements on the page,
  // each populated with any number of .app-icon children. Positions are
  // computed as an explicit (x, y) coordinate system rather than inferred
  // from flexbox centering, so there is no icon count/screen width
  // combination that can produce overlapping hexes. Re-queries the DOM
  // fresh on every call (rather than capturing element lists once), so
  // pages that add hexes dynamically (e.g. after a fetch) can just call
  // window.layoutHives() again once their content is in place.
  var layoutHive = function (hive, icons) {
    // approximates the CSS clamp(5.5rem, 24vw, 8.5rem) used for --hex-w
    var hexW = Math.min(Math.max(88, window.innerWidth * 0.24), 136);
    var hexH = hexW * 1.1547;
    var rowStep = hexH * 0.75;
    var containerWidth = hive.clientWidth || hexW;
    var cols = Math.max(1, Math.floor(containerWidth / hexW));

    var placements = [];
    var i = 0;
    var rowIndex = 0;
    while (i < icons.length) {
      var isOffset = rowIndex % 2 === 1;
      var count = isOffset ? Math.max(1, cols - 1) : cols;
      var rowOffsetX = isOffset ? hexW / 2 : 0;
      for (var c = 0; c < count && i < icons.length; c++, i++) {
        placements.push({
          el: icons[i],
          x: rowOffsetX + c * hexW,
          y: rowIndex * rowStep,
        });
      }
      rowIndex++;
    }

    if (!placements.length) return;

    var contentWidth = cols * hexW;
    var xOffset = (containerWidth - contentWidth) / 2;
    var hiveHeight = (rowIndex - 1) * rowStep + hexH;

    hive.style.height = hiveHeight + "px";
    placements.forEach(function (p) {
      p.el.style.left = (p.x + xOffset) + "px";
      p.el.style.top = p.y + "px";
      p.el.style.width = hexW + "px";
      hive.appendChild(p.el);
    });
  };

  var layoutAllHives = function (resetAnimation) {
    var hiveEls = Array.prototype.slice.call(document.querySelectorAll(".hive"));
    hiveEls.forEach(function (hive) {
      var icons = Array.prototype.slice.call(hive.children);
      icons.forEach(function (el, i) {
        if (resetAnimation) {
          el.style.animation = "none";
        } else if (!el.dataset.staggered) {
          el.style.animationDelay = (i * 0.15) + "s";
          el.dataset.staggered = "true";
        }
      });
      layoutHive(hive, icons);
    });
  };

  window.layoutHives = layoutAllHives;

  if (document.querySelector(".hive")) {
    layoutAllHives();
    window.addEventListener("resize", function () {
      layoutAllHives(true);
    });

    if (!reduceMotion) {
      (function scheduleFlip() {
        var delay = 4000 + Math.random() * 6000;
        setTimeout(function () {
          var hexes = document.querySelectorAll(".app-icon-hex");
          if (hexes.length) {
            var target = hexes[Math.floor(Math.random() * hexes.length)];
            target.classList.add("flipping");
            target.addEventListener("animationend", function handler() {
              target.classList.remove("flipping");
              target.removeEventListener("animationend", handler);
            });
          }
          scheduleFlip();
        }, delay);
      })();
    }
  }

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
