import './OffCanvas.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { categoryChildren, categoryName, categorySlug, getCategories } from '../../../../../servicios/catalogo.js'

function OffCanvasCats() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [selectedRoot, setSelectedRoot] = useState(null)
  const [expanded, setExpanded] = useState({})
  const triggerRef = useRef(null)
  const drawerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()
    getCategories({ signal: controller.signal })
      .then((data) => { setCategories(data); setStatus(data.length ? 'ready' : 'empty') })
      .catch((error) => { if (error.name !== 'AbortError') setStatus('error') })
    return () => controller.abort()
  }, [])

  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return undefined
    const trigger = triggerRef.current
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close()
      if (event.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll('button:not(:disabled)')
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

  const goToCategory = (category, parentPath = []) => {
    const path = [...parentPath, categorySlug(category)].filter(Boolean).join('/')
    if (!path) return
    navigate(`/productos/${path}`)
    close()
  }

  const renderChildren = (items, parentPath, level = 1) => (
    <ul className={`category-list category-list-level-${level}`}>
      {items.map((item) => {
        const children = categoryChildren(item)
        const slug = categorySlug(item)
        const path = [...parentPath, slug]
        const isExpanded = Boolean(expanded[path.join('/')])
        return (
          <li key={item._id ?? path.join('/') } className="category-item">
            <div className="category-item-row">
              <button className="category-link" type="button" onClick={() => goToCategory(item, parentPath)}>
                {categoryName(item)}
              </button>
              {children.length > 0 && <button className="category-expand" type="button" aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${categoryName(item)}`} aria-expanded={isExpanded} onClick={() => setExpanded((current) => ({ ...current, [path.join('/')]: !current[path.join('/')] }))}>{isExpanded ? '−' : '+'}</button>}
            </div>
            {children.length > 0 && isExpanded && renderChildren(children, path, level + 1)}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="category-menu">
      <button ref={triggerRef} className="category-trigger" type="button" aria-expanded={open} aria-controls="category-drawer" onClick={() => setOpen(true)}>
        <span aria-hidden="true">☰</span> Todas las categorías
      </button>
      {open && <button className="category-backdrop" type="button" aria-label="Cerrar categorías" onClick={close} />}
      <aside ref={drawerRef} id="category-drawer" className={`category-drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="category-drawer-title" aria-hidden={!open}>
        <header className="category-drawer-header">
          {selectedRoot && <button type="button" className="category-back" onClick={() => setSelectedRoot(null)}>← Categorías</button>}
          <h2 id="category-drawer-title">Categorías</h2>
          <button type="button" className="category-close" aria-label="Cerrar categorías" onClick={close}>×</button>
        </header>
        <div className="category-drawer-body">
          <div className={`category-roots${selectedRoot ? ' has-selection' : ''}`} aria-label="Categorías principales">
            {status === 'loading' && <p role="status">Cargando categorías…</p>}
            {status === 'error' && <div role="alert"><p>No se pudieron cargar las categorías.</p><button type="button" onClick={() => { setStatus('loading'); getCategories().then((data) => { setCategories(data); setStatus(data.length ? 'ready' : 'empty') }).catch(() => setStatus('error')) }}>Reintentar</button></div>}
            {status === 'empty' && <p>No hay categorías disponibles.</p>}
            {status === 'ready' && <ul className="category-list">
              {categories.map((category) => {
                const children = categoryChildren(category)
                return <li key={category._id ?? categorySlug(category)} className="category-item">
                  {children.length ? <button type="button" className={`category-root${selectedRoot === category ? ' is-selected' : ''}`} aria-pressed={selectedRoot === category} onClick={() => setSelectedRoot(category)}>{categoryName(category)} <span aria-hidden="true">›</span></button> : <button type="button" className="category-link" onClick={() => goToCategory(category)}>{categoryName(category)}</button>}
                </li>
              })}
            </ul>}
          </div>
          <section className={`category-subcategories${selectedRoot ? ' has-selection' : ''}`} aria-label={selectedRoot ? `Subcategorías de ${categoryName(selectedRoot)}` : 'Subcategorías'}>
            {selectedRoot ? <>
              <h3>{categoryName(selectedRoot)}</h3>
              {categoryChildren(selectedRoot).length ? renderChildren(categoryChildren(selectedRoot), [categorySlug(selectedRoot)]) : <p>Esta categoría no tiene subcategorías.</p>}
            </> : <p className="category-selection-hint">Selecciona una categoría para ver sus subcategorías.</p>}
          </section>
        </div>
      </aside>
    </div>
  )
}

export default OffCanvasCats
