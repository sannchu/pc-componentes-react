import './OffCanvas.css'
import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router'

function OffCanvasCats(){
    
    const [categorias, setCategorias] = useState("")
    useEffect(()=>{ //<------------------------------------ este hook se ejecuta una sola vez cuando se monta el componente, es decir cuando se carga por primera vez en la pagina
        //invocar a servicio para cargar categorias principales
        console.log('en teoria se invocaria a servicio para cargar categorias principales')
    }, [])
    
    const navigate = useNavigate()
    

    return (
        <div className="mt-5 mb-4">
            <button className="btn btn-outline-secondary" 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#offcanvasWithBothOptions" 
                    aria-controls="offcanvasWithBothOptions">
                        <i className="fa-solid fa-bars"></i> Todas las categorias
            </button>

            <div className="offcanvas offcanvas-start" 
                 data-bs-scroll="true" 
                 tabIndex="-1" 
                 id="offcanvasWithBothOptions" 
                 aria-labelledby="offcanvasWithBothOptionsLabel">

                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">Campañas y ofertas</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <hr></hr>

                    <div className="offcanvas-body">
                        <h3><strong>Categorias</strong></h3>
                        <p>....cargar categorias principales invocando a servicio....</p>
                        <div className="list-group">
                            <button type="button" className="list-group-item list-group-item-action" onClick={() => { navigate('/Productos/Categoria?nombreCat=Componentes'); setCategorias("Componentes") }}>Componentes</button>
                            <button type="button" className="list-group-item list-group-item-action" onClick={() => { navigate('/Productos/Categoria?nombreCat=Ordenadores'); setCategorias("Ordenadores") }}>Ordenadores</button>
                            <button type="button" className="list-group-item list-group-item-action" onClick={() => { navigate('/Productos/Categoria?nombreCat=Perifericos'); setCategorias("Perifericos") }}>Perifericos</button>
                            <button type="button" className="list-group-item list-group-item-action" onClick={() => { navigate('/Productos/Categoria?nombreCat=Consolas'); setCategorias("Consolas") }}>Consolas</button>
                        
                        </div>                        
                    </div>
            </div>        
        </div>
    )

}

export default OffCanvasCats 
