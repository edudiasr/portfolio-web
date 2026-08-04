(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const WA = "5547992072891";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const preloader = $("#preloader");
  const header = $("#header");
  const nav = $("#nav");
  const navToggle = $("#nav-toggle");
  const progress = $("#progress");
  const toTop = $("#to-top");
  const year = $("#year");
  const cursor = $("#cursor");
  const cursorDot = $(".cursor__dot");
  const cursorRing = $(".cursor__ring");

  if (year) year.textContent = String(new Date().getFullYear());

  window.addEventListener("load", () => {
    setTimeout(() => preloader?.classList.add("is-done"), 700);
  });

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
      },
      { passive: true }
    );

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (cursorRing) {
        cursorRing.style.left = `${rx}px`;
        cursorRing.style.top = `${ry}px`;
      }
      requestAnimationFrame(tick);
    };
    tick();

    $$("a, button, .chip, summary, input, select, textarea").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 18);
    toTop?.classList.toggle("is-visible", y > 500);
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
      if (section.getBoundingClientRect().top - offset - 50 <= 0) current = section.id;
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
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 7, 6) * 70}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Slots cycle */
  const slots = $$("#slots li");
  if (slots.length && !reduceMotion) {
    let idx = 0;
    setInterval(() => {
      slots.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      idx = (idx + 1) % slots.length;
    }, 2400);
  }

  /* Tilt + magnetic */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((card) => {
      const max = 6;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-3px)`;
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
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
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
          card.style.transform = "translateY(16px)";
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.transition = "opacity 0.45s ease, transform 0.45s ease";
              card.style.opacity = "1";
              card.style.transform = "";
            }, i * 45);
          });
        }
      });
    });
  });

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank");
  };

  $$(".text-link[data-wa]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Quero agendar: ${btn.dataset.wa} na Opaline.`);
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
    const service = String(data.get("service") || "").trim();
    const when = String(data.get("when") || "").trim();
    const message = String(data.get("message") || "").trim();

    form.querySelector('[name="name"]')?.closest("label")?.classList.toggle("is-invalid", !name);
    form
      .querySelector('[name="phone"]')
      ?.closest("label")
      ?.classList.toggle("is-invalid", !phoneRe.test(phone.replace(/\D/g, "")));
    form.querySelector('[name="service"]')?.closest("label")?.classList.toggle("is-invalid", !service);

    if (!name || !phoneRe.test(phone.replace(/\D/g, "")) || !service) return;

    const text = [
      "Olá! Quero agendar na Opaline.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Serviço: ${service}`,
      when ? `Preferência: ${when}` : null,
      message ? `Obs.: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
