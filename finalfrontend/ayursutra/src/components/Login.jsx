import React, { useState } from "react";
import LoginPopup from "./LoginPopup";
import { useNavigate } from "react-router-dom";
import { apiPost, apiGet } from "../lib/api";
import { Mail, Lock, UserCheck, LogIn } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ message: "", success: false });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const clearOldSession = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("profileStatus");
      localStorage.removeItem("userProfile");
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("userProfile_") || k.startsWith("therapistProfile") || k.startsWith("patientProfile") ) {
          localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.warn("Failed to clear storage:", err);
    }
  };

  const saveSession = (serverResp) => {
    const token = serverResp.token || serverResp.accessToken || serverResp.jwt || serverResp.tokenString;
    const user = serverResp.user || serverResp.data || serverResp;
    const role = serverResp.role || user?.role || serverResp.type;
    const id = serverResp.id || user?._id || user?.id;

    if (token) localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (id) localStorage.setItem("userId", id);

    try {
      const profileToStore = user && typeof user === "object" ? user : { id };
      if (id) {
        localStorage.setItem(`userProfile_${id}`, JSON.stringify(profileToStore));
      }
      localStorage.setItem("userProfile", JSON.stringify(profileToStore));
    } catch (err) {
      console.warn("Could not cache profile:", err);
    }

    return { token, role, id, user };
  };

  const getProfileEndpoint = (role) => {
    if (!role) return null;
    const roleMap = {
      patient: "patients",
      therapist: "therapists",
    };
    const r = roleMap[role] || `${role}s`;
    return `/api/${r}/profile/`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopupData({ message: "", success: false });

    try {
      clearOldSession();

      const resp = await apiPost("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const tokenFromResp = resp?.token || resp?.accessToken || resp?.jwt;
      const userFromResp = resp?.user || resp?.data || resp;
      const roleFromResp = resp?.role || userFromResp?.role;

      if (!tokenFromResp) {
        setPopupData({ message: resp?.message || "Login failed: no token returned", success: false });
        setShowPopup(true);
        return;
      }

      const { token, role, id, user } = saveSession(resp);

      let profileStatus = "incomplete";
      try {
        const endpointBase = getProfileEndpoint(role);
        if (endpointBase && id) {
          const profile = await apiGet(`${endpointBase}${id}`);
          const profileObj = profile?.patient ?? profile?.therapist ?? profile;
          profileStatus = profileObj?.profileStatus || profileObj?.profile_status || profileStatus;

          try {
            if (id) localStorage.setItem(`userProfile_${id}`, JSON.stringify(profileObj));
            localStorage.setItem("userProfile", JSON.stringify(profileObj));
          } catch (err) {}
        } else {
          profileStatus = resp?.profileStatus || profileStatus;
        }
      } catch (err) {
        profileStatus = resp?.profileStatus || "incomplete";
      }

      localStorage.setItem("profileStatus", profileStatus);

      setPopupData({ message: `Welcome back${user?.name ? `, ${user.name}` : ""}`, success: true });
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);

        if (role === "patient") {
          if (profileStatus === "completed") navigate("/patient");
          else navigate("/patient/profile");
          return;
        }
        if (role === "therapist") {
          if (profileStatus === "completed") navigate("/therapist");
          else navigate("/therapist/profile");
          return;
        }

        navigate("/");
      }, 700);
    } catch (err) {
      const msg = err?.payload?.message || err?.message || "Network error";
      setPopupData({ message: msg, success: false });
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent w-full">
      
      <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite] -z-10" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white/40 backdrop-blur-[40px] border border-white/60 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(30,58,138,0.1)] transition-shadow duration-500 relative z-10 flex flex-col items-center">
        
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 border-[3px] border-white/80 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:scale-110 hover:rotate-6 transition-transform duration-500">
          <UserCheck className="w-10 h-10 text-white drop-shadow-md" />
        </div>

        <h1 className="text-3xl font-black text-blue-950 tracking-tight mb-2">Welcome Back</h1>
        <p className="text-blue-900/80 font-bold text-sm mb-8 text-center leading-relaxed">Continue your wellness journey with Ayursutra</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-blue-900/50 group-focus-within:text-blue-700 transition-colors" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-[1.25rem] py-4 pl-12 pr-5 text-blue-950 font-extrabold placeholder-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white hover:bg-white/80 transition-all duration-300 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-blue-900/50 group-focus-within:text-blue-700 transition-colors" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-[1.25rem] py-4 pl-12 pr-5 text-blue-950 font-extrabold placeholder-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white hover:bg-white/80 transition-all duration-300 shadow-sm"
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-lg py-4 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <LogIn className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Sign In</span>
          </button>
        </form>
      </div>

      {showPopup && (
        <LoginPopup
          onClose={() => setShowPopup(false)}
          message={popupData.message}
          success={popupData.success}
        />
      )}
    </div>
  );
};

export default Login;