import React, { useState } from 'react';
import { ArrowLeft, Search, User, Clock, MapPin, Users, Activity } from 'lucide-react';
import { Visitor } from '../types/visitor';

interface CheckOutFormProps {
  visitors: Visitor[];
  onCheckOut: (visitorId: string) => void;
  onBack: () => void;
}

export default function CheckOutForm({ visitors, onCheckOut, onBack }: CheckOutFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
  const [notFound, setNotFound] = useState(false);

  const activeVisitors = visitors.filter(v => !v.checkOutTime);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const visitor = activeVisitors.find(v => 
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phoneNumber && v.phoneNumber.includes(searchTerm))
    );

    if (visitor) {
      setFoundVisitor(visitor);
      setNotFound(false);
    } else {
      setFoundVisitor(null);
      setNotFound(true);
    }
  };

  const handleCheckOut = () => {
    if (foundVisitor) {
      onCheckOut(foundVisitor.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getVisitDuration = (checkInTime: string) => {
    const duration = Date.now() - new Date(checkInTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={onBack}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Check-Out
              </h2>
              <p className="text-gray-300 text-lg mt-2">Complete your visit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Search */}
            <div className="space-y-8">
              {/* Stats Dashboard */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Today's Activity</h3>
                    <p className="text-gray-400 text-sm">Current visitor status</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">{activeVisitors.length}</div>
                    <div className="text-gray-400 text-sm">Active Visitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-400">{visitors.length}</div>
                    <div className="text-gray-400 text-sm">Total Today</div>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-semibold text-white">Find Visitor</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setNotFound(false);
                      setFoundVisitor(null);
                    }}
                    onKeyPress={handleKeyPress}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  <button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3"
                  >
                    <Search className="w-5 h-5" />
                    Search Visitor
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-8">
              {/* Found Visitor */}
              {foundVisitor && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-400 text-sm font-medium">VISITOR FOUND</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {foundVisitor.fullName}
                      </h3>
                      <div className="space-y-3 text-gray-300">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <span><span className="text-gray-400">Meeting:</span> {foundVisitor.personToMeet}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span><span className="text-gray-400">Purpose:</span> {
                            foundVisitor.reasonForVisit === 'other' 
                              ? foundVisitor.otherReason 
                              : foundVisitor.reasonForVisit.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          }</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span><span className="text-gray-400">Duration:</span> {getVisitDuration(foundVisitor.checkInTime)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span><span className="text-gray-400">Arrived:</span> {
                            new Date(foundVisitor.checkInTime).toLocaleString()
                          }</span>
                        </div>
                      </div>
                    </div>
                    {foundVisitor.photo && (
                      <div className="relative">
                        <img
                          src={foundVisitor.photo}
                          alt="Visitor"
                          className="w-20 h-16 rounded-xl object-cover border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/25"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCheckOut}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                  >
                    Complete Check-Out
                  </button>
                </div>
              )}

              {/* Not Found */}
              {notFound && (
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Visitor Not Found</h3>
                  <p className="text-red-300">
                    No active visitor found with that name. Please verify the spelling or contact reception.
                  </p>
                </div>
              )}

              {/* Active Visitors List */}
              {activeVisitors.length > 0 && !foundVisitor && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-emerald-400" />
                    Active Visitors ({activeVisitors.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activeVisitors.map(visitor => (
                      <div
                        key={visitor.id}
                        className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => {
                          setSearchTerm(visitor.fullName);
                          setFoundVisitor(visitor);
                          setNotFound(false);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {visitor.photo ? (
                            <img
                              src={visitor.photo}
                              alt="Visitor"
                              className="w-12 h-9 rounded-lg object-cover border border-white/20"
                            />
                          ) : (
                            <div className="w-12 h-9 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {visitor.fullName}
                            </p>
                            <p className="text-sm text-gray-400">Meeting: {visitor.personToMeet}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-emerald-400 font-medium">
                            {getVisitDuration(visitor.checkInTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(visitor.checkInTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}