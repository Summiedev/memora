const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" },
  // Optional: when a capsule is shared in chat
  capsuleId: { type: mongoose.Schema.Types.ObjectId, ref: "Capsule", default: null },
  messageType: { type: String, enum: ["text", "capsule_share"], default: "text" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
