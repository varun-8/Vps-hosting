import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addAdminMessage, setAddAdminMessage] = useState({ text: '', type: '' });
  
  const [stats, setStats] = useState({ totalAdmins: 0, currentName: '' });
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [nameRes, statsRes, historyRes] = await Promise.all([
        fetch('/api/name'),
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/history', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const nameData = await nameRes.json();
      if (nameData.name) setName(nameData.name);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Name updated successfully!', type: 'success' });
        fetchDashboardData(); // Refresh history and stats
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setMessage({ text: data.message || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddAdminMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setAddAdminMessage({ text: 'Admin created successfully!', type: 'success' });
        setNewUsername('');
        setNewPassword('');
        fetchDashboardData(); // Refresh history and stats
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setAddAdminMessage({ text: data.message || 'Creation failed', type: 'error' });
      }
    } catch (err) {
      setAddAdminMessage({ text: 'Network error', type: 'error' });
    }
  };

  if (loading) return <div className="card"><p>Loading Dashboard...</p></div>;

  return (
    <div className="dashboard-layout">
      {/* Left Column: Settings */}
      <div className="dashboard-panel">
        <h2>Control Panel</h2>
        
        <h3>Display Name</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Configure the public name for your portfolio.</p>
        {message.text && (
          <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Display Name"
              required 
            />
          </div>
          <button type="submit" className="btn">Save Changes</button>
        </form>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        <h3>Add New Admin</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Create credentials for another administrator.</p>
        {addAdminMessage.text && (
          <div className={addAdminMessage.type === 'success' ? 'success-msg' : 'error-msg'}>
            {addAdminMessage.text}
          </div>
        )}
        <form onSubmit={handleAddAdmin}>
          <div className="form-group">
            <label>New Username</label>
            <input 
              type="text" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn">Create Admin</button>
        </form>
      </div>

      {/* Right Column: Stats & History */}
      <div className="dashboard-panel">
        <h2>Overview</h2>
        
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalAdmins}</div>
            <div className="stat-label">Total Admins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1.2rem', padding: '0.8rem 0' }}>
              {stats.currentName || 'N/A'}
            </div>
            <div className="stat-label">Current Name</div>
          </div>
        </div>

        <h3>Activity Log</h3>
        <div className="activity-list">
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-action">{item.action}</div>
                <div className="activity-details">{item.details}</div>
                <div className="activity-time">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
