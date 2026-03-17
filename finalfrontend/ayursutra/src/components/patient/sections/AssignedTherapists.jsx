import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, Phone, MapPin, Star, Calendar, 
  Clock, Banknote, Hourglass, Stethoscope, 
  ArrowRight, ShieldCheck 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AssignedTherapists() {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return setAssigned([]);

      
      const therapies = await apiGet("/api/assigned-therapies/my");

      const normalized = (therapies || []).map((t, idx) => {
        const therapist = t.therapistId || {};
        return {
          id: t._id || idx,
          name: therapist.name || "Therapist",
          phone: therapist.phone || "—",
          location: therapist.location || "—",
          experience: therapist.experience || 0,
          specializations: therapist.specializations || [],
          
          rating: 5.0, 
          
          appointmentDate: t.startDate ? new Date(t.startDate).toISOString().split("T")[0] : null,
          appointmentTime: t.timeSlot || "—",
          
          sessionFee: t.sessionFee || 0,
          status: t.status || "scheduled",
          therapyName: t.therapy
        };
      });

      setAssigned(normalized);
    } catch (err) {
      console.error("Failed to load assigned therapists", err);
      toast({ title: "Error loading therapists", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse text-teal-800">Loading your care team...</div>;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 min-h-screen rounded-[2.5rem] p-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-indigo-600" /> My Care Team
          </h2>
          <p className="text-indigo-700/70 mt-1 font-medium">Therapists currently assigned to your wellness journey.</p>
        </div>
        <Badge className="bg-white/60 text-indigo-800 border-indigo-200 text-sm font-bold px-4 py-1.5 shadow-sm backdrop-blur-sm">
           {assigned.length} Active
        </Badge>
      </div>

      {assigned.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white shadow-xl">
           <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <User className="w-10 h-10 text-indigo-500" />
           </div>
           <h3 className="text-xl font-bold text-indigo-900 mb-2">No Therapists Assigned</h3>
           <p className="text-indigo-800/70 max-w-md mx-auto">You haven't booked any sessions yet. Use the "Find Therapist" section to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {assigned.map((t) => (
            <div key={t.id} className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border border-white hover:shadow-2xl transition-all duration-300 group">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shadow-inner">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold mt-1">
                      <Star className="w-4 h-4 fill-current" /> {t.rating}
                      <span className="text-slate-400 font-normal ml-1">• {t.experience} yrs exp</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{t.therapyName}</Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Next Session
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {t.appointmentDate || "Pending"}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> Time
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {t.appointmentTime || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[100px]">{t.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                    <Banknote className="w-4 h-4" />
                    <span className="font-bold">₹{t.sessionFee}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200">
                View Profile <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
              </Button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}