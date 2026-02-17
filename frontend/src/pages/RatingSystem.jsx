import React from 'react';

const StarRating = ({ value = 0, size = 40 }) => {
  const stars = [1, 2, 3, 4, 5].map(i => {
    const cls = value >= i ? 'full' : (value >= i - 0.5 ? 'half' : 'empty');
    return (
      <span
        key={i}
        className={`star ${cls}`}
        style={{ fontSize: `${size}px` }}
      >
        ★
      </span>
    );
  });
  return <span className="star-rating">{stars}</span>;
};

const RatingSystem = () => {
  return (
    <div className="main-container">
      <div className="card" style={{ maxWidth: 420, margin: '2rem auto', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <StarRating value={4.5} size={44} />
          <span className="text-3xl font-bold text-gray-800">4.5</span>
        </div>
      </div>
    </div>
  );
};

export default RatingSystem;
