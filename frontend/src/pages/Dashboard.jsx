import React, {useState} from "react";
import { Bell, UserCircle } from "lucide-react";
import Navbar_Main from "../components/Navbar_main";
import { motion } from "framer-motion";
import FloatingActions from "../components/FloatingBtn";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardMiniCarousel from "../components/DashboardCaraousel";
import RecentMemories from "../components/RecentMemories";
import MemoryCalendar from "../components/MemoryCalendar";
import MonthlyRecap from "../components/MonthlyRecap";
import MoodTracker from '../components/MoodTracker';
import axios from "axios";

const moodData = [
  { day: "Mon", mood: 3 },
  { day: "Tue", mood: 4 },
  { day: "Wed", mood: 2 },
  { day: "Thu", mood: 5 },
  { day: "Fri", mood: 3 },
  { day: "Sat", mood: 4 },
  { day: "Sun", mood: 5 },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


const Dashboard = () => {
 const createCapsule = () => {  
    console.log("Create Capsule button clicked");
  }
 
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };
   const { search, pathname } = useLocation();
     const [user, setUser] = useState(null);

  // store and scrub token from URL here
  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // remove only the token parameter, leave others intact
      params.delete("token");
      const newSearch = params.toString();
      const newUrl = pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, document.title, newUrl);
      console.log("🎉 Stored token from Dashboard:", token);
    }
  }, [search, pathname]);
 useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // if your controller wraps in { user: … } adapt accordingly:
        setUser(res.data.data || res.data.user);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    loadUser();
  }, []);
  return (
    <div>
    <Navbar_Main/>
    <div className="min-h-screen bg-[#f3f6fd] px-6 py-4 sm:px-6">
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-5"
      >
      <div className="bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff] shadow-sm rounded-3xl p-4 sm:p-4 mb-4 border border-blue-100">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    
    {/* Text Section */}
    <div>
      <h1 className="chewy text-shadow-cute text-3xl sm:text-3xl text-blue-600 mb-1">
        Good Morning ⋆｡°✩🌞💌✩°｡⋆
      </h1>
      <p className="text-lg sm:text-xl font-semibold text-blue-900">
        Ready to open a memory or create a new capsule? 🎁✨
      </p>
      
    </div>

    {/* Optional Emote or Illustration */}
    <div className="hidden sm:block text-4xl animate-bounce-slow">
      📦💭
    </div>
    
  </div>
  <p className="mt-2 italic text-sm text-gray-500">
          "Sometimes you will never know the value of a moment until it becomes a memory." – Dr. Seuss
        </p>
  </div>
      </motion.div>
     
      {/* Calendar + Mood Graph Row */}
      <div className="mb-2 grid grid-cols-1 mt-3 md:grid-cols-5 gap-6">
    
      
        
<MonthlyRecap/>

        <MemoryCalendar/>
      
      </div> 
      <div className="mb-12">
  <h2 className="text-2xl quicksand font-semibold text-blue-500 mb-6">Your Capsules･ﾟﾟ･</h2>

 
  <DashboardMiniCarousel/>
</div>


      {/* Main Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 rounded-2xl pt-5 pl-4 pr-4 pb-4 shadow-2xl mb-10">
        <div className="xl:col-span-3">
    <h2 className="text-2xl quicksand font-semibold ml-3 text-blue-500 mb-0 ">
      Reflection Zone･ﾟﾟ･
    </h2>
  </div>
      
        <div className="xl:col-span-2 ">
        
          <RecentMemories/>
      
        </div>
    
        {/* Right Sidebar */}


        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-[#e7edfb] rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-blue-600 w-5 h-5" />
              <h4 className="font-semibold text-gray-800">Notifications</h4>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>Your capsule "Birthday Wish" was opened by 3 people</li>
              <li>"Memory Lane" is scheduled to open in 1 week</li>
            </ul>
          </div>

 
          {/* <div className="bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff]  p-4 rounded-xl shadow border border-[#dbeafe]">  
            <h3 className="text-lg font-semibold text-indigo-600 mb-4">Weekly Mood Tracker</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis domain={[0, 5]} tickCount={6} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f4ff', borderColor: '#6366f1' }} />
                <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> */}
        <div className="bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff] p-4 rounded-xl shadow border border-[#dbeafe]">
          {/* only render once user is loaded */}
          {user && <MoodTracker user={user} />}
        </div>
          {/* Tips or Help */}
          <div className="bg-[#e7edfb] rounded-xl shadow p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Tips</h4>
            <p className="text-sm text-gray-600">
              Make your capsules more memorable with personalized messages and
              emojis! 🎉
            </p>
          </div>
          <div>
          <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-indigo-100 border border-indigo-200 text-indigo-800 p-4 rounded-xl shadow"
      >
        <span className="text-lg font-medium">🌼 Prompt of the Day: </span>
        <span className="italic">“What made you smile today?”˖⁺‧₊✧˚ʚ♡ɞ˚✧₊‧⁺˖</span>
      </motion.div>
    </div>
         
        </div>
      </div>
      <FloatingActions onCreate={createCapsule}/>
    </div>
    </div>
  );
};

export default Dashboard;
