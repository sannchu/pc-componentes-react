import './OffCanvas.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

function OffCanvasCats(){

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
    /*
         hook useEffect() es una funcion js que adminte como parametros:
            - 1º parametro: una funcion q se va a ejecutar siempre y cuando  se cambia el valor de alguna de las variables que se
             definen como dependencia del efecto
            - 2º parametro: un array de variables q al modificar su valor por cualquier motivo (evento, cambio del estado, ...)
                provocara que se ejecute la funcion definida en el 1º parametro
                
                OJO!!!!! si el array esta vacio, la funcion del 1º parametro se ejecutara una sola vez 
                al montar el componente y nunca mas
    */
    useEffect(
        ()=>{
            console.log('en teoria este efecto se ejecuta una sola vez al montar el componente OffCanvasCats');
            console.log(`pq el ARRAY DE DEPENDENCIAS ESTA VACIO [] y no hay variables q
                         al cambiar su valor provoquen la ejecucion del efecto`);
        }, 
        []
    )

    useEffect(
        ()=>{
            window.alert('has seleccionado la categoria: ' + categoriaSeleccionada);
            console.log('efecto lanzado por haber clickeado en boton categoria y cambiar variable del state categoriaSeleccionada');
        }, [ categoriaSeleccionada ]
    )

    const navigate = useNavigate()

    return (
        <div className="mt-5 mb-4">
            <button className="btn btn-otuline-secondary" 
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
                        {
                            /*
                                ... pasando categoria por segmento variable en url: /Productos/Categoria/:nombreCat
                                <div class="list-group">
                                    <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> navigate('/Productos/Categoria/Componentes') }>Componentes</button>
                                    <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> navigate('/Productos/Categoria/Ordenadores') }>Ordenadores</button>
                                    <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> navigate('/Productos/Categoria/Perifericos') }>Perifericos</button>
                                    <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> navigate('/Productos/Categoria/Consolas') }>Consolas</button>
                                </div>                        

                            */
                        }
                        { /* ... pasando categoria por query string en url: /Productos/Categoria?nombreCat=... */ }
                        <div class="list-group">
                            <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> { navigate('/Productos/Categoria?nombreCat=Componentes');  setCategoriaSeleccionada('Componentes'); }} >Componentes</button>
                            <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> { navigate('/Productos/Categoria?nombreCat=Ordenadores') ; setCategoriaSeleccionada('Ordenadores'); } }>Ordenadores</button>
                            <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> { navigate('/Productos/Categoria?nombreCat=Perifericos') ; setCategoriaSeleccionada('Perifericos'); } }>Perifericos</button>
                            <button type="button" class="list-group-item list-group-item-action" onClick={ ()=> { navigate('/Productos/Categoria?nombreCat=Consolas');     setCategoriaSeleccionada('Consolas'); } }>Consolas</button>
                        </div>                        
                    </div>
            </div>        
        </div>
    )

}

export default OffCanvasCats