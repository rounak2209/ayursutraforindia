import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { HashLink } from "react-router-hash-link"; 

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none -z-10" />

      {}
      <div className="relative z-10 container mx-auto px-6 text-center pt-16">
        <div className="max-w-5xl mx-auto">
          
          {}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] mb-8 animate-[bounce_3s_ease-in-out_infinite] hover:bg-white/20 transition-colors cursor-pointer">
            <span className="text-sm font-bold tracking-wide">🌿 Powered by AyurSutra</span>
          </div>

          {}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight drop-shadow-lg">
            Smart Panchakarma
            <span className="block bg-gradient-to-r from-teal-300 via-emerald-300 to-green-300 bg-clip-text text-transparent drop-shadow-md pb-2">
              Management
            </span>
            <span className="block text-4xl md:text-5xl mt-2 font-bold text-white/90">
              for Holistic Healing
            </span>
          </h1>

          {}
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Automated scheduling, real-time tracking, and patient-centric care.
            <span className="block mt-3 text-lg opacity-80 font-normal">
              Bridging ancient Ayurveda wisdom with cutting-edge technology.
            </span>
          </p>

          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <HashLink smooth to="#login-section">
              <Button
                size="lg"
                className="text-lg px-8 py-7 h-auto rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white border border-white/30 shadow-[0_8px_30px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.5)] transition-all duration-300 hover:-translate-y-1 font-bold group"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </HashLink>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { label: "Happy Patients", value: "500+" },
              { label: "Certified Therapists", value: "50+" },
              { label: "Success Rate", value: "98%" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-3 hover:bg-white/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] transition-all duration-300 group">
                <div className="text-4xl font-extrabold text-white mb-2 drop-shadow-md group-hover:scale-105 transition-transform duration-300">{stat.value}</div>
                <div className="text-white/80 font-bold uppercase tracking-widest text-sm drop-shadow-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;