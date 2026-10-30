import './MiniProductoOffCanvas.css'

export default function MiniProductoOffCanvas({ producto, cantidad, onEliminar }) {
    const imagen = producto?.imagenProducto || producto?.imagenes?.[0]

    return (
        <div className="card mb-3 mini-producto-offcanvas">
            <div className="row g-0 align-items-center">
                <div className="col-4">
                    {imagen ? (
                        <img src={imagen} className="img-fluid rounded-start mini-producto-offcanvas-imagen" alt={producto?.nombre || 'Producto'} />
                    ) : (
                        <div className="mini-producto-offcanvas-sin-imagen" aria-hidden="true" />
                    )}
                </div>
                <div className="col-8">
                    <div className="card-body py-2">
                        <div className="row align-items-start g-1">
                            <div className="col-9">
                                <h5 className="card-title mini-producto-offcanvas-nombre">{producto?.nombre || 'Producto'}</h5>
                                <p className="card-text mb-1"><strong>{Number(producto?.precio || 0).toFixed(2)} €</strong></p>
                                <p className="card-text mb-0"><small className="text-body-secondary">Unidades: {cantidad}</small></p>
                            </div>
                            <div className="col-3 text-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={onEliminar}
                                    aria-label={`Eliminar ${producto?.nombre || 'producto'} de la cesta`}
                                    title="Eliminar de la cesta"
                                >
                                    <i className="bi bi-trash" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
