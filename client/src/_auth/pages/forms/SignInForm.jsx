import {MdArrowLeft, MdArrowRight} from "react-icons/md"
import {FaEye, FaEyeSlash} from "react-icons/fa"
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {useForm} from "react-hook-form";
import { useAuthContext } from "../../../context/AuthContext";
import Cookies from "js-cookie";

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {setUser} = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const signIn = async(data)=>{
    console.log(data);
    
    setLoading(true);
    setError("");
    // set the cookies and the user globally
    try {
      console.log(data);
    
        const signInData = (await axios.post("https://chat-app-server-se59.onrender.com/api/v1/users/login", {...data}, {headers:{
        'content-type': 'multipart/form-data'
      }})).data?.data;
     // If everything wnt well then set the token as cookie and also set the user
     // redirect the user to "/"
     // To check the user is logged in then get the user from backend from jwt auth check

      // console.log(signInData);
      

     Cookies.set("chat-app-token", signInData?.token, {expires:2});
     setUser(signInData?.user);
     navigate("/");
      
    } catch (error) {
      setError(error?.response?.data?.message);
      console.log(error);
    }finally{
      setLoading(false);
    }
    }

  // console.log(errors);

  // console.log(imagePreview);
  
  


  return (
    <div className='flex-center flex-col gap-2 w-full mt-20 relative h-full'>
      {error && (<p className="absolute px-2 py-3 top-3 w-full text-center text-lg bg-red-500 font-bold rounded-md">{error}</p>)}
        <h3 className='title uppercase text-xl lg:text-4xl'>Login</h3>
        <form onSubmit={handleSubmit(signIn)} className='flex flex-col w-[90%] lg:w-[80%] gap-5'>
          
          <div className='flex flex-col gap-2 justify-center'>
            <label htmlFor="email" className='text-base lg:text-lg font-semibold'>Email:</label>
            <input 
            {...register("email", {
              required:{
                value:true,
                message:"Email is required"
              }
            })}
            type="email" id='email' placeholder='example@gmail.com' className='bg-slate-700 font-medium outline-none text-white xl:px-4 xl:py-3 px-3 rounded-lg py-2 w-full shadow shadow-slate-600 focus:border focus:border-slate-600' />
          {errors?.email && <p className="text-red-500 text-sm mt-2">{errors?.email.message}</p>}
          </div>
          <div className='flex flex-col gap-2 justify-center'>
            <label htmlFor="password" className='text-base lg:text-lg font-semibold'>Password:</label>
            <div className="w-full relative">
              <input 
              {...register("password", {
              required:{
                value:true,
                message:"Password is required"
              }
            })}
              id="password" type={showPassword?"text":"password"} placeholder='pass@1234' className='bg-slate-700 xl:px-4 xl:py-3 font-medium outline-none text-white px-3 rounded-lg py-2 w-full shadow shadow-slate-600 focus:border focus:border-slate-600' />
              {showPassword?(
                <FaEye
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-5 text-2xl top-3 cursor-pointer"/>
              ):(<FaEyeSlash
              onClick={()=>setShowPassword(!showPassword)} 
              className="absolute right-5 text-2xl top-3 cursor-pointer"
              />)}
            </div>
            {errors?.password && <p className="text-red-500 text-sm mt-2">{errors?.password.message}</p>}
          </div>
          
          <div className="w-full flex flex-col gap-3 justify-center">
                <button 
                disabled={loading}
          type='submit'
          className={`w-full px-3 flex-center py-2 xl:px-4 text-center bg-blue-600 transition-all duration-200 text-lg mt-7 rounded-lg font-bold ${loading?"cursor-default":"cursor-pointer hover:bg-blue-700"}`}>
            {loading?"Loading...":(
              <>
              <MdArrowRight className="text-4xl mx-6"/>
            <span className='text-white font-bold '>Login</span>
            <MdArrowLeft className="text-4xl mx-6"/>
              </>
            )}
          </button>
          <Link to={"/signup"} className="text-blue-500 w-fit hover:underline">Don't have an account?</Link>
          </div>
        </form>
    </div>
  )
}

export default SignInForm;
