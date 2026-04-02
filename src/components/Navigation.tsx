import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logo } from '../assets/Index';
import { Clock, Home } from 'lucide-react';


const navItems = [
  { name: 'Home', path: '/app/', icon: <Home size={18} className='nav-icon' /> },
  { name: 'Recents', path: '/app/recents', icon: <Clock size={18} className='nav-icon' /> },
  // { name: 'Settings', path: '/app/settings', icon: <Settings size={18} /> },
];

const Navigation = () => {
  const location = useLocation()
  
  return (
    <nav className='sidebar'>
      <div className='logo'>
        <div className='logo-mark'>
          <img src={logo} alt='Logo' />
        </div>
        <h1 className='logo-text'>Poster</h1>
      </div>
      <ul className='nav'>
        {navItems.map((item) => (
          <li key={item.name} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            <Link to={item.path} className={`nav-link`}>
              {item.icon}
              <span className=''>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;