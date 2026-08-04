(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1200));
  setTimeout(finishBoot, 2400);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

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
    const hoverables = "a, button, .chip, .check, summary, input, select, textarea, .link-wa, .phases li";
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

  /* Canteiro live */
  const siteDay = $("#site-day");
  const obraBar = $("#obra-bar");
  const obraFase = $("#obra-fase");
  const fases = ["Fundação", "Estrutura", "Alvenaria", "Instalações", "Acabamento"];
  let day = 42;
  let pct = 47;
  setInterval(() => {
    day = day >= 90 ? 12 : day + 1;
    pct = Math.min(96, Math.round((day / 90) * 100));
    if (siteDay) siteDay.textContent = `Dia ${day} / 90`;
    if (obraBar) obraBar.style.width = `${pct}%`;
    if (obraFase) obraFase.textContent = fases[Math.min(4, Math.floor(pct / 20))];
  }, 3500);

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
      openWa(`Olá! Quero orçar: ${btn.dataset.wa || "obra com a Base"}.`);
    });
  });

  /* Calculator */
  const calcType = $("#calc-type");
  const calcArea = $("#calc-area");
  const calcAreaOut = $("#calc-area-out");
  const calcLevel = $("#calc-level");
  const calcLevelOut = $("#calc-level-out");
  const calcTotal = $("#calc-total");
  const calcLabel = $("#calc-label");

  const levelMap = [
    { label: "Simples", mult: 0.85 },
    { label: "Média", mult: 1 },
    { label: "Alta", mult: 1.25 },
  ];

  const updateCalc = () => {
    const unit = Number(calcType?.value) || 1600;
    const area = Number(calcArea?.value) || 120;
    const lv = Number(calcLevel?.value) || 1;
    const info = levelMap[lv] || levelMap[1];
    if (calcAreaOut) calcAreaOut.textContent = `${area} m²`;
    if (calcLevelOut) calcLevelOut.textContent = info.label;
    const low = Math.round(unit * area * info.mult * 0.92);
    const high = Math.round(unit * area * info.mult * 1.18);
    if (calcTotal) calcTotal.textContent = `${formatBRL(low)} — ${formatBRL(high)}`;
    const typeName = calcType?.options[calcType.selectedIndex]?.text || "Obra";
    if (calcLabel) calcLabel.textContent = `${typeName} · ${area} m² · complexidade ${info.label.toLowerCase()}`;
  };

  [calcType, calcArea, calcLevel].forEach((el) => {
    el?.addEventListener("input", updateCalc);
    el?.addEventListener("change", updateCalc);
  });
  updateCalc();

  $("#calc-wa")?.addEventListener("click", () => {
    openWa(`Olá! Quero proposta formal — Base Construtora.\n${calcLabel?.textContent || ""}\nEstimativa: ${calcTotal?.textContent || ""}`);
  });

  /* Phases */
  let activePhase = "Briefing & orçamento";
  $$("#phases li").forEach((li) => {
    li.addEventListener("click", () => {
      $$("#phases li").forEach((l) => l.classList.remove("is-on"));
      li.classList.add("is-on");
      activePhase = li.dataset.phase || activePhase;
    });
  });

  $("#phase-wa")?.addEventListener("click", () => {
    openWa(`Olá! Quero seguir o fluxo Base. Fase de interesse: ${activePhase}.`);
  });

  /* Checklist */
  const checkList = $("#check-list");
  const checkPct = $("#check-pct");
  const checkHint = $("#check-hint");

  const updateCheck = () => {
    const boxes = $$("#check-list input");
    const done = boxes.filter((b) => b.checked).length;
    if (checkPct) checkPct.textContent = `${done}/${boxes.length}`;
    if (checkHint) {
      checkHint.textContent =
        done === 0 ? "Marque o que já tem." : done === boxes.length ? "Pronto pra briefing." : `${done} itens ok.`;
    }
  };

  checkList?.addEventListener("change", updateCheck);
  updateCheck();

  $("#check-wa")?.addEventListener("click", () => {
    const boxes = $$("#check-list input");
    const have = boxes.filter((b) => b.checked).map((b) => b.value);
    const missing = boxes.filter((b) => !b.checked).map((b) => b.value);
    openWa(
      [
        "Olá! Checklist pré-obra — Base.",
        have.length ? `Já tenho:\n• ${have.join("\n• ")}` : "Ainda não marquei itens.",
        missing.length ? `\nAinda falta:\n• ${missing.join("\n• ")}` : "\nTudo marcado!",
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
    const type = String(fd.get("type") || "").trim();
    const area = String(fd.get("area") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      type: form.querySelector('[name="type"]')?.closest("label"),
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
    if (!type) {
      fields.type?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    if (formOk) formOk.hidden = false;
    openWa(
      [
        "Olá! Briefing de obra — Base Construtora.",
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `Tipo: ${type}`,
        area ? `Área: ${area} m²` : null,
        message ? `Descrição: ${message}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  });

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
