import React, { useState, useEffect } from "react";
import "./ImageComponent.css";
import { FileInput, TextInput } from "../formComponents/FormComponents";
import { connect } from 'react-redux';
import { MdDelete } from "react-icons/md";
import { showNotification } from "../../redux/notification/notificationActions";


function SingleImageComponent({ setParentDetails = null, parentDetails = null, showNotification }) {
   const [previewImage, setPreviewImage] = useState(null);
   const [showInput, setShowInput] = useState(false);
   const [imageUrl, setImageUrl] = useState(null)


   useEffect(() => {
      function updateSetup() {
         if (!parentDetails?.image) {
            return;
         }
         try {
            const imageUrl = `${process.env.REACT_APP_BACKENDURI}/${parentDetails.image}`;
            setPreviewImage(imageUrl)
         } catch (error) {
            showNotification("Image can't be uploaded");
            console.error("Error fetching image:", error);
         }
      }
      updateSetup()
   }, [])


   async function fetchImageAsBlob(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
   }

   function handleImageChange(event) {
      const file = event.target.files[0];
      let imageLink = null;
      setParentDetails({ ...parentDetails, image: file })
      imageLink = URL.createObjectURL(file);
      setPreviewImage(imageLink);
   }

   function deleteImage() {
      setParentDetails({ ...parentDetails, image: null })
      setPreviewImage(null)
   }

   async function handleAddImageUrl() {
      if (!showInput) {
         return setShowInput(true);
      }
      if (imageUrl.trim() === "") {
         return window.alert("Please enter a valid URL");
      }
      try {
         const blob = await fetchImageAsBlob(imageUrl);
         setParentDetails({ ...parentDetails, image: blob })
         setPreviewImage(imageUrl)
         setShowInput(false);
         setImageUrl("");
      } catch (error) {
         showNotification("image can't be uploaded")
         console.error("Error fetching image:", error);
      }
   }

   // function handleSubmit() {

   //    const formData = new FormData()
   //    formData.append('image', image)
   //    axios
   //       .post(`some url`, formData)
   //       .then((response) => { })
   //       .catch((error) => { });
   // }


   return (
      <div>
         <label>Upload Image:</label>
         <div className={`upload-image-container container ${!previewImage && "empty"}`}>
            <div className="row gx-3 gy-3">
               {previewImage &&

                  <div className="col-lg-4">
                     <div className="image-view-space image-wrapper">
                        <span
                           className="del-icon"
                           onClick={() => {
                              deleteImage();
                           }}>
                           <MdDelete />
                        </span>
                        <img className="cover" src={previewImage} alt="product-image" />
                     </div>
                  </div>
               }
               <div className="col-lg-4">
                  <div className="add-image-container">
                     {!previewImage && !showInput && <p className="text-center">You can upload image or add image through url Here. You can drag and drop your images as well</p>}
                     <FileInput variant="variant-1" label="image Input" type="file" onChange={handleImageChange} id="images input" value={previewImage ? "Change Image" : "Add Image"} />
                     {showInput && <TextInput type="text" onChange={(e) => setImageUrl(e.target.value)} variant="variant-1" value={imageUrl} />}
                     <span onClick={handleAddImageUrl}>{showInput ? "Add" : "Add Url"}</span>
                  </div>
               </div>
            </div>
         </div>
         {/* <button className="mt-4" onClick={handleSubmit}>
            Submit
         </button> */}
      </div>
   );
}

const mapDispatchToProps = (dispatch) => {
   return {
      showNotification: (message) => dispatch(showNotification(message))
   }
}

export default connect(null, mapDispatchToProps)(SingleImageComponent);
