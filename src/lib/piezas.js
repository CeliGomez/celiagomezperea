// Identificación de cada pieza (cuadro o ilustración).
// Las piezas no tienen nombre propio: se identifican por la obra a la que pertenecen y su número
// dentro de ella. Cada una tiene un código corto, por ejemplo «VVB-03» (Una vez vi blanco, N.º 3),
// que también viaja en el mensaje de WhatsApp para que Celia sepa de qué pieza le hablan.

// Palabras que no cuentan para la sigla.
const VACIAS = new Set([
	'a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'lo', 'los', 'mi', 'o', 'para',
	'por', 'que', 'se', 'sin', 'su', 'te', 'tu', 'u', 'un', 'una', 'unas', 'unos', 'y',
])

function sinAcentos(texto) {
	return String(texto || '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
}

// Sigla de una obra: iniciales de sus palabras importantes (máximo 3).
// «Una vez vi blanco» → VVB · «Enraizando soles» → ES · «AndarPatagonia» → AP.
// Si en Sanity la obra tiene una sigla cargada, se usa esa.
export function siglaDe(nombre, sigla = '') {
	const propia = sinAcentos(sigla).replace(/[^a-z0-9]/gi, '').toUpperCase()
	if (propia) return propia.slice(0, 4)
	const palabras = sinAcentos(nombre)
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.split(/[^a-z0-9]+/i)
		.filter(Boolean)
	const importantes = palabras.filter((palabra) => !VACIAS.has(palabra.toLowerCase()))
	const lista = importantes.length ? importantes : palabras
	if (lista.length === 1) return lista[0].slice(0, 3).toUpperCase()
	return lista
		.slice(0, 3)
		.map((palabra) => palabra[0])
		.join('')
		.toUpperCase()
}

// Código de la pieza: sigla + número con dos cifras. Las ilustraciones sueltas usan «IL».
export function codigoPieza({ obra = '', sigla = '', numero = 0 } = {}) {
	if (!(numero > 0)) return ''
	const base = obra ? siglaDe(obra, sigla) : 'IL'
	return `${base}-${String(numero).padStart(2, '0')}`
}

// Un título cargado en Sanity cuenta como nombre propio solo si tiene alguna mayúscula.
// Los nombres de archivo («unavez», «enquesala2», «en que sala») se toman como «sin título».
// Si una pieza tiene nombre propio, se carga con mayúscula: «Raíz azul».
export function tituloPropio(titulo) {
	const texto = String(titulo || '').trim()
	if (!texto || /^sin t[ií]tulo$/i.test(texto)) return ''
	if (/\.(jpe?g|png|webp|heic|tiff?)$/i.test(texto)) return ''
	if (!/[A-ZÁÉÍÓÚÑÜ]/.test(texto)) return ''
	return texto
}

export function nombrePieza(titulo) {
	return tituloPropio(titulo) || 'Sin título'
}

// Mensaje de WhatsApp ya escrito para consultar por una pieza.
export function linkWhatsapp(numero, texto = '') {
	const digitos = String(numero || '').replace(/\D/g, '')
	if (!digitos) return ''
	return texto ? `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}` : `https://wa.me/${digitos}`
}

export function mensajePieza({ titulo = '', obra = '', numero = 0, codigo = '', url = '', ilustracion = false } = {}) {
	const tipo = ilustracion ? 'la ilustración' : 'el cuadro'
	const nombre = tituloPropio(titulo)
	const partes = [
		obra ? `${tipo} N.º ${numero} de la obra «${obra}»` : `${tipo} «${nombre || 'Sin título'}»`,
		nombre && obra ? `, «${nombre}»,` : '',
		codigo ? `(código ${codigo})` : '',
	].filter(Boolean)
	return [
		`Hola Celia, te escribo desde tu web. Vi ${partes.join(' ').replace(' ,', ',')} y me interesa.`,
		'¿Está disponible? ¿Me pasás más información?',
		url,
	]
		.filter(Boolean)
		.join('\n')
}
