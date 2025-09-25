import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
// import { useAuthContext } from '../context/AuthContext'

const RootLayout = () => {
  // const {user} = useAuthContext();
  // console.log(user);
  
    return(
    <div className='min-h-screen w-screen'>
      <Outlet/>
    </div>
  );

}

export default RootLayout
