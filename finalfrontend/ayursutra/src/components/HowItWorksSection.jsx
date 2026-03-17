import { Calendar, UserCheck, Activity, Bell, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Book Therapy",
    description:
      "Schedule your Panchakarma consultation and therapy sessions through our intuitive booking system.",
    step: "01",
  },
  {
    icon: UserCheck,
    title: "Get Assigned",
    description:
      "Our software matches you with certified therapists based on your constitution (Prakriti) and treatment needs.",
    step: "02",
  },
  {
    icon: Activity,
    title: "Attend Sessions",
    description:
      "Follow your personalized therapy schedule with real-time guidance and progress tracking.",
    step: "03",
  },
  {
    icon: Bell,
    title: "Receive Notifications",
    description:
      "Get timely reminders for treatments, dietary guidelines, and post-therapy care instructions.",
    step: "04",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description:
      "Monitor your healing journey with comprehensive analytics and personalized health insights.",
    step: "05",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden bg-transparent">
      
      {}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-teal-400/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-400/10 rounded-full blur-[100px] animate-[pulse_12s_ease-in-out_infinite] -z-10" style={{ animationDelay: '3s' }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-24">
          <span className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-teal-900 font-extrabold text-sm shadow-sm mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Simple Process
          </span>
          <h2 className="text-5xl md:text-[5rem] font-black text-teal-950 mb-6 tracking-tighter leading-tight drop-shadow-sm">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Works</span>
          </h2>
          <p className="text-xl text-teal-900/70 font-semibold max-w-2xl mx-auto leading-relaxed">
            Experience a seamless journey from consultation to complete
            healing with our step-by-step management process.
          </p>
        </div>

        {/* Vertical Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Connecting Line */}
          <div className="absolute left-[28px] md:left-1/2 top-[50px] bottom-[50px] w-1 bg-gradient-to-b from-emerald-300 via-teal-300 to-emerald-300 opacity-30 md:-translate-x-1/2 rounded-full"></div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  
                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'} pl-20 md:pl-0`}>
                    <div className="group relative w-full p-8 rounded-[2.5rem] bg-white/30 backdrop-blur-[40px] border border-white/50 shadow-[0_15px_40px_-15px_rgba(20,184,166,0.15)] hover:shadow-[0_25px_60px_-15px_rgba(20,184,166,0.3)] hover:-translate-y-2 hover:bg-white/40 hover:border-emerald-200/60 transition-all duration-500 cursor-default overflow-hidden">
                      
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-white/90 to-white/40 border border-white/60 shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Icon className="w-8 h-8 text-teal-600 drop-shadow-md" />
                        </div>
                        
                        <div className="text-6xl font-black text-black/[0.03] group-hover:text-black/[0.08] transition-colors duration-500 select-none">
                          {step.step}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-extrabold text-teal-950 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-teal-900/80 font-medium text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center Timeline Node */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-[60px] h-[60px]">
                    <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border-[4px] border-white/80 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center z-10 hover:scale-125 transition-transform duration-300">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    </div>
                  </div>

                  {/* Empty space for alternating layout on Desktop */}
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;