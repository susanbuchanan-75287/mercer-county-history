/* Mercer County Historical Society — shared site behavior */

/* --- Origin guard -------------------------------------------------------
   Deters casual clone-and-rehost: on any host that isn't authorized, the
   page wipes itself and shows an "unauthorized copy" notice.
   NOTE: this is a DETERRENT, not security. Anyone with the source can strip
   it out. For true source protection the repository must be PRIVATE. */
(function () {
  var ALLOWED = [
    "susanbuchanan-75287.github.io",   // live GitHub Pages host (account-level covers project pages)
    "localhost", "127.0.0.1",          // local development
    "mercercountyhistory.org",         // reserved for a future custom domain
    "www.mercercountyhistory.org"
  ];
  var host = location.hostname;
  // Empty host = opened directly from a file:// path (local preview) — allow.
  if (host === "" || ALLOWED.indexOf(host) !== -1) return;

  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { r.unregister(); });
      });
      if (window.caches && caches.keys) {
        caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); });
      }
    }
  } catch (e) {}

  var official = "https://susanbuchanan-75287.github.io/mercer-county-history/";
  document.documentElement.innerHTML =
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Unauthorized copy</title></head>' +
    '<body style="margin:0;min-height:100vh;display:grid;place-items:center;' +
    'background:#071b34;color:#f6f1e7;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center">' +
    '<div style="max-width:44ch;padding:36px 28px">' +
    '<div style="font-size:2rem;margin-bottom:10px">⚠️</div>' +
    '<h1 style="font-size:1.35rem;margin:0 0 12px">This is an unauthorized copy</h1>' +
    '<p style="opacity:.85;line-height:1.65;margin:0 0 18px">The <b>Mercer County Historical Society</b> website and all of its ' +
    'content are &copy; Susan Buchanan — <b>All Rights Reserved</b>. This deployment is not authorized.</p>' +
    '<a href="' + official + '" style="color:#f0b429;font-weight:700;text-decoration:none">Go to the official site &rarr;</a>' +
    '</div></body>';
  // Stop any further scripts from running on an unauthorized host.
  throw new Error("Unauthorized host: " + host);
})();

(() => {
  // Theme: respect saved choice, else Clawpilot/scoutTheme param, else system
  const KEY = "mc-theme";
  const param = new URLSearchParams(location.search).get("scoutTheme");
  const saved = localStorage.getItem(KEY);
  const initial = saved || param ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initial);

  window.mcToggleTheme = () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu toggle
    const btn = document.querySelector(".menu-btn");
    const ul = document.querySelector("nav.main ul");
    if (btn && ul) btn.addEventListener("click", () => {
      const open = ul.style.display === "flex";
      ul.style.display = open ? "" : "flex";
      btn.setAttribute("aria-expanded", String(!open));
      ul.style.flexDirection = "column";
      ul.style.position = "absolute";
      ul.style.top = "72px"; ul.style.right = "24px";
      ul.style.background = "var(--mc-cream)";
      ul.style.padding = "16px 22px";
      ul.style.borderRadius = "14px";
      ul.style.border = "1px solid var(--mc-line)";
      ul.style.boxShadow = "var(--mc-shadow)";
    });

    // Highlight active nav link by filename
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav.main a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
    });

    // Generic tab controller: [data-tab] buttons + [data-panel] panels
    document.querySelectorAll("[data-tabgroup]").forEach(group => {
      const buttons = group.querySelectorAll("[data-tab]");
      buttons.forEach(b => b.addEventListener("click", () => {
        const id = b.getAttribute("data-tab");
        buttons.forEach(x => x.classList.toggle("active", x === b));
        group.querySelectorAll("[data-panel]").forEach(p =>
          p.classList.toggle("active", p.getAttribute("data-panel") === id));
      }));
    });

    // Nav shadow once the page is scrolled
    const nav = document.querySelector("header.nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Scroll-reveal (progressive enhancement).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetSel = ".head,.card,.att,.citycard,.day,.event,.hero-copy,.hero-art,.cta-band,[data-reveal]";
    const targets = Array.from(document.querySelectorAll(targetSel));
    targets.forEach(el => el.setAttribute("data-reveal", ""));

    if (reduce || !("IntersectionObserver" in window) || !targets.length) {
      // No motion / unsupported: show everything immediately.
      targets.forEach(el => el.classList.add("in"));
    } else {
      document.body.classList.add("reveal-ready");
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      targets.forEach(el => io.observe(el));
      // Safety net: never leave anything hidden (e.g. hidden tab panels).
      setTimeout(() => targets.forEach(el => el.classList.add("in")), 1500);
    }
  });
})();

