import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logo } from '../assets/Index';
import { navItems } from '../hooks/navItems';
import { Zap } from 'lucide-react';
import { Button } from './objects/Button';


const Navigation = () => {
  const location = useLocation()
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    window.api.getProStatus().then(setIsPro);
  }, []);

  const handleTogglePro = async () => {
    const status = await window.api.togglePro();
    setIsPro(status);
  };
  
  return (
    <nav className='sidebar'>
      <div className='logo'>
        <div className='logo-mark'>
          <img src={logo} alt='Logo' />
        </div>
        <div className='flex flex-col'>
          <h1 className='logo-text'>Poster</h1>
          {isPro && <span className='pro-badge'><Zap size={10} fill="currentColor" /> PRO</span>}
        </div>
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

      {!isPro && (
        <div className='sidebar-footer'>
          <div className='pro-card'>
            <div className='pro-card-info'>
              <h4 className=''>Unlock Poster Pro</h4>
              <p className=''>Get enhancement, multi-monitor and more!</p>
            </div>
            <Button className='primary rounded-sm full-w' onClick={handleTogglePro}>
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;