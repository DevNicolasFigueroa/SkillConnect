import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Si hay una sesión, guardamos el usuario. Si no, quedará en null.
      setUser(session?.user ?? null);
      // Ya terminamos de buscar, quitamos el estado de carga
      setLoading(false);
    });

    // Esto se ejecutará cada vez que cambie el estado de la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => {
      subscription.unsubscribe();
    };
  }, []);


    const value = {
        user,
        loading,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )

}

export function useAuth(){
    return useContext(AuthContext)
}