import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import useStore from '../../../stateGlobal/zustandStateSlices.js'
import './DetallesProducto.css'

const API_PRODUCTO = 'http://localhost:3000/api/Tienda/Producto'

const CAMPOS_MOSTRADOS_APARTE = new Set([
    '_id',
    'nombre',
    'imagenes',
    'precio',
    'descuento',
    'valoracionMedia',
    'opiniones',
    'vendedor',
    'descripcion',
    'descripcionCorta',
    'resumen',
    'marca',
    'pathCategoria',
    'caracteristicas',
    'caracteristicasPrincipales',
    'caracteristicasDestacadas',
    'caracteristicasTecnicas',
    'puntosFuertes',
    'especificaciones',
    'especificacionesTecnicas',
    'fichaTecnica',
    'detallesTecnicos',
    'atributos',
    'specs',
    'especificacionesProducto',
    'preguntas',
    'preguntasRespuestas',
    'preguntasYRespuestas',
    'preguntasRespuestasProducto',
    'preguntasFrecuentes',
    'faqs'
])

const CAMPOS_CARACTERISTICAS = [
    'caracteristicas',
    'caracteristicasPrincipales',
    'caracteristicasDestacadas',
    'caracteristicasTecnicas',
    'puntosFuertes'
]

const CAMPOS_ESPECIFICACIONES = [
    'especificaciones',
    'especificacionesTecnicas',
    'fichaTecnica',
    'detallesTecnicos',
    'atributos',
    'specs',
    'especificacionesProducto'
]

const CAMPOS_PREGUNTAS = [
    'preguntasRespuestas',
    'preguntasYRespuestas',
    'preguntasRespuestasProducto',
    'preguntas',
    'preguntasFrecuentes',
    'faqs'
]

const CAMPOS_ETIQUETA = ['nombre', 'titulo', 'title', 'label', 'clave', 'campo', 'atributo', 'propiedad', 'caracteristica', 'especificacion']
const CAMPOS_VALOR = ['valor', 'value', 'detalle', 'descripcion', 'description', 'contenido', 'respuesta']

const formatoPrecio = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
})

function etiquetaCampo(nombre) {
    return nombre
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .replace(/^./, letra => letra.toUpperCase())
}

function valorComoTexto(valor) {
    if (Array.isArray(valor)) {
        return valor.map(valorComoTexto).filter(Boolean).join(', ')
    }

    if (valor && typeof valor === 'object') {
        return Object.entries(valor)
            .map(([clave, contenido]) => `${etiquetaCampo(clave)}: ${valorComoTexto(contenido)}`)
            .filter(Boolean)
            .join(' · ')
    }

    if (valor === null || valor === undefined || valor === '') return ''
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
    return String(valor)
}

function primerCampo(objeto, campos) {
    for (const campo of campos) {
        const valor = objeto?.[campo]
        if (valor !== undefined && valor !== null && valor !== '') return valor
    }
    return undefined
}

function normalizarEntradas(datos, prefijo = '') {
    if (datos === null || datos === undefined || datos === '') return []

    if (Array.isArray(datos)) {
        return datos.flatMap((item, indice) => {
            const etiquetaPredeterminada = prefijo || `Detalle ${indice + 1}`
            if (item && typeof item === 'object') {
                return normalizarEntradas(item, prefijo)
            }
            const texto = valorComoTexto(item)
            return texto ? [[etiquetaPredeterminada, texto]] : []
        })
    }

    if (typeof datos === 'object') {
        const etiqueta = primerCampo(datos, CAMPOS_ETIQUETA)
        const valor = primerCampo(datos, CAMPOS_VALOR)

        if (etiqueta !== undefined && valor !== undefined) {
            const nombre = valorComoTexto(etiqueta)
            const titulo = prefijo && prefijo !== nombre ? `${prefijo} · ${nombre}` : nombre
            return [[titulo || prefijo || 'Detalle', valorComoTexto(valor)]]
        }

        return Object.entries(datos).flatMap(([campo, contenido]) => {
            if (['id', '_id', 'codigo', 'orden'].includes(campo)) return []
            const etiquetaCampoCompleta = prefijo
                ? `${prefijo} · ${etiquetaCampo(campo)}`
                : etiquetaCampo(campo)
            if (contenido && typeof contenido === 'object') {
                return normalizarEntradas(contenido, etiquetaCampoCompleta)
            }
            const texto = valorComoTexto(contenido)
            return texto ? [[etiquetaCampoCompleta, texto]] : []
        })
    }

    const texto = valorComoTexto(datos)
    return texto ? [[prefijo || 'Detalle', texto]] : []
}

