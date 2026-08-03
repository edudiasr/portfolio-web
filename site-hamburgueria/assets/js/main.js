"use strict";

const WHATSAPP = "5547992072891";
const cart = [];

/* Preloader */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("is-done"), 400);
});

/* Header + to top */
(() => {
  const header = document.getElementById("header");
  const toTop = document.getElementById("to-top");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 30);
    toTop.classList.toggle("is-visible", window.scrollY > 650);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

/* Mobile nav */
(() => {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");

  const close = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll(".nav__link").forEach((l) => l.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* Scrollspy */
(() => {
  const links = document.querySelectorAll(".nav__link");
  const sections = [...links]
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
})();

/* Reveal */
(() => {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${(i % 4) * 60}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
})();

/* Counters */
(() => {
  const counters = document.querySelectorAll("[data-count]");

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1500;
    const isDecimal = suffix.startsWith(".");

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;

      if (isDecimal) {
        el.textContent = value.toFixed(1);
      } else {
        el.textContent = Math.round(value).toLocaleString("pt-BR") + suffix;
      }

      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
})();

/* Menu filter */
(() => {
  const tabs = document.querySelectorAll(".menu-tab");
  const cards = document.querySelectorAll(".menu-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });
})();

/* Cart */
const cartEl = document.getElementById("cart");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");

function renderCart() {
  cartEl.querySelectorAll(".cart__item").forEach((n) => n.remove());

  if (!cart.length) {
    cartEmpty.hidden = false;
    cartTotal.textContent = "R$ 0";
    return;
  }

  cartEmpty.hidden = true;
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.className = "cart__item";
    li.innerHTML = `<span>${item.name}</span><span>R$ ${item.price} <button type="button" data-remove="${index}" aria-label="Remover">✕</button></span>`;
    cartEl.appendChild(li);
  });

  cartTotal.textContent = `R$ ${total}`;
}

document.querySelectorAll(".btn-add").forEach((btn) => {
  const original = btn.textContent;
  btn.addEventListener("click", () => {
    cart.push({ name: btn.dataset.item, price: Number(btn.dataset.price) });
    btn.classList.add("is-added");
    btn.textContent = "No pedido ✓";
    setTimeout(() => {
      btn.classList.remove("is-added");
      btn.textContent = original;
    }, 900);
    renderCart();
  });
});

cartEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  cart.splice(Number(btn.dataset.remove), 1);
  renderCart();
});

/* Order form */
(() => {
  const form = document.getElementById("order-form");
  const ok = document.getElementById("form-ok");

  const rules = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => v.replace(/\D/g, "").length >= 10,
    type: (v) => v !== "",
  };

  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    let m = d;
    if (d.length > 2) m = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) m = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    phone.value = m;
  });

  const validate = (field) => {
    if (!rules[field.name]) return true;
    const valid = rules[field.name](field.value);
    field.closest("label").classList.toggle("has-error", !valid);
    return valid;
  };

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => field.closest("label")?.classList.remove("has-error"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["name", "phone", "type"].map((n) => form.elements[n]);
    if (!fields.map(validate).every(Boolean)) return;

    if (!cart.length) {
      document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const [name, phoneField, type] = fields;
    const notes = form.elements.notes.value.trim();
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    const items = cart.map((i) => `• ${i.name} — R$ ${i.price}`).join("\n");

    const text = [
      `Olá! Quero pedir na Brasa Burger 🔥`,
      `*Nome:* ${name.value.trim()}`,
      `*WhatsApp:* ${phoneField.value}`,
      `*Tipo:* ${type.value}`,
      ``,
      `*Pedido:*`,
      items,
      ``,
      `*Total:* R$ ${total}`,
      notes ? `*Obs:* ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    ok.hidden = false;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setTimeout(() => (ok.hidden = true), 4000);
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();

/* Popup Anuncie conosco */
(() => {
  const modal = document.getElementById("ad-modal");
  const trigger = document.getElementById("ad-trigger");
  const form = document.getElementById("ad-form");
  const KEY = "brasa-ad-dismissed";

  const open = () => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const close = (persist) => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (persist) localStorage.setItem(KEY, "1");
  };

  trigger.addEventListener("click", open);

  modal.querySelectorAll("[data-close-ad]").forEach((el) => {
    el.addEventListener("click", () => close(true));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close(true);
  });

  // Abre sozinho 1x por visitante (depois de alguns segundos)
  if (!localStorage.getItem(KEY)) {
    setTimeout(open, 6500);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const brand = form.elements.brand.value.trim();
    const phone = form.elements.phone.value.trim();
    const pitch = form.elements.pitch.value.trim();

    if (brand.length < 2 || phone.replace(/\D/g, "").length < 10) return;

    const text = [
      `Olá! Quero *anunciar na Brasa Burger*.`,
      `*Empresa:* ${brand}`,
      `*WhatsApp:* ${phone}`,
      pitch ? `*Sobre o anúncio:* ${pitch}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    close(true);
    form.reset();
  });
})();
