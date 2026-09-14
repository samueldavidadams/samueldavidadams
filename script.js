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
