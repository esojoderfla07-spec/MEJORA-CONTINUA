/**
 * Solo entradas globales (menú + wrappers).
 * La lógica real vive en OrderService.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('💮 Loto Sublimación')
    .addItem('🛒 Seleccionar productos', 'abrirSelectorProductos')
    .addItem('📄 Generar nota', 'generarNota')
    .addItem('🧾 Generar FACTURA', 'generarFactura')
    .addItem('🧾 Exportar PDF a carpeta', 'exportarNotaPDF')
    .addSeparator()
    .addItem('🧹 Limpiar nota', 'limpiarNota')
    .addToUi();

  ui.createMenu('💵 Caja')
    .addItem('Dar cambio', 'darCambio')
    .addToUi();
}

function abrirSelectorProductos() { return OrderService.abrirSelectorProductos(); }
function obtenerInventarioParaUI() { return OrderService.obtenerInventarioParaUI(); }
function obtenerSeleccionActualParaUI() { return OrderService.obtenerSeleccionActualParaUI(); }
function guardarSeleccionProductos(seleccion) { return OrderService.guardarSeleccionProductos(seleccion); }
function generarNota() { return OrderService.generarNota(); }
function generarFactura() { return OrderService.generarFactura(); }
function exportarNotaPDF() { return OrderService.exportarNotaPDF(); }
function limpiarNota() { return OrderService.limpiarNota(); }
function darCambio() { return OrderService.darCambio(); }
