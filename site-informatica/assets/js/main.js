/* ==========================================================================
   CtrlTec — Interações da página
   Módulos: preloader, tema, header, menu mobile, scrollspy, reveal,
   contadores, slider de depoimentos, before/after, FAQ, formulário → WhatsApp
   ========================================================================== */

"use strict";

/** Número exibido no site — trocar pelo WhatsApp real da loja */
const WHATSAPP_NUMBER = "5547992072891";

/* ---------- Preloader ---------- */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  setTimeout(() => preloader.classList.add("is-done"), 400);
});

/* ---------- Tema claro/escuro ---------- */
(() => {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const saved = localStorage.getItem("ctrltec-theme");

  if (saved) root.dataset.theme = saved;

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("ctrltec-theme", next);
  });
})();

/* ---------- Header com fundo ao rolar + botão voltar ao topo ---------- */
(() => {
  const header = document.getElementById("header");
  const backToTop = document.getElementById("back-to-top");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ---------- Menu mobile ---------- */
(() => {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");

  const close = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* ---------- Scrollspy (link ativo conforme a seção visível) ---------- */
(() => {
  const links = document.querySelectorAll(".nav__link");
  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => spy.observe(section));
})();

/* ---------- Scroll reveal ---------- */
(() => {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Pequeno atraso em cascata para elementos que aparecem juntos
        entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
})();

/* ---------- Contadores animados ---------- */
(() => {
  const counters = document.querySelectorAll("[data-count]");
  const DURATION = 1800;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "+";
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      // easeOutCubic para desacelerar no final
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("pt-BR") + suffix;
      if (progress < 1) requestAnimationFrame(tick);
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
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
})();

/* ---------- Slider de depoimentos ---------- */
(() => {
  const track = document.getElementById("slider-track");
  const prev = document.getElementById("slider-prev");
  const next = document.getElementById("slider-next");
  const dotsWrap = document.getElementById("slider-dots");
  const total = track.children.length;
  let index = 0;
  let autoplay;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.className = "slider__dot";
    dot.setAttribute("aria-label", `Ver depoimento ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  const dots = dotsWrap.children;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dots].forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + total) % total;
    render();
    restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(index + 1), 6000);
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

  // Suporte a arrastar/deslizar no touch
  let startX = 0;
  track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener(
    "touchend",
    (e) => {
      const delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 50) goTo(delta < 0 ? index + 1 : index - 1);
    },
    { passive: true }
  );

  render();
  restartAutoplay();
})();

/* ---------- FAQ: apenas um item aberto por vez ---------- */
(() => {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();

/* ---------- Formulário → mensagem no WhatsApp ---------- */
(() => {
  const form = document.getElementById("contact-form");
  const success = document.getElementById("form-success");

  const validators = {
    name: (value) => value.trim().length >= 2,
    phone: (value) => value.replace(/\D/g, "").length >= 10,
    service: (value) => value !== "",
    message: (value) => value.trim().length >= 10,
  };

  // Máscara simples de telefone brasileiro
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    const digits = phone.value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;
    if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    phone.value = masked;
  });

  const validateField = (field) => {
    const valid = validators[field.name](field.value);
    field.closest(".form__group").classList.toggle("has-error", !valid);
    return valid;
  };

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      field.closest(".form__group").classList.remove("has-error");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = ["name", "phone", "service", "message"].map(
      (name) => form.elements[name]
    );
    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) return;

    const [name, phoneField, service, message] = fields;
    const text = [
      `Olá! Meu nome é ${name.value.trim()}.`,
      `*Serviço:* ${service.value}`,
      `*Telefone:* ${phoneField.value}`,
      `*Problema:* ${message.value.trim()}`,
    ].join("\n");

    success.hidden = false;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );

    form.reset();
    setTimeout(() => (success.hidden = true), 5000);
  });
})();

/* ---------- Antes / Depois (slider de comparação) ---------- */
(() => {
  const stage = document.querySelector(".ba__stage");
  const before = document.getElementById("ba-before");
  const handle = document.getElementById("ba-handle");
  if (!stage || !before || !handle) return;

  let dragging = false;

  const setPosition = (clientX) => {
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0.08), 0.92);
    const percent = ratio * 100;

    before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
    handle.setAttribute("aria-valuenow", String(Math.round(percent)));
    handle.setAttribute(
      "aria-valuetext",
      `${Math.round(percent)}% antes, ${Math.round(100 - percent)}% depois`
    );
  };

  const start = (clientX) => {
    dragging = true;
    stage.classList.add("is-dragging");
    setPosition(clientX);
  };

  const move = (clientX) => {
    if (!dragging) return;
    setPosition(clientX);
  };

  const end = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
  };

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    start(e.clientX);
  });
  stage.addEventListener("mousedown", (e) => {
    if (e.target.closest(".ba__handle") || e.target === stage || e.target.closest(".ba__panel")) {
      start(e.clientX);
    }
  });
  window.addEventListener("mousemove", (e) => move(e.clientX));
  window.addEventListener("mouseup", end);

  handle.addEventListener(
    "touchstart",
    (e) => start(e.touches[0].clientX),
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;
      move(e.touches[0].clientX);
    },
    { passive: true }
  );
  window.addEventListener("touchend", end);

  handle.addEventListener("keydown", (e) => {
    const current = Number(handle.getAttribute("aria-valuenow")) || 50;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition(stage.getBoundingClientRect().left + ((current - 3) / 100) * stage.offsetWidth);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition(stage.getBoundingClientRect().left + ((current + 3) / 100) * stage.offsetWidth);
    }
  });
})();

/* ---------- Ano dinâmico no rodapé ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
