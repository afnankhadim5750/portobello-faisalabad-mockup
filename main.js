// Portobello — mobile menu, tabs, counters, lightbox, reservation, scroll-spy.
(function () {
  "use strict";

  // ---- Mobile menu (instant toggle: no transition on open/close) ----
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) setMenu(false);
    });
  }

  // ---- Scroll-spy: highlight the nav link for the section in view ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a:not(.nav-cta)"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---- Menu tabs ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
        var panel = document.getElementById("panel-" + t.dataset.tab);
        if (panel) {
          panel.classList.toggle("active", on);
          panel.hidden = !on;
        }
      });
    });
  });

  // ---- Animated counters (real numbers only) ----
  var nums = document.querySelectorAll(".num[data-count]");
  function animateNum(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateNum(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { counterObs.observe(n); });
  } else {
    nums.forEach(animateNum);
  }

  // ---- Lightbox ----
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lbCap = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var current = 0;
  function show(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    lbImg.src = item.dataset.full;
    lbImg.alt = item.dataset.alt;
    if (lbCap) lbCap.textContent = item.dataset.alt + "  ·  " + (current + 1) + " of " + items.length;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function hide() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  items.forEach(function (item, i) {
    item.addEventListener("click", function () { show(i); });
  });
  if (lightbox) {
    lightbox.querySelector(".lightbox-close").addEventListener("click", hide);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // ---- Reservation form: opens the phone app to call the restaurant ----
  var form = document.getElementById("reserve-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var msg = "Table booking for " + (data.get("name") || "guest") +
        ", " + (data.get("date") || "") + " at " + (data.get("time") || "") +
        ", " + (data.get("guests") || "") + " (" + (data.get("occasion") || "") + ").";
      window.location.href = "tel:+92418555583";
      var note = form.querySelector(".form-note");
      if (note) note.textContent = "Calling now — please read out your booking: " + msg;
    });
  }

  // ---- Reveal on scroll (subtle, disabled with reduced motion) ----
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".dish, .why-card, .visit-card, .grill-copy, .brunch-copy, .room-copy, .kitchen-copy");
    revealEls.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
    });
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }
})();
