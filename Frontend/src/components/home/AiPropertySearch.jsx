import React, { useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import "./AiPropertySearch.css";

const AiPropertySearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const { data } = await axiosInstance.post("/v1/rent/ai/search-properties", { query });
      if (data.success) {
        setResults(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch AI recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-property-search">
      <div className="ai-search-header">
        <h2>✨ AI Property Matchmaker</h2>
        <p>Tell us what you're looking for in plain English. Example: "I need a flat under 2000 in Mumbai with a pool."</p>
      </div>

      <form className="ai-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What's your dream stay?"
          className="ai-search-input"
          disabled={loading}
        />
        <button type="submit" className="ai-search-button" disabled={loading || !query}>
          {loading ? "Searching..." : "Find Magic"}
        </button>
      </form>

      {error && <div className="ai-search-error">{error}</div>}

      {results.length > 0 && (
        <div className="ai-search-results">
          <h3>Top Matches</h3>
          <div className="ai-results-grid">
            {results.map((property) => (
              <div key={property._id} className="ai-property-card">
                <div className="ai-property-image">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0].url} alt={property.propertyName} />
                  ) : (
                    <div className="ai-no-image">No Image</div>
                  )}
                  <div className="ai-score-badge">
                    {property.aiScore}% Match
                  </div>
                </div>
                <div className="ai-property-details">
                  <h4>{property.propertyName}</h4>
                  <p className="ai-property-location">
                    {property.address?.city}, {property.address?.state}
                  </p>
                  <p className="ai-property-price">₹{property.price} / night</p>
                  
                  <div className="ai-match-reason">
                    <strong>Why this match?</strong>
                    <p>{property.matchReason}</p>
                  </div>
                  
                  <Link to={`/propertylist/${property._id}`} className="ai-view-btn">
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!loading && results.length === 0 && !error && query && (
        <div className="ai-search-empty">
          <p>No matches found yet. Try searching!</p>
        </div>
      )}
    </div>
  );
};

export default AiPropertySearch;
