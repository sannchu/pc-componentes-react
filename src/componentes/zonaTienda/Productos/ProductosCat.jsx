import './ProductosCat.css'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { categoryName, findCategoryForRoute, getCategories, getProductsByCategory, hasAmbiguousCategorySlug, slugifyCategory } from '../../../servicios/catalogo.js'
import ProductoCard from './ProductoCard.jsx'

function ProductosCat() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const legacyName = searchParams.get('nombreCat')
  const requestedPathCat = searchParams.get('pathCat') || ''
  const categoryPath = useMemo(() => {
    const prefix = location.pathname.startsWith('/categorias/') ? '/categorias/' : '/productos/'
    const routePath = location.pathname.startsWith(prefix) ? location.pathname.slice(prefix.length) : ''
    return routePath || (legacyName ? legacyName.split('/').map(slugifyCategory).join('/') : '')
  }, [location.pathname, legacyName])
  const slugs = useMemo(() => categoryPath.split('/').filter(Boolean), [categoryPath])
  const descendants = searchParams.get('descendientes') === 'true'
  const [categoryTree, setCategoryTree] = useState([])
  const [categoryLabel, setCategoryLabel] = useState('')
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const requestKey = `${location.pathname}?${searchParams.toString()}#${retry}`
  const [loadedKey, setLoadedKey] = useState('')
  const displayStatus = loadedKey === requestKey ? status : 'loading'

  useEffect(() => {
    const controller = new AbortController()
    getCategories({ signal: controller.signal }).then(async (categories) => {
      const matched = findCategoryForRoute(categories, slugs, legacyName, requestedPathCat)
      if (requestedPathCat && !matched) throw new Error('La ruta no coincide con la categoría indicada.')
      if (!matched && slugs.length === 1 && hasAmbiguousCategorySlug(categories, slugs[0])) {
        throw new Error('Esta categoría tiene una ruta ambigua. Ábrela desde el menú de categorías.')
      }
      const mongoPath = matched?.pathCat || categoryPath
      const result = await getProductsByCategory(mongoPath, { signal: controller.signal, descendants })
      setCategoryTree(categories)
      setLoadedKey(requestKey)
      setCategoryLabel(matched ? categoryName(matched) : (legacyName || slugs.at(-1) || 'Productos'))
      setProducts(result.products)
      setStatus(result.products.length ? 'ready' : 'empty')
    }).catch((cause) => {
      if (cause.name !== 'AbortError') {
        setError(cause.message || 'Ocurrió un error al cargar el catálogo.')
        setStatus('error')
        setLoadedKey(requestKey)
      }
    })
    return () => controller.abort()
  }, [categoryPath, descendants, legacyName, requestKey, requestedPathCat, slugs])

  // Tree lookup also makes labels resolve correctly when the data request is repeated after navigation.
  const resolvedCategory = findCategoryForRoute(categoryTree, slugs, legacyName, requestedPathCat)
  const title = resolvedCategory ? categoryName(resolvedCategory) : (displayStatus === 'loading' ? (legacyName || slugs.at(-1) || 'Productos') : categoryLabel)

  return (
    <main className="catalog-page">
      <h1>{title ? `Categoría: ${title}` : 'Catálogo'}</h1>
      {displayStatus === 'loading' && <p className="catalog-message" role="status">Cargando productos…</p>}
      {displayStatus === 'error' && <div className="catalog-message catalog-error" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((current) => current + 1)}>Reintentar</button></div>}
      {displayStatus === 'empty' && <p className="catalog-message">No hay productos en esta categoría.</p>}
      {displayStatus === 'ready' && <>
        <p className="catalog-count">{products.length} {products.length === 1 ? 'producto' : 'productos'}</p>
        <div className="catalog-grid">{products.map((product, index) => <ProductoCard key={product._id ?? product.id ?? `${product.nombre ?? product.name}-${index}`} product={product} />)}</div>
      </>}
    </main>
  )
}

export default ProductosCat
