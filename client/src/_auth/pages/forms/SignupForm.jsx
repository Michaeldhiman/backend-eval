import {MdArrowLeft, MdArrowRight} from "react-icons/md"
import {FaEye, FaEyeSlash} from "react-icons/fa"
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {useForm} from "react-hook-form";
import { useAuthContext } from "../../../context/AuthContext";
import Cookies from "js-cookie"

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const {setUser} = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const signup = async(data)=>{
    setLoading(true);
    setError("");
    // set the cookies and the user globally
    try {
      // console.log(data);
      
      let signupData = null;
      // console.log(imageFile);
      
      if(!imageFile){
        // console.log("Hello No file");
        
        signupData = (await axios.post("https://chat-app-server-se59.onrender.com/api/v1/users/create", {...data})).data?.data;
      }else{
        //  console.log("Hello file is there");
        signupData = (await axios.post("https://chat-app-server-se59.onrender.com/api/v1/users/create", {...data, pic:imageFile}, {headers:{
        'content-type': 'multipart/form-data'
      }})).data?.data;
      }
     // If everything wnt well then set the token as cookie and also set the user
     // redirect the user to "/"
     // To check the user is logged in then get the user from backend from jwt auth check
     Cookies.set("chat-app-token", signupData?.token, {expires:2});
     setUser(signupData?.user);
     navigate("/");
    // console.log(signupData);
    
      
    } catch (error) {
      setError(error?.response?.data?.message);
      console.log(error);
    }finally{
      setLoading(false);
    }
    }

  // console.log(errors);

  const handleImagePreview = (e)=>{
    // console.log(e.target.files[0]);
    
    if(e.target.files && e.target.files[0]){
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
    console.log(imagePreview);
    
  }

  // console.log(imagePreview);
  
  


  return (
    <div className='flex-center flex-col gap-2 w-full mt-20 relative h-full'>
      {error && (<p className="absolute px-2 py-3 top-3 w-full text-center text-lg bg-red-500 font-bold rounded-md">{error}</p>)}
        <h3 className='title uppercase text-xl lg:text-4xl'>Create account</h3>
        <form onSubmit={handleSubmit(signup)} className='flex flex-col w-[90%] lg:w-[80%] gap-5'>
          <div className='flex flex-col gap-2 justify-center'>
            <label htmlFor="username" className='text-base lg:text-lg font-semibold'>Username:</label>
            <input
            {...register("username", {
              required:{
                value:true,
                message:"Username is required"
              }
            }) }
            id='username' type="text" placeholder='Jhon Doe' className='bg-slate-700 font-medium outline-none text-white px-3 rounded-lg py-2 xl:px-4 xl:py-3 w-full shadow shadow-slate-600 focus:border focus:border-slate-600' />
            {errors?.username && <p className="text-red-500 text-sm mt-2">{errors?.username.message}</p>}
          </div>
          <div className='flex flex-col gap-2 justify-center'>
            <label htmlFor="email" className='text-base lg:text-lg font-semibold'>Email:</label>
            <input 
            {...register("email", {
              required:{
                value:true,
                message:"Email is required"
              }
            })}
            type="email" id='email' name="email" placeholder='example@gmail.com' className='bg-slate-700 font-medium outline-none text-white xl:px-4 xl:py-3 px-3 rounded-lg py-2 w-full shadow shadow-slate-600 focus:border focus:border-slate-600' />
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
              id="password" name="password" type={showPassword?"text":"password"} placeholder='pass@1234' className='bg-slate-700 xl:px-4 xl:py-3 font-medium outline-none text-white px-3 rounded-lg py-2 w-full shadow shadow-slate-600 focus:border focus:border-slate-600' />
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
          <div className="flex flex-col gap-2 justify-center w-full">
            <label htmlFor="pic" className='text-base lg:text-lg font-semibold'>Profile pic:</label>
            <input  
            type="file" id="pic" name="pic" 
            className="hidden" 
            onChange={(e)=>handleImagePreview(e)}
            />
            <div className="w-full flex justify-center items-center">
              
            {imagePreview? (
              <div className="w-44 h-44 overflow-hidden">
                <img 
                onClick={()=>{
              document.getElementById("pic").click();
            }}
                src={imagePreview} alt="user pic" className="object-cover cursor-pointer" />
              </div>
            ): (
              <button onClick={()=>{
              document.getElementById("pic").click();
            }} type="button" className="bg-blue-500 px-4 cursor-pointer py-3 capitalize rounded-md font-bold w-50">
                upload
            </button>
            )}
            </div>
          </div>
          <div className="w-full flex flex-col gap-3 justify-center">
                <button 
                disabled={loading}
          type='submit'
          className={`w-full px-3 flex-center py-2 xl:px-4 text-center bg-blue-600 transition-all duration-200 text-lg mt-7 rounded-lg font-bold ${loading?"cursor-default":"cursor-pointer hover:bg-blue-700"}`}>
            {loading?"Loading...":(
              <>
              <MdArrowRight className="text-4xl mx-6"/>
            <span className='text-white font-bold '>Sign up</span>
            <MdArrowLeft className="text-4xl mx-6"/>
              </>
            )}
          </button>
          <Link to={"/login"} className="text-blue-500 w-fit hover:underline">Already have an account?</Link>
          </div>
        </form>
    </div>
  )
}

export default SignupForm
