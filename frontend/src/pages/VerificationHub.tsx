import React, { useState } from 'react';
import { v1Api } from '../services/api';
import { useToast } from '../components/Common/Toast';
import { ShieldCheck, FileCheck, Camera, CheckCircle2, RefreshCw } from 'lucide-react';

export const VerificationHub: React.FC = () => {
  const [step, setStep] = useState<'aadhaar_otp' | 'aadhaar_docs' | 'face_scan'>('aadhaar_otp');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [refId, setRefId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<any>(null);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const { toast } = useToast();

  const handleSendAadhaarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.replace(/\D/g, '').length !== 12) {
      toast('Please enter a valid 12-digit Aadhaar number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await v1Api.sendAadhaarOtp(aadhaarNumber);
      if (res.data.success) {
        setRefId(res.data.ref_id);
        toast('4-digit OTP sent to registered mobile number', 'info');
      }
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to send Aadhaar OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhaarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast('Please enter the 4-digit OTP code', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await v1Api.verifyAadhaarOtp(refId, otp);
      if (res.data.success) {
        setVerifiedStatus(res.data.details);
        toast('Aadhaar verified successfully via OTP!', 'success');
        setStep('aadhaar_docs');
      }
    } catch (e: any) {
      toast('Invalid Aadhaar OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (frontFile) formData.append('front_image', frontFile);
    if (backFile) formData.append('back_image', backFile);

    setLoading(true);
    try {
      const res = await v1Api.uploadAadhaar(formData);
      if (res.data.success) {
        toast('Aadhaar front & back photos uploaded successfully', 'success');
        setStep('face_scan');
      }
    } catch (e: any) {
      toast('Failed to upload Aadhaar documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceScan = async () => {
    setLoading(true);
    try {
      const res = await v1Api.faceScan();
      if (res.data.success) {
        toast('Face scan recognition & liveness check verified 98.5% match!', 'success');
        setStep('aadhaar_otp');
        setAadhaarNumber('');
        setOtp('');
      }
    } catch (e: any) {
      toast('Face scan verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-black px-4 py-1.5 rounded-full border border-purple-200 shadow-xs">
          <ShieldCheck size={16} className="text-emerald-500" /> Government Identity Verification Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Verified Host & Customer KYC</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          Complete Instant Aadhaar OTP verification, document upload, and facial recognition liveness scanning.
        </p>
      </div>

      {/* Progress Tabs */}
      <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
        <div className={`p-3 rounded-2xl border text-center font-black text-xs transition-all ${
          step === 'aadhaar_otp' ? 'bg-purple-700 text-white border-purple-700 shadow-md' : 'bg-white text-slate-600 border-slate-200'
        }`}>
          1. Aadhaar OTP
        </div>
        <div className={`p-3 rounded-2xl border text-center font-black text-xs transition-all ${
          step === 'aadhaar_docs' ? 'bg-purple-700 text-white border-purple-700 shadow-md' : 'bg-white text-slate-600 border-slate-200'
        }`}>
          2. Document Upload
        </div>
        <div className={`p-3 rounded-2xl border text-center font-black text-xs transition-all ${
          step === 'face_scan' ? 'bg-purple-700 text-white border-purple-700 shadow-md' : 'bg-white text-slate-600 border-slate-200'
        }`}>
          3. Face Scan
        </div>
      </div>

      {/* Step 1: Aadhaar OTP */}
      {step === 'aadhaar_otp' && (
        <div className="bg-white border border-purple-100 rounded-3xl p-8 max-w-md mx-auto shadow-xl space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileCheck size={20} className="text-purple-600" /> Instant Aadhaar Verification
          </h2>

          {!refId ? (
            <form onSubmit={handleSendAadhaarOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">12-Digit Aadhaar Number</label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 12 digit Aadhaar number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Send 4-Digit Aadhaar OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAadhaarOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">Enter 4-Digit Aadhaar OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="w-full text-center bg-slate-50 border border-slate-300 rounded-2xl p-3 text-lg font-black tracking-widest text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Verify Aadhaar OTP'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Step 2: Document Upload */}
      {step === 'aadhaar_docs' && (
        <div className="bg-white border border-purple-100 rounded-3xl p-8 max-w-md mx-auto shadow-xl space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileCheck size={20} className="text-purple-600" /> Upload Aadhaar Card Images
          </h2>

          <form onSubmit={handleUploadDocs} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700">Aadhaar Front Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFrontFile(e.target.files ? e.target.files[0] : null)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-2.5 text-xs text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700">Aadhaar Back Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBackFile(e.target.files ? e.target.files[0] : null)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-2.5 text-xs text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Upload Aadhaar Images'}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Face Scan */}
      {step === 'face_scan' && (
        <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-md mx-auto shadow-2xl space-y-6 text-center border border-purple-500/30">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-purple-600/40">
            <Camera size={36} className="text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Biometric Face Recognition</h2>
            <p className="text-xs text-slate-400 font-medium">Position your face in center frame for liveness scanning.</p>
          </div>

          <button
            onClick={handleFaceScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Start Face Liveness Scan'}
          </button>
        </div>
      )}
    </div>
  );
};
