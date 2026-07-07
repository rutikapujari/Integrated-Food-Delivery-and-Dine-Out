function RatingStars({ value = 5, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          style={{
            background: "transparent",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            fontSize: "1.25rem",
            padding: 0,
          }}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default RatingStars;
