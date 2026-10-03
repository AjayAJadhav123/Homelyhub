import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ImagesUploading = ({ field, disabled }) => {
  const [imageInput, setImageInput] = useState("");

  const handleImageInputChange = (event) => {
    setImageInput(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate size (e.g. 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Validate type
    if (!file.type.match("image/(jpeg|png|webp|jpg)")) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      return;
    }

    const newImage = {
      public_id: `temp_${Date.now()}`,
      url: URL.createObjectURL(file),
      file: file
    };
    field.handleChange([...field.state.value, newImage]);
    event.target.value = null; // reset input
  };

  const handleAddImage = () => {
    if (imageInput) {
      const newImage = {
        public_id: `url_${Date.now()}`,
        url: imageInput,
      };
      field.handleChange([...field.state.value, newImage]);
      setImageInput("");
    }
  };

  const handleDeleteImage = (index) => {
    if (disabled) return;
    const updatedImages = [...field.state.value];
    updatedImages.splice(index, 1);
    field.handleChange(updatedImages);
  };

  return (
    <div className="photos-container">
      <h4 className="photos-header">Photos</h4>
      <label className="form-labels">At least 6 images are required for a complete listing.</label>

      <div className="image-link-container">
        <input
          className="image-link"
          type="text"
          placeholder="Add using link (e.g., https://example.com/image.jpg)"
          onChange={handleImageInputChange}
          value={imageInput}
          disabled={disabled}
        />
        <button 
          className="add-button" 
          type="button" 
          onClick={handleAddImage}
          disabled={disabled || !imageInput}
        >
          Add
        </button>
      </div>

      <div className="image-list-container">
        {field.state.value && field.state.value.map((imageObj, index) => (
          <div key={index} className="image-preview-box">
            <img
              alt={`Image-${index}`}
              src={imageObj.url}
              className="preview-image"
              style={{ objectFit: 'cover' }}
              height="200px"
              width="200px"
            />
            <button
              type="button"
              onClick={() => handleDeleteImage(index)}
              className="delete-btn"
              disabled={disabled}
            >
              <Trash2 />
            </button>
          </div>
        ))}

        <label className="upload">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <span className="material-symbols-outlined">upload</span>
          Upload Photo
        </label>
      </div>
      {field.state.value?.length < 6 && (
         <p style={{ color: 'red', marginTop: '10px' }}>
           You need {6 - (field.state.value?.length || 0)} more image(s).
         </p>
      )}
    </div>
  );
};

export default ImagesUploading;
