(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Preloader typing */
  const preloader = $("#preloader");
  const bootType = $("#boot-type");
  const bootWords = ["Hello", "Hola", "Hallo", "Bonjour", "Ciao", "Olá"];
  let bi = 0;
  const bootInterval = setInterval(() => {
    bi = (bi + 1) % bootWords.length;
    if (bootType) bootType.textContent = bootWords[bi];
  }, 320);

  const finishBoot = () => {
    clearInterval(bootInterval);
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishBoot, 1100));
  setTimeout(finishBoot, 2400);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

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
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      el.textContent = `${Math.round(target * (1 - Math.pow(1 - t, 3)))}${suffix}`;
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

  /* Cursor + magnetic + tilt */
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
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = "a, button, .chip, summary, input, select, textarea, .link-wa";
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
        card.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -9}deg) rotateY(${(px - 0.5) * 11}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Hero word rotate */
  const heroWord = $("#hero-word");
  const words = ["confiança.", "fluência.", "clareza.", "coragem."];
  let wi = 0;
  setInterval(() => {
    if (!heroWord) return;
    heroWord.style.opacity = "0";
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      heroWord.textContent = words[wi];
      heroWord.style.opacity = "1";
    }, 280);
  }, 2800);

  /* Live chat demo */
  const chats = {
    en: [
      { who: "teacher", label: "Teacher", text: "How was your weekend?" },
      { who: "student", label: "You", text: "It was great! I went hiking." },
      { who: "teacher", label: "Teacher", text: "Nice! Tell me more about it." },
    ],
    es: [
      { who: "teacher", label: "Profe", text: "¿Cómo estuvo tu finde?" },
      { who: "student", label: "Tú", text: "¡Genial! Fui a la playa." },
      { who: "teacher", label: "Profe", text: "¡Qué bien! Cuéntame más." },
    ],
    de: [
      { who: "teacher", label: "Lehrer", text: "Wie war dein Wochenende?" },
      { who: "student", label: "Du", text: "Super! Ich war wandern." },
      { who: "teacher", label: "Lehrer", text: "Toll! Erzähl mir mehr." },
    ],
  };

  const demoChat = $("#demo-chat");
  const consoleLevel = $("#console-level");
  let lang = "en";
  let chatTimer;

  const renderChat = (key) => {
    if (!demoChat) return;
    clearTimeout(chatTimer);
    demoChat.innerHTML = "";
    const lines = chats[key] || chats.en;
    let i = 0;
    const add = () => {
      if (i >= lines.length) return;
      const line = lines[i];
      const div = document.createElement("div");
      div.className = `bubble bubble--${line.who}`;
      div.innerHTML = `<small>${line.label}</small>${line.text}`;
      demoChat.appendChild(div);
      i += 1;
      chatTimer = setTimeout(add, 900);
    };
    add();
    if (consoleLevel) {
      const pct = 70 + Math.round(Math.random() * 18);
      consoleLevel.textContent = `Speaking · ${pct}%`;
    }
  };

  $$("#lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#lang-switch button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      lang = btn.dataset.lang || "en";
      renderChat(lang);
    });
  });
  renderChat("en");
  setInterval(() => renderChat(lang), 8000);

  /* Course filters */
  const chips = $$(".chip");
  const courses = $$(".course");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      courses.forEach((c) => {
        c.classList.toggle("is-hidden", !(f === "all" || c.dataset.cat === f));
      });
    });
  });

  /* WA */
  const openWa = (text) => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  $$(".link-wa").forEach((btn) => {
    btn.addEventListener("click", () => {
      openWa(`Olá! Quero ${btn.dataset.wa || "saber mais sobre os cursos da Echo"}.`);
    });
  });

  /* Quiz CEFR */
  const quiz = [
    {
      q: "Como você se sente ao falar com um estrangeiro?",
      opts: [
        { t: "Travo e uso gestos", s: 1 },
        { t: "Me viro em frases simples", s: 2 },
        { t: "Converso, com alguns erros", s: 3 },
        { t: "Falo com naturalidade", s: 4 },
      ],
    },
    {
      q: "Você entende filmes/séries sem legenda?",
      opts: [
        { t: "Quase nada", s: 1 },
        { t: "O básico, com esforço", s: 2 },
        { t: "A maior parte", s: 3 },
        { t: "Sim, com detalhes", s: 4 },
      ],
    },
    {
      q: "Escrever e-mails ou mensagens longas…",
      opts: [
        { t: "Preciso de tradutor o tempo todo", s: 1 },
        { t: "Consigo textos curtos", s: 2 },
        { t: "Escrevo bem, reviso depois", s: 3 },
        { t: "Escrevo com fluência", s: 4 },
      ],
    },
  ];

  let qi = 0;
  let score = 0;
  const quizStep = $("#quiz-step");
  const quizQ = $("#quiz-q");
  const quizOpts = $("#quiz-opts");
  const quizBar = $("#quiz-bar");
  const quizResult = $("#quiz-result");
  const quizLevel = $("#quiz-level");
  const quizDesc = $("#quiz-desc");

  const levelFromScore = (s) => {
    if (s <= 4) return { lvl: "A1", desc: "Base inicial — ótimo momento para começar com método." };
    if (s <= 7) return { lvl: "A2", desc: "Você se vira no básico. Próximo passo: conversação guiada." };
    if (s <= 10) return { lvl: "B1", desc: "Intermediário sólido — hora de ganhar fluência e precisão." };
    return { lvl: "B2+", desc: "Avançado — refine sotaque, vocabulário e situações complexas." };
  };

  const showQuiz = () => {
    if (qi >= quiz.length) {
      const res = levelFromScore(score);
      if (quizQ) quizQ.hidden = true;
      if (quizOpts) quizOpts.hidden = true;
      if (quizStep) quizStep.hidden = true;
      if (quizBar) quizBar.style.width = "100%";
      if (quizResult) quizResult.hidden = false;
      if (quizLevel) quizLevel.textContent = res.lvl;
      if (quizDesc) quizDesc.textContent = res.desc;
      return;
    }
    const item = quiz[qi];
    if (quizResult) quizResult.hidden = true;
    if (quizQ) {
      quizQ.hidden = false;
      quizQ.textContent = item.q;
    }
    if (quizOpts) quizOpts.hidden = false;
    if (quizStep) {
      quizStep.hidden = false;
      quizStep.textContent = `Pergunta ${qi + 1} de ${quiz.length}`;
    }
    if (quizBar) quizBar.style.width = `${((qi) / quiz.length) * 100}%`;
    if (quizOpts) {
      quizOpts.innerHTML = item.opts
        .map((o, idx) => `<button type="button" data-s="${o.s}">${o.t}</button>`)
        .join("");
      $$("button", quizOpts).forEach((btn) => {
        btn.addEventListener("click", () => {
          score += Number(btn.dataset.s) || 0;
          qi += 1;
          showQuiz();
        });
      });
    }
  };

  showQuiz();

  $("#quiz-restart")?.addEventListener("click", () => {
    qi = 0;
    score = 0;
    showQuiz();
  });

  $("#quiz-wa")?.addEventListener("click", () => {
    openWa(
      `Olá! Fiz o teste rápido da Echo e minha estimativa foi ${quizLevel?.textContent || "—"}. Quero agendar o teste completo.`
    );
  });

  /* Book experimental */
  const bookLang = $("#book-lang");
  const bookSlot = $("#book-slot");
  const bookGoal = $("#book-goal");
  const bookSummary = $("#book-summary");
  let bookMode = "Presencial";

  const updateBook = () => {
    if (bookSummary) {
      bookSummary.textContent = `${bookLang?.value || "Inglês"} · ${bookMode} · ${bookSlot?.value || "Tarde"}`;
    }
  };

  $$("#book-mode button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#book-mode button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      bookMode = btn.dataset.mode || "Presencial";
      updateBook();
    });
  });

  [bookLang, bookSlot, bookGoal].forEach((el) => {
    el?.addEventListener("change", updateBook);
  });
  updateBook();

  $("#book-wa")?.addEventListener("click", () => {
    openWa(
      [
        "Olá! Quero reservar aula experimental na Echo Idiomas.",
        `Idioma: ${bookLang?.value}`,
        `Modalidade: ${bookMode}`,
        `Horário: ${bookSlot?.value}`,
        `Objetivo: ${bookGoal?.value}`,
      ].join("\n")
    );
  });

  /* Contact */
  const form = $("#contact-form");
  const formOk = $("#form-ok");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const langInterest = String(fd.get("lang") || "").trim();
    const level = String(fd.get("level") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const fields = {
      name: form.querySelector('[name="name"]')?.closest("label"),
      phone: form.querySelector('[name="phone"]')?.closest("label"),
      lang: form.querySelector('[name="lang"]')?.closest("label"),
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
    if (!langInterest) {
      fields.lang?.classList.add("is-invalid");
      ok = false;
    }
    if (!ok) return;

    if (formOk) formOk.hidden = false;
    openWa(
      [
        "Olá! Quero começar na Echo Idiomas.",
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `Idioma: ${langInterest}`,
        `Nível: ${level}`,
        message ? `Mensagem: ${message}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  });

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
