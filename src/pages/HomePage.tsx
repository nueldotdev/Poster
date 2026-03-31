// import { contextBridge } from 'electron';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const handleClick = async () => {
    const result = await window.api.getOnboarded();
    console.log("Onboarded Status: ", result);
    
    result === true ? navigate('/app/home') : navigate('/');
  }

  return (
    <div className="text-center">
      <h1 className="page-title">Welcome to Poster</h1>
      <p className="page-subtitle">This is the home page of your Electron app.</p>
      <div className="page-container">
        <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: '600' }}>Get Started</h2>
        <p>Your app is now running with React, TypeScript, and custom CSS!</p>
        <div className="mt-8">
          <button className="btn btn-primary" onClick={handleClick}>
            Explore Features
          </button>
        </div>
      </div>
    </div>
  );
}