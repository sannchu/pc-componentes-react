const API_BASE_URL = 'http://localhost:3000/api/Tienda'

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

export async function getCategories({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/Categorias`, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar las categorías (${response.status})`)
  const payload = await response.json()
  const categories = payload.categorias ?? payload.categories ?? payload.data ?? payload
  if (!Array.isArray(categories)) throw new Error('La respuesta de categorías no tiene un formato válido')
  return categories
}

export async function getProductsByCategory(categoryPath, { page = 1, limit = 24, signal } = {}) {
  const query = new URLSearchParams({ categoria: categoryPath, pagina: String(page), limite: String(limit) })
  const response = await fetch(`${API_BASE_URL}/Productos?${query}`, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar los productos (${response.status})`)
  const payload = await response.json()
  const products = payload.productos ?? payload.products ?? payload.data ?? payload
  if (!Array.isArray(products)) throw new Error('La respuesta de productos no tiene un formato válido')
  return { products, pagination: payload.paginacion ?? payload.pagination ?? null }
}
