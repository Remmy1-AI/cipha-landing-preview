/* Cipha Markets — native scroll. SignalsFlowStack motion copied from live cipha.app. */
(function () {
  "use strict";

  var EASE = "0.65s cubic-bezier(0.32, 0.72, 0, 1)";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* —— Header shrink —— */
  var header = document.querySelector(".site-header");
  function shrinkHeader() {
    if (!header) return;
    header.classList.toggle("is-shrink", window.scrollY > 12);
  }

  /* —— Reveals (8px + opacity) —— */
  function bindReveals() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* —— Plan card stagger —— */
  function bindPlan() {
    var card = document.querySelector(".plan-card");
    if (!card) return;
    if (reduce || !("IntersectionObserver" in window)) {
      card.classList.add("is-in");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            card.classList.add("is-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(card);
  }

  /* —— SignalsFlowStack (live cipha.app) —— */
  function parseStickyTop(el, fallback) {
    var n = parseFloat(getComputedStyle(el).getPropertyValue("--sticky-top"));
    return Number.isFinite(n) ? n : fallback;
  }

  function layerTranslatePercent(i, u, n) {
    var j = Math.min(Math.floor(u), n - 1);
    if (i <= j) return 0;
    if (i === j + 1) return (1 - (u - j)) * 100;
    return 100;
  }

  function bindFlow(stack) {
    var layers = Array.prototype.slice.call(stack.querySelectorAll(".flow-layer"));
    var n = layers.length;
    if (!n) return;

    if (reduce) {
      stack.classList.add("is-reduced");
      layers.forEach(function (layer) {
        layer.style.transform = "none";
        layer.removeAttribute("aria-hidden");
      });
      return;
    }

    var raf = 0;
    function update() {
      var stickyTop = parseStickyTop(stack, 88);
      var y = stack.getBoundingClientRect().top + window.scrollY - stickyTop;
      var scrolled = window.scrollY - y;
      var seg = Math.max(220, window.innerHeight * 0.5);
      var release = Math.max(160, window.innerHeight * 0.22);
      var total = n * seg + release;
      scrolled = Math.max(0, Math.min(scrolled, total));
      var u = scrolled / seg;
      var rawJ = Math.floor(u);
      var j = Math.min(rawJ, n - 1);
      var frac = u - rawJ;

      layers.forEach(function (layer, i) {
        var ty = layerTranslatePercent(i, u, n);
        var transform;
        if (i < j) {
          var depth = j - i;
          transform =
            "translateY(" + -10 * depth + "px) scale(" + (1 - 0.03 * Math.min(depth, 3)) + ")";
        } else if (i === j) {
          var cover = j < n - 1 && rawJ === j ? frac : 0;
          transform =
            "translateY(" + -10 * cover + "px) scale(" + (1 - 0.03 * cover) + ")";
        } else {
          transform = "translateY(" + ty + "%)";
        }
        layer.style.transform = transform;
        if (ty >= 99.5) layer.setAttribute("aria-hidden", "true");
        else layer.removeAttribute("aria-hidden");
      });
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        update();
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  function bindAllFlows() {
    document.querySelectorAll(".flow-stack").forEach(bindFlow);
  }

  shrinkHeader();
  bindReveals();
  bindPlan();
  bindAllFlows();
  window.addEventListener("scroll", shrinkHeader, { passive: true });

  void EASE;
})();
