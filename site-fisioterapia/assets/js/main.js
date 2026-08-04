(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  /* Preloader */
  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1600));
  setTimeout(finishBoot, 2800);

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
    const hoverables = "a, button, .chip, .zone, .slot, summary, input, select, textarea, .link-wa";
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

  /* Breath cycle */
  const breathLabel = $("#breath-label");
  const poseFocus = $("#pose-focus");
  const focuses = ["Core & respiração", "Mobilidade de coluna", "Estabilidade de quadril", "Alongamento ativo"];
  let fi = 0;
  let inhale = true;
  setInterval(() => {
    inhale = !inhale;
    if (breathLabel) breathLabel.textContent = inhale ? "Inspira" : "Expira";
  }, 2800);
  setInterval(() => {
    fi = (fi + 1) % focuses.length;
    if (poseFocus) poseFocus.textContent = focuses[fi];
  }, 4500);

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
      openWa(`Olá! Quero agendar: ${btn.dataset.wa || "avaliação na Alinha"}.`);
    });
  });

  $$("[data-wa-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Tenho interesse no plano: ${btn.dataset.waPlan}.`);
    });
  });

  /* Body zones */
  const selected = new Set();
  const zoneName = $("#zone-name");
  const zoneHint = $("#zone-hint");
  const zoneList = $("#zone-list");
  const zoneWa = $("#zone-wa");

  const renderZones = () => {
    if (zoneList) {
      zoneList.innerHTML = [...selected].map((z) => `<li>${z}</li>`).join("");
    }
    if (!selected.size) {
      if (zoneName) zoneName.textContent = "Toque no mapa";
      if (zoneHint) zoneHint.textContent = "Escolha a região pra montarmos a mensagem de avaliação.";
      if (zoneWa) zoneWa.disabled = true;
      return;
    }
    const arr = [...selected];
    if (zoneName) zoneName.textContent = arr[arr.length - 1];
    if (zoneHint) zoneHint.textContent = `${arr.length} área(s) marcada(s). Pode enviar.`;
    if (zoneWa) zoneWa.disabled = false;
  };

  $$(".zone").forEach((btn) => {
    btn.addEventListener("click", () => {
      const z = btn.dataset.zone;
      if (selected.has(z)) {
        selected.delete(z);
        btn.classList.remove("is-on");
      } else {
        selected.add(z);
        btn.classList.add("is-on");
      }
      renderZones();
    });
  });

  zoneWa?.addEventListener("click", () => {
    if (!selected.size) return;
    openWa(
      `Olá! Quero avaliação na Alinha.\nÁreas: ${[...selected].join(", ")}\nPodem me orientar no próximo passo?`
    );
  });

  /* Schedule */
  const schedule = {
    seg: [
      { time: "07:00", name: "Solo · Iniciante", full: false },
      { time: "09:00", name: "Aparelhos", full: false },
      { time: "12:00", name: "Solo · Intermediário", full: true },
      { time: "18:00", name: "Terapêutico", full: false },
      { time: "19:30", name: "Solo · Avançado", full: false },
    ],
    ter: [
      { time: "08:00", name: "Gestante", full: false },
      { time: "10:00", name: "Aparelhos", full: false },
      { time: "17:00", name: "Solo · Iniciante", full: false },
      { time: "18:30", name: "Solo · Intermediário", full: false },
      { time: "20:00", name: "Aparelhos", full: true },
    ],
    qua: [
      { time: "07:00", name: "Solo · Iniciante", full: false },
      { time: "09:30", name: "Terapêutico", full: false },
      { time: "12:00", name: "Aparelhos", full: false },
      { time: "18:00", name: "Solo · Avançado", full: false },
      { time: "19:30", name: "Solo · Intermediário", full: false },
    ],
    qui: [
      { time: "08:00", name: "Aparelhos", full: false },
      { time: "10:00", name: "Solo · Iniciante", full: true },
      { time: "17:30", name: "Gestante", full: false },
      { time: "19:00", name: "Terapêutico", full: false },
      { time: "20:00", name: "Solo · Intermediário", full: false },
    ],
    sex: [
      { time: "07:00", name: "Solo · Iniciante", full: false },
      { time: "09:00", name: "Aparelhos", full: false },
      { time: "12:00", name: "Solo · Intermediário", full: false },
      { time: "17:00", name: "Terapêutico", full: false },
      { time: "18:30", name: "Solo · Avançado", full: false },
    ],
    sab: [
      { time: "08:00", name: "Solo · Aberto", full: false },
      { time: "09:30", name: "Aparelhos", full: false },
      { time: "11:00", name: "Gestante", full: false },
    ],
  };

  const dayNames = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado" };
  const schedGrid = $("#sched-grid");
  let currentDay = "seg";

  const renderSched = (day) => {
    currentDay = day;
    const slots = schedule[day] || [];
    if (!schedGrid) return;
    schedGrid.innerHTML = slots
      .map(
        (s) => `
      <button type="button" class="slot ${s.full ? "is-full" : ""}" ${s.full ? "disabled" : ""} data-time="${s.time}" data-name="${s.name}">
        <strong>${s.time}</strong>
        <span>${s.full ? "Lotado" : s.name}</span>
      </button>`
      )
      .join("");
    $$(".slot:not(:disabled)", schedGrid).forEach((btn) => {
      btn.addEventListener("click", () => {
        openWa(
          `Olá! Quero pré-reservar pilates na Alinha.\n${dayNames[day]} · ${btn.dataset.time} · ${btn.dataset.name}`
        );
      });
    });
  };

  $$("#sched-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#sched-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderSched(btn.dataset.day);
    });
  });
  renderSched("seg");

  /* Contact */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const pref = String(fd.get("pref") || "").trim();
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
        "Olá! Agendamento Alinha.",
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `Interesse: ${interest}`,
        `Preferência: ${pref}`,
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
