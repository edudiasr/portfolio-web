(() => {
  const C = window.CARTA_CONTENT;
  if (!C) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Populate content from content.js ── */
  const setText = (slot, text, html = false) => {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (!el || text == null) return;
    if (html) el.innerHTML = text;
    else el.textContent = text;
  };

  document.title = C.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", C.meta.description);

  setText("header-from", C.header.from);
  setText("header-to", C.header.to);
  setText("opening-greeting", C.opening.greeting);

  const openingBody = document.querySelector('[data-slot="opening-body"]');
  if (openingBody) {
    openingBody.innerHTML = C.opening.paragraphs.map((p) => `<p>${p}</p>`).join("");
  }

  setText("transition-quote", C.transition.quote);
  setText("children-intro", C.children.intro);
  setText("children-title", C.children.title);
  setText("son-emoji", C.children.son.emoji);
  setText("son-label", C.children.son.label);
  setText("son-btn", C.children.son.revealBtn);
  setText("daughter-emoji", C.children.daughter.emoji);
  setText("daughter-label", C.children.daughter.label);
  setText("daughter-btn", C.children.daughter.revealBtn);
  setText("children-after", C.children.afterReveal);

  const futureBody = document.querySelector('[data-slot="future-body"]');
  if (futureBody) {
    futureBody.innerHTML = C.future.paragraphs.map((p) => `<p>${p}</p>`).join("");
  }

  setText("closing-intro", C.closing.intro);
  setText("closing-highlight", C.closing.highlight);
  setText("closing-signature", C.closing.signature);
  setText("closing-name", C.closing.name);

  /* ── Images (exact filenames from content.js) ── */
  const bg = document.getElementById("bgImage");
  if (bg) bg.style.backgroundImage = `url("${C.images.background}")`;

  document.querySelectorAll("[data-img]").forEach((img) => {
    const key = img.getAttribute("data-img");
    if (C.images[key]) img.src = C.images[key];
  });

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll(".reveal, .reveal-card");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ── Parallax background ── */
  if (!reduce) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY * 0.18;
        if (bg) bg.style.transform = `scale(1.05) translateY(${y}px)`;
      },
      { passive: true }
    );
  }

  /* ── Reveal children cards ── */
  const revealed = { son: false, daughter: false };
  const afterEl = document.querySelector('[data-slot="children-after"]');

  const burstAt = (x, y) => {
    if (reduce) return;
    const hearts = ["♥", "♡", "❤"];
    for (let i = 0; i < 8; i += 1) {
      const h = document.createElement("span");
      h.className = "heart-burst";
      h.textContent = hearts[i % hearts.length];
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 28 + Math.random() * 36;
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      h.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      document.body.appendChild(h);
      window.setTimeout(() => h.remove(), 900);
    }
  };

  document.querySelectorAll("[data-reveal-btn]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const key = btn.getAttribute("data-reveal-btn");
      const card = document.querySelector(`[data-reveal="${key}"]`);
      if (!card || card.classList.contains("is-revealed")) return;

      card.classList.add("is-revealed");
      revealed[key] = true;

      const rect = btn.getBoundingClientRect();
      burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

      if (revealed.son && revealed.daughter && afterEl) {
        afterEl.hidden = false;
        afterEl.classList.add("reveal", "is-visible");
      }
    });
  });

  /* ── Hover hearts on interactive elements ── */
  if (!reduce) {
    const hoverTargets = document.querySelectorAll(
      ".photo-frame, .btn-reveal, .transition-quote, .closing__highlight, .letter-frame"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        const r = el.getBoundingClientRect();
        spawnHeart(r.left + Math.random() * r.width, r.top + Math.random() * r.height * 0.4);
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("button, a, .photo-frame, .reveal-card")) {
        burstAt(e.clientX, e.clientY);
      }
    });
  }

  /* ── Floating hearts background ── */
  const floatRoot = document.getElementById("floatHearts");
  const spawnHeart = (x, y) => {
    if (!floatRoot || reduce) return;
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = Math.random() > 0.5 ? "♥" : "♡";
    h.style.left = x != null ? `${x}px` : `${Math.random() * 100}%`;
    h.style.bottom = y != null ? "auto" : "-1rem";
    if (y != null) {
      h.style.top = `${y}px`;
      h.style.bottom = "auto";
    }
    h.style.animationDuration = `${5 + Math.random() * 4}s`;
    h.style.fontSize = `${0.55 + Math.random() * 0.5}rem`;
    floatRoot.appendChild(h);
    window.setTimeout(() => h.remove(), 9000);
  };

  if (!reduce && floatRoot) {
    window.setInterval(() => spawnHeart(), 2200);
  }

  /* ── Canvas ambient hearts (closing section) ── */
  const canvas = document.getElementById("heartsCanvas");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    const particles = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 18; i += 1) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 4 + Math.random() * 8,
        speed: 0.15 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: 0.08 + Math.random() * 0.12,
      });
    }

    const drawHeart = (x, y, size, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#c9a86c";
      ctx.beginPath();
      const s = size / 12;
      ctx.moveTo(x, y + s * 2);
      ctx.bezierCurveTo(x, y, x - s * 5, y, x - s * 5, y + s * 2.5);
      ctx.bezierCurveTo(x - s * 5, y + s * 5.5, x, y + s * 7.5, x, y + s * 10);
      ctx.bezierCurveTo(x, y + s * 7.5, x + s * 5, y + s * 5.5, x + s * 5, y + s * 2.5);
      ctx.bezierCurveTo(x + s * 5, y, x, y, x, y + s * 2);
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const nearEnd = docH > 0 ? scroll / docH : 0;
      const boost = nearEnd > 0.72 ? 1 + (nearEnd - 0.72) * 2 : 1;

      particles.forEach((p) => {
        p.y -= p.speed * boost;
        p.x += p.drift;
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
        drawHeart(p.x, p.y, p.size, p.alpha * boost);
      });

      requestAnimationFrame(tick);
    };

    tick();
  }
})();
