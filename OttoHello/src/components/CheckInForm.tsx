/* ──────────────────────────────────────────────────────────────
   Visitor Check-In Form – full UI + Supabase insert
   src/components/CheckInForm.tsx
   ──────────────────────────────────────────────────────────── */

   import React, { useEffect, useRef, useState } from 'react';
   import {
     ArrowLeft,
     Camera,
     CameraOff,
     Clock,
     Loader2,
     MessageSquare,
     Scan,
     Shield,
     User,
     Users,
   } from 'lucide-react';
   import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
   
   import { supabase } from '../supabaseClient';
   import { ReasonForVisit, REASON_OPTIONS } from '../types/visitor';
   
   interface CheckInFormProps {
     /* after refactor we send { id, fullName } back to the parent */
     onSubmit: (data: { id: string; fullName: string }) => void;
     onBack: () => void;
   }
   
   /* ───────────────────────────────────────────────────────────── */
   
   export default function CheckInForm({ onSubmit, onBack }: CheckInFormProps) {
     /* ── state ──────────────────────────────────────────────── */
     const [formData, setFormData] = useState({
       fullName: '',
       reasonForVisit: '' as ReasonForVisit,
       otherReason: '',
       personToMeet: '',
     });
   
     const [photo, setPhoto] = useState<string>('');
     const [showCamera, setShowCamera] = useState(false);
     const [cameraError, setCameraError] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [submitError, setSubmitError] = useState('');
   
     /* ── joy-ride (in-app tour) ─────────────────────────────── */
     const [runTour, setRunTour] = useState(false);
     useEffect(() => {
       if (!localStorage.getItem('ottohello_tour_done')) setRunTour(true);
     }, []);
   
     const tourSteps: Step[] = [
       {
         target: '.capture-photo-btn',
         content: 'Step 1 → Take the visitor’s photo here.',
         placement: 'bottom',
         disableBeacon: true,
       },
       {
         target: '.person-to-meet-input',
         content: 'Step 2 → Type who the visitor is meeting.',
         placement: 'top',
       },
       {
         target: '.checkin-submit',
         content: 'Step 3 → Press to complete the check-in.',
         placement: 'left',
       },
     ];
   
     const handleJoyride = (data: CallBackProps) => {
       if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
         localStorage.setItem('ottohello_tour_done', 'true');
         setRunTour(false);
       }
     };
   
     /* ── camera helpers ─────────────────────────────────────── */
     const videoRef = useRef<HTMLVideoElement>(null);
     const canvasRef = useRef<HTMLCanvasElement>(null);
     const streamRef = useRef<MediaStream | null>(null);
   
     const startCamera = () => {
       setCameraError('');
       setShowCamera(true);
     };
   
     useEffect(() => {
       const setupCamera = async () => {
         if (!showCamera || !videoRef.current) return;
   
         try {
           const stream = await navigator.mediaDevices.getUserMedia({
             video: {
               width: { ideal: 640 },
               height: { ideal: 480 },
               facingMode: 'user',
             },
             audio: false,
           });
           videoRef.current.srcObject = stream;
           streamRef.current = stream;
           videoRef.current.onloadedmetadata = () => videoRef.current?.play();
         } catch (err) {
           setCameraError('Camera access denied or not available');
         }
       };
   
       setupCamera();
     }, [showCamera]);
   
     const stopCamera = () => {
       streamRef.current?.getTracks().forEach((t) => t.stop());
       streamRef.current = null;
       setShowCamera(false);
     };
   
     const capturePhoto = () => {
       if (!videoRef.current || !canvasRef.current) return;
       const canvas = canvasRef.current;
       const ctx = canvas.getContext('2d');
       if (!ctx) return;
   
       canvas.width = videoRef.current.videoWidth;
       canvas.height = videoRef.current.videoHeight;
       ctx.drawImage(videoRef.current, 0, 0);
       setPhoto(canvas.toDataURL('image/jpeg', 0.8));
       stopCamera();
     };
   
     /* ── generic helpers ────────────────────────────────────── */
     const handleInputChange = (field: string, value: string) =>
       setFormData((p) => ({ ...p, [field]: value }));
   
     /* ── submit to Supabase ─────────────────────────────────── */
     const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError('');
    
      const { fullName, reasonForVisit, otherReason, personToMeet } = formData;
      if (!fullName || !reasonForVisit || !personToMeet) return;
      if (reasonForVisit === 'other' && !otherReason) return;
    
      setSubmitting(true);
    
      const { data, error } = await supabase
        .from('visitors')
        .insert([
          {
            full_name: fullName,
            reason_for_visit:
              reasonForVisit === 'other' ? otherReason : reasonForVisit,
            person_to_meet: personToMeet,
            photo_base64: photo || null,
            checked_in_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();
    
      setSubmitting(false);
    
      if (error || !data || !data.id) {
        console.error(error);
        setSubmitError(
          error?.message ?? 'Could not save to Supabase. Please try again.'
        );
        return;
      }
    
      /* notify parent with just the essentials */
      onSubmit({ id: data.id, fullName });
    };
   
     /* ── UI ─────────────────────────────────────────────────── */
     return (
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
         {/* glowy blobs */}
         <div className="absolute inset-0">
           <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
           <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
         </div>
         {/* grid pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
   
         <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
           <div className="max-w-4xl w-full">
             {/* header bar */}
             <div className="flex items-center gap-6 mb-12">
               <button
                 onClick={onBack}
                 className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group"
               >
                 <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
               </button>
               <div>
                 <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                   Visitor Registration
                 </h2>
                 <p className="text-gray-300 text-lg mt-2">
                   Please complete your check-in
                 </p>
               </div>
             </div>
   
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* ── camera card ───────────────────────────────── */}
               <div className="space-y-8">
                 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                   <div className="text-center">
                     <div className="flex items-center justify-center gap-3 mb-6">
                       <Scan className="w-6 h-6 text-cyan-400" />
                       <h3 className="text-xl font-semibold text-white">
                         Photo Capture
                       </h3>
                     </div>
   
                     {/* 3 camera states: live / preview / placeholder */}
                     {showCamera ? (
                       /* live camera */
                       <div className="space-y-6">
                         <div className="relative">
                           <video
                             ref={videoRef}
                             autoPlay
                             playsInline
                             muted
                             className="w-full max-w-sm mx-auto rounded-2xl border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/25"
                           />
                           <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 animate-pulse pointer-events-none" />
                         </div>
                         <div className="flex gap-4 justify-center">
                           <button
                             onClick={capturePhoto}
                             className="capture-photo-btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                           >
                             Capture Photo
                           </button>
                           <button
                             onClick={stopCamera}
                             className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                           >
                             Cancel
                           </button>
                         </div>
                       </div>
                     ) : photo ? (
                       /* captured preview */
                       <div className="space-y-6">
                         <div className="relative">
                           <img
                             src={photo}
                             alt="Captured"
                             className="w-48 h-36 mx-auto rounded-2xl border-4 border-green-400/50 object-cover shadow-2xl shadow-green-500/25"
                           />
                           <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                             <Shield className="w-4 h-4 text-white" />
                           </div>
                         </div>
                         <button
                           onClick={() => setPhoto('')}
                           className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                         >
                           Retake Photo
                         </button>
                       </div>
                     ) : (
                       /* placeholder */
                       <div className="space-y-6">
                         <div className="w-48 h-36 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                           <Camera className="w-12 h-12 text-gray-500" />
                         </div>
                         <button
                           onClick={startCamera}
                           className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 inline-flex items-center gap-3"
                         >
                           <Camera className="w-5 h-5" />
                           Take Photo
                         </button>
                         {cameraError && (
                           <p className="text-red-400 text-sm flex items-center justify-center gap-2">
                             <CameraOff className="w-4 h-4" />
                             {cameraError}
                           </p>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
   
               {/* ── form card ─────────────────────────────────── */}
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                 {/* ← the whole form we re-added earlier */}
                 <form onSubmit={handleSubmit} className="space-y-8">
                   {/* full-name */}
                   <div>
                     <label className="block text-white font-medium mb-3 flex items-center gap-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center">
                         <User className="w-4 h-4 text-white" />
                       </div>
                       Full Name *
                     </label>
                     <input
                       type="text"
                       value={formData.fullName}
                       onChange={(e) =>
                         handleInputChange('fullName', e.target.value)
                       }
                       className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                                  focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                                  placeholder-gray-400 text-lg transition-all duration-300"
                       placeholder="Enter your full name"
                       required
                     />
                   </div>
   
                   {/* purpose */}
                   <div>
                     <label className="block text-white font-medium mb-3 flex items-center gap-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                         <MessageSquare className="w-4 h-4 text-white" />
                       </div>
                       Purpose of Visit *
                     </label>
                     <select
                       value={formData.reasonForVisit}
                       onChange={(e) =>
                         handleInputChange(
                           'reasonForVisit',
                           e.target.value as ReasonForVisit,
                         )
                       }
                       className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                                  focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                                  text-lg transition-all duration-300"
                       required
                     >
                       <option value="" className="bg-gray-800">
                         Select purpose of visit
                       </option>
                       {REASON_OPTIONS.map((opt) => (
                         <option
                           key={opt.value}
                           value={opt.value}
                           className="bg-gray-800"
                         >
                           {opt.label}
                         </option>
                       ))}
                     </select>
                   </div>
   
                   {/* other reason */}
                   {formData.reasonForVisit === 'other' && (
                     <div>
                       <label className="block text-white font-medium mb-3">
                         Please specify *
                       </label>
                       <input
                         type="text"
                         value={formData.otherReason}
                         onChange={(e) =>
                           handleInputChange('otherReason', e.target.value)
                         }
                         className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                                    focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                                    placeholder-gray-400 text-lg transition-all duration-300"
                         placeholder="Describe the reason"
                         required
                       />
                     </div>
                   )}
   
                   {/* person to meet */}
                   <div>
                     <label className="block text-white font-medium mb-3 flex items-center gap-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                         <Users className="w-4 h-4 text-white" />
                       </div>
                       Person to Meet *
                     </label>
                     <input
                       type="text"
                       value={formData.personToMeet}
                       onChange={(e) =>
                         handleInputChange('personToMeet', e.target.value)
                       }
                       className="person-to-meet-input w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                                  focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                                  placeholder-gray-400 text-lg transition-all duration-300"
                       placeholder="Name or department"
                       required
                     />
                   </div>
   
                   {/* submit */}
                   <button
                     type="submit"
                     disabled={submitting}
                     className="checkin-submit w-full bg-gradient-to-r from-cyan-500 to-blue-600
                                hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 px-8
                                rounded-xl text-xl transition-all duration-300 flex items-center
                                justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
                   >
                     {submitting ? (
                       <Loader2 className="animate-spin w-6 h-6" />
                     ) : (
                       <Clock className="w-6 h-6" />
                     )}
                     {submitting ? 'Saving…' : 'Complete Check-In'}
                   </button>
   
                   {submitError && (
                     <p className="text-center text-red-400 text-sm mt-2">
                       {submitError}
                     </p>
                   )}
                 </form>
               </div>
             </div>
           </div>
         </div>
   
         {/* hidden canvas for snapshots */}
         <canvas ref={canvasRef} className="hidden" />
   
         {/* joyride overlay */}
         <Joyride
           steps={tourSteps}
           run={runTour}
           continuous
           showSkipButton
           callback={handleJoyride}
           styles={{
             options: {
               zIndex: 10000,
               primaryColor: '#1E40CA',
               arrowColor: '#1E40CA',
             },
             tooltip: { borderRadius: 12, padding: 16 },
           }}
           floaterProps={{ styles: { arrow: { length: 14, spread: 30 } } }}
         />
       </div>
     );
   }
   