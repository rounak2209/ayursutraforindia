import { Heart, Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <section id="contact">
    {}
    <footer className="bg-transparent">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Panchakarma Care</h3>
              </div>
              <p className="text-foreground/90 font-bold leading-relaxed mb-6">
                Revolutionizing Ayurvedic healthcare through intelligent technology. 
                Bridging ancient wisdom with modern efficiency for holistic healing.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-smooth cursor-pointer shadow-sm">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-smooth cursor-pointer shadow-sm">
                  <Linkedin className="h-5 w-5 text-primary" />
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-smooth cursor-pointer shadow-sm">
                  <Twitter className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-foreground/90 hover:text-primary font-bold transition-colors">About Panchakarma</a></li>
                <li><a href="#features" className="text-foreground/90 hover:text-primary font-bold transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-foreground/90 hover:text-primary font-bold transition-colors">How It Works</a></li>
                <li><a href="#contact" className="text-foreground/90 hover:text-primary font-bold transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary mr-3" />
                  <span className="text-foreground/90 font-bold text-sm">support@panchakarmacare.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-primary mr-3" />
                  <span className="text-foreground/90 font-bold text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-primary mr-3 mt-0.5" />
                  <span className="text-foreground/90 font-bold text-sm">
                    Rounak Kumar<br />
                    Techno Main Salt Lake, Kolkata, West Bengal, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          {}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-sm text-foreground/90 font-bold">
                © 2025 Panchakarma Care. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#privacy" className="text-sm text-foreground/90 font-bold hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-sm text-foreground/90 font-bold hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-sm text-foreground/90 font-bold hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
    </section>
  );
};

export default Footer;