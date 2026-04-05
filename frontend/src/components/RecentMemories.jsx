import React, { useEffect, useState } from 'react';
import api from '../utils/auth';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const RecentMemories = ({ newEntryTrigger, onMemoryClick } ) => {
  const [weeks, setWeeks] = useState([]);
  const [memoriesMap, setMemoriesMap] = useState({});

  const fetchMemories = async () => {
    try {
      const response = await api.get('/photo-memories/get-all-photo');

      const memories = response.data.data;
      const grouped = {};
      const map = {};

      memories.forEach(memory => {
        const weekNum = dayjs(memory.createdAt).isoWeek();
        const year = dayjs(memory.createdAt).year();
        const weekKey = `${year}-W${weekNum}`;

        if (!grouped[weekKey]) {
          grouped[weekKey] = {
            weekNumber: weekNum,
            year,
            weekStart: dayjs(memory.createdAt).startOf('isoWeek'),
            weekEnd: dayjs(memory.createdAt).endOf('isoWeek'),
            days: {}
          };
        }

        const dayName = dayjs(memory.createdAt).format('ddd');
        const photos = memory.photos.slice(0, 1);
        if (!grouped[weekKey].days[dayName]) {
          grouped[weekKey].days[dayName] = {
            photo: photos[0],
            memoryId: memory._id
          };
          map[memory._id] = memory;
        }
      });

      const weekArray = Object.values(grouped)
        .sort((a, b) => b.weekStart - a.weekStart)
        .slice(0, 4);

      setWeeks(weekArray);
      setMemoriesMap(map);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [newEntryTrigger]);
  return (
    <div className="bg-blue-50 rounded-xl shadow p-4">
      <div className="p-4 border-b border-blue-200 mb-4">
        <h3 className="text-lg font-semibold text-blue-700 quicksand">
          🌈 Recent Memories
        </h3>
        <p className="text-xs text-blue-400">(past 4 weeks)</p>
      </div>

      <div className="space-y-6">
        {weeks.map((week, idx) => (
          <div key={idx}>
            <div className="text-blue-600 font-semibold text-md mb-2 flex justify-between items-center">
              <div>
                <span className="text-sm text-blue-400 mr-2">Week {week.weekNumber}</span>
                <span>{week.weekStart.format('MMM D')} – {week.weekEnd.format('MMM D')}</span>
              </div>
              <button className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-300">
                ⋯
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                <div key={day} className="flex-shrink-0 w-20 relative rounded-xl overflow-hidden">
                  {week.days[day] ? (
                    <button
                      onClick={() => {
                        const memoryId = week.days[day].memoryId;
                        const memory = memoriesMap[memoryId];
                        if (memory && onMemoryClick) {
                          onMemoryClick(memory, 'photo');
                        }
                      }}
                      className="w-20 h-20 object-cover border-2 border-blue-200 rounded-xl cursor-pointer hover:scale-105 hover:border-blue-400 transition-all duration-200 p-0"
                    >
                      <img
                        src={week.days[day].photo}
                        alt={day}
                        className="w-full h-full object-cover rounded-[9px]"
                      />
                    </button>
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 flex items-center justify-center border-2 border-dashed border-blue-200 text-blue-300 text-sm rounded-xl">
                      {day}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-white/70 text-[10px] text-blue-600 px-1 rounded">
                    {day}
                  </div>
                </div>
              ))}
              <div className="w-20 h-20 bg-blue-100 border border-dashed border-blue-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-200 transition">
                <span className="text-blue-600 text-lg">+</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMemories;
