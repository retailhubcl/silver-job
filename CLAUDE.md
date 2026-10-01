# Silver Job — contexto del proyecto

Marketplace chileno de **gerentes fraccionales**: conecta ejecutivos C-Level senior ("generación silver") con pymes que no pueden contratar un gerente a tiempo completo y lo contratan por horas. Un mismo ejecutivo puede atender a varias pymes. Fundador: Tomás.

Idioma de todo el proyecto: **español de Chile (es-CL)**. Moneda: CLP. Los **precios a la pyme incluyen IVA** (19%, sobre el total); los valores hora del ejecutivo son montos de honorarios, sin IVA.

---

## 1. Infraestructura

| Elemento | Detalle |
|---|---|
| Dominio | silverjob.cl (comprado en NIC Chile, DNS en Cloudflare apuntando a Vercel) |
| Hosting | Vercel (también responde en silverjob.vercel.app) |
| Repositorio | github.com/retailhubcl/silver-job (despliegue automático a Vercel al hacer push a main) |
| Stack | Next.js 16 (App Router, TypeScript), framework "Next.js" en el proyecto `silverjob` de Vercel |
| Formulario | POST a Google Apps Script → planilla de Google |
| Analítica | Vercel Web Analytics con `@vercel/analytics` (`<Analytics />` en `app/layout.tsx`) |
| Pagos | Mercado Pago Checkout Pro (`/pagar`, `/api/checkout`, webhook `/api/webhooks/mercadopago`) |
| Contacto público | tomas@silverjob.cl |

Endpoint del formulario (Apps Script):
`https://script.google.com/macros/s/AKfycbxc9xATW38mu8vuTBH9ONiVOnxAA4EaSBHx4m2Vttzy_uW9YY8XFrOF3X7svCHYidTF/exec`

### Estructura del repositorio

```
app/
  layout.tsx                  Metadatos, fuentes y analítica
  globals.css                 Estilos del sitio (sistema de diseño de abajo)
  page.tsx                    Página principal
  privacidad/page.tsx         Política de privacidad (noindex); /privacidad.html redirige aquí
  pagar/page.tsx              Cotizar y pagar un plan o bloques (?tipo=bloque); noindex, no enlazada desde la landing
  pago/[estado]/page.tsx      Vuelta desde Mercado Pago: exito, pendiente, error
  api/checkout/route.ts       Crea la preferencia de Checkout Pro y redirige
  api/webhooks/mercadopago/route.ts   Valida x-signature y consulta el pago
components/                   Anillo, CalendarioPatricia, Cotizador, EnlaceRegistro, FormularioLista, GuiaPlan
lib/                          precios (única fuente de precios), mercadopago (API), firma (webhook), eventos
public/img/                   og.jpg, ejecutivo.jpg, patricia-*.jpg
apps-script/lista-espera.gs   Código del Apps Script del formulario (se copia a mano en Google)
```

Comandos: `npm run dev`, `npm test` (firma del webhook y precios), `npm run build`.

### Variables de entorno (Vercel)

| Variable | Estado |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Cargada en Production: `https://silverjob.cl` |
| `MERCADOPAGO_ACCESS_TOKEN` | Pendiente (Sensitive) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Pendiente (Sensitive) |
| `NEXT_PUBLIC_LISTA_ENDPOINT` | Opcional; por defecto el endpoint de abajo |

---

## 2. Estado del sitio (versión actual)

### Secciones, en orden

