# Trattoria Viavai — Torriglia

Sito one-page statico (`index.html` + `css/` + `js/` + `img/`), mobile-first.
Anteprima locale: `python3 -m http.server 8765` nella cartella, poi http://localhost:8765

## Fonti dei dati usati (rilevati il 07/11/2026)
- **Scheda Google**: indirizzo, telefono 010 945 1005, orari (12–14 / 19–21, chiuso mer.),
  4,2★ su 431 recensioni, 20–30 € a persona, accessibilità in sedia a rotelle, 3 recensioni 5★ e frasi in evidenza.
- **Facebook / Tripadvisor**: "trattoria tipica dell'entroterra ligure", "pranzo e cena a prezzo fisso o alla carta".
- **Città Metropolitana di Genova (fuorigenova)**: "cucina ligure-piacentina, ampia scelta di vini e Trebbia beer".
- **Foto**: 9 foto da Google Maps (contributi degli utenti) in `img/` (originali in `img/raw/`).

## Segnaposto da completare (gialli tratteggiati nel sito, classe `.ph`)
| Dato | Dove |
|---|---|
| Numero **WhatsApp** del locale | `js/main.js` → `CONFIG.whatsapp` (finché manca, i pulsanti WhatsApp chiamano il fisso) |
| **Dominio** definitivo | `index.html` → canonical, og:url, og:image, JSON-LD (`[DOMINIO]`) |
| Prezzo **menu fisso** pranzo/cena | sezione Menu + FAQ |
| **Menu completo** / PDF | sezione Menu |
| Nome del piatto di pesce in foto | carosello piatti |
| **Parcheggio** | Dove siamo + FAQ |
| **Storia** del locale | Il locale |
| Email `viavai00@gmail.com` (fonte 2021) | footer — verificare |
| Link Instagram / TikTok | footer |
| **P.IVA**, privacy & cookie policy | footer |
| **Foto proprie o autorizzate** | sostituire quelle prese da Google Maps |
| GA4 / Google Tag Manager | `<head>` — gli eventi (`book_*`, `call_*`, `directions_*`, `whatsapp_click`, `booking_request`) sono già inviati a `dataLayer` |

Da aggiornare periodicamente: voto e numero recensioni (hero + sezione Recensioni), orari se stagionali (`CONFIG.hours` + tabella + JSON-LD).
