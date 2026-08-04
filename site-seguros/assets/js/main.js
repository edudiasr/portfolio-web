(() => {
  const WA = "5547992072891";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) =>
    n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

  /* Preloader */
  const preloader = $("#preloader");
  const finishPreload = () => {
    preloader?.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  window.addEventListener("load", () => setTimeout(finishPreload, 950));
  setTimeout(finishPreload, 2400);

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header / nav / progress */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const navLinks = $$(".nav__link");

  const onScrollChrome = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 20);
    $("#to-top")?.classList.toggle("is-visible", y > 500);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    const progress = $("#progress");
    if (progress) progress.style.width = `${pct}%`;
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

  $("#to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  /* Cursor */
  const cursor = $("#cursor");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (cursor && finePointer && !reduceMotion) {
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
    const loopCursor = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loopCursor);
    };
    loopCursor();

    const hoverables =
      "a, button, .chip, .quiz-opt, summary, input, select, textarea, .link-wa";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("is-hover");
    });
  }

  /* Magnetic */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* Tilt */
  if (finePointer && !reduceMotion) {
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

  /* Product filters */
  const chips = $$(".chip");
  const cards = $$(".product-card");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.dataset.filter || "all";
      cards.forEach((card) => {
        const cats = (card.dataset.cat || "").split(/\s+/);
        const show = filter === "all" || cats.includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* Quote simulator */
  const tipoEl = $("#q-tipo");
  const idadeEl = $("#q-idade");
  const valorEl = $("#q-valor");
  const idadeVal = $("#q-idade-val");
  const valorVal = $("#q-valor-val");
  const resultBox = $("#quote-result");
  const rangeEl = $("#quote-range");
  const noteEl = $("#quote-note");
  const quoteWa = $("#quote-wa");

  const syncRanges = () => {
    if (idadeVal && idadeEl) idadeVal.textContent = idadeEl.value;
    if (valorVal && valorEl) valorVal.textContent = money(Number(valorEl.value));
  };
  idadeEl?.addEventListener("input", syncRanges);
  valorEl?.addEventListener("input", syncRanges);
  syncRanges();

  const baseRates = {
    auto: { min: 0.0018, max: 0.0034, label: "auto" },
    vida: { min: 0.0009, max: 0.0022, label: "vida" },
    residencial: { min: 0.00055, max: 0.0014, label: "residencial" },
    empresarial: { min: 0.0007, max: 0.0019, label: "empresarial" },
    saude: { min: 0.0028, max: 0.0055, label: "saúde" },
  };

  const calcQuote = () => {
    const tipo = tipoEl?.value || "auto";
    const idade = Number(idadeEl?.value || 35);
    const valor = Number(valorEl?.value || 120000);
    const rate = baseRates[tipo] || baseRates.auto;

    let ageFactor = 1;
    if (idade < 25) ageFactor = 1.35;
    else if (idade < 35) ageFactor = 1.12;
    else if (idade > 55) ageFactor = 1.22;
    else if (idade > 45) ageFactor = 1.08;

    const low = Math.round((valor * rate.min * ageFactor) / 12);
    const high = Math.round((valor * rate.max * ageFactor) / 12);
    const clampedLow = Math.max(tipo === "saude" ? 180 : 45, low);
    const clampedHigh = Math.max(clampedLow + 40, high);

    if (rangeEl) {
      rangeEl.textContent = `R$ ${money(clampedLow)} – R$ ${money(clampedHigh)}`;
    }
    if (noteEl) {
      noteEl.textContent = `Estimativa para ${rate.label} · ${idade} anos · base R$ ${money(valor)}. Não é proposta oficial.`;
    }

    const msg = encodeURIComponent(
      `Olá! Quero cotação Aegis Corretora.\nTipo: ${rate.label}\nIdade: ${idade}\nValor/capital: R$ ${money(valor)}\nFaixa estimada no site: R$ ${money(clampedLow)} – R$ ${money(clampedHigh)}/mês`
    );
    if (quoteWa) quoteWa.href = `https://wa.me/${WA}?text=${msg}`;
    resultBox?.removeAttribute("hidden");
  };

  $("#quote-calc")?.addEventListener("click", calcQuote);

  /* Needs quiz — 3 questions */
  const questions = [
    {
      q: "O que você mais precisa proteger agora?",
      opts: [
        { label: "Carro / moto", tags: ["Seguro Auto com assistência 24h", "Cobertura de terceiros"] },
        { label: "Família / renda", tags: ["Seguro de Vida com capital definido", "Assistência funeral opcional"] },
        { label: "Casa ou apartamento", tags: ["Residencial (estrutura + conteúdo)", "Danos elétricos e RC"] },
        { label: "Empresa / consultório", tags: ["Empresarial / RC profissional", "Equipamentos e lucros cessantes"] },
      ],
    },
    {
      q: "Você já tem alguma apólice ativa?",
      opts: [
        { label: "Sim — quero revisar", tags: ["Revisão de franquia e exclusões", "Comparativo entre seguradoras"] },
        { label: "Sim — mas está cara", tags: ["Busca de multi-produto com desconto", "Ajuste de perfil / CEP"] },
        { label: "Não tenho ainda", tags: ["Diagnóstico do zero", "Cotação em 2–3 opções"] },
        { label: "Só plano de saúde", tags: ["Saúde / odonto complementar", "Pacote com vida ou auto"] },
      ],
    },
    {
      q: "Qual o prazo ideal para fechar?",
      opts: [
        { label: "Urgente (esta semana)", tags: ["Prioridade de cotação em 24h", "Documentação via WhatsApp"] },
        { label: "Neste mês", tags: ["Proposta em etapas", "Lembrete de renovação"] },
        { label: "Só pesquisando", tags: ["Checklist educativo", "Simulação sem compromisso"] },
        { label: "Renovação próxima", tags: ["Alerta 45 dias antes", "Comparativo pré-renovação"] },
      ],
    },
  ];

  let quizIndex = 0;
  const answers = [];
  const quizQ = $("#quiz-q");
  const quizOpts = $("#quiz-opts");
  const quizStep = $("#quiz-step");
  const quizBar = $("#quiz-bar");
  const quizPrev = $("#quiz-prev");
  const quizNext = $("#quiz-next");
  const quizDone = $("#quiz-done");
  const quizList = $("#quiz-list");
  const quizWa = $("#quiz-wa");

  const renderQuiz = () => {
    const item = questions[quizIndex];
    if (!item || !quizQ || !quizOpts) return;

    quizQ.hidden = false;
    quizOpts.hidden = false;
    quizNext.hidden = false;
    quizPrev.hidden = false;
    quizDone?.setAttribute("hidden", "");

    quizStep.textContent = `Pergunta ${quizIndex + 1} de ${questions.length}`;
    quizBar.style.width = `${((quizIndex + 1) / questions.length) * 100}%`;
    quizQ.textContent = item.q;
    quizOpts.innerHTML = "";

    item.opts.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-opt" + (answers[quizIndex] === i ? " is-selected" : "");
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        answers[quizIndex] = i;
        $$(".quiz-opt", quizOpts).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });
      quizOpts.appendChild(btn);
    });

    quizPrev.disabled = quizIndex === 0;
    quizNext.textContent = quizIndex === questions.length - 1 ? "Ver checklist" : "Próxima";
  };

  const finishQuiz = () => {
    const tags = new Set();
    answers.forEach((ans, qi) => {
      const opt = questions[qi]?.opts[ans];
      opt?.tags.forEach((t) => tags.add(t));
    });

    const list = [...tags];
    if (quizList) {
      quizList.innerHTML = list.map((t) => `<li>${t}</li>`).join("");
    }

    const summary = questions
      .map((q, i) => `${i + 1}. ${q.q} → ${q.opts[answers[i]]?.label || "—"}`)
      .join("\n");
    const checklist = list.map((t) => `• ${t}`).join("\n");
    const msg = encodeURIComponent(
      `Olá! Fiz o diagnóstico no site da Aegis Corretora.\n\n${summary}\n\nChecklist sugerido:\n${checklist}`
    );
    if (quizWa) quizWa.href = `https://wa.me/${WA}?text=${msg}`;

    quizQ.hidden = true;
    quizOpts.hidden = true;
    quizNext.hidden = true;
    quizPrev.hidden = true;
    quizStep.textContent = "Concluído";
    quizBar.style.width = "100%";
    quizDone?.removeAttribute("hidden");
  };

  quizNext?.addEventListener("click", () => {
    if (answers[quizIndex] === undefined) {
      quizOpts?.classList.add("is-shake");
      setTimeout(() => quizOpts?.classList.remove("is-shake"), 400);
      return;
    }
    if (quizIndex < questions.length - 1) {
      quizIndex += 1;
      renderQuiz();
    } else {
      finishQuiz();
    }
  });

  quizPrev?.addEventListener("click", () => {
    if (quizIndex > 0) {
      quizIndex -= 1;
      renderQuiz();
    }
  });

  renderQuiz();

  /* Contact form → WhatsApp */
  $("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#c-nome")?.value.trim() || "";
    const produto = $("#c-produto")?.value || "";
    const mensagem = $("#c-msg")?.value.trim() || "";
    if (!nome || !mensagem) return;

    const text = encodeURIComponent(
      `Olá! Sou ${nome}.\nInteresse: ${produto}\n\n${mensagem}`
    );
    window.open(`https://wa.me/${WA}?text=${text}`, "_blank", "noopener");
  });
})();