1. **Encabezado fijo** (sticky, fondo noche): logo + enlaces Para pymes / Para ejecutivos / Planes / Preguntas + botón "Súmate a la lista". En móvil (<900 px) los enlaces pasan a una segunda fila con scroll horizontal.
2. **Hero**: título "La experiencia no se jubila.", bajada corta, botones "Súmate como pyme" y "Súmate como ejecutivo". Foto de Patricia con leyenda "ex gerenta de operaciones, asesora a tres pymes, 60 horas al mes".
3. **Puente** (fondo plateado): "Hay pymes que crecieron más rápido que su equipo de gestión. Y ejecutivos con décadas de experiencia, listos para su próximo desafío. Silver Job junta a los dos."
4. **Caso Patricia**: calendario de un mes con sus tres pymes (viña, panadería, transportes). Rotulado como caso ilustrativo.
5. **Para pymes** (`#pymes`): beneficios (incluye "Perfiles validados y evaluados" con mención al sello Plata certificada), **comparación de costo** con barras (gerente full time $6,7–9,8 MM/mes según guía salarial Robert Half Chile vs. plan Estándar de 18 h ≈ $1,5 MM/mes, rotulado como estimación referencial) y "Cómo funciona" en 3 pasos.
6. **Planes** (`#planes`): los tres tramos dibujados como una regla de 0 a 40 h, con barras proporcionales en tonos plata. Muestra el precio hora con IVA por tramo y gerencia, tomado de `lib/precios.ts`. **Guía "¿Qué plan necesitas?"**: 2 preguntas con radios que sugieren un tramo, lo marcan como "Sugerido" y lo preseleccionan en el formulario. Reglas: contratación hasta el día 5, horas del mes, bloques adicionales, un solo pago.
7. **Para ejecutivos** (`#ejecutivos`): diagramación invertida respecto de pymes, viñetas con forma de lingote, nota "Crear tu perfil es gratis. Solo pagas un fee único cuando se concreta un match". Bloque **Plata certificada** con lingote grande y ejemplo de nota 4,8 (el quinto lingote lleno al 80%). "Cómo funciona" en 3 pasos (incluye agenda).
8. **Preguntas frecuentes** (`#preguntas`): acordeón con `<details>`: responsabilidad del trabajo, horas no usadas, validación, pagos, costo para ejecutivos, confidencialidad.
9. **Formulario** (`#lista`): selector Soy pyme / Soy ejecutivo, casilla de consentimiento obligatoria con enlace a privacidad, confirmación con botones para compartir por WhatsApp y copiar el enlace.
10. **Pie**: frase "quiénes somos", tomas@silverjob.cl, política de privacidad, © 2026.

### Formulario

Campos enviados (URLSearchParams): `tipo` (pyme/ejecutivo), `nombre`, `correo`, `empresa`, `area`, `horas`, `linkedin`, `anios`, `consentimiento`, más `sitio` (campo trampa antibots).

- Opciones de `horas`: "Hasta 10 (Básico)", "Entre 11 y 26 (Estándar)", "Entre 27 y 40 (Intensivo)", "Aún no lo sé".
- LinkedIn es `type="text"`; el JS agrega `https://` si falta y exige que contenga `linkedin.com/in/`.
- El envío **no** usa `mode: "no-cors"`: lee la respuesta y solo confirma si la planilla devuelve `{"result":"success"}`. Si no, muestra error con el correo de contacto.
- El Apps Script (`apps-script/lista-espera.gs`) devuelve JSON con ContentService, agrega las columnas faltantes por nombre y descarta envíos con el campo trampa lleno.

### Analítica

Los eventos se envían con `track()` de `@vercel/analytics`: `clic_registro` (con `tipo`) y `registro` (con `tipo`). Las visitas funcionan en el plan gratuito de Vercel; los eventos personalizados requieren plan Pro.

### Sistema de diseño

Tipografías (Google Fonts): títulos **Source Serif 4**, texto **Source Sans 3**.

```
--plata: #EDEFF1        fondo principal
--plata-2: #E1E5E9
--panel: #F8F9FA        tarjetas, preguntas frecuentes
--linea: #C3CAD1
--grafito: #1E2A36      texto principal
--grafito-2: #4A5866    texto secundario
--noche: #16202A        secciones oscuras, encabezado
--tinta: #3D6FD1        solo foco de accesibilidad
--vino: #A3324F, --trigo: #D9A33A   solo para datos (calendario) y el logo
Grises de tramos: #D5DAE0, #A9B2BC, #6F7B87
Degradado plata (lingote): #F7F8FA → #C9D0D7 → #8E99A5
```

Principios: la plata es el color protagonista; los colores del logo (vino, trigo, tinta) quedan solo para datos. El **lingote de plata** es el elemento gráfico de marca (evaluaciones, sello, viñetas de ejecutivos). Logo: anillo de tres colores con la palabra "silverjob". Título del hero en blanco, tipografía formal.

### Reglas de redacción

- Verbo único para las acciones: **"Súmate"** ("Súmate a la lista", "Súmate como pyme", "Súmate como ejecutivo", "Súmate con este plan").
- Tono digno hacia los ejecutivos: se presentan como elegidos, no rescatados. No usar frases como "el mercado dejó de llamar".
- No atribuir el sello Plata certificada a casos ilustrativos: antes del lanzamiento nadie está certificado.
- No publicar precios hasta que estén definidos.

