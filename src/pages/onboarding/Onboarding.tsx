import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logo } from "../../assets/Index";
import { Button } from "../../components/objects/Button";
import "../../styles/onboarding.css";
import { TextInput } from "../../components/objects/TextInput";
import { toast } from "sonner";
import MasonryBackground from "../../components/MasonryBackground";

export default function Onboarding() {
  // const [loading, setLoading] = useState<boolean>(true);
  // const [onboarded, setOnboarded] = useState<boolean>(false);
  const navigate = useNavigate();
  const [getStarted, setGetStarted] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  const handleGetStarted = () => {
    setGetStarted(true);
  };

  const handleSetName = async () => {
    const res = await window.api.setName(name);
    console.log("Name set response:", res);
    return res;
  };

  const handleName = () => {
    if (name.trim() !== "") {
      // Save the name to local storage or state management
      handleSetName();
      toast.success(`Welcome, ${name}! Your name has been saved.`);
      navigate("/app/");
    } else {
      toast.error("Please enter a valid name.");
    }
  };

  return (
    <>
      <MasonryBackground />
      <div className="flex flex-col items-center text-center justify-center h-screen slide-up fade-in overflow-hidden v-gap z-index">
        <img src={logo} alt="Logo" />
        <h1>
          Welcome to <span className="keyword">Poster</span>
        </h1>
        {getStarted == false && (
          <div className="flex flex-col items-center text-center justify-center v-gap slide-up fade-in z-index">
            <p className="text-secondary">Let's get you all set up.</p>
            <Button
              className={`rounded-sm primary`}
              onClick={() => {
                console.log("Get Started Clicked");
                handleGetStarted();
              }}
              size="lg"
            >
              Get Started
            </Button>
          </div>
        )}
        {getStarted == true && (
          <div className=" text-center v-gap slide-up fade-in z-index">
            <p className="text-secondary">What should we call you?</p>
            <div className="flex flex-col items-center text-center fade-in slide-up justify-center v-gap">
              {/* Ask user for name */}
              <TextInput
                placeholder="Enter your name"
                className="rounded-sm text-center onb-input"
                size="2xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleName();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
