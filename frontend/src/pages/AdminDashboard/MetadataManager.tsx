import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useToast } from '../../components/Common/Toast';
import { MapPin, Compass, Plus, Settings, Sparkles } from 'lucide-react';
import api from '../../services/api';

interface City {
  id: number;
  name: string;
  state: string;
}

interface Activity {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export const AdminMetadataManager: React.FC = () => {
  const { toast } = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Add City Form
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');
  const [addingCity, setAddingCity] = useState(false);

  // Add Activity Form
  const [actName, setActName] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actImage, setActImage] = useState('');
  const [addingAct, setAddingAct] = useState(false);

  const loadMetadata = () => {
    setLoading(true);
    Promise.all([api.get('/cities'), api.get('/activities')])
      .then(([citiesRes, actsRes]) => {
        if (citiesRes.data.success) setCities(citiesRes.data.data);
        if (actsRes.data.success) setActivities(actsRes.data.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName || !cityState) return;

    setAddingCity(true);
    try {
      const res = await api.post('/admin/cities', {
        name: cityName,
        state: cityState,
      });

      if (res.data.success) {
        toast(`Location ${cityName} added successfully`, 'success');
        setCityName('');
        setCityState('');
        loadMetadata();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to register city', 'error');
    } finally {
      setAddingCity(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName || !actDesc || !actImage) return;

    setAddingAct(true);
    try {
      const res = await api.post('/admin/activities', {
        name: actName,
        description: actDesc,
        image_url: actImage,
      });

      if (res.data.success) {
        toast(`Activity ${actName} added successfully`, 'success');
        setActName('');
        setActDesc('');
        setActImage('');
        loadMetadata();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to register activity', 'error');
    } finally {
      setAddingAct(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Metadata Parameters Manager</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Manager (Cities) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={15} /> Add Service City Location
              </h3>
              
              <form onSubmit={handleAddCity} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">City Name</label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">State / Region</label>
                  <input
                    type="text"
                    required
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingCity}
                  className="w-full bg-brand-650 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> {addingCity ? 'Adding...' : 'Add Location'}
                </button>
              </form>
            </div>

            {/* Cities List */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registered Cities</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {cities.map((c) => (
                  <div key={c.id} className="p-2 bg-slate-50 border rounded-lg flex justify-between">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 text-[10px]">{c.state}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Category Manager */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Compass size={15} /> Add Social Outing Activity
              </h3>

              <form onSubmit={handleAddActivity} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Activity Name</label>
                  <input
                    type="text"
                    required
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                    placeholder="e.g. Coffee & Conversation"
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Activity Description</label>
                  <input
                    type="text"
                    required
                    value={actDesc}
                    onChange={(e) => setActDesc(e.target.value)}
                    placeholder="e.g. Meeting up at a local café for friendly banter..."
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Cover Image URL</label>
                  <input
                    type="url"
                    required
                    value={actImage}
                    onChange={(e) => setActImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingAct}
                  className="w-full bg-brand-650 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> {addingAct ? 'Adding...' : 'Add Activity Type'}
                </button>
              </form>
            </div>

            {/* Activities list */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Approved Activities</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {activities.map((a) => (
                  <div key={a.id} className="p-2 bg-slate-50 border rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{a.name}</span>
                      <span className="text-[9px] text-slate-400 leading-normal line-clamp-1">{a.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
