import React from 'react'
import { NavLink } from 'react-router-dom'

import './Navbar.css';

function Navbar() {
   return (
      <nav className='navbar-container'>
         <div>
            <div className='d-flex align-items-center'>
               <img className="logo" src="/assets/logo.png" alt="logo" />
               <h4 className='m-0'>Miniflicks</h4>
            </div>
            <ul className="nav-links mt-2">
               <li>
                  <NavLink to="/">Frontend</NavLink>
               </li>
               <li>
                  <NavLink to="/dashboard">Dashboard</NavLink>
               </li>
               <li>
                  <NavLink to="/locations">Locations</NavLink>
               </li>
               <li>
                  <NavLink to="/cities">Cities</NavLink>
               </li>
               <li>
                  <NavLink to="/screens">Screens</NavLink>
               </li>
               <li>
                  <NavLink to="/banners">Banners</NavLink>
               </li>
               <li>
                  <NavLink to="/orders">Orders</NavLink>
               </li>
               <li>
                  <NavLink to="/addons">Addons</NavLink>
               </li>
               <li>
                  <NavLink to="/customers">Customers</NavLink>
               </li>
               <li>
                  <NavLink to="/Admins">Customers</NavLink>
               </li>
            </ul>
         </div>

         <div className="admin-wrapper d-flex align-items-center justify-content-center">
            <p>AdminName</p>
            <img src="/assets/profile.png" alt-="profile-image" />
         </div>
      </nav>
   )
}

export default Navbar
