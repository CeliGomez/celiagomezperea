import {BookIcon} from '@sanity/icons/Book'
import {ImagesIcon} from '@sanity/icons/Images'
import {ImageIcon} from '@sanity/icons/Image'

// Panel simplificado: la artista solo carga dos cosas.
// - Cuadros: primero la "obra" (por ejemplo, Una vez vi blanco) y después sus cuadros adentro.
// - Ilustraciones: piezas sueltas sobre papel.
// El resto del sitio (inicio, la artista, audiovisual, contacto) se edita en el código: src/data/demo.js.

const orden = [{field: 'orden', direction: 'asc'}]

export const structure = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('1 · Obras')
        .id('obras')
        .icon(BookIcon)
        .child(
          S.documentTypeList('serie')
            .title('Obras')
            .defaultOrdering(orden)
            .initialValueTemplates([S.initialValueTemplateItem('obra-de-cuadros')]),
        ),
      S.listItem()
        .title('2 · Cuadros')
        .id('cuadros')
        .icon(ImagesIcon)
        .child(
          S.documentTypeList('serie')
            .title('¿De qué obra?')
            .defaultOrdering(orden)
            // Desde acá no se crean obras: solo se elige una para ver y cargar sus cuadros.
            .initialValueTemplates([])
            .menuItems([])
            .child((serieId) =>
              S.documentList()
                .title('Cuadros')
                .schemaType('obra')
                .filter('_type == "obra" && serie._ref == $serieId')
                .params({serieId})
                .defaultOrdering([{field: 'ordenEnSerie', direction: 'asc'}])
                .initialValueTemplates([S.initialValueTemplateItem('cuadro-de-obra', {serieId})]),
            ),
        ),
      S.divider(),
      S.listItem()
        .title('Ilustraciones')
        .id('ilustraciones')
        .icon(ImageIcon)
        .child(
          S.documentList()
            .title('Ilustraciones')
            .schemaType('obra')
            .filter('_type == "obra" && disciplina->slug.current == "obras-sobre-papel"')
            .defaultOrdering([{field: '_createdAt', direction: 'asc'}])
            .initialValueTemplates([S.initialValueTemplateItem('ilustracion')]),
        ),
    ])
