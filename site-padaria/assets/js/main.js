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
  const cursor = $("#cursor");
  const cursorDot = $(".cursor__dot");
  const cursorRing = $(".cursor__ring");

  if (year) year.textContent = String(new Date().getFullYear());

  const money = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  /* Cursor */
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
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
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

  /* Reveal */
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

  /* Counters */
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

  /* Tilt + magnetic */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((card) => {
      const max = 7;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-2px)`;
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

  /* Specials rotator */
  const specials = [
    {
      name: "Pão rústico de fermentação",
      desc: "Crosta crocante, miolo alveolado. Sai às 7h.",
      price: 18,
    },
    {
      name: "Croissant de amêndoas",
      desc: "Massa folhada com creme — fornada das 8h.",
      price: 16,
    },
    {
      name: "Focaccia de alecrim",
      desc: "Azeite, flor de sal e ervas frescas.",
      price: 22,
    },
    {
      name: "Brioche de chocolate",
      desc: "Recheio intenso, porção generosa.",
      price: 15,
    },
  ];

  let specialIdx = 0;
  const specialName = $("#special-name");
  const specialDesc = $("#special-desc");
  const specialPrice = $("#special-price");
  const specialAdd = $("#special-add");

  const renderSpecial = () => {
    const s = specials[specialIdx];
    if (!s) return;
    if (specialName) specialName.textContent = s.name;
    if (specialDesc) specialDesc.textContent = s.desc;
    if (specialPrice) specialPrice.textContent = money(s.price);
  };

  renderSpecial();

  if (!reduceMotion) {
    setInterval(() => {
      specialIdx = (specialIdx + 1) % specials.length;
      renderSpecial();
    }, 4000);
  }

  specialAdd?.addEventListener("click", () => {
    const s = specials[specialIdx];
    addToCart(s.name, s.price);
    openCart();
  });

  /* Cart */
  const cart = new Map();
  const cartToggle = $("#cart-toggle");
  const cartClose = $("#cart-close");
  const cartDrawer = $("#cart-drawer");
  const cartBackdrop = $("#cart-backdrop");
  const cartList = $("#cart-list");
  const cartEmpty = $("#cart-empty");
  const cartCount = $("#cart-count");
  const cartTotal = $("#cart-total");
  const cartWa = $("#cart-wa");

  const openCart = () => {
    cartDrawer?.classList.add("is-open");
    cartDrawer?.setAttribute("aria-hidden", "false");
    cartBackdrop?.classList.add("is-open");
    if (cartBackdrop) cartBackdrop.hidden = false;
  };

  const closeCart = () => {
    cartDrawer?.classList.remove("is-open");
    cartDrawer?.setAttribute("aria-hidden", "true");
    cartBackdrop?.classList.remove("is-open");
    if (cartBackdrop) cartBackdrop.hidden = true;
  };

  cartToggle?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartBackdrop?.addEventListener("click", closeCart);
  $("#cta-cart")?.addEventListener("click", openCart);

  function addToCart(name, price) {
    const key = name;
    const current = cart.get(key) || { name, price, qty: 0 };
    current.qty += 1;
    cart.set(key, current);
    renderCart();
  }

  function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach((item, key) => {
      total += item.price * item.qty;
      count += item.qty;
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.name} × ${item.qty}</span>
        <strong>${money(item.price * item.qty)}</strong>
        <button type="button" aria-label="Remover">✕</button>
      `;
      li.querySelector("button")?.addEventListener("click", () => {
        cart.delete(key);
        renderCart();
      });
      cartList.appendChild(li);
    });

    if (cartCount) cartCount.textContent = String(count);
    if (cartTotal) cartTotal.textContent = money(total);
    cartEmpty?.classList.toggle("is-hidden", count > 0);
  }

  $$(".item").forEach((card) => {
    card.querySelector(".add-btn")?.addEventListener("click", () => {
      addToCart(card.dataset.name, Number(card.dataset.price || 0));
      openCart();
    });
  });

  cartWa?.addEventListener("click", () => {
    if (!cart.size) {
      openWa("Olá! Quero montar um pedido na Levain.");
      return;
    }
    const lines = [...cart.values()].map((i) => `• ${i.name} × ${i.qty} — ${money(i.price * i.qty)}`);
    const total = [...cart.values()].reduce((s, i) => s + i.price * i.qty, 0);
    openWa(["Olá! Quero pedir na Levain:", "", ...lines, "", `Total: ${money(total)}`].join("\n"));
  });

  /* Filters */
  const chips = $$(".chip");
  const items = $$(".item");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      items.forEach((card, i) => {
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
            }, i * 35);
          });
        }
      });
    });
  });

  function openWa(text) {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank");
  }

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Tenho interesse em: ${btn.dataset.wa || "encomenda Levain"}.`);
    });
  });

  /* Form */
  const form = $("#contact-form");
  const formOk = $("#form-ok");
  const phoneRe = /\d{10,}/;

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const type = String(data.get("type") || "").trim();
    const message = String(data.get("message") || "").trim();

    form.querySelector('[name="name"]')?.closest("label")?.classList.toggle("is-invalid", !name);
    form
      .querySelector('[name="phone"]')
      ?.closest("label")
      ?.classList.toggle("is-invalid", !phoneRe.test(phone.replace(/\D/g, "")));
    form.querySelector('[name="type"]')?.closest("label")?.classList.toggle("is-invalid", !type);

    if (!name || !phoneRe.test(phone.replace(/\D/g, "")) || !type) return;

    const text = [
      "Olá! Contato pela Levain.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Tipo: ${type}`,
      message ? `Detalhes: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (formOk) formOk.hidden = false;
    openWa(text);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  renderCart();
})();
