import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Clock, Loader2, Save, Sparkles, Activity, Droplet, Flame, Wind } from "lucide-react";

export default function AutomationSettings() {
  // Default values
  const [settings, setSettings] = useState({
    nasyaDelay: 30,
    bastiDelay: 120,
    vamanaDelay: 180,
    raktamokshanaDelay: 240,
    morningCheckTime: "08:00" 
  });
  const [loading, setLoading] = useState(true);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiGet("/api/tracking/settings");
        if (data) {
          // Merge defaults with saved data
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const save = async () => {
    try {
      await apiPut("/api/tracking/settings", settings);
      toast({ title: "Success", description: "Automation settings updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  //  FIXED HANDLE CHANGE
  const handleChange = (key, val) => {
    setSettings(prev => ({
      ...prev,
      
      [key]: key === 'morningCheckTime' ? val : (parseInt(val) || 0)
    }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-teal-800 animate-pulse">
       <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-600" />
       <span className="font-black uppercase tracking-widest text-xs">Loading Settings...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-6 flex-1">
        
        {}
        <div className="relative overflow-hidden bg-white/30 backdrop-blur-md p-6 rounded-[2rem] border-[1.5px] border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/40 transition-colors group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
          
          <Label className="text-teal-950 font-black mb-1 flex items-center gap-2 relative z-10 text-base">
            <Clock className="w-5 h-5 text-indigo-600" /> Daily Check-in Time
          </Label>
          <p className="text-[10px] font-bold text-teal-900/60 uppercase tracking-widest mb-4 relative z-10">
            Time patients receive health check form.
          </p>
          
          <div className="flex items-center gap-4 relative z-10">
            <Input 
              type="time" 
              value={settings.morningCheckTime} 
              onChange={(e) => handleChange('morningCheckTime', e.target.value)}
              className="w-32 h-12 bg-white/60 hover:bg-white/80 border-[1.5px] border-white/80 rounded-[1rem] focus:ring-2 focus:ring-indigo-400 font-black text-lg text-teal-950 shadow-sm transition-all"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-900/40 bg-white/40 px-3 py-1.5 rounded-lg shadow-inner">24H Format</span>
          </div>
        </div>

        {}
        <div className="space-y-4">
           <Label className="text-xs font-black text-teal-950 uppercase tracking-widest flex items-center gap-2 pl-2">
              <Activity className="w-4 h-4 text-teal-600" /> Post-Therapy Delays (Mins)
           </Label>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Nasya */}
             <div className="bg-white/30 backdrop-blur-md p-4 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm flex flex-col justify-center hover:bg-white/40 transition-colors">
               <Label className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-blue-500" /> Nasya</Label>
               <Input 
                 type="number" 
                 value={settings.nasyaDelay} 
                 onChange={e => handleChange('nasyaDelay', e.target.value)} 
                 className="h-10 bg-white/60 border-[1.5px] border-white/80 rounded-xl font-black text-teal-950 shadow-inner focus:ring-2 focus:ring-teal-400"
               />
             </div>
             
             {/* Basti */}
             <div className="bg-white/30 backdrop-blur-md p-4 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm flex flex-col justify-center hover:bg-white/40 transition-colors">
               <Label className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-teal-500" /> Basti</Label>
               <Input 
                 type="number" 
                 value={settings.bastiDelay} 
                 onChange={e => handleChange('bastiDelay', e.target.value)} 
                 className="h-10 bg-white/60 border-[1.5px] border-white/80 rounded-xl font-black text-teal-950 shadow-inner focus:ring-2 focus:ring-teal-400"
               />
             </div>
             
             {/* Vamana */}
             <div className="bg-white/30 backdrop-blur-md p-4 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm flex flex-col justify-center hover:bg-white/40 transition-colors">
               <Label className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-500" /> Vamana</Label>
               <Input 
                 type="number" 
                 value={settings.vamanaDelay} 
                 onChange={e => handleChange('vamanaDelay', e.target.value)} 
                 className="h-10 bg-white/60 border-[1.5px] border-white/80 rounded-xl font-black text-teal-950 shadow-inner focus:ring-2 focus:ring-teal-400"
               />
             </div>
             
             {/* Raktamokshana */}
             <div className="bg-white/30 backdrop-blur-md p-4 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm flex flex-col justify-center hover:bg-white/40 transition-colors">
               <Label className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-500" /> Raktamokshana</Label>
               <Input 
                 type="number" 
                 value={settings.raktamokshanaDelay} 
                 onChange={e => handleChange('raktamokshanaDelay', e.target.value)} 
                 className="h-10 bg-white/60 border-[1.5px] border-white/80 rounded-xl font-black text-teal-950 shadow-inner focus:ring-2 focus:ring-teal-400"
               />
             </div>
           </div>
        </div>

      </div>

      {/* Save Button Fixed at Bottom */}
      <div className="pt-8 mt-auto">
        <Button 
          onClick={save} 
          className="w-full h-14 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white rounded-full font-black text-base uppercase tracking-widest shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> Save Automation
        </Button>
      </div>
    </div>
  );
}