function normalizarPreguntas(datos) {
    const esPreguntaIndividual = datos && typeof datos === 'object' && !Array.isArray(datos)
        && primerCampo(datos, ['pregunta', 'question', 'titulo', 'title']) !== undefined
    const lista = Array.isArray(datos)
        ? datos
        : esPreguntaIndividual
            ? [datos]
            : datos && typeof datos === 'object'
                ? Object.entries(datos).map(([pregunta, respuesta]) => (
                    respuesta && typeof respuesta === 'object'
                        ? { ...respuesta, pregunta: respuesta.pregunta || pregunta }
                        : { pregunta, respuesta }
                ))
                : []

    return lista.map((item, indice) => {
        const pregunta = typeof item === 'string'
            ? item
            : primerCampo(item, ['pregunta', 'question', 'titulo', 'title', 'texto', 'contenido'])
        const respuesta = typeof item === 'object' && item
            ? primerCampo(item, ['respuesta', 'answer', 'solucion', 'descripcion', 'description'])
            : ''

        return {
            id: item?._id || `pregunta-${indice}`,
            pregunta: valorComoTexto(pregunta),
            respuesta: valorComoTexto(respuesta),
            autor: item && typeof item === 'object'
                ? valorComoTexto(item.autor || item.usuario?.nombre || item.cliente?.nombre || '')
                : ''
        }
    }).filter(item => item.pregunta)
}

function textoOpinion(opinion) {
    if (typeof opinion === 'string') return opinion
    if (!opinion || typeof opinion !== 'object') return ''

    const texto = opinion.comentario || opinion.texto || opinion.opinion || opinion.contenido || opinion.descripcion
    return typeof texto === 'string' ? texto : valorComoTexto(opinion)
}

function autorOpinion(opinion, indice) {
    if (opinion && typeof opinion === 'object') {
        return opinion.autor || opinion.nombre || opinion.cliente?.nombre || `Cliente ${indice + 1}`
    }
    return `Cliente ${indice + 1}`
}

