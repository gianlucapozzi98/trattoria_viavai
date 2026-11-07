# Trattoria ViaVai — Torriglia

Sito one-page statico (`index.html` + `css/` + `js/` + `img/`), mobile-first, animato.
Anteprima locale: `python3 -m http.server 8765` nella cartella, poi http://localhost:8765

Ispirazione: burlagiomilano.it (atmosfera calda, sovratitoli calligrafici), lespecialitamilano.com
(sfondo senape, logo ovale, impaginazione editoriale), denispizza.it (slideshow, parallasse, animazioni allo scroll).

## Logo
`img/logo-viavai.svg` (vettoriale) e `img/logo-viavai.png`: ricreato dall'insegna ovale in ferro. Script per rigenerarlo in `tools/logo/`.

## Pagina iniziale
L'insegna appesa al braccio in ferro scende dondolando (toccandola dondola di nuovo); i piatti arrivano sul tavolo come polaroid,
uno sopra l'altro; timbro rotante "25 anni a tavola".

## Animazioni (JS vanilla, nessuna libreria)
Sipario d'apertura con logo ovale (solo alla prima visita della sessione) · slideshow hero con zoom lento ·
titolo che entra parola per parola · nastro di piatti in movimento · polaroid in parallasse ·
sottolineatura disegnata a mano · contatore "25 anni" e voto Google · lavagna scritta "col gessetto" ·
galleria piatti a scorrimento orizzontale agganciato (desktop) · tovaglia a quadretti · recensioni come
biglietti appuntati · lucine che brillano nella sezione serate · menu mobile a comparsa circolare.
Le animazioni restano attive anche con "Riduci movimento" attivo sul telefono (richiesta del cliente).
Dopo ogni modifica a CSS/JS aumentare `?v=` nei link di `index.html` (cache).

## Fonti dei dati (rilevati il 07/11/2026)
- **Scheda Google**: indirizzo, telefono 010 945 1005, orari (12–14 / 19–21, chiuso mer.), 4,2★ su 431 recensioni,
  20–30 € a persona, accessibilità, 3 recensioni 5★ e frasi in evidenza.
- **Instagram @viavaitrattoriatorriglia** (account del locale): bio ("piatti del territorio… a seconda delle stagioni
  le proposte variano… una peculiarità è il pesto d'aglio"), locandina **25 anni** (8/12/2025) con le frasi citate,
  cellulare **351 393 6541** "per info e prenotazioni" (attivo su WhatsApp, confermato), indirizzo "Via N.S. della Provvidenza 14–16",
  serate con musica dal vivo / karaoke / DJ set, menu serata (antipasto della casa, ravioli al pesto d'aglio o al ragù, funghi fritti).
- **Facebook / Tripadvisor / Città Metropolitana**: "pranzo e cena a prezzo fisso o alla carta", "cucina ligure-piacentina, vini e Trebbia beer".
- **Facebook TrattoriaViavaiTorriglia** (pagina del locale): "La nostra Tagliata ai funghi porcini" (19/10/2026), "proposte a base di funghi della nostra zona" (3/10/2026),
  "Come ogni Venerdì torna in Trattoria lo Stoccafisso in bianco o accomodato. (Anche per asporto)" (22/10/2026).
- **Foto**: hero e galleria → `tagliata-porcini`, `porcini`, `ravioli`, `stoccafisso` dalla pagina Facebook del locale
  (attenzione: Facebook etichetta i post della tagliata e dei porcini come "Contenuti IA", cioè immagini generate o ritoccate con IA);
  `insegna.jpg` e `torriglia-insegna-notte.jpg` da Instagram del locale; tagliolini, secondi, sala, facciata e vini da Google Maps (caricate da clienti).

## Da verificare / completare (segnaposto gialli nel sito, classe `.ph`)
| Dato | Dove |
|---|---|
| `foundingDate: 2000` (dedotto da "25 anni" a dic. 2025) | JSON-LD in `index.html` |
| **Dominio** definitivo | canonical, og:url, og:image, JSON-LD (`[DOMINIO]`) |
| Prezzo **menu fisso** pranzo/cena | post-it sulla lavagna + FAQ |
| **Storia** (chi c'è in cucina e in sala) | sezione storia |
| Email `viavai00@gmail.com` (fonte 2021) | footer |
| **P.IVA**, privacy & cookie policy | footer |
| **Foto proprie o autorizzate** | sostituire quelle da Google Maps; chiedere conferma per usare quelle dei social del locale |
| GA4 / Google Tag Manager | `<head>` — eventi già inviati a `dataLayer` (`book_*`, `call_*`, `directions_*`, `whatsapp_click`, `booking_request`, `ig_*`) |

Da aggiornare periodicamente: voto e numero recensioni (hero + Recensioni), orari se stagionali (`CONFIG.hours` + tabella + JSON-LD).
