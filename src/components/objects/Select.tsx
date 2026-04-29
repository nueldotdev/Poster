import React, { useState } from "react";
import { TextInput } from "./TextInput";
import { Wallpaper } from "../../electron.d";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import "../../styles/components/objects/Select.css";

const Dropdown = ({
  options,
  onSelect,
  isOpen
}: {
  options: Wallpaper[];
  onSelect: (option: Wallpaper) => void;
  isOpen: boolean
}) => {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown">
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                onSelect(option);
              }}
            >
              <div>
                <img src={`${option.url}`} alt="" />
              </div>
              <div>
                <p>{option.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Select = () => {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<Wallpaper[]>([]);
  const navigate = useNavigate();

  const handleSelect = (option: Wallpaper) => {
    navigate(`/app/wallpaper/${option.id}`);
  };

  const handleSearch = async () => {
    try {
      const results = await window.api.getSearchResults(searchValue);
      console.log(results);
      setResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div>
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
          style={{
            padding: "10px",
          }}
        />
      </div>
      {results.length > 0 && (
        <Dropdown
          options={results}
          onSelect={(option) => handleSelect(option)}
          isOpen
        />
      )}
    </div>
  );
};