function DetallesProducto() {
    const { idProducto } = useParams()
    const [producto, setProducto] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [indiceImagen, setIndiceImagen] = useState(0)
    const [productoAgregado, setProductoAgregado] = useState(false)
    const [preguntaAbierta, setPreguntaAbierta] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        async function recuperarProducto() {
            setProducto(null)
            setIndiceImagen(0)
            setProductoAgregado(false)
            setPreguntaAbierta(0)
            setCargando(true)
            setError('')

            try {
                const response = await fetch(
                    `${API_PRODUCTO}/${encodeURIComponent(idProducto)}`,
                    { signal: controller.signal }
                )
                const respuesta = await response.json()

                if (!response.ok || respuesta.codigo !== 0 || !respuesta.datos?.producto) {
                    throw new Error(respuesta.mensaje || 'No se pudo recuperar el producto')
                }

                setProducto(respuesta.datos.producto)
            } catch (errorCarga) {
                if (errorCarga.name !== 'AbortError') {
                    console.error('Error al obtener el producto:', errorCarga)
                    setError(errorCarga.message || 'No se pudo recuperar el producto')
                }
            } finally {
                if (!controller.signal.aborted) setCargando(false)
            }
        }

        recuperarProducto()
        return () => controller.abort()
    }, [idProducto])

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5" role="status">
                <div className="spinner-border text-primary me-3" aria-hidden="true"></div>
                <span className="text-slate-600">Cargando los detalles del producto...</span>
            </div>
        )
    }

    if (error || !producto) {
        return (
            <section className="container py-5">
                <div className="alert alert-warning" role="alert">
                    {error || 'No se ha encontrado el producto solicitado.'}
                </div>
                <Link to="/" className="btn btn-primary">Volver a la tienda</Link>
            </section>
        )
    }

    const imagenes = Array.isArray(producto.imagenes)
        ? producto.imagenes.filter(imagen => typeof imagen === 'string' && imagen.length > 0)
        : []
    const precio = Number(producto.precio)
    const tienePrecio = producto.precio !== null
        && producto.precio !== undefined
        && producto.precio !== ''
        && Number.isFinite(precio)
    const porcentajeDescuento = Number(producto.descuento?.porcentaje) || 0
    const conDescuento = Boolean(producto.descuento?.tieneDescuento) && tienePrecio
    const precioFinal = conDescuento
        ? precio - (precio * porcentajeDescuento / 100)
        : precio
    const opiniones = Array.isArray(producto.opiniones) ? producto.opiniones : []
    const valoracion = Math.min(5, Math.max(0, Number(producto.valoracionMedia) || 0))
    const descripcionOriginal = producto.descripcion || producto.descripcionCorta || producto.resumen
    const descripcion = typeof descripcionOriginal === 'string'
        ? descripcionOriginal
        : valorComoTexto(descripcionOriginal)
    const caracteristicasExplicitas = normalizarEntradas(primerCampo(producto, CAMPOS_CARACTERISTICAS))
    const especificacionesExplicitas = normalizarEntradas(primerCampo(producto, CAMPOS_ESPECIFICACIONES))
    const especificacionesGenerales = normalizarEntradas(Object.fromEntries(
        Object.entries(producto).filter(([campo]) => !CAMPOS_MOSTRADOS_APARTE.has(campo))
    ))
    const especificacionesBase = especificacionesExplicitas.length > 0
        ? especificacionesExplicitas
        : especificacionesGenerales
    const especificaciones = especificacionesBase.map(([campo, valor], index) => [
        /^Detalle \d+$/.test(campo) ? `Especificación ${index + 1}` : campo,
        valor
    ])
    const caracteristicas = caracteristicasExplicitas.length > 0
        ? caracteristicasExplicitas
        : especificaciones.slice(0, 6)
    const caracteristicasPresentables = caracteristicas.map(([campo, valor], index) => [
        /^Detalle \d+$/.test(campo) ? `Punto destacado ${index + 1}` : campo,
        valor
    ])
    const preguntas = normalizarPreguntas(primerCampo(producto, CAMPOS_PREGUNTAS))
    const imagenPrincipal = imagenes[indiceImagen] || imagenes[0]
    const rutaProductos = producto.pathCategoria
        ? `/Productos?pathCat=${encodeURIComponent(producto.pathCategoria)}`
        : '/'
    const codigoProducto = producto.codigoArticulo || producto.sku || producto.pn || producto._id

    function agregarAlCarrito() {
        if (!tienePrecio) return

        const idProductoCarrito = producto._id?.toString?.() || producto._id

        useStore.setState(estadoAnterior => {
            const carritoActual = estadoAnterior.carrito || { itemsPedido: [], gastosEnvio: 0 }
            const itemsPedido = Array.isArray(carritoActual.itemsPedido)
                ? [...carritoActual.itemsPedido]
                : []
            const posicion = itemsPedido.findIndex(item => item.producto?._id === idProductoCarrito)

            if (posicion >= 0) {
                itemsPedido[posicion] = {
                    ...itemsPedido[posicion],
                    cantidad: (Number(itemsPedido[posicion].cantidad) || 0) + 1
                }
            } else {
                itemsPedido.push({
                    producto: {
                        _id: idProductoCarrito,
                        nombre: producto.nombre,
                        imagenProducto: imagenPrincipal || '',
                        precio: precioFinal,
                        descuentoPrecio: conDescuento ? precio - precioFinal : 0
                    },
                    cantidad: 1
                })
            }

            const subtotal = itemsPedido.reduce(
                (total, item) => total + (Number(item.producto?.precio) || 0) * (Number(item.cantidad) || 0),
                0
            )
            const gastosEnvio = Number(carritoActual.gastosEnvio) || 0
            const iva = subtotal * 0.12

            return {
                carrito: {
                    ...carritoActual,
                    itemsPedido,
                    subtotal,
                    gastosEnvio,
                    iva,
                    total: subtotal + gastosEnvio + iva
                }
            }
        })

        setProductoAgregado(true)
    }

    return (
        <main className="container-xl py-4 producto-detalle">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
                    <li className="breadcrumb-item"><Link to={rutaProductos}>Productos</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
                </ol>
            </nav>

            <div className="row g-4 g-xl-5 align-items-start producto-detalle-principal">
                <section className="col-12 col-md-5 col-lg-4" aria-label="Imágenes del producto">
                    <div className="producto-detalle-galeria">
                        <div className="producto-detalle-imagen-principal">
                            {imagenPrincipal ? (
                                <img src={imagenPrincipal} alt={producto.nombre} className="img-fluid" />
                            ) : (
                                <div className="text-slate-400 text-lg">Imagen no disponible</div>
                            )}
                        </div>

                        {imagenes.length > 1 && (
                            <div className="d-flex flex-wrap gap-2 justify-content-center p-3">
                                {imagenes.map((imagen, index) => (
                                    <button
                                        key={`${imagen}-${index}`}
                                        type="button"
                                        className={`producto-detalle-miniatura ${index === indiceImagen ? 'activa' : ''}`}
                                        onClick={() => setIndiceImagen(index)}
                                        aria-label={`Ver imagen ${index + 1}`}
                                        aria-pressed={index === indiceImagen}
                                    >
                                        <img src={imagen} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="col-12 col-md-7 col-lg-5 producto-detalle-resumen" aria-labelledby="producto-nombre">
                    {producto.marca && <p className="producto-detalle-marca mb-1">{producto.marca}</p>}
                    <h1 className="producto-detalle-titulo mb-2" id="producto-nombre">{producto.nombre}</h1>

                    <div className="d-flex align-items-center flex-wrap gap-2 mb-3 producto-detalle-valoracion">
                        <span className="producto-detalle-estrellas" aria-label={`Valoración: ${valoracion} de 5`}>
                            {[1, 2, 3, 4, 5].map(estrella => (
                                <i
                                    key={estrella}
                                    className={`fa-${estrella <= Math.floor(valoracion) ? 'solid' : 'regular'} fa-star`}
                                    aria-hidden="true"
                                ></i>
                            ))}
                        </span>
                        <span className="fw-semibold">{valoracion.toFixed(1)}</span>
                        <a href="#producto-opiniones">{opiniones.length} opiniones</a>
                    </div>

                    <p className="producto-detalle-codigo mb-3">Ref.: <span>{valorComoTexto(codigoProducto)}</span></p>

                    {descripcion && <p className="producto-detalle-intro mb-4">{descripcion}</p>}

                    {caracteristicasPresentables.length > 0 && (
                        <div className="producto-detalle-destacados mb-4">
                            {caracteristicasPresentables.slice(0, 4).map(([campo, valor], index) => (
                                <div className="producto-detalle-destacado" key={`${campo}-${index}`}>
                                    <span>{etiquetaCampo(campo)}</span>
                                    <strong>{valorComoTexto(valor)}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    <a className="producto-detalle-enlace" href="#producto-caracteristicas">
                        Ver características y especificaciones <i className="fa-solid fa-chevron-down ms-1" aria-hidden="true"></i>
                    </a>
                </section>

                <aside className="col-12 col-lg-3" aria-label="Precio y compra">
                    <div className="producto-detalle-compra">
                        {conDescuento && porcentajeDescuento > 0 && (
                            <span className="badge text-bg-danger mb-2">-{porcentajeDescuento}%</span>
                        )}
                        {conDescuento && porcentajeDescuento > 0 && (
                            <p className="producto-detalle-precio-anterior mb-1">
                                <span className="text-decoration-line-through">{formatoPrecio.format(precio)}</span>
                                <span className="ms-2">PVPR</span>
                            </p>
                        )}
                        <div className="producto-detalle-precio">
                            {tienePrecio ? formatoPrecio.format(precioFinal) : 'Precio no disponible'}
                        </div>

                        <div className="producto-detalle-compra-envio">
                            <p><i className="fa-solid fa-truck-fast" aria-hidden="true"></i> Envío y devolución según disponibilidad</p>
                            <p><i className="fa-solid fa-store" aria-hidden="true"></i> Consulta disponibilidad en tienda</p>
                            <p className="mb-0"><i className="fa-solid fa-shop" aria-hidden="true"></i> Vendido por <strong>{producto.vendedor || 'el vendedor del producto'}</strong></p>
                        </div>

                        <button
                            type="button"
                            className="btn producto-detalle-boton-carrito w-100"
                            onClick={agregarAlCarrito}
                            disabled={!tienePrecio}
                        >
                            <i className={`fa-solid ${productoAgregado ? 'fa-check' : 'fa-cart-shopping'} me-2`} aria-hidden="true"></i>
                            {productoAgregado ? 'Añadido a la cesta' : 'Añadir al carrito'}
                        </button>
                        <span className="visually-hidden" aria-live="polite">
                            {productoAgregado ? 'Producto añadido a la cesta.' : ''}
                        </span>
                    </div>
                </aside>
            </div>

            <section className="mt-5 producto-detalle-contenido" id="producto-caracteristicas" aria-label={`Información detallada de ${producto.nombre}`}>
                <nav className="producto-detalle-pestanas mb-4" aria-label="Secciones del producto">
                    <a href="#producto-sobre" className="activa">Sobre el producto</a>
                    <a href="#producto-caracteristicas-lista">Características</a>
                    <a href="#producto-especificaciones">Especificaciones</a>
                    <a href="#producto-opiniones">Opiniones ({opiniones.length})</a>
                    <a href="#producto-preguntas">Preguntas y respuestas ({preguntas.length})</a>
                </nav>

                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        <section className="producto-detalle-panel mb-4" id="producto-sobre" aria-labelledby="producto-sobre-titulo">
                            <span className="producto-detalle-etiqueta-seccion">Información del producto</span>
                            <h2 id="producto-sobre-titulo" className="producto-detalle-seccion-titulo">Sobre el producto</h2>
                            <p className="mb-0 producto-detalle-descripcion">
                                {descripcion || `Consulta las características y especificaciones disponibles de ${producto.nombre}.`}
                            </p>
                        </section>

                        <section className="producto-detalle-panel mb-4" id="producto-caracteristicas-lista" aria-labelledby="producto-caracteristicas-titulo">
                            <div className="producto-detalle-cabecera-seccion">
                                <span className="producto-detalle-etiqueta-seccion">Lo más destacado</span>
                                <h2 className="producto-detalle-seccion-titulo" id="producto-caracteristicas-titulo">Características</h2>
                                <p className="producto-detalle-ayuda-seccion">Los puntos principales para conocer este producto de un vistazo.</p>
                            </div>

                            {caracteristicasPresentables.length === 0 ? (
                                <p className="producto-detalle-vacio mb-0">No hay características destacadas disponibles para este producto.</p>
                            ) : (
                                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
                                    {caracteristicasPresentables.map(([campo, valor], index) => (
                                        <article className="col" key={`${campo}-${index}`}>
                                            <div className="producto-detalle-caracteristica">
                                                <span className="producto-detalle-caracteristica-icono" aria-hidden="true">
                                                    <i className="fa-solid fa-circle-check"></i>
                                                </span>
                                                <div>
                                                    <h3>{etiquetaCampo(campo)}</h3>
                                                    <p>{valorComoTexto(valor)}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="producto-detalle-panel mb-4" id="producto-especificaciones" aria-labelledby="producto-especificaciones-titulo">
                            <div className="producto-detalle-cabecera-seccion">
                                <span className="producto-detalle-etiqueta-seccion">Ficha técnica</span>
                                <h2 className="producto-detalle-seccion-titulo" id="producto-especificaciones-titulo">Especificaciones</h2>
                                <p className="producto-detalle-ayuda-seccion">Detalles técnicos y datos facilitados para este producto.</p>
                            </div>

                            {especificaciones.length === 0 ? (
                                <p className="producto-detalle-vacio mb-0">No hay especificaciones técnicas disponibles.</p>
                            ) : (
                                <div className="table-responsive producto-detalle-tabla-contenedor">
                                    <table className="table table-hover align-middle mb-0 producto-detalle-tabla">
                                        <thead>
                                            <tr>
                                                <th scope="col">Característica</th>
                                                <th scope="col">Especificación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {especificaciones.map(([campo, valor], index) => (
                                                <tr key={`${campo}-${index}`}>
                                                    <th scope="row">{etiquetaCampo(campo)}</th>
                                                    <td>{valorComoTexto(valor)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section id="producto-opiniones" className="producto-detalle-panel mb-4" aria-labelledby="producto-opiniones-titulo">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                                <div>
                                    <span className="producto-detalle-etiqueta-seccion">Valoraciones de clientes</span>
                                    <h2 id="producto-opiniones-titulo" className="producto-detalle-seccion-titulo mb-0">Opiniones</h2>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="producto-detalle-estrellas" aria-label={`Valoración media: ${valoracion} de 5`}>
                                        <i className="fa-solid fa-star" aria-hidden="true"></i>
                                    </span>
                                    <strong>{valoracion.toFixed(1)} / 5</strong>
                                    <span className="text-slate-500">({opiniones.length})</span>
                                </div>
                            </div>

                            {opiniones.length === 0 ? (
                                <p className="producto-detalle-vacio mb-0">Este producto todavía no tiene opiniones.</p>
                            ) : (
                                <div className="d-grid gap-3">
                                    {opiniones.slice(0, 3).map((opinion, index) => {
                                        const puntuacion = Math.min(5, Math.max(0, Number(opinion?.valoracion ?? opinion?.puntuacion) || 0))
                                        return (
                                            <article className="producto-detalle-opinion" key={opinion?._id || index}>
                                                <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                                                    <strong>{autorOpinion(opinion, index)}</strong>
                                                    {puntuacion > 0 && (
                                                        <span className="producto-detalle-estrellas">
                                                            {puntuacion.toFixed(1)} <i className="fa-solid fa-star" aria-hidden="true"></i>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-0 text-slate-600">{textoOpinion(opinion)}</p>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                        <section id="producto-preguntas" className="producto-detalle-panel" aria-labelledby="producto-preguntas-titulo">
                            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
                                <div>
                                    <span className="producto-detalle-etiqueta-seccion">Resuelve tus dudas</span>
                                    <h2 id="producto-preguntas-titulo" className="producto-detalle-seccion-titulo mb-1">Preguntas y respuestas</h2>
                                    <p className="producto-detalle-ayuda-seccion mb-0">
                                        {preguntas.length === 1 ? '1 pregunta sobre este producto' : `${preguntas.length} preguntas sobre este producto`}
                                    </p>
                                </div>
                            </div>

                            {preguntas.length === 0 ? (
                                <div className="producto-detalle-vacio producto-detalle-preguntas-vacio">
                                    <i className="fa-regular fa-comments" aria-hidden="true"></i>
                                    <p className="mb-0">Todavía no hay preguntas sobre este producto.</p>
                                </div>
                            ) : (
                                <div className="accordion producto-detalle-acordeon">
                                    {preguntas.map((pregunta, index) => {
                                        const abierta = preguntaAbierta === index
                                        const idRespuesta = `producto-pregunta-respuesta-${index}`
                                        return (
                                            <article className="accordion-item producto-detalle-pregunta" key={pregunta.id}>
                                                <h3 className="accordion-header">
                                                    <button
                                                        type="button"
                                                        className={`accordion-button ${abierta ? '' : 'collapsed'}`}
                                                        aria-expanded={abierta}
                                                        aria-controls={idRespuesta}
                                                        onClick={() => setPreguntaAbierta(abierta ? -1 : index)}
                                                    >
                                                        <span className="producto-detalle-pregunta-marca" aria-hidden="true">P</span>
                                                        {pregunta.pregunta}
                                                    </button>
                                                </h3>
                                                <div id={idRespuesta} className={`accordion-collapse collapse ${abierta ? 'show' : ''}`}>
                                                    <div className="accordion-body">
                                                        <div className="producto-detalle-respuesta">
                                                            <span className="producto-detalle-pregunta-marca respuesta" aria-hidden="true">R</span>
                                                            <div>
                                                                <p className="mb-1">{pregunta.respuesta || 'Esta pregunta todavía no tiene respuesta.'}</p>
                                                                {pregunta.autor && <span className="producto-detalle-autor-respuesta">Respondido por {pregunta.autor}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="col-12 col-lg-4">
                        <div className="producto-detalle-resumen-rapido">
                            <h2 className="h5 fw-bold mb-3">Resumen del producto</h2>
                            <p className="mb-2"><strong>Valoración:</strong> {valoracion.toFixed(1)} / 5</p>
                            <p className="mb-2"><strong>Opiniones:</strong> {opiniones.length}</p>
                            <p className="mb-2"><strong>Características:</strong> {caracteristicasPresentables.length}</p>
                            <p className="mb-2"><strong>Especificaciones:</strong> {especificaciones.length}</p>
                            <p className="mb-0"><strong>Vendedor:</strong> {producto.vendedor || 'No especificado'}</p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    )
}

export default DetallesProducto
