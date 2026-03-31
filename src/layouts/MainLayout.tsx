import React from 'react';
import Navigation from '../components/Navigation';
import { Outlet } from 'react-router-dom';
import "../styles/layout.css"

// interface MainLayoutProps {
//   children: React.ReactNode;
// }

const MainLayout = () => {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;