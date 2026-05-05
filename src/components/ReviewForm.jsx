import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "./StarRating";
import { useToast } from "../context/ToastContext";

export function ReviewForm({ serviceId, professionalId, onReviewSubmit }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Por favor, selecciona una calificación.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          service_id: serviceId,
          professional_id: professionalId,
          reviewer_id: user.id,
          rating,
          comment,
        },
      ]);

      if (error) throw error;

      setRating(0);
      setComment("");
      if (onReviewSubmit) onReviewSubmit();
      showToast("¡Gracias por tu reseña!", "success");
    } catch (err) {
      showToast("Error al enviar reseña: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p className="text-muted">Inicia sesión para dejar una reseña.</p>;

  return (
    <div className="card-static" style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Deja tu opinión</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Calificación</label>
          <StarRating 
            rating={rating} 
            editable={true} 
            size={1.5} 
            onRatingChange={(val) => setRating(val)} 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Tu comentario</label>
          <textarea
            className="form-textarea"
            placeholder="¿Qué tal fue tu experiencia con este servicio?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={submitting}
          style={{ marginTop: "1rem" }}
        >
          {submitting ? "Enviando..." : "Enviar reseña ✓"}
        </button>
      </form>
    </div>
  );
}
