import React from 'react'
import MainHeader from '../components/header/MainHeader'
import { Outlet } from 'react-router-dom'
function MainPage() {
   return (
      <>
         <MainHeader />
         <Outlet />
      </>
   )
}

export default MainPage
