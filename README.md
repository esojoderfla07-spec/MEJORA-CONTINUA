# LOTO Sublimación – Sistema de notas y pedidos

Sistema operativo para capturar pedidos en Google Sheets, guardar la información en la hoja **Base**, consultar precios desde **Inventario**, y generar/exportar PDF a Google Drive.  
Este proyecto usa **Google Apps Script + Google Sheets + HTML (HtmlService)**. No es una app web tradicional.

---

## Flujo del negocio (resumen)
1. Usuario captura un pedido en **Nota** (pantalla/formato).
2. Sheets calcula subtotales y total (Sheets-first).
3. Apps Script valida y guarda datos en **Base**.
4. (Opcional) Apps Script genera PDF y lo guarda en Drive.

---

## Arquitectura (responsabilidades)
- **Hoja "Base"**: fuente de verdad (clientes, folios, fechas, anticipo, totales).
- **Hoja "Inventario"**: productos, precios y unidades (sin lógica).
- **Hoja "Nota"**: presentación/diseño + fórmulas (puede tener celdas combinadas).
- **Apps Script (.gs)**: automatización (lectura/escritura, folios, PDF). No calcula dinero.
- **HTML**: UI (modales). Sin lógica de negocio.

---

## Reglas de cálculo (Sheets primero)
- Subtotal por producto: `E(fila) = B(fila) * D(fila)`
- Total: `TOTAL = SUM(E14:E22) - ANTICIPO`
> Apps Script **no recalcula** montos si Sheets ya lo hace.

---

## Estructura del repo
- `src/config.gs` – Constantes (nombres de hojas, rangos, IDs).
- `src/main.gs` – Entry points / menú / orquestación.
- `src/orderService.gs` – Lectura/escritura a Sheets + guardado en Base.
- `src/selector.html` – UI (HtmlService).

- `AGENTS.md` – Reglas de trabajo para la IA (rol, modos /DEV /BB /HYBRID).

---

## Configuración (pendiente / a completar)
Completar estos valores según tu entorno:

- Spreadsheet:
  - ID: `1etc3SRm8KMpCyXXWuCYJHJvXkqX7xfLCHLTwgG-evBI/edit?gid=917277036#gid=917277036`
  - Hojas: `"Base"`, `"Inventario"`, `"Nota"` (nombres exactos)

- Drive:
  - Carpeta PDF (ID): `1pVW-moG52ka3mwelTOzqpkPPieh8bmub`
  - Convención nombre PDF: `FOLIO - CLIENTE - FECHA.pdf`

- Rangos clave (ejemplos, ajustar a los reales):
  - Subtotales: `Nota!E14:E22`
  - Cantidades: `Nota!B14:B22`
  - Precios: `Nota!D14:D22`
  - Anticipo: `Nota!<celda_anticipo>`
  - Total: `Nota!<celda_total>`

---

## Cómo usar (operación diaria)
- Abrir el Google Sheet del sistema.
- Capturar pedido en **Nota**.
- Ejecutar la acción de guardado desde el menú/botón (según implementación).
- Verificar que el folio se haya guardado en **Base**.
- (Opcional) Generar PDF y confirmar que se guardó en Drive.

---

## Checklist de pruebas rápidas (antes de cambios)
1. Crear pedido con 2–3 productos y anticipo.
2. Verificar total calculado por Sheets.
3. Guardar → confirmar registro correcto en **Base**.
4. Generar PDF → confirmar nombre y carpeta en Drive.
5. Confirmar que no se rompió formato/merges en Hoja1.

---
---

## Enfoque Black Belt (Mejora continua) – Visión del sistema

Este sistema no solo genera notas/pedidos: también debe evolucionar hacia control operativo y mejora continua del negocio.

### Objetivos de mejora (Lean Six Sigma)
- Reducir errores en pedidos (productos, precios, folios, anticipos).
- Reducir tiempo de captura por pedido.
- Estandarizar el flujo para que sea repetible y difícil de romper.
- Medir desempeño con KPIs simples y accionables.

### KPIs sugeridos (sin herramientas externas inicialmente)
**Operación**
- Pedidos por día / semana
- Tiempo promedio de captura (si se registra inicio/fin)
- % pedidos con anticipo
- Folios duplicados / errores por semana (defectos)

**Finanzas (básico)**
- Ventas totales por periodo
- Ticket promedio
- Top productos / top clientes

**Entrega (si se registra)**
- Tiempo de entrega promedio
- Pedidos atrasados (WIP viejo)

### Kanban (evolución incremental)
El sistema puede incluir una hoja tipo Kanban (o AppSheet) con estados:
- Capturado → En producción → Listo → Entregado → Cerrado

Reglas:
- Mantenerlo simple (tablero en Sheets primero).
- La automatización debe apoyar el proceso, no complicarlo.

### Roadmap incremental (sin reescrituras)
1) Registro robusto en Base + PDF estable
2) Hoja de KPIs automáticos (tablas dinámicas / fórmulas)
3) Hoja Kanban en Sheets (WIP y estados)
4) AppSheet (cuando el flujo esté estable)
5) Tableros en Looker Studio (si se requiere visualización ejecutiva)

## Soporte
Si algo falla, documentar:
- Acción realizada
- Folio (si aplica)
- Captura de pantalla
- Logs relevantes (si existen)