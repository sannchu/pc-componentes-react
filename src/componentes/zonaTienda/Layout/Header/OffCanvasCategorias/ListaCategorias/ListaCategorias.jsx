import './ListaCategorias.css';
import useCategorias from '../../../../../../customHooks/Categorias.Hook.js';

function ListaCategorias({ pathCat='principales', onCategoriaSeleccionada, categoriaActiva }) {
    const { categorias } = useCategorias(pathCat);

    return (
        <ul className="list-group list-group-flush">
            {categorias.map((categoria) => (
                <li key={categoria._id} 
                    className={`list-group-item ${categoriaActiva && categoriaActiva._id === categoria._id ? 'active' : ''}`}
                    onClick={() => onCategoriaSeleccionada(categoria)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <div>
                            {categoria.icon && <img src={categoria.icon} 
                                                    alt={categoria.nombre} 
                                                    className="me-2" 
                                                    style={{ width: '20px', height: '20px' }} />}
                            {categoria.nombre}
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>

                </li>
            ))}
        </ul>
    );
}

export default ListaCategorias;
