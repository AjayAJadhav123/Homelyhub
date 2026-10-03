import React, { useState } from "react";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyAccomodation = ({ accomodation, loading }) => {
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/v1/rent/user/accommodation/${id}`);
      toast.success("Listing deleted successfully");
      // Ideally dispatch getAllAccomodation here, but for now we'll just reload or remove from DOM
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete listing");
      setDeletingId(null);
    }
  };

  return (
    <div className="main-container">
      {accomodation.map((accom) => (
        <div className="myaccomodation-container row" key={accom._id}>
          <div className="myaccomodation-image-container col-lg-3 col-md-3">
            <img
              className="myaccomodation-img"
              src={accom.images[0]?.url || ""}
              alt={accom.propertyName}
            />
          </div>
          <div className="myaccomodation-information col-lg-9 col-md-9" style={{ position: 'relative' }}>
            <h6 className="myaccomodation-hotel-name">
              {accom.propertyName}
            </h6>
            <div className="stay-information">
              <span className="info">
                <span className="material-symbols-outlined icon">
                  calendar_month
                </span>
                Check In Time: {accom.checkInTime}
              </span>
              <span className="material-symbols-outlined icon">
                arrow_forward
              </span>
              <span className="info">
                <span className="material-symbols-outlined icon">
                  calendar_month
                </span>
                Check Out Time: {accom.checkOutTime}
              </span>
            </div>
            <p className="myaccomodation-city">
              City :{accom.address?.city}
            </p>
            <p className="myaccomodation-guest">
              Max no of guest : {accom.maximumGuest}
            </p>
            <h5 className="myaccomodation-price">
              <span className="material-symbols-outlined">payments</span> Total
              Price :&#8377; {accom.price}
            </h5>
            
            <div style={{ position: 'absolute', right: '10px', top: '10px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => navigate(`/edit-accommodation/${accom._id}`)}
                disabled={deletingId === accom._id || loading}
                style={{
                  background: '#1890ff', color: 'white', border: 'none', 
                  padding: '5px 15px', borderRadius: '4px', cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(accom._id)}
                disabled={deletingId === accom._id || loading}
                style={{
                  background: '#ff4d4f', color: 'white', border: 'none', 
                  padding: '5px 15px', borderRadius: '4px', cursor: 'pointer'
                }}
              >
                {deletingId === accom._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAccomodation;
