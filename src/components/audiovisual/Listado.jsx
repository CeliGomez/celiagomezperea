import { useRef, useState } from 'react'
import ModalVimeo from './ModalVimeo.jsx'
import ObraPlaceholder from '../obras/ObraPlaceholder.jsx'

/*
	Videoteca de Audiovisual.
	- Arriba, el video destacado grande (franja crema).
	- Después, los videos agrupados por tipo (Performance, Videoinstalación…), cada grupo en su franja,
	  alternando blanco y crema como las obras de Cuadros. Los que no tienen tipo van a «Otros videos».
	- Cada tarjeta: portada 16:9 con ▶ y la duración; abajo título, año y tipo. Al tocarla se abre el reproductor.
	grupos: [{ id, nombre, proyectos }] (se arman en la página).
*/

function Portada({ proyecto, onAbrir, sizes, prioridad = false }) {
	const foto = proyecto.miniatura?.src ? proyecto.miniatura : proyecto.miniaturaUrl ? { src: proyecto.miniaturaUrl, alt: '' } : null
	const [rota, setRota] = useState(false)
	const titulo = proyecto.titulo || 'Sin título'
	return (
		<button type="button" className="vt-portada" aria-label={`Reproducir ${titulo}`} onClick={(event) => onAbrir(proyecto, event)}>
			{foto?.src && !rota ? (
				<img
					src={foto.src}
					srcSet={foto.srcset || undefined}
					sizes={sizes}
					alt=""
					width={proyecto.ancho || 1280}
					height={proyecto.alto || 720}
					loading={prioridad ? 'eager' : 'lazy'}
					fetchPriority={prioridad ? 'high' : 'auto'}
					decoding="async"
					onError={() => setRota(true)}
				/>
			) : (
				<ObraPlaceholder llenar pie proporcion="horizontal" titulo={titulo} />
			)}
			<span className="vt-portada__play" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path d="M8 5.5v13l11-6.5z" />
				</svg>
			</span>
			{proyecto.duracion && <span className="vt-portada__duracion">{proyecto.duracion}</span>}
		</button>
	)
}

function datos(proyecto, conTipo = true) {
	return [proyecto.anio, conTipo ? proyecto.categoria : '', proyecto.duracion].filter(Boolean).join(' · ')
}

function Tarjeta({ proyecto, onAbrir, conTipo }) {
	const linea = [proyecto.anio, conTipo ? proyecto.categoria : ''].filter(Boolean).join(' · ')
	return (
		<article className="vt-tarjeta">
			<Portada proyecto={proyecto} onAbrir={onAbrir} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 46vw, 100vw" />
			<div className="vt-tarjeta__pie">
				<h3 className="vt-tarjeta__titulo">{proyecto.titulo || 'Sin título'}</h3>
				{linea && <p className="vt-tarjeta__datos">{linea}</p>}
			</div>
		</article>
	)
}

export default function Listado({ destacado = null, grupos = [] }) {
	const [activo, setActivo] = useState(null)
	const origen = useRef(null)

	function abrir(proyecto, event) {
		if (!proyecto?.vimeoId) return
		origen.current = event?.currentTarget || null
		setActivo(proyecto)
	}

	function cerrar() {
		setActivo(null)
		origen.current?.focus()
	}

	const varios = grupos.length > 1

	return (
		<div className="videoteca">
			{destacado && (
				<section className="vt-destacado" aria-labelledby="vt-destacado-titulo">
					<div className="vt-destacado__inner contenedor">
						<Portada proyecto={destacado} onAbrir={abrir} prioridad sizes="(min-width: 64rem) 60vw, 100vw" />
						<div className="vt-destacado__texto">
							<p className="vt-etiqueta">
								<span>Video destacado</span>
								<span className="vt-etiqueta__filete" aria-hidden="true" />
							</p>
							<h2 id="vt-destacado-titulo" className="vt-destacado__titulo">
								{destacado.titulo || 'Sin título'}
							</h2>
							{datos(destacado) && <p className="vt-destacado__datos">{datos(destacado)}</p>}
							{destacado.descripcionCorta && <p className="vt-destacado__desc">{destacado.descripcionCorta}</p>}
							<button type="button" className="btn btn-relleno vt-destacado__btn" onClick={(event) => abrir(destacado, event)}>
								<span aria-hidden="true">▶</span> Ver video
							</button>
						</div>
					</div>
				</section>
			)}

			{grupos.map((grupo, indice) => (
				<section
					key={grupo.id}
					id={grupo.id}
					className={indice % 2 === 1 ? 'vt-grupo vt-grupo--crema' : 'vt-grupo'}
					aria-labelledby={`${grupo.id}-titulo`}
				>
					<div className="contenedor">
						<div className="vt-grupo__encabezado">
							<h2 id={`${grupo.id}-titulo`} className="vt-grupo__titulo">
								{varios ? grupo.nombre : 'Todos los videos'}
							</h2>
							<p className="vt-grupo__cantidad">
								{grupo.proyectos.length} {grupo.proyectos.length === 1 ? 'video' : 'videos'}
							</p>
						</div>
						<ul className="vt-grilla">
							{grupo.proyectos.map((proyecto) => (
								<li key={proyecto.id}>
									<Tarjeta proyecto={proyecto} onAbrir={abrir} conTipo={!varios} />
								</li>
							))}
						</ul>
					</div>
				</section>
			))}

			<ModalVimeo proyecto={activo} onCerrar={cerrar} />
		</div>
	)
}
