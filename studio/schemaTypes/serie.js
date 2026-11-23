import {defineField, defineType} from 'sanity'
import {textoEnriquecido} from './bloques.js'
import {campoImagen} from './imagen.js'
import {maximoMarcados, slugUnico} from './validaciones.js'

export const serie = defineType({
  name: 'serie',
  // En el panel se llama "Obra": una obra reúne varios cuadros (por ejemplo, Una vez vi blanco).
  title: 'Obra',
  type: 'document',
  fields: [
    defineField({
      name: 'nombre',
      title: 'Nombre de la obra',
      type: 'string',
      description: 'Por ejemplo: Una vez vi blanco.',
      validation: (rule) => rule.required().error('Escribí el nombre de la obra.'),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección de la página',
      type: 'slug',
      description: 'Escribí el nombre arriba y tocá “Generar”. Es el link de la página.',
      options: {source: 'nombre', maxLength: 96},
      validation: (rule) =>
        slugUnico(
          rule.required().error('Generá la dirección a partir del nombre.'),
          ['serie'],
          'Ya hay otra obra con esa dirección. Cambiá una palabra.',
        ),
    }),
    defineField({
      name: 'disciplina',
      hidden: true,
      title: 'Disciplina',
      type: 'reference',
      to: [{type: 'disciplina'}],
      description: 'Opcional. Vinculala solo cuando la serie pertenezca con claridad a una disciplina.',
    }),
    defineField({
      name: 'descripcion',
      title: 'Texto de la obra',
      type: 'array',
      of: [textoEnriquecido],
      description: 'Opcional. Unas líneas sobre la obra.',
    }),
    defineField({
      name: 'anio',
      title: 'Año o período',
      type: 'string',
      description: 'Opcional. Un año (2008) o un período (2007–2008).',
    }),
    defineField({
      name: 'tecnicaGeneral',
      title: 'Técnica general',
      type: 'string',
      description: 'Opcional. Ejemplo: Óleo y tinta sobre tela.',
    }),
    campoImagen({
      name: 'portada',
      title: 'Foto de portada',
      description:
        'Opcional. Si la dejás vacía, se usa la foto del primer cuadro.',
    }),
    defineField({
      name: 'publicada',
      title: 'Publicada',
      type: 'boolean',
      description: 'Si la apagás, queda guardada pero no se ve en la web.',
      initialValue: true,
    }),
    defineField({
      name: 'orden',
      title: 'Orden',
      type: 'number',
      description: 'El lugar de la obra en la sección Cuadros. El número más bajo aparece primero: 10, 20, 30…',
      initialValue: 10,
      validation: (rule) => rule.integer().min(0).error('Usá un número entero, por ejemplo 10.'),
    }),
    defineField({
      name: 'destacada',
      hidden: true,
      title: 'Destacada en Inicio',
      type: 'boolean',
      description: 'Si la marcás, puede aparecer entre las series del inicio. Podés destacar hasta 3.',
      initialValue: false,
      validation: maximoMarcados(
        'serie',
        'destacada',
        3,
        'Ya hay 3 series destacadas. Desmarcá una para poder marcar esta.',
      ),
    }),
    defineField({
      name: 'principalInicio',
      hidden: true,
      title: 'Mostrar grande en el inicio',
      type: 'boolean',
      description: 'Opcional. Si ninguna está marcada, se muestra la primera.',
      initialValue: false,
      validation: maximoMarcados(
        'serie',
        'principalInicio',
        1,
        'Ya hay otra obra marcada para el inicio. Desmarcá esa primero.',
      ),
    }),
  ],
  orderings: [
    {
      title: 'Orden',
      name: 'ordenAsc',
      by: [{field: 'orden', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'nombre',
      media: 'portada',
      publicada: 'publicada',
      principal: 'principalInicio',
      anio: 'anio',
    },
    prepare({title, media, publicada, principal, anio}) {
      const estado = publicada === false ? 'Oculta' : 'Visible'
      const partes = [estado, principal ? 'Grande en el inicio' : '', anio].filter(Boolean)
      return {title: title || 'Sin nombre', media, subtitle: partes.join(' · ')}
    },
  },
})
