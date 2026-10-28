import { useState, useEffect } from 'react';

const API_PRODUCTOS = 'http://localhost:3000/api/Tienda/Productos'

export default function useProductosPorCategoria(pathCat) {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pathCat) return;

        const controller = new AbortController();

        async function fetchProductos() {
            setCargando(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_PRODUCTOS}?pathCat=${encodeURIComponent(pathCat)}`,
                    { signal: controller.signal }
                );
                const respuesta = await response.json();

                if (!response.ok || respuesta.codigo !== 0) {
                    throw new Error(respuesta.mensaje || 'No se pudieron obtener los productos');
                }

                setProductos(respuesta.datos?.productos ?? []);
            } catch (errorCarga) {
                if (errorCarga.name !== 'AbortError') {
                    console.error('Error al obtener los productos:', errorCarga);
                    setError(errorCarga.message);
                    setProductos([]);
                }
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        }

        fetchProductos();
        return () => controller.abort();
    }, [pathCat]);

   return {
       productos: pathCat ? productos : [],
       cargando: Boolean(pathCat) && cargando,
       error: pathCat ? error : null
   };
}
