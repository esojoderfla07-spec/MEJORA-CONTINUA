const CFG = {
  SHEETS: {
    BASE: 'Base',
    INV: 'Inventario',
    NOTA: 'Nota'
  },

  BASE_COL: {
    FECHA: 1,       // A
    FOLIO: 2,       // B
    TEL: 3,         // C
    CLIENTE: 4,     // D
    PRODUCTOS: 5,   // E
    ENTREGA: 6,     // F
    TOTAL: 7,       // G
    ANTICIPO: 8,    // H
    METODO: 9,      // I
    KANBAN: 10      // J
  },

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

  PDF: {
    FOLDER_ID: '1pVW-moG52ka3mwelTOzqpkPPieh8bmub',
    FACTURA_FOLDER_ID: '1pVW-moG52ka3mwelTOzqpkPPieh8bmub'
  }
};
