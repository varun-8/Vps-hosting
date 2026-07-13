import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">MERN App</Link>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        {localStorage.getItem('token') ? (
          <>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}>Logout</a>
          </>
        ) : (
          <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
