import React from 'react';
import { Link } from 'react-router-dom';
import { logo } from '../assets/Index';
import { Clock, Home } from 'lucide-react';


const navItems = [
  { name: 'Home', path: '/app/', icon: <Home size={18} /> },
  // { name: 'Recents', path: '/app/projects', icon: <Clock size={18} /> },
  // { name: 'Settings', path: '/app/settings', icon: <Settings size={18} /> },
];

const Navigation = () => {
  return (
    <nav className='side-nav'>
      <div className='nav-header'>
        <img src={logo} alt='Logo' className='nav-logo' />
        <h1 className='nav-title'>Poster</h1>
      </div>
      <ul className='nav-list'>
        {navItems.map((item) => (
          <li key={item.name} className='nav-item'>
            <Link to={item.path} className='nav-link'>
              {item.icon}
              <span className='nav-text'>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;