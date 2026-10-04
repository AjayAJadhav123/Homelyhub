import React from "react";
import "./PropertyCompare.css";

const PropertyCompare = ({ selectedProperties, onRemove, onClose }) => {
  if (selectedProperties.length === 0) return null;

  const features = [
    { label: "Price per night", key: "price", format: (val) => `₹${val}` },
    { label: "Property Type", key: "propertyType" },
    { label: "Room Type", key: "roomType" },
    { label: "Max Guests", key: "maximumGuest" },
    { label: "Location", key: "address", format: (val) => `${val?.city || "N/A"}, ${val?.state || ""}` },
  ];

  // Get all unique amenities across selected properties
  const allAmenities = Array.from(
    new Set(
      selectedProperties.flatMap((p) => p.amenities.map((a) => a.name))
    )
  ).sort();

  return (
    <div className="compare-modal-overlay">
      <div className="compare-modal">
        <div className="compare-modal-header">
          <h2>Compare Properties</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="compare-table-container">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="feature-col">Feature</th>
                {selectedProperties.map((p) => (
                  <th key={p._id} className="prop-col">
                    <div className="prop-col-header">
                      <img src={p.images[0]?.url} alt={p.propertyName} />
                      <h4>{p.propertyName}</h4>
                      <button className="remove-btn" onClick={() => onRemove(p._id)}>
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feat) => (
                <tr key={feat.key}>
                  <td className="feature-name">{feat.label}</td>
                  {selectedProperties.map((p) => (
                    <td key={p._id}>
                      {feat.format ? feat.format(p[feat.key]) : p[feat.key]}
                    </td>
                  ))}
                </tr>
              ))}
              
              <tr className="amenities-row-header">
                <td colSpan={selectedProperties.length + 1}>Amenities</td>
              </tr>
              
              {allAmenities.map((amenity) => (
                <tr key={amenity}>
                  <td className="feature-name">{amenity}</td>
                  {selectedProperties.map((p) => {
                    const hasAmenity = p.amenities.some((a) => a.name === amenity);
                    return (
                      <td key={p._id} className={hasAmenity ? "has-amenity" : "no-amenity"}>
                        <span className="material-symbols-outlined">
                          {hasAmenity ? "check_circle" : "cancel"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyCompare;
