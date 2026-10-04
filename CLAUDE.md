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
`https://script.google.com/macros/s/AKfycbw9Np-Q-NXn1vAJLqxbbgqyIYjTI8gS5pbItaat_oL4s_3Z1MMuSQgNzQtKq3HFOg_E/exec`

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
components/                   CalendarioPatricia, Cotizador, Encabezado, EnlaceRegistro, FormularioLista, GuiaPlan, Pie, Simbolo
lib/                          precios (única fuente de precios), validacion (formulario de la lista), mercadopago (API), firma (webhook), eventos
app/fuentes/                  Source Sans 3 y Source Serif 4 (woff2, subconjunto latino) con sus licencias
app/robots.ts, sitemap.ts     robots.txt y sitemap.xml; íconos en app/icon.svg, apple-icon.png y favicon.ico
public/img/                   og.jpg, ejecutivo.jpg, patricia-*.jpg (se sirven con next/image)
apps-script/lista-espera.gs   Código del Apps Script del formulario (se copia a mano en Google)
```

Comandos: `npm run dev`, `npm test` (precios, checkout y firma del webhook), `npm run build`.

### Variables de entorno (Vercel)

| Variable | Estado |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Cargada en Production: `https://silverjob.cl` |
| `MERCADOPAGO_ACCESS_TOKEN` | Pendiente (Sensitive) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Pendiente (Sensitive) |
| `NEXT_PUBLIC_LISTA_ENDPOINT` | Cargada en Production y Preview con el endpoint de abajo (proyecto de Apps Script vinculado a la planilla "Registros Silver Job"). Al cambiarla hay que volver a desplegar |

---

## 2. Estado del sitio (versión actual)

### Secciones, en orden

1. **Encabezado fijo** (sticky, fondo noche): logo + enlaces Para pymes / Para ejecutivos / Planes / Preguntas + botón "Súmate a la lista". En móvil (<900 px) los enlaces pasan a una segunda fila con scroll horizontal.
2. **Hero**: título "La experiencia no se jubila.", bajada corta, botones "Súmate como pyme" y "Súmate como ejecutivo". Foto de Patricia con leyenda "ex gerenta de operaciones, asesora a tres pymes, 60 horas al mes".
3. **Puente** (fondo plateado): "Hay pymes que crecieron más rápido que su equipo de gestión. Y ejecutivos con décadas de experiencia, listos para su próximo desafío. Silver Job junta a los dos."
4. **Caso Patricia**: calendario de un mes con sus tres pymes (viña, panadería, transportes). Rotulado como caso ilustrativo.
5. **Para pymes** (`#pymes`): beneficios (incluye "Perfiles validados y evaluados" con mención al sello Plata certificada), **comparación de costo** con barras (gerente full time $6,7–9,8 MM/mes según guía salarial Robert Half Chile vs. plan Estándar de 18 h ≈ $1,5 MM/mes, rotulado como estimación referencial) y "Cómo funciona" en 3 pasos.
6. **Planes** (`#planes`): los tres tramos dibujados como una regla de 0 a 40 h, con barras proporcionales en tonos plata. Muestra el precio hora con IVA por tramo y gerencia, tomado de `lib/precios.ts`. **Guía "¿Qué plan necesitas?"**: 2 preguntas con radios que sugieren un tramo, lo marcan como "Sugerido" y lo preseleccionan en el formulario. Cada tramo muestra el precio hora y el rango de la mensualidad ("Al mes: …", calculado con `rangoMensual`). Reglas: contratación hasta el día 5, las horas no se acumulan, bloques adicionales con precio de ejemplo y aviso de subir de plan, plan anual con ejemplo, pagas solo a Silver Job (sin matrícula, comisiones ni fees).
7. **Para ejecutivos** (`#ejecutivos`): diagramación invertida respecto de pymes, viñetas con forma de lingote, nota "Sumarte es gratis, sin fees ni comisiones: recibes el valor hora acordado por cada hora trabajada". Bloque **Plata certificada** con lingote grande y ejemplo de nota 4,8 (el quinto lingote lleno al 80%). "Cómo funciona" en 3 pasos (incluye agenda).
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

