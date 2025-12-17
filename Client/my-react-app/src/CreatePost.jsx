// CreatePost.jsx
import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./SideBar";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://adasuinahgiqhznckjtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYXN1aW5haGdpcWh6bmNranR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTAwMDgsImV4cCI6MjA3OTUyNjAwOH0.EFwb-DDta2qDPEENRi_xDhWFNQC7LPnHnsSIEziQBg0";

const supabase = createClient(supabaseUrl, supabaseKey);

const CreatePost = () => {
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImg(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // local preview
    } else {
      setPreview("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      navigate("/");
      return;
    }

    if (!img) {
      alert("Please select an image first!");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Supabase storage upload
      const filePath = `Insta_images/${Date.now()}_${img.name}`;

      const { data, error } = await supabase.storage
        .from("Insta") // bucket name
        .upload(filePath, img, { upsert: true });

      if (error) throw error;

      // 2️⃣ Public URL create
      const imgUrl = `${supabaseUrl}/storage/v1/object/public/Insta/${filePath}`;
      console.log("Image URL:", imgUrl);

      // 3️⃣ Apne backend ko call karo
      const res = await axios.post(
        "http://localhost:4000/upload",
        { imgUrl },
        {
          headers: {
            Authorization: localStorage.getItem("token"), // ya "Bearer " + token agar backend me aisa hai
          },
        }
      );

      console.log("Backend response:", res.data);
      alert("Post uploaded successfully! ✅");

      setImg(null);
      setPreview("");
      navigate("/home");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Error uploading image. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex text-white">
      <Sidebar />

      <div className="flex-1 ml-[245px] flex items-center justify-center">
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Create New Post
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Choose Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#405de6] file:text-white
                  hover:file:bg-[#2d4cc9]"
              />
            </div>

            {preview && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Preview</p>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full rounded-lg object-cover max-h-72 border border-zinc-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#405de6] py-2 rounded-md font-semibold hover:bg-[#2d4cc9] transition-all disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Post"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Image will be uploaded to Supabase & linked in your feed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;