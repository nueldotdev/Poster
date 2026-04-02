import React from "react";
import { Home, Clock, PlusIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "./objects/Button";


const navItems = [
  { name: 'Home', path: '/app/', icon: <Home size={18} className='nav-icon' /> },
  { name: 'Recents', path: '/app/recents', icon: <Clock size={18} className='nav-icon' /> },
  // { name: 'Settings', path: '/app/settings', icon: <Settings size={18} /> },
];


export const Header = () => {

  const location = useLocation();

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : '';
  }


  return (
    <header className="topbar">
      <span className="topbar-title">{getPageTitle()}</span>
      <div className="search-bar">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search wallpapers..." />
      </div>
      {/* <div className="topbar-actions">
        <Button className="rounded-sm primary" size="md">
          <PlusIcon size={18} className="mr-2" />
        </Button>
      </div> */}
    </header>
  );
};
