/* Cipha Markets — native scroll. SignalsFlowStack motion copied from live cipha.app. */
(function () {
  "use strict";

  var EASE = "0.65s cubic-bezier(0.32, 0.72, 0, 1)";
  var GOLD = "rgba(196, 163, 90,";
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

  /* —— Gold bloom + orbs (hero + debate) —— */
  function bindAlive() {
    var root = document.getElementById("alive");
    if (!root) return;

    var canvas = document.getElementById("bloom");
    var back = document.getElementById("orbs-back");
    var front = document.getElementById("orbs-front");
    if (!canvas || !back || !front) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };
    var t0 = performance.now();
    var running = false;

    var specs = [
      { z: "back", r: 180, x: 0.18, y: 0.28, s: 0.22, a: 1.1 },
      { z: "back", r: 240, x: 0.72, y: 0.22, s: 0.16, a: 0.7 },
      { z: "back", r: 140, x: 0.48, y: 0.62, s: 0.19, a: 1.6 },
      { z: "front", r: 110, x: 0.32, y: 0.38, s: 0.28, a: 0.9 },
      { z: "front", r: 90, x: 0.62, y: 0.48, s: 0.24, a: 1.4 }
    ];

    var orbs = specs.map(function (s, i) {
      var el = document.createElement("span");
      el.className = "orb";
      el.style.width = s.r + "px";
      el.style.height = s.r + "px";
      (s.z === "front" ? front : back).appendChild(el);
      return {
        el: el,
        r: s.r,
        bx: s.x,
        by: s.y,
        s: s.s,
        a: s.a,
        phase: i * 1.3,
        z: s.z
      };
    });

    function size() {
      var rect = root.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(1, Math.floor(root.scrollHeight || rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }

    var dim = size();

    window.addEventListener(
      "pointermove",
      function (e) {
        var rect = root.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        mouse.tx = (e.clientX - rect.left) / rect.width;
        mouse.ty = (e.clientY - rect.top) / rect.height;
      },
      { passive: true }
    );

    function tick(now) {
      if (!running) return;
      var t = (now - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      dim = dim.w ? dim : size();
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      var bx = w * (0.42 + Math.sin(t * 0.18) * 0.16 + (mouse.x - 0.5) * 0.08);
      var by = h * (0.28 + Math.cos(t * 0.14) * 0.1 + (mouse.y - 0.5) * 0.06);
      var br = Math.max(w, h) * 0.42;
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, GOLD + " 0.28)");
      g.addColorStop(0.38, GOLD + " 0.10)");
      g.addColorStop(1, GOLD + " 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      /* faint threads between a couple of orbs */
      var pts = [];
      orbs.forEach(function (o) {
        var sway = o.z === "front" ? 28 : 18;
        var x =
          (o.bx + Math.sin(t * o.s + o.phase) * 0.08 + (mouse.x - 0.5) * 0.04) * w;
        var y =
          (o.by + Math.cos(t * o.s * 0.85 + o.a) * 0.07 + (mouse.y - 0.5) * 0.03) * h;
        o.el.style.transform =
          "translate3d(" + (x - o.r / 2) + "px," + (y - o.r / 2) + "px,0)";
        pts.push({ x: x, y: y, z: o.z });
      });
      ctx.strokeStyle = GOLD + " 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (pts[0] && pts[3]) {
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.quadraticCurveTo(w * 0.4, h * 0.2, pts[3].x, pts[3].y);
      }
      if (pts[1] && pts[4]) {
        ctx.moveTo(pts[1].x, pts[1].y);
        ctx.quadraticCurveTo(w * 0.7, h * 0.45, pts[4].x, pts[4].y);
      }
      ctx.stroke();

      requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
    }

    window.addEventListener(
      "resize",
      function () {
        dim = size();
      },
      { passive: true }
    );

    if (reduce) {
      dim = size();
      ctx.clearRect(0, 0, dim.w, dim.h);
      var g = ctx.createRadialGradient(dim.w * 0.45, dim.h * 0.28, 0, dim.w * 0.45, dim.h * 0.28, Math.max(dim.w, dim.h) * 0.4);
      g.addColorStop(0, GOLD + " 0.18)");
      g.addColorStop(1, GOLD + " 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, dim.w, dim.h);
      return;
    }

    if ("IntersectionObserver" in window) {
      var vis = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) start();
            else stop();
          });
        },
        { threshold: 0.02 }
      );
      vis.observe(root);
    } else {
      start();
    }
  }

  shrinkHeader();
  bindReveals();
  bindPlan();
  bindAllFlows();
  bindAlive();
  window.addEventListener("scroll", shrinkHeader, { passive: true });

  void EASE;
})();
