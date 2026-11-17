import {defineField} from 'sanity'

export function campoImagen({name, title, description, obligatoria = false, group}) {
  return defineField({
    name,
    title,
    type: 'image',
    group,
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Texto alternativo',
        type: 'string',
        description:
          'Opcional. Una frase que describe la foto, para quien no puede verla. Si lo dejás vacío, se usa el título.',
      }),
    ],
    validation: (rule) =>
      rule.custom((value) => {
        const tieneArchivo = Boolean(value?.asset)
        if (!tieneArchivo) {
          return obligatoria ? 'Subí una imagen para poder publicar.' : true
        }
        // El texto alternativo es opcional: si queda vacío, el sitio usa el título del cuadro.
        return true
      }),
  })
}

export function imagenEnLista() {
  return {
    type: 'image',
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Texto alternativo',
        type: 'string',
        description: 'Opcional. Una frase que describe esta foto. Si lo dejás vacío, se usa el título.',
      }),
    ],
    validation: (rule) =>
      rule.custom((value) => {
        if (!value?.asset) return true
        return true
      }),
  }
}
