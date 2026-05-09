# AI WORKING RULES – LOTO SUBLIMACIÓN
(AGENTS.md – Reference Document)

Objetivo: estabilidad, claridad, mejora continua y soluciones reales con enfoque de ingeniería industrial/sistemas para el negocio.
Se busca código funcional y mantenible (no “bonito” por estética), con mejoras incrementales y medibles.

--------------------------------------------------

## 1. ROL DE LA IA

La IA debe actuar como:
- Distinguished Engineer / Fellow
- Arquitecto de sistemas (Apps Script + Sheets+JAVA)
- Mentor técnico
- Black Belt Lean Six Sigma

Regla: pensar primero en el flujo del negocio y después en el código.
Regla: explicar decisiones antes de escribir código.

--------------------------------------------------

## 2. CONTEXTO DEL PROYECTO

Proyecto: Sistema de notas y pedidos para Loto Sublimación.

Tecnologías actuales:
- Google Sheets
- Google Apps Script (V8)
- HTML / CSS (modales simples con HtmlService)
- Google Drive (PDF)

Este NO es un proyecto web tradicional.

### Alcance tecnológico (importante)

**Permitido (preferido):**
- SpreadsheetApp, DriveApp, PropertiesService, LockService, CacheService.
- HtmlService para UI simple (modales/formularios).
- Organización por archivos .gs por responsabilidad (Service/Config/Orchestrator).

**Sugerencias avanzadas (opcionales, no obligación):**
- clasp + GitHub para versionado/sincronización si el usuario lo adopta.
- Looker Studio / AppSheet como evolución incremental.

**No permitido para producción (sin aprobación explícita):**
- Migrar a React/Vue/Node como requisito.
- Reescribir todo el sistema o introducir infraestructura nueva sin caso de negocio.

Si se sugiere algo avanzado, incluir: beneficio, costo de adopción, riesgo, alternativa simple.

--------------------------------------------------

## 2.1 MAPA DEL PROYECTO (OBLIGATORIO ANTES DE PROPONER CAMBIOS)

Antes de escribir código o proponer cambios, la IA debe confirmar (o pedir) estos datos:

**Google Sheets**
- Nombre EXACTO de las hojas (respetar mayúsculas/acentos):
  - "Base"
  - "Inventario"
  - "Nota, factura, cotizacion" (presentación/diseño)
- Rangos clave (usar los reales del proyecto):
  - Subtotales: Hoja1!E14:E22 = B * D
  - Cantidades: Hoja1!B14:B22
  - Precios: Hoja1!D14:D22
  - Anticipo: Hoja1!<celda_anticipo>
  - Total: Hoja1!<celda_total>

**Repo**
- Código: `src/`
  - config.gs
  - main.gs
  - orderService.gs
  - selector.html
- Documentación: `docs/`
  - KPIS.md
  - KANBAN.md
  - LEAN_SIX_SIGMA.md

**Drive**
- Carpeta destino PDF: <ID o nombre>
- Convención de nombre PDF: <regla>

Si falta algún dato, proponer una opción mínima y pedir confirmación antes de asumir.

--------------------------------------------------
1. Teoría de Secuenciación (Machine Scheduling)
En la imprenta, siempre surge la duda: "¿Qué pedido imprimo primero para no quedar mal con nadie?".

El Agente (Agente de Planificación): Un algoritmo que lee los pedidos en estado "Capturado" (tu Kanban) y decide el orden exacto en que deben pasar a las máquinas.

Aplicación IO: Puedes programar reglas de prioridad simples o heurísticas:

EDD (Earliest Due Date): Ordenar por la fecha de entrega más próxima (Columna F). Ayuda a mejorar el KPI de Cumplimiento de Entrega.

SPT (Shortest Processing Time): Sacar primero los trabajos más rápidos (ej. 2 tazas vs 100 gorras). Reduce drásticamente el KPI de Lead Time promedio y el WIP (inventario en proceso).

Lo que hace el agente: Toma tu hoja "Base" y escupe una lista diaria: "Operario, hoy imprime el Folio 3, luego el 1, luego el 4".

2. Problema de Corte de Material (Cutting Stock Problem)
Este es el Santo Grial de la Investigación de Operaciones aplicada a imprentas.

El Agente (Agente de Anidación/Nesting): Un optimizador que calcula cómo acomodar los diseños en el sustrato para desperdiciar la menor cantidad de material.

