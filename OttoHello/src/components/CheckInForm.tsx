import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ArrowLeft,
  User,
  Users,
  MessageSquare,
  CameraOff,
  Scan,
  Shield,
  Clock
} from 'lucide-react';
import { REASON_OPTIONS, type ReasonForVisit } from '../types/visitor';

interface CheckInFormProps {
  onSubmit: (data: {
    fullName: string;
    reasonForVisit: ReasonForVisit;
    otherReason?: string;
    personToMeet: string;
    photo?: string;
  }) => void;
  onBack: () => void;
}

export default function CheckInForm({ onSubmit, onBack }: CheckInFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    reasonForVisit: '' as ReasonForVisit,
    otherReason: '',
    personToMeet: ''
  });
  const [photo, setPhoto] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startCamera = () => {
    console.log('📸 Start camera requested');
    setCameraError('');
    setShowCamera(true);
  };

  useEffect(() => {
    const setupCamera = async () => {
      if (showCamera && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false
          });

          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => console.log('▶️ Camera started'))
              .catch(err => console.error('❌ Video play error:', err));
          };
        } catch (error: any) {
          console.error('🚨 getUserMedia error:', error.name, error.message);
          setCameraError('Camera access denied or not available');
        }
      }
    };

    setupCamera();
  }, [showCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.reasonForVisit || !formData.personToMeet) return;
    if (formData.reasonForVisit === 'other' && !formData.otherReason) return;

    onSubmit({ ...formData, photo: photo || undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={onBack} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group">
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Visitor Registration
              </h2>
              <p className="text-gray-300 text-lg mt-2">Please complete your check-in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Scan className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">Photo Capture</h3>
                  </div>

                  {showCamera ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full max-w-sm mx-auto rounded-2xl border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/25"
                        />
                        <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 animate-pulse pointer-events-none"></div>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button onClick={capturePhoto} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                          Capture Photo
                        </button>
                        <button onClick={stopCamera} className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : photo ? (
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
                      <button onClick={() => setPhoto('')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-48 h-36 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-500" />
                      </div>
                      <button onClick={startCamera} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 inline-flex items-center gap-3">
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

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
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
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Purpose of Visit *
                  </label>
                  <select
                    value={formData.reasonForVisit}
                    onChange={(e) => handleInputChange('reasonForVisit', e.target.value as ReasonForVisit)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white text-lg transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-800">Select purpose of visit</option>
                    {REASON_OPTIONS.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.reasonForVisit === 'other' && (
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Please specify *
                    </label>
                    <input
                      type="text"
                      value={formData.otherReason}
                      onChange={(e) => handleInputChange('otherReason', e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 text-lg transition-all duration-300"
                      placeholder="Please specify your reason"
                      required
                    />
                  </div>
                )}

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
                    onChange={(e) => handleInputChange('personToMeet', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Enter person or department name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-cyan-500/25 flex items-center justify-center gap-4"
                >
                  <Clock className="w-6 h-6" />
                  Complete Check-In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
