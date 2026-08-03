"use strict";

const WHATSAPP = "5547992072891";

/* Preloader */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader").classList.add("is-done");
  }, 450);
});

/* Header + back to top */
(() => {
  const header = document.getElementById("header");
  const toTop = document.getElementById("to-top");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    toTop.classList.toggle("is-visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
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

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", close);
  });

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
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
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
        entry.target.style.transitionDelay = `${(i % 3) * 70}ms`;
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
    const duration = 1600;

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

/* Booking form → WhatsApp */
(() => {
  const form = document.getElementById("booking-form");
  const ok = document.getElementById("form-ok");

  const rules = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => v.replace(/\D/g, "").length >= 10,
    service: (v) => v !== "",
    when: (v) => v.trim().length >= 3,
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
    const valid = rules[field.name](field.value);
    field.closest("label").classList.toggle("has-error", !valid);
    return valid;
  };

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => {
      field.closest("label").classList.remove("has-error");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["name", "phone", "service", "when"].map((n) => form.elements[n]);
    if (!fields.map(validate).every(Boolean)) return;

    const [name, phoneField, service, when] = fields;
    const text = [
      `Olá! Quero agendar na Ónix Barbearia.`,
      `*Nome:* ${name.value.trim()}`,
      `*WhatsApp:* ${phoneField.value}`,
      `*Serviço:* ${service.value}`,
      `*Quando:* ${when.value.trim()}`,
    ].join("\n");

    ok.hidden = false;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    form.reset();
    setTimeout(() => (ok.hidden = true), 4000);
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