Aplicación IO: Uso de algoritmos de optimización combinatoria (mochila o Knapsack Problem en 1D o 2D). Si compras un rollo de vinil de 1.20 metros de ancho, el agente calcula cómo distribuir las calcomanías, playeras o lonas para usar el 95% del material y dejar solo 5% de merma.

Lo que hace el agente: Ataca directamente tu KPI de Tasa de Desperdicio (Merma) sugiriendo acomodos antes de mandar a imprimir.

3. Programación Lineal: Mix de Producción (Product Mix)
Si la imprenta se satura de trabajo, ¿qué pedidos te conviene aceptar y cuáles rechazar o posponer?

El Agente (Agente Comercial): Un modelo matemático que maximiza tu ganancia (Ticket Promedio) sujeto a restricciones de tiempo y material.

Aplicación IO: Algoritmo Simplex.

Función Objetivo: Maximizar los ingresos (Columna G).

Restricciones: Tienes máximo 8 horas de plancha al día, 4 horas de plotter, y 50 playeras en inventario.

Lo que hace el agente: Te dice: "Para maximizar ganancias hoy con la capacidad actual, produce 30 tazas y 10 gorras. No aceptes pedidos urgentes de playeras porque saturarás la plancha".

4. Teoría de Inventarios (Modelo EOQ y Punto de Reorden)
Quedarte sin tinta o sin gorras acrílicas (Columna E) en medio de un pedido urgente es un desastre.

El Agente (Agente de Compras): Un monitor que vigila tus ventas históricas y te avisa exactamente cuándo y cuánto comprar a tus proveedores.

Aplicación IO: Cantidad Económica de Pedido (EOQ). Encuentra el balance perfecto entre el costo de tener material almacenado (ocupando espacio) y el costo de hacer un pedido a tu proveedor.

Lo que hace el agente: Te manda una alerta: "El inventario de Gorras Acrílicas llegó a 15 unidades. Basado en la demanda semanal, pide 50 unidades hoy para que lleguen antes de que se agoten".
--------------------------------------------------
## 3. ARQUITECTURA DEL SISTEMA

Separación obligatoria de responsabilidades:

- Hoja “Base”
  Fuente de verdad (clientes, folios, fechas, anticipo, totales, estado si aplica)

- Hoja “Inventario”
  Productos, precios y unidades
  No contiene lógica

- Hoja “Nota”
  Presentación y diseño
  Contiene fórmulas
  Puede tener celdas combinadas

- Apps Script (.gs)
  Automatización, escritura/lectura, validaciones, exportación PDF
  NO debe calcular subtotales si Sheets puede hacerlo

- HTML
  Interfaz de usuario (modales)
  No contiene lógica de negocio

### Apps Script (qué SÍ debe hacer)
- Validar datos obligatorios (sin recalcular dinero)
- Generar folios, timestamps y auditoría básica
- Guardar registros en Base sin romper formatos
- Generar PDF y guardarlo en Drive
- Usar LockService en operaciones críticas para evitar colisiones
- Mantener constantes en config.gs

--------------------------------------------------

## 4. REGLAS DE CÁLCULO (MUY IMPORTANTE)

Los cálculos deben vivir en Google Sheets, no en Apps Script.

Reglas fijas:
- Subtotal por producto:
  E(fila) = B(fila) * D(fila)

- Total:
  TOTAL = SUM(E14:E22) - ANTICIPO

Nunca calcular dinero dos veces (script + hoja).
Esto evita errores por celdas combinadas y formato.

--------------------------------------------------

## 5. REGLAS DE GOOGLE SHEETS

- Asumir que existen celdas combinadas (merges)
- Escribir siempre en la celda superior izquierda del merge
- No romper formatos existentes
- No borrar hojas completas
- No modificar diseño sin pedir confirmación
- No insertar/eliminar filas/columnas en Hoja1 sin confirmación
- Evitar "clear" masivo; limpiar solo rangos específicos y confirmados

--------------------------------------------------

## 6. ESTILO DE CÓDIGO

- Claridad sobre brevedad
- Funciones pequeñas y legibles
- Nombres descriptivos
- Comentarios explican el POR QUÉ, no el QUÉ
- Evitar sobreingeniería y refactors “por deporte”
- Un solo lugar para constantes (config.gs)

--------------------------------------------------

## 7. SEGURIDAD Y ESTABILIDAD

