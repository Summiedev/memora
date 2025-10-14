// import React, { useEffect, useState } from "react";
// import { Plus, X } from "lucide-react";
// import Navbar_Main from "../components/Navbar_main";
// import { io } from "socket.io-client";
// import axios from "axios";
// import { jwtDecode } from 'jwt-decode';

// import { useLocation } from "react-router-dom";

// const socket = io("http://localhost:5000");

// export default function FriendsPage() {
//   const [search, setSearch] = useState("");
//   const [users, setUsers] = useState([]);
//   const [friends, setFriends] = useState([
//     { id: 1, name: "Stella", status: "friend", messages: [], lastRead: null },
//     { id: 2, name: "Milo", status: "pending", messages: [], lastRead: null },
//   ]);
//   const [selectedFriend, setSelectedFriend] = useState(null);
//   const [messageText, setMessageText] = useState("");
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typingStatus, setTypingStatus] = useState({});
//   const [user, setUser] = useState(null); 
//   const [loadingUser, setLoadingUser] = useState(true); 

//   const location = useLocation();

//   // On first mount, check URL for ?token= and save to localStorage
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const token = params.get("token");
//     if (token) {
//       localStorage.setItem("token", token);
//       // Optionally remove it from the URL so it’s not visible
//       window.history.replaceState({}, "", location.pathname);
//     }
//   }, [location]);

//    useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return setLoadingUser(false);
//         console.log("Stored token issssssssss:", token);

//         const decoded = jwtDecode(token);
//         const userId = decoded.userId || decoded.id;

//         const res = await axios.get("http://localhost:5000/api/auth/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser({ ...res.data.user, id: userId });
//       } catch (err) {
//         console.error("Error fetching user:", err);
//         localStorage.removeItem("token");
//       } finally {
//         setLoadingUser(false);
//       }
//     };
//     fetchUser();
//   }, []);

// useEffect(() => {
//   if (!user) return;

//   socket.emit("register", user.id);

//   const handleOnlineUsers = (ids) => setOnlineUsers(ids);
//   const handleIncomingMessage = ({ senderId, text, timestamp }) => {
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.id === senderId
//           ? {
//               ...f,
//               messages: [...f.messages, { text, fromMe: false, timestamp }],
//             }
//           : f
//       )
//     );
//   };

//    const handleIncomingFriendRequest = ({ fromUser }) => {
//     console.log("🔔 Got incoming friend-request from:", fromUser);
//     setFriends(prev => {
//       if (prev.some(f => f.id === fromUser._id)) return prev;
//       return [
//         ...prev,
//         {
//           id: fromUser._id,
//           name: fromUser.username,
//           status: "pending",
//           direction: "received",
//           messages: [],
//           lastRead: null,
//         }
//       ];
//     });
//   };

//    const handleFriendAccepted = ({ fromUser }) => {
//     console.log("🎉 Your friend request was accepted by:", fromUser);
//     setFriends(prev =>
//       prev.map(f =>
//         // find the one you’d sent to
//         f.id === fromUser._id
//           ? { ...f, status: "friend", direction: "friend" }
//           : f
//       )
//     );
//   };


//   const handleTypingStatus = ({ fromId }) => {
//     setTypingStatus((prev) => ({ ...prev, [fromId]: true }));
//     setTimeout(() => {
//       setTypingStatus((prev) => ({ ...prev, [fromId]: false }));
//     }, 2000);
//   };

//   const handleReadReceipt = ({ fromId, timestamp }) => {
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.id === fromId ? { ...f, lastRead: timestamp } : f
//       )
//     );
//   };

//   socket.on("online_users", handleOnlineUsers);
//   socket.on("receive_message", handleIncomingMessage);
//   socket.on("receive_friend_request", handleIncomingFriendRequest);
//   socket.on("typing", handleTypingStatus);
//   socket.on("read_receipt", handleReadReceipt);
// socket.on("friend_request_accepted", handleFriendAccepted);
// socket.on("friend_request_declined", ({ fromUser }) => {
//   console.log("❌ Your request was declined by:", fromUser);
//   setFriends(prev => prev.filter(f => f.id !== fromUser._id));
// });
//   return () => {
//     socket.off("online_users", handleOnlineUsers);
//     socket.off("receive_message", handleIncomingMessage);
//     socket.off("receive_friend_request", handleIncomingFriendRequest);
//     socket.off("typing", handleTypingStatus);
//     socket.off("read_receipt", handleReadReceipt);  
//     socket.off("friend_request_accepted", handleFriendAccepted);

