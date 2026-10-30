import './OffCanvas.css'
import useStore from '../../../../stateGlobal/zustandStateSlices.js'
import MiniProductoOffCanvas from './MiniProductoOffCanvas/MiniProductoOffCanvas.jsx'

export default function OffCanvas() {
    const { carrito, setCarrito } = useStore()
    const itemsPedido = Array.isArray(carrito?.itemsPedido) ? carrito.itemsPedido : []

    return (
        <div
            className="offcanvas offcanvas-end offcanvas-carrito"
            tabIndex={-1}
            id="offCanvasCarrito"
            aria-labelledby="offcanvasRightLabel"
        >
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasRightLabel">Mi Cesta</h5>
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Cerrar cesta"
                />
            </div>
            <hr />
            <div className="offcanvas-body">
                {itemsPedido.length > 0 ? (
                    <div className="d-grid gap-3">
                        {itemsPedido.map((itemPedido, posicion) => (
                            <MiniProductoOffCanvas
                                key={itemPedido.producto?._id ?? posicion}
                                producto={itemPedido.producto}
                                cantidad={itemPedido.cantidad}
                                onEliminar={() => setCarrito('eliminar', itemPedido)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center h-100">
                        <h5>Tu carrito está vacío</h5>
                        <p className="mb-1">Explora multitud de artículos a buen precio</p>
                        <p>desde nuestra página principal</p>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            data-bs-dismiss="offcanvas"
                            aria-label="Cerrar cesta y explorar artículos"
                        >
                            Explora artículos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
