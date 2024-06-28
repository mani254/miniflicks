import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Button from '../button/Button';
import './Banners.css';
import { useNavigate } from 'react-router-dom';
import { getBanners } from '../../redux/banner/bannerActions';
import { connect } from 'react-redux';

function BannerLayout({ banners, getBanners }) {

   const navigate = useNavigate();

   useEffect(() => {
      async function fetchBanners() {
         try {
            await getBanners();
            console.log('Banners are fetched in the useEffect banner page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchBanners();
   }, []);

   return (
      <div className='backend-container banner-container'>
         <div className="d-flex align-items-center justify-content-between">
            <h2>Banners</h2>
            <Button className="btn-2 primary" onClick={() => navigate('/banners/add')}>Add Banner</Button>
         </div>
         <hr />
         <Outlet context={{ bannerData: banners }} />
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      banners: state.banner
   };
};

const mapDispatchToProps = (dispatch) => {
   return {
      getBanners: () => dispatch(getBanners())
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(BannerLayout);
