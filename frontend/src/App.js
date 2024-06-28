import React from 'react';

import { Routes, Route } from 'react-router-dom'
import { connect } from 'react-redux';
import axios from 'axios';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import Modal from './components/modal/Modal';
import Notification from './components/notification/Notification';

import LoginPage from './pages/LoginPage';
import AdminLayout from './components/adminLayout/AdminLayout.js';
import MainPage from './pages/MainLayout.js';
import Dashboard from './components/dashboard/Dashboard.js';

import Cities from './components/cities/Cities.js';

import LocationLayout from './components/locations/LocationLayout.js';
import Locations from './components/locations/Locations.js';
import AddLocation from './components/locations/AddLocation.js';
import UpdateLocation from './components/locations/UpdateLocation.js';

import Banners from './components/banners/Banners.js';
import BannerLayout from './components/banners/BannerLayout.js';
import AddBanner from './components/banners/AddBanner.js';
import UpdateBanner from './components/banners/UpdateBanner.js';

import Screens from './components/screen/Screens.js';
import ScreenLayout from './components/screen/ScreenLayout.js';
import AddScreen from './components/screen/AddScreen.js';
import UpdateScreen from './components/screen/UpdateScreen.js';


import Homepage from './pages/Homepage.js';


function App({ modal }) {
   axios.defaults.withCredentials = true;

   return (

      <div className="App">
         <Notification />
         <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainPage></MainPage>} >
               <Route index element={<Homepage />}></Route>
            </Route>
            <Route path="/" element={<AdminLayout />}>
               <Route path="dashboard" element={<Dashboard />} />
               <Route path="locations" element={<LocationLayout />}>
                  <Route index element={<Locations />}></Route>
                  <Route path="add" element={<AddLocation />}></Route>
                  <Route path="edit/:name" element={<UpdateLocation />}></Route>
               </Route>
               <Route path="banners" element={<BannerLayout />}>
                  <Route index element={<Banners />}></Route>
                  <Route path="add" element={<AddBanner />}></Route>
                  <Route path="edit/:id" element={<UpdateBanner />}></Route>
               </Route>
               <Route path="screens" element={<ScreenLayout />}>
                  <Route index element={<Screens />}></Route>
                  <Route path="add" element={<AddScreen />} />
                  <Route path="edit/:name" element={<UpdateScreen />} />
               </Route>
               <Route path="cities" element={<Cities />} />
            </Route>
         </Routes>

         {console.log(modal.modalComponent, modal.modalProps)}

         {modal.showModal && <Modal props={modal.modalProps} component={modal.modalComponent} />}

      </div >

   );
}



const mapStateToProps = (state) => {
   return {
      modal: state.modal
   }
}




export default connect(mapStateToProps, null)(App)
