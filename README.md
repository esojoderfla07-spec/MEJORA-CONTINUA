# LOTO Sublimación – Sistema de Notas y Pedidos

Sistema operativo integral para capturar pedidos en Google Sheets, centralizar la información en la hoja **Base**, gestionar precios desde **Inventario**, y automatizar la generación de documentos (PDF) hacia Google Drive.

Este proyecto utiliza una arquitectura de **Google Apps Script + Google Sheets + HTML (HtmlService)** gestionada profesionalmente desde un entorno de desarrollo local.

---

## 🛠️ Entorno de Desarrollo y Sincronización
Para mantener la integridad del código y facilitar la mejora continua, el sistema se gestiona localmente:
- **VS Code**: Editor principal de desarrollo.
- **Node.js & npm**: Motor para herramientas de automatización.
- **clasp**: Sincroniza los archivos locales con Google Apps Script.
- **Git & GitHub**: Control de versiones y respaldo maestro del código.

### Comandos de Operación:
- `git pull origin main`: Sincronizar cambios desde el repositorio remoto.
- `clasp push`: Subir el código local al entorno de laboratorio o producción.

---

## 📁 Estructura de Almacenamiento (Google Drive)
El sistema organiza y guarda los documentos generados automáticamente en las siguientes rutas oficiales:
- 📂 **Cotizaciones**: [Ver Carpeta](https://drive.google.com/drive/u/0/folders/1QJOirou5DohpLnxvNhyPbX9sehcQB2B6)
- 📂 **Facturas**: [Ver Carpeta](https://drive.google.com/drive/u/0/folders/1SeQ71jZKrswVBqe04YbW9JIW4U2MWOEK)
- 📂 **Notas de Venta**: [Ver Carpeta](https://drive.google.com/drive/u/0/folders/1L6n7QJm30sssO0BjiOoEaoXxEaZYvf60)

---

## 🏗️ Arquitectura del Sistema
- **Hoja "Base"**: Única fuente de verdad (clientes, folios, fechas, anticipos, totales).
- **Hoja "Inventario"**: Maestro de productos, precios y unidades.
- **Hoja "Nota"**: Interfaz de usuario en Sheets para captura y diseño de impresión.
- **Apps Script (.gs)**: Automatización de lógica (folios, guardado, generación de PDF).
- **Reglas de Cálculo**: "Sheets-First". Las fórmulas de la hoja mandan; el Script solo lee y transporta los resultados finales.

---

## ⚠️ Control de Calidad y Mejora Continua (Lean Six Sigma)
Bajo el rol de **Black Belt**, el sistema prioriza la reducción de defectos y desperdicios (Muda).

### Puntos Críticos a Atender (Poka-Yoke):
1. **Validación de Estatus**: Implementación de alertas si una nota no cambia a "Entregado" (evitar retrasos en flujo).
2. **Asignación Obligatoria**: Restricción de generación de documentos si no se ha asignado un responsable de la nota.
3. **Estandarización de Medidas**: Evitar la suma manual de dimensiones en lonas; cada ítem debe registrarse por separado para precisión en costos y material.

### KPIs Operativos:
- **Takt Time**: Medición del tiempo de procesamiento mediante el disparador en **Columna M** y registro en **Columna N**.
- **Tasa de Defectos**: Conteo de folios duplicados o errores de captura por semana.
- **WIP (Work In Progress)**: Monitoreo de pedidos atrasados o no cerrados.

---

## 🚀 Roadmap Incremental
1. **Fase 1**: Registro robusto en Base + PDF estable en Drive (Actual).
2. **Fase 2**: Validaciones automáticas (Poka-Yokes) para evitar errores de captura.
3. **Fase 3**: Tablero Kanban en Sheets para gestión visual de producción.
4. **Fase 4**: Integración con AppSheet para movilidad y notificaciones en tiempo real.

## Soporte y Documentación
En caso de fallo, documentar:
1. Acción realizada.
2. Folio afectado.
3. Captura de pantalla del error en consola o interfaz.
