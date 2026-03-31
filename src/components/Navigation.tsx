import React from 'react';
import { Link } from 'react-router-dom';
import { logo } from '../assets/Index';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
            <img src={logo} className="logo" alt="logo" />
          <Link to="/">Poster App</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/app">Home</Link>
          </li>
          <li>
            <Link to="/app/about">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;