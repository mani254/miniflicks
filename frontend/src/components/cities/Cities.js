import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import './Cities.css';

import Button from '../button/Button';
import ConfirmationAlert from '../confirmationAlert/ConfirmationAlert.js'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import { addCity, getCities, updateCity, deleteCity } from '../../redux/city/cityActions.js';
import { showModal } from '../../redux/modal/modalActions.js'
import { TextInput, FileInput, SelectInput } from '../formComponents/FormComponents.js';


function Cities({ addCity, citiesData, getCities, updateCity, deleteCity, showModal }) {
   const [isAddCityVisible, setAddCityVisible] = useState(false);
   const [isUpdateCityVisible, setUpdateCityVisible] = useState(false);
   const [cityDetails, setCityDetails] = useState({ id: '', name: '', image: '', status: true });


   const alertData = {
      info: 'if you Delete the City all the locations and screens under city are unallocated',
      confirmFunction: (cityId) => {
         deleteCity(cityId)
      },
   }

   useEffect(() => {
      async function fetchCities() {
         try {
            await getCities();
            console.log('Cities are fetched in the useEffect city page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchCities();
   }, []);


   function handleChange(e) {
      const { name, value } = e.target;
      setCityDetails({ ...cityDetails, [name]: value });
   }

   function handleImageChange(e) {
      const file = e.target.files[0];
      if (file) {
         const formData = new FormData();
         formData.append('image', file);
         setCityDetails({ ...cityDetails, image: formData });
      }
   }

   function handleStatusUpdate(city) {
      const updatedCity = { ...city, id: city._id, status: !city.status };
      console.log(updatedCity)
      updateCity(updatedCity)
         .then((res) => {
            console.log(res, 'response for status Update')
         })
         .catch(error => {
            console.error('Error while updating city status:', error.response ? error.response.data.error : "Network Error");
         });
   }

   async function handleAddCity() {
      try {
         await addCity({ name: cityDetails.name, image: cityDetails.image.get('image'), status: cityDetails.status });
         setAddCityVisible(false);
         setCityDetails({ ...cityDetails, name: '', status: true });
      } catch (err) {
         console.log(err.message)
         console.error('Error while adding the City:', err.response ? err.response.data.error : "Network Error");
      }
   }

   async function handleUpdateCity() {
      let imageValue = cityDetails.image;
      if (cityDetails.image instanceof File) {
         imageValue = cityDetails.image.get('image');
      }
      try {
         await updateCity({ id: cityDetails.id, name: cityDetails.name, image: imageValue, status: cityDetails.status });
         setAddCityVisible(false);
         setUpdateCityVisible(false);
         setCityDetails({ ...cityDetails, name: '', status: true });
      } catch (error) {
         console.error('Error while updating the City:', error.response ? error.response.data.error : "Network Error");
      }
   }

   function updateCityFun(city) {
      setCityDetails({ id: city._id, ...city });
      setUpdateCityVisible(true);
      setAddCityVisible(false);
   }

   return (
      <div className='backend-container city-container'>
         <div className="d-flex align-items-center justify-content-between">
            <h2>Cities</h2>
            <Button className="btn-2 primary" onClick={() => { setAddCityVisible(!isAddCityVisible); setUpdateCityVisible(false); setCityDetails({ id: '', name: '', image: '', status: true }) }}>Add City</Button>
         </div>
         <hr />

         <table className='mt-5'>
            <thead>
               <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
               </tr>
            </thead>

            <tbody>
               {citiesData.cities.length >= 1 && (
                  <>
                     {citiesData.cities.map(city => (
                        <tr key={city._id}>
                           <td>{city.name}</td>
                           <td>
                              <div className='image-wrapper'>
                                 <img className="cover" src={`${process.env.REACT_APP_BACKENDURI}/${city.image}`} alt='city-image' />
                              </div>
                           </td>
                           <td>
                              <div className={`toggle-switch ${city.status && 'active'}`} onClick={() => handleStatusUpdate(city)}>
                                 <div className="toggle-switch-background">
                                    <div className="toggle-switch-handle"></div>
                                 </div>
                              </div>
                           </td>
                           <td>
                              <span className='icon edit-icon' onClick={() => updateCityFun(city)}><FaEdit /></span>
                              <span className='icon delete-icon' onClick={() => showModal({ ...alertData, id: city._id }, ConfirmationAlert)} ><MdDelete /></span>
                           </td>
                        </tr>
                     ))}
                  </>
               )}

               {(isAddCityVisible || isUpdateCityVisible) && (
                  <tr className='addcity-border'>
                     <td>
                        <TextInput type="text" id="city-name" name="name" label="city-Name:" value={cityDetails.name} variant="variant-1" onChange={handleChange} required />
                     </td>
                     <td>
                        <FileInput label="upload-image:" id="upload-image" type="file" variant="variant-2" onChange={handleImageChange} />
                     </td>
                     <td>
                        <SelectInput options={[{ value: true, label: 'Active' }, { value: false, label: 'InActive' }]} label="Status:" id="city-status" defaultValue={cityDetails.status} variant="variant-1" name="status" onChange={handleChange} required />
                     </td>
                     <td>
                        {isAddCityVisible && !isUpdateCityVisible && <Button className='btn-2 primary' onClick={handleAddCity}>Add</Button>}
                        {isUpdateCityVisible && < Button className='btn-2 primary' onClick={handleUpdateCity}>Update</Button>}
                     </td>
                  </tr>
               )}

            </tbody>

         </table>

         {citiesData.cities.length <= 0 && <h2 className='text-center mt-5'>No Cities Are Added Yet.<br /> Add cities</h2>}
      </div >
   );
}

const mapStateToProps = (state) => ({
   citiesData: state.city
});

const mapDispatchToProps = (dispatch) => ({
   addCity: (cityDetails) => dispatch(addCity(cityDetails)),
   getCities: () => dispatch(getCities()),
   updateCity: (cityDetails) => dispatch(updateCity(cityDetails)),
   deleteCity: (cityId) => dispatch(deleteCity(cityId)),
   showModal: (props, component) => dispatch(showModal(props, component))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cities);
