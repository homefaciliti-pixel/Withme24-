import React, { useEffect, useState } from 'react';
import { v1Api } from '../services/api';
import { Compass, Radio, Users, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const ExploreFeed: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [maxDistance, setMaxDistance] = useState(20);

  const { toast } = useToast();

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await v1Api.getExplore(1, 10);
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (e: any) {
      toast('Failed to load explore feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const res = await v1Api.filterExplore({
        gender: genderFilter || undefined,
        max_distance_km: maxDistance,
      });
      if (res.data.success) {
        setItems(res.data.filtered_results || []);
        toast('Filters applied successfully', 'success');
        setFilterOpen(false);
      }
    } catch (e: any) {
      toast('Failed to apply filter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string, name: string) => {
    try {
      const res = await v1Api.sendPartnerRequest(userId, 'act_explore', `Hey ${name}! Saw your profile on Explore.`);
      if (res.data.success) {
        toast(`Partner request sent to ${name}!`, 'success');
      }
    } catch (e: any) {
      toast('Failed to send partner request', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-500/30">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 text-xs font-black px-3.5 py-1 rounded-full border border-purple-500/30">
            <Radio size={14} className="text-emerald-400 animate-pulse" /> Live Feed & Community
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">Explore Companion Feed</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Discover live stream activity sessions, top verified companion hosts, and trending social outings near you.
          </p>
        </div>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-5 py-3 rounded-2xl border border-white/20 backdrop-blur-md transition-all shadow-md active:scale-95 shrink-0"
        >
          <Filter size={16} /> {filterOpen ? 'Hide Filters' : 'Filter Feed'}
        </button>
      </div>

      {/* Filter Modal / Drawer */}
      {filterOpen && (
        <div className="bg-white border border-purple-100 p-6 rounded-3xl shadow-lg space-y-4 max-w-2xl mx-auto animate-fadeIn">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Filter size={16} className="text-purple-600" /> Filter Companion Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-600">Preferred Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="">All Genders</option>
                <option value="Female">Female Hosts</option>
                <option value="Male">Male Hosts</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-600">Max Distance ({maxDistance} km)</label>
              <input
                type="range"
                min={5}
                max={50}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
          <button
            onClick={handleApplyFilter}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Explore Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-4 h-64 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            if (item.type === 'LIVE') {
              return (
                <div key={item.id} className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-3 left-3 bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Radio size={12} className="animate-pulse" /> LIVE STREAM
                    </div>
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      👁️ {item.viewers_count} watching
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Hosted by <span className="font-bold text-purple-700">{item.host}</span></p>
                    <button
                      onClick={() => toast(`Joining live stream session with ${item.host}`, 'info')}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                    >
                      Join Live Session
                    </button>
                  </div>
                </div>
              );
            }
            if (item.type === 'PROFILE') {
              return (
                <div key={item.id} className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-3 left-3 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                      ✓ Verified Companion
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-slate-900 text-base">{item.name}, {item.age}</h3>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{item.distance}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.interests?.map((interest: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {interest}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSendRequest(item.id, item.name)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                    >
                      Send Partner Request
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div key={item.id} className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-slate-800 shadow-xl">
                <div className="space-y-2">
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-purple-500/30">
                    {item.category} Activity
                  </span>
                  <h3 className="font-black text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">📍 {item.distance} • 📅 {item.date}</p>
                </div>
                <button
                  onClick={() => toast(`Activity RSVP registered for ${item.title}`, 'success')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  Join Activity Group
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
