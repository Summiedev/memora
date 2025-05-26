// pages/MoodTracker.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import MoodPromptModal from './MoodPromptModal';

export default function MoodTracker({ user }) {
  const [moodData, setMoodData]   = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);

  // helper to get headers
  const authHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    if (!user) return; // wait until user is loaded

    const fetchMoodData = async () => {
      try {
        const [weekRes, todayRes] = await Promise.all([
          axios.get('http://localhost:5000/api/mood/week', authHeaders()),
          axios.get('http://localhost:5000/api/mood/today', authHeaders())
        ]);

        setMoodData(weekRes.data);
        if (!todayRes.data.exists) {
          setShowPrompt(true);
        }
      } catch (err) {
        console.error('Error loading mood data', err);
      }
    };

    fetchMoodData();
  }, [user]);

  const handleMoodSelect = async (mood) => {
    try {
      await axios.post('http://localhost:5000/api/mood', { mood }, authHeaders());
      setShowPrompt(false);

      // Refresh weekly data
      const res = await axios.get('http://localhost:5000/api/mood/week', authHeaders());
      setMoodData(res.data);

      // optionally: update user context/state here
    } catch (err) {
      console.error('Failed to submit mood', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff] p-4 rounded-xl shadow border border-[#dbeafe]">
      <h3 className="text-lg font-semibold text-indigo-600 mb-4">Weekly Mood Tracker</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={moodData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis domain={[0, 5]} tickCount={6} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#f0f4ff', borderColor: '#6366f1' }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {showPrompt && <MoodPromptModal onSelect={handleMoodSelect} />}
    </div>
  );
}
