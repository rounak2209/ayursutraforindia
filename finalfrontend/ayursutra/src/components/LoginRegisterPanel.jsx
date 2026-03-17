import React, { useState } from "react";
import Register from "../components/Register";
import Login from "../components/Login";
import { Link } from "react-router-dom";

const LoginRegisterPanel = () => {
  const [currentView, setCurrentView] = useState("");

  return (
    <section id="login-section" className="py-24 bg-transparent relative overflow-hidden">
      
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-teal-950 drop-shadow-sm tracking-tight leading-tight">
            Get Started with <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Panchakarma Care</span>
          </h2>
          <p className="text-lg text-teal-900/70 font-semibold max-w-2xl mx-auto leading-relaxed">
            Choose your role and join thousands of healthcare professionals and
            patients revolutionizing Ayurvedic treatment management.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
          <Link
            to="/Register"
            className="relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <span className="relative z-10">Join Our Community</span>
          </Link>
          <Link
            to="/Login"
            className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/50 text-teal-950 font-extrabold text-base shadow-sm hover:shadow-[0_10px_30px_rgba(20,184,166,0.15)] hover:bg-white/40 transition-all duration-300 hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        <div className="max-w-md mx-auto mb-16">
          {currentView === "register" && <Register />}
          {currentView === "login" && <Login />}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          <div className="bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-[30px] border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] transition-all duration-500 group text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 to-teal-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 w-28 h-28 mx-auto rounded-[1.5rem] border-[3px] border-white/70 overflow-hidden shadow-lg mb-6 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-emerald-500/30 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80" 
                alt="Patient Wellness" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="relative z-10 text-2xl font-black text-teal-950 mb-3 group-hover:text-emerald-700 transition-colors duration-300">For Patients</h3>
            <p className="relative z-10 text-teal-900/80 font-semibold text-base leading-relaxed">
              Discover personalized Ayurvedic treatments and connect with
              certified practitioners for your wellness journey.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-[30px] border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] transition-all duration-500 group text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-teal-100/0 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 w-28 h-28 mx-auto rounded-[1.5rem] border-[3px] border-white/70 overflow-hidden shadow-lg mb-6 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-teal-500/30 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80" 
                alt="Ayurvedic Therapist" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="relative z-10 text-2xl font-black text-teal-950 mb-3 group-hover:text-teal-700 transition-colors duration-300">For Therapists</h3>
            <p className="relative z-10 text-teal-900/80 font-semibold text-base leading-relaxed">
              Showcase your Panchkarma specializations and offer therapeutic
              sessions to wellness seekers.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LoginRegisterPanel;