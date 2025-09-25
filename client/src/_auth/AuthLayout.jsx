import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import image from "../assets/form-image.jpg"
import Dots from '../lib/components/Dots'
import { useAuthContext } from '../context/AuthContext'

const AuthLayout = () => {
  const {user} = useAuthContext();
  return user?(<Navigate to={"/"}/>):(
    <div className='w-screen h-screen flex overflow-x-hidden'>
      <div className='w-full xl:w-1/2 flex-center p-4 lg:p-8'>
        <Outlet/>
      </div>
      <div className='w-0 lg:w-1/2 relative overflow-hidden flex-center hidden h-screen xl:flex'>
        <div className='w-full h-full absolute z-10'>
          <Dots/>
        </div>
        <img src={image} alt='form-image' className='object-fill w-[80%] rounded-t-full shadow-2xl shadow-black/95 rotate-6'/>
      </div>
    </div>
  )
}

export default AuthLayout
