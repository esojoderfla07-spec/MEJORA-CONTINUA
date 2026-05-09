/**
 * main.gs - Versión Integrada LOTO 2026
 * Centraliza la operación diaria y la inteligencia de producción.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 1. Menú de Operación Diaria (Tu código original)
  ui.createMenu('💮 Loto Sublimación')
    .addItem('🛒 Seleccionar productos', 'abrirSelectorProductos')
    .addItem('📄 Generar nota', 'generarNota')
    .addItem('🧾 Generar FACTURA', 'generarFactura')
    .addItem('📑 Generar COTIZACIÓN', 'generarCotizacion')
    .addItem('🧾 Exportar PDF a carpeta', 'exportarNotaPDF')
    .addSeparator()
    .addItem('🧹 Limpiar nota', 'limpiarNota')
    .addToUi();

  // 2. Menú de Finanzas (Tu código original)
  ui.createMenu('💵 Caja')
    .addItem('Dar cambio', 'darCambio')
    .addToUi();

  // 3. Menú de Ingeniería / Black Belt (Añadido para escalabilidad)
  // Este menú permite gestionar el flujo "estilo McDonald's" que planeamos.
  ui.createMenu('📊 Planeación')
    .addItem('🔄 Sincronizar Base con MPS', 'syncBaseToMps')
    .addItem('📅 Ordenar Prioridades Hoy (EDD/SPT)', 'planificarHoy')
    .addItem('⏱️ Activar Auto-Sincronización', 'instalarTriggerMps')
    .addToUi();
}

/**
 * Disparador onEdit: El "corazón" de la automatización.
 * No necesita que le piques a nada, corre solo cuando detecta cambios.
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // A. POKA-YOKE DE TIEMPO (Timestamp M -> N)
  // Si marcas la casilla en M (13), estampa la fecha en N (14).
  if (sheet.getName() === CFG.SHEETS.BASE && range.getColumn() === CFG.BASE_COL.CHECKBOX_ENTREGA) {
    const celdaFecha = sheet.getRange(range.getRow(), CFG.BASE_COL.FECHA_ENTREGA_REAL);
    if (range.getValue() === true) {
      celdaFecha.setValue(new Date()).setNumberFormat("dd/mm/yyyy HH:mm");
    } else {
      celdaFecha.clearContent();
    }
  }

  // B. SINCRONIZACIÓN MPS (Si existe el servicio)
  // Permite que si mueves algo en el Kanban, se refleje en la Base.
  if (typeof MPSService !== 'undefined') {
    return MPSService.syncMpsToBase(e);
  }
}

// --- WRAPPERS DE ORDER SERVICE (Tu código actual) ---
function abrirSelectorProductos() { return OrderService.abrirSelectorProductos(); }
function obtenerInventarioParaUI() { return OrderService.obtenerInventarioParaUI(); }
function obtenerResponsablesParaUI() { return OrderService.obtenerResponsablesParaUI(); }
function obtenerSeleccionActualParaUI() { return OrderService.obtenerSeleccionActualParaUI(); }
function guardarSeleccionProductos(seleccion) { return OrderService.guardarSeleccionProductos(seleccion); }
function generarNota() { return OrderService.generarNota(); }
function generarFactura() { return OrderService.generarFactura(); }
function generarCotizacion() { return OrderService.generarCotizacion(); }
function exportarNotaPDF() { return OrderService.exportarNotaPDF(); }
function limpiarNota() { return OrderService.limpiarNota(); }
function darCambio() { return OrderService.darCambio(); }

// --- WRAPPERS DE MPS SERVICE (Nuevas funciones de ingeniería) ---
function syncBaseToMps() { return MPSService.syncBaseToMps(); }
function planificarHoy() { return MPSService.planificarHoy(); }
function instalarTriggerMps() { return MPSService.instalarTriggerMps(); }
