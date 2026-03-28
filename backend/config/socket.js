// backend/config/socket.js
const { Server } = require("socket.io");
const User    = require("../models/user");
const Message = require("../models/message");

let io = null;
const onlineUsers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    // 1️⃣ Register
    socket.on("register", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      console.log(`🔑 Registered user ${userId} → socket ${socket.id}`);
    });

    // 2️⃣ Send chat message (with optional capsule share)
  socket.on("send_message", async ({ senderId, receiverId, text, timestamp, chatId, tempId, capsuleId, messageType }) => {
  try {
    const cid = chatId || [senderId, receiverId].sort().join("_");

    const msgData = {
      chatId: cid,
      sender: senderId,
      receiver: receiverId,
      text: text || "",
      timestamp,
      messageType: messageType || "text",
    };
    if (capsuleId) msgData.capsuleId = capsuleId;

    const msg = await Message.create(msgData);

    // If it's a capsule share, populate the capsule details
    let populatedMsg = msg.toObject();
    if (capsuleId) {
      const Capsule = require("../models/capsule");
      const capsule = await Capsule.findById(capsuleId).select("title coverImage sendDate lockUntilSend capsuleType sharedWith createdBy").populate("createdBy", "username");
      populatedMsg.capsuleData = capsule;

      // Also add the receiver to capsule.sharedWith if not already there
      await Capsule.findByIdAndUpdate(capsuleId, {
        $addToSet: { sharedWith: receiverId },
        capsuleType: "shared"
      });
    }

    const msgWithTempId = {
      ...populatedMsg,
      tempId,
      senderId: populatedMsg.sender?.toString?.() || senderId,
      receiverId: populatedMsg.receiver?.toString?.() || receiverId
    };

    console.log("📩 Sent message:", senderId);
    // Echo to sender
    socket.emit("receive_message", msgWithTempId);

    // Forward to recipient if online
    const destSocketId = onlineUsers.get(String(receiverId));
    if (destSocketId) {
      io.to(destSocketId).emit("receive_message", msgWithTempId);
    }

  } catch (err) {
    console.error("❌ Error on send_message:", err);
  }
});


    // 3️⃣ Send friend request
    socket.on("send_friend_request", async ({ senderId, receiverId }) => {
      try {
        await User.findByIdAndUpdate(receiverId, {
          $addToSet: { pendingFriendRequests: senderId },
        });
        const sender = await User.findById(senderId).select("username");
        const dest   = onlineUsers.get(String(receiverId));
        if (dest) {
          io.to(dest).emit("receive_friend_request", {
            fromUser: { _id: senderId, username: sender.username },
          });
        }
        console.log(`📩 Friend request: ${senderId} → ${receiverId}`);
      } catch (e) {
        console.error("❌ Error on send_friend_request:", e);
      }
    });

    // 4️⃣ Accept friend request
    socket.on("accept_friend_request", async ({ fromId, toId }) => {
      try {
        await Promise.all([
          User.findByIdAndUpdate(fromId, { $addToSet: { friends: toId } }),
          User.findByIdAndUpdate(toId,   { $addToSet: { friends: fromId } }),
          User.findByIdAndUpdate(toId,   { $pull:    { pendingFriendRequests: fromId } }),
        ]);
        const accepter = await User.findById(toId).select("username");
        const dest     = onlineUsers.get(String(fromId));
        if (dest) {
          io.to(dest).emit("friend_request_accepted", {
            fromUser: { _id: toId, username: accepter.username },
          });
        }
        console.log(`✅ Accepted: ${toId} ← ${fromId}`);
      } catch (e) {
        console.error("❌ Error on accept_friend_request:", e);
      }
    });

    // 5️⃣ Decline friend request
    socket.on("decline_friend_request", async ({ fromId, toId }) => {
      try {
        await User.findByIdAndUpdate(toId, { $pull: { pendingFriendRequests: fromId } });
        const decliner = await User.findById(toId).select("username");
        const dest     = onlineUsers.get(String(fromId));
        if (dest) {
          io.to(dest).emit("friend_request_declined", {
            fromUser: { _id: toId, username: decliner.username },
          });
        }
        console.log(`❌ Declined: ${toId} ← ${fromId}`);
      } catch (e) {
        console.error("❌ Error on decline_friend_request:", e);
      }
    });

    // 6️⃣ Read receipts (optional)
    socket.on("read_messages", ({ from, to, timestamp }) => {
      const dest = onlineUsers.get(String(to));
      if (dest) {
        io.to(dest).emit("read_receipt", { fromId: from, timestamp });
      }
    });

    // 7️⃣ Cleanup on disconnect
    socket.on("disconnect", () => {
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          console.log("🔌 Disconnected user:", uid);
          break;
        }
      }
    });
  });
}

module.exports = { initSocket, getIo: () => io, onlineUsers };
