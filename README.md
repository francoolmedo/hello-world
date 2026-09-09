# 🐾 Pet Pals — mascota virtual

Juego de mascota virtual **original**, inspirado en el género de juegos tipo
Pet Society. Cuidás a tu mascota, la alimentás, la bañás, jugás con ella,
ganás monedas y decorás su habitación. Todo el arte y el código son propios.

> Nota: este es un juego original con personajes, arte, código y música
> propios. No contiene assets del juego Pet Society de Playfish/EA.

## Cómo jugar

Es 100% local, no necesita servidor ni instalación. Abrí el archivo
`index.html` en cualquier navegador moderno:

```
# opción 1: doble clic en index.html

# opción 2: servirlo localmente
python3 -m http.server 8000
# y abrir http://localhost:8000
```

## Características

- 🐱 Adoptá y personalizá tu mascota (especie, color y nombre).
- 🍽️ **Estados en tiempo real**: hambre, felicidad, higiene y energía que
  bajan con el paso del tiempo, incluso con el juego cerrado.
- 🍎 **Acciones**: comer, jugar, bañar, dormir y hacer mimos.
- 🛍️ **Tienda** con comida, juguetes y muebles.
- 🪴 **Decoración** de la habitación.
- 🎾 **Mini-juego** para ganar monedas.
- ⭐ **Niveles y XP**, más un bono diario.
- 😊 La cara de la mascota cambia según su humor.
- 💾 **Guardado automático** en el navegador (localStorage).

## Estructura

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura de la interfaz |
| `style.css`  | Estética pastel y animaciones |
| `game.js`    | Toda la lógica y el dibujo de la mascota (SVG) |

¡Divertite cuidando a tu Pet Pal! 💚
