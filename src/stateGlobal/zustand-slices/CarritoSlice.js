const initialCarritoState = {
    carrito: {
        itemsPedido: [],
        subtotal: 0,
        gastosEnvio: 0,
        iva: 0,
        total: 0,
    },
    setCarrito: () => {},
    resetCarrito: () => {},
}

const PORCENTAJE_IVA = 0.12

export const CarritoSlice = (_get, set) => ({
    ...initialCarritoState,
    setCarrito: (accion, itemPedido) => set(stateAnterior => {
        const carritoActual = stateAnterior.carrito || initialCarritoState.carrito
        let itemsCarrito = Array.isArray(carritoActual.itemsPedido)
            ? [...carritoActual.itemsPedido]
            : []
        const idProducto = itemPedido?.producto?._id
        const posicionItem = itemsCarrito.findIndex(item => item.producto?._id === idProducto)

        switch (accion) {
            case 'agregar': {
                if (!itemPedido?.producto) return stateAnterior

                const cantidad = Math.max(1, Number(itemPedido.cantidad) || 1)
                if (posicionItem !== -1) {
                    itemsCarrito[posicionItem] = {
                        ...itemsCarrito[posicionItem],
                        cantidad: (Number(itemsCarrito[posicionItem].cantidad) || 0) + cantidad,
                    }
                } else {
                    itemsCarrito.push({ ...itemPedido, cantidad })
                }
                break
            }
            case 'eliminar':
                itemsCarrito = itemsCarrito.filter(item => item.producto?._id !== idProducto)
                break
            case 'actualizar':
                if (posicionItem !== -1 && Number(itemPedido?.cantidad) > 0) {
                    itemsCarrito[posicionItem] = {
                        ...itemsCarrito[posicionItem],
                        cantidad: Number(itemPedido.cantidad),
                    }
                }
                break
            default:
                console.warn(`Acción desconocida: ${accion}`)
                return stateAnterior
        }

        const subtotal = itemsCarrito.reduce(
            (total, item) => total + (Number(item.producto?.precio) || 0) * (Number(item.cantidad) || 0),
            0,
        )
        const gastosEnvio = Number(carritoActual.gastosEnvio) || 0
        const iva = subtotal * PORCENTAJE_IVA

        return {
            ...stateAnterior,
            carrito: {
                itemsPedido: itemsCarrito,
                subtotal,
                gastosEnvio,
                iva,
                total: subtotal + gastosEnvio + iva,
            },
        }
    }),
    resetCarrito: () => set({ carrito: { ...initialCarritoState.carrito } }),
})
