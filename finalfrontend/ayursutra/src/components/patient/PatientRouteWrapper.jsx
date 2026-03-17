
import React, { useEffect, useState } from "react";
import PatientDashboard from "./PatientDashboard";
import PatientProfileForm from "./PatientProfileForm";
import { apiGet, apiPut } from "@/lib/api";

/**
 * PatientRouteWrapper
 * - Ensures the user is authenticated and has the "patient" role.
 * - Loads patient profileStatus from /api/patients/profile/:id.
 * - If profileStatus !== "completed" shows PatientProfileForm.
 * - When PatientProfileForm calls onComplete, we persist the full profile (matching backend schema)
 *   and switch to the PatientDashboard.
 */
const PatientRouteWrapper = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfileStatus = async () => {
      setChecking(true);
      setErrorMsg(null);

      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // quick auth/role guard
        if (!userId || !token || role !== "patient") {
          console.warn("Not authenticated as patient — redirecting to login");
          window.location.href = "/login";
          return;
        }

        
        const data = await apiGet(`/api/patients/profile/${userId}`);

        
        const profileObj = data && data.patient ? data.patient : data;

        if (!mounted) return;

        const status = profileObj?.profileStatus || profileObj?.profile_status || "incomplete";
        setIsProfileComplete(status === "completed");

        // Optionally cache the patient profile for quick access from other UIs
        try { localStorage.setItem("patientProfile", JSON.stringify(profileObj)); } catch (e) { /* ignore */ }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // If unauthorized, clear local tokens and redirect to login
        if (err?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          window.location.href = "/login";
          return;
        }
        setErrorMsg(err?.message || "Failed to load profile");
      } finally {
        if (mounted) setChecking(false);
      }
    };

    fetchProfileStatus();
    return () => { mounted = false; };
  }, []);

  /**
   * Called by PatientProfileForm after user fills the form.
   * Accepts a flat formData and converts it into the nested patient schema,
   * then calls PUT /api/patients/profile/:id to save.
   */
  const handleProfileComplete = async (formData) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        window.location.href = "/login";
        return;
      }

      // Build nested payload to match backend Patient schema
      const payload = {
        name: formData.name || "",
        email: formData.email || undefined, // include if present
        personalDetails: {
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          gender: formData.gender || undefined,
          contactNumber: formData.contactNumber || formData.phone || undefined
        },
        healthProfile: {
          prakritiType: formData.prakritiType || undefined,
          doshaImbalance: formData.doshaImbalance || undefined,
          allergies: formData.allergies || undefined,
          medicalHistory: formData.medicalHistory || undefined
        },
        prescriptionDetails: {
          prescribedTherapy: formData.prescribedTherapy || undefined,
          duration: formData.duration || undefined,
          hasPrescription: Boolean(formData.prescribedTherapy)
        },
        profileStatus: "completed"
      };

      // Remove undefined keys (so we don't accidentally overwrite with undefined)
      const cleanPayload = JSON.parse(JSON.stringify(payload));

      const updated = await apiPut(`/api/patients/profile/${userId}`, cleanPayload);

      // store minimal cached copy
      try { localStorage.setItem("patientProfile", JSON.stringify(updated.patient || updated)); } catch (e) { /* ignore */ }

      setIsProfileComplete(true);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // handle unauthorized
      if (err?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return;
      }
      // show nice error (PatientProfileForm can also show its own)
      setErrorMsg(err?.message || "Failed to save profile");
      // keep on profile form so user can retry
    }
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If there was a non-fatal error, show the profile form and allow retry/save
  if (errorMsg && !isProfileComplete) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-4 text-center text-destructive">Error: {errorMsg}</div>
        <PatientProfileForm onComplete={handleProfileComplete} />
      </div>
    );
  }

  return isProfileComplete ? (
    <PatientDashboard />
  ) : (
    <PatientProfileForm onComplete={handleProfileComplete} />
  );
};

export default PatientRouteWrapper;
