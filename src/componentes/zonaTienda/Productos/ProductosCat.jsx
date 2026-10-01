import './ProductosCat.css'
import { useSearchParams } from 'react-router'

function ProductosCat(){

    const [searchParams] = useSearchParams()
    const nombreCat = searchParams.get('nombreCat')


    return (
        <div className="d-flex flex-column justify-content-center align-items-center ProductosCat">
            {/* <h3>Pagina de Productos por Categorias se carga dentro del layout cuando en url aparece "/Productos/...."</h3> */}
            <h3>Estas en la Categoria: <strong>{nombreCat}</strong></h3>
            <p> Lista de productos de: <strong>{nombreCat}</strong></p> 
        </div>
    )
}

export default ProductosCat 

