/* Modèle 1 « Escale » : interactions */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- En-tête ---------- */
  var top = $(".top");
  var onScroll = function () { top.setAttribute("data-scrolled", String(window.scrollY > 8)); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $(".menu-btn"), menu = $("#menu");
  var setMenu = function (open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("data-open", String(open));
    menuBtn.textContent = open ? "Fermer" : "Menu";
  };
  menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  // Lien actif selon la section visible
  var links = $$(".menu a[href^='#']");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["diagnostic", "parcours", "services", "equipe", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Diagnostic ---------- */
  var TYPES = {
    port: "Port ou terminal (conteneurs, vrac, passagers)",
    petrole: "Terminal pétrolier, gazier ou raffinerie",
    offshore: "Base logistique ou installation offshore",
    navire: "Compagnie maritime ou armateur"
  };
  var QUESTIONS = [
    { id: "type", label: function () { return "Quelle est votre situation ?"; },
      opts: Object.keys(TYPES).map(function (k) { return { v: k, t: TYPES[k] }; }) },
    { id: "eval", label: function (n) { return n ? "Où en est l'évaluation de sûreté de vos navires ?" : "Où en est l'évaluation de sûreté de votre installation ?"; },
      opts: [{ v: 2, t: "Approuvée et revue récemment" }, { v: 1, t: "Réalisée, mais ancienne ou jamais revue" }, { v: 0, t: "Pas encore réalisée" }, { v: 0, t: "Je ne sais pas" }] },
    { id: "plan", label: function (n) { return n ? "Et le plan de sûreté des navires ?" : "Et le plan de sûreté de l'installation ?"; },
      opts: [{ v: 2, t: "Approuvé et appliqué au quotidien" }, { v: 1, t: "Rédigé, mais pas encore approuvé ou peu appliqué" }, { v: 0, t: "À rédiger" }] },
    { id: "agent", label: function (n) { return n ? "Vos agents de sûreté (CSO, SSO) sont-ils désignés et formés ?" : "Votre agent de sûreté (PFSO) est-il désigné et formé ?"; },
      opts: [{ v: 2, t: "Oui, désigné et formé" }, { v: 1, t: "Désigné, sans formation spécifique" }, { v: 0, t: "Pas encore désigné" }] },
    { id: "exo", label: function () { return "Organisez-vous des entraînements et des exercices de sûreté ?"; },
      help: "Le code recommande des entraînements au moins tous les trois mois et un exercice au moins une fois par année civile.",
      opts: [{ v: 2, t: "Oui, réguliers et documentés" }, { v: 1, t: "De temps en temps" }, { v: 0, t: "Jamais" }] },
    { id: "cyber", label: function () { return "Les systèmes informatiques font-ils partie de votre évaluation de sûreté ?"; },
      help: "Contrôle d'accès, vidéosurveillance, réseaux, accès à distance des prestataires.",
      opts: [{ v: 2, t: "Oui, de façon détaillée" }, { v: 1, t: "En partie" }, { v: 0, t: "Non" }] }
  ];

  var body = $("#diag-body"), count = $("#diag-count"), bar = $("#diag-progress");
  var answers = {}, idx = 0, lastResult = null;

  function isShip() { return answers.type && answers.type.v === "navire"; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderQuestion() {
    var q = QUESTIONS[idx];
    count.textContent = "Question " + (idx + 1) + " sur " + QUESTIONS.length;
    bar.style.width = (idx / QUESTIONS.length * 100) + "%";
    body.textContent = "";
    var wrap = el("div", "q q-enter");
    var label = el("p", "q__label", q.label(isShip()));
    label.id = "q-label";
    label.tabIndex = -1;
    wrap.appendChild(label);
    if (q.help) wrap.appendChild(el("p", "q__help", q.help));
    var opts = el("div", "opts");
    opts.setAttribute("role", "group");
    opts.setAttribute("aria-labelledby", "q-label");
    q.opts.forEach(function (o, i) {
      var b = el("button", "opt", o.t);
      b.type = "button";
      var picked = answers[q.id] && answers[q.id].i === i;
      b.setAttribute("aria-pressed", String(!!picked));
      b.addEventListener("click", function () {
        answers[q.id] = { v: o.v, t: o.t, i: i };
        $$(".opt", opts).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        setTimeout(function () { idx += 1; idx < QUESTIONS.length ? renderQuestion() : renderResult(); }, 220);
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    var nav = el("div", "q__nav");
    var back = el("button", "linkbtn", "Question précédente");
    back.type = "button";
    back.disabled = idx === 0;
    back.addEventListener("click", function () { idx -= 1; renderQuestion(); });
    nav.appendChild(back);
    wrap.appendChild(nav);
    body.appendChild(wrap);
    if (idx > 0) label.focus({ preventScroll: true });
  }

  function compute() {
    var ship = isShip();
    var s = function (k) { return answers[k] ? answers[k].v : 0; };
    var score = s("eval") + s("plan") + s("agent") + s("exo") + s("cyber");
    var pct = score * 10;
    var level = pct >= 80 ? { k: "good", b: "Bien engagé", t: "Les bases sont en place. L'enjeu est de les faire vivre." }
      : pct >= 40 ? { k: "mid", b: "À structurer", t: "Plusieurs éléments existent, il reste à les consolider." }
      : { k: "low", b: "À construire", t: "L'essentiel reste à mettre en place, dans le bon ordre." };
    var acts = [], mods = [];
    if (s("eval") < 2) acts.push({ t: ship ? "Réaliser ou mettre à jour l'évaluation de sûreté de vos navires" : "Réaliser ou mettre à jour l'évaluation de sûreté de l'installation", d: "Étape 2 du parcours", n: 2 });
    if (s("cyber") < 2) acts.push({ t: "Y intégrer les systèmes informatiques et de sûreté", d: "Contrôle d'accès, vidéosurveillance, réseaux, accès à distance", n: 2 });
    if (s("plan") < 2) acts.push({ t: s("plan") === 1 ? "Finaliser le plan de sûreté et préparer son approbation" : "Rédiger le plan de sûreté et ses procédures", d: "Étape 3 du parcours", n: 3 });
    if (s("agent") < 2) acts.push({ t: ship ? "Former vos agents de sûreté (CSO et SSO)" : "Former votre agent de sûreté (PFSO) et ses adjoints", d: "Étape 4 du parcours", n: 4 });
    if (s("exo") < 2) acts.push({ t: "Lancer un programme d'entraînements et d'exercices", d: "Étape 5 du parcours", n: 5 });
    if (!acts.length) acts.push({ t: "Tester le dispositif par un exercice conjoint ou un audit à blanc", d: "Étape 5 du parcours", n: 5 });
    acts.push({ t: "Planifier les revues du plan et les audits internes", d: "Étape 6 du parcours", n: 6 });
    if (s("agent") < 2) ship ? mods.push("Agent de sûreté de la compagnie (CSO)", "Agent de sûreté du navire (SSO)") : mods.push("Agent de sûreté de l'installation portuaire (PFSO)");
    if (s("exo") < 2) mods.push("Concevoir et conduire les exercices");
    if (s("cyber") < 2) mods.push("Cybersécurité des systèmes portuaires");
    mods.push("Sensibilisation de tout le personnel");
    return { pct: pct, level: level, acts: acts, mods: mods.slice(0, 4), type: answers.type ? answers.type.t : "" };
  }

  function renderResult() {
    var r = lastResult = compute();
    count.textContent = "Votre résultat";
    bar.style.width = "100%";
    body.textContent = "";
    var wrap = el("div", "res q-enter res--" + r.level.k);

    var head = el("div", "res__top");
    var C = 2 * Math.PI * 40;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "ring");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Niveau de préparation estimé : " + r.pct + " %");
    var bg = document.createElementNS(ns, "circle");
    bg.setAttribute("class", "ring__bg"); bg.setAttribute("cx", "50"); bg.setAttribute("cy", "50"); bg.setAttribute("r", "40");
    var fg = document.createElementNS(ns, "circle");
    fg.setAttribute("class", "ring__fg"); fg.setAttribute("cx", "50"); fg.setAttribute("cy", "50"); fg.setAttribute("r", "40");
    fg.setAttribute("stroke-dasharray", String(C)); fg.setAttribute("stroke-dashoffset", String(C));
    var tx = document.createElementNS(ns, "text");
    tx.setAttribute("x", "50"); tx.setAttribute("y", "50"); tx.setAttribute("text-anchor", "middle"); tx.setAttribute("dominant-baseline", "central");
    tx.textContent = r.pct + " %";
    svg.appendChild(bg); svg.appendChild(fg); svg.appendChild(tx);
    head.appendChild(svg);
    var ht = el("div");
    ht.appendChild(el("span", "res__badge", r.level.b));
    var title = el("p", "res__title", r.level.t);
    title.tabIndex = -1;
    ht.appendChild(title);
    head.appendChild(ht);
    wrap.appendChild(head);

    wrap.appendChild(el("h3", null, "Vos priorités"));
    var ol = el("ol", "todo-list");
    r.acts.forEach(function (a) {
      var li = el("li");
      var span = el("span", null, a.t);
      var sm = el("small");
      if (/^Étape/.test(a.d)) {
        var go = el("button", "linkbtn", a.d);
        go.type = "button";
        go.addEventListener("click", function () {
          select(document.getElementById("tab-" + a.n));
          document.getElementById("parcours").scrollIntoView({ behavior: "smooth" });
        });
        sm.appendChild(go);
      } else { sm.textContent = a.d; }
      span.appendChild(sm);
      li.appendChild(span);
      ol.appendChild(li);
    });
    wrap.appendChild(ol);

    wrap.appendChild(el("h3", null, "Formations conseillées"));
    var ul = el("ul", "mods");
    r.mods.forEach(function (m) { ul.appendChild(el("li", null, m)); });
    wrap.appendChild(ul);

    var act = el("div", "res__actions");
    var send = el("a", "btn btn--sm", "Recevoir ce plan détaillé");
    send.href = "#contact";
    send.addEventListener("click", function () { prefill(r); });
    var again = el("button", "linkbtn", "Refaire le diagnostic");
    again.type = "button";
    again.addEventListener("click", function () { answers = {}; idx = 0; renderQuestion(); $(".opt") && $(".opt").focus(); });
    act.appendChild(send); act.appendChild(again);
    wrap.appendChild(act);
    wrap.appendChild(el("p", "res__note", "Estimation indicative fondée sur vos réponses. Elle ne remplace ni un audit ni l'avis de l'autorité désignée."));

    body.appendChild(wrap);
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.setAttribute("stroke-dashoffset", String(C * (1 - r.pct / 100))); }); });
    title.focus({ preventScroll: true });
  }

  renderQuestion();

  /* ---------- Formulaire ---------- */
  var form = $("#form"), msg = form.elements.message, diagNote = $("#form-diag"), err = $("#form-err");
  function prefill(r) {
    var lines = ["Bonjour,", "", "J'ai réalisé le diagnostic ISPS sur votre site.", "Situation : " + r.type, "Niveau estimé : " + r.pct + " % (" + r.level.b.toLowerCase() + ")", "", "Priorités :"];
    r.acts.forEach(function (a, i) { lines.push((i + 1) + ". " + a.t); });
    lines.push("", "Je souhaite en parler avec vous.");
    msg.value = lines.join("\n");
    diagNote.hidden = false;
    diagNote.textContent = "Votre diagnostic (" + r.pct + " %, " + r.level.b.toLowerCase() + ") est repris dans le message. Vous pouvez le modifier.";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [];
    ["nom", "email", "message"].forEach(function (n) {
      var f = form.elements[n];
      var ko = !f.value.trim() || (f.type === "email" && !f.checkValidity());
      f.setAttribute("aria-invalid", String(ko));
      if (ko) bad.push(f);
    });
    if (bad.length) {
      err.hidden = false;
      err.textContent = "Renseignez votre nom, une adresse e-mail valide et votre message.";
      bad[0].focus();
      return;
    }
    err.hidden = true;
    var d = new FormData(form);
    var subject = "Demande de rendez-vous" + (d.get("organisation") ? " | " + d.get("organisation") : "");
    var text = [d.get("message"), "", "Nom : " + d.get("nom"), "Organisation : " + (d.get("organisation") || ""), "E-mail : " + d.get("email"), "Téléphone : " + (d.get("tel") || "")].join("\n");
    window.location.href = "mailto:" + form.getAttribute("data-mailto") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  });

  /* ---------- Parcours : onglets ---------- */
  var tabs = $$(".step");
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      p.hidden = !on;
      if (on) { p.classList.remove("panel-enter"); void p.offsetWidth; p.classList.add("panel-enter"); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      select(tabs[(j + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- Équipe : filtres et fiches ---------- */
  var chips = $$(".chip[data-f]"), people = $$(".person");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      people.forEach(function (p) {
        var match = f === "all" || p.getAttribute("data-tags").split(" ").indexOf(f) > -1;
        p.setAttribute("data-dim", String(!match));
      });
    });
  });

  var sheet = $("#sheet");
  $$(".person__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = document.getElementById(b.getAttribute("data-open"));
      $("#sheet-mono").textContent = $(".mono", b).textContent;
      $("#sheet-mono").className = $(".mono", b).className.replace("mono--lg", "mono--xl");
      $("#sheet-name").textContent = $(".person__name", b).textContent;
      $("#sheet-role").textContent = $(".person__role", b).textContent;
      var target = $("#sheet-body");
      target.textContent = "";
      Array.prototype.forEach.call(src.children, function (c) { target.appendChild(c.cloneNode(true)); });
      if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
    });
  });
  sheet.addEventListener("click", function (e) {
    if (e.target === sheet || e.target.hasAttribute("data-close")) sheet.close();
  });

  /* ---------- Année ---------- */
  $$("[data-year]").forEach(function (y) { y.textContent = String(new Date().getFullYear()); });
})();
