import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import "../../css/Home.css";
import {
  STATIC_PROPERTIES,
  STATIC_TOTAL_PROPERTIES,
} from "../../data/staticData";
import {useDispatch,useSelector} from "react-redux"
import {propertyAction} from "../../store/Property/property-slice"
import {getAllProperties} from "../../store/Property/property-action"
import { toggleFavorite } from "../../store/Favorite/favorite-action";
import AiPropertySearch from "./AiPropertySearch";
import InteractiveMap from "./InteractiveMap";
import PropertyCompare from "./PropertyCompare";
import toast from "react-hot-toast";

const Card = ({ id, image, name, address, price, isFavorite, propertyObj, isCompared, onCompareToggle }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    dispatch(toggleFavorite(id, propertyObj));
  };
  return (
    <figure className="property" style={{ position: "relative" }}>
      <label className="compare-checkbox-container">
        <input 
          type="checkbox" 
          checked={isCompared}
          onChange={() => onCompareToggle(propertyObj)}
        /> Compare
      </label>
      <div 
        className={`favorite-btn ${isFavorite ? "active" : ""}`}
        onClick={handleFavoriteClick}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
          padding: "5px",
          cursor: isAuthenticated ? "pointer" : "not-allowed",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <span 
          className="material-symbols-outlined" 
          style={{ 
            color: isFavorite ? "#ff385c" : "rgba(0,0,0,0.5)",
            fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0"
          }}
        >
          favorite
        </span>
      </div>
      <Link to={`/propertylist/${id}`}>
        <img 
          src={image} 
          alt={name} 
          onError={(e) => { 
            console.error("Image failed to load:", image);
            e.target.onerror = null; 
            e.target.alt = "Image unavailable"; 
            e.target.style.backgroundColor = "#eee";
            e.target.src = ""; // Clear broken src
          }}
        />
      </Link>
      <h4>{name}</h4>
      <figcaption>
        <main className="propertydetails">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h5>{name}</h5>
            {propertyObj?.averageRating > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.9rem", color: "#475569" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#ff385c", fontVariationSettings: "'FILL' 1" }}>star</span>
                <strong>{propertyObj.averageRating}</strong> ({propertyObj.numberOfReviews})
              </span>
            )}
          </div>

          <h6>
            <span className="material-symbols-outlined houseicon">
              home_pin
            </span>
            {address}
          </h6>
          <p>
            <span className="price"> ₹{price}</span> per night
          </p>
        </main>
      </figcaption>
    </figure>
  );
};

const PropertyList = () => {
   const dispatch = useDispatch();
   const {properties, totalProperties, searchParams} = useSelector(state=>state.property)
   const {favorites} = useSelector(state=>state.favorite)
   const currentPage = searchParams.page || 1;
   const lastPage = Math.ceil(totalProperties / 8);

  const propertyListRef = useRef(null);

  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleCompareToggle = (property) => {
    setSelectedForCompare(prev => {
      const isSelected = prev.some(p => p._id === property._id);
      if (isSelected) {
        return prev.filter(p => p._id !== property._id);
      } else {
        if (prev.length >= 4) {
          toast.error("You can only compare up to 4 properties at a time.");
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  useEffect(() => {
    dispatch(getAllProperties())
  }, [searchParams, dispatch]);

  const setPage = (newPage) => {
    dispatch(propertyAction.updateSearchParams({ page: newPage }));
  };

  useEffect(() => {
    if (propertyListRef.current) {
      gsap.fromTo(
        propertyListRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [properties]);

  return (
    <>
      <AiPropertySearch />
      
      {properties.length > 0 && <InteractiveMap properties={properties} />}

      {properties.length === 0 ? (
        <p className={"not_found"}>Property not found</p>
      ) : (
        <>
          <div style={{ maxWidth: "1200px", margin: "1rem auto", padding: "0 1.5rem" }}>
            <h3 style={{ color: "#1e293b", fontSize: "1.2rem", fontWeight: "600" }}>
              Showing {totalProperties} {totalProperties === 1 ? 'property' : 'properties'}
            </h3>
          </div>
          <div className="propertylist" ref={propertyListRef}>
          {properties.map((property) => (
            <Card
              key={property._id}
              id={property._id}
              image={property.images?.[0]?.url}
              name={property.propertyName}
              address={`${property.address?.city}, ${property.address?.state} ${property.address?.pincode}`}
              price={property.price}
              slug={property.slug}
              isFavorite={favorites?.some(fav => fav.property?._id === property._id)}
              propertyObj={property}
              isCompared={selectedForCompare.some(p => p._id === property._id)}
              onCompareToggle={handleCompareToggle}
            />
          ))}
        </div>
        </>
      )}

      <div className="pagination">
        <button
          className="previous_btn"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        <button
          className="next_btn"
          onClick={() => setPage(currentPage + 1)}
          disabled={properties.length < 8 || currentPage === lastPage || lastPage === 0}
        >
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>

      {selectedForCompare.length > 0 && (
        <div className="compare-tray">
          <div className="compare-tray-left">
            <span><strong>{selectedForCompare.length}</strong> properties selected</span>
            <div className="compare-tray-thumbnails">
              {selectedForCompare.map(p => (
                <img key={p._id} src={p.images[0]?.url} alt={p.propertyName} title={p.propertyName} />
              ))}
            </div>
          </div>
          <button 
            className="compare-action-btn"
            onClick={() => setShowCompareModal(true)}
            disabled={selectedForCompare.length < 2}
          >
            {selectedForCompare.length < 2 ? "Select at least 2 to compare" : "Compare Now"}
          </button>
        </div>
      )}

      {showCompareModal && (
        <PropertyCompare 
          selectedProperties={selectedForCompare} 
          onRemove={(id) => setSelectedForCompare(prev => prev.filter(p => p._id !== id))}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
};

export default PropertyList;
