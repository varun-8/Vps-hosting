import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/name')
      .then(res => res.json())
      .then(data => {
        if (data.name) setName(data.name);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching name:', err);
        setLoading(false);
      });
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

  if (loading) return <div className="card"><p>Loading...</p></div>;

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>
      <p>Configure the display name for your portfolio.</p>

      {message.text && (
        <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn">Save Changes</button>
      </form>
    </div>
  );
}

export default Admin;
