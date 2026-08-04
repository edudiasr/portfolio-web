(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dict = window.EDR_I18N || {};
  const htmlLang = { pt: "pt-BR", en: "en", es: "es" };

  let lang = "pt";
  try {
    const saved = localStorage.getItem("edr_lang");
    if (saved && dict[saved]) lang = saved;
  } catch (_) {}

  const t = (key) => (dict[lang] && dict[lang][key]) || (dict.pt && dict.pt[key]) || key;
  const proj = (id) => (dict[lang]?.projects?.[id]) || dict.pt?.projects?.[id] || {};

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Progress */
  const progress = document.getElementById("progress");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
    const toTop = document.getElementById("toTop");
    if (toTop) toTop.classList.toggle("is-on", h.scrollTop > 480);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Reveal */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Counters */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* Custom cursor */
  const cursor = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (fine && !reduce && cursor && cursorDot) {
    document.body.classList.add("has-cursor");
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        cursorDot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        cursor.classList.add("is-on");
        cursorDot.classList.add("is-on");
      },
      { passive: true }
    );
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* Magnetic */
  if (fine && !reduce) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* Tilt */
  if (fine && !reduce) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  document.querySelectorAll(".card[data-color]").forEach((card) => {
    card.style.setProperty("--c", card.dataset.color);
  });

  /* Filters */
  const filters = document.getElementById("filters");
  const grid = document.getElementById("projectGrid");
  const countEl = document.getElementById("filterCount");
  const cards = () => [...(grid?.querySelectorAll(".card") || [])];

  const updateCount = (visible) => {
    if (!countEl) return;
    const total = cards().length;
    countEl.textContent =
      visible === total
        ? t("countAll").replace("{n}", total)
        : t("countFiltered").replace("{v}", visible).replace("{n}", total);
  };

  const applyFilter = (key) => {
    let visible = 0;
    cards().forEach((card) => {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const show = key === "all" || tags.includes(key);
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    updateCount(visible);
  };

  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      filters.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter || "all");
    });
  }

  const track = (id) => {
    try {
      const key = "edr_hits";
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      raw[id] = (raw[id] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(raw));
    } catch (_) {}
  };
  cards().forEach((card) => {
    card.addEventListener("click", () => track(card.dataset.id));
  });

  /* Featured raffle */
  const featuredGrid = document.getElementById("featuredGrid");
  const raffleBtn = document.getElementById("raffleBtn");
  const raffleHint = document.getElementById("raffleHint");
  let lastPicks = [];

  const projectData = () =>
    cards().map((card) => {
      const p = proj(card.dataset.id);
      return {
        id: card.dataset.id,
        href: card.getAttribute("href"),
        title: p.short || p.title || "",
        desc: p.feat || p.desc || "",
        color: card.dataset.color || "#38bdf8",
        locked: card.dataset.featuredLock === "1",
        isNew: card.dataset.new === "1",
      };
    });

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pickFeatured = () => {
    const all = projectData();
    const locked = all.find((p) => p.id === "imobiliaria");
    const recentPool = all.filter(
      (p) => p.id !== "imobiliaria" && (p.isNew || all.indexOf(p) < 10)
    );
    let hits = {};
    try {
      hits = JSON.parse(localStorage.getItem("edr_hits") || "{}");
    } catch (_) {}

    const weighted = shuffle(recentPool).sort((a, b) => {
      const ha = hits[a.id] || 0;
      const hb = hits[b.id] || 0;
      return hb - ha || Math.random() - 0.5;
    });

    return shuffle([locked, ...weighted.slice(0, 2)].filter(Boolean));
  };

  const renderFeatured = (animate, keepSelection) => {
    if (!featuredGrid) return;
    const picks =
      keepSelection && lastPicks.length
        ? lastPicks.map((old) => {
            const p = proj(old.id);
            return {
              ...old,
              title: p.short || p.title || old.title,
              desc: p.feat || p.desc || old.desc,
            };
          })
        : pickFeatured();
    lastPicks = picks;

    featuredGrid.classList.toggle("is-spinning", Boolean(animate) && !reduce);
    featuredGrid.innerHTML = picks
      .map(
        (p, i) => `
      <a class="feat-card${p.locked ? " is-locked" : ""}" href="${p.href}" style="--c:${p.color}; transition-delay:${i * 80}ms" data-id="${p.id}">
        <span class="feat-card__glow" style="--c:${p.color}"></span>
        <span class="feat-card__balloon" style="--c:${p.color}"></span>
        <span class="feat-card__label">${p.locked ? t("featLocked") : t("featPicked")}</span>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <span class="feat-card__go">${t("featOpen")}</span>
      </a>`
      )
      .join("");

    requestAnimationFrame(() => {
      featuredGrid.querySelectorAll(".feat-card").forEach((el) => {
        requestAnimationFrame(() => el.classList.add("is-in"));
        el.addEventListener("click", () => track(el.dataset.id));
      });
    });

    if (raffleHint) {
      const names = picks.map((p) => p.title.split("—")[0].trim()).join(" · ");
      raffleHint.textContent = `${t("raffleNow")} ${names}`;
    }

    window.setTimeout(() => featuredGrid.classList.remove("is-spinning"), 600);
  };

  if (raffleBtn) {
    raffleBtn.addEventListener("click", () => renderFeatured(true, false));
  }

  /* i18n apply */
  const applyI18n = (keepFeatured) => {
    document.documentElement.lang = htmlLang[lang] || "pt-BR";
    document.title = t("metaTitle");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("metaDesc"));

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (el.id === "raffleHint" && lastPicks.length) return;
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const val = t(key);
      if (val != null) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const val = t(key);
      if (val != null) el.setAttribute("aria-label", val);
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const val = t(key);
      if (val != null) el.setAttribute("title", val);
    });

    document.querySelectorAll(".card[data-id]").forEach((card) => {
      const p = proj(card.dataset.id);
      const title = card.querySelector("[data-proj='title']");
      const desc = card.querySelector("[data-proj='desc']");
      if (title && p.title) title.textContent = p.title;
      if (desc && p.desc) desc.textContent = p.desc;
    });

    document.querySelectorAll(".lang__btn").forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    const activeFilter =
      document.querySelector(".filter.is-active")?.dataset.filter || "all";
    applyFilter(activeFilter);
    renderFeatured(false, Boolean(keepFeatured));
  };

  document.querySelectorAll(".lang__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!dict[btn.dataset.lang]) return;
      lang = btn.dataset.lang;
      try {
        localStorage.setItem("edr_lang", lang);
      } catch (_) {}
      applyI18n(true);
    });
  });

  applyI18n(false);
})();