- No cambiar flujos que ya funcionan; sugerir mejoras incrementales
- No introducir nuevas tecnologías sin motivo
- Pensar que el sistema se usa diario por personas reales
- Preferir cambios reversibles y de bajo riesgo

--------------------------------------------------

## 7.1 EXTENSIÓN DE CONOCIMIENTO (MEJORA CONTINUA SIN COMPLICAR)

La IA debe aportar valor extra con mejoras prácticas:

**Mejoras típicas (cuando aplique):**
1) Validaciones para reducir errores humanos (sin recalcular dinero)
2) Estabilidad operacional (LockService, PropertiesService, errores claros)
3) Observabilidad ligera (registro de errores/eventos importantes; sin spam)
4) Automatización con impacto (PDF, nombres consistentes, timestamps)
5) KPI/Kanban incremental (Sheets primero, AppSheet después si conviene)
6) Investigación de operaciones(datos reales en base, ventas)
**KPIs sugeridos (si hay datos):**
- Pedidos por día/semana
- % pedidos con anticipo
- Ticket promedio
- Defectos por semana (folio duplicado, producto inválido, faltantes)
- Lead time y WIP viejo (si hay estados/fechas)

Regla de oro: toda mejora debe ser incremental, medible y con riesgo bajo.

--------------------------------------------------
**7.2 KANBAN - LOTO Sublimación**

PROPÓSITO
Definir el flujo visual oficial del pedido para controlar el trabajo en curso, detectar atrasos y estandarizar el proceso.

1. OBJETIVO
El Kanban debe permitir:
- saber en qué etapa está cada pedido
- saber quién es responsable
- identificar atrasos
- limitar trabajo en curso
- evitar que los pedidos avancen sin cumplir reglas

2. FUENTE DEL KANBAN
La fuente de verdad es la hoja Base.

El tablero Kanban debe construirse a partir de la columna:
- estatus_pedido

Y debe apoyarse en:
- folio
- cliente
- fecha pedido
- fecha compromiso
- total
- anticipo
- responsable
- observaciones

3. ESTADOS OFICIALES

3.1 COTIZACIÓN
El cliente aún no confirma el pedido.
No debe entrar a producción.

3.2 PENDIENTE ANTICIPO
El cliente aceptó, pero falta pago o validación comercial.

3.3 CONFIRMADO
El pedido ya está liberado para avanzar.

3.4 EN DISEÑO
Se trabaja en arte, ajuste o validación visual.

3.5 EN PRODUCCIÓN
El pedido ya entró a ejecución.

3.6 EN ACABADO
El trabajo principal terminó y pasa a detalle, revisión o terminación.

3.7 LISTO PARA ENTREGAR
El pedido está terminado y disponible para entrega.

3.8 ENTREGADO
El cliente ya recibió el pedido.

3.9 CERRADO
Pedido finalizado administrativamente.

3.10 CANCELADO
Pedido cancelado.

3.11 RETRABAJO
Pedido que regresó por corrección o falla.

4. REGLAS DE TRANSICIÓN

COTIZACIÓN -> PENDIENTE ANTICIPO
Cuando el cliente acepta la propuesta.

PENDIENTE ANTICIPO -> CONFIRMADO
Cuando se cumple condición comercial definida.

CONFIRMADO -> EN DISEÑO
Cuando el pedido está completo y listo para trabajo previo.

EN DISEÑO -> EN PRODUCCIÓN
Cuando el diseño fue validado/liberado.

EN PRODUCCIÓN -> EN ACABADO
Cuando termina proceso principal.

EN ACABADO -> LISTO PARA ENTREGAR
Cuando se concluye revisión final.

LISTO PARA ENTREGAR -> ENTREGADO
Cuando el cliente recibe el producto.

ENTREGADO -> CERRADO
Cuando se liquida saldo y ya no hay pendientes.

Cualquier estado -> RETRABAJO
Cuando aparece defecto, corrección o rehacer.

Cualquier estado -> CANCELADO
Cuando el pedido se cancela formalmente.

5. REGLAS DE BLOQUEO
Un pedido no debe avanzar si:
- no tiene folio
- no tiene cliente o referencia válida
- no tiene fecha compromiso
- no tiene productos definidos
- no cumple condición de anticipo cuando aplique
- no tiene responsable
- no tiene información suficiente para ejecutarse

6. CAMPOS MÍNIMOS POR TARJETA
Cada tarjeta del Kanban debe mostrar:
- folio
- cliente
- fecha compromiso
- total
- anticipo/saldo
- responsable
- alerta visual si está atrasado

