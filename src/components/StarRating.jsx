import React, { useState } from "react";

/**
 * Componente StarRating
 * @param {number} rating - Valor actual (1-5)
 * @param {function} onRatingChange - Función opcional para manejar el cambio (si es editable)
 * @param {boolean} editable - Si permite que el usuario haga clic para cambiar
 * @param {number} size - Tamaño de las estrellas en rem
 */
export function StarRating({ rating = 0, onRatingChange, editable = false, size = 1 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating" style={{ display: "flex", gap: "4px" }}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hover || rating);

        return (
          <span
            key={index}
            className={`star ${isActive ? "active" : ""} ${editable ? "editable" : ""}`}
            style={{
              fontSize: `${size}rem`,
              cursor: editable ? "pointer" : "default",
              color: isActive ? "#FFB800" : "var(--text-muted)",
              transition: "transform 0.2s, color 0.2s",
              transform: hover === starValue ? "scale(1.2)" : "scale(1)",
            }}
            onClick={() => editable && onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => editable && setHover(starValue)}
            onMouseLeave={() => editable && setHover(0)}
          >
            {isActive ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}
