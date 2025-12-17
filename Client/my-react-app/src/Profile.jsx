import React, { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);     // backend se /me
  const [posts, setPosts] = useState([]);     // backend se /my-posts
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔒 Agar token nahi to login pe bhej do
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // 🟢 Profile + posts fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [meRes, postsRes] = await Promise.all([
          axios.get("http://localhost:4000/me", {
            headers: { Authorization: token },
          }),
          axios.get("http://localhost:4000/my-posts", {
            headers: { Authorization: token },
          }),
        ]);

        setUser(meRes.data);
        setPosts(
          postsRes.data.map((p) => ({
            _id: p._id,
            ImgUrl: p.imgUrl, // backend field -> frontend ImgUrl
          }))
        );
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex text-white">
        <Sidebar />
        <div className="flex-1 ml-[245px] flex items-center justify-center">
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black min-h-screen flex text-white">
        <Sidebar />
        <div className="flex-1 ml-[245px] flex items-center justify-center">
          <p className="text-gray-400">User not found.</p>
        </div>
      </div>
    );
  }

  // Backend se aaya user
  const {
    name,
    email,
    followersCount,
    followingCount,
  } = user;

  const postsCount = posts.length;

  return (
    <div className="bg-black min-h-screen flex text-white">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-[245px] px-8 py-10">

        {/* TOP SECTION */}
        <div className="flex gap-14 items-center mb-10">
          {/* Profile Picture */}
          <div className="rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-pink-600">
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`}
              className="w-36 h-36 rounded-full bg-black p-[2px]"
              alt="profile"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-light">{name}</h2>
              <button className="bg-[#262626] px-4 py-1 rounded text-sm">
                Edit profile
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-3 text-sm">
              <p>
                <span className="font-semibold">{postsCount}</span> posts
              </p>
              <p>
                <span className="font-semibold">{followersCount}</span> followers
              </p>
              <p>
                <span className="font-semibold">{followingCount}</span> following
              </p>
            </div>

            {/* Bio */}
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-gray-300 text-sm">{email}</p>
            <p className="text-gray-400 text-sm mt-1">
              Building Website | Student | OTA 👨‍🏫
            </p>
          </div>
        </div>

        {/* LINE */}
        <div className="border-t border-[#262626] w-full"></div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 text-xs uppercase tracking-widest text-gray-400 mt-4 mb-4">
          <button className="flex gap-1 items-center text-white border-t border-white pt-2">
            <svg
              aria-label="Posts"
              fill="currentColor"
              height="12"
              viewBox="0 0 24 24"
              width="12"
            >
              <rect
                fill="none"
                height="18"
                width="18"
                x="3"
                y="3"
                stroke="currentColor"
                strokeWidth="2"
              ></rect>
              <line
                stroke="currentColor"
                strokeWidth="2"
                x1="3"
                x2="21"
                y1="9"
                y2="9"
              ></line>
              <line
                stroke="currentColor"
                strokeWidth="2"
                x1="3"
                x2="21"
                y1="15"
                y2="15"
              ></line>
              <line
                stroke="currentColor"
                strokeWidth="2"
                x1="9"
                x2="9"
                y1="3"
                y2="21"
              ></line>
              <line
                stroke="currentColor"
                strokeWidth="2"
                x1="15"
                x2="15"
                y1="3"
                y2="21"
              ></line>
            </svg>
            Posts
          </button>
        </div>

        {/* POSTS GRID */}
        {postsCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="border-2 border-gray-500 rounded-full p-6 mb-4">
              <svg
                aria-label="New post"
                fill="currentColor"
                height="40"
                role="img"
                viewBox="0 0 24 24"
                width="40"
              >
                <path
                  d="M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Zm-1 14H4V6h16Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
                <path
                  d="M12 8v8m-4-4h8"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <p className="text-sm font-semibold">Share Photos</p>
            <p className="text-xs mt-1">
              When you share photos, they will appear on your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4">
            {posts.map((post, i) => (
              <div key={post._id || i} className="group relative cursor-pointer">
                <img
                  src={post.ImgUrl}
                  className="w-full h-full object-cover aspect-square"
                  alt="post"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition">
                  <span className="flex items-center text-lg gap-2">
                    ❤️ {Math.floor(Math.random() * 200)}
                  </span>
                  <span className="flex items-center text-lg gap-2">
                    💬 {Math.floor(Math.random() * 50)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;