import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { StarRating } from "./StarRating";

export function ReviewsList({ serviceId, professionalId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [serviceId, professionalId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          service_id,
          reviewer:reviewer_id (
            full_name,
            avatar_url
          ),
          service:service_id (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (serviceId) query = query.eq("service_id", serviceId);
      if (professionalId) query = query.eq("professional_id", professionalId);

      const { data, error } = await query;

      setReviews(data || []);
    } catch (err) {
      console.error("Error al cargar reseñas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando reseñas...</p>;

  if (reviews.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
        <p>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
      {reviews.map((review) => (
        <div key={review.id} className="review-item" style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {review.reviewer?.avatar_url ? (
                <img 
                  src={review.reviewer.avatar_url} 
                  alt="Avatar" 
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} 
                />
              ) : (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white", fontWeight: "bold" }}>
                  {review.reviewer?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <span style={{ display: "block", fontSize: "0.9rem", fontWeight: "600" }}>
                  {review.reviewer?.full_name || "Usuario Anónimo"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                {review.service?.title && (
                  <span 
                    style={{ 
                      fontSize: "0.65rem", 
                      color: "var(--primary)", 
                      marginLeft: "8px",
                      cursor: "pointer",
                      padding: "2px 8px",
                      background: "rgba(0, 112, 243, 0.1)",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 112, 243, 0.2)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 112, 243, 0.2)";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 112, 243, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                    onClick={() => window.location.href = `/service/${review.service_id}`}
                  >
                    🏷️ {review.service.title}
                  </span>
                )}
              </div>
            </div>
            <StarRating rating={review.rating} size={0.8} />
          </div>
          <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