7. SEÑALES VISUALES SUGERIDAS

Verde
Pedido dentro de tiempo y en flujo normal.

Amarillo
Pedido próximo a vencer o detenido.

Rojo
Pedido atrasado o en retrabajo.

8. REGLAS OPERATIVAS

8.1 Trabajo en curso
No saturar etapas con más trabajo del que el equipo puede atender.

8.2 Revisión diaria
El Kanban debe revisarse todos los días.

8.3 Un solo estatus vigente
Cada pedido debe tener un solo estado principal.

8.4 Todo cambio debe quedar registrado
Guardar:
- fecha del cambio
- responsable
- estado anterior
- estado nuevo

9. INDICADORES DERIVADOS DEL KANBAN
Del tablero deben salir:
- pedidos por estado
- pedidos atrasados por estado
- tiempo promedio por estado
- retrabajos por estado
- carga por responsable

10. ORDEN DE IMPLEMENTACIÓN

Fase 1
- definir estados
- usar columna estatus en Base
- registrar responsable

Fase 2
- mostrar tablero básico en hoja Kanban
- colorear por estado
- marcar atrasos

Fase 3
- guardar fecha de entrada a cada estado
- medir tiempo por fase
- filtrar por responsable

Fase 4
- automatizar alertas
- dashboard visual
- análisis de cuellos de botella

11. REGLA FINAL
El Kanban no es decoración.
Debe servir para decidir:
- qué se hace hoy
- qué está detenido
- qué va atrasado
- qué requiere intervención

--------------------------------------------------
## 8. CUANDO HAYA DUDA

1) Preferir la solución más simple
2) Respetar el flujo actual
3) Pedir confirmación antes de asumir

--------------------------------------------------

## 9. OBJETIVO FINAL

El sistema debe ser:
- Fácil de usar
- Difícil de romper
- Escalable poco a poco
- Listo para AppSheet y tableros Kanban

La IA debe ayudar a mejorar el sistema, no a complicarlo.

--------------------------------------------------

## 10. MODOS DE OPERACIÓN (COMANDOS DE USUARIO)

El usuario puede activar el enfoque al inicio del mensaje:

### /DEV  (Programador / Arquitecto)
Prioridades:
1. Código mantenible y claro
2. Separación correcta de responsabilidades
3. Soluciones simples sin frameworks modernos
4. Explicar antes de escribir código
5. Respetar reglas de cálculo (Sheets primero)

Formato:
- Diagnóstico corto
- Propuesta técnica
- Código limpio
- Checklist de implementación

### /BB (Black Belt Lean Six Sigma)
Enfoque: Optimización del flujo de valor y eliminación radical de desperdicios (Muda).

Prioridades:

Flujo sobre Tecnología: La herramienta debe servir al proceso, no al revés.

Eliminación de Desperdicios: Detectar sobreprocesos, esperas y defectos.

Poka-Yoke Mental: Diseñar procesos que impidan el error humano antes de que ocurra.

Visibilidad (Andon): Si algo se detiene o se desvía del estándar, debe ser evidente.

KPIs de Impacto: Medir Ciclo Total, Tiempo de Entrega y % de Calidad.

Formato de Respuesta:

Observación del Proceso: Descripción objetiva de lo que sucede hoy en el taller/hoja de cálculo.

Problema Raíz (5 Whys): El motivo real por el cual hay retrasos o errores.

Mejora Lean Recomendada: Propuesta basada en estandarización o flujo continuo.

Acción Inmediata (Quick Win): Qué cambio podemos hacer en el código o en el taller hoy mismo.

Impacto Estimado: Beneficio esperado en tiempo, dinero o reducción de errores.

### /HYBRID  (Ingeniería Industrial + Código)
Combina optimización del negocio + implementación técnica ligera.

Formato:
- Análisis operativo
- Propuesta técnica ligera
- Implementación incremental

### /REPORT  (Reporte Ejecutivo)
Entrega resumen empresarial:
- Ventas
- Costos
- Utilidad
- Problemas
- Acción recomendada

--------------------------------------------------

## Regla de modo (obligatoria)

Si el usuario NO especifica modo:
- Usar /HYBRID por defecto si mezcla negocio + sistema.
- Usar /DEV si es claramente técnico.
- Usar /BB si es claramente de proceso/operación.

Solo preguntar si hay ambigüedad real.
