import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", passWord: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Backend ke port & route ke hisaab se URL change kiya
      const res = await axios.post("https://insta-clone-1-y67n.onrender.com/login", formData);

      if (res.data.token) {
        // ✅ Abhi ke liye simple localStorage use kar rahe hain
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert(res.data.msg || "Login successful!");
        navigate("/home"); // ya "/" agar tumhara home route wo hai
      } else {
        alert(res.data.msg || "Login failed!");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        alert(err.response.data.msg); // "User not found", "Invalid credentials", etc.
      } else {
        alert("Login error!");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-black text-white ">
      <div className="flex flex-col items-center justify-center w-full md:w-[400px] h-100">
        <h1 className="text-6xl h-40 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#833ab4] bg-clip-text text-transparent select-none">
          Instagram
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm border border-zinc-700"
        >
          <input
            type="email"
            name="email"
            placeholder="Phone number, username, or email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-md bg-zinc-800 border border-zinc-600
             focus:outline-none focus:ring-1 focus:ring-[#405de6] placeholder-gray-400"
            required
          />

          <input
            type="password"
            name="passWord"
            placeholder="Password"
            value={formData.passWord}
            onChange={handleChange}
            className="w-full mb-4 p-3 rounded-md bg-zinc-800 border border-zinc-600
             focus:outline-none focus:ring-1 focus:ring-[#405de6] placeholder-gray-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#405de6] py-2 rounded-md font-semibold hover:bg-[#2d4cc9] transition-all h-10"
          >
            Log In
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
            <h1 className="text-bold text-blue-900 font-bold text-lg bg-blue-600 w-[20px] text-center">
              f
            </h1>
            Log in with Facebook
          </button>

          <p className="text-sm text-gray-400 text-center mt-4">
            Forgotten your password?{" "}
            <span
              className="text-[#1877f2] hover:underline cursor-pointer"
              onClick={() => navigate("/forget")}
            >
              Click here
            </span>
          </p>
        </form>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-md w-full text-center">
          <p className="text-gray-300 text-sm">
            Don’t have an account?{" "}
            <Link to="/SignUp" className="text-[#405de6] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;