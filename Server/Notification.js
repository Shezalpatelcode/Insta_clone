// Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // jis user ko notification milegi
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // jisne trigger kiya
    type: { type: String, enum: ["like", "follow", "comment"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", default: null }, // optional (like/comment)
    message: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);