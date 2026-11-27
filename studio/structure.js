import {BookIcon} from '@sanity/icons/Book'
import {ImagesIcon} from '@sanity/icons/Images'
import {ImageIcon} from '@sanity/icons/Image'
import {DocumentsIcon} from '@sanity/icons/Documents'

// Panel simplificado. La artista carga dos cosas, cada una igual:
// - Cuadros: primero la obra (por ejemplo, Una vez vi blanco) y después sus cuadros adentro.
// - Ilustraciones: primero la obra de ilustraciones y después sus ilustraciones adentro.
//   También se pueden cargar ilustraciones sueltas, sin obra.
// El resto del sitio (inicio, la artista, audiovisual, contacto) se edita en el código: src/data/demo.js.

const PAPEL = 'obras-sobre-papel'
const orden = [{field: 'orden', direction: 'asc'}]
const esPapel = `coalesce(disciplina->slug.current, "") == "${PAPEL}"`

// Lista de obras (series) de un tipo. Desde acá se crean y se editan.
function listaDeObras(S, titulo, filtro, plantilla) {
  return S.documentList()
    .title(titulo)
    .schemaType('serie')
    .filter(`_type == "serie" && ${filtro}`)
    .defaultOrdering(orden)
    .initialValueTemplates([S.initialValueTemplateItem(plantilla)])
}

// Elegir una obra y ver/cargar sus piezas (cuadros o ilustraciones).
function piezasPorObra(S, {titulo, pregunta, filtro, plantilla}) {
  // Sin schemaType: así esta lista no muestra el botón "+" (desde acá no se crean obras,
  // solo se elige una para cargar sus piezas).
  return S.documentList()
    .title(pregunta)
    .filter(`_type == "serie" && ${filtro}`)
    .apiVersion('2026-11-05')
    .defaultOrdering(orden)
    .menuItems([])
    .child((serieId) =>
      S.documentList()
        .title(titulo)
        .schemaType('obra')
        .filter('_type == "obra" && serie._ref == $serieId')
        .params({serieId})
        .defaultOrdering([{field: 'ordenEnSerie', direction: 'asc'}])
        .initialValueTemplates([S.initialValueTemplateItem(plantilla, {serieId})]),
    )
}

export const structure = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Cuadros')
        .id('seccion-cuadros')
        .icon(BookIcon)
        .child(
          S.list()
            .title('Cuadros')
            .items([
              S.listItem()
                .title('1 · Obras')
                .id('obras-de-cuadros')
                .icon(BookIcon)
                .child(listaDeObras(S, 'Obras de cuadros', `!(${esPapel})`, 'obra-de-cuadros')),
              S.listItem()
                .title('2 · Cuadros')
                .id('cuadros-por-obra')
                .icon(ImagesIcon)
                .child(
                  piezasPorObra(S, {
                    titulo: 'Cuadros',
                    pregunta: '¿De qué obra?',
                    filtro: `!(${esPapel})`,
                    plantilla: 'cuadro-de-obra',
                  }),
                ),
            ]),
        ),
      S.listItem()
        .title('Ilustraciones')
        .id('seccion-ilustraciones')
        .icon(ImageIcon)
        .child(
          S.list()
            .title('Ilustraciones')
            .items([
              S.listItem()
                .title('1 · Obras')
                .id('obras-de-ilustraciones')
                .icon(BookIcon)
                .child(listaDeObras(S, 'Obras de ilustraciones', esPapel, 'obra-de-ilustraciones')),
              S.listItem()
                .title('2 · Ilustraciones')
                .id('ilustraciones-por-obra')
                .icon(ImagesIcon)
                .child(
                  piezasPorObra(S, {
                    titulo: 'Ilustraciones',
                    pregunta: '¿De qué obra?',
                    filtro: esPapel,
                    plantilla: 'ilustracion-de-obra',
                  }),
                ),
              S.divider(),
              S.listItem()
                .title('Ilustraciones sueltas')
                .id('ilustraciones-sueltas')
                .icon(DocumentsIcon)
                .child(
                  S.documentList()
                    .title('Ilustraciones sueltas')
                    .schemaType('obra')
                    .filter(`_type == "obra" && !defined(serie) && ${esPapel}`)
                    .defaultOrdering([{field: '_createdAt', direction: 'asc'}])
                    .initialValueTemplates([S.initialValueTemplateItem('ilustracion')]),
                ),
            ]),
        ),
    ])
