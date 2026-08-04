(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const formatBRL = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  /* Preloader */
  const preloader = $("#preloader");
  const finishBoot = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1200));
  setTimeout(finishBoot, 2400);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Day pill */
  const pill = $("#day-pill");
  if (pill) {
    const h = new Date().getHours();
    if (h < 11) pill.textContent = "Bom dia · café time";
    else if (h < 17) pill.textContent = "Boa tarde · açaí time";
    else pill.textContent = "Boa noite · pós-treino";
  }

  /* Berry particles */
  const canvas = $("#berry-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const berries = [];
    const colors = ["#9b3db5", "#c44dff", "#ff5c8a", "#b8f154"];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 28; i++) {
      berries.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 2 + Math.random() * 4,
        vy: 0.15 + Math.random() * 0.45,
        vx: -0.2 + Math.random() * 0.4,
        c: colors[i % colors.length],
        a: 0.15 + Math.random() * 0.35,
      });
    }
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      berries.forEach((b) => {
        b.y += b.vy;
        b.x += b.vx;
        if (b.y > canvas.height + 10) {
          b.y = -10;
          b.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.fillStyle = b.c;
        ctx.globalAlpha = b.a;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };
    tick();
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
    const decimals = Number(el.dataset.decimals) || 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = `${decimals ? val.toFixed(decimals) : Math.round(val)}${suffix}`;
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
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = "a, button, .chip, .add, summary, input, textarea, .tops button, .seg button";
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
        btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.2}px, ${(e.clientY - (r.top + r.height / 2)) * 0.24}px)`;
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
        card.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -10}deg) rotateY(${(px - 0.5) * 12}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Cart */
  const cart = [];
  const drawer = $("#cart-drawer");
  const cartList = $("#cart-list");
  const cartEmpty = $("#cart-empty");
  const cartCount = $("#cart-count");
  const cartTotal = $("#cart-total");
  const toast = $("#toast");

  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const showToast = () => {
    if (!toast) return;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-on"));
    setTimeout(() => {
      toast.classList.remove("is-on");
      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 1600);
  };

  const renderCart = () => {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartCount) cartCount.textContent = String(totalQty);
    if (cartTotal) cartTotal.textContent = formatBRL(total);
    if (cartEmpty) cartEmpty.hidden = cart.length > 0;
    if (!cartList) return;
    cartList.innerHTML = cart
      .map(
        (item, idx) => `
      <li class="drawer__item">
        <strong>${item.name}${item.qty > 1 ? ` ×${item.qty}` : ""}</strong>
        <span>${item.detail || ""}</span>
        <em>${formatBRL(item.price * item.qty)}</em>
        <button type="button" data-remove="${idx}">Remover</button>
      </li>`
      )
      .join("");
    $$("[data-remove]", cartList).forEach((btn) => {
      btn.addEventListener("click", () => {
        cart.splice(Number(btn.dataset.remove), 1);
        renderCart();
      });
    });
  };

  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id && c.detail === item.detail);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    renderCart();
    showToast();
  };

  const openCart = () => {
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
  };
  const closeCart = () => {
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
  };

  $("#cart-open")?.addEventListener("click", openCart);
  $("#cart-close")?.addEventListener("click", closeCart);
  $("#cart-close-bg")?.addEventListener("click", closeCart);

  $("#cart-wa")?.addEventListener("click", () => {
    if (!cart.length) {
      openCart();
      return;
    }
    const lines = cart.map((i) => `• ${i.name}${i.qty > 1 ? ` x${i.qty}` : ""}${i.detail ? ` (${i.detail})` : ""} — ${formatBRL(i.price * i.qty)}`);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    openWa(`Olá! Pedido Pulp:\n${lines.join("\n")}\n\nTotal: ${formatBRL(total)}\nRetirada no balcão.`);
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    try {
      const data = JSON.parse(btn.getAttribute("data-add"));
      addToCart({ id: data.id, name: data.name, price: data.price, detail: "" });
    } catch (_) {
      /* ignore */
    }
  });

  renderCart();

  /* Menu filters */
  const chips = $$(".chip");
  const cards = $$(".menu-card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        card.classList.toggle("is-hidden", !(f === "all" || card.dataset.cat === f));
      });
    });
  });

  /* Builder */
  let base = { key: "acai", label: "Açaí", color: "#9b3db5" };
  let size = { ml: 300, price: 22 };
  const tops = new Map();
  const topColors = ["#b8f154", "#ff5c8a", "#fff", "#f0e6a8", "#c4a484", "#c44dff"];

  const builderFill = $("#builder-fill");
  const builderTops = $("#builder-tops");
  const builderPrice = $("#builder-price");
  const builderSummary = $("#builder-summary");
  const topCount = $("#top-count");

  const updateBuilder = () => {
    if (builderFill) {
      builderFill.style.background = `radial-gradient(circle at 40% 30%, ${base.color}ee, ${base.color} 55%, #4a1a58)`;
    }
    const extras = [...tops.values()].reduce((s, t) => s + t.extra, 0);
    const total = size.price + extras;
    if (builderPrice) builderPrice.textContent = formatBRL(total);
    const topNames = [...tops.keys()];
    if (builderSummary) {
      builderSummary.textContent = topNames.length
        ? `${base.label} · ${size.ml}ml · ${topNames.join(", ")}`
        : `${base.label} · ${size.ml}ml`;
    }
    if (topCount) topCount.textContent = `(${tops.size}/5)`;

    if (builderTops) {
      builderTops.innerHTML = topNames
        .map((name, i) => {
          const x = 10 + ((i * 37) % 70);
          const y = 15 + ((i * 23) % 55);
          return `<i style="--x:${x}%;--y:${y}%;--c:${topColors[i % topColors.length]};--d:${i * 0.12}s" title="${name}"></i>`;
        })
        .join("");
    }

    $$("#top-grid button").forEach((btn) => {
      const on = tops.has(btn.dataset.top);
      btn.classList.toggle("active", on);
      btn.classList.toggle("is-disabled", !on && tops.size >= 5);
    });
  };

  $$("#base-seg button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#base-seg button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      base = {
        key: btn.dataset.base,
        label: btn.textContent.trim(),
        color: btn.dataset.color || "#9b3db5",
      };
      updateBuilder();
    });
  });

  $$("#size-seg button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#size-seg button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      size = { ml: Number(btn.dataset.size), price: Number(btn.dataset.price) };
      updateBuilder();
    });
  });

  $$("#top-grid button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.top;
      if (tops.has(name)) tops.delete(name);
      else if (tops.size < 5) tops.set(name, { extra: Number(btn.dataset.extra) || 0 });
      updateBuilder();
    });
  });

  updateBuilder();

  $("#builder-add")?.addEventListener("click", () => {
    const extras = [...tops.values()].reduce((s, t) => s + t.extra, 0);
    const topNames = [...tops.keys()];
    const detail = topNames.length ? topNames.join(", ") : "sem toppings extras";
    const id = `custom-${base.key}-${size.ml}-${topNames.join("-") || "plain"}`;
    addToCart({
      id,
      name: `Bowl ${base.label} ${size.ml}ml`,
      price: size.price + extras,
      detail,
    });
    openCart();
  });

  /* Loyalty stamps animation */
  const stamps = $$("#stamps i");
  let stampIdx = 7;
  setInterval(() => {
    stamps.forEach((s) => s.classList.remove("is-on"));
    stampIdx = (stampIdx + 1) % stamps.length;
    for (let i = 0; i <= stampIdx && i < 7; i++) stamps[i]?.classList.add("is-on");
  }, 2800);

  /* Contact */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      message: form.querySelector('[name="message"]')?.closest("label"),
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
    if (message.length < 2) {
      fields.message?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    if (formOk) formOk.hidden = false;
    openWa(`Olá! Mensagem Pulp.\nNome: ${name}\nWhatsApp: ${phone}\n${message}`);
  });

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
