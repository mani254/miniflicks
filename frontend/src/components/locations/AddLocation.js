import React, { useState, useEffect } from 'react'
import SingleImageComponent from '../imageComponent/SingleImageComponent'
import { TextInput, SelectInput, TextArea } from '../formComponents/FormComponents'
import Button from '../button/Button'
import validateField from '../../utils/validations'
import { getCities } from '../../redux/city/cityActions.js'
import { connect } from 'react-redux'
import { addLocation } from '../../redux/location/locationActions.js'
import { showNotification } from '../../redux/notification/notificationActions.js'
import { useNavigate } from 'react-router-dom'

function AddLocation({ city, getCities, addLocation, showNotification }) {

   const [locationDetails, setLocationDetails] = useState({ name: '', address: '', image: null, status: true, location: '', city: '' })
   const [errors, setErrors] = useState({ name: '', address: '', location: '' });
   const [cities, setCities] = useState([])

   const navigate = useNavigate()

   useEffect(() => {
      async function fetchCities() {
         console.log('--fetching citeis form add location component')
         try {
            await getCities();
            console.log('Cities are fetched in the useEffect city page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchCities();
   }, []);

   useEffect(() => {
      if (city.cities.length <= 0) {
         return
      }
      const options = city.cities.map((city, index) => {
         return { value: city._id, label: city.name }
      })
      setCities(options)
      setLocationDetails({ ...locationDetails, city: city.cities[0]._id })

   }, [city])


   function handleChange(e) {
      const { name, value } = e.target;
      setLocationDetails({ ...locationDetails, [name]: value });

      if (name !== 'image') {
         let errorMessage = validateField(name, value);
         setErrors({ ...errors, [name]: errorMessage });
      }
   }

   async function handleAddLocation() {
      const hasError = Object.values(errors).some(value => value);
      const isEmphty = Object.values(locationDetails).some(value => !value)

      console.log(isEmphty, 'isEmphty')
      console.log(hasError, 'hasError')

      if (isEmphty) {
         return showNotification('Fill all the Details')
      }
      if (hasError) {
         return
      }
      try {
         await addLocation(locationDetails);
         console.log('location added sucefully');
         navigate('/locations')
      } catch (error) {
         console.error(error.response ? error.response.data.error : "Network Error");
      }
   }

   return (
      <div className='container add-container'>
         <div className='row'>
            <div className='col-12'>
               <TextInput label="Location Name:" name="name" id="location-name" onChange={handleChange} value={locationDetails.name} variant='variant-1' required >
                  {errors.name && <p className='error'>{errors.name}</p>}
               </TextInput>
            </div>
            <div className='col-lg-6'>
               <SelectInput options={cities} label="City:" id="city-name" defaultValue={locationDetails.city} variant="variant-1" name="city" onChange={handleChange} required />
            </div>
            <div className='col-lg-6'>
               <SelectInput options={[{ value: true, label: 'Active' }, { value: false, label: 'InActive' }]} label="Status:" id="location-status" defaultValue={locationDetails.status} variant="variant-1" name="status" onChange={handleChange} required />
            </div>
            <div className='col-lg-12'>
               <TextArea label="Address:" name="address" id="location-address" onChange={handleChange} value={locationDetails.address} variant="variant-1" required >
                  {errors.address && <p className='error'>{errors.address}</p>}
               </TextArea>
            </div>
            <div className='col-lg-12'>
               <TextArea label="Location-link" name="location" id="location-link" onChange={handleChange} value={locationDetails.location} variant="variant-1" required />
               {errors.location && <p className='error'>{errors.location}</p>}
            </div>
            <div className='col-lg-12'>
               <SingleImageComponent setParentDetails={setLocationDetails} parentDetails={locationDetails} />
            </div>
            <div className='col-12 text-center'>
               <Button className="btn-2 primary mt-4" onClick={handleAddLocation}>Add Location</Button>
            </div>
         </div>
      </div>
   )
}

const mapStateToProps = (state) => {
   return {
      city: state.city,
      location: state.location
   }
}
const mapDispathToProps = (dispatch) => {
   return {
      getCities: () => dispatch(getCities()),
      addLocation: (locationDetails) => dispatch(addLocation(locationDetails)),
      showNotification: (message) => dispatch(showNotification(message))
   }
}

export default connect(mapStateToProps, mapDispathToProps)(AddLocation)
