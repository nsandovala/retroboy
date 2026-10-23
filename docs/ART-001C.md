# ART-001C — ciclo de carrera «Correcaminos»

## Alcance

- Se creó `public/assets/retroboy/run-cycle.png`, un spritesheet transparente de 4 fotogramas de 64×48 px. Alterna zancadas largas con pasos aéreos; conserva gorro, audífonos, chaqueta, mochila, jeans y zapatillas del sprite aprobado.
- El mismo ciclo se reproduce al caminar con `A/D` o flechas (10 fotogramas por segundo) y al correr con `Shift` + dirección (14 fotogramas por segundo). El sprite se invierte hacia la izquierda. Este ajuste ligero del ritmo se hizo tras la revisión visual del usuario; la velocidad de desplazamiento no cambió.
- El dibujo de carrera es más ancho para mostrar brazos y piernas extendidos. El cuerpo físico conserva 20×44 px de pie y 20×22 px agachado; se centra el offset al cambiar de textura.
- Al invertir la dirección en el suelo desde una velocidad horizontal visible, se muestra `turn.png` (40×48 px) durante al menos 150 ms y mientras la velocidad todavía apunta hacia el lado anterior. La pose compacta evita invertir de golpe una zancada ancha. El cuerpo físico permanece 20×44 px.
- Idle, jump, double jump, fall y crouch mantienen sus poses anteriores. Walk reutiliza el ciclo de carrera a menor velocidad; aún no tiene un ciclo de caminata propio.
- No se añadieron paquetes, sistemas, enemigos ni niveles.

## Verificación local

- `npm run build` con Node 22.22.2 y `git diff --check`: correctos. Vite solo muestra la advertencia existente por tamaño de paquete.
- En World 01 se observó `STATE: walk` con `D` y `A` sin `Shift`, con el ciclo visible en ambos sentidos; también se observó `STATE: run` y `VX: 210` con `Shift` + `D`.
- Se reinició el servidor local del puerto 5182 para que sirviera el código actualizado; antes seguía entregando la versión que solo animaba `run`.
- Después de correr, se observó la pose de caída y se comprobó el estado agachado con pies alineados al suelo.
- La revisión del usuario detectó un giro brusco entre zancadas espejadas; se agregó un fotograma de frenado para esa transición.

## QA humano para revisar el PR

1. En local, mantener `D` y luego `A` sin `Shift`; después repetir con `Shift`. Comprobar los dos ritmos y la lectura de brazos, piernas y mochila.
2. Alternar rápidamente `A` y `D` con y sin `Shift`; comprobar que la nueva pose de giro aparece sin borrar la silueta ni desplazar el centro. Luego probar salto, doble salto, aterrizaje, parada y agachado.
3. Comprobar plataformas y techo bajo para validar que la caja de colisión conserva su comportamiento.
4. Decidir si las zancadas necesitan más apertura o una alternancia más marcada entre pierna izquierda y derecha.

El usuario aprobó el flujo visual, pidió un pequeño aumento de ritmo y después aprobó preparar el PR. El giro con la nueva pose y las colisiones cerca de plataformas y techos aún requieren revisión humana durante el PR. No se realiza merge en este sprint.
