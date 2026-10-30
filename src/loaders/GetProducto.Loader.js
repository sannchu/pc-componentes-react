import {
  getProductoApiUrl,
  productoCacheHitContext,
  productosCacheContext,
} from '../middlewares/routerContext.js'

export default async function GetProductoLoader ({ params, context }) {
  const urlProducto = getProductoApiUrl(params.idProducto)
  const productosCache = context.get(productosCacheContext)

  if (context.get(productoCacheHitContext)) {
    console.log('===> producto recuperado de la cache:', urlProducto)
    return productosCache.get(urlProducto)
  }

  console.log('===> ejecutando fetch para obtener el producto:', urlProducto)
  const petFetchProducto = await fetch(urlProducto)
  const { codigo, mensaje, datos } = await petFetchProducto.json()

  if (codigo !== 0) {
    console.error('===> error al recuperar el producto:', mensaje)
    return null
  }

  productosCache.set(urlProducto, datos.producto)
  console.log('===> producto guardado en la cache:', urlProducto)
  return datos.producto
}