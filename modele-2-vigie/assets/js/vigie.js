/* Modèle 2 « Vigie » : interactions communes et propres à chaque page */
(function () {
  "use strict";
  var D = window.VIGIE;
  if (!D) return;
  var page = document.body.getAttribute("data-page");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm) document.documentElement.classList.add("js-motion");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(window.location.search);

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "cls") e.className = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ---------- Mémoire locale (profil et sélection) ---------- */
  var mem = {};
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d); }
      catch (e) { return k in mem ? mem[k] : d; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ }
    }
  };
  var K_ROLE = "capsurete.profil", K_CART = "capsurete.selection";
  if (params.get("profil") && D.roles[params.get("profil")]) store.set(K_ROLE, params.get("profil"));
  function role() { var r = store.get(K_ROLE, null); return D.roles[r] ? r : null; }
  function cart() { return store.get(K_CART, []).filter(function (id) { return modById(id); }); }
  function modById(id) { return D.modules.filter(function (m) { return m.id === id; })[0]; }
  function toggleCart(id) {
    var c = cart(), i = c.indexOf(id);
    i > -1 ? c.splice(i, 1) : c.push(id);
    store.set(K_CART, c);
    document.dispatchEvent(new CustomEvent("cartchange"));
    return i === -1;
  }

  /* ---------- En-tête et barre de lecture ---------- */
  var hd = $(".hd"), readBar = h("div", { cls: "scrollbar", "aria-hidden": "true" });
  document.body.appendChild(readBar);
  function onScroll() {
    hd.setAttribute("data-scrolled", String(window.scrollY > 8));
    var max = document.documentElement.scrollHeight - window.innerHeight;
    readBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navBtn = $(".nav-btn"), nav = $("#nav");
  navBtn.addEventListener("click", function () {
    var open = navBtn.getAttribute("aria-expanded") !== "true";
    navBtn.setAttribute("aria-expanded", String(open));
    nav.setAttribute("data-open", String(open));
    navBtn.textContent = open ? "Fermer" : "Menu";
  });
  var here = { formations: "formations.html", equipe: "equipe.html", demande: "demande.html" }[page];
  if (here) $$("#nav a").forEach(function (a) { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  var roleBtn = $("#role-btn"), roleMenu = $("#role-menu");
  function closeRoleMenu() { roleMenu.hidden = true; roleBtn.setAttribute("aria-expanded", "false"); }
  function buildRoleMenu() {
    roleMenu.textContent = "";
    Object.keys(D.roles).forEach(function (k) {
      roleMenu.appendChild(h("button", { type: "button", "aria-pressed": String(role() === k), onclick: function () { setRole(k); closeRoleMenu(); roleBtn.focus(); } },
        [D.roles[k].label, h("small", { text: D.roles[k].hint })]));
    });
    if (role()) roleMenu.appendChild(h("button", { type: "button", onclick: function () { setRole(null); closeRoleMenu(); roleBtn.focus(); } }, ["Ne pas préciser"]));
  }
  roleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = roleMenu.hidden;
    buildRoleMenu();
    roleMenu.hidden = !open;
    roleBtn.setAttribute("aria-expanded", String(open));
    if (open) roleMenu.querySelector("button").focus();
  });
  document.addEventListener("click", function (e) { if (!roleMenu.hidden && !roleMenu.contains(e.target)) closeRoleMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !roleMenu.hidden) { closeRoleMenu(); roleBtn.focus(); } });

  function setRole(k) {
    store.set(K_ROLE, k);
    updateRoleLabel();
    document.dispatchEvent(new CustomEvent("rolechange"));
  }
  function updateRoleLabel() {
    $$("[data-role-label]").forEach(function (el) { el.textContent = role() ? D.roles[role()].label : "à choisir"; });
  }
  var lastCount = null;
  function updateCount() {
    var n = cart().length;
    $$("[data-cart-count]").forEach(function (el) {
      el.hidden = n === 0; el.textContent = String(n); el.setAttribute("aria-label", n + " formation" + (n > 1 ? "s" : "") + " sélectionnée" + (n > 1 ? "s" : ""));
      if (lastCount !== null && n > lastCount) replay(el, "bump");
    });
    lastCount = n;
  }
  updateRoleLabel();
  updateCount();
  document.addEventListener("cartchange", updateCount);
  $$("[data-year]").forEach(function (y) { y.textContent = String(new Date().getFullYear()); });

  /* =====================================================================
     ACCUEIL
     ===================================================================== */
  if (page === "accueil") {
    var foryou = $("#foryou");
    var roleCards = $$(".role[data-role]");
    var currentSpot = "portail", currentLevel = 1;

    function renderForYou(animate) {
      var r = role();
      roleCards.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-role") === r)); });
      if (!r) { foryou.hidden = true; return; }
      var R = D.roles[r];
      foryou.textContent = "";
      foryou.appendChild(h("div", { cls: "foryou__text" }, [
        h("h2", { text: R.title }),
        h("p", { text: R.text }),
        h("p", { cls: "foryou__label", text: "Formations conseillées" }),
        h("ul", { cls: "mods-inline" }, R.mods.map(function (id) { return h("li", null, [h("a", { href: "formations.html?m=" + id, text: modById(id).title })]); }))
      ]));
      foryou.appendChild(h("div", null, [
        h("p", { cls: "foryou__label", text: "Par où commencer" }),
        h("ul", { cls: "prio" }, R.priorities.map(function (p) {
          return h("li", null, [h("a", { href: p.href }, [h("strong", { text: p.t }), h("span", { text: p.d })])]);
        }))
      ]));
      foryou.hidden = false;
      if (animate) replay(foryou, "is-new");
      currentSpot = R.spot;
      renderExplorer();
    }
    roleCards.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-role");
        setRole(role() === k ? null : k);
      });
    });
    document.addEventListener("rolechange", function () { renderForYou(true); });

    /* Explorateur */
    var plan = $("#plan"), spotsBox = $("#spots"), list = $("#spot-list"), panel = $("#ex-panel");
    D.spots.forEach(function (s) {
      var b = h("button", { cls: "spot", type: "button", "data-spot": s.id, "aria-label": s.title, "aria-pressed": "false", onclick: function () { currentSpot = s.id; renderExplorer(true); } },
        [h("span", { cls: "spot__tip", "aria-hidden": "true", text: s.title })]);
      b.style.left = s.x + "%";
      b.style.top = s.y + "%";
      spotsBox.appendChild(b);
      list.appendChild(h("button", { type: "button", "data-spot": s.id, "aria-pressed": "false", text: s.title, onclick: function () { currentSpot = s.id; renderExplorer(true); } }));
    });
    $$("input[name='lvl']").forEach(function (inp) {
      inp.addEventListener("change", function () { currentLevel = Number(inp.value); plan.setAttribute("data-level", inp.value); renderExplorer(false); });
    });

    function renderExplorer(animate) {
      var s = D.spots.filter(function (x) { return x.id === currentSpot; })[0];
      $$("[data-spot]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-spot") === s.id)); });
      var m = modById(s.mod);
      panel.textContent = "";
      panel.appendChild(h("h3", { text: s.title }));
      panel.appendChild(h("p", { cls: "ex__desc", text: s.desc }));
      panel.appendChild(h("ul", { cls: "lvrows" }, D.levels.map(function (L, i) {
        return h("li", { cls: "r" + L.n, "aria-current": String(L.n === currentLevel) }, [h("b", { text: "Niveau " + L.n }), h("span", { text: s.levels[i] })]);
      })));
      panel.appendChild(h("div", { cls: "ex__svc" }, [
        h("p", { text: "Notre accompagnement" }),
        h("p", { text: s.service }),
        h("p", null, ["Formation associée : ", h("a", { href: "formations.html?m=" + m.id, text: m.title })])
      ]));
      if (animate) replay(panel, "is-new");
    }

    if ("IntersectionObserver" in window) {
      var seen = false;
      new IntersectionObserver(function (en, obs) {
        if (en[0].isIntersecting && !seen) { seen = true; spotsBox.classList.add("is-intro"); obs.disconnect(); }
      }, { threshold: 0.5 }).observe(plan);
    }

    /* Aperçu de l'équipe */
    var crew = $("#crew-list");
    D.team.forEach(function (p) {
      crew.appendChild(h("li", null, [h("span", { cls: "mono" + (p.id === "ak" ? " mono--cyber" : ""), "aria-hidden": "true", text: p.mono }), h("strong", { text: p.name }), h("span", { text: p.role })]));
    });

    renderForYou(false);
    renderExplorer(false);
  }

  /* =====================================================================
     FORMATIONS
     ===================================================================== */
  if (page === "formations") {
    var q = $("#q"), filters = $("#filters"), forMe = $("#for-me"), cards = $("#cards"), results = $("#results");
    var tray = $("#tray"), trayText = $("#tray-text"), dlg = $("#dlg"), dlgAdd = $("#dlg-add");
    var dom = "all", openId = null;
    var norm = function (t) { return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };

    filters.appendChild(h("button", { type: "button", "data-d": "all", "aria-pressed": "true", text: "Tous" }));
    Object.keys(D.domains).forEach(function (k) { filters.appendChild(h("button", { type: "button", "data-d": k, "aria-pressed": "false", text: D.domains[k] })); });
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      dom = b.getAttribute("data-d");
      $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      render(true);
    });
    function syncForMe() {
      forMe.hidden = !role();
      if (!role()) forMe.setAttribute("aria-pressed", "false");
      forMe.textContent = role() ? "Conseillées pour : " + D.roles[role()].label : "";
    }
    forMe.addEventListener("click", function () { forMe.setAttribute("aria-pressed", String(forMe.getAttribute("aria-pressed") !== "true")); render(true); });
    q.addEventListener("input", function () { render(true); });
    document.addEventListener("rolechange", function () { syncForMe(); render(true); });

    // animate : faire entrer les cartes une à une (filtres, recherche), pas lors d'un ajout à la demande
    function render(animate) {
      var term = norm(q.value.trim());
      var mine = forMe.getAttribute("aria-pressed") === "true" && role() ? D.roles[role()].mods : null;
      var c = cart();
      var list = D.modules.filter(function (m) {
        if (dom !== "all" && m.d !== dom) return false;
        if (mine && mine.indexOf(m.id) === -1) return false;
        if (!term) return true;
        return norm([m.title, m.who, m.goals.join(" "), m.prog.join(" ")].join(" ")).indexOf(term) > -1;
      });
      cards.textContent = "";
      results.textContent = list.length === D.modules.length ? D.modules.length + " formations" : list.length + " formation" + (list.length > 1 ? "s" : "") + " sur " + D.modules.length;
      if (!list.length) {
        cards.appendChild(h("div", { cls: "empty" }, [
          h("p", { text: "Aucune formation ne correspond à ces critères. Effacez la recherche ou choisissez un autre domaine." }),
          h("button", { cls: "btn btn--line btn--sm", type: "button", text: "Tout afficher", onclick: function () { q.value = ""; dom = "all"; forMe.setAttribute("aria-pressed", "false"); $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-d") === "all")); }); render(true); } })
        ]));
        return;
      }
      list.forEach(function (m, i) {
        var picked = c.indexOf(m.id) > -1;
        var card = cards.appendChild(h("article", { cls: "card" + (picked ? " is-picked" : "") + (animate ? " is-new" : "") }, [
          h("p", { cls: "tag", "data-d": m.d, text: D.domains[m.d] }),
          h("h3", { text: m.title }),
          h("p", { cls: "card__meta" }, [h("span", { text: m.who }), h("span", { text: m.days })]),
          h("div", { cls: "card__act" }, [
            h("button", { cls: "btn btn--line btn--sm", type: "button", text: "Voir le programme", onclick: function () { openDlg(m.id); } }),
            h("button", { cls: "btn btn--sm add", type: "button", "aria-pressed": String(picked), "aria-label": (picked ? "Retirer de ma demande : " : "Ajouter à ma demande : ") + m.title, text: picked ? "Ajoutée" : "Ajouter", onclick: function () { toggleCart(m.id); } })
          ])
        ]));
        card.style.setProperty("--i", String(i));
      });
    }

    function openDlg(id) {
      var m = modById(id); if (!m) return;
      openId = id;
      $("#dlg-tag").textContent = D.domains[m.d];
      $("#dlg-tag").setAttribute("data-d", m.d);
      $("#dlg-title").textContent = m.title;
      var meta = $("#dlg-meta"); meta.textContent = "";
      [["Pour qui", m.who], ["Durée indicative", m.days], ["Format", m.format]].forEach(function (x) { meta.appendChild(h("div", null, [h("dt", { text: x[0] }), h("dd", { text: x[1] })])); });
      var fill = function (sel, arr) { var u = $(sel); u.textContent = ""; arr.forEach(function (t) { u.appendChild(h("li", { text: t })); }); };
      fill("#dlg-goals", m.goals); fill("#dlg-prog", m.prog);
      syncDlgAdd();
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    }
    function syncDlgAdd() {
      if (!openId) return;
      var on = cart().indexOf(openId) > -1;
      dlgAdd.textContent = on ? "Retirer de ma demande" : "Ajouter à ma demande";
      dlgAdd.className = on ? "btn btn--line" : "btn";
    }
    dlgAdd.addEventListener("click", function () { toggleCart(openId); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.hasAttribute("data-close")) dlg.close(); });

    function renderTray(animate) {
      var n = cart().length;
      var wasHidden = tray.hidden;
      tray.hidden = n === 0;
      trayText.textContent = n + " formation" + (n > 1 ? "s" : "") + " dans votre demande";
      if (animate && wasHidden && n) replay(tray, "is-new");
    }
    $("#tray-clear").addEventListener("click", function () { store.set(K_CART, []); document.dispatchEvent(new CustomEvent("cartchange")); });
    document.addEventListener("cartchange", function () { render(); renderTray(true); syncDlgAdd(); });

    syncForMe();
    render(true);
    renderTray(false);
    if (params.get("m")) openDlg(params.get("m"));
  }

  /* =====================================================================
     ÉQUIPE
     ===================================================================== */
  if (page === "equipe") {
    var table = $("#matrix"), roster = $("#roster"), active = null;
    var thead = h("thead", null, [h("tr", null, [h("th", { scope: "col" }, [h("span", { cls: "sr-only", text: "Domaine" })])].concat(D.team.map(function (p) {
      return h("th", { scope: "col" }, [h("span", { cls: "mono" + (p.id === "ak" ? " mono--cyber" : ""), "aria-hidden": "true", text: p.mono }), p.name.split(" ")[0]]);
    })))]);
    var tbody = h("tbody");
    D.skills.forEach(function (sk, i) {
      var btn = h("button", { type: "button", "aria-pressed": "false", text: sk, onclick: function () { activate(active === i ? null : i); } });
      tbody.appendChild(h("tr", { "data-i": String(i) }, [h("th", { scope: "row" }, [btn])].concat(D.team.map(function (p) {
        var v = p.lv[i];
        return h("td", null, v ? [h("span", { cls: "dot dot--" + v, "aria-hidden": "true" }), h("span", { cls: "sr-only", text: v === 2 ? "Référent" : "Intervient" })] : [h("span", { cls: "sr-only", text: "Non" })]);
      }))));
    });
    $$(".dot", tbody).forEach(function (d, k) { d.style.setProperty("--i", String(k)); });
    table.appendChild(thead); table.appendChild(tbody);

    D.team.forEach(function (p) {
      roster.appendChild(h("li", { cls: "mate", id: "m-" + p.id }, [
        h("span", { cls: "mono mono--lg" + (p.id === "ak" ? " mono--cyber" : ""), "aria-hidden": "true", text: p.mono }),
        h("h3", { text: p.name }),
        h("p", { cls: "mate__role", text: p.role }),
        h("details", null, [h("summary", { text: "Parcours" }), h("p", { text: p.sum }), h("ul", null, p.cv.map(function (t) { return h("li", { text: t }); }))])
      ]));
    });

    function activate(i) {
      active = i;
      $$("tbody tr", table).forEach(function (tr) {
        var on = i !== null && Number(tr.getAttribute("data-i")) === i;
        tr.classList.toggle("is-on", on);
        $("button", tr).setAttribute("aria-pressed", String(on));
      });
      D.team.forEach(function (p) {
        var li = document.getElementById("m-" + p.id);
        li.setAttribute("data-dim", String(i !== null && !p.lv[i]));
        li.setAttribute("data-hl", String(i !== null && p.lv[i] === 2));
      });
    }
  }

  /* =====================================================================
     DEMANDE
     ===================================================================== */
  if (page === "demande") {
    var form = $("#wiz"), err = $("#wiz-err"), back = $("#wiz-back"), next = $("#wiz-next"), navBox = $("#wiz-nav"), done = $("#wiz-done");
    var step = 1;
    var needsBox = $("#needs"), picked = $("#picked");
    var pre = params.get("besoin") ? [params.get("besoin")] : [];
    if (!pre.length && cart().length) pre.push("formation");
    if (!pre.length && role()) pre.push({ direction: "isps", surete: "formation", compagnie: "formation", cyber: "cyber" }[role()]);
    D.needs.forEach(function (n) {
      var inp = h("input", { type: "checkbox", name: "besoin", value: n.id });
      inp.checked = pre.indexOf(n.id) > -1;
      needsBox.appendChild(h("label", { cls: "need" }, [inp, h("span", { text: n.t }), h("small", { text: n.d })]));
    });

    function renderPicked() {
      var c = cart();
      picked.textContent = "";
      picked.appendChild(h("p", { text: c.length ? "Formations sélectionnées" : "Aucune formation sélectionnée" }));
      if (c.length) {
        picked.appendChild(h("ul", null, c.map(function (id) {
          var m = modById(id);
          return h("li", null, [m.title, h("button", { type: "button", "aria-label": "Retirer " + m.title, text: "×", onclick: function () { toggleCart(id); } })]);
        })));
      }
      picked.appendChild(h("a", { href: "formations.html", text: c.length ? "Ajouter d'autres formations" : "Parcourir le catalogue" }));
    }
    document.addEventListener("cartchange", renderPicked);
    renderPicked();

    function show(n) {
      step = n;
      $$(".wiz__panel").forEach(function (p) {
        var on = Number(p.getAttribute("data-step")) === n;
        p.hidden = !on;
        if (on) { replay(p, "is-new"); }
      });
      $$("[data-step-ind]").forEach(function (li) {
        var k = Number(li.getAttribute("data-step-ind"));
        k === n ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
        li.classList.toggle("is-done", k < n || n === 4);
      });
      back.hidden = n === 1 || n === 4;
      navBox.hidden = n === 4;
      done.hidden = n !== 4;
      next.textContent = n === 3 ? "Vérifier ma demande" : "Continuer";
      err.hidden = true;
      var focusTarget = n === 4 ? done : $(".wiz__panel[data-step='" + n + "'] input, .wiz__panel[data-step='" + n + "'] select");
      if (focusTarget) focusTarget.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function invalid(msg, el) { err.hidden = false; err.textContent = msg; if (el) el.focus(); return false; }
    function validate(n) {
      $$("[aria-invalid]", form).forEach(function (f) { f.removeAttribute("aria-invalid"); });
      if (n === 1) {
        var any = $$("input[name='besoin']:checked").length || cart().length;
        return any ? true : invalid("Cochez au moins un besoin ou ajoutez une formation.", $("input[name='besoin']"));
      }
      if (n === 2) {
        var t = form.elements.type;
        if (!t.value) { t.setAttribute("aria-invalid", "true"); return invalid("Indiquez le type d'installation.", t); }
        return true;
      }
      if (n === 3) {
        var bad = ["nom", "organisation", "email"].map(function (k) { return form.elements[k]; }).filter(function (f) {
          var ko = !f.value.trim() || (f.type === "email" && !f.checkValidity());
          if (ko) f.setAttribute("aria-invalid", "true");
          return ko;
        });
        return bad.length ? invalid("Renseignez votre nom, votre organisation et une adresse e-mail valide.", bad[0]) : true;
      }
      return true;
    }

    function recapText() {
      var f = form.elements;
      var needs = $$("input[name='besoin']:checked").map(function (i) { return D.needs.filter(function (n) { return n.id === i.value; })[0].t; });
      var lines = ["Bonjour,", "", "Je souhaite recevoir une proposition."];
      lines.push("", "Besoin : " + (needs.length ? needs.join(", ") : "formation"));
      var c = cart();
      if (c.length) { lines.push("Formations :"); c.forEach(function (id) { lines.push("  " + modById(id).title); }); }
      lines.push("", "Installation : " + f.type.value + (f.site.value ? ", " + f.site.value : ""));
      if (f.effectif.value) lines.push("Personnes à former : " + f.effectif.value);
      if (f.echeance.value) lines.push("Échéance : " + f.echeance.value);
      if (role()) lines.push("Profil : " + D.roles[role()].label);
      if (f.message.value.trim()) lines.push("", f.message.value.trim());
      lines.push("", f.nom.value + (f.fonction.value ? ", " + f.fonction.value : ""), f.organisation.value, f.email.value);
      if (f.tel.value) lines.push(f.tel.value);
      return lines.join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(step)) return;
      if (step < 3) { show(step + 1); return; }
      var text = recapText();
      $("#recap").textContent = text;
      var subject = "Demande de proposition | " + form.elements.organisation.value;
      $("#wiz-send").href = "mailto:" + D.mail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      $$(".wiz__panel").forEach(function (p) { p.hidden = true; });
      show(4);
    });
    back.addEventListener("click", function () { show(step - 1); });
    $("#wiz-edit").addEventListener("click", function () { show(3); });
  }

  /* =====================================================================
     ANIMATIONS
     ===================================================================== */
  var stats = { modules: D.modules.length, team: D.team.length, levels: D.levels.length, roles: Object.keys(D.roles).length };
  var statEls = $$("[data-stat]");
  statEls.forEach(function (el) { el.textContent = String(stats[el.getAttribute("data-stat")]); });
  if (calm) return;

  function countUp(node, to, ms) {
    var t0 = Date.now();
    (function tick() {
      var k = Math.min(1, (Date.now() - t0) / ms);
      node.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) setTimeout(tick, 16);
    })();
  }

  // Titre principal mot par mot, sans toucher aux balises internes
  var heading = $(".intro h1, .pagehead h1"), wi = 0;
  if (heading) (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 1) { split(c); return; }
      if (c.nodeType !== 3 || !c.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = h("span", { cls: "w", text: part });
        w.style.setProperty("--i", String(wi++));
        frag.appendChild(w);
      });
      node.replaceChild(frag, c);
    });
  })(heading);

  if ("IntersectionObserver" in window) {
    // Apparition au défilement ; la classe est retirée ensuite pour laisser libres les effets de survol
    var groups = [".sec__head", ".ex__head", ".ex__map", ".ex__panel", ".how li", ".crew__list li", ".cta__in", ".tools", ".matrix-wrap", ".legend", ".mate", ".refs", ".wiz__steps", ".wiz__form", ".legal"];
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rv.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    groups.forEach(function (sel) {
      $$(sel).forEach(function (n, i) {
        n.classList.add("rv");
        n.style.setProperty("--d", String(i % 6));
        n.addEventListener("transitionend", function end(e) {
          if (e.target !== n || e.propertyName !== "opacity") return;
          n.classList.remove("rv");
          n.removeEventListener("transitionend", end);
        });
        rv.observe(n);
      });
    });

    // Chiffres clés
    if (statEls.length) {
      statEls.forEach(function (el) { el.textContent = "0"; });
      var so = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        so.disconnect();
        statEls.forEach(function (el, i) { setTimeout(function () { countUp(el, stats[el.getAttribute("data-stat")], 1400); }, 500 + i * 120); });
      });
      so.observe(statEls[0].closest("dl"));
    }
  }

  // Halo qui suit le pointeur sur les cartes (y compris celles créées après coup)
  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || !e.target.closest) return;
    var c = e.target.closest(".card, .role");
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();
