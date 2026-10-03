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

const Card = ({ id, image, name, address, price, isFavorite, propertyObj }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    dispatch(toggleFavorite(id, propertyObj));
  };
  return (
    <figure className="property" style={{ position: "relative" }}>
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
          <h5>{name}</h5>

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
      {properties.length === 0 ? (
        <p className={"not_found"}>Property not found</p>
      ) : (
        <div className="propertylist" ref={propertyListRef}>
          {properties.map((property) => (
            <Card
              key={property._id}
              id={property._id}
              image={property.images[0].url}
              name={property.propertyName}
              address={`${property.address.city}, ${property.address.state} ${property.address.pincode}`}
              price={property.price}
              slug={property.slug}
              isFavorite={favorites?.some(fav => fav.property?._id === property._id)}
              propertyObj={property}
            />
          ))}
        </div>
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
    </>
  );
};

export default PropertyList;
