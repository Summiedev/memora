import React, { useEffect, useState , useMemo} from "react";
import axios from "axios";


const MemoryCalendar = () => {
  const [memories, setMemories] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/photo-memories/get-all-photo', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },});
        setMemories(res.data.data);
      } catch (error) {
        console.error("Error fetching memories:", error);
      }
    };

    fetchMemories();
  }, []);

  const changeMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };


const memoryDaysSet = useMemo(() => {
  return new Set(
    memories
      .filter(memory => {
        const date = new Date(memory.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .map(memory => new Date(memory.createdAt).getDate())
  );
}, [memories, currentMonth, currentYear]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return (
    <div className="md:col-span-3 p-4 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold quicksand text-blue-500">Memory Calendar₊✩‧₊˚</h2>
      </div>

      <div className="grid grid-cols-7 quicksand gap-2 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold text-gray-500">{d}</div>
        ))}

        {Array(firstDayIndex).fill("").map((_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const dayNumber = i + 1;
          const hasMemory = memoryDaysSet.has(dayNumber);

          return (
            <div
              key={i}
              className={`rounded-xl p-2 shadow-sm transition-all ${
                hasMemory
                  ? "bg-yellow-200 text-yellow-900 font-semibold"
                  : "text-black bg-white"
              }`}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="mt-7 text-sm text-gray-500 italic">Highlighted days have saved memories!</p>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="text-blue-500 hover:text-blue-700">◀</button>
          <span className="font-medium text-gray-700">{months[currentMonth]} {currentYear}</span>
          <button onClick={() => changeMonth(1)} className="text-blue-500 hover:text-blue-700">▶</button>
        </div>
      </div>
    </div>
  );
};

export default MemoryCalendar;
