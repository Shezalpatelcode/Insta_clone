import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [followingSet, setFollowingSet] = useState(new Set()); // local tracking of who we follow

  // optional: get current user id from token if you store it separately
  // const currentUserId = localStorage.getItem("userId") || null;

  const isActive = (path) =>
    location.pathname === path ? "font-semibold" : "font-normal";

  // SEARCH (debounced naive)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (!showSearch) return;
      doSearch(query);
    }, 250); // 250ms debounce
    return () => clearTimeout(handle);
  }, [query, showSearch]);

  const doSearch = async (text) => {
    if (!text || !text.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      // backend expects POST /search?q=...
      const res = await axios.post(
        `https://insta-clone-1-y67n.onrender.com/search?q=${encodeURIComponent(text)}`
      );

      // your backend returns { msg: [...] }
      const users = res.data?.msg || [];

      setResults(users);

      // Optional: if backend includes followers list for each user,
      // we can set followingSet based on whether current user is inside their followers.
      // But since we may not have currentUserId here, we'll rely on follow API response to update UI.
    } catch (err) {
      console.error("SEARCH ERROR:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Follow / Unfollow action
  const handleFollowToggle = async (targetUserId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      navigate("/");
      return;
    }

    try {
      const res = await axios.post(
        `https://insta-clone-1-y67n.onrender.com/follow/${targetUserId}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // backend returns either success msg for follow/unfollow
      // We'll toggle local state by checking whether we already have it
      setFollowingSet((prev) => {
        const updated = new Set(prev);
        if (updated.has(targetUserId)) updated.delete(targetUserId);
        else updated.add(targetUserId);
        return updated;
      });

      // Also update results list followers count locally (optional)
      setResults((prev) =>
        prev.map((u) =>
          u._id === targetUserId
            ? {
                ...u,
                // try to update followers count if present:
                followersCount:
                  typeof u.followersCount === "number"
                    ? res.data.msg === "followed succe......" || res.data.success
                      ? (u.followersCount || 0) + 1
                      : Math.max(0, (u.followersCount || 1) - 1)
                    : u.followersCount,
              }
            : u
        )
      );
    } catch (err) {
      console.error("FOLLOW ERROR:", err);
      alert("Follow/unfollow failed — check console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // if you stored user data, remove that too
    // localStorage.removeItem("user");
    navigate("/");
  };

  const openSearch = () => {
    setShowSearch(true);
    setQuery("");
    setResults([]);
    // reset local following set? keep it
  };

  const closeSearch = () => {
    setShowSearch(false);
    setQuery("");
    setResults([]);
  };

  const handleUserClick = (user) => {
    // go to public profile page (if you implement /user/:id)
    // For now let's navigate to /profile and later change.
    navigate("/profile"); // you can change to `/user/${user._id}`
    closeSearch();
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-[245px] border-r border-zinc-800 bg-black text-white flex flex-col justify-between py-6 px-4 z-20">
        <div>
          <div className="mb-8 px-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#833ab4] bg-clip-text text-transparent">
              Instagram
            </h1>
          </div>

          <nav className="space-y-2 text-sm">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-900 transition"
            >
              <span>🏠</span>
              <span className={isActive("/home")}>Home</span>
            </button>

            <button
              onClick={openSearch}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-900 transition"
            >
              <span>🔍</span>
              <span>Search</span>
            </button>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-900 transition"
            >
              <span>➕</span>
              <span>Create</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-zinc-900 transition"
            >
              <span>👤</span>
              <span className={isActive("/profile")}>Profile</span>
            </button>
          </nav>
        </div>

        <div className="px-2">
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-400 text-sm hover:text-red-300"
          >
            Log out
          </button>
        </div>
      </div>

      {/* SEARCH MODAL */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-16 z-50">
          <div className="bg-[#121212] w-full max-w-md rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold">Search</h2>
              <button
                onClick={closeSearch}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Input */}
            <div className="px-4 py-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#405de6]"
              />
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {searchLoading && (
                <p className="text-xs text-gray-400 px-4 pb-3">Searching...</p>
              )}

              {!searchLoading && results.length === 0 && query.trim() !== "" && (
                <p className="text-xs text-gray-500 px-4 pb-3">No users found.</p>
              )}

              {results.map((user) => (
                <div
                  key={user._id}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-900"
                >
                  <button
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 text-left"
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full bg-zinc-800"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-400">
                        {user.email}
                      </span>
                    </div>
                  </button>

                  {/* Follow / Following button */}
                  <div>
                    <button
                      onClick={() => handleFollowToggle(user._id)}
                      className={`px-3 py-1 rounded text-sm ${
                        followingSet.has(user._id)
                          ? "bg-transparent border border-zinc-600 text-white"
                          : "bg-[#405de6] text-white"
                      }`}
                    >
                      {followingSet.has(user._id) ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
// rudhg355@gmail.com

console.log(5==5);















// rudhg355@gmail.com