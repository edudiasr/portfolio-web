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

    $$("a, button, .chip, .day, summary, input, select, textarea").forEach((el) => {
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
    const offset = header?.offsetHeight || 74;
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
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 55}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
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

  const wodItems = $$("#wod .board__item");
  if (wodItems.length && !reduceMotion) {
    let idx = 0;
    setInterval(() => {
      wodItems.forEach((item, i) => item.classList.toggle("is-active", i === idx));
      idx = (idx + 1) % wodItems.length;
    }, 2200);
  }

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

  const chips = $$(".chip");
  const mods = $$(".mod");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      mods.forEach((card, i) => {
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

  const scheduleData = {
    seg: [
      ["05h30", "Funcional Power", "Studio A"],
      ["07h00", "Bike Indoor", "Studio B"],
      ["12h15", "HIIT Express", "Studio A"],
      ["19h00", "Musculação guiada", "Piso 1"],
      ["20h00", "Mobilidade", "Studio A"],
    ],
    ter: [
      ["06h00", "HIIT", "Studio A"],
      ["07h30", "Bike Indoor", "Studio B"],
      ["12h00", "Funcional", "Studio A"],
      ["18h30", "Musculação guiada", "Piso 1"],
      ["20h00", "Bike Indoor", "Studio B"],
    ],
    qua: [
      ["05h30", "Funcional Power", "Studio A"],
      ["07h00", "Mobilidade", "Studio A"],
      ["12h15", "HIIT Express", "Studio A"],
      ["19h00", "Bike Indoor", "Studio B"],
      ["20h30", "Musculação guiada", "Piso 1"],
    ],
    qui: [
      ["06h00", "Bike Indoor", "Studio B"],
      ["07h30", "Funcional", "Studio A"],
      ["12h00", "Mobilidade", "Studio A"],
      ["18h30", "HIIT", "Studio A"],
      ["20h00", "Musculação guiada", "Piso 1"],
    ],
    sex: [
      ["05h30", "Funcional Power", "Studio A"],
      ["07h00", "Bike Indoor", "Studio B"],
      ["12h15", "HIIT Express", "Studio A"],
      ["19h00", "Musculação guiada", "Piso 1"],
      ["20h00", "Bike Indoor", "Studio B"],
    ],
    sab: [
      ["08h00", "Funcional", "Studio A"],
      ["09h30", "Bike Indoor", "Studio B"],
      ["11h00", "Mobilidade", "Studio A"],
    ],
  };

  const scheduleEl = $("#schedule");
  const days = $$(".day");

  const renderSchedule = (day) => {
    if (!scheduleEl) return;
    const rows = scheduleData[day] || [];
    scheduleEl.innerHTML = rows
      .map(
        ([time, name, place]) => `
      <div class="schedule__row">
        <strong>${time}</strong>
        <span>${name}</span>
        <em>${place}</em>
      </div>`
      )
      .join("");
  };

  days.forEach((btn) => {
    btn.addEventListener("click", () => {
      days.forEach((d) => d.classList.toggle("active", d === btn));
      renderSchedule(btn.dataset.day);
    });
  });

  renderSchedule("seg");

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Tenho interesse em: ${btn.dataset.wa || "Pulse Academia"}.`);
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
    const goal = String(data.get("goal") || "").trim();
    const plan = String(data.get("plan") || "").trim();
    const message = String(data.get("message") || "").trim();

    form.querySelector('[name="name"]')?.closest("label")?.classList.toggle("is-invalid", !name);
    form
      .querySelector('[name="phone"]')
      ?.closest("label")
      ?.classList.toggle("is-invalid", !phoneRe.test(phone.replace(/\D/g, "")));
    form.querySelector('[name="goal"]')?.closest("label")?.classList.toggle("is-invalid", !goal);

    if (!name || !phoneRe.test(phone.replace(/\D/g, "")) || !goal) return;

    const text = [
      "Olá! Quero experimentar a Pulse Academia.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Objetivo: ${goal}`,
      plan ? `Plano: ${plan}` : null,
      message ? `Obs.: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
