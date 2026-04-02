// import { contextBridge } from 'electron';
import React from "react";
// import { useNavigate } from "react-router-dom";
import '../styles/page.css'
import CurrentBlock from "../components/homepage/CurrentBlock";
import RecentUse from "../components/homepage/RecentUse";
import Collection from "../components/Collection";

export default function HomePage() {
  return (
    <div className="page-container slide-up fade-in">
      <CurrentBlock />
      <RecentUse />
      <div className="mt-8 w-full">
        <Collection />
      </div>
    </div>
  );
}
