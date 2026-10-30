import { createContext } from 'react-router'

export const productosCacheContext = createContext(new Map())
export const productoCacheHitContext = createContext(false)

export function getProductoApiUrl(idProducto) {
  return `http://localhost:3000/api/Tienda/Producto/${encodeURIComponent(idProducto)}`
}
