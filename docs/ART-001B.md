# ART-001B — doble salto y poses en el aire

## Cambios

- Espacio da un primer impulso desde el suelo o dentro del tiempo de coyote. Una nueva pulsación en el aire da un segundo impulso de velocidad vertical `-480` (el primero usa `-520`). El segundo se recarga al tocar suelo.
- Se conservan el salto variable, el buffer de salto, el movimiento horizontal, la física y las hitboxes existentes (20×44 de pie y 20×22 agachado).
- Se cargan sprites transparentes de 32×48 para subida, segundo impulso y caída. El cambio de pose sigue el estado de movimiento; todavía no es una animación de varios fotogramas por fase.
- La pose agachada ahora usa `crouch-v2.png` (32×26) para mejorar algo la lectura. La versión anterior permanece disponible como `crouch.png`.
- El texto de depuración muestra `JUMPS: 0/2`, `1/2` o `2/2` durante la prueba.

## Verificación

- `npm run build` con Node 22.22.2 y `git diff --check`: correctos en la repetición local previa al push.
- Los cinco PNG utilizados por el juego responden HTTP 200 como `image/png`.
- En el navegador se capturaron el primer salto (`JUMPS: 1/2`), el segundo impulso (`JUMPS: 2/2`, pose distinta), la caída y la nueva pose agachada. La repetición local también mostró `JUMPS: 2/2` en el aire.
- El intento automatizado de comprobar una tercera pulsación no fue concluyente por el tiempo de captura. El código consume la disponibilidad del salto aéreo al usarlo; confirmar manualmente que no hay tercer impulso antes de aterrizar.

## QA humano pendiente

1. En `http://127.0.0.1:5180/`, pulsar Espacio dos veces separadas durante el vuelo; confirmar que se siente bien la altura del segundo impulso y que no existe un tercero.
2. Probar salto corto y largo, salto desde el borde, aterrizaje en plataformas, cambio de dirección y agacharse bajo el techo. Confirmar que pies y colisiones siguen alineados.
3. Revisar si `crouch-v2.png` se entiende mejor que `crouch.png` a tamaño de juego. Si aún se pierde la forma, hacer una pasada de arte con silueta más simple o resolución visual mayor sin cambiar la caja de colisión.

## Próximo sprint sugerido

- Crear fotogramas coherentes por fase, empezando por idle/walk y luego por subida, segundo impulso, caída y aterrizaje. Integrar un spritesheet auténtico con origen y dimensiones comunes. Mantener por separado el ajuste de resolución visual para comparar legibilidad antes de modificar el render.

El usuario aprobó commit y push de ART-001 después de repetir la prueba local. El siguiente sprint propuesto es un ciclo de carrera caricaturesco con brazos extendidos y pies abiertos en abanico, dibujado en fotogramas coherentes.
