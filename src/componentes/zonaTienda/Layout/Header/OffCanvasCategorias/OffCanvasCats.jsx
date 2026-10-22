import './OffCanvas.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { categoryChildren, categoryName, categorySlug, getCategories, slugifyCategory } from '../../../../../servicios/catalogo.js'

function routeForCategory(category, parentPath = []) {
  const slug = categorySlug(category)
  // The laptop category is specifically exposed at /categorias/portatiles.
  const isLaptops = slug === 'portatiles' && slugifyCategory(categoryName(category)) === 'portatiles'
  const segments = isLaptops ? [slug] : [...parentPath, slug]
  return `/categorias/${segments.filter(Boolean).join('/')}`
}

function CategoryIcon({ category }) {
  const icon = typeof category?.icon === 'string' ? category.icon.trim() : ''
  if (icon) return <img className="category-icon" src={icon} alt="" aria-hidden="true" />
  const name = slugifyCategory(categoryName(category))
  const fallback = name === 'ordenadores' ? '▣' : name === 'componentes' ? '▦' : '◈'
  return <span className="category-icon category-icon-fallback" aria-hidden="true">{fallback}</span>
}

function OffCanvasCats() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [reload, setReload] = useState(0)
  const [selectedRoot, setSelectedRoot] = useState(null)
  const [expanded, setExpanded] = useState({})
  const triggerRef = useRef(null)
  const drawerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    getCategories({ signal: controller.signal })
      .then((data) => { setCategories(data); setStatus(data.length ? 'ready' : 'empty') })
      .catch((error) => { if (error.name !== 'AbortError') setStatus('error') })
    return () => controller.abort()
  }, [open, reload])

  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return undefined
    const trigger = triggerRef.current
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close()
      if (event.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll('button:not(:disabled), a[href]')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    drawerRef.current?.querySelector('button')?.focus()
    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('category-drawer-open')
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('category-drawer-open')
      trigger?.focus()
    }
  }, [open, close])

  const goToCategory = (category, parentPath = [], descendants = false) => {
    const route = routeForCategory(category, parentPath)
    navigate(`${route}${descendants ? '?descendientes=true' : ''}`)
    close()
  }

  const toggleExpanded = (key) => setExpanded((current) => ({ ...current, [key]: !current[key] }))

  const renderChildren = (items, parentPath = [], level = 1) => (
    <ul className={`category-list category-list-level-${level}`}>
      {items.map((item) => {
        const children = categoryChildren(item)
        const slug = categorySlug(item)
        const itemPath = [...parentPath, slug]
        const key = itemPath.join('/')
        const isExpanded = Boolean(expanded[key])
        return (
          <li key={item._id ?? item.pathCat ?? key} className="category-item">
            {children.length > 0 ? <>
              <div className={`category-accordion-heading${isExpanded ? ' is-expanded' : ''}`}>
                <button className="category-accordion-toggle" type="button" aria-expanded={isExpanded} aria-controls={`category-children-${key.replaceAll('/', '-')}`} onClick={() => toggleExpanded(key)}>
                  <span>{categoryName(item)}</span><span className="category-chevron" aria-hidden="true">{isExpanded ? '⌃' : '⌄'}</span>
                </button>
              </div>
              <div id={`category-children-${key.replaceAll('/', '-')}`} className="category-accordion-content" hidden={!isExpanded}>
                <button className="category-all-link" type="button" onClick={() => goToCategory(item, parentPath, true)}>Todo en {categoryName(item)}</button>
                {renderChildren(children, itemPath, level + 1)}
              </div>
            </> : <button className="category-link" type="button" onClick={() => goToCategory(item, parentPath)}>{categoryName(item)}</button>}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="category-menu">
      <button ref={triggerRef} className="category-trigger" type="button" aria-expanded={open} aria-controls="category-drawer" onClick={() => { setStatus('loading'); setSelectedRoot(null); setExpanded({}); setOpen(true) }}>
        <span aria-hidden="true">☰</span> Todas las categorías
      </button>
      {open && <button className="category-backdrop" type="button" aria-label="Cerrar categorías" onClick={close} />}
      <aside ref={drawerRef} id="category-drawer" className={`category-drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="category-drawer-title" aria-hidden={!open}>
        <header className="category-drawer-header">
          <h2 id="category-drawer-title" className="visually-hidden">Categorías</h2>
          {selectedRoot && <button type="button" className="category-back" onClick={() => setSelectedRoot(null)}>← Categorías</button>}
          <button type="button" className="category-close" aria-label="Cerrar categorías" onClick={close}>×</button>
        </header>
        <div className="category-drawer-body">
          <section className={`category-roots${selectedRoot ? ' has-selection' : ''}`} aria-label="Categorías principales">
            <h2>Categorías</h2>
            {status === 'loading' && <p role="status">Cargando categorías…</p>}
            {status === 'error' && <div role="alert"><p>No se pudieron cargar las categorías.</p><button type="button" onClick={() => { setStatus('loading'); setReload((current) => current + 1) }}>Reintentar</button></div>}
            {status === 'empty' && <p>No hay categorías disponibles.</p>}
            {status === 'ready' && <ul className="category-list">
              {categories.map((category) => {
                const children = categoryChildren(category)
                const selected = selectedRoot?.pathCat ? selectedRoot.pathCat === category.pathCat : selectedRoot === category
                return <li key={category._id ?? category.pathCat ?? categorySlug(category)} className="category-item">
                  {children.length ? <button type="button" className={`category-root${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => { setSelectedRoot(category); setExpanded({}) }}><CategoryIcon category={category} /><span className="category-root-label">{categoryName(category)}</span><span className="category-chevron" aria-hidden="true">›</span></button> : <button type="button" className="category-root" onClick={() => goToCategory(category)}><CategoryIcon category={category} /><span className="category-root-label">{categoryName(category)}</span><span className="category-chevron" aria-hidden="true">›</span></button>}
                </li>
              })}
            </ul>}
          </section>
          <section className={`category-subcategories${selectedRoot ? ' has-selection' : ''}`} aria-label={selectedRoot ? `Subcategorías de ${categoryName(selectedRoot)}` : 'Subcategorías'}>
            {selectedRoot ? <>
              <h3>{categoryName(selectedRoot)}</h3>
              <button className="category-all-link category-root-all" type="button" onClick={() => goToCategory(selectedRoot, [], true)}>Todo en {categoryName(selectedRoot)}</button>
              {categoryChildren(selectedRoot).length ? renderChildren(categoryChildren(selectedRoot), [categorySlug(selectedRoot)]) : <p>Esta categoría no tiene subcategorías.</p>}
            </> : <p className="category-selection-hint">Selecciona una categoría para ver sus subcategorías.</p>}
          </section>
        </div>
      </aside>
    </div>
  )
}

export default OffCanvasCats
