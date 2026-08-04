(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* —— Preloader —— */
  const preloader = $("#preloader");
  const bootBar = $("#boot-bar");
  let boot = 0;
  const bootTimer = setInterval(() => {
    boot = Math.min(100, boot + Math.random() * 18 + 8);
    if (bootBar) bootBar.style.width = `${boot}%`;
    if (boot >= 100) {
      clearInterval(bootTimer);
      requestAnimationFrame(() => {
        preloader?.classList.add("is-done");
        document.body.classList.add("is-loaded");
      });
    }
  }, 90);

  window.addEventListener("load", () => {
    if (boot < 100) {
      boot = 100;
      if (bootBar) bootBar.style.width = "100%";
    }
  });

  /* —— Year —— */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* —— Header / nav —— */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const navLinks = $$(".nav__link");

  const onScrollChrome = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 20);
    $("#to-top")?.classList.toggle("is-visible", y > 500);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    const progress = $("#progress");
    if (progress) progress.style.width = `${pct}%`;
  };

  window.addEventListener("scroll", onScrollChrome, { passive: true });
  onScrollChrome();

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      toggle?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const sections = $$("main section[id]");
  const spy = () => {
    const pos = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach((sec) => {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* —— Reveal —— */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* —— Counters —— */
  const counters = $$("[data-count]");
  const animateCount = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
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
      { threshold: 0.4 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* —— Custom cursor —— */
  const cursor = $("#cursor");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursor && finePointer) {
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
      },
      { passive: true }
    );

    const loopCursor = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loopCursor);
    };
    loopCursor();

    const hoverables = "a, button, .chip, .diag__item, summary, input, select, textarea, .link-wa";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });
  }

  /* —— Magnetic buttons —— */
  if (finePointer) {
    $$(".magnetic").forEach((btn) => {
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

  /* —— Tilt —— */
  if (finePointer) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -10;
        const ry = (px - 0.5) * 12;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* —— HUD clock + readings —— */
  const clock = $("#hud-clock");
  const pad = (n) => String(n).padStart(2, "0");
  const tickClock = () => {
    const d = new Date();
    if (clock) clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tickClock();
  setInterval(tickClock, 1000);

  const readings = $$("#hud-readings li");
  let ri = 0;
  if (readings.length) {
    setInterval(() => {
      readings.forEach((li) => li.classList.remove("is-on"));
      ri = (ri + 1) % readings.length;
      readings[ri].classList.add("is-on");
    }, 2200);
  }

  /* Load bar pulse */
  const loadBar = $("#load-bar");
  const boxesFree = $("#boxes-free");
  setInterval(() => {
    if (!loadBar) return;
    const load = 55 + Math.round(Math.random() * 35);
    loadBar.style.width = `${load}%`;
    if (boxesFree) {
      const free = load > 85 ? 1 : load > 70 ? 2 : 3;
      boxesFree.textContent = `${free} / 5`;
    }
  }, 4200);

  /* —— Service filters —— */
  const chips = $$(".chip");
  const services = $$(".service");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      services.forEach((s) => {
        const show = f === "all" || s.dataset.cat === f;
        s.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* —— WA helpers —— */
  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      const svc = btn.dataset.wa || "serviço";
      openWa(`Olá! Gostaria de orçamento para: ${svc}.`);
    });
  });

  /* —— Diagnóstico —— */
  const diagGrid = $("#diag-grid");
  const diagHint = $("#diag-hint");
  const diagSend = $("#diag-send");

  const updateDiagHint = () => {
    const checked = $$('#diag-grid input:checked');
    if (!diagHint) return;
    if (!checked.length) {
      diagHint.textContent = "Selecione os sintomas para montar o chamado.";
      return;
    }
    diagHint.textContent = `${checked.length} sintoma(s) selecionado(s) — pronto pra enviar.`;
  };

  diagGrid?.addEventListener("change", updateDiagHint);

  diagSend?.addEventListener("click", () => {
    const checked = $$('#diag-grid input:checked').map((i) => i.value);
    if (!checked.length) {
      if (diagHint) diagHint.textContent = "Marque pelo menos um sintoma.";
      return;
    }
    openWa(
      `Olá! Diagnóstico rápido Torque Auto:\n• ${checked.join("\n• ")}\n\nPodem me orientar no próximo passo?`
    );
  });

  /* —— Calculator —— */
  const calcService = $("#calc-service");
  const calcUrgency = $("#calc-urgency");
  const calcUrgencyOut = $("#calc-urgency-out");
  const calcYear = $("#calc-year");
  const calcRange = $("#calc-range");
  const calcLabel = $("#calc-label");
  const calcWa = $("#calc-wa");

  const urgencyMap = [
    { label: "Flexível", mult: 0.92 },
    { label: "Normal", mult: 1 },
    { label: "Urgente", mult: 1.18 },
  ];

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const updateCalc = () => {
    if (!calcService || !calcRange) return;
    const base = Number(calcService.value) || 0;
    const u = Number(calcUrgency?.value) || 1;
    const info = urgencyMap[u] || urgencyMap[1];
    const year = Number(calcYear?.value) || 2018;
    const ageFactor = year < 2010 ? 1.12 : year < 2016 ? 1.05 : 1;
    const low = Math.round(base * info.mult * ageFactor);
    const high = Math.round(low * 1.28);
    calcRange.textContent = `${formatBRL(low)} — ${formatBRL(high)}`;
    if (calcUrgencyOut) calcUrgencyOut.textContent = info.label;
    const serviceName = calcService.options[calcService.selectedIndex]?.text || "Serviço";
    if (calcLabel) calcLabel.textContent = `${serviceName} · ${info.label.toLowerCase()}`;
  };

  [calcService, calcUrgency, calcYear].forEach((el) => {
    el?.addEventListener("input", updateCalc);
    el?.addEventListener("change", updateCalc);
  });
  updateCalc();

  calcWa?.addEventListener("click", () => {
    const serviceName = calcService?.options[calcService.selectedIndex]?.text || "Serviço";
    const u = urgencyMap[Number(calcUrgency?.value) || 1];
    openWa(
      `Olá! Quero orçamento real na Torque Auto.\nServiço: ${serviceName}\nUrgência: ${u.label}\nAno do veículo: ${calcYear?.value || "—"}\nEstimativa na tela: ${calcRange?.textContent || ""}`
    );
  });

  /* —— Contact form —— */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const car = String(fd.get("car") || "").trim();
    const service = String(fd.get("service") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      car: form.querySelector('[name="car"]')?.closest("label"),
      service: form.querySelector('[name="service"]')?.closest("label"),
    };

    Object.values(fields).forEach((l) => l?.classList.remove("is-invalid"));

    let ok = true;
    if (name.length < 2) {
      fields.name?.classList.add("is-invalid");
      ok = false;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      fields.phone?.classList.add("is-invalid");
      ok = false;
    }
    if (car.length < 2) {
      fields.car?.classList.add("is-invalid");
      ok = false;
    }
    if (!service) {
      fields.service?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    const text = [
      `Olá! Novo chamado Torque Auto.`,
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Veículo: ${car}`,
      `Serviço: ${service}`,
      message ? `Obs: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  /* —— To top —— */
  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
