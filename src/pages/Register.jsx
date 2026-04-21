import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        setError(null);
        setMessage(null);  // Limpiamos el mensaje de éxito anterior
        setLoading(true);

        if(password !== confirmPassword){
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }



        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        setLoading(false);

        if(error){
            setError(error.message);
        } else {
            setMessage('Cuenta creada exitosamente. Verifica tu correo electrónico para confirmar.');
            
        }
        
    } 
    
    return (
        <div>
            <h1>Registrarse</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}


            <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', width: '300px', gap: '10px'}}>

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
                <input
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
            </form>
        </div>
    )
}