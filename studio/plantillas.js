// Plantillas de carga: al crear algo nuevo, el panel completa solo lo que la artista no tiene que elegir.
// - Obra de cuadros / obra de ilustraciones: su disciplina, visible y al final de la lista.
// - Cuadro / ilustración dentro de una obra: la obra, la disciplina y el número siguiente (1, 2, 3…).
// - Ilustración suelta: disciplina Ilustraciones, sin obra.
// Las disciplinas se buscan por su dirección (slug), así funcionan con cualquier ID.

const API_VERSION = '2026-11-05'
const PUBLICADOS = '!(_id in path("drafts.**"))'
const PINTURAS = 'pinturas'
const PAPEL = 'obras-sobre-papel'

async function referenciaDisciplina(client, slug) {
  const id = await client.fetch(`*[_type == "disciplina" && slug.current == $slug && ${PUBLICADOS}][0]._id`, {slug})
  return id ? {_type: 'reference', _ref: id} : undefined
}

function obraNueva(slug) {
  return async (_params, {getClient}) => {
    const client = getClient({apiVersion: API_VERSION})
    const [disciplina, ultimo] = await Promise.all([
      referenciaDisciplina(client, slug),
      client.fetch(`coalesce(*[_type == "serie" && ${PUBLICADOS}] | order(orden desc)[0].orden, 0)`),
    ])
    return {publicada: true, orden: Number(ultimo || 0) + 10, ...(disciplina ? {disciplina} : {})}
  }
}

function piezaDeObra(slug) {
  return async ({serieId}, {getClient}) => {
    const client = getClient({apiVersion: API_VERSION})
    const [disciplina, cantidad] = await Promise.all([
      referenciaDisciplina(client, slug),
      client.fetch(`count(*[_type == "obra" && serie._ref == $serieId && ${PUBLICADOS}])`, {serieId}),
    ])
    return {
      publicada: true,
      estado: 'sin-especificar',
      serie: {_type: 'reference', _ref: serieId},
      ordenEnSerie: Number(cantidad || 0) + 1,
      ...(disciplina ? {disciplina} : {}),
    }
  }
}

export const plantillas = [
  {id: 'obra-de-cuadros', title: 'Obra de cuadros', schemaType: 'serie', value: obraNueva(PINTURAS)},
  {id: 'obra-de-ilustraciones', title: 'Obra de ilustraciones', schemaType: 'serie', value: obraNueva(PAPEL)},
  {
    id: 'cuadro-de-obra',
    title: 'Cuadro',
    schemaType: 'obra',
    parameters: [{name: 'serieId', type: 'string'}],
    value: piezaDeObra(PINTURAS),
  },
  {
    id: 'ilustracion-de-obra',
    title: 'Ilustración',
    schemaType: 'obra',
    parameters: [{name: 'serieId', type: 'string'}],
    value: piezaDeObra(PAPEL),
  },
  {
    id: 'ilustracion',
    title: 'Ilustración suelta',
    schemaType: 'obra',
    value: async (_params, {getClient}) => {
      const disciplina = await referenciaDisciplina(getClient({apiVersion: API_VERSION}), PAPEL)
      return {publicada: true, estado: 'sin-especificar', ...(disciplina ? {disciplina} : {})}
    },
  },
]

// En el botón "+" de arriba solo se ofrece crear obras o ilustraciones sueltas.
// Un cuadro o una ilustración de una obra se crea desde adentro de esa obra (así ya queda vinculado).
export const plantillasGlobales = new Set(['obra-de-cuadros', 'obra-de-ilustraciones', 'ilustracion'])
