import './SessionButton.css';

function SessionButton( { saltarAUrl, email, icono } ) {

    return (
        <button className="btn btn-light btn-sm" 
                onClick={ ()=> saltarAUrl('/Cliente/LoginRegistro')} 
                >
            {/* mostrar icono y el email del usuario si no son NULL (sesion iniciada) sino mostrar "Mi Cuenta" */}
            <i className="fa-regular fa-user"></i> Mi Cuenta
        </button>        
    )
}

export default SessionButton;