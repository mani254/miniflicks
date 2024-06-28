import React, { useState, useEffect } from 'react'
import SingleImageComponent from '../imageComponent/SingleImageComponent'
import { TextInput, SelectInput, TextArea } from '../formComponents/FormComponents'
import Button from '../button/Button'
import validateField from '../../utils/validations'
import { getLocations } from '../../redux/location/locationActions.js'
import { connect } from 'react-redux'
import { addScreen } from '../../redux/screen/screenActionTypes.js'
import { showNotification } from '../../redux/notification/notificationActions.js'
import { useNavigate } from 'react-router-dom'
import { getLocations } from '../../redux/location/locationActions.js'


function AddScreen({ location, getLocations, addScreen, showNotification }) {
   const [screenDetails, setScreenDetails] = useState({ name: '', smallDescription: '', longDescription: '', allowed: '', price: '', capacity: '', extraPrice: '', location: '' })
   const [customizedSlots, setCustomizedSlots] = useState()
   const [slotDetails, setSlotDetails] = useState({ startTime:'', endTime:''})

   const [errors, setErrors] = useState({ name: '', smallDescription: '', longDescription: '', price: '', extraPrice: '' });
   const [locations, setLocations] = useState([])

   const navigate = useNavigate()

   useEffect(() => {
      async function fetchLocations() {
         console.log('--fetching locations form add screen component')
         try {
            await getLocations();
            console.log('locations are fetched in the useEffect screen page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchLocations();
   }, []);

   useEffect(() => {
      if (location.locations.length <= 0) {
         return
      }
      const options = location.locations.map((location, index) => {
         return { value: location._id, label: location.name }
      })
      setLocations(options)
      setScreenDetails({ ...screenDetails, location: location.locations[0]._id })
   }, [location])

   function handleChage(e) {
      const { name, value } = e.target;
      setScreenDetails({ ...screenDetails, [name]: value });
   }

   function handleSlotChange(e) {
      const { name, value } = e.target

      setCustomizedSlots({})
   }

}

const mapStateToProps = (state) => {
   return {
      location: state.location,
      screen: state.screen
   }
}
const mapDispatchToProps = (dispatch) => {
   return {
      getLocations: () => dispatch(getLocations()),
      addScreen: (screenDetails) => dispatch(addScreen(screenDetails)),
      showNotification: (message) => dispatch(showNotification(message))
   }
}
export default connect(mapStateToProps, mapDispatchToProps)(AddScreen)
