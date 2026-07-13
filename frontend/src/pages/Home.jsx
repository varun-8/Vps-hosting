import React, { useState, useEffect } from 'react';

function Home() {
  const [name, setName] = useState('Loading...');

  useEffect(() => {
    fetch('/api/name')
      .then(res => res.json())
      .then(data => {
        if (data.name) setName(data.name);
      })
      .catch(err => {
        console.error('Error fetching name:', err);
        setName('Error loading name');
      });
  }, []);

  return (
    <div className="card">
      <p style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Welcome to my portfolio</p>
      <h1>My name is {name}</h1>
      <p style={{ marginTop: '1.5rem' }}>This is a premium MERN stack application ready for VPS hosting.</p>
    </div>
  );
}

export default Home;
