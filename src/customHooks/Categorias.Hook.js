import { useEffect, useState } from 'react'

const API_CATEGORIAS = 'http://localhost:3000/api/Tienda/Categorias'

export default function useCategorias(pathCat = 'principales') {
    const [categorias, setCategorias] = useState([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!pathCat) return

        const controller = new AbortController()

        async function fetchCategorias() {
            setCargando(true)
            setError(null)

            try {
                const response = await fetch(
                    `${API_CATEGORIAS}?pathCat=${encodeURIComponent(pathCat)}`,
                    { signal: controller.signal }
                )
                const { codigo, mensaje, datos } = await response.json()

                if (!response.ok || codigo !== 0) {
                    throw new Error(mensaje || 'No se pudieron recuperar las categorias')
                }

                setCategorias(datos?.categorias ?? [])
            } catch (errorCarga) {
                if (errorCarga.name !== 'AbortError') {
                    console.error(`Error al recuperar categorias: ${errorCarga}`)
                    setError(errorCarga.message)
                    setCategorias([])
                }
            } finally {
                if (!controller.signal.aborted) setCargando(false)
            }
        }

        fetchCategorias()
        return () => controller.abort()
    }, [pathCat])

    return {
        categorias: pathCat ? categorias : [],
        cargando: Boolean(pathCat) && cargando,
        error: pathCat ? error : null
    }
}