//   };
// }, [user]);




//   // 2️⃣ Debounced search effect
//   useEffect(() => {
//     const delay = setTimeout(() => {


//       if ( !search.trim()) {
//         setUsers([]);
//         return;
//       }

//       axios
//         .get(`http://localhost:5000/api/users?q=${encodeURIComponent(search)}`,)
//         .then((res) => {
//           console.log("API response:", res.data);
//           const list = Array.isArray(res.data) ? res.data : res.data.users || [];
//           setUsers(list);
//         })
//         .catch((err) => {
//           console.error("Search error:", err.response?.data || err.message);
//           setUsers([]);
//         });
//     }, 300);

//     return () => clearTimeout(delay);
//   }, [search]);
// // inside FriendsPage.jsx

// const handleInvite = (target) => {
//   if (!user) {
//     console.warn("Still fetching your profile, please wait…");
//     return;
//   }

//   const already = friends.some(
//     f => f.id === target._id && (f.status === "pending" || f.status === "friend")
//   );
//   if (already) return;

//   // ✅ Send correct shape
//   socket.emit("send_friend_request", {
//     senderId: user.id,
//     receiverId: target._id
//   });

//   setFriends(prev => [
//     ...prev,
//     {
//       id: target._id,
//       name: target.username,
//       status: "pending",
//       direction: "sent",
//       messages: [],
//       lastRead: null
//     }
//   ]);
// };




//  const handleAcceptInvite = (id) => {
//   socket.emit("accept_friend_request", {
//     fromId: id,
//     toId: user.id,
//   });

//   setFriends((prev) =>
//     prev.map((f) =>
//       f.id === id ? { ...f, status: "friend" } : f
//     )
//   );
// };


//   const handleSendMessage = () => {
//   if (!messageText || !selectedFriend) return;

//   const timestamp = new Date().toISOString();

//   socket.emit("send_message", {
//     senderId: user.id,
//     receiverId: selectedFriend.id,
//     text: messageText,
//     timestamp,
//   });

//   socket.emit("read_messages", {
//     from: user.id,
//     to: selectedFriend.id,
//     timestamp,
//   });

//   setFriends((prev) =>
//     prev.map((f) =>
//       f.id === selectedFriend.id
//         ? {
//             ...f,
//             messages: [
//               ...f.messages,
//               { text: messageText, fromMe: true, timestamp },
//             ],
//             lastRead: timestamp,
//           }
//         : f
//     )
//   );

//   setMessageText("");
// };

// const handleDeclineInvite = (id) => {
//   socket.emit("decline_friend_request", {
//     fromId: id,
//     toId:   user.id,
//   });
//   // optimistically remove from pending
//   setFriends(prev => prev.filter(f => f.id !== id));
// };

// const handleTyping = (e) => {
//   setMessageText(e.target.value);

//   if (selectedFriend) {
//     socket.emit("typing", {
//       to: selectedFriend.id,
//       fromId: user.id,
//     });
//   }
// };


//   return (
//     <>
//       <Navbar_Main />
//       <div className="min-h-screen bg-gradient-to-br text-black from-blue-50 to-blue-100 px-6 py-10 font-quicksand">
//         <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 border-4 border-blue-200">
//           <h1 className="text-3xl text-blue-700 font-bold text-center mb-8">Friends ✿｡.:*</h1>

