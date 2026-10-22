import './ProductosCat.css'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { categoryChildren, categoryName, categorySlug, getCategories, getProductsByCategory, slugifyCategory } from '../../../servicios/catalogo.js'
import ProductoCard from './ProductoCard.jsx'

function findCategory(categories, slugs) {
  let currentItems = categories
  let current = null
  for (const slug of slugs) {
    current = currentItems.find((item) => categorySlug(item) === slug) ?? null
    if (!current) return null
    currentItems = categoryChildren(current)
  }
  return current
}

function ProductosCat() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const legacyName = searchParams.get('nombreCat')
  const categoryPath = useMemo(() => {
    const routePath = location.pathname.startsWith('/productos/') ? location.pathname.slice('/productos/'.length) : ''
    return routePath || (legacyName ? legacyName.split('/').map(slugifyCategory).join('/') : '')
  }, [location.pathname, legacyName])
  const slugs = useMemo(() => categoryPath.split('/').filter(Boolean), [categoryPath])
  const [categoryTree, setCategoryTree] = useState([])
  const [categoryLabel, setCategoryLabel] = useState('')
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getCategories({ signal: controller.signal }).catch(() => []),
      getProductsByCategory(categoryPath, { signal: controller.signal }),
    ]).then(([categories, result]) => {
      setCategoryTree(categories)
      const matched = findCategory(categories, slugs)
      setCategoryLabel(matched ? categoryName(matched) : (legacyName || slugs.at(-1) || 'Productos'))
      setProducts(result.products)
      setStatus(result.products.length ? 'ready' : 'empty')
    }).catch((cause) => {
      if (cause.name !== 'AbortError') {
        setError(cause.message || 'Ocurrió un error al cargar el catálogo.')
        setStatus('error')
      }
    })
    return () => controller.abort()
  }, [categoryPath, legacyName, slugs, retry])

  // Tree lookup also makes labels resolve correctly when the data request is repeated after navigation.
  const resolvedCategory = findCategory(categoryTree, slugs)
  const title = resolvedCategory ? categoryName(resolvedCategory) : categoryLabel

  return (
    <main className="catalog-page">
      <h1>{title ? `Categoría: ${title}` : 'Catálogo'}</h1>
      {status === 'loading' && <p className="catalog-message" role="status">Cargando productos…</p>}
      {status === 'error' && <div className="catalog-message catalog-error" role="alert"><p>{error}</p><button type="button" onClick={() => { setStatus('loading'); setRetry((current) => current + 1) }}>Reintentar</button></div>}
      {status === 'empty' && <p className="catalog-message">No hay productos en esta categoría.</p>}
      {status === 'ready' && <>
        <p className="catalog-count">{products.length} {products.length === 1 ? 'producto' : 'productos'}</p>
        <div className="catalog-grid">{products.map((product, index) => <ProductoCard key={product._id ?? product.id ?? `${product.nombre ?? product.name}-${index}`} product={product} />)}</div>
      </>}
    </main>
  )
}

export default ProductosCat
