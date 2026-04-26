import { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function CreateService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("services") // Nombre de la tabla que creaste
      .insert([
        {
          title,
          description,
          price: parseFloat(price), // Convertimos el texto a número
          user_id: user.id, // El ID del usuario actual
        },
      ]);
    setLoading(false);
    if (error) {
      alert("Error al publicar: " + error.message);
    } else {
      navigate("/dashboard"); // Volvemos al perfil
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1>Publicar nuevo servicio</h1>
      <form
        onSubmit={handleCreate}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="¿Qué servicio ofreces?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Cuéntanos más sobre lo que haces..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ minHeight: "100px" }}
          required
        />
        <input
          type="number"
          placeholder="Precio estimado (ej: 25.00)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar servicio"}
        </button>
      </form>
    </div>
  );
}
