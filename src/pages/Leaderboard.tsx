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

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'var(--primary)' : 'var(--glass-bg)'};
  color: ${props => props.active ? 'white' : 'var(--text-muted)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--glass-border)'};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? '0 4px 15px rgba(var(--primary-hsl), 0.3)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'var(--primary)' : 'var(--glass-hover)'};
    color: ${props => props.active ? 'white' : 'var(--text-main)'};
  }
`;

const RankTable = styled.div`
  background: var(--glass-bg);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: var(--card-shadow);
`;

const RankRow = styled.div<{ isMe?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--glass-border);
  background: ${props => props.isMe ? 'rgba(var(--primary-hsl), 0.1)' : 'transparent'};
  
  &:last-child { border-bottom: none; }

  .rank {
    width: 40px;
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--primary);
  }

  .user {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 600;
    }
  }

  .hours {
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    margin-right: 1.5rem;
  }
`;

const FriendButton = styled.button<{ isFriend: boolean }>`
  background: ${props => props.isFriend ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.isFriend ? '#f43f5e' : '#10b981'};
  border: 1px solid ${props => props.isFriend ? '#f43f5e' : '#10b981'};
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isFriend ? '#f43f5e' : '#10b981'};
    color: white;
  }
`;

const Leaderboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [friends, setFriends] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = await Promise.all(querySnapshot.docs.map(async (uDoc) => {
          const data = uDoc.data();
          
          // Calculate level from their real logs
          const diaryRef = doc(db, 'users', data.email, 'data', 'diary');
          const diarySnap = await getDoc(diaryRef);
          const logs = diarySnap.exists() ? diarySnap.data().logs || [] : [];
          const totalMinutes = logs.reduce((acc: number, l: any) => acc + parseFloat(l.duration || 0), 0);
          const level = Math.floor(Math.sqrt((totalMinutes * 10) / 200)) + 1;

          return {
            email: data.email,
            name: data.name || 'Student',
            hours: Math.round(totalMinutes / 60),
            minutes: Math.round(totalMinutes % 60),
            level,
            avatar: data.avatar || (data.name?.[0] || 'S').toUpperCase(),
            isMe: data.email === currentUser?.email
          };
        }));
        
        let finalUsersList = usersList;
        if (usersList.length <= 1) {
          const mocks = [
            { email: 'king@axona.app', name: 'Neuro-King', hours: 45, minutes: 30, level: 8, avatar: 'N', isMe: false },
            { email: 'genius@axona.app', name: 'DeepFocusGenius', hours: 32, minutes: 15, level: 6, avatar: 'D', isMe: false },
            { email: 'abhranil@axona.app', name: 'Abhranil (abhracoder)', hours: 28, minutes: 45, level: 5, avatar: 'A', isMe: false },
            { email: 'scholar@axona.app', name: 'FocusMaster-99', hours: 18, minutes: 20, level: 3, avatar: 'F', isMe: false },
          ];
          const me = usersList.find(u => u.isMe) || {
            email: currentUser?.email || 'me@axona.app',
            name: currentUser?.name || 'Neuro-Master',
            hours: 0,
            minutes: 0,
            level: 1,
            avatar: (currentUser?.name?.[0] || 'M').toUpperCase(),
            isMe: true
          };
          // Filter out if my email is already in mocks (prevent duplicates)
          finalUsersList = [me, ...mocks.filter(m => m.email !== me.email)];
        }
        
        // Sort by level then by hours
        const sorted = finalUsersList.sort((a, b) => b.level !== a.level ? b.level - a.level : b.hours - a.hours);
        setUsers(sorted.map((u, i) => ({ ...u, rank: i + 1 })));
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
      setLoading(false);
    };

    const savedFriends = localStorage.getItem(`ff_friends_${currentUser?.email}`);
    if (savedFriends) setFriends(JSON.parse(savedFriends));
    fetchUsers();
  }, [currentUser]);

  const toggleFriend = (name: string) => {
    if (!currentUser?.email) return;
    let updatedFriends;
    if (friends.includes(name)) {
      updatedFriends = friends.filter(f => f !== name);
    } else {
      updatedFriends = [...friends, name];
    }
    setFriends(updatedFriends);
    localStorage.setItem(`ff_friends_${currentUser.email}`, JSON.stringify(updatedFriends));
  };
  
  const displayUsers = activeTab === 'global' 
    ? users 
    : users.filter(u => u.isMe || friends.includes(u.name));

  return (
    <LeaderboardContainer className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Community</h2>
        <p style={{ color: 'var(--text-muted)' }}>Connect with top students and build your study circle.</p>
      </div>

      <Tabs>
        <Tab active={activeTab === 'global'} onClick={() => setActiveTab('global')}>Global Leaderboard</Tab>
        <Tab active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>My Friends ({friends.length})</Tab>
      </Tabs>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading the leaderboard...</p>
      ) : displayUsers.length === 1 && activeTab === 'friends' ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 style={{ marginTop: '0.5rem', color: 'white' }}>No friends yet!</h3>
          <p style={{ color: 'var(--text-muted)' }}>Go to the Global Leaderboard and add some friends to study together.</p>
        </div>
      ) : (
        <RankTable>
          {displayUsers.map(u => (
            <RankRow key={u.email} isMe={u.isMe}>
              <div className="rank">#{u.rank}</div>
              <div className="user">
                <div className="avatar" style={{ 
                  background: u.isMe ? 'var(--primary)' : 'var(--glass-border)', 
                  color: u.isMe ? 'white' : 'inherit',
                  position: 'relative',
                  border: u.rank <= 3 ? '2px solid #ffd700' : 'none'
                }}>
                  {u.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.name} {u.isMe && '(You)'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>LVL {u.level}</div>
                </div>
              </div>
              <div className="hours">{u.hours}h {u.minutes}m</div>
              {!u.isMe && (
                <FriendButton 
                   isFriend={friends.includes(u.name)}
                   onClick={() => toggleFriend(u.name)}
                >
                  {friends.includes(u.name) ? '- Remove' : '+ Add Friend'}
                </FriendButton>
              )}
            </RankRow>
          ))}
        </RankTable>
      )}
    </LeaderboardContainer>
  );
};

export default Leaderboard;
