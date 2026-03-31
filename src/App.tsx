import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import Index from "./pages/Index";
import Onboarding from "./pages/onboarding/Onboarding";
import { Toaster } from "sonner";

const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            color: "#1C1917",
            border: "0.5px solid rgba(0,0,0,0.08)",
            fontSize: "14px",
          },
          classNames: {
            error: "toast-error",
            success: "toast-success",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
