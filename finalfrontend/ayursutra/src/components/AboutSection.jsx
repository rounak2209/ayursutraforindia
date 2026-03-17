import { Leaf, Heart, Zap, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const AboutSection = () => {
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
    <section id="about" ref={sectionRef} className="py-32 bg-transparent flex justify-center relative overflow-hidden">
      
      <div className="absolute top-0 right-10 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-7xl px-6 relative z-10">
        
        <div className={`text-center mb-24 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-emerald-900 font-bold text-sm shadow-sm">
            ✨ The Science of Healing
          </div>
          <h2 className="text-5xl md:text-[4rem] font-extrabold mb-6 text-teal-950 drop-shadow-sm tracking-tight leading-tight">
            Understanding <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> Panchakarma</span>
          </h2>
          <p className="text-xl text-teal-900/70 font-medium max-w-3xl mx-auto leading-relaxed">
            Panchakarma is Ayurveda's signature detoxification and rejuvenation program. 
            Our software revolutionizes how this ancient healing practice is managed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch overflow-hidden">
          
          <div className="flex flex-col gap-8 overflow-hidden">
            <div 
              className={`bg-white/30 backdrop-blur-[40px] border border-white/50 p-10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] transition-all duration-700 relative overflow-hidden group transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-150 transform origin-top-right">
                <Leaf className="w-40 h-40 text-emerald-700" />
              </div>
              <div className="flex items-center mb-6 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:rotate-6 transition-transform">
                  <Leaf className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-extrabold text-teal-950">What is Panchakarma?</h3>
              </div>
              <p className="text-teal-900/80 font-medium leading-relaxed relative z-10 text-lg">
                A comprehensive detoxification and purification process consisting of five therapeutic procedures designed to eliminate toxins, restore balance, and rejuvenate the body's natural healing mechanisms.
              </p>
            </div>

            <div 
              className={`bg-white/30 backdrop-blur-[40px] border border-white/50 p-10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] transition-all duration-700 relative overflow-hidden group transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-150 transform origin-top-right">
                <Heart className="w-40 h-40 text-teal-700" />
              </div>
              <div className="flex items-center mb-6 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:rotate-6 transition-transform">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-extrabold text-teal-950">Holistic Approach</h3>
              </div>
              <p className="text-teal-900/80 font-medium leading-relaxed relative z-10 text-lg">
                Treats the root cause of illness by addressing physical, mental, and spiritual well-being through personalized treatment protocols based on individual constitution (Prakriti).
              </p>
            </div>
          </div>

          <div className="h-full flex flex-col relative overflow-hidden">
            <div 
              className={`bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-[50px] border border-white/60 p-10 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.2)] transition-all duration-700 relative overflow-hidden group flex-1 flex flex-col transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
              style={{ transitionDelay: '500ms' }}
            >
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px] group-hover:bg-emerald-400/30 transition-all duration-700"></div>
              
              <div className="flex items-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-white/60 border border-white/80 rounded-3xl flex items-center justify-center mr-6 shadow-md group-hover:-translate-y-2 transition-transform duration-500">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-4xl font-extrabold text-teal-950">Why Our Software?</h3>
              </div>
              
              <div className="space-y-5 relative z-10">
                {[
                  "Streamlines complex scheduling of multi-day therapy sessions",
                  "Real-time tracking of patient progress and therapy effectiveness",
                  "Automated reminders and personalized care protocols",
                  "Integration of traditional wisdom with modern healthcare management"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center bg-white/40 hover:bg-white/60 p-4 rounded-2xl border border-white/50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-default">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mr-4 flex-shrink-0 drop-shadow-sm" />
                    <p className="text-teal-950 font-bold text-[1.05rem] leading-snug">{text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/40 relative z-10">
                <p className="text-teal-800 font-extrabold text-center italic text-xl drop-shadow-sm">
                  "Bridging 5,000 years of Ayurvedic wisdom with 21st-century technology"
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AboutSection;