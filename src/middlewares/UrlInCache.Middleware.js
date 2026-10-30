    import { getProductoApiUrl,
            productosCacheContext,
            productoCacheHitContext} from './routerContext.js';

    export async function UrlInCacheMiddleware({context, params}, next){
        const urlProducto = getProductoApiUrl(params.idProducto) //<---- url de la api para obtener producto con ese id
        const productosCache = context.get(productosCacheContext) //<---- obtener del contexto de react-router el objeto Map que contiene los productos cacheados
        const cacheHit = productosCache.has(urlProducto) //<----- comprobamos si para esa url hay un producto ya guardado

        context.set(productoCacheHitContext, cacheHit)
        console.log(
            cacheHit
            ? '===> el producto ya estaba en la cache, el loader no hara fetch:'
            : '===> el producto no estaba en la cache, el loader hara fetch:',
            urlProducto,
        )

        return next()
    }