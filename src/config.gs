/**
 * config.gs - Configuración Maestra LOTO 2026
 * Centraliza coordenadas, IDs y nombres de hojas.
 */

const CFG = {
  // Nombres de las pestañas en el Google Sheet
  SHEETS: {
    BASE: 'Base',
    INV: 'Inventario',
    NOTA: 'Nota',
    MPS: 'MPS SEMANAL',
    MPS_DETALLE: 'MPS DETALLE'
  },

  // Mapeo de columnas de la hoja "Base"
  BASE_COL: {
    FECHA_PEDIDO: 1,       // A
    FOLIO: 2,              // B
    TEL: 3,                // C
    CLIENTE: 4,            // D
    PRODUCTOS: 5,          // E
    FECHA_ENTREGA: 6,      // F
    TOTAL: 7,              // G
    ANTICIPO: 8,           // H
    METODO_PAGO: 9,        // I
    RESPONSABLE: 10,       // J
    ESTATUS_VENTA: 11,     // K
    ESTATUS_PROD: 12,      // L
    // --- Columnas de Ingeniería ---
    CHECKBOX_ENTREGA: 13,   // M (Casilla de verificación)
    FECHA_ENTREGA_REAL: 14  // N (Timestamp automático)
  },

  // Configuración de celdas para la generación de Notas/PDFs
  NOTA: {
    CELDA_FOLIO: 'A5',
    RANGO_FECHA_PEDIDO: 'B11:F11',
    RANGO_FECHA_ENTREGA: 'E13:F13',
    DETALLE_START: 14,
    DETALLE_END: 22,
    COL_DESC: 1,     // A
    COL_CANT: 2,     // B
    COL_UD: 3,       // C
    COL_PRECIO: 4,   // D
    COL_SUBTOTAL: 5, // E
    CELDA_ANTICIPO: 'E23',
    CELDA_TOTAL: 'E24'
  },

  // IDs de carpetas en Google Drive
  PDF: {
    FOLDER_ID: '1pVW-moG52ka3mwelTOzqpkPPieh8bmub', // Carpeta Notas
    FACTURA_FOLDER_ID: '1pVW-moG52ka3mwelTOzqpkPPieh8bmub',
    COTIZACION_FOLDER_ID: '1Rl3W4_2X2z8Wskq0f3E7-4aNyH_1Rv9m'
  }
};
