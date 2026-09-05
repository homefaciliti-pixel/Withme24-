import React, { useEffect, useState } from 'react';
import { UserNavTabs } from '../../components/Layout/UserNavTabs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import { EyeOff, Save, Trash2 } from 'lucide-react';
import api from '../../services/api';

interface BlockedUser {
  id: number;
  name: string;
  profile_photo: string | null;
}

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Load metadata & blocks
    api.get('/cities').then((res) => {
      if (res.data.success) setCities(res.data.data);
    });
    api.get('/users/blocked').then((res) => {
      if (res.data.success) setBlockedUsers(res.data.data);
    });

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGender(user.gender || '');
      setDob(user.date_of_birth || '');
      setCityId(user.city_id || '');
      setProfilePhoto(user.profile_photo || '');
    }
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
        setProfilePhoto(res.data.data.url);
        toast('Photo uploaded successfully', 'success');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        email,
        gender,
        date_of_birth: dob,
        city_id: cityId || null,
        profile_photo: profilePhoto,
      });

      if (res.data.success) {
        toast('Profile updated successfully', 'success');
        await refreshUser();
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUnblock = async (blockedUserId: number) => {
    try {
      const res = await api.delete(`/users/block/${blockedUserId}`);
      if (res.data.success) {
        toast('User unblocked', 'info');
        setBlockedUsers(blockedUsers.filter((u) => u.id !== blockedUserId));
      }
    } catch (err) {
      toast('Failed to unblock user', 'error');
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <UserNavTabs />
        <h2 className="text-xl font-bold text-slate-800">Profile & Block List</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Edit Profile Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm md:col-span-2 space-y-4">
            {/* Photo Avatar Preview & Upload */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-200 border-2 border-brand-500 shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-brand-100 text-brand-700 font-black text-xl">
                    {name ? name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Profile Photo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                />
                {uploadingPhoto && <div className="text-[10px] text-brand-600 font-semibold">Uploading photo...</div>}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">City</label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(Number(e.target.value))}
                    className="w-full border border-slate-350 bg-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Choose City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-350 bg-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-slate-350 bg-slate-50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors ml-auto"
              >
                <Save size={14} /> {updating ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Block list */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <EyeOff size={14} className="text-slate-400" /> Blocked Members
            </h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {blockedUsers.length > 0 ? (
                blockedUsers.map((bu) => (
                  <div key={bu.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden text-[9px] flex items-center justify-center font-bold">
                        {bu.profile_photo ? (
                          <img src={bu.profile_photo} alt={bu.name} className="h-full w-full object-cover" />
                        ) : (
                          bu.name[0]
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{bu.name}</span>
                    </div>
                    <button
                      onClick={() => handleUnblock(bu.id)}
                      title="Unblock User"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-4">No blocked members.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
