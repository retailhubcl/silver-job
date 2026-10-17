# Seguridad de Silver Job

Auditoría del 17/10/2026 y estado de cada hallazgo. Para el contexto del negocio, ver `CLAUDE.md`.

## Estado al 17/10/2026

| Control | Estado |
|---|---|
| Cabeceras y CSP en producción | Hecho y verificado |
| Formulario en Supabase con RLS | Hecho y verificado con inscripciones reales |
| Purga mensual (pg_cron, 12 meses) | Hecho |
| Regla de límite del WAF | Hecho y verificado |
| Turnstile | Hecho y verificado |
| Retirar Apps Script y `NEXT_PUBLIC_LISTA_ENDPOINT` | Pendiente |
| Mercado Pago (credenciales de prueba, webhook, compra de prueba) | Pendiente |
| 2FA, proteger `main`, SPF/DKIM/DMARC, CAA/DNSSEC | Pendiente |
| Base de pruebas para Preview | Pendiente |
| Revisión legal antes del 1/12/2026 | Pendiente |
| Tabla `publicaciones` con permisos abiertos a `anon` (RLS la protege) | Pendiente de decidir |

La lista completa y ordenada de pendientes está en la sección 6 de `CLAUDE.md`.

## Cómo verificar cada control

- **Cabeceras:** `curl -I https://silverjob.cl` debe mostrar `content-security-policy`, `strict-transport-security`, `x-frame-options: DENY`, `x-content-type-options`, `referrer-policy`, `permissions-policy` y no mostrar `x-powered-by`.
- **Mismo origen:** un `POST` a `/api/lista` o `/api/checkout` sin `Origin` o con uno ajeno debe responder 403.
- **Límite del WAF** (no se puede probar desde el entorno de Claude; hacerlo desde el navegador): abrir `https://silverjob.cl`, F12 → Consola y ejecutar
  `(async()=>{for(let i=1;i<=16;i++){const r=await fetch('/api/lista',{method:'POST',body:new URLSearchParams({sitio:'bot'})});const t=(await r.text()).slice(0,60);console.log(i,r.status,r.headers.get('x-vercel-mitigated')||'-',t)}})()`
  Resultado esperado: 1 a 5 `200` (código), 6 a 10 `429` con `error: limite` (código) y 11 a 16 `429` con `deny` (WAF). No guarda datos (campo trampa lleno). Deja bloqueada la IP unos 10 minutos.
- **Captcha:** un `POST` válido a `/api/lista` sin token o con token falso debe responder 400 `captcha`.
- **Base de datos:** consulta de privilegios: `anon` y `authenticated` sin `select` ni `insert` en `lista_espera` y `pagos`; panel Advisors → Security solo con avisos informativos "RLS sin políticas".



| Control | Dónde |
|---|---|
| Cabeceras de seguridad (HSTS, CSP, anti-iframe, Referrer/Permissions-Policy) y sin `X-Powered-By` | `next.config.ts` |
| Formulario de la lista pasa por `/api/lista`: mismo origen, límite por IP, trampa, validación completa en el servidor (largos, opciones, LinkedIn), Turnstile | `app/api/lista/route.ts`, `lib/validacion.ts` |
| Datos en Supabase con RLS activado y sin políticas (solo la clave secreta del servidor entra) | `supabase/migrations/`, `lib/supabase.ts` |
| `/api/checkout`: mismo origen, límite por IP, Turnstile, referencia idempotente | `app/api/checkout/route.ts` |
| Webhook: firma HMAC con caducidad de 10 min, monto verificado contra la cotización, pago guardado por `payment_id`, sin datos personales en logs | `app/api/webhooks/mercadopago/route.ts`, `lib/pagos.ts` |
| Respaldo Apps Script (por retirar): clave compartida y neutralización de fórmulas | `apps-script/lista-espera.gs` |
| CI (tipos, pruebas, `npm audit`, build, gitleaks) y Dependabot | `.github/` |

## Puesta en marcha (lo que no se puede hacer desde el código)

Los pasos de Supabase (1), Turnstile (2) y la regla del WAF (3) ya están hechos. Quedan los de cuentas y accesos (4).

