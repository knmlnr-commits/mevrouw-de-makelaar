// Tijdelijke inlog zolang de afspraken met Makelaar1 nog niet rond zijn.
// Verwijder dit bestand om de site openbaar te maken.
// Het wachtwoord staat niet in de code, alleen een gezouten PBKDF2-hash.

const SALT = "59ae08f378c7ba5cb5dec6d54da3b96f";
const HASH = "83982551672bb2b995c166e2651d563d350f5770608d1c229f983aedb6e4acc4";
const ITERATIONS = 200000;

// Al gecontroleerde Authorization-headers, zodat niet elk bestand opnieuw gehasht wordt
const verified = new Set();

function hex(buf) {
  return Array.from(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

async function isValid(password) {
  const salt = new Uint8Array(SALT.match(/../g).map(function (h) { return parseInt(h, 16); }));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: ITERATIONS }, key, 256);
  const got = hex(bits);
  let diff = got.length ^ HASH.length;
  for (let i = 0; i < HASH.length; i++) diff |= got.charCodeAt(i) ^ HASH.charCodeAt(i);
  return diff === 0;
}

// Laat het verzoek door naar de statische site (zelfde als next() uit @vercel/functions)
function next() {
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

function deny() {
  return new Response(
    "<!doctype html><html lang=\"nl\"><meta charset=\"utf-8\"><title>Inloggen</title>" +
    "<body style=\"font-family:Georgia,serif;background:#e9eee6;color:#2a2724;padding:15vh 20px;text-align:center\">" +
    "<h1 style=\"font-weight:400\"><i style=\"color:#6f5c3a\">Eerlijk</i> huis verkopen</h1>" +
    "<p>Deze site is nog niet openbaar.</p></body></html>",
    {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic realm=\"Eerlijk huis verkopen\", charset=\"UTF-8\"",
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex"
      }
    }
  );
}

export default async function middleware(request) {
  const auth = request.headers.get("authorization") || "";
  if (verified.has(auth)) return next();
  if (auth.indexOf("Basic ") === 0) {
    let decoded = "";
    try { decoded = atob(auth.slice(6)); } catch (err) { decoded = ""; }
    const sep = decoded.indexOf(":");
    if (sep !== -1 && await isValid(decoded.slice(sep + 1))) {
      if (verified.size > 100) verified.clear();
      verified.add(auth);
      return next();
    }
  }
  return deny();
}
