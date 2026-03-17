import DailyLog from "../models/DailyLog.js";
import Therapist from "../models/Therapist.js";
import AssignedTherapy from "../models/AssignedTherapy.js";
import TherapyQuestion from "../models/TherapyQuestion.js";
import ProgressResponse from "../models/ProgressResponse.js";
import FeedbackTemplate from "../models/FeedbackTemplate.js";
import FeedbackSession from "../models/FeedbackSession.js"; 


// Math nahi, direct timezone conversion use karega system ka.
const getIndiaDateString = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // Output Hamesha: "2026-02-17"
  return formatter.format(now);
};

const getTodayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// 1. GET PENDING ACTIONS
export const getPendingActions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const today = getTodayDate();
    
    // India Date String
    const todayStr = getIndiaDateString(); 

    const activeTherapy = await AssignedTherapy.findOne({
      patientId,
      $or: [
        { status: 'ongoing' },
        { status: 'scheduled', startDate: { $lte: new Date() } }
      ]
    }).sort({ startDate: -1 });

    const response = {
      therapyType: activeTherapy ? activeTherapy.therapy : null,
      showProgressCheck: false,
      progressQuestions: [],
      showFeedbackCheck: false,
      feedbackQuestions: [],
      showVirechanaCounter: false,
      sessionStatus: "pending",
      nothingPending: !activeTherapy
    };

    if (!activeTherapy) return res.json(response);

    let log = await DailyLog.findOne({ patientId, date: today, therapyType: activeTherapy.therapy });
    if (!log) {
      log = await DailyLog.create({
        patientId,
        therapistId: activeTherapy.therapistId,
        date: today,
        therapyType: activeTherapy.therapy
      });
    }

    // CHECK SESSION STATUS
    if (activeTherapy.lastSessionDate === todayStr) {
        response.sessionStatus = activeTherapy.todaysSessionStatus || 'pending';
    }

    const therapist = await Therapist.findById(activeTherapy.therapistId);
    const settings = therapist?.automationSettings || {};

    // --- LOGIC 1: MORNING PROGRESS ---
    if (!log.progress.isSubmitted) {
        const targetTimeStr = settings.morningCheckTime || "08:00"; 
        
        const now = new Date();
        const [targetH, targetM] = targetTimeStr.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(targetH, targetM, 0, 0);

        if (now >= targetDate) {
            response.showProgressCheck = true;
            response.progressQuestions = [{ text: "How is your energy?", maxScore: 10, type: 'scale' }];
        }
    }

    // --- LOGIC 2: VIRECHANA ---
    if (activeTherapy.therapy === 'Virechana' && response.sessionStatus === 'started') {
      response.showVirechanaCounter = true;
    }

    // --- LOGIC 3: FEEDBACK (Delay Check) ---
    if (activeTherapy.therapy !== 'Virechana' && !log.feedback.isSubmitted) {
       
       if (response.sessionStatus === 'completed') {
         
         let delayMinutes = 0;
         const tType = activeTherapy.therapy;

         if (tType === "Nasya") delayMinutes = settings.nasyaDelay || 0;
         else if (tType === "Basti") delayMinutes = settings.bastiDelay || 0;
         else if (tType === "Vamana") delayMinutes = settings.vamanaDelay || 0;
         else if (tType === "Raktamokshana") delayMinutes = settings.raktamokshanaDelay || 0;
         else delayMinutes = settings.defaultDelay || 0;

         let isTimeReady = true;

         if (delayMinutes > 0 && activeTherapy.lastSessionCompletedAt) {
             const completedAt = new Date(activeTherapy.lastSessionCompletedAt);
             const now = new Date();
             const diffMs = now - completedAt;
             const diffMins = diffMs / 60000; 

             if (diffMins < delayMinutes) {
                 isTimeReady = false; 
             }
         }

         if (isTimeReady) {
             response.showFeedbackCheck = true;
             
             const templateDoc = await FeedbackTemplate.findOne({ 
                therapistId: activeTherapy.therapistId 
             });

             const allQuestions = [];

             if (templateDoc) {
                 if (templateDoc.generalQuestions?.length > 0) {
                     allQuestions.push(...templateDoc.generalQuestions.map(q => ({
                         _id: q._id || q.id,
                         text: q.text,
                         type: q.type || 'scale',
                         maxScore: q.maxScore || 10,
                         category: 'general'
                     })));
                 }

                 const tType = activeTherapy.therapy;
                 let specificQs = [];
                 if (templateDoc.therapyQuestions instanceof Map) specificQs = templateDoc.therapyQuestions.get(tType) || [];
                 else if (templateDoc.therapyQuestions) specificQs = templateDoc.therapyQuestions[tType] || [];

                 if (specificQs.length > 0) {
                     allQuestions.push(...specificQs.map(q => ({
                         _id: q._id || q.id,
                         text: q.text,
                         type: q.type || 'scale',
                         maxScore: q.maxScore || 10,
                         category: 'therapy'
                     })));
                 }
             }

             if (allQuestions.length === 0) {
                allQuestions.push(
                    { text: "Rate your session comfort", maxScore: 10, type: 'scale', category: 'general' },
                    { text: "Any discomfort?", type: 'binary', category: 'therapy' }
                );
             }
             response.feedbackQuestions = allQuestions;
         }
       }
    }

    res.json(response);

  } catch (err) {
    console.error("❌ Error in getPendingActions:", err.message);
    res.status(500).json({ message: "Server error occurred while fetching pending actions." });
  }
};


