import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    passWord: "",
  });

  const navigate = useNavigate();

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Backend ke route ke hisaab se URL change kiya
      const res = await axios.post("https://insta-clone-1-y67n.onrender.com/signUp", formData);

      // Backend se aata hai: { msg: "Signup successful", user: newUser }
      alert(res.data.msg || "Registration successful!");

      // Chaaho to user ko localStorage me store bhi kar sakte ho:
      // localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/"); // Login page pe redirect
    } catch (err) {
      console.error("Error:", err);

      if (err.response && err.response.data && err.response.data.msg) {
        alert(err.response.data.msg); // e.g. "User already exists"
      } else {
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-black text-white">
      {/* Instagram Logo / Header */}
      <div className="flex flex-col items-center justify-center w-full md:w-[400px] p-6">
        <h1 className="text-6xl font-bold h-40 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#833ab4]
        bg-clip-text text-transparent select-none">
          Instagram
        </h1>

        {/* Sign Up Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm border border-zinc-700"
        >
          <p className="text-gray-400 text-center mb-4">
            Sign up to see photos and videos from your friends.
          </p>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleForm}
            className="w-full mb-3 p-3 rounded-md bg-zinc-800 border border-zinc-600
            focus:outline-none focus:ring-1 focus:ring-[#405de6] placeholder-gray-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleForm}
            className="w-full mb-3 p-3 rounded-md bg-zinc-800 border border-zinc-600
            focus:outline-none focus:ring-1 focus:ring-[#405de6] placeholder-gray-400"
            required
          />

          {/* ✅ type="password" kiya */}
          <input
            type="password"
            name="passWord"
            placeholder="Password"
            value={formData.passWord}
            onChange={handleForm}
            className="w-full mb-4 p-3 rounded-md bg-zinc-800 border border-zinc-600
            focus:outline-none focus:ring-1 focus:ring-[#405de6] placeholder-gray-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#405de6] py-2 rounded-md font-semibold hover:bg-[#2d4cc9] transition-all h-10"
          >
            Sign Up
          </button>

          <div className="flex items-center justify-between my-4">
            <span className="w-1/3 h-[1px] bg-zinc-600"></span>
            <span className="text-xs text-gray-400">OR</span>
            <span className="w-1/3 h-[1px] bg-zinc-600"></span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full text-[#1877f2] font-semibold hover:underline"
          >
            <div className="bg-[#1877f2] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-sm">
              f
            </div>
            Sign up with Facebook
          </button>
        </form>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-md w-full text-center mt-4">
          <p className="text-gray-300 text-sm">
            Have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-[#405de6] hover:underline cursor-pointer"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;