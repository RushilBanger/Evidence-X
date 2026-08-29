import { useState } from 'react'
import '../App.css'
import Records from './Records.jsx'
import File from './File.jsx'
import { Link } from 'react-router-dom'
function Main() {
  

  return (
    <>
    <div className="flex flex-col justify-center items-center text-white h-[60vh] gap-3 ">
      <div className="typewriter-flicker font-bold text-5xl flex items-center justify-center gap-2">WELCOME AGENT 47 </div>
      <div className=' mt-5'>
        <File />
      </div>
      <div>
        <button className="text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-13 py-2.5 me-2 mb-2">Scan</button>
      <Link to="/Records"> <button type="button" className="text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-9 py-2.5 me-2 mb-2">Your Scans </button></Link>
      </div>
    </div>
    </>
  )
}

export default Main