Tipografías (servidas desde el sitio con `next/font/local`, archivos y licencias OFL en `app/fuentes/`): títulos **Source Serif 4** (con eje óptico), texto **Source Sans 3**.

```
--plata: #EDEFF1        fondo principal
--plata-2: #E1E5E9
--panel: #F8F9FA        tarjetas, preguntas frecuentes
--linea: #C3CAD1
--grafito: #1E2A36      texto principal
--grafito-2: #4A5866    texto secundario
--noche: #16202A        secciones oscuras, encabezado
--tinta: #3D6FD1        solo foco de accesibilidad
--vino: #A3324F, --trigo: #D9A33A   solo para datos (calendario)
Grises de tramos: #D5DAE0, #A9B2BC, #6F7B87
Degradado plata (lingote): #F7F8FA → #C9D0D7 → #8E99A5
```

Principios: la plata es el color protagonista; vino, trigo y tinta quedan solo para datos. El **lingote de plata** es el elemento gráfico de marca (evaluaciones, sello, viñetas de ejecutivos). Título del hero en blanco, tipografía formal.

**Logo (desde el 4 de octubre de 2026):** la «S» del encuentro dentro de un marco, más el nombre «Silver Job» en Source Serif 4 600 con «Silver» en plata.
- Símbolo: la «S» de Source Serif 4 (peso 700, tamaño óptico 60) con las puntas en corte diagonal limpio (sin el gancho de la fuente), partida por la columna central en dos piezas: la pyme y el ejecutivo que se encuentran. Contornos ya recortados en `components/Simbolo.tsx`; colores en `.simbolo` (`--s-arriba`, `--s-abajo`, `--s-marco`) en `globals.css`.
- Variantes: `marco` (encabezado, pie, tarjetas), `lleno` (fondo noche, sin marco: íconos de pestaña, iPhone y avatar) y `solo` (la «S» sin marco: símbolo entre pymes y ejecutivos y fondos decorativos).
- Colores: sobre fondo oscuro, pieza superior #F7F8FA, inferior #A9B2BC, marco #7D8894; sobre fondo claro, #1E2A36, #6F7B87 y #6F7B87. «Silver» en #C9D0D7 sobre oscuro y #6F7B87 sobre claro (en el pie, a 24 px para cumplir 3:1 como texto grande).
- Íconos: `app/icon.svg`, `app/apple-icon.png` (180 px) y `app/favicon.ico` (32 y 48 px). Imagen para compartir: `public/img/og.jpg` (1200 × 630).
- Si el logo se registra como marca, conviene que un diseñador haga el ajuste final para que el dibujo sea propio (hoy deriva de una fuente con licencia OFL).

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
- **Sin fees** (decidido el 4/10/2026): no hay fee de match ni otros cobros, ni para la pyme ni para el ejecutivo. El ingreso de Silver Job es solo el margen incluido en el precio hora.
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
- **Fee de match: eliminado** (4/10/2026). Antes eran $150.000 a la pyme y $50.000 al ejecutivo. Se evaluó reemplazarlo por una comisión de 15% del precio, pero bajaba el ingreso de Silver Job cerca de 42% (18 h de otras gerencias por 12 meses: $2,59 MM netos frente a $4,45 MM). Con los precios actuales y sin fees, el ingreso baja ~4% por cliente anual (~14% si el cliente se queda 3 meses), y el margen sigue siendo 20–30% del precio neto.
- **Mensualidad por tramo** (con IVA): Básico hasta $1.275.000 (GG) / $1.020.000 (otras); Estándar $1.309.000–$3.094.000 / $1.045.000–$2.470.000; Intensivo $3.094.000–$4.460.000 / $2.470.000–$3.580.000.
- **Comparación de costo del sitio**: 18 h de Operaciones en el plan Estándar, $1.710.000 con IVA (unos $1.437.000 netos, para comparar con un sueldo). Antes decía "cerca de $1,5 millones" con una mezcla de gerencias, que no cuadraba con el ejemplo de Planes.

