import React from 'react'
import { useNavigate } from 'react-router-dom'

const Notfound = () => {
    const navigate = useNavigate();

    const handlePage = ()  => {
        navigate('/');
    }
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center text-[#e5e7eb] gap-8'>
      <h1 className='text-4xl'>Ooops, Page does not exist.</h1>
      <p className='text-2xl cursor-pointer underline text-orange-600' onClick={handlePage}>Click me to Go back to home</p>
    </div>
  )
}

export default Notfound
