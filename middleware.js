// Tijdelijke inlog zolang de afspraken met Makelaar1 nog niet rond zijn.
// Verwijder dit bestand om de site openbaar te maken.
//
// Na het juiste wachtwoord krijgt de browser een cookie met een token dat met
// PBKDF2 uit het wachtwoord is afgeleid. In de code staat alleen de SHA-256 van
// dat token, dus het wachtwoord en het token zelf zijn niet uit de code te halen.

const SALT = "3d83e77b8bb27a90c8f130d04f9a7c8f";
const TOKEN_SHA256 = "403f4ead22d9b001734f7d78cd2f7b2cd2f1a7aa8cfbc36be255c34c200993a8";
const ITERATIONS = 200000;
const COOKIE = "ehv_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dagen
const LOGIN_PATH = "/__login";
const PUBLIC = ["/favicon.svg", "/apple-touch-icon.png", "/robots.txt"];

function hex(buf) {
  return Array.from(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

function same(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256(text) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

async function tokenFor(password) {
  const salt = new Uint8Array(SALT.match(/../g).map(function (h) { return parseInt(h, 16); }));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: ITERATIONS }, key, 256));
}

function readCookie(request, name) {
  const all = request.headers.get("cookie") || "";
  const parts = all.split(";");
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim();
    if (p.indexOf(name + "=") === 0) return p.slice(name.length + 1);
  }
  return "";
}

// Alleen interne paden als terugkeeradres
function safePath(p) {
  return typeof p === "string" && p.charAt(0) === "/" && p.charAt(1) !== "/" && p.charAt(1) !== "\\" ? p : "/";
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}

// Laat het verzoek door naar de statische site (zelfde als next() uit @vercel/functions)
function next() {
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

function loginPage(back, error) {
  const html = '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="robots" content="noindex"><title>Inloggen | Eerlijk huis verkopen</title>' +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">' +
    '<style>' +
    ':root{--bg:#e9eee6;--card:#f8f9f6;--ink:#2f2b27;--head:#2a2724;--muted:#5f625c;--line:#c6d0c2;--accent:#6f5c3a;' +
    '--serif:Georgia,"Iowan Old Style","Palatino Linotype",serif;--sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}' +
    '*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.6}' +
    '.box{width:100%;max-width:400px;background:var(--card);border:1px solid var(--line);border-top:2px solid var(--head);padding:34px 28px}' +
    '.logo{font-family:var(--serif);font-weight:400;font-size:1.6rem;color:var(--head);margin:0;letter-spacing:-.005em}.logo i{color:var(--accent)}' +
    '.sub{font-size:.56rem;letter-spacing:.14em;white-space:nowrap;text-transform:uppercase;color:var(--muted);margin:4px 0 28px}' +
    'p{margin:0 0 20px;color:var(--muted)}label{display:block;font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;color:var(--muted);margin-bottom:8px}' +
    'input{width:100%;font:inherit;font-size:1.05rem;padding:12px 14px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:0}' +
    'input:focus{outline:2px solid var(--head);outline-offset:1px}' +
    'button{margin-top:16px;width:100%;font:inherit;font-weight:600;padding:14px;border:0;background:var(--head);color:#fff;cursor:pointer}button:hover{background:#46403a}' +
    '.err{color:#8a2b1f;font-weight:600;margin:12px 0 0}' +
    '</style></head><body><main class="box">' +
    '<h1 class="logo"><i>Eerlijk</i> huis verkopen</h1><div class="sub">Den Bosch &middot; Rosmalen &middot; Berlicum &middot; Vught</div>' +
    '<p>Deze site is nog niet openbaar. Vul het wachtwoord in om verder te gaan.</p>' +
    '<form method="post" action="' + LOGIN_PATH + '">' +
    '<input type="hidden" name="next" value="' + esc(back) + '">' +
    '<label for="pw">Wachtwoord</label>' +
    '<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>' +
    (error ? '<p class="err" role="alert">Dat wachtwoord klopt niet. Probeer het opnieuw.</p>' : '') +
    '<button type="submit">Inloggen</button></form></main></body></html>';
  return new Response(html, {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);

  if (PUBLIC.indexOf(url.pathname) !== -1) return next();

  if (url.pathname === LOGIN_PATH) {
    if (request.method !== "POST") return loginPage("/", false);
    let form;
    try { form = await request.formData(); } catch (err) { return loginPage("/", true); }
    const back = safePath(form.get("next"));
    const token = await tokenFor(String(form.get("password") || ""));
    if (!same(await sha256(token), TOKEN_SHA256)) return loginPage(back, true);
    return new Response(null, {
      status: 303,
      headers: {
        "Location": back,
        "Set-Cookie": COOKIE + "=" + token + "; Path=/; Max-Age=" + MAX_AGE + "; HttpOnly; Secure; SameSite=Lax",
        "Cache-Control": "no-store"
      }
    });
  }

  const cookie = readCookie(request, COOKIE);
  if (cookie && same(await sha256(cookie), TOKEN_SHA256)) return next();

  return loginPage(safePath(url.pathname + url.search), false);
}
