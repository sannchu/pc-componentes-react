const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api/Tienda'

export function slugifyCategory(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function categoryName(category) {
  return category?.nombre ?? category?.name ?? category?.nombreCat ?? ''
}

export function categorySlug(category) {
  return category?.slug || slugifyCategory(categoryName(category))
}

export function categoryChildren(category) {
  const children = category?.hijos ?? category?.children ?? category?.subcategorias ?? []
  return Array.isArray(children) ? children : []
}

function flattenCategories(categories, result = []) {
  for (const category of categories) {
    result.push(category)
    flattenCategories(categoryChildren(category), result)
  }
  return result
}

function findCategoryByPath(categories, pathCat) {
  if (!pathCat) return null
  const matches = flattenCategories(categories).filter((category) => String(category?.pathCat ?? '') === String(pathCat))
  return matches.length === 1 ? matches[0] : null
}

function findNestedCategory(categories, slugs) {
  let currentItems = categories
  let current = null
  for (const slug of slugs) {
    current = currentItems.find((item) => categorySlug(item) === slug) ?? null
    if (!current) return null
    currentItems = categoryChildren(current)
  }
  return current
}

export function findCategoryForRoute(categories, slugs, legacyName = '', requestedPathCat = '') {
  const allCategories = flattenCategories(categories)
  const routeSlugs = slugs.length ? slugs : (legacyName ? legacyName.split('/').map(slugifyCategory) : [])
  const categoryFromPath = findCategoryByPath(categories, requestedPathCat)
  if (categoryFromPath) {
    const routeMatchesCategory = routeSlugs.length <= 1
      ? categorySlug(categoryFromPath) === (routeSlugs[0] || '')
      : findNestedCategory(categories, routeSlugs)?.pathCat === categoryFromPath.pathCat
    if (routeMatchesCategory) return categoryFromPath
  }

  if (routeSlugs.length > 1) return findNestedCategory(categories, routeSlugs)
  const targetSlug = routeSlugs[0] || ''
  const matches = allCategories.filter((item) => categorySlug(item) === targetSlug)
  if (targetSlug === 'portatiles') {
    return matches.find((item) => slugifyCategory(categoryName(item)) === 'portatiles') ?? (matches.length === 1 ? matches[0] : null)
  }
  return matches.length === 1 ? matches[0] : null
}

export function hasAmbiguousCategorySlug(categories, slug) {
  return flattenCategories(categories).filter((category) => categorySlug(category) === slug).length > 1
}

export function categoryRoute(category, parentPath = [], categories = []) {
  const slug = categorySlug(category)
  const isLaptops = slug === 'portatiles' && slugifyCategory(categoryName(category)) === 'portatiles'
  const segments = isLaptops ? [slug] : [...parentPath, slug]
  const path = `/categorias/${segments.filter(Boolean).join('/')}`
  const isSingleSlugAmbiguous = segments.length === 1 && hasAmbiguousCategorySlug(categories, slug)
  return isSingleSlugAmbiguous && category?.pathCat
    ? `${path}?pathCat=${encodeURIComponent(category.pathCat)}`
    : path
}

function buildCategoryTree(categories) {
  // The API normally returns a tree. Also accept the raw MongoDB documents
  // (`nombre`, `pathCat`, `icon`) so pathCat remains the hierarchy source.
  const alreadyNested = categories.some((category) => categoryChildren(category).length > 0)
  if (alreadyNested) return categories

  const byPath = new Map()
  for (const category of categories) {
    const path = String(category?.pathCat ?? '').trim()
    if (path) byPath.set(path, { ...category, hijos: [] })
  }
  if (!byPath.size) return categories

  const roots = []
  for (const [path, category] of byPath) {
    const parentPath = path.split('-').slice(0, -1).join('-')
    const parent = byPath.get(parentPath)
    if (parent && parent !== category) parent.hijos.push(category)
    else roots.push(category)
  }
  return roots
}

export async function getCategories({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/Categorias`, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar las categorías (${response.status})`)
  const payload = await response.json()
  const categories = payload.categorias ?? payload.categories ?? payload.data ?? payload
  if (!Array.isArray(categories)) throw new Error('La respuesta de categorías no tiene un formato válido')
  return buildCategoryTree(categories)
}

export async function getProductsByCategory(categoryPath, { signal, descendants = false } = {}) {
  const query = new URLSearchParams({ categoria: categoryPath })
  if (descendants) query.set('descendientes', 'true')
  const response = await fetch(`${API_BASE_URL}/Productos?${query}`, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar los productos (${response.status})`)
  const payload = await response.json()
  const products = payload.productos ?? payload.products ?? payload.data ?? payload
  if (!Array.isArray(products)) throw new Error('La respuesta de productos no tiene un formato válido')
  return { products }
}