---

## 3. Modelo de negocio (decisiones de Tomás)

### Suscripción mensual de la pyme

| Tramo | Horas al mes |
|---|---|
| Básico | 1 a 10 |
| Estándar | 11 a 26 (el que se espera más popular) |
| Intensivo | 27 a 40 |

- Pago único mensual **todo incluido**: cubre el margen de la plataforma y el pago al ejecutivo.
- Opción de plan anual.
- **Fee de match**: cobro único al concretarse la conexión, a **ambas partes** por separado (montos distintos para pyme y ejecutivo).
- **Horas incrementales**: bloques de 5 h con recargo de 10% sobre el precio hora del tramo.

### Precios (definidos, octubre de 2026)

**Mensualidad** = horas contratadas × precio hora del tramo, según la gerencia. Se fija al contratar y se paga por adelantado; no depende del uso.

**Precio hora para la pyme (IVA incluido).** Margen de Silver Job sobre el precio neto (Básico 30%, Estándar 25%, Intensivo 20%), más 19% de IVA sobre el total, redondeado al múltiplo de $500: `precio = redondeo500(valor hora del ejecutivo / (1 − margen) × 1,19)`.

| Tramo | Gerente General | Otras gerencias |
|---|---|---|
| Básico (1 a 10 h) | $127.500 | $102.000 |
| Estándar (11 a 26 h) | $119.000 | $95.000 |
| Intensivo (27 a 40 h) | $111.500 | $89.500 |

Por el redondeo, los márgenes reales de otras gerencias quedan en 24,8% (Estándar) y 20,2% (Intensivo).

- **Piso entre tramos**: la mensualidad nunca es menor que el tope del tramo anterior. En la práctica solo afecta a 27 h: se cobra lo mismo que 26 h en Estándar ($3.094.000 con Gerente General, $2.470.000 con otras gerencias).
- **Bloques adicionales de 5 h** (recargo 10% sobre el precio hora del tramo, redondeado a $500). Se pueden sumar aunque la pyme ya tenga 40 h; no cambian el tramo.

| Tramo | Bloque de 5 h, Gerente General | Bloque de 5 h, otras gerencias |
|---|---|---|
| Básico | $702.500 | $560.000 |
| Estándar | $655.000 | $522.500 |
| Intensivo | $612.500 | $492.500 |

- **Plan anual**: pago adelantado de 12 mensualidades con 10% de descuento, en un solo cobro. Las horas de cada mes se siguen consumiendo dentro de ese mes. Ejemplo: 18 h al mes de Operaciones = $1.710.000 × 12 × 0,9 = $18.468.000.
- **Fee de match** (IVA incluido): **$150.000 a la pyme**, cobrado con Mercado Pago; **$50.000 al ejecutivo**, descontado de su primera liquidación.
- **Comparación de costo del sitio**: se mantiene "cerca de $1,5 millones" (18 h del plan Estándar con el mix 30/70 = $1.545.882 netos).

### Valores hora de referencia (lo que recibe el ejecutivo)

- Gerente General: **$75.000** por hora.
- Otras gerencias (Operaciones, Marketing, Finanzas, Comercial): **$60.000** por hora.

### Flujo de dinero

- Todo pasa por la plataforma; nunca hay pagos directos entre pyme y ejecutivo.
- La pyme paga por adelantado al contratar.
- Silver Job liquida al ejecutivo **a fin de mes** por las horas efectivamente trabajadas (registradas como "realizadas" en la agenda), descontando su margen. El ejecutivo emite boleta de honorarios por el monto liquidado.

### Reglas de operación

- Las horas se contratan **hasta el día 5** de cada mes.
- La bolsa de horas se consume **obligatoriamente dentro del mes** contratado; no se traspasa ni se reembolsa.
- Cancelación válida: **24 h de anticipación** (para ambas partes).
- La pyme tiene **un reagendamiento al mes en total**. Si cancela con menos de 24 h o ya usó su reagendamiento, pierde la hora y el ejecutivo la cobra.
- Si el ejecutivo no entrega la hora, no se le paga y la hora queda como **crédito para la pyme en el mes siguiente**.

### Módulo de agenda (plataforma futura)

