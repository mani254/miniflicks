 import React, { useState, useEffect } from "react";
import "./ImageComponent.css";
import { FileInput, TextInput } from "../formComponents/FormComponents";
import axios from "axios";
import { MdDelete } from "react-icons/md";

function ImageComponent() {
   const [previewImages, setPreviewImages] = useState([]);
   const [currentImages, setCurrentImage] = useState(0);
   const [showInput, setShowInput] = useState(false);
   const [imageUrl, setImageUrl] = useState("");
   const [formData, setFormData] = useState(new FormData());


   useEffect(() => {
      setCurrentImage(previewImages.length);
   }, [previewImages]);

   function handleImageChange(event) {
      const files = event.target.files;
      const newImages = [];

      Array.from(files).forEach((file, index) => {
         formData.append(`image-${previewImages.length + index}`, file);
         const url = URL.createObjectURL(file);
         newImages.push({ url, source: "file" });
      });

      // Update previewImages after constructing the new array
      setPreviewImages([...previewImages, ...newImages]);
   }

   async function fetchImageAsBlob(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
   }

   function deleteImage(index) {
      // Create a copy of formData
      const updatedFormData = new FormData();
      // Append entries from existing formData that do not match the index
      let newIndex = 0;
      for (const pair of formData.entries()) {
         const [key, value] = pair;
         if (!key.startsWith(`image-${index}`)) {
            // If the key doesn't match the deleted index, append it with the new index
            updatedFormData.append(`image-${newIndex}`, value);
            newIndex++;
         }
      }
      // Remove image from previewImages
      const updatedPreviewImages = [...previewImages];
      updatedPreviewImages.splice(index, 1);

      setFormData(updatedFormData);
      setPreviewImages(updatedPreviewImages);
   }

   async function handleAddImageUrl() {
   }

   function handleSubmit() {
      axios
         .post("your_api_endpoint", formData)
         .then((response) => { })
         .catch((error) => { });
   }

   return (
      <React.Fragment>
         <h6>Upload Images</h6>
         <div className={`upload-image-container container ${currentImages === 0 && "empty"}`}>
            <div className="row gx-3 gy-3">
               {currentImages !== 0 &&
                  previewImages.map((image, index) => (
                     <div className="col-lg-4" key={index}>
                        <div className="image-view-space image-container">
                           <span
                              className="del-icon"
                              onClick={() => {
                                 deleteImage(index);
                              }}>
                              <MdDelete />
                           </span>
                           <img src={image.url} alt="product-image" />
                        </div>
                     </div>
                  ))}
               <div className="col-lg-4">
                  <div className="add-image-container">
                     {currentImages === 0 && <p>You can upload images or add image through url Here. You can drag and drop your images as well</p>}
                     <FileInput variant="variant-1" label="image Input" type="file" multiple onChange={handleImageChange} id="images input" />
                     {showInput && <TextInput type="text" onChange={(e) => setImageUrl(e.target.value)} variant="variant-1" />}
                     <span onClick={handleAddImageUrl}>{showInput ? "Add" : "Add Url"}</span>
                  </div>
               </div>
            </div>
         </div>
         {/* <button className="mt-4" onClick={handleSubmit}>
            Submit
         </button> */}
      </React.Fragment>
   );
}

export default ImageComponent;