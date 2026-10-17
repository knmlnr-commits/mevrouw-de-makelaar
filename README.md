# Mevrouw geen Makelaar

Website voor [mevrouw-geen-makelaar.nl](https://www.mevrouw-geen-makelaar.nl): persoonlijke woningverkoop door Loes in Den Bosch, Rosmalen, Berlicum en Vught.

## Techniek
- Statische HTML, CSS en JavaScript, geen build-stap
- Gehost op Vercel (`vercel.json` met clean URLs en security headers)
- Geen externe scripts, fonts of trackers (AVG-vriendelijk)

## Prijsformule
Vergoeding = (1% van verkoopprijs − €800) / 2, plus €800 vaste kosten.
Voorbeeld €500.000: (5.000 − 800) / 2 = 2.100 + 800 = **€2.900** totaal.
De constanten staan bovenin `main.js` (`COSTS`, `TRAD_LOW`, `TRAD_HIGH`).

## Nog in te vullen (zoek op `class="ph"`)
- KvK-nummer, juridische naam en adres
- Foto van Loes en persoonlijk verhaal
- Verkochte woningen: type, plaats, verkooptijd, echte foto's
- Echte klantreviews (met toestemming)
- Afspraak bij geen verkoop, aansprakelijkheid
- og-image.png (1200x630) voor social sharing

## Contactformulier
Het formulier opent het mailprogramma van de bezoeker met een ingevuld bericht aan `loes@salesday.nl`.
Het adres staat in `main.js` (`EMAIL`) en in de HTML; zoek en vervang bij wijziging.
