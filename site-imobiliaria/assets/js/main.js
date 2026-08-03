"use strict";

const WHATSAPP = "5547992072891";

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("is-done"), 400);
});

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

(() => {
  const counters = document.querySelectorAll("[data-count]");
  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("pt-BR") + suffix;
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

/* Filters + sort + favorites */
(() => {
  const form = document.getElementById("hero-search");
  const list = document.getElementById("listings");
  const countEl = document.getElementById("results-count");
  const empty = document.getElementById("empty-state");
  const sortEl = document.getElementById("sort-listings");
  const favOnlyBtn = document.getElementById("fav-only");
  const favCount = document.getElementById("fav-count");
  const KEY = "vertice-favs";

  let favs = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  let onlyFavs = false;

  const cards = () => [...list.querySelectorAll(".listing")];

  const saveFavs = () => {
    localStorage.setItem(KEY, JSON.stringify([...favs]));
    favCount.textContent = String(favs.size);
    document.querySelectorAll(".listing__fav").forEach((btn) => {
      btn.classList.toggle("is-on", favs.has(btn.dataset.fav));
    });
  };

  const apply = () => {
    const tipo = document.getElementById("filter-tipo").value;
    const negocio = document.getElementById("filter-negocio").value;
    const faixa = document.getElementById("filter-faixa").value;
    const sort = sortEl.value;

    let items = cards();

    items.sort((a, b) => {
      const pa = Number(a.dataset.preco);
      const pb = Number(b.dataset.preco);
      if (sort === "price-asc") return pa - pb;
      if (sort === "price-desc") return pb - pa;
      return Number(a.dataset.featured) - Number(b.dataset.featured);
    });

    items.forEach((card) => list.appendChild(card));

    let visible = 0;
    cards().forEach((card) => {
      const okTipo = tipo === "all" || card.dataset.tipo === tipo;
      const okNegocio = negocio === "all" || card.dataset.negocio === negocio;
      const okFaixa = faixa === "all" || card.dataset.faixa === faixa;
      const okFav = !onlyFavs || favs.has(card.dataset.id);
      const show = okTipo && okNegocio && okFaixa && okFav;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    countEl.textContent =
      visible === 0
        ? "Nenhum resultado"
        : onlyFavs
          ? `${visible} favorito${visible === 1 ? "" : "s"}`
          : visible === cards().length
            ? `Mostrando todos os ${visible} imóveis`
            : `Mostrando ${visible} imóvel${visible === 1 ? "" : "eis"}`;
    empty.hidden = visible !== 0;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
    document.getElementById("imoveis").scrollIntoView({ behavior: "smooth" });
  });

  ["filter-tipo", "filter-negocio", "filter-faixa"].forEach((id) => {
    document.getElementById(id).addEventListener("change", apply);
  });
  sortEl.addEventListener("change", apply);

  favOnlyBtn.addEventListener("click", () => {
    onlyFavs = !onlyFavs;
    favOnlyBtn.classList.toggle("is-active", onlyFavs);
    favOnlyBtn.textContent = onlyFavs
      ? `♥ Favoritos (${favs.size})`
      : `♥ Favoritos (${favs.size})`;
    apply();
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".listing__fav");
    if (!btn) return;
    const id = btn.dataset.fav;
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    saveFavs();
    favOnlyBtn.innerHTML = `♥ Favoritos (<span id="fav-count">${favs.size}</span>)`;
    if (onlyFavs) apply();
  });

  saveFavs();
  apply();
})();

/* Visit buttons */
document.querySelectorAll(".btn-visit").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = [
      `Olá! Tenho interesse neste imóvel da Vértice:`,
      `*${btn.dataset.title}*`,
      `Valor: ${btn.dataset.price}`,
      `Gostaria de agendar uma visita.`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
});

/* Contact form */
(() => {
  const form = document.getElementById("contact-form");
  const ok = document.getElementById("form-ok");
  const rules = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => v.replace(/\D/g, "").length >= 10,
    goal: (v) => v !== "",
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
    const fields = ["name", "phone", "goal"].map((n) => form.elements[n]);
    if (!fields.map(validate).every(Boolean)) return;

    const [name, phoneField, goal] = fields;
    const message = form.elements.message.value.trim();
    const text = [
      `Olá! Quero atendimento da Vértice Imóveis.`,
      `*Nome:* ${name.value.trim()}`,
      `*WhatsApp:* ${phoneField.value}`,
      `*Objetivo:* ${goal.value}`,
      message ? `*Detalhes:* ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    ok.hidden = false;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    form.reset();
    setTimeout(() => (ok.hidden = true), 4000);
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
