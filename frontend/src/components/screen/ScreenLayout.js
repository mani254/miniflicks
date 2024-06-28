import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Button from '../button/Button';
import './Screens.css';
import { useNavigate } from 'react-router-dom';
import { getScreens } from '../../redux/screen/screenActions';
import { connect } from 'react-redux';

function ScreenLayout({ screen, getScreens }) {
   const navigate = useNavigate();

   useEffect(() => {
      async function fetchScreens() {
         try {
            await getScreens();
            console.log('Screens are fetched in the useEffect screen page');
         } catch (error) {
            console.error(error.response ? error.response.data.error : "Network Error");
         }
      }
      fetchScreens();
   }, []);

   return (
      <div className='backend-container screen-container'>
         <div className="d-flex align-items-center justify-content-between">
            <h2>Screens</h2>
            <Button className="btn-2 primary" onClick={() => navigate('/screens/add')}>Add Screen</Button>
         </div>
         <hr />
         <Outlet context={{ screenData: screen }} />
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      screen: state.screen
   };
};

const mapDispatchToProps = (dispatch) => {
   return {
      getScreens: () => dispatch(getScreens())
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenLayout);
