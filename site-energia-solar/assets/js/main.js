(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const WA = "5547992072891";
  const header = $("#header");
  const nav = $("#nav");
  const navToggle = $("#nav-toggle");
  const progress = $("#progress");
  const toTop = $("#to-top");
  const year = $("#year");

  if (year) year.textContent = String(new Date().getFullYear());

  const money = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

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
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1300;
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

  /* Hero simulator */
  const billRange = $("#bill-range");
  const billValue = $("#bill-value");
  const propertyType = $("#property-type");
  const saveMonth = $("#save-month");
  const saveYear = $("#save-year");

  const updateHeroSim = () => {
    const bill = Number(billRange?.value || 450);
    const factor = Number(propertyType?.value || 1);
    const save = Math.round(bill * 0.9 * factor);
    if (billValue) billValue.textContent = money(bill);
    if (saveMonth) saveMonth.textContent = money(save);
    if (saveYear) saveYear.textContent = money(save * 12);
  };

  billRange?.addEventListener("input", updateHeroSim);
  propertyType?.addEventListener("change", updateHeroSim);
  updateHeroSim();

  $("#sim-wa")?.addEventListener("click", () => {
    const bill = Number(billRange?.value || 450);
    const typeLabel = propertyType?.selectedOptions?.[0]?.text || "Residencial";
    const save = Math.round(bill * 0.9 * Number(propertyType?.value || 1));
    openWa(
      [
        "Olá! Quero uma proposta da Solara.",
        "",
        `Tipo: ${typeLabel}`,
        `Conta atual: ${money(bill)}`,
        `Economia estimada no simulador: ${money(save)}/mês`,
      ].join("\n")
    );
  });

  /* Economy calculator */
  const calcBill = $("#calc-bill");
  const calcPct = $("#calc-pct");
  const calcPctOut = $("#calc-pct-out");
  const barNow = $("#bar-now");
  const barSolar = $("#bar-solar");
  const labelNow = $("#label-now");
  const labelSolar = $("#label-solar");
  const labelSave = $("#label-save");
  const labelYear = $("#label-year");

  const updateCalc = () => {
    const bill = Math.max(0, Number(calcBill?.value || 0));
    const pct = Number(calcPct?.value || 90) / 100;
    const solar = Math.round(bill * (1 - pct));
    const save = Math.max(0, bill - solar);
    if (calcPctOut) calcPctOut.textContent = `${Math.round(pct * 100)}%`;
    if (labelNow) labelNow.textContent = money(bill);
    if (labelSolar) labelSolar.textContent = money(solar);
    if (labelSave) labelSave.textContent = money(save);
    if (labelYear) labelYear.textContent = `${money(save * 12)} / ano`;
    const max = Math.max(bill, 1);
    if (barNow) barNow.style.height = `${Math.max(8, (bill / max) * 90)}%`;
    if (barSolar) barSolar.style.height = `${Math.max(6, (solar / max) * 90)}%`;
  };

  calcBill?.addEventListener("input", updateCalc);
  calcPct?.addEventListener("input", updateCalc);
  updateCalc();

  /* Filters */
  const chips = $$(".chip");
  const projects = $$(".project");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      projects.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  function openWa(text) {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank");
  }

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Tenho interesse em: ${btn.dataset.wa || "energia solar"}.`);
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
    const bill = String(data.get("bill") || "").trim();
    const type = String(data.get("type") || "").trim();
    const place = String(data.get("place") || "").trim();
    const message = String(data.get("message") || "").trim();

    form.querySelector('[name="name"]')?.closest("label")?.classList.toggle("is-invalid", !name);
    form
      .querySelector('[name="phone"]')
      ?.closest("label")
      ?.classList.toggle("is-invalid", !phoneRe.test(phone.replace(/\D/g, "")));
    form.querySelector('[name="type"]')?.closest("label")?.classList.toggle("is-invalid", !type);

    if (!name || !phoneRe.test(phone.replace(/\D/g, "")) || !type) return;

    const text = [
      "Olá! Quero uma simulação com a Solara Energia.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Tipo: ${type}`,
      bill ? `Conta média: R$ ${bill}` : null,
      place ? `Local: ${place}` : null,
      message ? `Obs.: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