export const submitProgress = async (req, res) => {
    try {
      const { answers } = req.body; 
      const patientId = req.user.id;
      const today = getTodayDate();
  
      const activeTherapy = await AssignedTherapy.findOne({
        patientId,
        status: { $in: ['scheduled', 'ongoing'] }
      });
  
      if (!activeTherapy) return res.status(404).json({ message: "No active therapy found" });
  
      await DailyLog.findOneAndUpdate(
        { patientId, date: today },
        { 
          $set: { 
            "progress.isSubmitted": true,
            "progress.submittedAt": new Date(),
            "progress.answers": answers
          }
        },
        { upsert: true }
      );
  
      let totalScore = 0;
      let maxTotal = 0;
      const tqDoc = await TherapyQuestion.findOne({ 
        therapistId: activeTherapy.therapistId, 
        therapyType: activeTherapy.therapy 
      });
  
      const formattedQuestions = answers.map(ans => {
         let max = 10; 
         if (tqDoc && tqDoc.questions) {
           const originalQ = tqDoc.questions.find(q => q._id.toString() === ans.questionId);
           if (originalQ) max = originalQ.maxScore;
         }
         const val = Number(ans.answer) || 0;
         totalScore += val;
         maxTotal += max;
         return { text: ans.questionText, maxScore: max, answer: val };
      });
  
      const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
      const dateString = new Date().toISOString().split('T')[0]; 
  
      await ProgressResponse.create({
         patientId,
         therapistId: activeTherapy.therapistId,
         therapyType: activeTherapy.therapy,
         date: today,
         dateString: dateString,
         questions: formattedQuestions,
         percentage: percentage
      });
  
      res.json({ message: "Progress saved and Graph updated" });
  
    } catch (err) { 
      console.error("❌ Error in submitProgress:", err.message);
      res.status(500).json({ message: "Server error occurred while submitting progress." }); 
    }
};

