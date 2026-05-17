# Guía de personalización DiarioOS
> Abre el archivo `.html` en VS Code y usa `Ctrl+F` para buscar los términos marcados con 🔍

---

## 🎵 1. Añadir canciones

Las canciones se declaran en el array `tracks`. Busca:

```
🔍 Busca: let tracks = [];
```

Tienes dos opciones:

### Opción A — Archivos locales (mp3 en la misma carpeta)
Pon tus `.mp3` en una carpeta `/audio/` junto al `.html` y carga las pistas así:

```js
// Sustituye: let tracks = [];
// Por esto (añade tantas como quieras):
let tracks = [
  { name: "Nombre que aparece en pantalla", url: "audio/cancion1.mp3" },
  { name: "Otra canción",                   url: "audio/cancion2.mp3" },
  { name: "La tercera",                     url: "audio/cancion3.mp3" },
];
```

Después busca `loadAudioFiles` y elimina también el bloque del botón de subida si no lo necesitas (el `<div class="ipod-upload">` en el HTML).

### Opción B — URL externa (SoundCloud, archivo en servidor, etc.)
```js
let tracks = [
  { name: "Mi canción favorita", url: "https://tu-servidor.com/cancion.mp3" },
];
```

> ⚠️ El archivo debe ser accesible públicamente y el servidor debe permitir CORS.

---

## ✍️ 2. Modificar / añadir escritos

Busca la función `samples()`:

```
🔍 Busca: function samples()
```

Cada entrada tiene este formato:

```js
{
  id: 1,                     // número único, no repitas IDs
  title: "El título",
  date: "2024-03-15",        // formato YYYY-MM-DD
  body: "El texto completo del escrito.\nPuedes usar \n para saltos de línea."
},
```

Ejemplo con más entradas:

```js
function samples() {
  return [
    {
      id: 1,
      title: "El primer día",
      date: "2024-01-15",
      body: "Hoy decidí empezar este diario..."
    },
    {
      id: 2,
      title: "Sobre el silencio",
      date: "2024-02-03",
      body: "El silencio no es la ausencia de sonido..."
    },
    // añade aquí más objetos
  ];
}
```

> 💡 Los escritos se ordenan automáticamente por fecha, de más reciente a más antiguo. El calendario marcará los días que tengan entrada.

---

## 🖼️ 3. Añadir una ventana de fotos / galería

En el HTML, añade un nuevo icono en el escritorio (elige posición libre):

```html
<!-- Icono escritorio: Galería -->
<div class="dsk-icon" style="top:380px;left:55px" onclick="openWin('win-gallery')">
  <div class="dsk-icon-img">🖼️</div>
  <span class="dsk-icon-lbl">Galería</span>
</div>
```

Añade también en el dock:
```html
<div class="dicon" onclick="openWin('win-gallery')">
  <div class="dicon-em">🖼️</div>
  <span class="dicon-lbl">Galería</span>
</div>
```

Añade la ventana (antes del `<!-- DOCK -->`):
```html
<div class="win" id="win-gallery" style="width:420px;height:420px;top:80px;left:200px;">
  <div class="wbar">
    <div class="wdot r" onclick="closeWin('win-gallery')"></div>
    <div class="wdot y"></div>
    <div class="wdot g"></div>
    <span class="wtitle">🖼️ Galería</span>
  </div>
  <div class="wbody" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">

    <!-- ─────────────────────────────────────────
         FOTOS: duplica estos bloques para añadir.
         Pon tus imágenes en una carpeta /fotos/
         ───────────────────────────────────────── -->
    <img src="fotos/foto1.jpg" style="width:100%;border-radius:6px;object-fit:cover;aspect-ratio:1;cursor:pointer"/>
    <img src="fotos/foto2.jpg" style="width:100%;border-radius:6px;object-fit:cover;aspect-ratio:1;cursor:pointer"/>
    <img src="fotos/foto3.jpg" style="width:100%;border-radius:6px;object-fit:cover;aspect-ratio:1;cursor:pointer"/>
    <img src="fotos/foto4.jpg" style="width:100%;border-radius:6px;object-fit:cover;aspect-ratio:1;cursor:pointer"/>

  </div>
  <div class="wresize"></div>
</div>
```

---

## 🌄 4. Cambiar el fondo del escritorio

Busca:
```
🔍 Busca: background:radial-gradient
```

### Opción A — Color / degradado
Cambia los colores del gradiente:
```css
background: radial-gradient(ellipse at 30% 40%, #2a1f10 0%, #0e0e12 60%, #05050a 100%);
/* Puedes probar con tonos más fríos, verdes, azules, etc. */
```

### Opción B — Imagen de fondo
```css
/* Sustituye la línea de background por: */
background: url('fotos/fondo.jpg') center center / cover no-repeat fixed;
```

Para oscurecer la imagen y que el texto se lea bien, añade también esto justo después:
```css
/* dentro de #desktop::before, cambia opacity a un valor mayor */
opacity: .5;  /* más alto = más oscuro */
```

---

## 💜 5. Cambiar la estética del Muro MySpace

### Colores principales
Busca:
```
🔍 Busca: --ms-blue / --ms-pink / --ms-bg
```
```css
--ms-blue: #003399;   /* color del título y bordes */
--ms-pink: #ff69b4;   /* color del borde de las notas */
--ms-bg:   #e8d5f0;   /* fondo general del muro */
```
Puedes cambiarlos a cualquier color. Ejemplo temática oscura:
```css
--ms-blue: #9900cc;
--ms-pink: #ff00aa;
--ms-bg:   #1a001f;
```

### Texto del título
Busca:
```
🔍 Busca: ¡Deja tu huella!
```
```html
<div class="wall-h">✨ ¡Deja tu huella! ✨</div>
<div class="wall-sub">— firma el muro y deja un mensaje 4ever —</div>
```
Cambia los textos a lo que quieras.

### Fuente del muro
Busca todas las ocurrencias de:
```
🔍 Busca: Comic Sans MS
```
Puedes sustituirla por cualquier fuente de Google Fonts. Por ejemplo, para añadir `Pacifico`:
```html
<!-- En el <head>, después del link de Google Fonts existente: -->
<link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet"/>
```
Y luego reemplaza `'Comic Sans MS'` por `'Pacifico'`.

### Patrón de fondo del muro
Busca:
```
🔍 Busca: background-image:radial-gradient(circle
```
Puedes cambiarlo a rayas, cuadros, puntos más grandes, etc.:
```css
/* Rayas diagonales */
background-image: repeating-linear-gradient(
  45deg, transparent, transparent 8px,
  rgba(153,0,204,.15) 8px, rgba(153,0,204,.15) 10px
);
```

---

## 🎨 6. Cambiar iconos por imágenes propias

Crea una carpeta `/iconos/` junto al `.html`.

Busca en el código:
```
🔍 Busca: IMAGEN:
```
Aparecerá un comentario en cada icono. Sustituye el emoji así:

```html
<!-- ANTES (emoji): -->
<div class="dsk-icon-img">📖</div>

<!-- DESPUÉS (imagen propia): -->
<div class="dsk-icon-img">
  <img src="iconos/escritos.png"
       style="width:48px;height:48px;border-radius:10px;object-fit:cover"/>
</div>
```

Para los iconos del dock (más pequeños):
```html
<!-- ANTES: -->
<div class="dicon-em">📖</div>

<!-- DESPUÉS: -->
<div class="dicon-em">
  <img src="iconos/escritos.png"
       style="width:36px;height:36px;border-radius:8px;object-fit:cover"/>
</div>
```
