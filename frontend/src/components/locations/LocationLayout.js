import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom';
import Button from '../button/Button';
import './Locations.css';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../../redux/location/locationActions';
import { connect } from 'react-redux'

function LocationLayout({ location, getLocations }) {

   const navigate = useNavigate()

   useEffect(() => {
      async function fetchLocations() {
         try {
            await getLocations();
            console.log('locations are fetched in the useEffect location page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchLocations();
   }, []);


   return (
      <div className='backend-container location-container'>
         <div className="d-flex align-items-center justify-content-between">
            <h2>Locations</h2>
            <Button className="btn-2 primary" onClick={() => navigate('/locations/add')}>Add Location</Button>
         </div>
         <hr />
         <Outlet context={{ locationData: location }} />
      </div>
   )
}

const mapStateToProps = (state) => {
   return {
      location: state.location
   }
}

const mapDispathToProps = (dispatch) => {
   return {
      getLocations: () => dispatch(getLocations())
   }
}

export default connect(mapStateToProps, mapDispathToProps)(LocationLayout)
