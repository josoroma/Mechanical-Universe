# Episodio 9 · Movimiento circular

Una figura interactiva de sobremesa, con dos experimentos en un mismo instrumento: un péndulo cónico sobre una plataforma giratoria y una masa unida al centro de esa plataforma por un hilo horizontal. El movimiento circular de la masa es el sujeto; una esfera graduada representa la fuerza hacia el centro. Alcance: figura detallada de unas 60 piezas, SVG autónomo, temas claro y oscuro, sin WebGL ni vista desmontada.

## Piezas previstas antes de la geometría

- Base de madera con moldura, tapa esmaltada, cuatro patas regulables, tornillos de esquina y una única placa grabada.
- Plataforma: pedestal, husillo, plato de latón, cara esmaltada, anillos y divisiones radiales grabadas, cubo central y testigo de giro.
- Péndulo: columna exterior al plato, casquillos, abrazadera, brazo superior, suspensión articulada, hilo tenso y esfera metálica.
- Masa de plataforma: pequeño cilindro que apoya sobre el plato, hilo radial que termina sobre su superficie y el cubo central.
- Indicador de fuerza: soporte, caja moleteada, aro, esfera, graduaciones, aguja y pivote.

Las piezas fijas se generan una vez. La esfera se traslada; los extremos del hilo determinan un cilindro delgado que cambia de orientación. Las líneas del plato giran según el mismo ángulo que la masa. El orden de pintura se recalcula desde las superficies reales mediante planos separadores. Las esferas tienen soporte analítico exacto; las cajas solo sirven para descartar pares lejanos, nunca para representar el volumen auditado.

## Verdad física e interacción

Péndulo ideal en régimen circular estacionario: longitud efectiva L = 1 m, g = 9,81 m/s² y ángulo θ entre 10° y 65° respecto a la vertical. r = L sen θ; ω² = g/(L cos θ); T = mg/cos θ; F_c = T sen θ = mω²r. Al cambiar un ajuste se prepara un nuevo régimen; no se simula el transitorio de un péndulo esférico. Pausar congela la representación, no retira la fuerza.

En la plataforma se ajustan por separado r entre 0,15 y 0,85 m y el giro entre 0 y 60 rpm; un hilo horizontal ideal ejerce T = F_c = mω²r. El peso se compensa con la normal. La masa se interpreta como puntual; el tamaño del cuerpo está ampliado y no representa su masa. Se omiten rozamiento, resistencia del aire y límites del material. En el modo péndulo, la plataforma es una referencia visual sincronizada y no impulsa la esfera.

Dos controles comparativos prueban F_c proporcional a m y a ω² manteniendo el radio fijo en la plataforma. Un diagrama matemático exterior al dibujo explica la dirección tangencial de la velocidad y la dirección central de la fuerza, sin añadir otra fuerza a la tensión. Lecturas y movimiento parten de un único módulo puro.

## Verificación prevista

Pruebas de equilibrio, perpendicularidad, aceleración por derivada de velocidad, períodos y relaciones de proporcionalidad. Auditoría completa de contactos, apoyos y profundidad en ambos experimentos, en los extremos y varias fases; barrido adicional del orden en una vuelta completa. Revisión de líneas en ambos temas, móvil de 390 px, teclado, puntero, animación, pausa al ocultarse y movimiento reducido; capturas generales y detalles a 4×.
