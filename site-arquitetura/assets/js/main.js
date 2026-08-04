(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Preloader */
  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1400));
  setTimeout(finishBoot, 2600);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

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
    const hoverables = "a, button, .chip, .swatch, summary, input, select, textarea, .link-wa, .ba__handle";
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
        card.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -8}deg) rotateY(${(px - 0.5) * 10}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Blueprint area pulse */
  const bpArea = $("#bp-area");
  const areas = ["86 m²", "92 m²", "78 m²", "104 m²"];
  let ai = 0;
  setInterval(() => {
    ai = (ai + 1) % areas.length;
    if (bpArea) bpArea.textContent = areas[ai];
  }, 4000);

  /* Project filters */
  const chips = $$(".chip");
  const projects = $$(".project");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      projects.forEach((p) => {
        p.classList.toggle("is-hidden", !(f === "all" || p.dataset.cat === f));
      });
    });
  });

  /* WA */
  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Tenho interesse em um ${btn.dataset.wa || "projeto com o Traço Studio"}.`);
    });
  });

  /* Before / after slider */
  const frame = $("#ba-frame");
  const before = $("#ba-before");
  const handle = $("#ba-handle");
  const beforeScene = before?.querySelector(".ba__scene");

  const syncBaScene = () => {
    if (frame && beforeScene) beforeScene.style.width = `${frame.offsetWidth}px`;
  };
  syncBaScene();
  window.addEventListener("resize", syncBaScene);

  const setBa = (pct) => {
    const p = Math.max(5, Math.min(95, pct));
    if (before) before.style.width = `${p}%`;
    if (handle) {
      handle.style.left = `${p}%`;
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
    }
  };

  const baFromEvent = (clientX) => {
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    setBa(((clientX - r.left) / r.width) * 100);
  };

  let dragging = false;
  handle?.addEventListener("pointerdown", (e) => {
    dragging = true;
    handle.setPointerCapture?.(e.pointerId);
  });
  frame?.addEventListener("pointerdown", (e) => {
    if (e.target === handle || handle?.contains(e.target)) return;
    dragging = true;
    baFromEvent(e.clientX);
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    baFromEvent(e.clientX);
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  handle?.addEventListener("keydown", (e) => {
    const now = Number(handle.getAttribute("aria-valuenow") || 50);
    if (e.key === "ArrowLeft") setBa(now - 3);
    if (e.key === "ArrowRight") setBa(now + 3);
  });

  /* Materials mood board */
  const selected = new Map();
  const moodChips = $("#mood-chips");
  const moodHint = $("#mood-hint");

  const renderMood = () => {
    if (!moodChips) return;
    moodChips.innerHTML = [...selected.entries()]
      .map(([name, hex]) => `<span><i style="background:${hex}"></i>${name}</span>`)
      .join("");
    if (moodHint) {
      moodHint.textContent =
        selected.size === 0
          ? "Selecione até 4 materiais."
          : selected.size >= 4
            ? "Paleta cheia — envie ou desmarque alguma."
            : `${selected.size} material(is) no mood.`;
    }
  };

  $$(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const name = sw.dataset.name;
      const hex = sw.dataset.hex;
      if (selected.has(name)) {
        selected.delete(name);
        sw.classList.remove("is-on");
      } else {
        if (selected.size >= 4) return;
        selected.set(name, hex);
        sw.classList.add("is-on");
      }
      /* keep first default if empty visual - sync classes */
      renderMood();
    });
  });

  /* seed one default */
  const first = $(".swatch");
  if (first) {
    selected.set(first.dataset.name, first.dataset.hex);
    first.classList.add("is-on");
  }
  renderMood();

  $("#mood-wa")?.addEventListener("click", () => {
    if (!selected.size) {
      if (moodHint) moodHint.textContent = "Escolha ao menos um material.";
      return;
    }
    openWa(
      `Olá! Mood board preliminar — Traço Studio.\nMateriais: ${[...selected.keys()].join(", ")}\nPodem me orientar no próximo passo?`
    );
  });

  /* Scope estimator */
  const scopeType = $("#scope-type");
  const scopeArea = $("#scope-area");
  const scopeAreaOut = $("#scope-area-out");
  const scopeDetail = $("#scope-detail");
  const scopeDetailOut = $("#scope-detail-out");
  const scopeRange = $("#scope-range");
  const scopeLabel = $("#scope-label");

  const detailMap = [
    { label: "Estudo preliminar", mult: 0.72 },
    { label: "Projeto executivo", mult: 1 },
    { label: "Executivo + obra assistida", mult: 1.35 },
  ];

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const updateScope = () => {
    const base = Number(scopeType?.value) || 280;
    const area = Number(scopeArea?.value) || 120;
    const d = Number(scopeDetail?.value) || 1;
    const info = detailMap[d] || detailMap[1];
    if (scopeAreaOut) scopeAreaOut.textContent = `${area} m²`;
    if (scopeDetailOut) scopeDetailOut.textContent = info.label;
    const low = Math.round(base * (area / 100) * info.mult);
    const high = Math.round(low * 1.35);
    if (scopeRange) scopeRange.textContent = `${formatBRL(low)} — ${formatBRL(high)}`;
    const typeName = scopeType?.options[scopeType.selectedIndex]?.text || "Projeto";
    if (scopeLabel) scopeLabel.textContent = `${typeName} · ${area} m² · ${info.label}`;
  };

  [scopeType, scopeArea, scopeDetail].forEach((el) => {
    el?.addEventListener("input", updateScope);
    el?.addEventListener("change", updateScope);
  });
  updateScope();

  $("#scope-wa")?.addEventListener("click", () => {
    openWa(
      [
        "Olá! Quero uma proposta formal — Traço Studio.",
        `Estimativa na tela: ${scopeRange?.textContent || ""}`,
        scopeLabel?.textContent || "",
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
        "Olá! Briefing rápido — Traço Studio.",
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
