const reviews = [
  {
    id: 1,
    name: "Asha",
    rating: 5,
    comment: "Fast delivery and great food quality!",
  },
  {
    id: 2,
    name: "Rohan",
    rating: 4,
    comment: "The burgers were fresh and the packaging was neat.",
  },
];

function ReviewList() {
  return (
    <div>
      <h2>Recent Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "10px" }}>
          <strong>{review.name}</strong>
          <p>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
