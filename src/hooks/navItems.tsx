import { Home, Heart, LayoutGrid, Settings, Play } from "lucide-react";

const navItems = [
  { name: 'Home', path: '/app/', icon: <Home size={18} className='nav-icon' /> },
  { name: 'Favorites', path: '/app/favorites', icon: <Heart size={18} className='nav-icon' /> },
  { name: 'Slideshow', path: '/app/slideshow', icon: <Play size={18} className='nav-icon' /> },
  // { name: 'Boards', path: '/app/boards', icon: <LayoutGrid size={18} className='nav-icon' /> },
  { name: 'Settings', path: '/app/settings', icon: <Settings size={18} /> },
];


export { navItems };