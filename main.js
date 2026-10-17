(function () {
  "use strict";

  var EMAIL = "loes@salesday.nl";
  var COSTS = 800;           // vaste kosten: Funda, fotograaf, brochures
  var TRAD_LOW = 0.011;      // gangbare courtage, onderkant
  var TRAD_HIGH = 0.014;     // gangbare courtage, bovenkant

  // Mobiel menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // Bedragen
  var fmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  function euro(n) { return fmt.format(Math.round(n)); }
  function parseEuro(s) { var n = parseInt(String(s).replace(/[^0-9]/g, ""), 10); return isNaN(n) ? 0 : n; }

  // Calculator
  document.querySelectorAll("[data-calc]").forEach(function (root) {
    var range = root.querySelector("[data-range]");
    var input = root.querySelector("[data-price]");
    var out = function (k) { return root.querySelectorAll('[data-out="' + k + '"]'); };
    var MIN = 150000, MAX = 1500000;

    function render(price) {
      var p = Math.min(Math.max(price, MIN), MAX);
      var one = p * 0.01;
      var fee = Math.max(one - COSTS, 0) / 2;
      var total = fee + COSTS;
      var tradLo = p * TRAD_LOW, tradHi = p * TRAD_HIGH;
      var trad = tradHi;
      var saving = Math.max(tradLo - total, 0) ;
      var savingHi = Math.max(tradHi - total, 0);
      var set = function (k, v) { out(k).forEach(function (el) { el.textContent = v; }); };
      set("price", euro(p));
      set("one", euro(one));
      set("costs", euro(COSTS));
      set("rest", euro(one - COSTS));
      set("fee", euro(fee));
      set("total", euro(total));
      set("trad", euro(tradLo) + " tot " + euro(tradHi));
      set("saving", euro(saving) + " tot " + euro(savingHi));
      var pct = trad > 0 ? Math.round((total / trad) * 100) : 0;
      root.querySelectorAll("[data-bar]").forEach(function (b) { b.style.width = pct + "%"; });
      root.querySelectorAll("[data-bar-trad]").forEach(function (b) { b.style.width = "100%"; });
      return p;
    }

    if (range) {
      range.addEventListener("input", function () {
        var p = render(parseInt(range.value, 10));
        if (input) input.value = new Intl.NumberFormat("nl-NL").format(p);
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        var raw = parseEuro(input.value);
        if (raw >= MIN) { var p = render(raw); if (range) range.value = p; }
      });
      input.addEventListener("blur", function () {
        var p = render(parseEuro(input.value) || 500000);
        input.value = new Intl.NumberFormat("nl-NL").format(p);
        if (range) range.value = p;
      });
    }
    render(range ? parseInt(range.value, 10) : 500000);
  });

  // Contactformulier: stelt een e-mail op aan Loes
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("form-msg");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var d = new FormData(form);
      var lines = [
        "Naam: " + (d.get("naam") || ""),
        "E-mail: " + (d.get("email") || ""),
        "Telefoon: " + (d.get("telefoon") || ""),
        "Adres woning: " + (d.get("adres") || ""),
        "Verwachte vraagprijs: " + (d.get("vraagprijs") || ""),
        "",
        String(d.get("bericht") || "")
      ];
      var subject = "Kennismaking aangevraagd via mevrouw-de-makelaar.nl";
      var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = href;
      if (msg) {
        msg.className = "form-msg show";
        msg.innerHTML = "<strong>Dank je wel!</strong> Je mailprogramma opent nu met je bericht klaar om te versturen. Lukt dat niet? Mail dan naar <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a> of stuur een WhatsApp. Loes reageert binnen één werkdag.";
        msg.focus();
      }
    });
  }

  // Cookiemelding (alleen functioneel)
  var cookie = document.getElementById("cookie");
  if (cookie) {
    var seen = false;
    try { seen = localStorage.getItem("mdm-cookie") === "ok"; } catch (err) { seen = false; }
    if (!seen) cookie.classList.add("show");
    var ok = cookie.querySelector("button");
    if (ok) ok.addEventListener("click", function () {
      try { localStorage.setItem("mdm-cookie", "ok"); } catch (err) {}
      cookie.classList.remove("show");
    });
  }

  // Jaar in footer
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
