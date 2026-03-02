# /BB + /REPORT — Roadmap operativo para Loto Sublimación

## 1) Estado actual (lo que ya está bien)
Tu microempresa ya resolvió la parte más difícil: **captura y entrega operativa del pedido**.

Flujo actual confirmado:
1. Selección de productos.
2. Guardado en Base (fuente de verdad).
3. Generación de Nota/Factura.
4. Datos en hoja `Nota`.
5. Exportación PDF y envío al cliente.

Esto ya te da una base real para empezar mejora continua sin reescribir el sistema.

---

## 2) Diagnóstico Black Belt (proceso)
### Fortalezas
- Ya existe proceso estándar de venta (menos variabilidad).
- Ya existe digitalización básica (Sheets + Apps Script).
- Ya existe evidencia documental (PDF de salida).

### Riesgos típicos actuales (sin KPIs/Kanban)
- Decisiones por intuición (no por datos).
- Retrabajo por falta de prioridades visibles.
- Compras de inventario reactivo (cuando “ya se acabó”).
- Cuellos de botella no visibles (producción, diseño, entrega).

---

## 3) Siguiente paso ideal (orden recomendado)
No hagas todo a la vez. Implementa en 4 fases cortas.

## FASE 1 (Semana 1–2): KPI mínimo viable
Objetivo: empezar a medir lo esencial sin complicar operación.

### KPI núcleo (5 métricas)
1. **Pedidos por semana**
2. **Ventas semanales**
3. **Ticket promedio**
4. **% pedidos con anticipo**
5. **Defectos operativos** (folio duplicado, producto inválido, errores de captura)

### Entregable
- Hoja nueva: `KPIs`
- Tablas por semana + semáforo simple (verde/amarillo/rojo)

### Regla
- Si no se mide, no se mejora.

---

## FASE 2 (Semana 2–4): Kanban en Sheets
Objetivo: controlar flujo y WIP (trabajo en proceso).

### Estructura recomendada de estados
- Capturado
- Diseño
- Producción
- Listo
- Entregado
- Cerrado

### KPI de flujo
- **Lead Time** (captura → entrega)
- **WIP viejo** (pedidos detenidos > X días)
- **% entregas a tiempo**

### Entregable
- Hoja `KANBAN` (vista tabular por estado).
- Regla visual de alertas: rojo si pedido supera umbral de días.

---

## FASE 3 (Mes 2): Inventario con política simple
Objetivo: evitar faltantes y exceso de stock.

### Punto de reorden (versión microempresa)
Para cada insumo crítico:
- Demanda promedio semanal
- Tiempo de reposición del proveedor (días)
- Stock de seguridad

**Fórmula práctica:**
Punto de reorden = (demanda diaria × tiempo de reposición) + stock de seguridad

### KPI inventario
- **Rupturas de stock por mes**
- **Días de inventario disponible**
- **% compras urgentes**

### Entregable
- Hoja `INVENTARIO_CTRL` con semáforo de reorden.

---

## FASE 4 (Mes 3): IO aplicada (ligera y útil)
Objetivo: decisiones de priorización y compra con reglas claras.

### 4.1 Secuenciación de pedidos (Scheduling)
- Regla 1: **EDD** (Earliest Due Date) para mejorar cumplimiento.
- Regla 2: **SPT** (Shortest Processing Time) para bajar WIP.

Implementación simple:
- Vista diaria “Orden sugerido de producción” basada en fecha entrega + tiempo estimado.

### 4.2 Inventario (EOQ lite)
- Estimar lote de compra para balancear costo de pedido vs costo de mantener stock.
- Iniciar con 3 insumos A (los más críticos/consumidos).

### 4.3 Mix de producción (cuando haya saturación)
- Priorizar pedidos por margen y capacidad diaria.
- Regla práctica: maximizar ingreso diario sin incumplir fechas.

---

## 4) /REPORT ejecutivo (qué revisar cada semana)
Reunión de 20 minutos, siempre mismo formato:

1. **Ventas**
   - Ventas semanales
   - Ticket promedio

2. **Operación**
   - Pedidos cerrados
   - % entrega a tiempo
   - WIP viejo

3. **Calidad**
   - Defectos de captura/proceso

4. **Inventario**
   - Rupturas de stock
   - Alertas de reorden

5. **Acción recomendada (1–3 acciones máximas)**
   - Responsable
   - Fecha compromiso

---

## 5) Plan de implementación de bajo riesgo (90 días)
### Días 1–15
- Crear hoja KPIs + captura mínima de defectos.
- Empezar medición semanal (aunque esté incompleta).

### Días 16–30
- Activar Kanban en Sheets.
- Definir SLA interno (ej. máximo 48h en “Producción”).

### Días 31–60
- Activar control de inventario con punto de reorden.
- Medir faltantes y compras urgentes.

### Días 61–90
- Priorización diaria con EDD/SPT.
- Ajustar reglas con datos reales.

---

## 6) Reglas para no complicarse (microempresa)
- Primero Sheets, luego herramientas externas.
- Máximo 5–8 KPIs al inicio.
- Evitar “tableros bonitos” sin disciplina de datos.
- Una mejora por semana > un rediseño total.

---

## 7) Resultado esperado si ejecutas esto
- Menos urgencias y retrabajo.
- Mejor cumplimiento de entrega.
- Compras de inventario más inteligentes.
- Decisiones comerciales con datos, no intuición.
- Base lista para escalar a AppSheet/Looker cuando realmente lo necesites.
