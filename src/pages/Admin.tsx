import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  collection, 
  safeGetDoc as getDoc, 
  safeGetDocs as getDocs 
} from '../services/firebase';

const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AdminCard = styled.div`
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid var(--glass-border);
  }
  
  th { color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 0.8rem; }
  td { color: var(--text-main); font-size: 0.95rem; }
`;

const Badge = styled.span<{ color: string }>`
  background: ${props => props.color};
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
`;

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (currentUser?.role !== 'admin') return;
      
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = await Promise.all(querySnapshot.docs.map(async (userDoc) => {
          const data = userDoc.data();
          // Fetch diary count
          const diaryRef = doc(db, 'users', data.email, 'data', 'diary');
          const diarySnap = await getDoc(diaryRef);
          const logs = diarySnap.exists() ? diarySnap.data().logs || [] : [];
          
          return {
            ...data,
            logCount: logs.length,
            totalMinutes: logs.reduce((acc: number, l: any) => acc + parseFloat(l.duration || 0), 0)
          };
        }));
        setUsers(usersData);
      } catch (err) {
        console.error("Admin fetch error:", err);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [currentUser]);

  if (currentUser?.role !== 'admin') {
    return <div style={{ textAlign: 'center', padding: '5rem' }}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <AdminContainer className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Intelligence Dashboard</h2>
      <p style={{ color: 'var(--text-muted)' }}>Monitor platform growth, user activity, and engagement metrics.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <AdminCard>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Registered Users</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{users.length}</div>
        </AdminCard>
        <AdminCard>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Global Study Sessions</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{users.reduce((acc, u) => acc + u.logCount, 0)}</div>
        </AdminCard>
        <AdminCard>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Hours Tracked</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{Math.round(users.reduce((acc, u) => acc + u.totalMinutes, 0) / 60)}h</div>
        </AdminCard>
      </div>

      <AdminCard>
        <h3>User Activity Monitor</h3>
        <UserTable>
          <thead>
            <tr>
              <th>User</th>
              <th>Class</th>
              <th>Sessions</th>
              <th>Total Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td>{u.class || 'N/A'}</td>
                <td>{u.logCount}</td>
                <td>{Math.round(u.totalMinutes / 60)}h {Math.round(u.totalMinutes % 60)}m</td>
                <td>
                  <Badge color={u.role === 'admin' ? '#f43f5e' : '#3b82f6'}>
                    {u.role?.toUpperCase() || 'USER'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </UserTable>
      </AdminCard>
    </AdminContainer>
  );
};

export default Admin;
