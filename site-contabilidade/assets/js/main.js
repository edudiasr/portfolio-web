(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Preloader */
  const preloader = $("#preloader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader?.classList.add("is-done");
      document.body.classList.add("is-loaded");
    }, 900);
  });
  setTimeout(() => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  }, 2200);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header / nav */
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

  /* Cursor */
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

    const hoverables = "a, button, .chip, .check, summary, input, select, textarea, .link-wa";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });
  }

  /* Magnetic */
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

  /* Tilt */
  if (finePointer) {
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

  /* Sparkline */
  const sparkLine = $("#spark-line");
  const sparkArea = $("#spark-area");
  const flowValue = $("#flow-value");
  const flowDelta = $("#flow-delta");

  const buildSpark = (points) => {
    const w = 320;
    const h = 140;
    const pad = 8;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const coords = points.map((v, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });
    const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" ");
    const area = `${d} L${coords[coords.length - 1][0]},${h} L${coords[0][0]},${h} Z`;
    if (sparkLine) sparkLine.setAttribute("d", d);
    if (sparkArea) sparkArea.setAttribute("d", area);
  };

  let sparkBase = [32, 38, 35, 44, 42, 50, 48, 55, 52, 60, 58, 66];
  buildSpark(sparkBase);

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  setInterval(() => {
    sparkBase = sparkBase.map((v, i) => {
      if (i < sparkBase.length - 1) return sparkBase[i + 1];
      return Math.max(28, Math.min(78, v + (Math.random() * 10 - 4)));
    });
    buildSpark(sparkBase);
    const last = sparkBase[sparkBase.length - 1];
    const first = sparkBase[0];
    const value = Math.round(28000 + last * 420);
    const delta = ((last - first) / first) * 100;
    if (flowValue) flowValue.textContent = formatBRL(value);
    if (flowDelta) {
      flowDelta.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
      flowDelta.classList.toggle("up", delta >= 0);
    }
  }, 3200);

  /* Next due in ledger */
  const nextDue = $("#next-due");
  const daysUntil = (dayOfMonth) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    if (target < now) target.setMonth(target.getMonth() + 1);
    return Math.ceil((target - now) / 86400000);
  };
  if (nextDue) {
    const d = daysUntil(20);
    nextDue.textContent = d === 0 ? "Hoje" : `${d}d · DAS`;
  }

  /* Deadlines */
  const setDeadline = (key, day) => {
    const el = $(`[data-deadline="${key}"] strong`);
    if (el) el.textContent = String(daysUntil(day));
  };
  setDeadline("das", 20);
  setDeadline("folha", 7);
  setDeadline("dctf", 15);

  /* Service filters */
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

  /* WA */
  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Gostaria de saber mais sobre: ${btn.dataset.wa || "serviços da Nexo"}.`);
    });
  });

  /* Regime simulator */
  const simRevenue = $("#sim-revenue");
  const simRevenueOut = $("#sim-revenue-out");
  const simActivity = $("#sim-activity");
  const simStaff = $("#sim-staff");
  const simRegime = $("#sim-regime");
  const simReason = $("#sim-reason");
  const simBar = $("#sim-bar");
  const simBullets = $("#sim-bullets");
  const simWa = $("#sim-wa");

  const updateSim = () => {
    const revenue = Number(simRevenue?.value) || 15000;
    const activity = simActivity?.value || "servico";
    const staff = Number(simStaff?.value) || 0;
    if (simRevenueOut) simRevenueOut.textContent = formatBRL(revenue);

    let regime = "Simples Nacional";
    let bar = 50;
    let reason = "Bom equilíbrio entre carga e burocracia para o seu porte atual.";
    let bullets = [
      "DAS unificado simplifica o mês a mês",
      "Ideal para faturamento em crescimento controlado",
      "Folha e fiscal cabem em um pacote mensal",
    ];

    const annual = revenue * 12;
    if (annual <= 81000 && staff === 0 && activity !== "industria") {
      regime = "MEI";
      bar = 18;
      reason = "Dentro do limite anual e sem equipe — MEI costuma ser o caminho mais leve.";
      bullets = [
        "DAS fixo e obrigações reduzidas",
        "Atenção ao limite de faturamento",
        "Quando crescer, planejamos a migração",
      ];
    } else if (annual > 4800000 || (activity === "industria" && revenue > 80000)) {
      regime = "Lucro Presumido";
      bar = 88;
      reason = "Porte e atividade sugerem avaliar Presumido com planejamento tributário.";
      bullets = [
        "Comparativo Simples × Presumido é essencial",
        "Folha e créditos mudam a conta",
        "Análise personalizada evita surpresa",
      ];
    } else if (revenue > 70000 || staff >= 2) {
      regime = "Simples Nacional";
      bar = 58;
      reason = "Com equipe ou faturamento médio, o Simples ainda costuma ser competitivo.";
      bullets = [
        "Anexos do Simples mudam conforme a atividade",
        "Folha impacta o fator R em serviços",
        "Monitoramos o sublimite estadual",
      ];
    }

    if (simRegime) simRegime.textContent = regime;
    if (simReason) simReason.textContent = reason;
    if (simBar) simBar.style.width = `${bar}%`;
    if (simBullets) {
      simBullets.innerHTML = bullets.map((b) => `<li>${b}</li>`).join("");
    }
  };

  [simRevenue, simActivity, simStaff].forEach((el) => {
    el?.addEventListener("input", updateSim);
    el?.addEventListener("change", updateSim);
  });
  updateSim();

  simWa?.addEventListener("click", () => {
    openWa(
      [
        "Olá! Quero uma análise real de regime na Nexo Contábil.",
        `Faturamento mensal estimado: ${simRevenueOut?.textContent || ""}`,
        `Atividade: ${simActivity?.options[simActivity.selectedIndex]?.text || ""}`,
        `Funcionários: ${simStaff?.options[simStaff.selectedIndex]?.text || ""}`,
        `Sugestão na tela: ${simRegime?.textContent || ""}`,
      ].join("\n")
    );
  });

  /* Checklist */
  const checkList = $("#check-list");
  const checkRing = $("#check-ring");
  const checkPct = $("#check-pct");
  const checkHint = $("#check-hint");
  const checkSend = $("#check-send");
  const RING = 2 * Math.PI * 52;

  const updateCheck = () => {
    const boxes = $$("#check-list input");
    const done = boxes.filter((b) => b.checked).length;
    const total = boxes.length || 1;
    const pct = Math.round((done / total) * 100);
    if (checkRing) checkRing.style.strokeDashoffset = String(RING - (RING * pct) / 100);
    if (checkPct) checkPct.textContent = `${pct}%`;
    if (checkHint) {
      checkHint.textContent =
        done === 0
          ? "Nenhum item marcado ainda."
          : done === total
            ? "Documentação completa — pode enviar."
            : `${done} de ${total} itens prontos.`;
    }
  };

  if (checkRing) {
    checkRing.style.strokeDasharray = String(RING);
    checkRing.style.strokeDashoffset = String(RING);
  }

  checkList?.addEventListener("change", updateCheck);
  updateCheck();

  checkSend?.addEventListener("click", () => {
    const boxes = $$("#check-list input");
    const have = boxes.filter((b) => b.checked).map((b) => b.value);
    const missing = boxes.filter((b) => !b.checked).map((b) => b.value);
    openWa(
      [
        "Olá! Checklist de abertura — Nexo Contábil.",
        have.length ? `Já tenho:\n• ${have.join("\n• ")}` : "Ainda não marquei o que tenho.",
        missing.length ? `\nAinda falta:\n• ${missing.join("\n• ")}` : "\nTudo marcado!",
        "\nPodem me orientar no próximo passo?",
      ].join("\n")
    );
  });

  /* Contact form */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      company: form.querySelector('[name="company"]')?.closest("label"),
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
    if (company.length < 2) {
      fields.company?.classList.add("is-invalid");
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
        "Olá! Solicitação de proposta — Nexo Contábil.",
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `Empresa/CPF: ${company}`,
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
