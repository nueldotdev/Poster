import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import { Button } from "./objects/Button";
import { navItems } from "../hooks/navItems";
import { Search, Sparkles } from "lucide-react";
import { TextInput } from "./objects/TextInput";


export const Header = () => {

  const location = useLocation();
  const [enhancementCount, setEnhancementCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : '';
  }

  const handleSearch = () => {
    console.log(`Search initiated!`)
  }

  const updateCount = () => {
    window.api.getEnhancementCount().then((count: number) => {
      setEnhancementCount(count);
    });
  };

  useEffect(() => {
    updateCount();
    // Refresh count periodically in case it changes elsewhere
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="topbar">
      <span className="topbar-title">{getPageTitle()}</span>
      <div className="topbar-actions flex items-center gap-12 ml-auto">

        <div className="search-bar">
          <Search />
          <TextInput
            placeholder="Search your wallpapers"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <div
          className="ai-counter flex items-center gap-6"
          title="Global AI Enhancement Uses"
          style={{
            background: 'var(--surface-2)',
            padding: '4px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            color: enhancementCount >= 5 ? 'var(--text-muted)' : 'var(--accent)',
            border: '1px solid var(--border)'
          }}
        >
          <Sparkles size={14} color={enhancementCount >= 5 ? 'var(--text-muted)' : 'var(--accent)'} />
          <span>{enhancementCount}/5 AI</span>
        </div>
      </div>
    </header>
  );
};
