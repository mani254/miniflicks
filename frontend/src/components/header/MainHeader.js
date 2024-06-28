import React from 'react'
import './MainHeader.css'
import Button from '../button/Button'
import { NavLink } from 'react-router-dom'

function MainHeader() {
   return (
      <header>
         <div className='main-header container d-flex align-items-center justify-content-between m-auto'>
            <div className='logo'>
               <img src="assets/logo.png" alt="miniflicks-logo"></img>
            </div>

            <ul className='nav-links d-flex p-0'>
               <li><NavLink to="/">Home</NavLink></li>
               <li><NavLink to="About">About</NavLink></li>
               <li><NavLink to="Gallery">Gallery</NavLink></li>
            </ul>

            <Button>Book Now</Button>

         </div >
      </header >
   )
}

export default MainHeader
