import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

function LoginGoogleCallback(){
    const navigate = useNavigate();
    const [ error, setError ] = useState('');

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const token = query.get('token') || hash.get('token');
        const mensajeError = query.get('error_description')
            || query.get('error')
            || query.get('mensaje')
            || hash.get('error');

        if (token) {
            // El backend debe devolver el JWT de sesión al frontend después de validar Google.
            localStorage.setItem('token', token);

            const email = query.get('email') || hash.get('email');
            const nombre = query.get('nombre') || hash.get('nombre');
            if (email) localStorage.setItem('email', email);
            if (nombre) localStorage.setItem('nombre', nombre);

            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                    { tipo: 'LOGIN_GOOGLE_OK', token, email, nombre },
                    window.location.origin
                );
                window.close();
                return;
            }

            navigate('/', { replace: true });
            return;
        }

        const mensajeFinal = mensajeError || 'El servidor no devolvió el token de sesión de Google.';
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
                { tipo: 'LOGIN_GOOGLE_ERROR', mensaje: mensajeFinal },
                window.location.origin
            );
            window.close();
            return;
        }

        setError(mensajeFinal);
    }, [navigate]);

    return (
        <main className="container py-5 text-center">
            {error
                ? <>
                    <h2>No se pudo iniciar sesión con Google</h2>
                    <p role="alert">{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/Cliente/LoginRegistro')}>
                        Volver al inicio de sesión
                    </button>
                </>
                : <p role="status">Comprobando la sesión de Google…</p>
            }
        </main>
    );
}

export default LoginGoogleCallback;
