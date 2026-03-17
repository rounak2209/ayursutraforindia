import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";

import LoginRegisterPanel from "@/components/LoginRegisterPanel";
import Footer from "@/components/Footer";
import PanchakarmaTherapies from "../components/PanchkarmaTherapies";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PanchakarmaTherapies />
      <AboutSection />
      <LoginRegisterPanel />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;