import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { showModal } from '../../redux/modal/modalActions';
import ConfirmationAlert from '../confirmationAlert/ConfirmationAlert.js';
import { deleteBanner, updateBannerStatus } from '../../redux/banner/bannerActions.js';

function Banners({ showModal, deleteBanner, updateBannerStatus }) {

   const navigate = useNavigate();

   const { bannerData } = useOutletContext();

   const alertData = {
      info: 'Are you sure you want to delete this banner?',
      confirmFunction: (bannerId) => {
         deleteBanner(bannerId);
      },
   };

   return (
      <>
         <table className='mt-5'>
            <thead>
               <tr>
                  <th>Heading</th>
                  <th>Redirection</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               {bannerData.banners.length >= 1 && (bannerData.banners.map(banner => (
                  <tr key={banner._id}>
                     <td>{banner.heading}</td>
                     <td>{banner.redirection}</td>
                     <td>
                        <div className='image-wrapper'>
                           <img className="cover" src={`${process.env.REACT_APP_BACKENDURI}/${banner.image}`} alt='banner-image' />
                        </div>
                     </td>
                     <td>
                        <div className={`toggle-switch ${banner.status && 'active'}`} onClick={() => { updateBannerStatus({ _id: banner._id, status: !banner.status }) }}>
                           <div className="toggle-switch-background">
                              <div className="toggle-switch-handle"></div>
                           </div>
                        </div>
                     </td>
                     <td>
                        <span className='icon edit-icon' onClick={() => navigate(`/banners/edit/${banner._id}`)}><FaEdit /></span>
                        <span className='icon delete-icon' onClick={() => showModal({ ...alertData, id: banner._id }, ConfirmationAlert)} ><MdDelete /></span>
                     </td>
                  </tr>
               ))
               )}
            </tbody>
         </table>
         {bannerData.banners.length <= 0 && <h2 className='text-center mt-5'>No Banners Are Added Yet.<br /> Add banners</h2>}
      </>
   );
}

const mapDispatchToProps = (dispatch) => {
   return {
      showModal: (props, component) => dispatch(showModal(props, component)),
      deleteBanner: (bannerId) => dispatch(deleteBanner(bannerId)),
      updateBannerStatus: (_id, status) => dispatch(updateBannerStatus(_id, status))
   };
};

export default connect(null, mapDispatchToProps)(Banners);