### 1. Supabase (proyecto `silver-job`, región São Paulo)
1. Restaurar el proyecto si sigue pausado (Dashboard → Restore project).
2. Aplicar `supabase/migrations/20261017000000_seguridad_datos.sql` (SQL Editor o `supabase db push`).
3. En Settings → API Keys, crear una clave **secret** (`sb_secret_...`). No usar la `service_role` antigua.
4. Vercel → Environment Variables (marcar *Sensitive*): `SUPABASE_URL` y `SUPABASE_SECRET_KEY`. En **Production y Preview con proyectos distintos** (Preview debe apuntar a una base de pruebas, nunca a la real).
5. Importar las filas de la planilla "Registros Silver Job" a `lista_espera` (Table Editor → Import CSV; `consentimiento` = true, `consentimiento_version` = `anterior-a-2026-10`). Después, **retirar a todas las personas con acceso a la planilla excepto tú** o archivarla en un lugar cifrado.
6. Redesplegar. Probar: inscribirse en el sitio y ver la fila en Supabase.
7. Cuando esté confirmado, borrar el Apps Script y la variable `NEXT_PUBLIC_LISTA_ENDPOINT` (ya no se usa).
8. Programar la retención: `select cron.schedule('purgar-lista', '0 4 1 * *', 'select public.purgar_lista_espera(12)');` (requiere activar la extensión pg_cron).
9. Revisar el panel Advisors → Security: no debe haber alertas de RLS.

### 2. Cloudflare Turnstile (captcha, gratis)
Cloudflare → Turnstile → agregar sitio `silverjob.cl` (modo Managed). Cargar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` en Vercel y redesplegar. Sin las claves el captcha queda desactivado.

### 3. Límite de tasa en el WAF de Vercel
Vercel → Firewall → Rules: limitar `POST /api/lista` y `POST /api/checkout` a 10 solicitudes por minuto por IP (acción Rate Limit). El límite del código es de mejor esfuerzo; este es el firme.

### 4. Cuentas y accesos
- 2FA con app o llave (no SMS) en Google, GitHub, Vercel, Cloudflare, NIC Chile, Supabase y Mercado Pago.
- GitHub: proteger `main` (Settings → Branches: PR obligatorio, checks de CI requeridos) y activar secret scanning y push protection.
- Vercel: Deployment Protection en Preview; credenciales `TEST-` de Mercado Pago en Preview y `APP_USR-` solo en Production.
- Cloudflare: SSL/TLS "Full (strict)", DNSSEC, registro CAA (`0 issue "letsencrypt.org"`). NIC Chile: bloqueo de transferencia del dominio.
- Correo: SPF, DKIM y DMARC (`p=quarantine`, luego `reject`) para `silverjob.cl`.
- Una segunda persona de confianza con acceso de recuperación a dominio, Vercel, Supabase y Google.

## Plan de respuesta a incidentes

**Qué cuenta como incidente:** acceso no autorizado a la base, filtración de la planilla o de una clave, pago fraudulento, sitio modificado, pérdida de una cuenta.

1. **Contener (primera hora).** Rotar la credencial comprometida: Supabase (crear nueva clave secret y borrar la anterior), Mercado Pago (regenerar token y secreto del webhook), Vercel (redesplegar con las claves nuevas), Google/GitHub (cambiar contraseña y cerrar sesiones). Si hay duda sobre el sitio, pausar el proyecto en Vercel.
2. **Evaluar (primer día).** ¿Qué datos, de cuántas personas, desde cuándo? Fuentes: logs de Vercel, logs de Supabase (`query_logs`), panel de Mercado Pago, historial de la planilla.
3. **Avisar.** A las personas afectadas, por correo y sin demora injustificada, diciendo qué datos, qué hicimos y qué pueden hacer. A la autoridad de protección de datos cuando la Ley 21.719 (vigente desde el 1/12/2026) lo exija; consultar al abogado el plazo.
4. **Corregir y aprender.** Causa raíz, arreglo en el código o la configuración, y una línea en este documento.

Responsable: Tomás. Suplente: _(definir)_. Abogado: _(definir)_. Contador: _(definir)_.

## Pendientes conocidos
- CSP con `'unsafe-inline'` en scripts (necesario para Next sin nonces). Mejora: nonces con `proxy.ts`, a costa de renderizado dinámico.
- Notificación por correo al equipo cuando entra un pago y activación automática del servicio.
- Revisión legal de la política de privacidad y los términos (Ley 19.628 y Ley 21.719).
- Cuando exista la plataforma (agenda, evaluaciones, liquidaciones): autenticación, RLS por usuario, registro de auditoría y cifrado de datos bancarios.
