import './ProductosCat.css'
//import { useParams } from 'react-router' //<---- hook de react-router para interceptar segmentos variables en url
import { useSearchParams } from 'react-router' //<---- hook de react-router para interceptar valores variables por query string en url

function ProductosCat(){

    //---- hook para interceptar segmentos variables en URL -----------------
    // const valorDevueltoPorHookUseParams=useParams() //<--- el hook useParams() de react-router nos permite acceder a los parametros de la url
    // console.log('valorDevueltoPorHookUseParams: ', valorDevueltoPorHookUseParams) //<--- el hook useParams() de react-router nos permite acceder a los parametros de la url
    //const { nombreCat } = useParams();

    //---- hook para interceptar valores variables por query string en URL -----------------
    // const valorDevueltoPorHookUseSearchParams=useSearchParams() //<--- el hook useSearchParams() de react-router nos permite acceder a los parametros de la url
    // console.log('valorDevueltoPorHookUseSearchParams: ', valorDevueltoPorHookUseSearchParams) //<--- el hook useSearchParams() de react-router nos permite acceder a los parametros de la url
    const [searchParams, setSearchParams] = useSearchParams() //<--- el hook useSearchParams() de react-router nos permite acceder a los parametros de la url    
    // console.log('valor de 1º posicion array devuelve hook: ', searchParams);
    // console.log('valor de 2º posicion array devuelve hook: ', setSearchParams);


    return (
        <div className="d-flex flex-column justify-content-center align-items-center ">
            {/* <h3>Pagina de Productos por Categorias se carga dentro del layout cuando en url aparece "/Productos/...."</h3> */}
            <h3>Estas en la Categoria: <strong>{searchParams.get('nombreCat')}</strong></h3>
            <p> Lista de productos de: <strong>{searchParams.get('nombreCat')}</strong></p> 
        </div>
    )
}

export default ProductosCat