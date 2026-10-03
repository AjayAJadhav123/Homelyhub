import React, { useState } from "react";
import ImagesUploading from "./ImagesUploading";
import { getAiDescription } from "../../ai/aiDescription";
import { useForm } from "@tanstack/react-form";
import { AddressField } from "./AddressField";
import AmenitiesField from "./AmenitiesField";
import {
  createAccomodation,
  getAllAccomodation,
} from "../../store/Accomodation/Accomodation-action";
import { getAllProperties } from "../../store/Property/property-action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";

const Section = ({ icon, title, hint, children }) => (
  <section className="accf-card">
    <div className="accf-sec">
      <span className="material-symbols-outlined">{icon}</span>
      <h2>{title}</h2>
      {hint && <span className="accf-hint">{hint}</span>}
    </div>
    {children}
  </section>
);

const AccomodationForm = ({ isEdit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading: storeLoading } = useSelector((state) => state.accomodation);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  const loading = storeLoading || fetchLoading;

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      propertyType: undefined,
      roomType: undefined,
      extraInfo: undefined,
      images: [],
      amenities: [],
     address: {
  area: "",
  city: "",
  state: "",
  pincode: "",
},
      checkIn: undefined,
      checkOut: undefined,
      maximumGuest: 0,
      price: "",
    },
    onSubmit: async ({ value }) => {
  try {
    if (!value.images || value.images.length < 6) {
      toast.error("Please upload at least 6 images before publishing.");
      return;
    }

    if (!value.name || !value.description || !value.propertyType || !value.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const maxGuests = parseInt(value.maximumGuest) || 1;
    const priceNum = parseInt(value.price) || 0;

    setFetchLoading(true); // Reusing loading state for upload progress

    const finalImages = [];

    for (let i = 0; i < value.images.length; i++) {
      const img = value.images[i];
      if (img.file) {
        const authRes = await axiosInstance.get("/v1/rent/user/imagekit-auth");
        const authParams = authRes.data;

        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("publicKey", authParams.publicKey);
        formData.append("signature", authParams.signature);
        formData.append("expire", authParams.expire);
        formData.append("token", authParams.token);
        formData.append("fileName", `prop_${Date.now()}.jpg`);
        formData.append("folder", "property_images");

        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
           throw new Error("Failed to upload image to ImageKit");
        }
        const uploadData = await uploadRes.json();
        finalImages.push({ url: uploadData.url, public_id: uploadData.fileId });
      } else {
        finalImages.push({ url: img.url, public_id: img.public_id });
      }
    }

    const payload = {
      propertyName: value.name,
      description: value.description,
      propertyType: value.propertyType,
      roomType: value.roomType,
      extraInfo: value.extraInfo,
      images: finalImages,
      address: value.address,
      amenities: value.amenities,
      checkInTime: value.checkIn,
      checkOutTime: value.checkOut,
      maximumGuest: maxGuests,
      price: priceNum,
    };

    if (isEdit) {
        await axiosInstance.patch(`/v1/rent/user/accommodation/${id}`, payload);
        toast.success("Property Updated Successfully");
      } else {
        await dispatch(createAccomodation(payload));
        toast.success("New Property Created Successfully");
      }

      dispatch(getAllAccomodation());
      // Reset properties search params and fetch fresh data for homepage
      dispatch({ type: "property/updateSearchParams", payload: { page: 1, sort: "-createdAt" } });
      dispatch(getAllProperties());
      navigate("/");
    } catch (error) {
      setFetchLoading(false);
      toast.error(
        error.response?.data?.message || error.message || "Failed to save property"
      );
      console.error(error);
    }
  }
});

  const handleAiDescription = async (field) => {
    const values = form.state.values;

    if (!values.name) {
      toast.error("Please add a title first");
      return;
    }

    setAiLoading(true);
    try {
      const description = await getAiDescription(values);
      field.handleChange(description);
      toast.success("Description added");
    } catch (error) {
      toast.error("Could not generate a description");
      console.error(error);
    }
    setAiLoading(false);
  };

  React.useEffect(() => {
    if (isEdit && id) {
      setFetchLoading(true);
      axiosInstance.get(`/v1/rent/listing/${id}`)
        .then((res) => {
          const prop = res.data.data;
          form.setFieldValue("name", prop.propertyName);
          form.setFieldValue("description", prop.description);
          form.setFieldValue("propertyType", prop.propertyType);
          form.setFieldValue("roomType", prop.roomType);
          form.setFieldValue("extraInfo", prop.extraInfo || "");
          form.setFieldValue("images", prop.images || []);
          form.setFieldValue("amenities", prop.amenities || []);
          form.setFieldValue("address", prop.address || { area: "", city: "", state: "", pincode: "" });
          form.setFieldValue("checkIn", prop.checkInTime);
          form.setFieldValue("checkOut", prop.checkOutTime);
          form.setFieldValue("maximumGuest", prop.maximumGuest);
          form.setFieldValue("price", prop.price);
        })
        .catch((err) => {
          toast.error("Failed to load property details");
          navigate("/accomodation");
        })
        .finally(() => {
          setFetchLoading(false);
        });
    }
  }, [isEdit, id, form, navigate]);

  return (
    <div className="accf-page">
      <header className="accf-hero">
        <h1>
          <span className="material-symbols-outlined">home_work</span>
          List your place
        </h1>
        <p>
          Fill in the details below
        </p>
      </header>

      <form
        className="accf-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Section icon="title" title="Title" hint="Short and catchy">
          <form.Field name="name">
            {(field) => (
              <input
                className="accf-input"
                type="text"
                placeholder="Sunny cottage near the beach"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </Section>

        <Section icon="location_on" title="Address">
          <AddressField form={form} />
        </Section>

        <Section icon="photo_library" title="Photos" hint="At least 6">
          <form.Field name="images">
            {(field) => <ImagesUploading field={field} disabled={loading} />}
          </form.Field>
        </Section>

        <Section icon="home" title="Property">
          <div className="accf-grid-2">
            <div className="accf-field">
              <label>Property type</label>
              <form.Field name="propertyType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="Guest House">Guest House</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Room type</label>
              <form.Field name="roomType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Anytype">Anytype</option>
                    <option value="Entire Home">Entire Home</option>
                    <option value="Room">Room</option>
                  </select>
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        <Section icon="checklist" title="Amenities" hint="Pick what you offer">
          <AmenitiesField form={form} />
        </Section>

        <Section icon="gavel" title="House rules" hint="Optional">
          <form.Field name="extraInfo">
            {(field) => (
              <textarea
                className="accf-input accf-textarea"
                rows="3"
                placeholder="Check-in after 1pm, no smoking indoors..."
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </Section>

        <Section icon="description" title="Description">
          <form.Field name="description">
            {(field) => (
              <>
                <div className="accf-desc-row">
                  <span className="accf-hint">
                    Tell guests what makes your place special
                  </span>

                  <button
                    type="button"
                    className="accf-ai"
                    disabled={aiLoading}
                    onClick={() => handleAiDescription(field)}
                  >
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    {aiLoading ? "Writing..." : "Write with AI"}
                  </button>
                </div>
                <textarea
                  className="accf-input accf-textarea"
                  rows="5"
                  placeholder="Write a few lines, or let AI do it for you"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          </form.Field>
        </Section>

        <Section icon="event" title="Stay details" hint="24 hour format">
          <div className="accf-grid-4">
            <div className="accf-field">
              <label>Check-in</label>
              <form.Field name="checkIn">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Check-out</label>
              <form.Field name="checkOut">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Guests</label>
              <form.Field name="maximumGuest">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    placeholder="2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Price / night</label>
              <form.Field name="price">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    placeholder="2000"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        <button className="accf-save" type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update listing" : "Publish listing"}
        </button>
      </form>
    </div>
  );
};

export default AccomodationForm;
