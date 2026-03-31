import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Loader from "../components/objects/Loader";
// import { Animated } from "../components/objects/Animated";
// import { logo } from "../assets/Index";
import { Button } from "../components/objects/Button";
import "../styles/onboarding.css";
import { TextInput } from "../components/objects/TextInput";
import { toast } from "sonner";

export default function Onboarding() {
  // const [loading, setLoading] = useState<boolean>(true);
  // const [onboarded, setOnboarded] = useState<boolean>(false);
  // const navigate = useNavigate();
  const [getStarted, setGetStarted] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  const handleGetStarted = () => {
    setGetStarted(true);
  };


  const handleName = () => {
    if (name.trim() !== "") {
      toast.success(`Welcome, ${name}!`);
      // Save the name to local storage or state management
      localStorage.setItem("userName", name);
      // Navigate to the main app or dashboard
      // navigate("/app");
    } else {
      toast.error("Please enter a valid name.");
    }
  }

  return (
    <div className="flex flex-col items-center text-center justify-center h-screen slide-up fade-in overflow-hidden v-gap">
      <h1>Welcome to poster!</h1>
      {getStarted == false && (
        <div className="flex flex-col items-center text-center justify-center v-gap slide-up fade-in">
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
        <div className=" text-center v-gap slide-up fade-in">
          <p className="text-secondary">What should we call you?</p>
          <div className="flex flex-col items-center text-center fade-in slide-up justify-center v-gap">
            {/* Ask user for name */}
            <TextInput placeholder="Enter your name" className="rounded-sm only-bottom-border text-center" size="2xl" type="outline" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleName();
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
