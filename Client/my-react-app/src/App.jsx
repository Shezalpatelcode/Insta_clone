// import React, { useState } from "react";
// import axios from "axios";
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://adasuinahgiqhznckjtt.supabase.co";
// const supabaseKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYXN1aW5haGdpcWh6bmNranR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTAwMDgsImV4cCI6MjA3OTUyNjAwOH0.EFwb-DDta2qDPEENRi_xDhWFNQC7LPnHnsSIEziQBg0";
// const supabase = createClient(supabaseUrl, supabaseKey);

// const Upload = () => {
//   const [Img, setImg] = useState(null);

//   const handleFileChange = (e) => {
//     setImg(e.target.files[0]);
//   };

//   async function save() {
//     if (!Img) {
//       alert("Please select an image first!");
//       return;
//     }

//     try {
//       // 1️⃣ Upload image to Supabase
//         const { Insta, error } = await supabase.storage
//   .from("insta")
//   .upload("insta_images/" + Img.name, Img, { upsert: true });

//       if (error) throw error;

//       // 2️⃣ Get public URL
//       const imageUrl = `${supabaseUrl}/storage/v1/object/public/data/insta_images/${Img.name}`;
//       console.log("Image URL:", imageUrl);

//       // 3️⃣ Send metadata to backend
//      await axios.post(
//   "http://localhost:4001/upload",
//   {
//     name: Img.name,
//     ImgUrl: imageUrl,
//     user: localStorage.getItem("userEmail")
//   },
//   {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`
//     }
//   }
// );


//       alert("✅ Image uploaded and saved successfully!");
//       setImg(null);
//     } catch (err) {
//       console.error("❌ Upload failed:", err);
//       alert("Error uploading image. Check console for details.");
//     }
//   }

//   return (
//     <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-4">
//       <input type="file" onChange={handleFileChange} className="border p-2 rounded" />
//       <button
//         onClick={save}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Upload
//       </button>
//     </div>
//   );
// };

// export default Upload;


import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import SignUp from './SignUp'
import MainPage from './MainPage'
import CreatePost from './CreatePost'   // ← NEW IMPORT
import Profile from './Profile'

const App = () => {
  return (
    <div>
      <Routes>

        {/* Default page should be login */}
        <Route path='/' element={<Login />} />

        {/* Signup page */}
        <Route path='/signup' element={<SignUp />} />

        {/* Main Instagram feed */}
        <Route path='/home' element={<MainPage />} />

        {/* ⭐ Create Post Page */}
        <Route path='/create' element={<CreatePost />} />
        <Route path='/profile' element={<Profile />} />


      </Routes>
    </div>
  )
}

export default App


