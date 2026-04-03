import React from 'react';
import Navigation from '../components/Navigation';
import { Outlet } from 'react-router-dom';
import "../styles/layout.css"
import { Header } from '../components/Header';


const MainLayout = () => {
  return (
    <div className="app w-full h-screen">
      <Navigation />
      <main className="main">
        <Header />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;