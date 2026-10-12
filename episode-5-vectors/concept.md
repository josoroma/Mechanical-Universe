# Episodio 5 · Vectores

## Concepto y alcance, antes de la geometría

Una máquina de sobremesa suma dos vectores: cuatro brazos deslizantes cierran un paralelogramo y una cinta diagonal señala la resultante. Los lados opuestos conservan la misma longitud y orientación. Dos cursores del frontal miden las componentes de la suma. Alcance: una ilustración principal detallada, con unas 90 piezas, autónoma e interactiva, en español y coherente con la serie.

## Piezas previstas

- Bancada cuadrada de nogal entre placas de latón y esmalte verde; cuatro patas con collar y zapata, tornillos de esquina y una única placa grabada «VECTORES · V».
- Cuatro tramos de reglas ortogonales, interrumpidos por el pivote central, con marcas ancladas a sus bordes.
- Pivote central con pedestal y separadores escalonados que soportan los brazos sin interpenetraciones.
- Cuatro brazos telescópicos: guía inferior, dos paredes laterales, corredera de acero y tornillos de sujeción. Las piezas mantienen longitudes constantes; cambia cuánto sobresale la corredera.
- Articulaciones en los extremos de A, B y R; separadores y mandos moleteados que mantienen los brazos en planos paralelos.
- Cinta diagonal de acero, carrete central, terminal con punta y tornillo. Su longitud visible reproduce el módulo de R; su orientación reproduce el argumento de R.
- Dos módulos de lectura frontal con caja, escala de marfil, tornillos y cursor deslizante. Izquierda: Rₓ; derecha: Rᵧ.

## Modelo matemático y límites del instrumento

Los vectores son libres en el plano: A = a(cos α, sen α), B = b(cos(α + β), sen(α + β)) y R = A + B. Los centros de las cuatro articulaciones son O, A, B y R. Una unidad matemática equivale a 60 unidades del mundo. Las componentes se suman algebraicamente; el módulo es hypot(Rₓ, Rᵧ) y el ángulo se calcula con atan2. Las alturas de los brazos solo separan piezas; no añaden una componente vertical.

Las correderas permiten módulos de 1,5 a 2,5 unidades. La abertura β está limitada a 30°–150° para que los separadores no choquen con los brazos. La orientación común α puede girar 360°. La suma matemática también admite vectores nulos y colineales; se explica este alcance en el texto, sin fingir que la máquina atraviesa sus topes. El modelo puro contempla los casos nulos para verificarlos.

## Interacción

Tres lecturas de un mismo mecanismo: paralelogramo, recorrido A seguido de B y recorrido B seguido de A. Los controles cambian los módulos, la orientación común y la abertura. Casos preparados: perpendiculares, refuerzo, oposición parcial y componentes negativas. La tabla de componentes, el módulo, la dirección y la geometría comparten el mismo modelo. Un recorrido automático gira y abre el mecanismo; al cambiar parámetros, arrastrar o elegir una lectura, pasa al control manual. Arrastre horizontal para abrir/cerrar; teclado, control de velocidad, pausa y reinicio. Movimiento reducido con avance manual; pausa al ocultar la pestaña o salir de pantalla.

## Verificación prevista

Pruebas independientes de componentes, cierre, paralelismo, módulo por ley del coseno, conmutatividad, rotación, cancelación y ángulo del vector nulo. Auditoría de sólidos reales en orientaciones y extensiones extremas. Orden de pintura calculado mediante planos separadores entre las extrusiones reales, comprobado con la auditoría de profundidad. Capturas de escritorio, teléfono de 390 px, estados y uniones a 4× en ambos temas; revisión de cada PNG y comprobación de extremos de líneas a cero.
