import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { toggleFavorite } from "../../store/Favorite/favorite-action";
import LoadingSpinner from "../LoadingSpinner";

// Card Component specifically for MyFavorites with unfavorite button
const FavoriteCard = ({ id, image, name, address, price, propertyObj }) => {
  const dispatch = useDispatch();

  const handleUnfavorite = (e) => {
    e.preventDefault();
    dispatch(toggleFavorite(id, propertyObj));
  };

  return (
    <figure className="property" style={{ position: "relative" }}>
      <div 
        className="favorite-btn active"
        onClick={handleUnfavorite}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
          padding: "5px",
          cursor: "pointer",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Remove from Favorites"
      >
        <span 
          className="material-symbols-outlined" 
          style={{ 
            color: "#ff385c",
            fontVariationSettings: "'FILL' 1"
          }}
        >
          favorite
        </span>
      </div>
      <Link to={`/propertylist/${id}`}>
        <img src={image} alt="Propertyimg" />
        <h4>{name}</h4>
        <figcaption>
          <main className="propertydetails">
            <span className="material-symbols-outlined houseicon">home_pin</span>
            <p>{address}</p>
          </main>
          <main className="price">
            <p>&#8377;{price}</p>
          </main>
        </figcaption>
      </Link>
    </figure>
  );
};

const MyFavorites = () => {
  const { favorites, loading } = useSelector((state) => state.favorite);
  const propertyListRef = useRef(null);

  useEffect(() => {
    if (propertyListRef.current && favorites.length > 0) {
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
  }, [favorites]);

  if (loading) {
    return (
      <div className="row justify-content-center mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Favorites</h2>
      {favorites.length === 0 ? (
        <div className="text-center mt-5">
          <p style={{ fontSize: "1.2rem", color: "#666" }}>You haven't added any properties to your favorites yet.</p>
          <Link to="/" className="btn" style={{ backgroundColor: "#ff385c", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none" }}>
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="propertylist" ref={propertyListRef}>
          {favorites.map((fav) => {
            const property = fav.property;
            if (!property) return null;
            return (
              <FavoriteCard
                key={property._id}
                id={property._id}
                image={property.images?.[0]?.url}
                name={property.propertyName}
                address={`${property.address?.city}, ${property.address?.state} ${property.address?.pincode}`}
                price={property.price}
                propertyObj={property}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
