import React, { useState } from 'react';
import Popup from '../components/Popup';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { UserPlus, User, Mail, Lock, Briefcase, Send } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [extraFields, setExtraFields] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ type: '', title: '', message: '' });
  const navigate = useNavigate?.() || null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtraChange = (e) => {
    const { name, value } = e.target;
    setExtraFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setPopupData({ type: 'error', title: 'Validation Error', message: 'Please fill all required fields.' });
      setShowPopup(true);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    if (Object.keys(extraFields).length) payload.extra = extraFields;

    try {
      const data = await apiPost('/api/auth/register', payload);

      if (!data || data?.message?.toLowerCase?.().includes('error') || data?.error || data?.status === 'error') {
        const msg = data?.message || data?.error || 'Registration failed. Please try again.';
        setPopupData({ type: 'error', title: 'Registration Failed', message: msg });
        setShowPopup(true);
        return;
      }

      const successMessage = data?.message || 'Your account has been created successfully.';
      setPopupData({ type: 'success', title: 'Registration Successful!', message: successMessage });
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        if (navigate) {
          navigate('/login');
        } else {
          window.location.href = '/login';
        }
      }, 1800);

    } catch (err) {
      console.error('Register error:', err);
      setPopupData({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to contact server. Make sure backend is running and VITE_API_BASE is set correctly.'
      });
      setShowPopup(true);
    }
  };

  const handleGoHome = () => {
    setShowPopup(false);
    if (navigate) return navigate('/');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white/5 w-full">
      
      {}
      <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[20%] left-[40%] w-[500px] h-[500px] bg-sky-300/10 rounded-full blur-[100px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white/30 backdrop-blur-[40px] border border-white/50 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(30,58,138,0.15)] transition-shadow duration-500 relative z-10 flex flex-col items-center">
        
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 border-[3px] border-white/80 flex items-center justify-center mb-5 shadow-[0_10px_30px_rgba(37,99,235,0.3)] overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <UserPlus className="w-10 h-10 text-white drop-shadow-md" />
        </div>

        <h1 className="text-3xl font-black text-blue-950 tracking-tight mb-2">Join Ayursutra</h1>
        <p className="text-blue-950/80 font-semibold text-base mb-10 text-center leading-relaxed max-w-sm">Begin your journey to holistic wellness and revolutionize Ayurvedic treatment.</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">

            </div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-white/20 backdrop-blur-sm border border-white/60 rounded-[1.25rem] py-4 pl-12.5 pr-5 text-blue-950 font-medium placeholder-blue-950/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 hover:bg-white/25 transition-all duration-300 shadow-inner"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-white/20 backdrop-blur-sm border border-white/60 rounded-[1.25rem] py-4 pl-12.5 pr-5 text-blue-950 font-medium placeholder-blue-950/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 hover:bg-white/25 transition-all duration-300 shadow-inner"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full bg-white/20 backdrop-blur-sm border border-white/60 rounded-[1.25rem] py-4 pl-12.5 pr-5 text-blue-950 font-medium placeholder-blue-950/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 hover:bg-white/25 transition-all duration-300 shadow-inner"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none z-10">
              
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full bg-white/20 backdrop-blur-sm border border-white/60 rounded-[1.25rem] py-4 pl-12.5 pr-5 text-blue-950 font-medium placeholder-blue-950/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 hover:bg-white/25 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-blue-950/50">Choose Your Role</option>
              <option value="patient" className="text-blue-950">Patient - Seeking wellness</option>
              <option value="therapist" className="text-blue-950">Therapist - Panchkarma specialist</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-blue-950/50 group-focus-within:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          

          <button 
            type="submit" 
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-lg py-4 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.6)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <Send className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create Account</span>
          </button>
        </form>
      </div>

      {showPopup && (
        <Popup
          type={popupData.type}
          title={popupData.title}
          message={popupData.message}
          onClose={() => setShowPopup(false)}
          onAction={handleGoHome}
          actionText="Go Back to Home Page"
          centerPopup={true}
        />
      )}
    </div>
  );
};

export default Register;