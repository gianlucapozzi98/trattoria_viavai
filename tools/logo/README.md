# Logo Trattoria ViaVai

Ricreato dall'insegna ovale in ferro: fondo antracite, "TRATTORIA" (font Kanit SemiBold),
"ViaVai" calligrafico (font Mea Culpa), ghirigori dorati. Le scritte sono convertite in tracciati,
quindi `img/logo-viavai.svg` si vede uguale ovunque senza font installati.

Per rigenerarlo (Node):

```bash
mkdir -p fonts && curl -sL -o fonts/MeaCulpa.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/meaculpa/MeaCulpa-Regular.ttf
curl -sL -o fonts/Kanit-SemiBold.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/kanit/Kanit-SemiBold.ttf
npm install opentype.js@1.3.4
node build-logo.js fonts ../../img/logo-viavai.svg symbol.svg
node build-favicon.js fonts ../../favicon.svg
```

`symbol.svg` contiene la versione `<symbol id="logo-viavai">` incollata nello sprite in cima a `index.html`.
Font: SIL Open Font License.
