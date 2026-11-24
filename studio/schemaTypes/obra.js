import {defineField, defineType} from 'sanity'
import {campoImagen, imagenEnLista} from './imagen.js'
import {maximoMarcados, slugUnico} from './validaciones.js'

// categoria y proyecto (texto libre) se conservan y quedan ocultos: los reemplazan
// la disciplina y los documentos de proyecto artístico. No se borran los valores ya cargados.
const estados = {
  'sin-especificar': 'Sin especificar',
  disponible: 'Disponible',
  reservada: 'Reservada',
  vendida: 'Vendida',
  'no-disponible': 'No disponible para la venta',
}

export const obra = defineType({
  name: 'obra',
  // En el panel: cada cuadro de una obra (serie) o cada ilustración.
  title: 'Cuadro o ilustración',
  type: 'document',
  fieldsets: [
    {
      name: 'medidas',
      title: 'Medidas',
      description: 'Opcional. En centímetros. En la web se ve como “100 × 70 cm”.',
      options: {columns: 2},
    },
  ],
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      description:
        'El nombre del cuadro o de la ilustración.',
      validation: (rule) => rule.required().error('Escribí el título de la obra.'),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección de la página',
      type: 'slug',
      description:
        'Escribí el título arriba y tocá “Generar”. Es el link de la página. Si ya está publicada, no la cambies.',
      options: {source: 'titulo', maxLength: 96},
      validation: (rule) =>
        slugUnico(
          rule.required().error('Generá la dirección a partir del título.'),
          ['obra', 'disciplina'],
          'Esa dirección ya la usa otra obra o una disciplina. Elegí otra: las dos comparten /obras/.',
        ),
    }),
    campoImagen({
      name: 'imagenPrincipal',
      title: 'Fotografía principal',
      description:
        'La foto de frente. Es la que se ve en la galería. Tocá el lápiz y mové el círculo a la parte más importante.',
    }),
    defineField({
      name: 'imagenesAdicionales',
      title: 'Fotografías adicionales',
      type: 'array',
      description:
        'Otras fotos de la misma pieza: de costado, un detalle, en la sala. Se ven en su página.',
      of: [imagenEnLista()],
    }),
    defineField({
      name: 'publicada',
      title: 'Publicada',
      type: 'boolean',
      description: 'Si la apagás, queda guardada pero no se ve en la web.',
      initialValue: true,
    }),
    defineField({
      name: 'disciplina',
      hidden: true,
      title: 'Disciplina',
      type: 'reference',
      to: [{type: 'disciplina'}],
      description: 'Opcional hasta que esté confirmada. Se elige de las disciplinas cargadas en el panel.',
    }),
    defineField({
      name: 'serie',
      hidden: true,
      title: 'Serie',
      type: 'reference',
      to: [{type: 'serie'}],
      description: 'Opcional. Vinculala solo si la obra pertenece a esa serie. No la asignes por parecido visual.',
    }),
    defineField({
      name: 'ordenEnSerie',
      title: 'Lugar dentro de la obra',
      type: 'number',
      hidden: ({document}) => !document?.serie,
      description: 'Se completa solo: 1, 2, 3… Cambialo si querés otro orden.',
      validation: (rule) => rule.integer().min(0).error('Usá un número entero, por ejemplo 10.'),
    }),
    defineField({
      name: 'anio',
      title: 'Año',
      type: 'number',
      description: 'Opcional. Solo el número, por ejemplo 2024.',
      validation: (rule) =>
        rule.integer().min(1900).max(2100).error('Ingresá un año válido, por ejemplo 2024.'),
    }),
    defineField({
      name: 'tecnica',
      title: 'Técnica',
      type: 'string',
      description: 'Opcional. Ejemplo: Óleo sobre tela.',
    }),
    defineField({
      name: 'altoCm',
      title: 'Alto (cm)',
      type: 'number',
      fieldset: 'medidas',
      description: 'Solo el número, por ejemplo 100.',
      validation: (rule) => rule.positive().max(2000).error('Ingresá el alto en centímetros, por ejemplo 100.'),
    }),
    defineField({
      name: 'anchoCm',
      title: 'Ancho (cm)',
      type: 'number',
      fieldset: 'medidas',
      description: 'Solo el número, por ejemplo 70.',
      validation: (rule) => rule.positive().max(2000).error('Ingresá el ancho en centímetros, por ejemplo 80.'),
    }),
    defineField({
      name: 'dimensiones',
      hidden: true,
      title: 'Dimensiones mostradas',
      type: 'string',
      description:
        'El texto que se ve en la ficha, solo si está confirmado. Ejemplo: 100 × 80 cm. Una serie puede reunir cuadros de distintas medidas.',
    }),
    defineField({
      name: 'estado',
      title: 'Disponibilidad',
      type: 'string',
      description:
        'Si lo dejás en Sin especificar, no se muestra nada sobre la venta.',
      initialValue: 'sin-especificar',
      options: {
        layout: 'radio',
        list: [
          {title: 'Sin especificar', value: 'sin-especificar'},
          {title: 'Disponible', value: 'disponible'},
          {title: 'Reservada', value: 'reservada'},
          {title: 'Vendida', value: 'vendida'},
          {title: 'No disponible para la venta', value: 'no-disponible'},
        ],
      },
      validation: (rule) => rule.required().error('Elegí el estado de la obra.'),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoría (campo anterior)',
      type: 'string',
      hidden: true,
      description:
        'Campo anterior, reemplazado por Disciplina. El valor cargado se conserva y no se borra. No lo uses para obras nuevas.',
      options: {
        layout: 'radio',
        list: [
          {title: 'Dibujo', value: 'dibujo'},
          {title: 'Instalación', value: 'instalacion'},
          {title: 'Experimentación gráfica', value: 'experimentacion-grafica'},
          {title: 'Obra bidimensional', value: 'obra-bidimensional'},
        ],
      },
    }),
    defineField({
      name: 'proyecto',
      title: 'Proyecto (campo anterior)',
      type: 'string',
      hidden: true,
      description:
        'Campo anterior, en texto libre. Lo reemplazan Exposición, Performance, Instalación y Acción artística. El texto cargado se conserva.',
    }),
    defineField({
      name: 'descripcionCorta',
      title: 'Descripción',
      type: 'text',
      rows: 4,
      description: 'Opcional. Un texto breve que se lee en su página.',
      validation: (rule) =>
        rule.max(420).error('Es un texto corto: dejalo en dos a cuatro líneas.'),
    }),
    defineField({
      name: 'precio',
      hidden: true,
      title: 'Precio',
      type: 'number',
      description: 'Opcional. Solo el número, sin símbolos. No lo completes si la artista no lo definió.',
      validation: (rule) => rule.min(0).error('El precio no puede ser negativo.'),
    }),
    defineField({
      name: 'mostrarPrecio',
      hidden: true,
      title: 'Mostrar precio',
      type: 'boolean',
      description: 'El precio solo se muestra en el sitio si esto está activo y hay un número cargado.',
      initialValue: false,
    }),
    defineField({
      name: 'destacadaEnInicio',
      title: 'Destacar en el inicio',
      type: 'boolean',
      description: 'Aparece en la tira de cuadros del inicio. Podés destacar hasta 10.',
      initialValue: false,
      validation: maximoMarcados(
        'obra',
        'destacadaEnInicio',
        10,
        'Ya hay 10 cuadros destacados en el inicio. Desmarcá uno para poder marcar este.',
      ),
    }),
    defineField({
      name: 'ordenGaleria',
      hidden: true,
      title: 'Orden en galería',
      type: 'number',
      description:
        'Un número para ordenar la galería a mano. El número más bajo aparece primero. Conviene usar 10, 20, 30 para poder intercalar obras después.',
      validation: (rule) => rule.integer().min(0).error('Usá un número entero, por ejemplo 10.'),
    }),
  ],
  orderings: [
    {
      title: 'Orden en galería',
      name: 'ordenGaleriaAsc',
      by: [{field: 'ordenGaleria', direction: 'asc'}],
    },
    {
      title: 'Orden en la serie',
      name: 'ordenEnSerieAsc',
      by: [{field: 'ordenEnSerie', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'titulo',
      media: 'imagenPrincipal',
      estado: 'estado',
      publicada: 'publicada',
      orden: 'ordenEnSerie',
    },
    prepare({title, media, estado, publicada, orden}) {
      const partes = [
        Number.isFinite(orden) ? `N.º ${orden}` : '',
        publicada === false ? 'Oculta' : 'Visible',
        estado && estado !== 'sin-especificar' ? estados[estado] : '',
      ].filter(Boolean)
      return {
        title: title || 'Sin título',
        media,
        subtitle: partes.join(' · '),
      }
    },
  },
})