Solo coordina horarios y el estado de cada sesión (agendada, realizada, cancelada). **No guarda el contenido** de las sesiones, por resguardo de datos. Genera data agregada de demanda por tipo de gerencia a nivel nacional (insumo para reclutamiento, fundraising y marketing).

### Evaluaciones

- Bidireccional: la pyme califica al ejecutivo con **1 a 5 lingotes**; el ejecutivo también evalúa a la pyme.
- Sello **"Plata certificada"**: promedio de 4,5 lingotes o más, al menos 3 meses en la plataforma y mínimo 10 evaluaciones. Se revisa cada trimestre y se pierde si el promedio baja.
- La evaluación de la pyme es **solo de uso interno** (priorizar matches, detectar cancelaciones frecuentes).

### Responsabilidad

Los entregables del trabajo son **responsabilidad exclusiva de las partes** que se contratan entre sí (pyme y ejecutivo). Silver Job es intermediaria de matching, agenda y pagos, y no responde por la calidad ni el cumplimiento del trabajo.

---

## 4. Supuestos de la planilla de pricing

Los precios definidos están en la sección 3. Esta planilla queda como referencia para escenarios (mix, horas promedio, punto de equilibrio).

Archivo: `silver-job-modelo-pricing.xlsx` (pestañas Supuestos, Precios, Escenarios). Las celdas amarillas son editables. **Estos montos son propuestas, no decisiones**:

- Margen de la plataforma sobre el valor hora: Básico 30%, Estándar 25%, Intensivo 20%.
- Horas promedio contratadas: Básico 8, Estándar 18, Intensivo 33.
- Mix de demanda: 30% Gerente General, 70% otras gerencias (valor hora ponderado ≈ $64.500).
- Fee de match: $150.000 a la pyme y $50.000 al ejecutivo.
- Recargo de horas incrementales: 12,5%. Descuento del plan anual: 10%.
- Comisión de la pasarela de pago: 3%. Costos fijos: $1,5 MM al mes. Capacidad: 60 h por ejecutivo al mes.
- Resultado con estos supuestos: plan Estándar ≈ $1,45 MM al mes; punto de equilibrio ≈ 7 pymes activas.

---

## 5. Documentos relacionados

- **Borrador de Términos y Condiciones** (Claude Doc): recoge todas las reglas de la sección 3 y una lista de puntos para el abogado (Ley 19.628 y Ley 21.719 de datos personales, riesgo de relación laboral y Ley 21.431, cláusula de no elusión, horas no reembolsables frente a protección al consumidor, tratamiento tributario, término del plan anual). Pregunta abierta: si el ejecutivo avisa con 24 h o más, ¿puede reagendar dentro del mes antes de que la hora pase a crédito?
- **Kit de redes** (Instagram y LinkedIn): carpeta de Google Drive "silver-job-kit-redes".

---

## 6. Pendientes

**Para dejar operativa la versión publicada (Next.js, ya en producción):**
1. Reemplazar el código del Apps Script por `apps-script/lista-espera.gs` y publicar una **nueva versión de la implementación existente**, para que la URL no cambie. Mientras no se haga, el formulario puede mostrar error aunque el registro se guarde.
2. Activar Web Analytics en el proyecto de Vercel.
3. Mercado Pago: crear la aplicación, configurar el webhook (`https://silverjob.cl/api/webhooks/mercadopago`, evento Pagos) y cargar las credenciales en Vercel.
4. `/pagar` informa la regla del día 5, pero no bloquea el pago fuera de plazo. El fee de match se suma al primer pago según lo que declara la pyme (casilla "primera contratación"); Silver Job lo verifica a mano hasta que exista una base de datos.
5. Guardar los pagos confirmados en una base de datos (hoy quedan en los logs de Vercel y en el panel de Mercado Pago).

**Negocio:**
- Descontar el fee de match del ejecutivo en su primera liquidación (proceso de liquidaciones aún no construido).
- Revisión legal de los términos y de la política de privacidad.

**Mejoras de UX pendientes (esfuerzo alto):**
- Separar los recorridos en páginas `/pymes` y `/ejecutivos`, cada una con su formulario.
- Reemplazar las imágenes ilustrativas por fotos y testimonios reales de los pilotos.
- Rediseñar el logo para que evoque la plata (obliga a actualizar el kit de redes).
