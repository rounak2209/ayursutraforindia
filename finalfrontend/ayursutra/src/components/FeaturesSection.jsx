import { Calendar, Activity, Bell, MessageSquare, BarChart3, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const features = [
  {
    icon: Calendar,
    title: "Automated Therapy Scheduling",
    description: "Intelligent scheduling system that manages complex Panchakarma therapy sequences, therapist availability, and patient preferences seamlessly."
  },
  {
    icon: Activity,
    title: "Real-Time Therapy Tracking",
    description: "Monitor therapy progress, vital signs, and patient responses in real-time with comprehensive digital health records."
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Pre and post-procedure reminders, medication alerts, and personalized care instructions delivered at the right time."
  },
  {
    icon: MessageSquare,
    title: "Patient Feedback Integration",
    description: "Continuous feedback loop allowing patients to report their experience and enabling therapists to adjust treatments accordingly."
  },
  {
    icon: BarChart3,
    title: "Progress Visualization",
    description: "Advanced analytics and visual progress reports helping track healing journey and treatment effectiveness."
  },
  {
    icon: Clock,
    title: "Treatment Timeline Management",
    description: "Comprehensive timeline view of the entire Panchakarma journey from consultation to post-treatment follow-up."
  }
];

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-transparent relative overflow-hidden">
      
      <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '3s' }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 overflow-hidden">
        
        <div className={`text-center mb-20 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-teal-800 font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Platform Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-teal-950 tracking-tight">
            Core <span className="text-emerald-600">Features</span>
          </h2>
          <p className="text-xl text-teal-900/70 font-medium max-w-2xl mx-auto leading-relaxed">
            Comprehensive tools designed specifically for Panchakarma therapy management, 
            ensuring optimal care delivery and patient satisfaction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden py-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div 
                key={index}
                className={`group relative p-8 md:p-10 rounded-[2.5rem] bg-white/20 backdrop-blur-2xl border border-white/40 hover:bg-white/30 hover:border-white/60 transition-all duration-700 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(20,184,166,0.1)] hover:-translate-y-2 flex flex-col h-full cursor-default transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 via-transparent to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  
                  <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500 ease-out">
                    <Icon className="w-7 h-7 text-teal-700" />
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-teal-950 mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-teal-900/70 font-medium text-lg leading-relaxed flex-grow mb-8">
                    {feature.description}
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-white/60 shadow-sm">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full group-hover:animate-pulse"></div>
                    </div>
                    <span className="text-sm font-bold text-teal-800 uppercase tracking-widest">Active</span>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;