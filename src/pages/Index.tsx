import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/objects/Loader";
import { Animated } from "../components/objects/Animated";
import { logo } from "../assets/Index";
import { Button } from "../components/objects/Button";

export default function Index() {
  const [loading, setLoading] = useState<boolean>(true);
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const navigate = useNavigate();

  const getOnboardedStatus = async () => {
    const res = await window.api.getOnboarded();
    console.log("Onboarded Status: ", res);
    return res;
  };

  useEffect(() => {
    try {
      getOnboardedStatus().then((res) => {
        setOnboarded(res);
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      });
    } catch (error) {
      console.log("Error fetching onboarded status: ", error);
    }
  }, []);

  const handleContinue = () => {
    if (onboarded === false) {
      window.api.setOnboarded(false);
    }
    navigate('/app/home');
  }


  const Content1 = () => {
    return (
      <>
        <img src={logo} alt="Poster Logo" />
        <Loader />
      </>
    );
  };

  const  Content2 = () => {
    return (
      <div>
        <h1>Welcome to Poster!</h1>
        <p>Let's get you set up.</p>

        <Button style={{marginTop: '10px'}} className={`rounded primary`}>
        {onboarded ? 'Continue to App' : 'Get Started'}
      </Button>
      </div>
    )
  }

  const Redirect = () => {
    navigate('/onboarding');

    return (
      <></>
    );
  }

  return (
    <Animated.div className="flex flex-col items-center text-center justify-center h-screen slide-up fade-in overflow-hidden">
      {loading ? <Content1 /> :  <Redirect />}
    </Animated.div>
  );
}
