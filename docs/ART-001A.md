# ART-001A — sprite base de RetroBoy

## Estado

- La rama local `feat/art-001-retroboy-sprites` ya tenía cambios sin commit antes de este trabajo. Se conservaron.
- `docs/public/image.png` es una lámina de concepto de 1536×1024 con fondo, rótulos y poses a distintas escalas. No es un spritesheet recortable.
- No se encontró un spritesheet auténtico en el repositorio. `retroboy-animations.ts` describe 14 fotogramas esperados, pero no hay una textura `retroboy-sheet` que los aporte.
- Se agregaron dos PNG con transparencia: `public/assets/retroboy/idle.png` (32×48) y `public/assets/retroboy/crouch.png` (32×26). Ambos derivan visualmente del concepto aprobado.
- `BootScene` precarga esas imágenes bajo las claves existentes. `RetroBoy.ts` y sus parámetros de física no se cambiaron en ART-001A: cuerpo normal 20×44, agachado 20×22.
- Las poses de walk, run, jump, fall y land siguen usando la imagen de pie. No se declara una animación donde solo hay una pose estática.

## Verificación

- `npm run build`: correcto con Node 22.22.2. Vite informa únicamente una advertencia de tamaño del paquete de Phaser.
- `git diff --check`: correcto.
- Servidor Vite: ambos PNG devuelven HTTP 200 con `image/png`.
- Revisión visual en Brave: RetroBoy aparece con el arte nuevo en World 01 Power Factory, en el suelo y sin cambio visible de posición del personaje.
- Playwright no pudo iniciar Chromium en esta sesión de macOS por `MachPortRendezvousServer: Permission denied`. La prueba de teclado para agacharse no produjo evidencia concluyente; revisar manualmente.

## QA humano

1. Abrir el juego y comprobar las poses de pie y agachado (`S` o flecha abajo), incluida la alineación de los pies.
2. Caminar con `A/D`, correr con `Shift`, saltar con `Espacio` y cambiar de dirección. Confirmar que no hay recortes, temblores ni alteración de colisiones.
3. Probar el techo bajo: agacharse debajo y verificar que no se levanta hasta tener espacio.
4. Decidir si el detalle a 32×48 y la lectura de la mochila/audífonos coinciden con el concepto.
5. Revisar el arte a escala de juego antes de iniciar el siguiente sprint de animación.

## Evolución después de ART-001A

- **ART-001B:** incorporó doble salto y poses estáticas de subida, segundo impulso y caída. El detalle está en `docs/ART-001B.md`.
- **Próximo sprint:** dibujar fotogramas coherentes de idle, walk y run, con una línea de pies y origen comunes; después completar las transiciones aéreas y de aterrizaje sobre un spritesheet auténtico.
