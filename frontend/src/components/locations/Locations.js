import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { connect } from 'react-redux';

import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

import { showModal } from '../../redux/modal/modalActions';
import ConfirmationAlert from '../confirmationAlert/ConfirmationAlert.js'
import { deleteLocation, updateLocationStatus } from '../../redux/location/locationActions.js';

function Locations({ showModal, deleteLocation, updateLocationStatus }) {

   const navigate = useNavigate()

   const { locationData } = useOutletContext()

   const alertData = {
      info: 'if you Delete the Location all the screens will be un allocated',
      confirmFunction: (locationId) => {
         deleteLocation(locationId)
      },
   }

   return (
      <>
         <table className='mt-5'>
            <tr>
               <th>Name</th>
               <th>Address</th>
               <th>Image</th>
               <th>Status</th>
               <th>Actions</th>
            </tr>
            <tbody>
               {locationData.locations.length >= 1 && (locationData.locations.map(location => (
                  <tr key={location._id}>
                     <td>{location.name}</td>
                     <td>{location.address}</td>
                     <td>
                        <div className='image-wrapper'>
                           <img className="cover" src={`${process.env.REACT_APP_BACKENDURI}/${location.image}`} alt='location-image' />
                        </div>
                     </td>
                     <td>
                        <div className={`toggle-switch ${location.status && 'active'}`} onClick={() => { updateLocationStatus({ _id: location._id, status: !location.status }) }}>
                           <div className="toggle-switch-background">
                              <div className="toggle-switch-handle"></div>
                           </div>
                        </div>
                     </td>
                     <td>
                        <span className='icon edit-icon' onClick={() => navigate(`/locations/edit/${location.name}`)}><FaEdit /></span>
                        <span className='icon delete-icon' onClick={() => showModal({ ...alertData, id: location._id }, ConfirmationAlert)} ><MdDelete /></span>
                     </td>
                  </tr>
               ))
               )}
            </tbody>
         </table>
         {locationData.locations.length <= 0 && <h2 className='text-center mt-5'>No Locations Are Added Yet.<br /> Add locations</h2>}
      </>
   )
}

const mapDipatchToProps = (dispatch) => {
   return {
      showModal: (props, component) => dispatch(showModal(props, component)),
      deleteLocation: (locationId) => dispatch(deleteLocation(locationId)),
      updateLocationStatus: (_id, status) => dispatch(updateLocationStatus(_id, status))
   }
}


export default connect(null, mapDipatchToProps)(Locations)
