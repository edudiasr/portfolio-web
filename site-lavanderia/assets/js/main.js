(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  /* Preloader */
  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1100));
  setTimeout(finishBoot, 2300);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Steam bubbles */
  const steam = $("#steam");
  if (steam) {
    for (let i = 0; i < 18; i++) {
      const b = document.createElement("i");
      b.style.left = `${Math.random() * 100}%`;
      b.style.animationDuration = `${6 + Math.random() * 6}s`;
      b.style.animationDelay = `${Math.random() * 8}s`;
      b.style.width = `${6 + Math.random() * 10}px`;
      b.style.height = b.style.width;
      steam.appendChild(b);
    }
  }

  /* Header */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const navLinks = $$(".nav__link");

  const onScrollChrome = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 20);
    $("#to-top")?.classList.toggle("is-visible", y > 500);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = $("#progress");
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
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

  /* Reveal */
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

  /* Counters */
  const animateCount = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      el.textContent = `${Math.round(target * (1 - Math.pow(1 - t, 3)))}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$("[data-count]");
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

  /* Cursor / magnetic / tilt */
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
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = "a, button, .chip, summary, input, select, textarea, .link-wa";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });
  }

  if (finePointer) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.18}px, ${(e.clientY - (r.top + r.height / 2)) * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });

    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -9}deg) rotateY(${(px - 0.5) * 11}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Machine timer + status */
  let secs = 32 * 60 + 14;
  const timer = $("#machine-timer");
  const cycleBar = $("#cycle-bar");
  const cycleStatus = $("#cycle-status");
  const statuses = ["Enxágue", "Centrifugando", "Finalizando", "Pronto p/ abrir"];

  setInterval(() => {
    secs = Math.max(0, secs - 1);
    if (secs === 0) secs = 35 * 60;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (timer) timer.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const pct = 100 - (secs / (35 * 60)) * 100;
    if (cycleBar) cycleBar.style.width = `${Math.min(98, Math.max(8, pct))}%`;
    if (cycleStatus) cycleStatus.textContent = statuses[Math.min(3, Math.floor(pct / 25))];
  }, 1000);

  /* Filters */
  const chips = $$(".chip");
  const services = $$(".service");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      services.forEach((s) => {
        s.classList.toggle("is-hidden", !(f === "all" || s.dataset.cat === f));
      });
    });
  });

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Gostaria de saber mais sobre: ${btn.dataset.wa || "serviços da Ciclo"}.`);
    });
  });

  /* Calculator */
  const calcService = $("#calc-service");
  const calcQty = $("#calc-qty");
  const calcQtyOut = $("#calc-qty-out");
  const calcUnit = $("#calc-unit");
  const calcUrgency = $("#calc-urgency");
  const calcUrgencyOut = $("#calc-urgency-out");
  const calcTotal = $("#calc-total");
  const calcLabel = $("#calc-label");

  const urgencyMap = [
    { label: "Flexível (48–72h)", mult: 0.9 },
    { label: "Padrão 24–48h", mult: 1 },
    { label: "Express (mesmo dia*)", mult: 1.35 },
  ];

  const isUnitService = () => {
    const label = calcService?.options[calcService.selectedIndex]?.dataset.label || "";
    return label.includes("(un.)") || label.includes("unidade");
  };

  const updateCalc = () => {
    const price = Number(calcService?.value) || 12;
    const qty = Number(calcQty?.value) || 5;
    const u = Number(calcUrgency?.value) || 1;
    const info = urgencyMap[u] || urgencyMap[1];
    const unit = isUnitService();
    if (calcUnit) calcUnit.textContent = unit ? "(unidades)" : "(kg)";
    if (calcQtyOut) calcQtyOut.textContent = unit ? `${qty} un.` : `${qty} kg`;
    if (calcUrgencyOut) calcUrgencyOut.textContent = info.label;
    const total = Math.round(price * qty * info.mult);
    if (calcTotal) calcTotal.textContent = formatBRL(total);
    const name = calcService?.options[calcService.selectedIndex]?.text || "Serviço";
    if (calcLabel) calcLabel.textContent = `${name} · ${calcQtyOut?.textContent || ""} · ${info.label}`;
  };

  [calcService, calcQty, calcUrgency].forEach((el) => {
    el?.addEventListener("input", updateCalc);
    el?.addEventListener("change", updateCalc);
  });
  updateCalc();

  $("#calc-wa")?.addEventListener("click", () => {
    openWa(
      `Olá! Quero orçamento real na Ciclo.\n${calcLabel?.textContent || ""}\nEstimativa na tela: ${calcTotal?.textContent || ""}`
    );
  });

  /* Track demo */
  const steps = $$("#track-steps li");
  let step = 2;
  const paintSteps = () => {
    steps.forEach((li, i) => {
      li.classList.remove("is-done", "is-on");
      if (i < step) li.classList.add("is-done");
      if (i === step) li.classList.add("is-on");
    });
  };
  paintSteps();
  $("#track-next")?.addEventListener("click", () => {
    step = (step + 1) % steps.length;
    paintSteps();
  });

  /* Pickup */
  const pickType = $("#pick-type");
  const pickDay = $("#pick-day");
  const pickArea = $("#pick-area");
  const pickSummary = $("#pick-summary");
  let pickSlot = "Manhã";

  const updatePick = () => {
    if (pickSummary) {
      pickSummary.textContent = `${pickType?.value || ""} · ${pickDay?.value || ""} · ${pickSlot}`;
    }
  };

  $$("#pick-slot button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#pick-slot button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      pickSlot = btn.dataset.slot || "Manhã";
      updatePick();
    });
  });

  [pickType, pickDay].forEach((el) => el?.addEventListener("change", updatePick));
  updatePick();

  $("#pick-wa")?.addEventListener("click", () => {
    openWa(
      [
        "Olá! Quero agendar coleta — Ciclo Lavanderia.",
        `Serviço: ${pickType?.value}`,
        `Dia: ${pickDay?.value}`,
        `Janela: ${pickSlot}`,
        pickArea?.value ? `Local: ${pickArea.value}` : "Local: Centro (a confirmar)",
      ].join("\n")
    );
  });

  /* Contact */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      interest: form.querySelector('[name="interest"]')?.closest("label"),
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
    if (!interest) {
      fields.interest?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    if (formOk) formOk.hidden = false;
    openWa(
      [
        "Olá! Contato Ciclo Lavanderia.",
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `Interesse: ${interest}`,
        message ? `Mensagem: ${message}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  });

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
