import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, User, Mail, Calendar, Upload, FileText, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useToast } from '../components/Common/Toast';
import api from '../services/api';

export const PartnerRegister: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  // Form Fields
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [documentType, setDocumentType] = useState('Aadhaar');
  const [kycFront, setKycFront] = useState('');
  const [kycBack, setKycBack] = useState('');

  const [otp, setOtp] = useState('');

  const { sendPartnerRegisterOtp, registerPartner } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle image upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setter(res.data.data.url);
        toast('Document/Photo uploaded successfully', 'success');
      }
    } catch (err: any) {
      toast('Failed to upload file. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password || !confirmPassword) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !dateOfBirth) {
      toast('Please complete your profile details', 'error');
      return;
    }
    setStep(3);
  };

  const handleSendOtpStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFront) {
      toast('Please upload Front ID Document for KYC Verification', 'error');
      return;
    }

    let targetMobile = mobile.trim();
    if (!targetMobile.startsWith('+')) {
      targetMobile = `+91${targetMobile.replace(/\D/g, '')}`;
    }

    setLoading(true);
    try {
      const res = await sendPartnerRegisterOtp(targetMobile);
      if (res.success) {
        setMobile(targetMobile);
        toast(res.message, 'info');
        if (res.mockOtp) {
          setMockOtpHint(res.mockOtp);
          setOtp(res.mockOtp);
        }
        setStep(4);
      } else {
        toast(res.message, 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to dispatch OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    try {
      const payload = {
        mobile,
        otp,
        password,
        name,
        email,
        gender,
        date_of_birth: dateOfBirth,
        bio,
        profile_photo: profilePhoto,
        kyc_front: kycFront,
        kyc_back: kycBack,
        document_type: documentType,
      };

      const res = await registerPartner(payload);
      if (res.success) {
        toast('Partner registration submitted successfully!', 'success');
        navigate('/partner/application-status');
      } else {
        toast(res.message || 'Registration failed', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> Back to options
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            <ShieldCheck size={12} /> Partner Onboarding
          </span>
        </div>

        {/* Wizard Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span className={step >= 1 ? 'text-purple-600' : ''}>1. Credentials</span>
            <span className={step >= 2 ? 'text-purple-600' : ''}>2. Profile</span>
            <span className={step >= 3 ? 'text-purple-600' : ''}>3. KYC</span>
            <span className={step >= 4 ? 'text-purple-600' : ''}>4. Verify OTP</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: MOBILE & PASSWORD */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Step 1: Set Account Password</h3>
              <p className="text-xs text-slate-500">You will use this password for all future partner logins.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 99999 99999"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              Continue to Profile Details <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: PROFILE DETAILS & PHOTO */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Step 2: Profile Details</h3>
              <p className="text-xs text-slate-500">Provide public details for your companion profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Legal Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 px-4 text-sm focus:outline-none font-medium"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Date of Birth</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Short Bio</label>
              <textarea
                rows={2}
                placeholder="Tell guests about your personality, interests, and companion services..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl p-3 text-sm focus:outline-none"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Profile Photo</label>
              <div className="flex items-center gap-3">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile preview" className="w-12 h-12 rounded-full object-cover border border-purple-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                )}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setProfilePhoto)} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                Continue to KYC <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: KYC UPLOAD */}
        {step === 3 && (
          <form onSubmit={handleSendOtpStep3} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Step 3: Identity Verification (KYC)</h3>
              <p className="text-xs text-slate-500">Upload official identity documents for mandatory Admin review.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 px-4 text-sm focus:outline-none font-medium"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN Card">PAN Card</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Front Document (Required)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-purple-300 transition-colors">
                  {kycFront ? (
                    <div className="space-y-2">
                      <FileText size={28} className="mx-auto text-purple-600" />
                      <p className="text-[11px] font-bold text-purple-700 truncate">Document Uploaded</p>
                      <label className="cursor-pointer text-[10px] font-bold text-slate-500 underline block">
                        Change File
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setKycFront)} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload size={24} className="mx-auto text-slate-400" />
                      <p className="text-xs font-bold text-slate-600">Upload Front Side</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</p>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setKycFront)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Back Document (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-purple-300 transition-colors">
                  {kycBack ? (
                    <div className="space-y-2">
                      <FileText size={28} className="mx-auto text-purple-600" />
                      <p className="text-[11px] font-bold text-purple-700 truncate">Document Uploaded</p>
                      <label className="cursor-pointer text-[10px] font-bold text-slate-500 underline block">
                        Change File
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setKycBack)} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload size={24} className="mx-auto text-slate-400" />
                      <p className="text-xs font-bold text-slate-600">Upload Back Side</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</p>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setKycBack)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                {loading ? 'Sending Mobile OTP...' : <>Send Mobile OTP <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: VERIFY OTP & COMPLETE */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Step 4: Verify Phone Number</h3>
              <p className="text-xs text-slate-500">Enter the 4-digit OTP sent to {mobile}.</p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none text-center tracking-widest font-black text-lg"
                />
              </div>
              {mockOtpHint && (
                <div className="flex items-center gap-1.5 text-xs text-purple-700 font-medium bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                  <HelpCircle size={14} className="shrink-0 text-purple-600" /> Demo Registration OTP: <span className="font-bold">{mockOtpHint}</span>
                </div>
              )}
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-xs text-purple-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-purple-600" /> Verification Process Information
              </p>
              <p className="text-[11px] leading-relaxed text-purple-700">
                Upon submitting, your application will be placed under Admin Verification (`PENDING_VERIFICATION`). You can log in anytime using your password to track application status.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back to KYC
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                {loading ? 'Submitting Application...' : 'Submit Partner Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
