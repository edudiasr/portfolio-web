"use strict";

const WHATSAPP = "5547992072891";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Year */
(() => {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
})();

/* Preloader — lens focus */
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  if (!pre) return;
  const delay = reduceMotion ? 100 : 700;
  setTimeout(() => pre.classList.add("is-done"), delay);
});

/* Custom cursor */
(() => {
  if (!window.matchMedia("(pointer: fine)").matches || reduceMotion) return;

  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursor-dot");
  if (!cursor || !dot) return;

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

  const hoverSel = "a, button, summary, input, select, textarea, label.tryon__option, label.tryon__swatch, .filter";
  document.querySelectorAll(hoverSel).forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
})();

/* Scroll progress */
(() => {
  const bar = document.getElementById("progress");
  if (!bar) return;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", String(Math.round(pct)));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* Header + to-top */
(() => {
  const header = document.getElementById("header");
  const toTop = document.getElementById("to-top");
  if (!header || !toTop) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    toTop.classList.toggle("is-visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
})();

/* Mobile nav */
(() => {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

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

  nav.querySelectorAll(".nav__link").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* Scrollspy */
(() => {
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const onScroll = () => {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec;
    });
    links.forEach((l) => {
      l.classList.toggle("active", l.getAttribute("href") === `#${current.id}`);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* Scroll reveal */
(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => io.observe(el));
})();

/* Counters */
(() => {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;

  const animate = (el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(animate);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  nums.forEach((el) => io.observe(el));
})();

/* Tilt 3D */
(() => {
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = 8;

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* Magnetic buttons */
(() => {
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".magnetic").forEach((btn) => {
    const strength = 18;

    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* Interactive hero lens */
(() => {
  const glass = document.querySelector(".hero__lens-glass");
  const hero = document.querySelector(".hero");
  if (!glass || !hero || reduceMotion) return;

  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;

  const apply = () => {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glass.style.setProperty("--lx", `${cx}px`);
    glass.style.setProperty("--ly", `${cy}px`);
    const dist = Math.min(1, Math.hypot(cx, cy) / 120);
    glass.style.setProperty("--ls", String(1 + dist * 0.04));
    raf = requestAnimationFrame(apply);
  };

  hero.addEventListener(
    "mousemove",
    (e) => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 36;
      my = ((e.clientY - r.top) / r.height - 0.5) * 28;
    },
    { passive: true }
  );

  hero.addEventListener(
    "mouseleave",
    () => {
      mx = 0;
      my = 0;
    },
    { passive: true }
  );

  raf = requestAnimationFrame(apply);
})();

/* Services filter */
(() => {
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".service");
  if (!filters.length) return;

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-filter");

      filters.forEach((f) => {
        f.classList.toggle("is-active", f === btn);
        f.setAttribute("aria-selected", String(f === btn));
      });

      cards.forEach((card) => {
        const match = cat === "all" || card.getAttribute("data-cat") === cat;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });
})();

/* Virtual try-on / frame picker */
(() => {
  const preview = document.getElementById("frame-preview");
  const label = document.getElementById("frame-label");
  const hint = document.getElementById("frame-hint");
  const wa = document.getElementById("frame-wa");
  const frames = document.getElementById("tryon-frames");
  if (!preview || !wa || !frames) return;

  const styles = {
    redondo: {
      label: "Estilo: Redondo",
      hint: "Armação redonda — equilíbrio clássico e leve.",
    },
    quadrado: {
      label: "Estilo: Quadrado",
      hint: "Armação quadrada — presença moderna e geometria limpa.",
    },
    aviador: {
      label: "Estilo: Aviador",
      hint: "Aviador — silhueta icônica com ponte marcada.",
    },
  };

  const colors = {
    prata: { css: "#c8d0dc", name: "prata" },
    preto: { css: "#1a1f2a", name: "preto" },
    champagne: { css: "#d4b896", name: "champagne" },
    cyan: { css: "#7dd3fc", name: "cyan ice" },
  };

  const sync = () => {
    const style = document.querySelector('input[name="frame-style"]:checked')?.value || "redondo";
    const colorKey = document.querySelector('input[name="frame-color"]:checked')?.value || "prata";
    const color = colors[colorKey] || colors.prata;
    const meta = styles[style] || styles.redondo;

    preview.setAttribute("data-style", style);
    frames.style.setProperty("--frame", color.css);
    if (label) label.textContent = meta.label;
    if (hint) {
      const base = meta.hint.split("—")[0].trim();
      const rest = meta.hint.split("—")[1]?.trim() || "";
      hint.textContent = `${base} em ${color.name} — ${rest}`;
    }

    const msg = `Olá! Tenho interesse em armação estilo ${style} (${color.name}) na Iris Ótica.`;
    wa.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  };

  document.querySelectorAll('input[name="frame-style"], input[name="frame-color"]').forEach((input) => {
    input.addEventListener("change", sync);
  });

  sync();
})();

/* Exam booking form → WhatsApp */
(() => {
  const form = document.getElementById("exam-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = ["nome", "telefone", "data", "periodo", "motivo"];
    let valid = true;

    fields.forEach((id) => {
      const el = form.querySelector(`#${id}`);
      if (!el) return;
      const ok = el.value.trim().length > 0;
      el.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) return;

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const data = form.data.value;
    const periodo = form.periodo.value;
    const motivo = form.motivo.value;
    const obs = form.obs.value.trim() || "—";

    const dataFmt = data
      ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR")
      : data;

    const msg = [
      "Olá! Quero agendar exame de vista na Iris Ótica.",
      "",
      `Nome: ${nome}`,
      `WhatsApp: ${telefone}`,
      `Data preferida: ${dataFmt}`,
      `Período: ${periodo}`,
      `Motivo: ${motivo}`,
      `Observações: ${obs}`,
    ].join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
    el.addEventListener("change", () => el.classList.remove("is-invalid"));
  });
})();
