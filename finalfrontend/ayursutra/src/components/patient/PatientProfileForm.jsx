import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiPut, apiPutMultipart } from "@/lib/api"; 
import { Upload, User, Phone, Activity, FileText, Plus, Trash2, ShieldAlert, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom"; 

export default function PatientProfileForm({ onComplete }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    prakritiType: "",
    doshaImbalance: "",
    allergies: "",
    medicalHistory: "",
    therapies: [],
    profilePic: null 
  });

  const [loading, setLoading] = useState(false);

  const addTherapy = () => {
    setFormData(prev => ({
      ...prev,
      therapies: [...prev.therapies, { therapy: "", duration: "" }]
    }));
  };

  const updateTherapy = (index, field, value) => {
    const updated = [...formData.therapies];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, therapies: updated }));
  };

  const removeTherapy = (index) => {
    const updated = formData.therapies.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, therapies: updated }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files.length > 0) {
      if (field === 'profilePic') {
        setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
      }
    }
  };

  const prakritis = ["Vata Dominant", "Pitta Dominant", "Kapha Dominant", "Vata-Pitta", "Vata-Kapha", "Pitta-Kapha", "Tridoshic"];
  const doshas = ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Vata-Kapha", "Pitta-Kapha"];
  const therapiesList = ["Vamana", "Virechana", "Basti", "Nasya", "Raktamokshana", "None"];
  const durations = ["7 days", "14 days", "21 days", "None"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["name", "age", "gender", "contactNumber", "prakritiType", "doshaImbalance"];
    const missing = required.filter(r => !formData[r]);

    if (missing.length) {
      return toast({ title: "Fill required fields", variant: "destructive" });
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({ title: "Session expired", variant: "destructive" });
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    try {
      if (formData.profilePic instanceof File) {
        const fileData = new FormData();
        fileData.append("profilePic", formData.profilePic);
        await apiPutMultipart(`/api/patients/profile/${userId}`, fileData);
      }

      const jsonPayload = {
        name: formData.name,
        personalDetails: {
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          contactNumber: formData.contactNumber
        },
        healthProfile: {
          prakritiType: formData.prakritiType,
          doshaImbalance: formData.doshaImbalance,
          allergies: formData.allergies || "",
          medicalHistory: formData.medicalHistory || ""
        },
        prescriptionDetails: {
          therapies: formData.therapies.filter(t => t.therapy && t.duration),
          hasPrescription: formData.therapies.length > 0
        },
        profileStatus: "completed"
      };

      await apiPut(`/api/patients/profile/${userId}`, jsonPayload);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.profileStatus = "completed"; 
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      toast({ title: "Profile saved", description: "Welcome — profile complete." });

      // if (typeof onComplete === "function") onComplete(formData);
      navigate("/patient");

    } catch (err) {
      toast({ title: "Save failed", description: err.message || "Server error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center py-12 px-4 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="text-center mb-10 relative z-10">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-4">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
             <span className="text-teal-950 font-extrabold text-[10px] tracking-widest uppercase">Patient Setup</span>
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tight drop-shadow-md">Complete Profile</h1>
         <p className="text-teal-900/70 font-bold mt-2">Set up your Ayurveda health profile to get started.</p>
      </div>

      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_30px_80px_rgba(20,184,166,0.15)] rounded-[3rem] p-8 md:p-12 relative z-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="flex flex-col items-center gap-4 relative">
             <div className="w-36 h-36 bg-white/40 backdrop-blur-xl rounded-[2rem] flex items-center justify-center overflow-hidden border-[2px] border-white/70 shadow-[0_10px_30px_rgba(20,184,166,0.15)] relative group transition-all duration-300 hover:scale-105 hover:border-teal-400">
                {formData.profilePic ? (
                    <img src={URL.createObjectURL(formData.profilePic)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-14 h-14 text-teal-800/40" />
                )}
                <label htmlFor="pic" className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center text-teal-950 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-md">
                   <Upload className="w-6 h-6 mb-1 text-teal-700" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                </label>
             </div>
             <Input id="pic" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePic')} className="hidden" />
             <div className="text-center">
               <h3 className="text-teal-950 font-black text-xl drop-shadow-sm">Profile Picture</h3>
               <p className="text-[10px] text-teal-900/50 font-bold uppercase tracking-widest">JPG, PNG, max 5MB</p>
             </div>
          </div>

          <div className="bg-white/30 border-[1.5px] border-white/50 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-[30px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
            
            <Label className="text-lg font-black text-teal-950 mb-6 flex items-center gap-3 drop-shadow-sm border-b-[1.5px] border-white/40 pb-4 relative z-10">
               <User className="w-5 h-5 text-teal-600"/> Personal Details
            </Label>
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Full Name</Label>
                 <Input value={formData.name} onChange={(e)=>handleInputChange("name", e.target.value)} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base px-6 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all shadow-sm" />
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Contact Number</Label>
                 <Input value={formData.contactNumber} onChange={(e)=>handleInputChange("contactNumber", e.target.value)} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base px-6 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all shadow-sm" />
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Age</Label>
                 <Input type="number" value={formData.age} onChange={(e)=>handleInputChange("age", e.target.value)} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base px-6 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all shadow-sm" />
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Gender</Label>
                 <Select onValueChange={(v)=>handleInputChange("gender", v)}>
                   <SelectTrigger className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black rounded-[1.25rem] focus:ring-2 focus:ring-teal-400 transition-all shadow-sm px-6">
                      <SelectValue placeholder="Select gender" />
                   </SelectTrigger>
                   <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl">
                      <SelectItem value="male" className="text-teal-950 font-bold focus:bg-teal-100">Male</SelectItem>
                      <SelectItem value="female" className="text-teal-950 font-bold focus:bg-teal-100">Female</SelectItem>
                      <SelectItem value="other" className="text-teal-950 font-bold focus:bg-teal-100">Other</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>
          </div>

          <div className="bg-white/30 border-[1.5px] border-white/50 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
            
            <Label className="text-lg font-black text-teal-950 mb-6 flex items-center gap-3 drop-shadow-sm border-b-[1.5px] border-white/40 pb-4 relative z-10">
               <Activity className="w-5 h-5 text-emerald-600"/> Health Profile
            </Label>
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Prakriti Type</Label>
                <Select onValueChange={(v)=>handleInputChange("prakritiType", v)}>
                  <SelectTrigger className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black rounded-[1.25rem] focus:ring-2 focus:ring-emerald-400 transition-all shadow-sm px-6">
                     <SelectValue placeholder="Select prakriti" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl">
                     {prakritis.map(p => <SelectItem key={p} value={p} className="text-teal-950 font-bold focus:bg-teal-100">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Dosha Imbalance</Label>
                <Select onValueChange={(v)=>handleInputChange("doshaImbalance", v)}>
                  <SelectTrigger className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black rounded-[1.25rem] focus:ring-2 focus:ring-emerald-400 transition-all shadow-sm px-6">
                     <SelectValue placeholder="Select dosha" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl">
                     {doshas.map(d => <SelectItem key={d} value={d} className="text-teal-950 font-bold focus:bg-teal-100">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-rose-500"/> Allergies</Label>
                <Textarea value={formData.allergies} onChange={(e)=>handleInputChange("allergies", e.target.value)} rows={2} className="bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-bold text-base p-4 rounded-[1.5rem] focus:bg-white/80 focus:border-emerald-400 transition-all shadow-sm resize-none placeholder:text-teal-900/40" placeholder="Any known allergies..." />
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Medical History</Label>
                <Textarea value={formData.medicalHistory} onChange={(e)=>handleInputChange("medicalHistory", e.target.value)} rows={3} className="bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-bold text-base p-4 rounded-[1.5rem] focus:bg-white/80 focus:border-emerald-400 transition-all shadow-sm resize-none placeholder:text-teal-900/40" placeholder="Previous conditions, surgeries, etc." />
              </div>
            </div>
          </div>

          <div className="bg-white/30 border-[1.5px] border-white/50 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-[30px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
            
            <Label className="text-lg font-black text-teal-950 mb-6 flex items-center gap-3 drop-shadow-sm border-b-[1.5px] border-white/40 pb-4 relative z-10">
               <FileText className="w-5 h-5 text-indigo-600"/> Assigned Therapies
            </Label>

            <div className="space-y-4 relative z-10">
               {formData.therapies.length === 0 && (
                 <div className="text-center py-6 text-teal-900/40 font-black uppercase tracking-widest text-[10px] border-[2px] border-dashed border-white/60 rounded-xl bg-white/20">No manual therapies added.</div>
               )}
               {formData.therapies.map((t, index) => (
                 <div key={index} className="grid md:grid-cols-3 gap-4 items-end bg-white/50 p-5 rounded-[1.5rem] border-[1.5px] border-white/70 shadow-sm hover:bg-white/70 transition-colors">
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Therapy</Label>
                     <Select value={t.therapy} onValueChange={(v) => updateTherapy(index, "therapy", v)}>
                         <SelectTrigger className="h-12 bg-white/60 border border-white/80 text-teal-950 font-bold rounded-xl focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner px-4">
                            <SelectValue placeholder="Select therapy" />
                         </SelectTrigger>
                         <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-xl shadow-xl">
                            {therapiesList.map(th => (<SelectItem key={th} value={th} className="text-teal-950 font-bold focus:bg-teal-100">{th}</SelectItem>))}
                         </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Duration</Label>
                     <Select value={t.duration} onValueChange={(v) => updateTherapy(index, "duration", v)}>
                         <SelectTrigger className="h-12 bg-white/60 border border-white/80 text-teal-950 font-bold rounded-xl focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner px-4">
                            <SelectValue placeholder="Select duration" />
                         </SelectTrigger>
                         <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-xl shadow-xl">
                            {durations.map(d => (<SelectItem key={d} value={d} className="text-teal-950 font-bold focus:bg-teal-100">{d}</SelectItem>))}
                         </SelectContent>
                     </Select>
                   </div>
                   <Button variant="ghost" size="icon" type="button" onClick={() => removeTherapy(index)} className="h-12 w-12 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30 transition-all mx-auto md:mx-0">
                      <Trash2 className="w-5 h-5" />
                   </Button>
                 </div>
               ))}
               
               <Button variant="outline" type="button" onClick={addTherapy} className="w-full h-14 rounded-[1.25rem] bg-white/40 hover:bg-white/60 text-teal-950 font-black uppercase tracking-widest border-[1.5px] border-white/70 shadow-sm transition-all border-dashed mt-2">
                  <Plus className="w-5 h-5 mr-2"/> Add Manual Therapy
               </Button>
            </div>
          </div>

          <div className="pt-6 border-t-[1.5px] border-white/40">
            <Button type="submit" disabled={loading} className="w-full h-16 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center gap-2">
              {loading ? "Processing..." : <><Sparkles className="w-6 h-6"/> Complete Profile & Continue</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}