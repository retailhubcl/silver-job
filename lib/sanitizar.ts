// Limpieza de textos que llegan de formularios públicos.

// Quita caracteres de control (incluidos saltos de línea) y recorta al largo máximo
export function limpiar(valor: unknown, max: number): string {
  return String(valor ?? "")
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Una planilla interpreta como fórmula todo texto que empieza con = + - @ (inyección de fórmulas,
// p. ej. =IMPORTXML que filtra otras filas). Se antepone un apóstrofe para que quede como texto.
// Solo se usa al exportar o reenviar a hojas de cálculo; la base de datos guarda el valor original.
export function neutralizarFormula(valor: string): string {
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}