//           <div className="grid md:grid-cols-3 gap-6">
//             <div className="col-span-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
//               <h2 className="text-xl font-semibold text-blue-700 mb-4">Your Friends</h2>
//               <div className="space-y-3 overflow-y-auto max-h-96">
//                 {friends.filter(f => f.status === "friend").map((friend) => (
//                   <div
//                     key={friend.id}
//                     onClick={() => setSelectedFriend(friend)}
//                     className={`p-3 rounded-lg cursor-pointer ${selectedFriend?.id === friend.id ? "bg-blue-200" : "bg-white hover:bg-blue-100"}`}
//                   >
//                     <p className="text-blue-800 font-medium flex justify-between items-center">
//                       {friend.name}
//                       {onlineUsers.includes(friend.id) && <span className="w-2 h-2 bg-green-500 rounded-full" />}
//                     </p>
//                     {friend.lastRead && selectedFriend?.id === friend.id && (
//                       <p className="text-xs text-gray-500">Last read: {new Date(friend.lastRead).toLocaleTimeString()}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="col-span-2">
//               {selectedFriend ? (
//                 <div className="bg-blue-50 rounded-xl p-6 shadow-inner h-full">
//                   <h2 className="text-xl font-bold text-blue-600 mb-2">Chat with {selectedFriend.name}</h2>
//                   <div className="h-64 overflow-y-auto bg-white p-4 rounded-lg border border-blue-200 mb-4">
//                     {selectedFriend.messages.map((msg, idx) => (
//                       <div key={idx} className={`mb-1 text-sm ${msg.fromMe ? "text-right text-blue-600" : "text-left text-gray-700"}`}>
//                         {msg.text}
//                         <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
//                       </div>
//                     ))}
//                     {typingStatus[selectedFriend.id] && <p className="text-xs italic text-gray-500">{selectedFriend.name} is typing...</p>}
//                   </div>
//                   <div className="flex gap-2">
//                     <input
//                       value={messageText}
//                       onChange={handleTyping}
//                       className="flex-1 px-4 py-2 rounded-lg  text-black border border-gray-300 focus:outline-none"
//                       placeholder="Type your message..."
//                     />
//                     <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-xl shadow-md">
//                       Send
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 py-20">Select a friend to start messaging ✧･ﾟ</div>
//               )}
//             </div>
//           </div>

//           {/* Find Users */}
//           <div className="mt-10 relative">   {/* make this relative */}
//   <h2 className="text-xl text-blue-700 font-semibold mb-3">Find New Friends ❀⋆｡˚</h2>
//   <input
//     type="text"
//     placeholder="Search users..."
//     className="w-full px-4 py-2 mb-1 text-black rounded-md border border-blue-300 focus:outline-none"
//     value={search}
//     onChange={(e) => setSearch(e.target.value)}
//   />

//   {/* Dropdown Suggestions */}
//   {users.length > 0 && (
//     <ul className="absolute z-10 w-full bg-white border border-blue-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
//       {users.map((u) => (
//         <li
//           key={u._id}
//           className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
//           onClick={() => {
//             handleInvite(u);
//             setSearch("");
//           }}
//         >
//           <span className="font-medium text-blue-700">{u.fullname}</span>{" "}
//           <span className="text-sm text-gray-500">@{u.username}</span>
//         </li>
//       ))}
//     </ul>
//   )}
// </div>

//           {/* Pending */}
//          <div className="mt-10">
//   <h2 className="text-xl text-blue-700 font-semibold mb-3">Pending Requests</h2>
//   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//     {/* Incoming requests you can accept */}
//     {friends.filter(f => f.status === "pending" && f.direction === "received").map(friend => (
//       <div key={friend.id} className="p-3 bg-purple-100 border border-yellow-200 rounded-lg shadow-sm">
//         <p className="font-medium text-yellow-800">{friend.name}</p>
//         <button
//           onClick={() => handleAcceptInvite(friend.id)}
//           className="mt-2 text-sm px-3 py-1 bg-green-300 hover:bg-green-400 text-white rounded-md"
//         >
//           Accept Invite
//         </button>
//         <button  className="mt-2 text-sm px-3 py-1 bg-red-300 hover:bg-red-400 text-white rounded-md"onClick={() => handleDeclineInvite(friend.id)}>Decline</button>
//       </div>
//     ))}

//     {/* Outgoing requests you’re waiting on */}
//     {friends.filter(f => f.status === "pending" && f.direction === "sent").map(friend => (
//       <div key={friend.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
//         <p className="font-medium text-blue-800">{friend.name}</p>
//         <p className="text-sm text-gray-500 mt-1 italic">Pending...</p>
//       </div>
//     ))}
//   </div>
// </div>
//         </div>
//       </div>
//     </>
//   );
// }
import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Navbar_Main from "../components/Navbar_main";
import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useLocation } from "react-router-dom";
import { useRef } from "react";
const socket = io("http://localhost:5000");

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);            // confirmed
  const [pendingReceived, setPendingReceived] = useState([]); // incoming
  const [pendingSent, setPendingSent] = useState([]);    // outgoing
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showNotif, setShowNotif] = useState(false);

  const typingTimeouts = useRef({});
  const location = useLocation();
