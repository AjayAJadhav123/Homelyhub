import React, { useEffect, useState } from "react";
import "../../css/PropertyListing.css";
import "../../css/PropertyListing.css";
import PropertyImg from "./PropertyImg";
import PaymentForm from "./PaymentForm";
import PropertyAmenities from "./PropertyAmenities";
import PropertMapInfo from "./PropertyMapInfo";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import {getPropertyDetails} from "../../store/PropertyDetails/propertyDetails-action"
import {useDispatch,useSelector} from "react-redux"
import { toggleFavorite } from "../../store/Favorite/favorite-action";
import InquiryModal from "./InquiryModal";
import PropertyReviews from "./PropertyReviews";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  STATIC_PROPERTIES,
  STATIC_PROPERTY_DETAILS,
} from "../../data/staticData";

const PropertyListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);

  // STATIC: was `useSelector((state) => state.propertydetails)`.
  // TODO: replace with your own fetch logic.
  
 const dispatch=useDispatch()
  const {propertydetails,loading} = useSelector(state=>state.propertyDetails)
  const { isAuthenticated } = useSelector((state) => state.user);
  const { favorites } = useSelector((state) => state.favorite);

  const isFavorite = favorites?.some(fav => fav.property?._id === id);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) return;
    dispatch(toggleFavorite(id, propertydetails));
  };

  useEffect(() => {
    dispatch(getPropertyDetails(id))
  }, [id,dispatch]);

  const handleStartChat = async () => {
    if (!isAuthenticated) return;
    try {
      await axiosInstance.post("/v1/rent/chat/conversations", { propertyId: id });
      navigate("/chat");
    } catch (error) {
      console.error("Failed to start chat", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  if (loading || !propertydetails)
    return (
      <div className="row justify-content-around mt-5">
        <LoadingSpinner />
      </div>
    );

  const {
    propertyName,
    address,
    description,
    images,
    amenities,
    maximumGuest,
    price,
    currentBookings,
  } = propertydetails;

  return (
    <div className="property-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="property-header">{propertyName}</p>
        <button 
          onClick={handleFavoriteClick}
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "50%",
            padding: "8px",
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
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
        </button>
      </div>
      <h6 className="property-location">
        <span className="material-symbols-outlined">house</span>
        <span className="location">{`${address?.area}, ${address?.city}, ${address?.state}`}</span>
      </h6>
      <PropertyImg images={images} />
      <div className="middle-container row">
        <div className="des-and-amenities col-md-8 col-sm-12 col-12">
          <h2 className="property-description-header">Description</h2>
          <p className="property-description">
            {description} <br></br>
            <br></br>Max number of guests: {maximumGuest}
          </p>
          <div className="mt-3 mb-4">
            <button 
              className="btn"
              onClick={() => {
                if (!isAuthenticated) return;
                setIsInquiryModalVisible(true);
              }}
              style={{
                backgroundColor: "#ff385c",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: isAuthenticated ? "pointer" : "not-allowed",
                opacity: isAuthenticated ? 1 : 0.6
              }}
              title={!isAuthenticated ? "Please login to contact the owner" : ""}
            >
              Contact Owner
            </button>
            <button 
              className="btn"
              onClick={handleStartChat}
              style={{
                backgroundColor: "white",
                color: "#ff385c",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ff385c",
                fontWeight: "600",
                cursor: isAuthenticated ? "pointer" : "not-allowed",
                opacity: isAuthenticated ? 1 : 0.6,
                marginLeft: "10px"
              }}
              title={!isAuthenticated ? "Please login to chat with the owner" : ""}
            >
              Chat with Owner
            </button>
          </div>
          <hr></hr>
          <PropertyAmenities amenities={amenities} />
        </div>
        <div className="property-payment col-md-4 col-sm-12 col-12">
          <PaymentForm
            propertyId={id}
            price={price}
            propertyName={propertyName}
            address={address}
            maximumGuest={maximumGuest}
            currentBookings={currentBookings}
          />
        </div>
      </div>
      <hr></hr>
      <div className="property-map">
        <div className="map-image-exinfo-container row">
          <PropertMapInfo address={address} />
        </div>
      </div>
      
      <PropertyReviews propertyId={id} />
      
      <InquiryModal 
        visible={isInquiryModalVisible}
        onClose={() => setIsInquiryModalVisible(false)}
        propertyId={id}
        propertyName={propertyName}
      />
    </div>
  );
};

export default PropertyListing;
