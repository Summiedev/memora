// backend/config/socket.js
const { Server } = require('socket.io');
const User    = require('../models/user');
const Message = require('../models/message');

let io = null;
const onlineUsers = new Map(); // userId(string) → socketId

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    // ─────────────────────────────────────────────────────────────
    // 1. REGISTER — called by client immediately after connect
    // ─────────────────────────────────────────────────────────────
    socket.on('register', (userId) => {
      if (!userId) return;
      const uid = String(userId);
      onlineUsers.set(uid, socket.id);
      socket._userId = uid;
      console.log(`🔑 Registered ${uid}`);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // ─────────────────────────────────────────────────────────────
    // 2. SEND MESSAGE
    // ─────────────────────────────────────────────────────────────
    socket.on('send_message', async (payload) => {
      const { senderId, receiverId, text, timestamp, chatId, tempId, capsuleId, messageType } = payload;
      try {
        if (!senderId || !receiverId) {
          return socket.emit('message_error', { tempId, error: 'Missing senderId or receiverId' });
        }

        const sid = String(senderId);
        const rid = String(receiverId);
        const cid = chatId || [sid, rid].sort().join('_');

        const msgData = {
          chatId:      cid,
          sender:      sid,
          receiver:    rid,
          text:        text || '',
          timestamp:   timestamp ? new Date(timestamp) : new Date(),
          messageType: messageType || 'text',
          read:        false,
        };
        if (capsuleId) msgData.capsuleId = capsuleId;

        // Save and populate
        const saved = await Message.create(msgData);
        const populated = await Message.findById(saved._id)
          .populate('sender',   'username fullname')
          .populate('receiver', 'username fullname');

        let outObj = populated.toObject();

        // Attach capsule data if it's a capsule share
        if (capsuleId) {
          const Capsule = require('../models/capsule');
          const capsule = await Capsule.findById(capsuleId)
            .select('title coverImage sendDate lockUntilSend capsuleType sharedWith createdBy')
            .populate('createdBy', 'username');
          outObj.capsuleData = capsule ? capsule.toObject() : null;
          await Capsule.findByIdAndUpdate(capsuleId, {
            $addToSet: { sharedWith: rid },
            capsuleType: 'shared',
          });
        }

        // Normalise IDs to strings so frontend comparisons work
        const outgoing = {
          ...outObj,
          tempId,
          senderId:   sid,
          receiverId: rid,
          // Keep sender/receiver populated objects for display
        };

        // Echo to sender (replaces optimistic bubble)
        socket.emit('receive_message', outgoing);

        // Deliver to recipient
        const destSocket = onlineUsers.get(rid);
        if (destSocket) {
          io.to(destSocket).emit('receive_message', outgoing);
        }

        console.log(`📩 ${sid} → ${rid} [${messageType || 'text'}]`);
      } catch (err) {
        console.error('❌ send_message error:', err);
        socket.emit('message_error', { tempId, error: 'Failed to save message' });
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 3. TYPING INDICATOR
    // ─────────────────────────────────────────────────────────────
    socket.on('typing', ({ chatId, senderId }) => {
      if (!chatId || !senderId) return;
      const sid = String(senderId);
      // Forward to the other participant in this chat
      for (const [uid, sockId] of onlineUsers.entries()) {
        if (uid !== sid && chatId.includes(uid)) {
          io.to(sockId).emit('typing', { chatId, senderId: sid });
        }
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 4. SEND FRIEND REQUEST
    // ─────────────────────────────────────────────────────────────
    socket.on('send_friend_request', async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) return;
        const sid = String(senderId);
        const rid = String(receiverId);

        // Persist in DB
        await User.findByIdAndUpdate(rid, { $addToSet: { pendingFriendRequests: sid } });

        // Fetch sender info for notification
        const sender = await User.findById(sid).select('username fullname');
        if (!sender) return;

        console.log(`👥 Friend request ${sid} → ${rid}`);

        // Notify receiver if online
        const destSocket = onlineUsers.get(rid);
        if (destSocket) {
          io.to(destSocket).emit('receive_friend_request', {
            fromUser: { _id: sid, username: sender.username, fullname: sender.fullname },
          });
        }
      } catch (err) {
        console.error('❌ send_friend_request error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 5. ACCEPT FRIEND REQUEST
    // ─────────────────────────────────────────────────────────────
    socket.on('accept_friend_request', async ({ fromId, toId }) => {
      try {
        if (!fromId || !toId) return;
        const fid = String(fromId); // original sender
        const tid = String(toId);   // person accepting

        await Promise.all([
          User.findByIdAndUpdate(fid, { $addToSet: { friends: tid } }),
          User.findByIdAndUpdate(tid, { $addToSet: { friends: fid } }),
          User.findByIdAndUpdate(tid, { $pull: { pendingFriendRequests: fid } }),
        ]);

        const accepter = await User.findById(tid).select('username fullname');
        const requester = await User.findById(fid).select('username fullname');

        // Notify the original requester that they were accepted
        const reqSocket = onlineUsers.get(fid);
        if (reqSocket && accepter) {
          io.to(reqSocket).emit('friend_request_accepted', {
            fromUser: { _id: tid, username: accepter.username, fullname: accepter.fullname },
          });
        }

        // Also tell the accepter's OWN socket (so their friends list updates)
        if (requester) {
          socket.emit('friend_added', {
            friend: { _id: fid, username: requester.username, fullname: requester.fullname },
          });
        }

        console.log(`✅ Accepted: ${tid} ← ${fid}`);
      } catch (err) {
        console.error('❌ accept_friend_request error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 6. DECLINE FRIEND REQUEST
    // ─────────────────────────────────────────────────────────────
    socket.on('decline_friend_request', async ({ fromId, toId }) => {
      try {
        if (!fromId || !toId) return;
        const fid = String(fromId);
        const tid = String(toId);

        await User.findByIdAndUpdate(tid, { $pull: { pendingFriendRequests: fid } });

        // Notify the requester their request was declined
        const destSocket = onlineUsers.get(fid);
        if (destSocket) {
          io.to(destSocket).emit('friend_request_declined', {
            fromUser: { _id: tid },
          });
        }
        console.log(`❌ Declined: ${tid} ← ${fid}`);
      } catch (err) {
        console.error('❌ decline_friend_request error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 7. MARK MESSAGES AS READ
    // ─────────────────────────────────────────────────────────────
    socket.on('read_messages', async ({ chatId, readerId }) => {
      try {
        if (!chatId || !readerId) return;
        // Mark all messages in this chat sent TO the reader as read
        await Message.updateMany(
          { chatId, receiver: readerId, read: false },
          { $set: { read: true } }
        );
        // Notify the sender their messages were read
        const parts = chatId.split('_');
        const otherId = parts.find((id) => id !== String(readerId));
        if (otherId) {
          const destSocket = onlineUsers.get(otherId);
          if (destSocket) {
            io.to(destSocket).emit('messages_read', { chatId, readerId });
          }
        }
      } catch (err) {
        console.error('❌ read_messages error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 8. DISCONNECT
    // ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const uid = socket._userId;
      if (uid) {
        onlineUsers.delete(uid);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`🔌 Disconnected: ${uid}`);
      }
    });
  });
}

module.exports = { initSocket, getIo: () => io, onlineUsers };