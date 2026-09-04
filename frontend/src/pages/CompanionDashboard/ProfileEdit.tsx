import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import { Save, Briefcase, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

interface ActivityType {
  id: number;
  name: string;
}

interface CompanionActivitySelection {
  activity_id: number;
  price_per_hour: number;
}

export const CompanionProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [approvedActivities, setApprovedActivities] = useState<ActivityType[]>([]);
  const [selections, setSelections] = useState<CompanionActivitySelection[]>([]);
  const [saving, setSaving] = useState(false);

  // Form controls to add activity selection
  const [actToAdd, setActToAdd] = useState<number | ''>('');
  const [priceToAdd, setPriceToAdd] = useState<number | ''>('');

  useEffect(() => {
    if (user?.profile_photo) {
      setProfilePhoto(user.profile_photo);
    }
    // Load metadata and companion details
    Promise.all([
      api.get('/activities'),
      api.get('/companions'),
    ])
      .then(([actsRes, listRes]) => {
        if (actsRes.data.success) setApprovedActivities(actsRes.data.data);
        
        if (listRes.data.success && user) {
          const selfProfile = listRes.data.data.find((c: any) => c.user.id === user.id);
          if (selfProfile) {
            setBio(selfProfile.bio || '');
            setExperience(selfProfile.experience || '');
            setVisibility(selfProfile.profile_visibility);
            
            const loadedSelections = selfProfile.companion_activities.map((a: any) => ({
              activity_id: a.activity_id,
              price_per_hour: parseFloat(a.price_per_hour),
            }));
            setSelections(loadedSelections);
          }
        }
      })
      .catch((e) => console.error(e));
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingPhoto(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const newPhotoUrl = res.data.data.url;
        setProfilePhoto(newPhotoUrl);
        // Save immediately to user profile
        await api.put('/users/profile', { profile_photo: newPhotoUrl });
        toast('Companion profile photo uploaded & saved!', 'success');
      }
    } catch (err: any) {
      toast('Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddActivity = () => {
    if (!actToAdd || !priceToAdd) return;
    
    // Check if already selected
    const exists = selections.some((s) => s.activity_id === actToAdd);
    if (exists) {
      toast('Activity already added to your profile', 'error');
      return;
    }

    setSelections((prev) => [
      ...prev,
      { activity_id: Number(actToAdd), price_per_hour: Number(priceToAdd) },
    ]);
    setActToAdd('');
    setPriceToAdd('');
  };

  const handleRemoveActivity = (id: number) => {
    setSelections((prev) => prev.filter((s) => s.activity_id !== id));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selections.length === 0) {
      toast('Please offer at least one companion activity', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/companions/profile', {
        bio,
        experience,
        profile_visibility: visibility,
        activities: selections,
      });

      if (res.data.success) {
        toast('Companion profile updated successfully!', 'success');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update profile details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getActivityName = (id: number) => {
    return approvedActivities.find((a) => a.id === id)?.name || 'Unknown Activity';
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="companion" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <h2 className="text-xl font-bold text-slate-800">Edit Companion Profile</h2>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bio & experience */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bio Details</h3>

            {/* Companion Profile Photo Avatar Preview & Upload */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-200 border-2 border-brand-500 shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Companion Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-brand-100 text-brand-700 font-black text-xl">
                    {user?.name ? user.name[0].toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Companion Display Photo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                />
                {uploadingPhoto && <div className="text-[10px] text-brand-600 font-semibold">Uploading photo...</div>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Biography</label>
                <textarea
                  required
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about your personality, conversational styles, and what walks/hobbies you host..."
                  className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Hosting Experience</label>
                <input
                  type="text"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 2 years hosting walks, pottery teacher, local foodie"
                  className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Profile Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full border border-slate-350 bg-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="PUBLIC">Public (Appear in discovery search lists)</option>
                  <option value="PRIVATE">Private (Invisible on discovery)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Note: Profiles must be VERIFIED by the safety team before appearing in public listings.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors ml-auto"
            >
              <Save size={14} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>

          {/* Activities pricing builder */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Briefcase size={15} /> Activities & Pricing
            </h3>

            {/* Add selection */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[9px] uppercase font-extrabold text-slate-400">Add Offered Outing</div>
              <select
                value={actToAdd}
                onChange={(e) => setActToAdd(Number(e.target.value))}
                className="w-full border border-slate-300 bg-white rounded-lg p-2 text-[11px] outline-none"
              >
                <option value="">Select Activity</option>
                {approvedActivities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={priceToAdd}
                onChange={(e) => setPriceToAdd(Number(e.target.value))}
                placeholder="Rate per hour (₹)"
                className="w-full border border-slate-300 bg-white rounded-lg p-2 text-[11px] outline-none"
              />

              <button
                type="button"
                onClick={handleAddActivity}
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-1.5 rounded-lg text-[10px] transition-colors border border-brand-200 flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Activity
              </button>
            </div>

            {/* Selection list */}
            <div className="space-y-2">
              <div className="text-[9px] uppercase font-extrabold text-slate-400">Current Offerings</div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selections.length > 0 ? (
                  selections.map((s) => (
                    <div
                      key={s.activity_id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150"
                    >
                      <div className="max-w-[70%]">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {getActivityName(s.activity_id)}
                        </div>
                        <div className="text-[10px] text-brand-600 font-bold">
                          ₹{s.price_per_hour}/hr
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(s.activity_id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-4">No activities configured.</div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
