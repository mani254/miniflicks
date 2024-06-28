import React, { useState } from 'react';
import SingleImageComponent from '../imageComponent/SingleImageComponent';
import { TextInput, TextArea, SelectInput } from '../formComponents/FormComponents';
import Button from '../button/Button';
import validateField from '../../utils/validations';
import { connect } from 'react-redux';
import { addBanner } from '../../redux/banner/bannerActions';
import { showNotification } from '../../redux/notification/notificationActions';
import { useNavigate } from 'react-router-dom';

function AddBanner({ addBanner, showNotification }) {
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

   function handleChange(e) {
      const { name, value } = e.target;
      setBannerDetails({ ...bannerDetails, [name]: value });

      if (name !== 'image') {
         let errorMessage = validateField(name, value);
         setErrors({ ...errors, [name]: errorMessage });
      }
   }

   async function handleAddBanner() {
      const hasError = Object.values(errors).some(value => value);
      const isEmpty = Object.values(bannerDetails).some(value => !value);

      if (isEmpty) {
         return showNotification('Fill all the details');
      }
      if (hasError) {
         return;
      }
      try {
         await addBanner(bannerDetails);
         console.log('Banner added successfully');
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
               <SingleImageComponent setParentDetails={setBannerDetails} parentDetails={bannerDetails} />
            </div>
            <div className='col-12 text-center'>
               <Button className="btn-2 primary mt-4" onClick={handleAddBanner}>Add Banner</Button>
            </div>
         </div>
      </div>
   );
}

const mapDispatchToProps = (dispatch) => {
   return {
      addBanner: (bannerDetails) => dispatch(addBanner(bannerDetails)),
      showNotification: (message) => dispatch(showNotification(message))
   };
};

export default connect(null, mapDispatchToProps)(AddBanner);
