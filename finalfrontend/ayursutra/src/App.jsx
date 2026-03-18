import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import bgImage from "./assets/hero-background.jpg";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Patient components
import PatientRouteWrapper from "./components/patient/PatientRouteWrapper";
import PatientProfileForm from "./components/patient/PatientProfileForm";

import TherapistProfileForm from "./components/therapist/TherapistProfileForm";
import TherapistRouteWrapper from "./components/therapist/TherapistRouteWrapper";

const queryClient = new QueryClient();

const App = () => (
  <>

    <div 

      className="fixed top-0 left-0 w-full h-[120vh] bg-[#efe7d3] -z-50 pointer-events-none bg-cover bg-no-repeat bg-[83%_center] md:bg-[80%_center] xl:bg-center"
      style={{
        backgroundImage: `url(${bgImage})`

      }}
    />

    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* === Public pages === */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* === PATIENT ROUTES === */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles="patient">
                  <PatientRouteWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles="patient">
                  <PatientProfileForm />
                </ProtectedRoute>
              }
            />

            {/* === THERAPIST ROUTES === */}
            <Route
              path="/therapist/*"
              element={
                <ProtectedRoute allowedRoles="therapist">
                  <TherapistRouteWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/profile"
              element={
                <ProtectedRoute allowedRoles="therapist">
                  <TherapistProfileForm  />
                </ProtectedRoute>
              }
            />

            {/* === Catch-all === */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </>
);

export default App;