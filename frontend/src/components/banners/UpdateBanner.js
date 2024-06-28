import React, { useState, useEffect } from 'react';
import SingleImageComponent from '../imageComponent/SingleImageComponent';
import { TextInput, TextArea, SelectInput } from '../formComponents/FormComponents';
import Button from '../button/Button';
import { connect } from 'react-redux';
import { updateBanner } from '../../redux/banner/bannerActions';
import { showNotification } from '../../redux/notification/notificationActions';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import validateField from '../../utils/validations';

function UpdateBanner({ updateBanner, showNotification }) {
   const [bannerDetails, setBannerDetails] = useState({
      heading: '',
      content: '',
      redirection: '/',
      image: null,
      position: 1,
      status: true
   });
   const [errors, setErrors] = useState({ heading: '', content: '' });

   const navigate = useNavigate();

   const { bannerData } = useOutletContext()

   const { id } = useParams();

   useEffect(() => {
      console.log(bannerData, 'bannerdata')
      const currentBanner = bannerData.banners.find((banner) => banner._id == id)
      console.log(currentBanner)

      if (!currentBanner) {
         return
      }

      setBannerDetails(currentBanner)
   }, [bannerData]);

   function handleChange(e) {
      const { name, value } = e.target;
      setBannerDetails({ ...bannerDetails, [name]: value });

      if (name !== 'image') {
         let errorMessage = validateField(name, value);
         setErrors({ ...errors, [name]: errorMessage });
      }
   }

   async function handleUpdateBanner() {
      const hasError = Object.values(errors).some(value => value);
      const isEmpty = !bannerDetails.heading || !bannerDetails.content || !bannerDetails.image;
      if (isEmpty) {
         return showNotification('Fill all the details');
      }
      if (hasError) {
         return;
      }
      try {
         await updateBanner(bannerDetails);
         console.log('Banner updated successfully');
         navigate('/banners');
      } catch (error) {
         console.error(error.response ? error.response.data.error : "Network Error");
      }
   }

   return (
      <div className='container add-container'>
         <div className='row'>
            <div className='col-12'>
               <TextInput label="Heading:" name="heading" id="banner-heading" onChange={handleChange} value={bannerDetails.heading} variant='variant-1' required>
                  {errors.heading && <p className='error'>{errors.heading}</p>}
               </TextInput>
            </div>
            <div className='col-lg-12'>
               <TextArea label="Content:" name="content" id="banner-content" onChange={handleChange} value={bannerDetails.content} variant="variant-1" required>
                  {errors.content && <p className='error'>{errors.content}</p>}
               </TextArea>
            </div>
            <div className='col-lg-6'>
               <TextInput label="Redirection:" name="redirection" id="banner-redirection" onChange={handleChange} value={bannerDetails.redirection} variant='variant-1' required />
            </div>
            <div className='col-lg-6'>
               <SelectInput options={[{ value: true, label: 'Active' }, { value: false, label: 'InActive' }]} label="Status:" id="banner-status" defaultValue={bannerDetails.status} variant="variant-1" name="status" onChange={handleChange} required />
            </div>
            <div className='col-lg-6'>
               <TextInput type="number" label="Position:" id="banner-position" Value={bannerDetails.position} variant="variant-1" name="position" onChange={handleChange} required />
            </div>
            <div className='col-lg-12'>
               {bannerDetails.image && <SingleImageComponent setParentDetails={setBannerDetails} parentDetails={bannerDetails} />}
            </div>
            <div className='col-12 text-center'>
               <Button className="btn-2 primary mt-4" onClick={handleUpdateBanner}>Update Banner</Button>
            </div>
         </div>
      </div>
   );
}

const mapDispatchToProps = (dispatch) => {
   return {
      updateBanner: (bannerDetails) => dispatch(updateBanner(bannerDetails)),
      showNotification: (message) => dispatch(showNotification(message))
   };
};

export default connect(null, mapDispatchToProps)(UpdateBanner);