export const submitFeedback = async (req, res) => {
    try {
      const { answers, patientNotes } = req.body;
      const patientId = req.user.id;
      const today = getTodayDate();
  
      const updatedLog = await DailyLog.findOneAndUpdate(
        { patientId, date: today },
        { 
          $set: { 
            "feedback.isSubmitted": true,
            "feedback.submittedAt": new Date(),
            "feedback.answers": answers,
            "feedback.patientNotes": patientNotes || "" 
          }
        },
        { new: true } 
      );

      if (!updatedLog) {
          return res.status(404).json({ message: "Daily log entry not found." });
      }
      
      const historyQuestions = answers.map(ans => ({
          id: ans.questionId,
          text: ans.questionText,
          answer: ans.answer,
          category: 'therapy', 
          type: typeof ans.answer === 'number' ? 'scale' : 'text'
      }));

      await FeedbackSession.create({
          patientId: patientId,
          therapistId: updatedLog.therapistId, 
          questions: historyQuestions,
          status: 'completed',
          respondedAt: new Date(),
          isDailyLog: true, 
          patientNotes: patientNotes || "" 
      });

      const activeTherapy = await AssignedTherapy.findOne({ patientId, status: 'ongoing' });
      if(activeTherapy) {
          activeTherapy.sessionsCompleted = (activeTherapy.sessionsCompleted || 0) + 1;
          await activeTherapy.save();
      }

      res.json({ message: "Feedback saved and History updated" });

    } catch (err) { 
        console.error("❌ Error in submitFeedback:", err.message);
        res.status(500).json({ message: "Server error occurred while submitting feedback." }); 
    }
};

export const addVirechanaMotion = async (req, res) => {
    try {
      const { quantity, feeling } = req.body;
      const patientId = req.user.id;
      const today = getTodayDate();
  
      await DailyLog.findOneAndUpdate(
        { patientId, date: today, therapyType: "Virechana" },
        { 
          $push: { 
            "virechanaLog.motions": { quantity, feeling, time: new Date() }
          }
        }
      );
      res.json({ message: "Recorded" });
    } catch (err) { 
      console.error("❌ Error in addVirechanaMotion:", err.message);
      res.status(500).json({ message: "Server error occurred while recording motion." }); 
    }
};

export const toggleSessionStatus = async (req, res) => {
  try {
    const { patientId, status } = req.body; 
    
    //  Ab ye function 100% "2026-02-17" return karega
    const todayStr = getIndiaDateString(); 

    const query = { 
        patientId: patientId, 
        status: { $in: ['scheduled', 'ongoing'] } 
    };

    const updateFields = {
      todaysSessionStatus: status
    };

    if (status === 'started' || status === 'completed') {
        updateFields.status = 'ongoing';
    }

    if (status === 'completed') {
      updateFields.lastSessionDate = todayStr; // Saving "2026-02-17"
      updateFields.lastSessionCompletedAt = new Date(); 
      
      const updatedDoc = await AssignedTherapy.findOneAndUpdate(
         query,
         { 
           $set: updateFields,
           $addToSet: { completedDates: todayStr } 
         },
         { new: true } 
      );

      if (!updatedDoc) return res.status(404).json({ message: "Active therapy not found" });

    } else {
      const updatedDoc = await AssignedTherapy.findOneAndUpdate(
         query,
         { $set: updateFields },
         { new: true }
      );
      if (!updatedDoc) return res.status(404).json({ message: "Active therapy not found" });
    }

    res.json({ success: true, dateUsed: todayStr });

  } catch (err) {
    console.error("❌ Error in toggleSessionStatus:", err.message);
    res.status(500).json({ message: "Error updating session" });
  }
};


export const getAutomationSettings = async (req, res) => {
    try {
      const therapistId = req.user.id;
      const therapist = await Therapist.findById(therapistId).select('automationSettings');
      res.json(therapist?.automationSettings || {});
    } catch (err) {
      console.error("❌ Error in getAutomationSettings:", err.message);
      res.status(500).json({ message: "Server error occurred while fetching settings." });
    }
};
  
export const updateAutomationSettings = async (req, res) => {
    try {
      const therapistId = req.user.id;
      const settings = req.body; 
      await Therapist.findByIdAndUpdate(therapistId, {
        $set: { automationSettings: settings }
      });
      res.json({ message: "Settings updated" });
    } catch (err) { 
      console.error("❌ Error in updateAutomationSettings:", err.message);
      res.status(500).json({ message: "Server error occurred while updating settings." }); 
    }
};