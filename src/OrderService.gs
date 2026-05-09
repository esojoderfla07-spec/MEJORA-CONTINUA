var OrderService = (function () {
  const RFC_FACTURA = 'LOCJ940603UN4';
  const RFC_SILVANA = 'TOSS9609012Y0';
  const RANGO_RFC_NOTA = 'B6:F6';


  function precioPorCantidad_(inv, cant) {
    if (cant >= 50 && Number(inv.precio50 || 0) > 0) return Number(inv.precio50);
    if (cant >= 12 && Number(inv.precio12 || 0) > 0) return Number(inv.precio12);
    if (cant >= 6 && Number(inv.precio6 || 0) > 0) return Number(inv.precio6);
    return Number(inv.precioBase) || 0;
  }

  function abrirSelectorProductos() {
    const ui = SpreadsheetApp.getUi();
    const fila = pedirFilaBase_(ui, {
      modo: 'SIGUIENTE_VACIA',
      accion: 'SELECCIONAR PRODUCTOS'
    });
    if (!fila) return;

    PropertiesService.getDocumentProperties().setProperty('filaTrabajo', String(fila));
    const html = HtmlService.createHtmlOutputFromFile('selector')
      .setWidth(520)
      .setHeight(620);

    ui.showModalDialog(html, 'Seleccion de productos');
  }

  function obtenerInventarioParaUI() {
  const sh = getSheet_(CFG.SHEETS.INV);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const values = sh.getRange(2, 1, lastRow - 1, 6).getValues();
  return values
    .filter(r => r[0])
    .map(r => ({
      nombre: String(r[0]).trim(),
      precioBase: Number(String(r[1]).replace(/[$,]/g, '')) || 0,
      unidad: (r[2] ? String(r[2]).trim() : 'PZ') || 'PZ',
      precio6: Number(String(r[3]).replace(/[$,]/g, '')) || 0,
      precio12: Number(String(r[4]).replace(/[$,]/g, '')) || 0,
      precio50: Number(String(r[5]).replace(/[$,]/g, '')) || 0
    }));
}

  function obtenerResponsablesParaUI() {
    if (!CFG.BASE_COL.RESPONSABLE) return [];

    const sh = getSheet_(CFG.SHEETS.BASE);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return [];

    const values = sh.getRange(2, CFG.BASE_COL.RESPONSABLE, lastRow - 1, 1).getValues();
    const unicos = new Set();

    values.forEach(r => {
      const nombre = String(r[0] || '').trim();
      if (nombre) unicos.add(nombre);
    });

    return Array.from(unicos.values()).sort();
  }

  // Para que el selector abra con lo ya guardado en esa fila
  function obtenerSeleccionActualParaUI() {
    const props = PropertiesService.getDocumentProperties();
    const fila = parseInt(props.getProperty('filaTrabajo'), 10);
    if (!fila) return { fila: null, items: [] };

    const shBase = getSheet_(CFG.SHEETS.BASE);
    limpiarBufferSiFilaVacia_(fila, shBase);
    const items = readItemsForFila_(fila, shBase);
    const buffer = readBufferForFila_(fila);

    const responsable = (
      CFG.BASE_COL.RESPONSABLE
        ? String(shBase.getRange(fila, CFG.BASE_COL.RESPONSABLE).getValue() || '').trim()
        : ''
    ) || buffer.responsable || '';
    const telefono = String(shBase.getRange(fila, CFG.BASE_COL.TEL).getValue() || '').trim() || buffer.telefono || '';
    const fechaPedido = dateToInputValue_(shBase.getRange(fila, CFG.BASE_COL.FECHA).getValue()) || buffer.fechaPedido || '';
    const fechaEntrega = dateToInputValue_(shBase.getRange(fila, CFG.BASE_COL.ENTREGA).getValue()) || buffer.fechaEntrega || '';

    return { fila, items, responsable, telefono, fechaPedido, fechaEntrega };
  }

  /**
   * Guarda el estado FINAL de selección (no delta).
   * Así permite sumar, editar y quitar productos.
   * También recalcula Base!G (TOTAL) con mayoreo.
   */
  function guardarSeleccionProductos(seleccion) {
    const props = PropertiesService.getDocumentProperties();
    const fila = parseInt(props.getProperty('filaTrabajo'), 10);
    if (!fila) throw new Error('No hay fila de trabajo guardada.');

    const shBase = getSheet_(CFG.SHEETS.BASE);

    const payload = parseSeleccionPayload_(seleccion);
    const responsable = String(payload.responsable || '').trim();
    const telefono = String(payload.telefono || '').trim();
    const fechaPedidoDate = parseInputDate_(payload.fechaPedido);
    const fechaEntregaDate = parseInputDate_(payload.fechaEntrega);

    // Estado final del modal
    const items = payload.items
      .map(x => ({
        nombre: String(x.nombre || '').trim(),
        cantidad: Number(x.cantidad) || 0
      }))
      .filter(x => x.nombre && x.cantidad > 0);

    // Si no hay selección, limpiar la fila para evitar arrastre de productos previos
    if (!items.length) {
      shBase.getRange(fila, CFG.BASE_COL.PRODUCTOS).clearContent();
      shBase.getRange(fila, CFG.BASE_COL.TOTAL).clearContent();
      shBase.getRange(fila, CFG.BASE_COL.TEL).clearContent();
      shBase.getRange(fila, CFG.BASE_COL.FECHA).clearContent();
      shBase.getRange(fila, CFG.BASE_COL.ENTREGA).clearContent();
      if (CFG.BASE_COL.RESPONSABLE) {
        shBase.getRange(fila, CFG.BASE_COL.RESPONSABLE).clearContent();
      }

      deleteBufferForFila_(fila);

      return { ok: true, fila, total: 0, items: 0, cleaned: true };
    }

    // Inventario para total mayoreo
    const invMap = cargarInventarioMap_();

    let total = 0;
    const resumen = [];

    items.forEach(it => {
      const inv = invMap.get(normalize_(it.nombre));
      const precio = inv ? precioPorCantidad_(inv, it.cantidad) : 0;
      total += it.cantidad * precio;
      resumen.push(`${it.nombre}(${it.cantidad})`);
    });

    // Persistencia Base
    shBase.getRange(fila, CFG.BASE_COL.PRODUCTOS).setValue(resumen.join('; '));
    shBase.getRange(fila, CFG.BASE_COL.TOTAL).setValue(total).setNumberFormat('"$"#,##0.00');

    if (CFG.BASE_COL.RESPONSABLE) {
      shBase.getRange(fila, CFG.BASE_COL.RESPONSABLE).setValue(responsable);
    }

    if (telefono) {
      shBase.getRange(fila, CFG.BASE_COL.TEL).setValue(telefono);
    }

    if (fechaPedidoDate) {
      shBase.getRange(fila, CFG.BASE_COL.FECHA).setValue(fechaPedidoDate);
    }

    if (fechaEntregaDate) {
      shBase.getRange(fila, CFG.BASE_COL.ENTREGA).setValue(fechaEntregaDate);
    }

    // Buffer para nota
    writeBufferForFila_(fila, {
      items,
      responsable,
      telefono,
      fechaPedido: payload.fechaPedido,
      fechaEntrega: payload.fechaEntrega
    });

    return { ok: true, fila, total, items: items.length };
  }

  function generarNota() {
    const ui = SpreadsheetApp.getUi();
    const fila = pedirFilaBase_(ui, {
      modo: 'ULTIMA_CON_DATOS',
      accion: 'GENERAR NOTA'
    });
    if (!fila) return;

    const ss = SpreadsheetApp.getActive();
    const shBase = ss.getSheetByName(CFG.SHEETS.BASE);
    const shNota = ss.getSheetByName(CFG.SHEETS.NOTA);
    escribirRfcSilvanaEnNota_(shNota);

    // Encabezado
    const folio = shBase.getRange(fila, CFG.BASE_COL.FOLIO).getValue();
    shNota.getRange(CFG.NOTA.CELDA_FOLIO).setValue('FOLIO: ' + folio).setFontWeight('bold');
    shNota.getRange(CFG.NOTA.RANGO_FECHA_PEDIDO).setValue(shBase.getRange(fila, CFG.BASE_COL.FECHA).getValue());
    asegurarEtiquetaFechaEntrega_(shNota);
    shNota.getRange(CFG.NOTA.RANGO_FECHA_ENTREGA).setValue(shBase.getRange(fila, CFG.BASE_COL.ENTREGA).getValue());

    // Anticipo
    const anticipo = Number(shBase.getRange(fila, CFG.BASE_COL.ANTICIPO).getValue()) || 0;
    shNota.getRange(CFG.NOTA.CELDA_ANTICIPO).setValue(anticipo).setNumberFormat('"$"#,##0.00');

    // Concepto
    shNota.getRange('A23:D23').clearContent();
    shNota.getRange('A23:D23').setValue('ANTICIPO');

    clearDetalle_(shNota);

    const items = readItemsForFila_(fila, shBase);
    if (!items.length) {
      ui.alert('⚠️ No hay productos para esa fila.');
      return;
    }

    const invMap = cargarInventarioMap_();
    let row = CFG.NOTA.DETALLE_START;
    const noEncontrados = [];

    for (const it of items) {
      if (row > CFG.NOTA.DETALLE_END) break;

      const nombre = String(it.nombre || '').trim();
      const cant = Number(it.cantidad) || 0;
      if (!nombre || cant <= 0) continue;

      const inv = invMap.get(normalize_(nombre));
      if (!inv) {
        noEncontrados.push(nombre);
        continue;
      }

      const precio = precioPorCantidad_(inv, cant);

      shNota.getRange(row, CFG.NOTA.COL_DESC).setValue(nombre);
      shNota.getRange(row, CFG.NOTA.COL_CANT).setValue(cant);
      shNota.getRange(row, CFG.NOTA.COL_UD).setValue(inv.unidad || 'PZ');
      shNota.getRange(row, CFG.NOTA.COL_PRECIO).setValue(precio).setNumberFormat('"$"#,##0.00');

      // Subtotal en hoja (regla)
      shNota.getRange(row, CFG.NOTA.COL_SUBTOTAL)
        .setFormula(`=B${row}*D${row}`)
        .setNumberFormat('"$"#,##0.00');

      row++;
    }

    // Total en hoja (regla)
    shNota.getRange(CFG.NOTA.CELDA_TOTAL)
      .setFormula('=SUM(E14:E22)-E23')
      .setFontWeight('bold')
      .setNumberFormat('"$"#,##0.00');

    ponerDatosPago_('NOTA');
    PropertiesService.getDocumentProperties().setProperty('tipoDocumentoActual', 'NOTA');

    if (noEncontrados.length) {
      ui.alert(
        '✅ Nota generada, PERO estos productos no se encontraron en Inventario:\n\n' +
        noEncontrados.map(x => '• ' + x).join('\n')
      );
      return;
    }

    ui.alert('📄 Nota generada correctamente.');
  }

  function generarFactura() {
    const ui = SpreadsheetApp.getUi();
    const fila = pedirFilaBase_(ui, {
      modo: 'ULTIMA_CON_DATOS',
      accion: 'GENERAR FACTURA'
    });
    if (!fila) return;

    const ss = SpreadsheetApp.getActive();
    const shBase = ss.getSheetByName(CFG.SHEETS.BASE);
    const shNota = ss.getSheetByName(CFG.SHEETS.NOTA);
    escribirRfcFacturaEnNota_(shNota);
    const folio = shBase.getRange(fila, CFG.BASE_COL.FOLIO).getValue();
    shNota.getRange(CFG.NOTA.CELDA_FOLIO).setValue('FOLIO: ' + folio).setFontWeight('bold');
    shNota.getRange(CFG.NOTA.RANGO_FECHA_PEDIDO).setValue(shBase.getRange(fila, CFG.BASE_COL.FECHA).getValue());
    asegurarEtiquetaFechaEntrega_(shNota);
    shNota.getRange(CFG.NOTA.RANGO_FECHA_ENTREGA).setValue(shBase.getRange(fila, CFG.BASE_COL.ENTREGA).getValue());

    clearDetalle_(shNota);

    const items = readItemsForFila_(fila, shBase);
    if (!items.length) {
      ui.alert('⚠️ No hay productos.');
      return;
    }

    const invMap = cargarInventarioMap_();
    let row = CFG.NOTA.DETALLE_START;
    let subtotalGeneral = 0;

    for (const it of items) {
      if (row > CFG.NOTA.DETALLE_END) break;
      const inv = invMap.get(normalize_(it.nombre));
      if (!inv) continue;

      const cant = Number(it.cantidad) || 0;
      const precio = precioPorCantidad_(inv, cant);
      const subtotal = cant * precio;
      subtotalGeneral += subtotal;

      shNota.getRange(row, CFG.NOTA.COL_DESC).setValue(it.nombre);
      shNota.getRange(row, CFG.NOTA.COL_CANT).setValue(cant);
      shNota.getRange(row, CFG.NOTA.COL_UD).setValue(inv.unidad || 'PZ');
      shNota.getRange(row, CFG.NOTA.COL_PRECIO).setValue(precio).setNumberFormat('"$"#,##0.00');
      shNota.getRange(row, CFG.NOTA.COL_SUBTOTAL).setValue(subtotal).setNumberFormat('"$"#,##0.00');
      row++;
    }

    const iva = subtotalGeneral * 0.16;
    const total = subtotalGeneral + iva;

    shNota.getRange('A23:D23').clearContent();
    shNota.getRange('A23:D23').setValue('IVA');
    shNota.getRange('E23').setValue(iva).setNumberFormat('"$"#,##0.00');

    shNota.getRange('D24').setValue('TOTAL');
    shNota.getRange('E24').setValue(total).setFontWeight('bold').setNumberFormat('"$"#,##0.00');

    ponerDatosPago_('FACTURA');
    PropertiesService.getDocumentProperties().setProperty('tipoDocumentoActual', 'FACTURA');
    ui.alert('🧾 Factura generada correctamente.');
  }

  function generarCotizacion() {
    const ui = SpreadsheetApp.getUi();
    const fila = pedirFilaBase_(ui, {
      modo: 'ULTIMA_CON_DATOS',
      accion: 'GENERAR COTIZACION'
    });
    if (!fila) return;

    const ss = SpreadsheetApp.getActive();
    const shBase = ss.getSheetByName(CFG.SHEETS.BASE);
    const shNota = ss.getSheetByName(CFG.SHEETS.NOTA);
    escribirRfcSilvanaEnNota_(shNota);

    // Encabezado base
    const folio = shBase.getRange(fila, CFG.BASE_COL.FOLIO).getValue();
    shNota.getRange(CFG.NOTA.CELDA_FOLIO).setValue('FOLIO: ' + folio).setFontWeight('bold');
    shNota.getRange(CFG.NOTA.RANGO_FECHA_PEDIDO).setValue(shBase.getRange(fila, CFG.BASE_COL.FECHA).getValue());

    // Reglas de formato para COTIZACIÓN
    shNota.getRange('E12:F12').clearContent();
    shNota.getRange('E13:F13').setValue('COTIZACIÓN').setFontWeight('bold');

    clearDetalle_(shNota);

    const items = readItemsForFila_(fila, shBase);
    if (!items.length) {
      ui.alert('⚠️ No hay productos para esa fila.');
      return;
    }

    const invMap = cargarInventarioMap_();
    let row = CFG.NOTA.DETALLE_START;
    const noEncontrados = [];

    for (const it of items) {
      if (row > CFG.NOTA.DETALLE_END) break;

      const nombre = String(it.nombre || '').trim();
      const cant = Number(it.cantidad) || 0;
      if (!nombre || cant <= 0) continue;

      const inv = invMap.get(normalize_(nombre));
      if (!inv) {
        noEncontrados.push(nombre);
        continue;
      }

      const precio = precioPorCantidad_(inv, cant);

      shNota.getRange(row, CFG.NOTA.COL_DESC).setValue(nombre);
      shNota.getRange(row, CFG.NOTA.COL_CANT).setValue(cant);
      shNota.getRange(row, CFG.NOTA.COL_UD).setValue(inv.unidad || 'PZ');
      shNota.getRange(row, CFG.NOTA.COL_PRECIO).setValue(precio).setNumberFormat('"$"#,##0.00');
      shNota.getRange(row, CFG.NOTA.COL_SUBTOTAL)
        .setFormula(`=B${row}*D${row}`)
        .setNumberFormat('"$"#,##0.00');

      row++;
    }

    shNota.getRange('A23:D23').clearContent();
    shNota.getRange('E23:F23').clearContent();

    shNota.getRange(CFG.NOTA.CELDA_TOTAL)
      .setFormula('=SUM(E14:E22)')
      .setFontWeight('bold')
      .setNumberFormat('"$"#,##0.00');

    // Cotización usa los mismos datos bancarios de NOTA
    ponerDatosPago_('NOTA');
    PropertiesService.getDocumentProperties().setProperty('tipoDocumentoActual', 'COTIZACION');

    if (noEncontrados.length) {
      ui.alert(
        '✅ Cotización generada, PERO estos productos no se encontraron en Inventario:\n\n' +
        noEncontrados.map(x => '• ' + x).join('\n')
      );
      return;
    }

    ui.alert('📑 Cotización generada correctamente.');
  }

  function exportarNotaPDF() {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActive();
    const shNota = ss.getSheetByName(CFG.SHEETS.NOTA);

    const folioRaw = String(shNota.getRange(CFG.NOTA.CELDA_FOLIO).getValue() || 'SIN_FOLIO');
    const folio = folioRaw.replace('FOLIO:', '').trim() || 'SIN_FOLIO';

    const props = PropertiesService.getDocumentProperties();
    const tipoGuardado = String(props.getProperty('tipoDocumentoActual') || '').trim().toUpperCase();
    const textoPago = normalize_(shNota.getRange('A25').getDisplayValue());
    let tipoDocumento = tipoGuardado || 'NOTA';

    // Fallback por texto para compatibilidad con documentos previos
    if (!tipoGuardado) {
      if (textoPago.includes('JUAN JACOBO')) {
        tipoDocumento = 'FACTURA';
      } else if (textoPago.includes('SILVANA TOLEDO')) {
        tipoDocumento = 'NOTA';
      }
      if (normalize_(shNota.getRange('E13').getDisplayValue()) === 'COTIZACION') {
        tipoDocumento = 'COTIZACION';
      }
    }

    // 3 rutas destino
    // NOTA -> FOLDER_ID
    // FACTURA -> FACTURA_FOLDER_ID
    // COTIZACION -> COTIZACION_FOLDER_ID
    let folderId = CFG.PDF.FOLDER_ID;
    if (tipoDocumento === 'FACTURA') {
      folderId = CFG.PDF.FACTURA_FOLDER_ID;
    } else if (tipoDocumento === 'COTIZACION') {
      folderId = CFG.PDF.COTIZACION_FOLDER_ID;
    }

    // Refuerzo de bordes para que se vean en PDF
    aplicarBordesNotaAntesDeExportar_(shNota);
    SpreadsheetApp.flush();
    Utilities.sleep(250);

    const folder = DriveApp.getFolderById(folderId);
    const gid = shNota.getSheetId();

    const url = ss.getUrl().replace(/edit$/, '') +
      'export?format=pdf' +
      `&gid=${gid}` +
      '&portrait=true' +
      '&fitw=true' +
      '&sheetnames=false' +
      '&printtitle=false' +
      '&pagenumbers=false' +
      '&gridlines=false' +
      '&fzr=false' +
      '&top_margin=0.30' +
      '&bottom_margin=0.30' +
      '&left_margin=0.30' +
      '&right_margin=0.30';

    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const blob = response.getBlob().setName(`${folio}.pdf`);
    const file = folder.createFile(blob);

    ui.alert(`✅ PDF guardado (${tipoDocumento})
${file.getName()}`);
  }

  function limpiarNota() {
    const shNota = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.NOTA);
    const filasDetalle = CFG.NOTA.DETALLE_END - CFG.NOTA.DETALLE_START + 1;

    shNota.getRange(CFG.NOTA.CELDA_FOLIO).clearContent();
    shNota.getRange(CFG.NOTA.RANGO_FECHA_PEDIDO).clearContent();
    shNota.getRange(CFG.NOTA.RANGO_FECHA_ENTREGA).clearContent();
    shNota.getRange(CFG.NOTA.DETALLE_START, 1, filasDetalle, 6).clearContent();
    shNota.getRange(CFG.NOTA.CELDA_ANTICIPO).clearContent();
    shNota.getRange(CFG.NOTA.CELDA_TOTAL).clearContent();

    SpreadsheetApp.getUi().alert('🧹 Nota limpiada (diseño intacto).');
  }

  function darCambio() {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActive();
    const shBase = ss.getSheetByName(CFG.SHEETS.BASE);

    const respFila = ui.prompt('💵 Dar cambio', 'Ingresa el número de fila:', ui.ButtonSet.OK_CANCEL);
    if (respFila.getSelectedButton() !== ui.Button.OK) return;

    const fila = parseInt(respFila.getResponseText(), 10);
    if (isNaN(fila) || fila < 2) return ui.alert('❗ Fila inválida.');

    const total = Number(shBase.getRange(fila, CFG.BASE_COL.TOTAL).getValue());
    if (!total || total <= 0) return ui.alert('❗ El total es inválido o está en $0.00');

    const respPago = ui.prompt(
      '💵 Dar cambio',
      `Total: $${total.toFixed(2)}

Ingresa el monto total que entrega el cliente:`,
      ui.ButtonSet.OK_CANCEL
    );
    if (respPago.getSelectedButton() !== ui.Button.OK) return;

    const pago = Number(respPago.getResponseText());
    if (isNaN(pago) || pago < 0) return ui.alert('❗ El monto ingresado no es válido.');

    const diferencia = pago - total;

    if (diferencia < 0) {
      return ui.alert(
        `❗ Pago insuficiente.

Total: $${total.toFixed(2)}
Pagado: $${pago.toFixed(2)}
Falta: $${Math.abs(diferencia).toFixed(2)}`
      );
    }

    ui.alert(
      `🧾 Confirmación de cobro

Total: $${total.toFixed(2)}
Pagado: $${pago.toFixed(2)}

💵 Cambio: $${diferencia.toFixed(2)}`
    );
  }

  // ===== Helpers =====
  function escribirRfcFacturaEnNota_(shNota) {
    // B6:F6 puede estar combinado; escribir en B6 actualiza todo el bloque.
    const texto = 'RFC: ' + RFC_FACTURA;
    const negrita = SpreadsheetApp.newTextStyle().setBold(true).build();
    const rich = SpreadsheetApp.newRichTextValue()
      .setText(texto)
      .setTextStyle(0, 3, negrita) // "RFC"
      .build();
    shNota.getRange(RANGO_RFC_NOTA).setRichTextValue(rich);
  }

  function escribirRfcSilvanaEnNota_(shNota) {
    // B6:F6 puede estar combinado; escribir en B6 actualiza todo el bloque.
    const texto = 'RFC: ' + RFC_SILVANA;
    const negrita = SpreadsheetApp.newTextStyle().setBold(true).build();
    const rich = SpreadsheetApp.newRichTextValue()
      .setText(texto)
      .setTextStyle(0, 3, negrita) // "RFC"
      .build();
    shNota.getRange(RANGO_RFC_NOTA).setRichTextValue(rich);
  }

  function ponerDatosPago_(tipo) {
    const shNota = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.NOTA);
    const cell = shNota.getRange('A25:F25');

    let texto, banco, clabe, tarjeta, nombre;

    if (tipo === 'NOTA') {
      banco = 'CITIBANAMEX';
      clabe = '002100701846411681';
      tarjeta = '5204 1662 1492 2298';
      nombre = 'Silvana Toledo Selvas';

      texto =
`NOTA: Para que su pedido sea tomado en consideración, es necesario el 50% de anticipo y el resto el día de la entrega.
FORMA DE PAGO: Puede realizar el pago por transferencia electrónica a la cuenta ${banco} con:
CLABE INTERBANCARIA ${clabe}, NÚMERO DE TARJETA ${tarjeta} a nombre de ${nombre}.`;
    } else {
      banco = 'BANAMEX';
      clabe = '002100701806314359';
      tarjeta = '5204 1658 2104 1096';
      nombre = 'Juan Jacobo López Calvo';

      texto =
`NOTA: Para que su pedido sea tomado en consideración, es necesario el pago completo.
FORMA DE PAGO: Puede realizar el pago por transferencia electrónica a la cuenta ${banco} con:
CLAVE INTERBANCARIA ${clabe}, NÚMERO DE TARJETA ${tarjeta} a nombre de ${nombre}.`;
    }

    let builder = SpreadsheetApp.newRichTextValue().setText(texto);
    const bold = SpreadsheetApp.newTextStyle().setBold(true).build();
    const colorBold = SpreadsheetApp.newTextStyle().setForegroundColor('#e60073').setBold(true).build();

    function aplicar(txt, style) {
      const i = texto.indexOf(txt);
      if (i !== -1) builder = builder.setTextStyle(i, i + txt.length, style);
    }

    ['NOTA', 'FORMA DE PAGO', 'CLABE INTERBANCARIA', 'CLAVE INTERBANCARIA', 'NÚMERO DE TARJETA', banco]
      .forEach(t => aplicar(t, bold));

    [clabe, tarjeta, nombre].forEach(t => aplicar(t, colorBold));

    cell.clearContent();
    cell.setRichTextValue(builder.build());
    cell.setWrap(true);
  }

  function pedirFilaBase_(ui, opciones) {
    const opts = opciones || {};
    const modo = String(opts.modo || 'SIGUIENTE_VACIA').toUpperCase();
    const accion = String(opts.accion || 'OPERACION');
    const usarUltimaConDatos = modo === 'ULTIMA_CON_DATOS';
    const filaSugerida = usarUltimaConDatos
      ? obtenerUltimaFilaConDatosBase_()
      : obtenerSiguienteFilaVaciaBase_();

    const resp = ui.prompt(
      `${accion}`,
      `FILA DISPONIBLE #${filaSugerida}\n(Escribe otra fila o deja vacio)`,
      ui.ButtonSet.OK_CANCEL
    );
    if (resp.getSelectedButton() !== ui.Button.OK) return null;

    const texto = String(resp.getResponseText() || '').trim();

    // Si no se escribe fila, se usa automaticamente la fila sugerida.
    if (!texto) {
      return filaSugerida;
    }

    const fila = Number(texto);
    if (!Number.isInteger(fila) || fila < 2) {
      ui.alert('Fila invalida. Usa un entero >= 2 o deja vacio para automatico.');
      return null;
    }
    return fila;
  }

  function obtenerUltimaFilaConDatosBase_() {
    const shBase = getSheet_(CFG.SHEETS.BASE);
    const startRow = 2;
    const lastRow = Math.max(shBase.getLastRow(), startRow);

    const colsBase = [
      CFG.BASE_COL.FECHA,
      CFG.BASE_COL.FOLIO,
      CFG.BASE_COL.TEL,
      CFG.BASE_COL.CLIENTE,
      CFG.BASE_COL.PRODUCTOS,
      CFG.BASE_COL.ENTREGA,
      CFG.BASE_COL.TOTAL,
      CFG.BASE_COL.ANTICIPO,
      CFG.BASE_COL.METODO,
      CFG.BASE_COL.KANBAN,
      CFG.BASE_COL.RESPONSABLE,
      CFG.BASE_COL.ESTATUS_VENTA,
      CFG.BASE_COL.ESTATUS_PROD
    ];

    const colsToCheck = Array.from(
      new Set(
        colsBase.filter(col => Number.isInteger(col) && col > 0)
      )
    );

    const maxCol = Math.max.apply(null, colsToCheck);
    const values = shBase.getRange(startRow, 1, lastRow - startRow + 1, maxCol).getValues();

    for (let i = values.length - 1; i >= 0; i--) {
      const row = values[i];
      const hasData = colsToCheck.some(col => {
        const v = row[col - 1];
        if (v === null || v === '') return false;
        if (typeof v === 'string') return v.trim() !== '';
        return true;
      });
      if (hasData) return startRow + i;
    }

    return startRow;
  }

  function obtenerSiguienteFilaVaciaBase_() {
    const shBase = getSheet_(CFG.SHEETS.BASE);
    const startRow = 2;
    const lastRow = Math.max(shBase.getLastRow(), startRow);

    const colsBase = [
      CFG.BASE_COL.FECHA,
      CFG.BASE_COL.FOLIO,
      CFG.BASE_COL.TEL,
      CFG.BASE_COL.CLIENTE,
      CFG.BASE_COL.PRODUCTOS,
      CFG.BASE_COL.ENTREGA,
      CFG.BASE_COL.TOTAL,
      CFG.BASE_COL.ANTICIPO,
      CFG.BASE_COL.METODO,
      CFG.BASE_COL.KANBAN,
      CFG.BASE_COL.RESPONSABLE,
      CFG.BASE_COL.ESTATUS_VENTA,
      CFG.BASE_COL.ESTATUS_PROD
    ];

    const colsToCheck = Array.from(
      new Set(
        colsBase.filter(col => Number.isInteger(col) && col > 0)
      )
    );

    const maxCol = Math.max.apply(null, colsToCheck);
    const values = shBase.getRange(startRow, 1, lastRow - startRow + 1, maxCol).getValues();

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const hasData = colsToCheck.some(col => {
        const v = row[col - 1];
        if (v === null || v === '') return false;
        if (typeof v === 'string') return v.trim() !== '';
        return true;
      });
      if (!hasData) return startRow + i;
    }

    return lastRow + 1;
  }

  function cargarInventarioMap_() {
    const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.INV);
    const map = new Map();
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return map;

    const vals = sh.getRange(2, 1, lastRow - 1, 6).getValues();
    vals.forEach(r => {
      const nombre = r[0];
      if (!nombre) return;

      map.set(normalize_(String(nombre)), {
        precioBase: Number(String(r[1]).replace(/[$,]/g, '')) || 0,
        unidad: (r[2] ? String(r[2]).trim() : 'PZ') || 'PZ',
        precio6: Number(String(r[3]).replace(/[$,]/g, '')) || 0,
        precio12: Number(String(r[4]).replace(/[$,]/g, '')) || 0,
        precio50: Number(String(r[5]).replace(/[$,]/g, '')) || 0
      });
    });

    return map;
  }

  function getSheet_(name) {
    const sh = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sh) throw new Error('No existe la hoja: ' + name);
    return sh;
  }

  function normalize_(s) {
    return stripAccents_(String(s || '')).trim().replace(/\s+/g, ' ').toUpperCase();
  }

  function stripAccents_(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function parseResumenProductosToMap_(txt) {
    const map = new Map();
    const parts = String(txt || '')
      .split(';')
      .map(x => x.trim())
      .filter(Boolean);

    parts.forEach(p => {
      const m = p.match(/^(.*?)(?:\((\d+)\)|\s*x\s*(\d+))$/i);
      if (!m) return;
      const nombre = (m[1] || '').trim();
      const cantidad = Number(m[2] || m[3]) || 0;
      if (!nombre || cantidad <= 0) return;
      map.set(normalize_(nombre), { nombre, cantidad });
    });

    return map;
  }

  function parseResumenProductos_(txt) {
    return Array.from(parseResumenProductosToMap_(txt).values());
  }

  function readItemsForFila_(fila, shBase) {
    limpiarBufferSiFilaVacia_(fila, shBase);

    const buffer = readBufferForFila_(fila);
    if (Array.isArray(buffer.items) && buffer.items.length > 0) return buffer.items;

    const txt = String(shBase.getRange(fila, CFG.BASE_COL.PRODUCTOS).getValue() || '');
    return parseResumenProductos_(txt);
  }

  function readBufferForFila_(fila) {
    const props = PropertiesService.getDocumentProperties();
    const bufferRaw = props.getProperty(`buffer_${fila}`);
    if (!bufferRaw) return { items: [], responsable: '', telefono: '', fechaPedido: '', fechaEntrega: '' };

    try {
      const parsed = JSON.parse(bufferRaw);
      if (Array.isArray(parsed)) {
        return { items: parsed, responsable: '', telefono: '', fechaPedido: '', fechaEntrega: '' };
      }
      if (parsed && typeof parsed === 'object') {
        return {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          responsable: String(parsed.responsable || ''),
          telefono: String(parsed.telefono || ''),
          fechaPedido: String(parsed.fechaPedido || ''),
          fechaEntrega: String(parsed.fechaEntrega || '')
        };
      }
    } catch (e) {}

    return { items: [], responsable: '', telefono: '', fechaPedido: '', fechaEntrega: '' };
  }

  function writeBufferForFila_(fila, data) {
    const props = PropertiesService.getDocumentProperties();
    props.setProperty(`buffer_${fila}`, JSON.stringify({
      items: Array.isArray(data.items) ? data.items : [],
      responsable: String(data.responsable || ''),
      telefono: String(data.telefono || ''),
      fechaPedido: String(data.fechaPedido || ''),
      fechaEntrega: String(data.fechaEntrega || '')
    }));
  }

  function deleteBufferForFila_(fila) {
    const props = PropertiesService.getDocumentProperties();
    props.deleteProperty(`buffer_${fila}`);
  }

  function filaBaseEstaVacia_(fila, shBase) {
    const cols = [
      CFG.BASE_COL.PRODUCTOS,
      CFG.BASE_COL.TEL,
      CFG.BASE_COL.FECHA,
      CFG.BASE_COL.ENTREGA,
      CFG.BASE_COL.RESPONSABLE
    ].filter(Boolean);

    return !cols.some(col => {
      const v = shBase.getRange(fila, col).getValue();
      if (v instanceof Date) return true;
      if (typeof v === 'number') return v !== 0;
      return String(v || '').trim() !== '';
    });
  }

  function limpiarBufferSiFilaVacia_(fila, shBase) {
    if (filaBaseEstaVacia_(fila, shBase)) {
      deleteBufferForFila_(fila);
    }
  }

  function parseSeleccionPayload_(seleccion) {
    if (Array.isArray(seleccion)) {
      return { items: seleccion, responsable: '', telefono: '', fechaPedido: '', fechaEntrega: '' };
    }

    if (!seleccion || typeof seleccion !== 'object') {
      throw new Error('Selección inválida.');
    }

    const items = Array.isArray(seleccion.items)
      ? seleccion.items
      : (Array.isArray(seleccion.seleccion) ? seleccion.seleccion : null);

    if (!items) throw new Error('Selección inválida: faltan items.');

    return {
      items,
      responsable: String(seleccion.responsable || ''),
      telefono: String(seleccion.telefono || ''),
      fechaPedido: String(seleccion.fechaPedido || ''),
      fechaEntrega: String(seleccion.fechaEntrega || '')
    };
  }

  function parseInputDate_(yyyyMmDd) {
    const raw = String(yyyyMmDd || '').trim();
    if (!raw) return null;
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) throw new Error('Formato de fecha inválido. Usa AAAA-MM-DD.');

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    // Mediodía para evitar corrimientos por zona horaria al guardar en Sheets
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  function dateToInputValue_(value) {
    if (!value) return '';
    const d = (value instanceof Date) ? value : new Date(value);
    if (isNaN(d.getTime())) return '';

    const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone() || Session.getScriptTimeZone();
    return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  }

  function asegurarEtiquetaFechaEntrega_(shNota) {
    const etiquetaEntrega = shNota.getRange('E12:F12');
    const actual = normalize_(etiquetaEntrega.getDisplayValue());

    // Si venimos de cotización y la etiqueta se borró, la restauramos para nota/factura
    if (actual !== 'FECHA DE ENTREGA') {
      etiquetaEntrega.setValue('FECHA DE ENTREGA');
    }

    etiquetaEntrega.setFontWeight('bold');
  }

  function clearDetalle_(shNota) {
    const filas = CFG.NOTA.DETALLE_END - CFG.NOTA.DETALLE_START + 1;

    // Limpia solo contenido y re-aplica formato de la fila plantilla para evitar mezclas de fuentes
    shNota.getRange(CFG.NOTA.DETALLE_START, 1, filas, 6).clearContent();
    normalizarFormatoDetalle_(shNota);
  }

  function normalizarFormatoDetalle_(shNota) {
    // Usa la primera fila del detalle como plantilla visual (fuente, tamaño, alineación, etc.)
    const filaPlantilla = shNota.getRange(CFG.NOTA.DETALLE_START, 1, 1, 6);
    filaPlantilla.copyFormatToRange(
      shNota,
      1,
      6,
      CFG.NOTA.DETALLE_START,
      CFG.NOTA.DETALLE_END
    );
  }

  function aplicarBordesNotaAntesDeExportar_(shNota) {
    // Solo rango solicitado para exportación: A14:F24
    const rango = shNota.getRange('A14:F24');
    const grisSuave = '#b7b7b7';

    rango.setBorder(
      true,  // top
      true,  // left
      true,  // bottom
      true,  // right
      true,  // vertical
      true,  // horizontal
      grisSuave,
      SpreadsheetApp.BorderStyle.SOLID
    );
  }

  return {
    abrirSelectorProductos,
    obtenerInventarioParaUI,
    obtenerResponsablesParaUI,
    obtenerSeleccionActualParaUI,
    guardarSeleccionProductos,
    generarNota,
    generarFactura,
    generarCotizacion,
    exportarNotaPDF,
    limpiarNota,
    darCambio
  };
})();

