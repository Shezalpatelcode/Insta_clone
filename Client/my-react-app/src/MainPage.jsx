
// MainPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./SideBar";
import { useNavigate } from "react-router-dom";

const API = "https://insta-clone-1-y67n.onrender.com";

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  // COMMENTS
  const [commentsMap, setCommentsMap] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // STORIES
  const [stories, setStories] = useState([]);
  const [storyUrl, setStoryUrl] = useState("");
  const [activeStory, setActiveStory] = useState(null); // 🔥 viewer

  const navigate = useNavigate();

  // auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API}/me`, { headers: { Authorization: token } })
      .then((res) => setMe(res.data))
      .catch(() => {});
  }, []);

  // fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/upload`, {
          headers: { Authorization: token },
        });

        setPosts(
          res.data.map((p) => ({
            _id: p._id,
            ImgUrl: p.imgUrl,
            name: p.user?.name || "user",
            likeCount: p.likeCount || 0,
            commentsCount: p.commentsCount || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/stories`, {
        headers: { Authorization: token },
      });
      setStories(res.data);
    };

    fetchStories();
  }, []);

  // upload story
  const uploadStory = async () => {
    if (!storyUrl) return alert("Enter image URL");

    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/story`,
      { mediaUrl: storyUrl },
      { headers: { Authorization: token } }
    );

    setStoryUrl("");

    const res = await axios.get(`${API}/stories`, {
      headers: { Authorization: token },
    });
    setStories(res.data);
  };

  // like
  const handleLike = async (id) => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API}/like/${id}`,
      {},
      { headers: { Authorization: token } }
    );

    setPosts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, likeCount: res.data.likeCount } : p
      )
    );

    setLikedPosts((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // fetch comments
  const fetchComments = async (postId) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API}/comments/${postId}`, {
      headers: { Authorization: token },
    });

    setCommentsMap((prev) => ({ ...prev, [postId]: res.data }));
    setOpenComments((prev) => ({ ...prev, [postId]: true }));
  };

  // post comment
  const postComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    await axios.post(
      `${API}/comment/${postId}`,
      { text },
      { headers: { Authorization: localStorage.getItem("token") } }
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, commentsCount: p.commentsCount + 1 }
          : p
      )
    );

    fetchComments(postId);
  };

  // auto close story after 5 sec (optional but insta-like)
  useEffect(() => {
    if (activeStory) {
      const t = setTimeout(() => setActiveStory(null), 5000);
      return () => clearTimeout(t);
    }
  }, [activeStory]);

  return (
    <div className="bg-black min-h-screen flex">
      <Sidebar />

      <div className="flex-1 ml-[245px] flex justify-center">
        <div className="w-full max-w-[470px] pt-6 space-y-4">

          {/* ================= STORIES ================= */}
          <div className="bg-[#121212] p-3 rounded-lg">
            <div className="flex gap-4 overflow-x-auto">

              {/* YOUR STORY */}
              <div className="flex flex-col items-center">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
                    className="h-14 w-14 rounded-full"
                    alt="add"
                  />
                </div>
                <input
                  value={storyUrl}
                  onChange={(e) => setStoryUrl(e.target.value)}
                  placeholder="URL"
                  className="text-xs bg-black text-white mt-1 w-16 outline-none"
                />
                <button
                  onClick={uploadStory}
                  className="text-blue-500 text-xs"
                >
                  Add
                </button>
              </div>

              {/* OTHER STORIES */}
              {stories.map((story) => (
                <div
                  key={story._id}
                  onClick={() => setActiveStory(story)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500">
                    <img
                      src={story.mediaUrl}
                      className="h-14 w-14 rounded-full object-cover"
                      alt=""
                    />
                  </div>
                  <p className="text-white text-xs mt-1">
                    {story.user.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <p className="text-gray-400 text-center">Loading...</p>
          )}

          {/* ================= POSTS ================= */}
          {posts.map((post) => (
            <div key={post._id} className="bg-[#121212] rounded-lg">
              <div className="p-3 text-white font-semibold">
                {post.name}
              </div>

              <img
                src={post.ImgUrl}
                alt="post"
                className="w-full aspect-square object-cover"
                onDoubleClick={() => handleLike(post._id)}
              />

              <div className="p-3">
                <p className="text-white font-semibold">
                  {post.likeCount} likes
                </p>

                <p
                  onClick={() => fetchComments(post._id)}
                  className="text-gray-400 text-sm cursor-pointer"
                >
                  View all {post.commentsCount} comments
                </p>

                {openComments[post._id] &&
                  commentsMap[post._id]?.map((c) => (
                    <p key={c._id} className="text-white text-sm">
                      <b>{c.user?.name}</b> {c.text}
                    </p>
                  ))}
              </div>

              <div className="border-t border-gray-800 p-3 flex gap-2">
                <input
                  value={commentInputs[post._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-white outline-none"
                  onKeyDown={(e) =>
                    e.key === "Enter" && postComment(post._id)
                  }
                />
                <button
                  onClick={() => postComment(post._id)}
                  className="text-blue-500 font-semibold"
                >
                  Post
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= STORY VIEWER ================= */}
      {activeStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="absolute top-4 left-4 text-white font-semibold">
            {activeStory.user.name}
          </div>

          <button
            onClick={() => setActiveStory(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>

          <img
            src={activeStory.mediaUrl}
            alt="story"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
      {/* ================= STORY VIEWER END ================= */}
    </div>
  );
};

export default MainPage;