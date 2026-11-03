import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc 
} from '../services/firebase';

const TrackerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ChartCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  height: 400px;
  box-shadow: var(--card-shadow);

  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  gap: 1rem;
`;

const Tracker: React.FC = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.email) return;

      const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
      const docSnap = await getDoc(diaryRef);
      const logs = docSnap.exists() ? docSnap.data().logs || [] : [];
      
      // Group logs by date and calculate total hours
      const dayMap: { [key: string]: number } = {};
      
      // Get last 7 days for the chart
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = days.map(d => ({ day: d, hours: 0 }));

      logs.forEach((log: any) => {
        // Simple day matching for demo. In real app, use date objects.
        const dayName = log.date.split(' ')[1]; // Assuming format "21 Apr 2026"
        const index = days.indexOf(dayName);
        if (index !== -1) {
          chartData[index].hours += parseFloat(log.duration) / 60;
        }
      });
      
      setData(chartData);
    };
    fetchData();
  }, [currentUser]);

  const totalHours = data.reduce((acc, d) => acc + d.hours, 0).toFixed(1);

  return (
    <TrackerContainer className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Momentum™ - Study Tracker</h2>
        <div style={{ background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
          Weekly Total: <strong>{totalHours}h</strong>
        </div>
      </div>

      <ChartCard>
        <h3>Daily Study Hours (Based on your Diary)</h3>
        {data.length === 0 || totalHours === "0.0" ? (
          <EmptyState>
            <p>No data found in your Study Diary.<br/>Log your sessions in the "Study Diary" tab to see your charts here.</p>
          </EmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--glass-bg)', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard>
        <h3>Learning Momentum</h3>
        {data.length === 0 || totalHours === "0.0" ? (
          <EmptyState>
            <p>Start logging to see your trend line.</p>
          </EmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--glass-bg)', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="hours" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </TrackerContainer>
  );
};

export default Tracker;
