"use strict";

const WHATSAPP = "5547992072891";

/* Preloader */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("is-done"), 500);
});

/* Custom cursor (desktop only) */
(() => {
  if (window.matchMedia("(pointer: fine)").matches === false) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursor-dot");
  document.body.classList.add("has-custom-cursor");

  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener(
    "mousemove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    },
    { passive: true }
  );

  const loop = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    cursor.style.left = `${cx}px`;
    cursor.style.top = `${cy}px`;
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll("a, button, summary, .ba__handle, input, select, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
})();

/* Scroll progress */
(() => {
  const bar = document.getElementById("progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* Header + to top */
(() => {
  const header = document.getElementById("header");
  const toTop = document.getElementById("to-top");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    toTop.classList.toggle("is-visible", window.scrollY > 700);
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
        entry.target.style.transitionDelay = `${(i % 4) * 70}ms`;
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
    const duration = 1700;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
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

/* Card tilt (desktop) */
(() => {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* Before / After */
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
  };

  const start = (x) => {
    dragging = true;
    setPosition(x);
  };
  const move = (x) => {
    if (dragging) setPosition(x);
  };
  const end = () => {
    dragging = false;
  };

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    start(e.clientX);
  });
  stage.addEventListener("mousedown", (e) => start(e.clientX));
  window.addEventListener("mousemove", (e) => move(e.clientX));
  window.addEventListener("mouseup", end);

  handle.addEventListener("touchstart", (e) => start(e.touches[0].clientX), { passive: true });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (dragging) move(e.touches[0].clientX);
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

/* Testimonials slider */
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
    dot.setAttribute("aria-label", `Depoimento ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  const dots = dotsWrap.children;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dots].forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + total) % total;
    render();
    restart();
  }

  function restart() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(index + 1), 5500);
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

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
  restart();
})();

/* FAQ: one open */
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

/* Booking form */
(() => {
  const form = document.getElementById("booking-form");
  const ok = document.getElementById("form-ok");

  const rules = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => v.replace(/\D/g, "").length >= 10,
    interest: (v) => v !== "",
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
    const fields = ["name", "phone", "interest"].map((n) => form.elements[n]);
    if (!fields.map(validate).every(Boolean)) return;

    const [name, phoneField, interest] = fields;
    const message = form.elements.message.value.trim();

    const text = [
      `Olá! Gostaria de agendar uma avaliação na Áurea Odontologia.`,
      `*Nome:* ${name.value.trim()}`,
      `*WhatsApp:* ${phoneField.value}`,
      `*Interesse:* ${interest.value}`,
      message ? `*Mensagem:* ${message}` : null,
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
