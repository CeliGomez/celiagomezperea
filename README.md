# Celia Gómez Perea — sitio web

Sitio de la artista visual Celia Gómez Perea (celiagomezperea.com). Astro genera el HTML en el build: los cuadros y las ilustraciones salen de Sanity, y el resto del contenido está fijo en `src/data/demo.js`.

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

En local, el `.env` de la raíz lleva `SANITY_PROJECT_ID` y `SANITY_DATASET`; el de `studio/` lleva `SANITY_STUDIO_PROJECT_ID` y `SANITY_STUDIO_DATASET`.

## Comandos

```sh
npm install
npm run dev
npm run build
```

## Studio (panel de carga)

```sh
cd studio
npm install
npm run dev            # en local: http://localhost:3333
npm run deploy         # publica el panel en https://<nombre>.sanity.studio
```

Después del deploy, Celia carga desde esa URL, sin tocar el código. El panel tiene dos secciones:

- **Cuadros → 1 · Obras**: cada obra que reúne varios cuadros (por ejemplo, *Una vez vi blanco*).
- **Cuadros → 2 · Cuadros**: se elige la obra y se cargan sus cuadros. La obra, la disciplina y el número de orden se completan solos.
- **Ilustraciones → 1 · Obras / 2 · Ilustraciones**: lo mismo, para obras de ilustraciones sobre papel. Se ven en la sección Ilustraciones.
- **Ilustraciones → Ilustraciones sueltas**: piezas sin obra.

El resto del sitio (inicio, sobre mí, audiovisual, contacto) es contenido fijo en `src/data/demo.js`. Los videos de Audiovisual están en la lista `videosVimeo` de ese archivo.

### Cómo se identifica cada pieza

Las piezas no tienen nombre propio: se nombran por su obra y su número (el orden de «Lugar dentro de la obra»). Cada una tiene un código corto, por ejemplo **VVB-03** = *Una vez vi blanco*, N.º 3. La sigla se arma sola con las iniciales del nombre de la obra, o se carga a mano en el campo «Sigla» de la obra.

- Si el título de una pieza está todo en minúscula (por ejemplo «unavez3»), la web la muestra como **Sin título**. Si tiene nombre propio, se escribe con mayúscula.
- El botón «Consultar por WhatsApp» de cada pieza abre WhatsApp con un mensaje ya escrito que incluye la obra, el número, el código y el link.

La primera vez, con el proyecto de Sanity vacío, hay que crear las dos disciplinas (Pinturas e Ilustraciones):

```sh
cd studio
npx sanity documents create datos-iniciales/disciplinas.json --missing
```

## Antes del lanzamiento

- [ ] En Vercel: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `PUBLIC_WEB3FORMS_KEY`, `SITE=https://celiagomezperea.com` e `INDEXAR=true` (solo Production).
- [x] Deploy Hook de Vercel conectado al webhook de Sanity (sección siguiente).
- [ ] Studio publicado con `npm run deploy`.
- [x] Email y WhatsApp en `src/data/demo.js` → `configuracion`.
- [x] Disciplinas creadas.
- [ ] Google Search Console: agregar el dominio y enviar `sitemap-index.xml`.
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

## Redirecciones

`vercel.json` manda las direcciones viejas a las nuevas: `/obras` y `/obras/pinturas` → `/series` (Cuadros), `/la-artista` → `/sobre-mi`.
