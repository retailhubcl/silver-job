# Silver Job

Sitio de [silverjob.cl](https://silverjob.cl): landing, lista de espera y pago de planes con Mercado Pago. Next.js (App Router) desplegado en Vercel.

## Desarrollo

```sh
npm install
cp .env.example .env.local   # completar valores
npm run dev                  # http://localhost:3000
npm test                     # pruebas de firma del webhook y precios
npm run build
```

## Rutas

| Ruta | Qué hace |
| --- | --- |
| `/` | Landing. El formulario envía a la planilla de Google (Apps Script). |
| `/privacidad` | Política de privacidad (`/privacidad.html` redirige aquí). |
| `/pagar` | Elegir plan y pagar. Solo muestra los planes con precio configurado. |
| `/api/checkout` | Crea la preferencia de Checkout Pro y redirige a Mercado Pago. |
| `/api/webhooks/mercadopago` | Valida la firma `x-signature` y consulta el pago en la API. |
| `/pago/exito`, `/pago/pendiente`, `/pago/error` | Páginas de vuelta desde Mercado Pago. |

## Puesta en marcha

1. **Vercel**: importar este repo (framework Next.js, sin cambios de build). Cargar las variables de `.env.example` en Settings → Environment Variables.
2. **Dominio**: agregar `silverjob.cl` y `www.silverjob.cl` en Vercel → Domains.
3. **Cloudflare DNS**: `A silverjob.cl → 76.76.21.21` y `CNAME www → cname.vercel-dns.com`, ambos en "DNS only" (nube gris).
4. **Mercado Pago**: crear la aplicación en mercadopago.cl/developers (Checkout Pro). En Webhooks, URL `https://silverjob.cl/api/webhooks/mercadopago`, evento **Pagos**; copiar la clave secreta a `MERCADOPAGO_WEBHOOK_SECRET`.
5. Probar con credenciales y usuarios de prueba; después cambiar a las credenciales de producción y volver a desplegar.

Los pagos confirmados quedan en los logs de Vercel (`pago_mp`) y en el panel de Mercado Pago. Guardarlos en una base de datos es el siguiente paso.
