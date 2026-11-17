// Plantillas de carga: al crear algo nuevo, el panel completa solo lo que la artista no tiene que elegir.
// - Obra de cuadros: disciplina Pinturas, visible y al final de la lista.
// - Cuadro: la obra a la que pertenece, disciplina Pinturas y el número siguiente (1, 2, 3…).
// - Ilustración: disciplina Ilustraciones (slug obras-sobre-papel).
// Las disciplinas se buscan por su dirección, así funcionan con cualquier ID.

const API_VERSION = '2026-11-05'
const PUBLICADOS = '!(_id in path("drafts.**"))'

async function referenciaDisciplina(client, slug) {
  const id = await client.fetch(`*[_type == "disciplina" && slug.current == $slug && ${PUBLICADOS}][0]._id`, {slug})
  return id ? {_type: 'reference', _ref: id} : undefined
}

export const plantillas = [
  {
    id: 'obra-de-cuadros',
    title: 'Obra (con sus cuadros)',
    schemaType: 'serie',
    value: async (_params, {getClient}) => {
      const client = getClient({apiVersion: API_VERSION})
      const [disciplina, ultimo] = await Promise.all([
        referenciaDisciplina(client, 'pinturas'),
        client.fetch(`coalesce(*[_type == "serie" && ${PUBLICADOS}] | order(orden desc)[0].orden, 0)`),
      ])
      return {publicada: true, orden: Number(ultimo || 0) + 10, ...(disciplina ? {disciplina} : {})}
    },
  },
  {
    id: 'cuadro-de-obra',
    title: 'Cuadro',
    schemaType: 'obra',
    parameters: [{name: 'serieId', type: 'string'}],
    value: async ({serieId}, {getClient}) => {
      const client = getClient({apiVersion: API_VERSION})
      const [disciplina, cantidad] = await Promise.all([
        referenciaDisciplina(client, 'pinturas'),
        client.fetch(`count(*[_type == "obra" && serie._ref == $serieId && ${PUBLICADOS}])`, {serieId}),
      ])
      return {
        publicada: true,
        estado: 'sin-especificar',
        serie: {_type: 'reference', _ref: serieId},
        ordenEnSerie: Number(cantidad || 0) + 1,
        ...(disciplina ? {disciplina} : {}),
      }
    },
  },
  {
    id: 'ilustracion',
    title: 'Ilustración',
    schemaType: 'obra',
    value: async (_params, {getClient}) => {
      const disciplina = await referenciaDisciplina(getClient({apiVersion: API_VERSION}), 'obras-sobre-papel')
      return {publicada: true, estado: 'sin-especificar', ...(disciplina ? {disciplina} : {})}
    },
  },
]

// En el botón "+" de arriba solo se ofrece crear una obra de cuadros o una ilustración.
// Un cuadro se crea desde adentro de su obra (así ya queda vinculado).
export const plantillasGlobales = new Set(['obra-de-cuadros', 'ilustracion'])
