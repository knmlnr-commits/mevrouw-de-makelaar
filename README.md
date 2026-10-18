# Eerlijk huis verkopen

Website voor [eerlijkhuisverkopen.nl](https://www.eerlijkhuisverkopen.nl): persoonlijke woningverkoop door Loes in Den Bosch, Rosmalen, Berlicum en Vught.

## Techniek
- Statische HTML, CSS en JavaScript, geen build-stap
- Gehost op Vercel (`vercel.json` met clean URLs en security headers)
- Geen externe scripts, fonts of trackers (AVG-vriendelijk)

## Prijsformule
Vergoeding = (1% van verkoopprijs − €865) / 2, plus €865 vaste kosten.
Voorbeeld €500.000: (5.000 − 865) / 2 = 2.067,50 + 865 = **€2.932,50** totaal.
De constanten staan bovenin `main.js` (`COSTS`, `TRAD_LOW`, `TRAD_HIGH`).

## Nog in te vullen (zoek op `class="ph"`)
- KvK-nummer (nu: eenmanszaak in oprichting) en juridische naam (adres: Buskeshoeven 87, 5242 KP Rosmalen)
- Foto van Loes en persoonlijk verhaal
- Verkochte woningen: type, plaats, verkooptijd, echte foto's
- Echte klantreviews (met toestemming)
- Aansprakelijkheid in de voorwaarden

## Afspraken
- Kennismaking en intake zijn vrijblijvend.
- Trekt de klant zich terug na het verstrekken van de opdracht, dan worden gewerkte uren (€75 per uur, minimum €300) en gemaakte kosten doorbelast. Het uurtarief staat alleen in de voorwaarden, niet prominent op de site.

## Contactformulier
Het formulier opent het mailprogramma van de bezoeker met een ingevuld bericht aan `loes@salesday.nl`.
Het adres staat in `main.js` (`EMAIL`) en in de HTML; zoek en vervang bij wijziging.

## Onderhoud
- Header en footer staan in elk HTML-bestand apart; wijzig ze overal.
- Na een wijziging in `styles.css` of `main.js`: werk het versienummer (`?v=...`) in alle HTML-bestanden bij, bijv. de eerste 8 tekens van de sha1 van het bestand.
- `vercel.json` zet een Content-Security-Policy: alleen eigen scripts, geen externe bronnen. Voeg een domein toe als je ooit een externe dienst inbouwt.

## Domein
- Hoofddomein: www.eerlijkhuisverkopen.nl (canonical, sitemap, robots, og-tags).
- In Vercel (Settings > Domains): www.eerlijkhuisverkopen.nl als productiedomein, eerlijkhuisverkopen.nl doorsturen naar www, en www.mevrouw-geen-makelaar.nl en mevrouw-geen-makelaar.nl met een 308-redirect doorsturen naar www.eerlijkhuisverkopen.nl.

## Tijdelijke inlog
Zolang de afspraken met Makelaar1 niet rond zijn, vraagt de site om een wachtwoord (`middleware.js`, Vercel Routing Middleware). De gebruikersnaam maakt niet uit. Het wachtwoord staat niet in de code, alleen een gezouten PBKDF2-hash. Site openbaar maken: verwijder `middleware.js` en push.