### Valores hora de referencia (lo que recibe el ejecutivo)

- Gerente General: **$75.000** por hora.
- Otras gerencias (Operaciones, Marketing, Finanzas, Comercial): **$60.000** por hora.

### Flujo de dinero

- Todo pasa por la plataforma; nunca hay pagos directos entre pyme y ejecutivo.
- La pyme paga por adelantado al contratar.
- Silver Job liquida al ejecutivo **a fin de mes** por las horas efectivamente trabajadas (registradas como "realizadas" en la agenda), sin descuentos: recibe su valor hora completo (el margen de Silver Job ya está en el precio que paga la pyme). El ejecutivo emite boleta de honorarios por el monto liquidado.

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

## 4. Planilla de pricing

Archivo vigente: **`silver-job-modelo-pricing-v2.xlsx`** en la carpeta de Silver Job en Google Drive ([abrir](https://drive.google.com/file/d/12Yy-kdWHq6mpjyp27nuHWEV7by4OYlPI/view)), del 4/10/2026, **sin fee de match**. Reemplaza a `silver-job-modelo-pricing.xlsx` (v1, con fee, que no está en Drive). Pestañas:

- **Supuestos**: celdas amarillas editables. Incluye los valores hora, el IVA, el redondeo, el recargo de bloques (10%), el descuento anual, los tramos con su margen y horas promedio, la comisión de la pasarela (3%), los costos fijos ($1,5 MM al mes), la capacidad (60 h por ejecutivo), el mix (30% Gerente General) y dos supuestos nuevos: el % de pymes por tramo (30/50/20) y la permanencia promedio (12 meses).
- **Precios**: precio hora con y sin IVA, margen real, mensualidad mínima (con piso) y máxima, y bloque de 5 h por tramo y gerencia, todo con fórmulas. Reproduce los precios del sitio y el ejemplo de 18 h ($1.710.000 al mes, $18.468.000 al año).
- **Escenarios**: cobro, pago a ejecutivos, comisión de la pasarela y contribución de una pyme típica de cada tramo; punto de equilibrio (~5 pymes activas con la distribución 30/50/20, 2 ejecutivos); y el impacto de quitar el fee (~4% de la contribución de una pyme en 12 meses).

El resultado de Estándar coincide con la v1 (cobro neto $1.545.882 con el mix 30/70). El punto de equilibrio baja de ~7 pymes (v1) a ~5 porque la v2 usa los precios definidos y la distribución por tramo; la v1 tenía supuestos anteriores (recargo de 12,5%, otros precios).

---

## 5. Documentos relacionados

- **Borrador de Términos y Condiciones** (Claude Doc): recoge todas las reglas de la sección 3 y una lista de puntos para el abogado (Ley 19.628 y Ley 21.719 de datos personales, riesgo de relación laboral y Ley 21.431, cláusula de no elusión, horas no reembolsables frente a protección al consumidor, tratamiento tributario, término del plan anual). Pregunta abierta: si el ejecutivo avisa con 24 h o más, ¿puede reagendar dentro del mes antes de que la hora pase a crédito?
- **Kit de redes** (Instagram y LinkedIn): carpeta de Google Drive "silver-job-kit-redes".

---

## 6. Pendientes

**Para dejar operativa la versión publicada (Next.js, ya en producción):**
1. ~~Publicar el Apps Script~~ Hecho el 1/10/2026: `apps-script/lista-espera.gs` publicado en el proyecto vinculado a la planilla; el sitio usa su URL (`NEXT_PUBLIC_LISTA_ENDPOINT`).
2. ~~Activar Web Analytics~~ Hecho el 1/10/2026 (visitas; los eventos requieren plan Pro).
3. Mercado Pago: crear la aplicación, configurar el webhook (`https://silverjob.cl/api/webhooks/mercadopago`, evento Pagos) y cargar las credenciales en Vercel.
4. `/pagar` informa la regla del día 5, pero no bloquea el pago fuera de plazo.
5. Guardar los pagos confirmados en una base de datos (hoy quedan en los logs de Vercel y en el panel de Mercado Pago).

**Negocio:**
- Validar con el contador el tratamiento del IVA: si el ejecutivo emite boleta de honorarios y Silver Job cobra por mandato, el IVA podría aplicar solo al margen.
- Revisión legal de los términos y de la política de privacidad.

**Mejoras de UX:** ver la sección 7.

---

## 7. Auditoría UX/UI (1 de octubre de 2026)

Ordenada por impacto/esfuerzo. Medición con Lighthouse en móvil simulado sobre la compilación de producción: antes, rendimiento 80 (FCP 2,4 s, Speed Index 4,3 s, TBT 390 ms, LCP 2,9 s sin contar Google Fonts, que no cargaba en el entorno de medición); después de los puntos 2 a 10, rendimiento 94 (FCP 0,9 s, Speed Index 0,9 s, TBT 90 ms, LCP 3,0 s con las fuentes incluidas). Accesibilidad 100 y SEO 100.

| # | Mejora | Tipo | Estado |
|---|---|---|---|
| 1 | Publicar el Apps Script (el formulario mostraba error aunque guardaba) | Experiencia | Hecho |
| 2 | Foto del hero y demás imágenes con `next/image` (AVIF/WebP, tamaño según pantalla): hero de 112 KB a ~21–27 KB | Rendimiento | Hecho |
| 3 | Fuentes servidas desde el sitio con `next/font/local` (sin Google Fonts) | Rendimiento | Hecho |
| 4 | Menú móvil: textos cortos sin cortes y áreas táctiles de 44 px | Experiencia | Hecho |
| 5 | Encabezado móvil que se oculta al bajar y vuelve al subir | Experiencia | Hecho |
| 6 | Ejemplo de mensualidad y botón "Súmate con este plan" bajo los precios | Experiencia | Hecho |
| 7 | "+ IVA" en la cifra de la comparación de costo | Experiencia | Hecho |
| 8 | Precios alineados entre tramos en escritorio | Visual | Hecho |
| 9 | Logo apunta a `/` y su nombre accesible incluye el texto visible | Accesibilidad | Hecho |
| 10 | `robots.txt`, `sitemap.xml`, `favicon.ico`, ícono para iOS, URL canónica y color del navegador | SEO | Hecho |
| 11 | Acortar la página en móvil (~14.300 px; la sección "Silver Job junta a los dos" ocupa casi dos pantallas) | Experiencia | Pendiente |
| 12 | La guía "¿Qué plan necesitas?" muestra el costo estimado | Experiencia | Hecho (etapa 1 de la sección 8) |
| 13 | Validación del formulario con mensajes propios bajo cada campo | Experiencia | Hecho (etapa 1 de la sección 8) |
| 14 | Menos JavaScript (53 KB sin usar, 13 KB de compatibilidad antigua) | Rendimiento | Pendiente |
| 15 | Contacto por WhatsApp | Experiencia | Pendiente |
| 16 | Datos estructurados (organización y preguntas frecuentes) | SEO | Pendiente |
| 17 | Selector de horas en `/pagar` más cómodo en móvil | Experiencia | Pendiente |
| 18 | Calendario de Patricia: título repetido y "60 h al mes" partido en móvil | Visual | Pendiente |
| 19 | Pie de página con navegación, redes y WhatsApp | Experiencia | Pendiente |
| 20 | Color del navegador móvil | Visual | Hecho (junto con el 10) |
| 21 | Cabeceras de seguridad antes de abrir los pagos | Buenas prácticas | Pendiente |
| 22 | Medir el embudo sin plan Pro (conteo desde el Apps Script o parámetros de campaña) | Datos | Pendiente |
| 23 | Prueba de confianza en el hero (estado del lanzamiento, primeros pilotos) | Experiencia | Pendiente |
| 24 | Fotos y testimonios reales de los pilotos | Visual | Pendiente |
| 25 | Páginas separadas `/pymes` y `/ejecutivos`, cada una con su formulario | Experiencia | Pendiente |
| 26 | Rediseñar el logo para que evoque la plata (obliga a actualizar el kit de redes) | Visual | Hecho en el sitio; falta el kit de redes |

Notas de los puntos hechos:
- La fuente de títulos se mantiene con eje óptico (122 KB) para conservar el aspecto del hero. La versión sin eje óptico (51 KB) subía el rendimiento a 96 y bajaba el LCP a 2,7 s, pero el título se ve más grueso y ancho: es una decisión de marca, no técnica.
- El encabezado se oculta solo en móvil (≤ 900 px); en escritorio queda fijo.

---

## 8. Evaluación de experiencia y usabilidad (4 de octubre de 2026)

Documento completo: [Silver Job: evaluación de experiencia y usabilidad](https://claude.ai/code/artifact/9681a464-2405-40a7-897b-7a233d1b7e71) (notas por dimensión, preguntas de cada visitante, 16 hallazgos con gravedad, matriz impacto × esfuerzo y plan de 21 pasos).

Veredicto: 5,5/10 en experiencia centrada en el cliente. Técnica de primer nivel; faltan confianza (equipo, empresa, testimonios, términos), el estado del servicio (precios públicos pero solo lista de espera sin fecha), contacto humano (WhatsApp, llamada) y la motivación del ejecutivo (ingreso por hora, fee, requisitos).

**Etapa 1 (código, hecha):** enlace "Saltar al contenido" y hero dentro de `main`; el desplazamiento reserva el alto real del encabezado (variable `--alto-encabezado`), así el foco no queda tapado (WCAG 2.4.11); títulos y menú que soportan el texto del sistema al 200 % y textos de lectura de 16 px como mínimo; validación propia del formulario (`lib/validacion.ts`, mensajes bajo cada campo, correo con dominio); página 404 en español; encabezado y pie (`components/Pie.tsx`) en las páginas internas; costo estimado en la guía de plan; cifra con IVA en la comparación; rótulo "Caso ilustrativo" en el caso de Patricia.

**Etapa 2 (espera decisiones de Tomás):** fecha de apertura o estado, WhatsApp y agenda, quiénes somos y datos de la empresa, términos y condiciones con aceptación en `/pagar`, preguntas frecuentes a ~12, ingreso del ejecutivo (el fee ya se eliminó), correo de confirmación.

**Etapa 3:** páginas `/pymes` y `/ejecutivos`, reordenar la página de pymes, prueba social real, medición y pruebas con usuarios.

---

## 9. Auditoría de claridad de precios (4 de octubre de 2026)

Resultado: la fórmula se entendía, pero no "cuánto pago al mes", "qué incluye" ni "a qué me comprometo", y había contradicciones a la vista.

**Hecho:** se eliminaron los fees (contradecían "sin cobros aparte"); la comparación usa 18 h de Operaciones ($1.710.000 con IVA, unos $1.437.000 netos) en vez de "cerca de $1,5 millones"; el calendario de Patricia dice "recuadro" para no chocar con los "bloques de 5 h"; "Un solo pago" pasó a "Pagas solo a Silver Job"; cada tramo muestra el rango de la mensualidad; los bloques muestran un precio de ejemplo y el aviso de que conviene subir de plan si se repiten; se explica que 27 h cuestan lo mismo que 26 h; "las horas no se acumulan" se dice directo; el plan anual tiene un ejemplo en pesos.

**Pendiente de decisiones de Tomás** (para un bloque "Cómo se cobra" en preguntas frecuentes):
1. ¿Se pueden combinar gerencias y sumar sus horas para el tramo?
2. ¿Qué incluye una hora (preparación, presencial o en línea, traslados, entregables)?
3. ¿Permanencia mínima y cómo se cancela (mensual y anual)?
4. ¿Factura electrónica para la pyme? ¿Mostrar también el neto?
5. ¿Qué pasa si una pyme llega después del día 5 (espera o proporcional)?
6. ¿Mínimo de horas (por ejemplo, 4 h)? Hoy se puede contratar 1 h.
