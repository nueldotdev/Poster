import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/objects/Loader';
import { Animated } from '../components/objects/Animated';


export default function Index() {
  const [onboarded, setOnboarded] = useState(undefined);
  const navigate = useNavigate();

  const getOnboardedStatus = async () => {
    const res = await window.api.getOnboarded();
    console.log("Onboarded Status: ", res);
    return res;
  }


  useEffect(() => {
    try {
      const status = getOnboardedStatus();
      setOnboarded(status);
    } catch (error) {
      console.log("Error fetching onboarded status: ", error);
    }
  }, []);

  useEffect(() => {
    onboarded === true ? navigate("/app") : console.log("User not onboarded, staying on index page.");
  }, [onboarded])

  


  return (
   <Animated.div className="flex flex-col items-center text-center justify-center h-screen slide-up fade-in overflow-hidden">
     {/* <div className="text-center flex flex-col items-center justify-center h-screen"> */}
      <h1 className="page-title">Welcome to Poster</h1>
      <Loader />
    {/* </div> */}
    </Animated.div>
  );
}