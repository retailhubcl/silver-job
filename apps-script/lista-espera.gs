// Silver Job: recepción del formulario de la lista de espera.
// Reemplaza el código actual del proyecto de Apps Script por este,
// y luego publica una NUEVA VERSIÓN de la implementación existente
// (Implementar > Gestionar implementaciones > editar > Versión: nueva versión),
// para que la URL del formulario siga siendo la misma.

const CAMPOS = ["fecha", "tipo", "nombre", "correo", "empresa", "area", "horas", "linkedin", "anios", "consentimiento"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    // Campo trampa: si viene lleno, es un bot. Respondemos éxito sin guardar.
    if (p.sitio) return responder({ result: "success" });

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const encabezados = hoja.getLastColumn() > 0
      ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0]
      : [];
    // Agrega las columnas que falten, sin tocar las existentes
    CAMPOS.forEach(function (c) {
      if (encabezados.indexOf(c) === -1) {
        encabezados.push(c);
        hoja.getRange(1, encabezados.length).setValue(c);
      }
    });
    const fila = encabezados.map(function (c) { return c === "fecha" ? new Date() : (p[c] || ""); });
    hoja.appendRow(fila);
    return responder({ result: "success" });
  } catch (err) {
    return responder({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
