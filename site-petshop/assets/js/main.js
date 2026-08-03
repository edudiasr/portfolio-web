(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const WA = "5547992072891";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const header = $("#header");
  const nav = $("#nav");
  const navToggle = $("#nav-toggle");
  const progress = $("#progress");
  const toTop = $("#to-top");
  const year = $("#year");
  const glow = $("#ambient-glow");
  const cursor = $("#cursor");
  const cursorDot = $(".cursor__dot");
  const cursorRing = $(".cursor__ring");

  if (year) year.textContent = String(new Date().getFullYear());

  /* Cursor + ambient glow */
  if (finePointer && !reduceMotion && cursor) {
    document.body.classList.add("has-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        if (cursorDot) {
          cursorDot.style.left = `${x}px`;
          cursorDot.style.top = `${y}px`;
        }
        if (glow) {
          glow.style.left = `${x}px`;
          glow.style.top = `${y}px`;
        }
      },
      { passive: true }
    );

    const tickCursor = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (cursorRing) {
        cursorRing.style.left = `${rx}px`;
        cursorRing.style.top = `${ry}px`;
      }
      requestAnimationFrame(tickCursor);
    };
    tickCursor();

    $$("a, button, .chip, summary, input, select, textarea").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 20);
    toTop?.classList.toggle("is-visible", y > 480);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  $$(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.setAttribute("aria-label", "Abrir menu");
    });
  });

  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  const setActiveNav = () => {
    const offset = header?.offsetHeight || 76;
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top - offset - 40 <= 0) current = section.id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href")?.slice(1) === current);
    });
  };

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* Reveal */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Counters */
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const decimals = Number(el.dataset.decimals || 0);
    const start = performance.now();
    const duration = 1400;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = `${decimals ? value.toFixed(decimals) : Math.round(value)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* Agenda highlight cycle */
  const slots = $$("#agenda-slots li");
  if (slots.length && !reduceMotion) {
    let idx = 0;
    setInterval(() => {
      slots.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      idx = (idx + 1) % slots.length;
    }, 2200);
  }

  /* 3D tilt */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((card) => {
      const max = 8;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Magnetic buttons */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* Filters */
  const chips = $$(".chip");
  const services = $$(".service");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      services.forEach((card, i) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          card.style.opacity = "0";
          card.style.transform = "translateY(12px)";
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
              card.style.opacity = "1";
              card.style.transform = "";
            }, i * 40);
          });
        }
      });
    });
  });

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.wa || "atendimento";
      openWa(`Olá! Tenho interesse em: ${item}. Gostaria de agendar/saber mais na Amora Pet.`);
    });
  });

  const form = $("#contact-form");
  const formOk = $("#form-ok");
  const phoneRe = /\d{10,}/;

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const pet = String(data.get("pet") || "").trim();
    const species = String(data.get("species") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();

    const fields = [
      ["name", name],
      ["phone", phoneRe.test(phone.replace(/\D/g, ""))],
      ["pet", pet],
      ["species", species],
      ["service", service],
    ];

    fields.forEach(([key, ok]) => {
      form.querySelector(`[name="${key}"]`)?.closest("label")?.classList.toggle("is-invalid", !ok);
    });

    if (!name || !phoneRe.test(phone.replace(/\D/g, "")) || !pet || !species || !service) return;

    const text = [
      "Olá! Quero agendar na Amora Pet.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Pet: ${pet} (${species})`,
      `Serviço: ${service}`,
      message ? `Obs.: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
