import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/objects/Loader";
import { Animated } from "../components/objects/Animated";
import { logo } from "../assets/Index";
import { Button } from "../components/objects/Button";

export default function Onboarding() {
  // const [loading, setLoading] = useState<boolean>(true);
  // const [onboarded, setOnboarded] = useState<boolean>(false);
  // const navigate = useNavigate();


  return (
    <Animated.div className="flex flex-col items-center text-center justify-center h-screen slide-up fade-in overflow-hidden">
      <h1>Welcome to Poster!</h1>
      <p>Let's get you set up.</p>

      <Button style={{ marginTop: "10px" }} className={`rounded primary`}>
        Get Started
      </Button>
    </Animated.div>
  );
}
