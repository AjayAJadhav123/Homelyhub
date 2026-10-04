import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import "./PropertyReviews.css";

const ReviewForm = ({ propertyId, bookingId, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      rating: 5,
      cleanlinessRating: 5,
      locationRating: 5,
      valueRating: 5,
      comment: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await axiosInstance.put(`/v1/rent/reviews/${initialData._id}`, formData);
        toast.success("Review updated successfully!");
      } else {
        await axiosInstance.post("/v1/rent/reviews", { ...formData, propertyId, bookingId });
        toast.success("Review submitted successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const StarInput = ({ label, name, value }) => (
    <div className="rating-input-group">
      <label>{label}</label>
      <div className="star-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined ${star <= value ? "active" : ""}`}
            onClick={() => setFormData((prev) => ({ ...prev, [name]: star }))}
          >
            star
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>{initialData ? "Edit Your Review" : "Write a Review"}</h4>
      
      <div className="rating-inputs">
        <StarInput label="Overall Rating" name="rating" value={formData.rating} />
        <StarInput label="Cleanliness" name="cleanlinessRating" value={formData.cleanlinessRating} />
        <StarInput label="Location" name="locationRating" value={formData.locationRating} />
        <StarInput label="Value for Money" name="valueRating" value={formData.valueRating} />
      </div>

      <textarea
        required
        placeholder="Share your experience (e.g., cleanliness, host, location)..."
        value={formData.comment}
        onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
      />

      <div className="form-actions">
        {onCancel && <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
};

const PropertyReviews = ({ propertyId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState({ canReview: false });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(`/v1/rent/reviews/property/${propertyId}`);
      setReviews(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkEligibility = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axiosInstance.get(`/v1/rent/reviews/eligibility/${propertyId}`);
      setEligibility(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchReviews(), checkEligibility()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [propertyId, isAuthenticated]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axiosInstance.delete(`/v1/rent/reviews/${reviewId}`);
      toast.success("Review deleted!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="property-reviews-container mt-5">
      <hr />
      <div className="reviews-header">
        <h2>
          <span className="material-symbols-outlined star-icon">star</span>
          {averageRating > 0 ? averageRating : "New"} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </h2>
        
        {eligibility.canReview && !showForm && (
          <button className="btn-write-review" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {(showForm || editingReview) && (
        <ReviewForm
          propertyId={propertyId}
          bookingId={eligibility.bookingId}
          initialData={editingReview || (eligibility.reason === "already_reviewed" ? eligibility.review : null)}
          onSuccess={() => {
            setShowForm(false);
            setEditingReview(null);
            loadData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-card-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.userId.name ? review.userId.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h5>{review.userId.name || "Guest"}</h5>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {user?._id === review.userId._id && (
                <div className="review-actions">
                  <button onClick={() => setEditingReview(review)} title="Edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(review._id)} title="Delete" className="delete-btn">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="review-stars-display">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined ${i < review.rating ? "active" : ""}`}>
                  star
                </span>
              ))}
            </div>
            
            <p className="review-comment">{review.comment}</p>
            
            <div className="review-breakdown">
              <span>Cleanliness: {review.cleanlinessRating}/5</span>
              <span>Location: {review.locationRating}/5</span>
              <span>Value: {review.valueRating}/5</span>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && reviews.length === 0 && (
        <p className="no-reviews">No reviews yet. Be the first to review if you've stayed here!</p>
      )}
    </div>
  );
};

export default PropertyReviews;
