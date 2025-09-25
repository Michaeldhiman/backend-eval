import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom"
import App from './App.jsx'
import {SignInForm, SignupForm} from "./_auth/pages";
import {Home} from "./_root/pages";
import AuthLayout from './_auth/AuthLayout.jsx'
import RootLayout from './_root/RootLayout.jsx'
import { AuthContextProvider } from './context/index.jsx'



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<AuthContextProvider><App/></AuthContextProvider>}>
      <Route path='' element={<AuthLayout/>}>
        <Route path='/signup' element={<SignupForm/>}/>
        <Route path='/login' element={<SignInForm/>}/>

      </Route>
      <Route path='' element={<RootLayout/>}>
        <Route index element={<Home/>}/>
      </Route>
    </Route>
  )
)


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
