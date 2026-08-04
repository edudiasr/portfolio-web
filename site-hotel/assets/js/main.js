(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const formatDateBR = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  /* Preloader */
  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1100));
  setTimeout(finishBoot, 2200);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header / progress / to-top */
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
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      toggle?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    nav?.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });

  /* Spy */
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
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* Cursor + magnetic + tilt */
  const cursor = $("#cursor");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (cursor && finePointer && !reduceMotion) {
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
    const hoverables = "a, button, .chip, summary, input, select, textarea, .float-wa";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });
  }

  if (finePointer && !reduceMotion) {
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

  /* Room filters */
  const chips = $$(".chip");
  const rooms = $$(".room-card");
  const empty = $("#rooms-empty");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      let visible = 0;
      rooms.forEach((r) => {
        const show = f === "all" || r.dataset.cat === f;
        r.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  /* Book room CTA → prefill stay form */
  $$(".book-room").forEach((btn) => {
    btn.addEventListener("click", () => {
      const room = btn.dataset.room || "";
      const select = $("#stay-room");
      if (select && room) {
        [...select.options].forEach((opt) => {
          if (opt.value === room || opt.textContent === room) opt.selected = true;
        });
      }
      $("#reservar")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Stay form dates */
  const checkin = $("#checkin");
  const checkout = $("#checkout");
  const today = new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);
  if (checkin) {
    checkin.min = toISO(today);
    if (!checkin.value) checkin.value = toISO(today);
  }
  if (checkout) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkout.min = toISO(tomorrow);
    if (!checkout.value) checkout.value = toISO(tomorrow);
  }

  checkin?.addEventListener("change", () => {
    if (!checkout || !checkin.value) return;
    const next = new Date(checkin.value + "T12:00:00");
    next.setDate(next.getDate() + 1);
    checkout.min = toISO(next);
    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = toISO(next);
    }
  });

  $("#stay-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const cin = String(fd.get("checkin") || "");
    const cout = String(fd.get("checkout") || "");
    const guests = String(fd.get("guests") || "2");
    const room = String(fd.get("room") || "").trim();
    const hint = $("#stay-hint");

    const nameField = form.querySelector('[name="name"]')?.closest(".field");
    const cinField = form.querySelector('[name="checkin"]')?.closest(".field");
    const coutField = form.querySelector('[name="checkout"]')?.closest(".field");
    [nameField, cinField, coutField].forEach((f) => f?.classList.remove("is-invalid"));

    let ok = true;
    if (name.length < 2) {
      nameField?.classList.add("is-invalid");
      ok = false;
    }
    if (!cin) {
      cinField?.classList.add("is-invalid");
      ok = false;
    }
    if (!cout || cout <= cin) {
      coutField?.classList.add("is-invalid");
      ok = false;
    }
    if (hint) hint.hidden = ok;
    if (!ok) return;

    openWa(
      [
        "Olá! Gostaria de reservar na Alba Hotel.",
        `Nome: ${name}`,
        `Check-in: ${formatDateBR(cin)}`,
        `Check-out: ${formatDateBR(cout)}`,
        `Hóspedes: ${guests}`,
        room ? `Quarto: ${room}` : "Quarto: a combinar",
      ].join("\n")
    );
  });

  /* Contact form */
  const contactForm = $("#contact-form");
  const formOk = $("#form-ok");

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: contactForm.querySelector('[name="name"]')?.closest(".field"),
      phone: contactForm.querySelector('[name="phone"]')?.closest(".field"),
      message: contactForm.querySelector('[name="message"]')?.closest(".field"),
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
    if (message.length < 3) {
      fields.message?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    if (formOk) formOk.hidden = false;
    openWa(
      ["Olá! Contato — Alba Hotel.", `Nome: ${name}`, `WhatsApp: ${phone}`, `Mensagem: ${message}`].join("\n")
    );
  });

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
