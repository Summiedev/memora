const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },  // 🔹 New field
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
