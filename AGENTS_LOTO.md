

AGENTES Y MEJORA CONTINUA – LOTO Sublimación

Este archivo sirve como guía operativa para orientar a la inteligencia artificial (IA) a partir de los principios de **Lean Six Sigma**, **TPS**, **investigación de operaciones** e **ingeniería industrial**. El objetivo no es solo capturar datos, sino usar esos datos para mejorar los procesos del negocio, tomar decisiones y evolucionar hacia un sistema de gestión operativa completo.

---

1. Propósito

* Convertir el sistema de notas y pedidos en un **sistema de control operativo** para LOTO Sublimación.
* Pasar de la automatización básica de notas/facturas/cotizaciones a **control de flujo, indicadores y mejora continua**.
* Guiar a la IA para que proponga mejoras prácticas y medidas de desempeño, en lugar de centrarse únicamente en arquitectura de código.

---

2. Principios de decisión

La IA debe priorizar las propuestas que:
1. Reducen errores de captura y procesamiento.
2. Reducen tiempos de ciclo y esperas.
3. Mejoran la visibilidad del flujo (estatus y Kanban).
4. Permiten medir el proceso con indicadores claros.
5. Eliminan retrabajo y variación.
6. Son viables para una microempresa.

Si una mejora no contribuye a al menos uno de estos puntos, no es prioridad.

---

3. Contexto

El proyecto utiliza Google Sheets, Apps Script y HTML para capturar pedidos, guardar datos en la hoja **Base**, consultar precios en **Inventario** y generar salidas en **Nota**. La IA debe entender que:

* **Base** es la fuente de verdad y debe ampliarse para contener estatus del pedido, fechas reales, responsable, etc.
* **Inventario** almacena productos y precios; no tiene lógica de negocio.
* **Nota** es la salida para notas, facturas o cotizaciones.
* Apps Script automatiza lectura, escritura y exportación, pero **no debe duplicar cálculos** que ya están en Sheets.

---

4. Priorizaciones tras el primer paso

Ya se logró el primer paso: capturar datos de clientes y pedidos y generar notas/facturas/cotizaciones. A partir de aquí, el enfoque debe estar en:

### 4.1 Control de estatus (Kanban)

* Definir una lista oficial de estados del pedido (p. ej., `COTIZACIÓN`, `PENDIENTE ANTICIPO`, `CONFIRMADO`, `EN DISEÑO`, `EN PRODUCCIÓN`, `EN ACABADO`, `LISTO PARA ENTREGAR`, `ENTREGADO`, `CERRADO`, `RETRABAJO`).
* Añadir una columna **Estatus** en la hoja **Base** y actualizarla según avanza el pedido.
* Registrar **fecha de cambio de estado** y **responsable** para cada transición.
* Crear una hoja **Kanban** (o un tablero en AppSheet) que muestre las órdenes en columnas por estatus y permita moverlas solo a través de transiciones válidas.

### 4.2 Indicadores (KPIs)

* Añadir columnas en **Base** para **fecha real de entrega**, **anticipo**, **saldo** y **total**.
* Medir indicadores básicos:
  * Pedidos por día/semana/mes.
  * Pedidos confirmados vs. cotizaciones.
  * Pedidos en proceso y atrasados.
  * Tiempo promedio desde captura hasta entrega y por fase.
  * % de pedidos con error (captura incompleta, folios duplicados, retrabajos).
  * Ventas totales, ticket promedio y anticipo promedio.
* Usar tablas dinámicas o “pivot tables” en Sheets para calcular estos KPIs y, más adelante, mostrar gráficas en un dashboard (Looker Studio o AppSheet).

### 4.3 Reglas de transición y validaciones

* Definir reglas para cada cambio de estatus. Por ejemplo, un pedido no puede pasar a `EN PRODUCCIÓN` si no está `CONFIRMADO` y no tiene anticipo.
* Implementar validaciones en Apps Script o en el formulario de captura para evitar que falten datos críticos (cliente, fecha de entrega, productos, anticipo, etc.).
* Registrar cada error o retrabajo en **Base** para medir defectos.

### 4.4 Tableros

* **Tablero de gestión diaria**: mostrar pedidos de hoy, pedidos por entregar, pedidos atrasados y cotizaciones sin seguimiento.
* **Tablero Kanban**: visualizar el flujo en tiempo real.
* **Tablero ejecutivo**: ventas, ticket promedio, top productos/clientes, defectos administrativos y retrabajos.

---

5. Modo de operación de la IA

La IA debe comportarse según el modo de operación indicado:

* **/DEV**: responder con soluciones técnicas en Apps Script y Sheets.
* **/BB**: responder como Black Belt de Lean Six Sigma y consultor de mejora continua, proponiendo mejoras operativas, indicadores y acciones.
* **/HYBRID**: combinar optimización del negocio con implementación técnica mínima viable.
* **/REPORT**: generar resúmenes de ventas, operación y problemas.
* Si el usuario no especifica modo, usar un default apropiado según la pregunta.

---

6. Recomendaciones para aplicar en la otra repo

Cuando traslades estas ideas a la otra repositorio de código (ARQ de código), ten en cuenta:

1. **Mantén la separación** entre lógica de negocio y presentación (Apps Script vs. Sheets). No mezcles cálculos en el script si la hoja puede hacerlo.
2. **Usa nomenclaturas consistentes** para nombres de variables, funciones y rangos (por ejemplo, `SHEET_BASE`, `COL_STATUS`).
3. **Implementa módulos** para:
   * Gestión de estados y validaciones.
   * Cálculo y actualización de indicadores.
   * Generación de tableros (usando pivot tables o endpoints para un dashboard externo).
4. **Utiliza triggers** de Apps Script (onEdit, onFormSubmit o triggers programados) para actualizar estatus e indicadores en tiempo real o en lotes.
5. **Documenta** cada función y especifica qué hace, qué recibe y qué devuelve, siguiendo las buenas prácticas definidas en este documento.
6. **Versiona** los cambios y prueba con casos de ejemplo antes de migrar a producción.

---

7. Objetivo final

El objetivo final del proyecto es convertir la automatización de notas en un **sistema de gestión operativa y mejora continua** que permita a LOTO Sublimación:

* Controlar el flujo de trabajo en tiempo real.
* Medir desempeño con indicadores claros y accionables.
* Detectar y eliminar desperdicios, errores y cuellos de botella.
* Tomar decisiones de negocio basadas en datos.
* Mejorar continuamente el proceso y la satisfacción del cliente.

---

8. Conclusión

Esta guía te orienta sobre cómo priorizar los próximos pasos. Primero controla el **estatus** y el **Kanban**, luego establece y visualiza **KPIs**, después mejora el flujo con DMAIC y, finalmente, automatiza alertas y dashboards para apoyar la toma de decisiones. Aplica estas ideas en tu repositorio de arquitectura de código siguiendo las buenas prácticas y principios descritos aquí.