const endOfMessagesRef = useRef(null);

useEffect(() => {
  if (endOfMessagesRef.current) {
    endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [selectedFriend?.messages?.length]);
  // grab token from URL once
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem("token", t);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  // Fetch profile + friends and requests
  useEffect(() => {
    async function init() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoadingUser(false);

        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id;

        const { data: profile } = await axios.get(
          "http://localhost:5000/api/auth/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser({ ...profile.user, id: userId });

        const { data } = await axios.get(
          `http://localhost:5000/api/friend-requests/friend-requests/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // ✅ Ensure messages array exists on each friend
        const hydratedFriends = (data.friends || []).map(f => ({
          ...f,
          messages: f.messages || []
        }));

        setFriends(hydratedFriends);
        setPendingReceived(data.pendingReceived);
        setPendingSent(data.pendingSent);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
      } finally {
        setLoadingUser(false);
      }
    }
    init();
  }, []);

  // Fetch message history when selectedFriend changes
  useEffect(() => {
    if (!user || !selectedFriend) return;

    // 1️⃣ Create consistent chatId between user and selectedFriend
    const chatId = [user.id, selectedFriend._id].sort().join("_");

    axios
      .get(`http://localhost:5000/api/history/${chatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        const msgs = res.data;

        // 2️⃣ Update friend list
        setFriends((prev) =>
          prev.map((f) =>
            f._id === selectedFriend._id ? { ...f, messages: msgs } : f
          )
        );

        // 3️⃣ Update selected friend
        setSelectedFriend((sf) =>
          sf && sf._id === selectedFriend._id ? { ...sf, messages: msgs } : sf
        );
      })
      .catch(console.error);
  }, [selectedFriend, user]);


  // ⚡️ Real-time socket handlers
  useEffect(() => {
    if (!user) return;
    socket.emit("register", user.id);

    socket.on("online_users", ids => setOnlineUsers(ids));

    socket.on("receive_friend_request", ({ fromUser }) => {
      setPendingReceived(prev => {
        if (prev.find(r => r._id === fromUser._id)) return prev;
        return [...prev, fromUser];
      });
    });

    socket.on("friend_request_accepted", ({ fromUser }) => {
      setFriends(prev => [
        ...prev,
        { ...fromUser, messages: [] } // ✅ initialize messages array
      ]);
      setPendingSent(prev => prev.filter(r => r._id !== fromUser._id));
    });

    socket.on("friend_request_declined", ({ fromUser }) => {
      setPendingSent(prev => prev.filter(r => r._id !== fromUser._id));
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_friend_request");
      socket.off("friend_request_accepted");
      socket.off("friend_request_declined");
    };
  }, [user]);

  // Debounced user search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!search.trim()) return setUsers([]);
      axios
        .get(`http://localhost:5000/api/users?q=${encodeURIComponent(search)}`)
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : res.data.users || [];
          setUsers(list);
        })
        .catch(() => setUsers([]));
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // 📨 Send friend request
  const handleInvite = target => {
    if (!user) return;
    if (
      pendingReceived.some(r => r._id === target._id) ||
      pendingSent.some(r => r._id === target._id) ||
      friends.some(f => f._id === target._id)
    )
      return;

    socket.emit("send_friend_request", {
      senderId: user.id,
      receiverId: target._id
    });
    setPendingSent(prev => [
      ...prev,
      { _id: target._id, username: target.username }
    ]);
    setSearch("");
  };

  // ✅ Accept friend request
  const handleAcceptInvite = id => {
    socket.emit("accept_friend_request", { fromId: id, toId: user.id });
    setFriends(prev => [
      ...prev,
      ...pendingReceived
        .filter(r => r._id === id)
        .map(f => ({ ...f, messages: [] })) // ✅ initialize messages array
    ]);
    setPendingReceived(prev => prev.filter(r => r._id !== id));
  };

  // ❌ Decline friend request
  const handleDeclineInvite = id => {
    socket.emit("decline_friend_request", { fromId: id, toId: user.id });
    setPendingReceived(prev => prev.filter(r => r._id !== id));
  };

  // 💬 Send chat message
  const handleSendMessage = () => {
  if (!messageText || !selectedFriend) return;

  const ts = new Date().toISOString();
  const chatId = [user.id, selectedFriend._id].sort().join("_");
  const tempId = crypto.randomUUID(); // unique temporary ID

  const optimisticMsg = {
    tempId, // 🔸 New field
    chatId,
    senderId: user.id,
    receiverId: selectedFriend._id,
    text: messageText,
    timestamp: ts
  };

  // Optimistic UI update
  setFriends(prev =>
    prev.map(f =>
      f._id === selectedFriend._id
        ? {
            ...f,
            messages: [...(f.messages || []), optimisticMsg],
            lastRead: ts,
            lastMessage: optimisticMsg
          }
        : f
    )
  );

  setSelectedFriend(prev =>
    prev && prev._id === selectedFriend._id
      ? { ...prev, messages: [...(prev.messages || []), optimisticMsg] }
      : prev
  );

  setMessageText("");
  socket.emit("send_message", optimisticMsg);
};

  // 🔄 Receive chat message
 useEffect(() => {
  const handleIncomingMessage = rawMsg => {
    const msg = {
    ...rawMsg,
    chatId:
      rawMsg.chatId ||
      [rawMsg.sender?._id ?? rawMsg.senderId, rawMsg.receiver?._id ?? rawMsg.receiverId]
        .sort()
        .join("_"),
    senderId: rawMsg.sender?._id ?? rawMsg.senderId,
    receiverId: rawMsg.receiver?._id ?? rawMsg.receiverId
  };
  console.log("haaa msg", msg)

  const isFromMe = String(msg.senderId) === String(user.id);
  const otherUserId = isFromMe ? msg.receiverId : msg.senderId;

  const matchTemp = (m) =>
    (msg.tempId && m.tempId === msg.tempId) || m._id === msg.tempId;

  setFriends(prev =>
    prev.map(f => {
      if (String(f._id) !== String(otherUserId)) return f;

      const updatedMessages = [...(f.messages || [])];
      const existingIndex = updatedMessages.findIndex(matchTemp);

      if (existingIndex !== -1) {
        updatedMessages[existingIndex] = msg;
      } else {
        updatedMessages.push(msg);
      }

      return {
        ...f,
        messages: updatedMessages,
        lastMessage: msg,
        unreadCount:
          !isFromMe && selectedFriend?._id !== f._id
            ? (f.unreadCount || 0) + 1
            : f.unreadCount || 0
      };
    })
  );

  setSelectedFriend(prev => {
    if (!prev || (String(prev._id) !== String(otherUserId))) return prev;

    const updatedMessages = [...(prev.messages || [])];
    const existingIndex = updatedMessages.findIndex(matchTemp);

    if (existingIndex !== -1) {
      updatedMessages[existingIndex] = msg;
    } else {
      updatedMessages.push(msg);
    }

    return { ...prev, messages: updatedMessages };
  });
  };

  socket.on("receive_message", handleIncomingMessage);
  return () => socket.off("receive_message", handleIncomingMessage);
}, [selectedFriend]);


  useEffect(() => {
    if (!selectedFriend || !user) return;

    const typingTimeout = setTimeout(() => {
      const chatId = [user.id, selectedFriend._id].sort().join("_");
      socket.emit("typing", {
        chatId,
        senderId: user.id
      });
    }, 300);

    return () => clearTimeout(typingTimeout);
  }, [messageText]);
  useEffect(() => {
    const handleTyping = ({ chatId, senderId }) => {
      const activeChatId = [user.id, selectedFriend?._id].sort().join("_");
      if (chatId !== activeChatId || senderId === user.id) return;

      setTypingStatus(prev => ({ ...prev, [senderId]: true }));

      if (typingTimeouts.current[senderId]) {
        clearTimeout(typingTimeouts.current[senderId]);
      }

      typingTimeouts.current[senderId] = setTimeout(() => {
        setTypingStatus(prev => ({ ...prev, [senderId]: false }));
        delete typingTimeouts.current[senderId];
      }, 1500);
    };

    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [selectedFriend, user]);


  if (loadingUser) return null;

  return (
    <>
      <Navbar_Main />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-6 font-quicksand">
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-blue-200">
          <h1 className="text-3xl text-blue-700 font-bold text-center mb-8">Friends ✿｡.:*</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Friends List */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 overflow-y-auto max-h-[80vh]">
              <h2 className="text-lg font-semibold text-blue-700 mb-3">Your Friends</h2>
              <div className="space-y-2">
                {friends.map(friend => (
                  <div
                    key={friend._id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-3 rounded-lg transition cursor-pointer flex items-center justify-between ${selectedFriend?._id === friend._id
                        ? "bg-blue-200"
                        : "hover:bg-blue-100 bg-white"
                      }`}
                  >
                    <span className="text-blue-900 font-medium">{friend.username}</span>
                    {onlineUsers.includes(friend._id) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Pane */}
            <div className="md:col-span-2 flex flex-col h-[80vh] bg-blue-50 rounded-lg p-4 border border-blue-200">
              {selectedFriend ? (
                <>
                  <div className="mb-3 border-b border-blue-200 pb-2">
                    <h2 className="text-lg font-bold text-blue-700">
                      Chat with {selectedFriend.username}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white rounded-md shadow-inner border">
                    {(selectedFriend.messages || []).map((msg, idx) => {
                      console.log("msg:", msg);
                      console.log("msg.senderId:", msg.sender, typeof msg.sender);
                      console.log("user.id:", user.id, typeof user.id);
                      console.log(
                        "match:",
                        msg.senderId?.toString() === user.id?.toString()
                      );
                      
                      const senderIdStr = msg.senderId?.toString() || msg.sender?._id?.toString() || "";
const userIdStr = user?.id?.toString() || user?._id?.toString() || "";
const isSentByUser = senderIdStr === userIdStr;
                      console.log("senderIdStr:", senderIdStr, "userIdStr:", userIdStr);
console.log("msg senderId:", msg.senderId, "msg.sender._id:", msg.sender?._id, "user id:", user.id, "isSentByUser:", isSentByUser);

                      return (
                        <div key={idx} className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`px-4 py-2 rounded-lg max-w-[70%] shadow-sm ${isSentByUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            <div>{msg.text}</div>
                            <div className="text-xs text-gray-500 mt-1 text-right flex items-center gap-1">
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isSentByUser && msg.read && (
                                <span className="text-blue-200">{msg.readAt ? "✓✓" : "✓"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

  <div ref={endOfMessagesRef} />


                    {typingStatus[selectedFriend._id] && (
                      <p className="text-xs italic text-gray-500">
                        {selectedFriend.username} is typing...
                      </p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={messageText}
                      onChange={e => {
                        setMessageText(e.target.value);
                        socket.emit("typing", {
                          to: selectedFriend._id,
                          fromId: user.id,
                        });
                      }}
                      className="flex-1 text-black px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center flex-1 text-center text-gray-500">
                  Select a friend to start messaging ✧･ﾟ
                </div>
              )}
            </div>
          </div>

          {/* Find New Friends */}
          <div className="mt-10 relative">
            <h2 className="text-xl text-blue-700 font-semibold mb-3">
              Find New Friends ❀⋆｡˚
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 rounded-full border text-black border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {users.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-blue-200 rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                {users.map(u => (
                  <li
                    key={u._id}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                    onClick={() => handleInvite(u)}
                  >
                    <span className="font-medium text-blue-700">{u.fullname}</span>{" "}
                    <span className="text-sm text-gray-500">@{u.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Requests */}
          <div className="mt-10">
            <h2 className="text-xl text-blue-700 font-semibold mb-3">
              Pending Requests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Incoming */}
              {pendingReceived.map(r => (
                <div
                  key={r._id}
                  className="p-4 bg-purple-100 border border-yellow-200 rounded-xl shadow-sm"
                >
                  <p className="font-semibold text-yellow-800">{r.username}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(r._id)}
                      className="flex-1 text-sm px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(r._id)}
                      className="flex-1 text-sm px-3 py-1 bg-red-400 hover:bg-red-500 text-white rounded-md"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}

              {/* Outgoing */}
              {pendingSent.map(r => (
                <div
                  key={r._id}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm"
                >
                  <p className="font-semibold text-blue-800">{r.username}</p>
                  <p className="text-sm text-gray-500 mt-1 italic">Pending...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>

  );
}
