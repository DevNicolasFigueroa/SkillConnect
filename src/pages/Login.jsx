import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";


export function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

       


        const { error } = await supabase.auth.signInWithPassword( {
            email,
            password,
        }) 

        setLoading(false);

        if( error ) {
            setError(error.message);
        } else {
            navigate('/');
        }
    }


    return (
        <div>
            <h1>Iniciar sesión</h1>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form  onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', width: '300px', gap: '10px'}}>

                <input type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input type='password'
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    )
}