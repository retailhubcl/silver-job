// Eventos del navegador para coordinar los botones de registro con el formulario
export type TipoRegistro = "pyme" | "ejecutivo";

export const EVENTO_TIPO = "silverjob:tipo";
export const EVENTO_PLAN = "silverjob:plan";

export function elegirTipo(tipo: TipoRegistro) {
  window.dispatchEvent(new CustomEvent<TipoRegistro>(EVENTO_TIPO, { detail: tipo }));
}

export function sugerirHoras(opcion: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENTO_PLAN, { detail: opcion }));
}
