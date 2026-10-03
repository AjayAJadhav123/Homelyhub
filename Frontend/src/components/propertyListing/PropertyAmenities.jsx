import React from "react";

const PropertyAmenities = ({ amenities }) => {
  // Helper to safely render the icon
  const renderIcon = (iconStr) => {
    if (!iconStr) {
      // Fallback if no icon is provided
      return <i className="fas fa-check-circle amenity-icon"></i>;
    }
    
    // Normalize FA6 'fa-solid' to FA5 'fas' for compatibility
    let className = iconStr.replace('fa-solid', 'fas').replace('fa-regular', 'far');
    return <i className={`${className} amenity-icon`} />;
  };

  return (
    <div className="amenities-section">
      <h2 className="property-amenities-title">What this place offers</h2>
      <div className="amenities-grid">
        {amenities && amenities.length > 0 ? (
          amenities.map((amenity, index) => (
            <div className="amenity-item" key={index}>
              {renderIcon(amenity.icon)}
              <span className="amenity-name">{amenity.name}</span>
            </div>
          ))
        ) : (
          <p>No amenities listed.</p>
        )}
      </div>
    </div>
  );
};

export default PropertyAmenities;
