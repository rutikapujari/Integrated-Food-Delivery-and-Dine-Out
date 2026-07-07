import { useState } from "react";
import RatingStars from "./RatingStars";

function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Thanks for your ${rating}-star review!`);
    setComment("");
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h2>Leave a Review</h2>
      <label style={{ display: "block", marginBottom: "8px" }}>Your rating</label>
      <RatingStars value={rating} onChange={setRating} />

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows="4"
        placeholder="Tell us about your experience"
        style={{ width: "100%", maxWidth: "420px", display: "block", marginBottom: "10px" }}
      />

      <button type="submit">Submit Review</button>
    </form>
  );
}

export default ReviewForm;
