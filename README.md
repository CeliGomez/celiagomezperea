# Webgalery

Sitio estático de una artista visual. Astro genera el HTML en el build; el contenido sale de Sanity.

## Variables de entorno

En Vercel, y en un `.env` local:

| Variable | Uso |
| --- | --- |
| `SANITY_PROJECT_ID` | Proyecto de Sanity |
| `SANITY_DATASET` | Dataset publicado, por ejemplo `production` |
| `PUBLIC_WEB3FORMS_KEY` | Clave pública del formulario de contacto |
| `SITE` | URL pública con protocolo, por ejemplo `https://dominio.com` |
| `INDEXAR` | `true` solo en producción. Sin esta variable el sitio sale con `noindex` y Google no lo muestra |

`SITE` arma el sitemap y las URLs canónicas. Si no está definida en Vercel, se usa el dominio de producción del proyecto.

Hay un `.env.example` en la raíz y otro en `studio/` para copiar como `.env`.

## Comandos

```sh
npm install
npm run dev
npm run build
```

## Studio (panel de carga)

```sh
cd studio
cp .env.example .env   # completar SANITY_STUDIO_PROJECT_ID
npm install
npm run dev            # en local: http://localhost:3333
npm run deploy         # publica el panel en https://<nombre>.sanity.studio
```

Después del deploy, Celia carga desde esa URL, sin tocar el código. El panel tiene dos secciones:

- **Cuadros → 1 · Obras**: cada obra que reúne varios cuadros (por ejemplo, *Una vez vi blanco*).
- **Cuadros → 2 · Cuadros**: se elige la obra y se cargan sus cuadros. La obra, la disciplina y el número de orden se completan solos.
- **Ilustraciones → 1 · Obras / 2 · Ilustraciones**: lo mismo, para obras de ilustraciones sobre papel. Se ven en la sección Ilustraciones.
- **Ilustraciones → Ilustraciones sueltas**: piezas sin obra.

El resto del sitio (inicio, la artista, audiovisual, contacto) es contenido fijo en `src/data/demo.js`.

La primera vez, con el proyecto de Sanity vacío, hay que crear las dos disciplinas (Pinturas e Ilustraciones):

```sh
cd studio
npx sanity documents create datos-iniciales/disciplinas.json --missing
```

## Antes del lanzamiento

- [ ] En Vercel: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `PUBLIC_WEB3FORMS_KEY`, `SITE=https://celiagomezperea.com` e `INDEXAR=true` (solo Production).
- [ ] Deploy Hook de Vercel conectado al webhook de Sanity (sección siguiente).
- [ ] Studio publicado con `npm run deploy`.
- [ ] Email y WhatsApp en `src/data/demo.js` → `configuracion`. Sin WhatsApp, el botón de consulta de cada obra lleva al formulario con la obra ya escrita.
- [ ] Disciplinas creadas con `npx sanity documents create datos-iniciales/disciplinas.json --missing` (desde `studio/`).
- [ ] Envío de prueba del formulario y confirmar que llega el mail.
- [ ] DNS de celiagomezperea.com apuntando a Vercel.

## Reconstruir el sitio cuando se publica en Sanity

El sitio no se actualiza solo: cada cambio publicado tiene que disparar un build nuevo en Vercel.

1. Entrá al proyecto en Vercel → **Settings** → **Git** → **Deploy Hooks**.
2. Creá un hook. Nombre sugerido: `Sanity`. Branch: la de producción (`main`).
3. Copiá la URL que te da Vercel. Ya incluye el token; no hace falta otra clave.
4. Entrá a [sanity.io/manage](https://www.sanity.io/manage), abrí el proyecto → **API** → **Webhooks** → **Create webhook**.
5. Completalo así:
   - **Name:** Vercel
   - **URL:** la URL del Deploy Hook
   - **Dataset:** el mismo que `SANITY_DATASET` (por ejemplo `production`)
   - **Trigger on:** Create, Update y Delete
   - **Filter:** `!(_id in path("drafts.**"))`
   - **Projection:** vacío
   - **HTTP method:** POST
   - **API version:** la que ofrece el formulario
6. Guardá el webhook y desactivá la opción de disparar también con borradores, si aparece. El filtro de arriba deja afuera los drafts: el sitio se reconstruye cuando se publica, edita o borra un documento, y no en cada autoguardado del estudio.
7. Publicá un cambio chico en Sanity y confirmá en Vercel que arrancó un deployment.

El hook dispara el build. No hace falta un servidor ni una ruta de API en el sitio.
