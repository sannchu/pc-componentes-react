import './LoginRegistro.css';
import { useState } from 'react'

function LoginRegistro(){

    const [ enLogin, setEnLogin ] = useState(false); // valor inicial es false, es decir, estamos en modo registro
    
    const [ formData, setFormData ] = useState(
        {
            Nombre:'',
            Email:'',
            Password:'',
            Repassword:''
        }
    )

    // const [ nombreUsuario, setNombreUsuario ] = useState(''); // valor inicial del nombre de usuario es cadena vacia
    // const [ email, setEmail ] = useState(''); // valor inicial del email es cadena vacia
    // const [ password, setPassword ] = useState(''); // valor inicial del password es cadena vacia
    // const [ repassword, setRepassword ] = useState(''); // valor inicial del repassword es cadena vacia

    const camposFormulario = [
      { label: "Nombre", type:"text", apareceEnLogin: false }, 
      { label:"Email", type:"email", apareceEnLogin: true }, 
      { label:"Password", type:"password", apareceEnLogin: true }, 
      { label:"Repassword", type:"password", apareceEnLogin: false }
    ];


 function changeInputs(ev){
    console.log('evento change del input: ',ev);
    console.log( '...el valor actual de la caja de texto es....', ev.target.value);
    console.log('el id del input es: ', ev.target.id);

    //Solo tengo la funcion modificadora setFormData para cambiar el objeto del state ¿como la uso
    //para cambiar el valor de la propiedad del objeto que corresponde al input que ha cambiado?

    setFormData(
        { ...formData, [ev.target.id]: ev.target.value }
   );

   console.log('el objeto formData actualizado es: ', formData);

    // switch (ev.target.id) {
    //   case 'inputNombre': setNombreUsuario(ev.target.value);break;
    //   case 'inputEmail': setEmail(ev.target.value);break;
    //   case 'inputPassword': setPassword(ev.target.value);break;
    //   case 'inputRepassword': setRepassword(ev.target.value);break;
    // }

  }

  function clickCrearCuenta(){
    //console.log('datos a mandar al server....', { nombreUsuario, email, password, repassword });
    console.log('datos a mandar al server....', formData );
  }

    return <div className="container">
        
        <div className="row">
            <div className="col-12 d-flex flex-row align-items-center justify-content-center">
                <img  src="/imagenes/logo_pccomponentes.png" alt="logo" className="logo"/>
            </div>
        </div>

        <div className="row">
            
            <div className="col-6">
                <img src="/imagenes/loginRegistro_info.png" alt="loginRegistro_info" style={ { width: "500px", height: "500px"} }/>
            </div>
            
            <div className="col-6">
                {/* Formulario de Login o Registro en funcion de url o accion evento boton crearCuenta/iniciar Sesion */}
                <div className="container">
                    
                    <div className="row"><div className="col"><h4><strong>{ enLogin ? "Iniciar sesión" : "Crear cuenta" }</strong></h4></div></div>
                    <div className="row m-3"><div className="col d-grid gap-1"><button type="button" id="btnlogingmail"  className="btn btn-light btn-sm" ><img  src="/imagenes/boton_login_GMAIL.png"/></button></div></div>
                    <div className="row"><div className="col m-4"><h6><span> O bien </span></h6></div></div>

                    <div className="row">
                        <div className="col-12">
                        {
                            camposFormulario.filter( campo => enLogin ? campo.apareceEnLogin : true )
                                            .map( campo => (
                                                            <div className="form-floating m-4" key={campo.label}>
                                                                <input type={campo.type} 
                                                                        id={`${campo.label}`} 
                                                                        className="form-control" 
                                                                        placeholder={campo.label + "*"} 
                                                                        onChange={ changeInputs }/>
                                                                <label className="form-label" htmlFor={`input${campo.label}`}>{campo.label}:</label>
                                                            </div>
                                                        )
                            )
                        }
                        {       
                            ! enLogin &&
                            <>                           
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
                                    <label className="form-check-label" for="flexCheckDefault">
                                        He leido y acepto la <a href="">politica de privacidad</a>
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked"/>
                                    <label className="form-check-label" for="flexCheckChecked">
                                        Recibir <strong>descuentos exclusivos</strong>, novedades y tendencias por e-mail. Me puedo dar de baja desde mi panel.
                                    </label>
                                </div>                                
                            </>
                        }
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 d-grid gap-1 mt-4 mb-4">
                            <button type="button" className="btn  pccomponentes-primary" onClick={ clickCrearCuenta }>
                            {
                                enLogin ?
                                <span>Iniciar sesion</span> 
                                :
                                <span>Crear cuenta</span>
                            }
                            </button>
                        </div>
                    </div>

                    <hr></hr>
                        <div className="row">
                            <div className="col m-4">
                                <h6><span> { enLogin ? '¿Eres nuevo cliente?':'Ya tengo una cuenta'} </span></h6>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col d-grid gap-1">
                                <button type="button"  className="btn btn-outline-secondary" onClick={() => setEnLogin(!enLogin)}>
                                    <span> { enLogin ? 'Crear cuenta' : 'Iniciar Sesion' }</span>
                                </button>
                            </div>
                        </div>



                </div>
            </div>
        </div>



    </div>

}

export default LoginRegistro;