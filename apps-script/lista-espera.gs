// Silver Job: recepción del formulario de la lista de espera.
// Reemplaza el código actual del proyecto de Apps Script por este,
// y luego publica una NUEVA VERSIÓN de la implementación existente
// (Implementar > Gestionar implementaciones > editar > Versión: nueva versión),
// para que la URL del formulario siga siendo la misma.

// Pestaña donde se guardan los registros (la primera pestaña tiene una tabla dinámica)
const HOJA = "Registros";

// Campo que envía el sitio → encabezado de la columna en la planilla
const COLUMNAS = [
  ["fecha", "Fecha"],
  ["tipo", "Tipo"],
  ["nombre", "Nombre"],
  ["correo", "Correo"],
  ["empresa", "Empresa"],
  ["area", "Área"],
  ["horas", "Horas al mes"],
  ["linkedin", "LinkedIn"],
  ["anios", "Años de experiencia"],
  ["consentimiento", "Consentimiento"],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    // Campo trampa: si viene lleno, es un bot. Respondemos éxito sin guardar.
    if (p.sitio) return responder({ result: "success" });

    const hoja = obtenerHoja();
    const encabezados = prepararEncabezados(hoja);
    const fila = encabezados.map(function (titulo) {
      const par = COLUMNAS.filter(function (c) { return c[1] === titulo; })[0];
      if (!par) return "";
      return par[0] === "fecha" ? new Date() : (p[par[0]] || "");
    });
    hoja.appendRow(fila);
    return responder({ result: "success" });
  } catch (err) {
    return responder({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function obtenerHoja() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!hoja) throw new Error("No existe la pestaña " + HOJA);
  return hoja;
}

// Agrega al final las columnas que falten, sin tocar las existentes
function prepararEncabezados(hoja) {
  const encabezados = hoja.getLastColumn() > 0
    ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0]
    : [];
  COLUMNAS.forEach(function (c) {
    if (encabezados.indexOf(c[1]) === -1) {
      encabezados.push(c[1]);
      hoja.getRange(1, encabezados.length).setValue(c[1]);
    }
  });
  return encabezados;
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Prueba desde el editor (seleccionar "probar" y Ejecutar): revisa la pestaña y los
// encabezados sin guardar ningún registro. El resultado aparece en el registro de ejecución.
function probar() {
  const encabezados = prepararEncabezados(obtenerHoja());
  Logger.log("Encabezados: " + encabezados.join(" | "));
  Logger.log("Respuesta a un bot: " + doPost({ parameter: { sitio: "x" } }).getContent());
}
