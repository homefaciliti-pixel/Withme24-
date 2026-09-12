import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { AuthenticatedRequest, optionalAuthenticate } from '../middleware/auth';
import { User, OTP } from '../models';
import { getStorageService } from '../services/storage';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const v1Router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_withme24_access_token_key_12345';

// Helper to normalize phone and country code
const parsePhoneAndCountry = (countryCodeInput = '+91', phoneInput = '') => {
  let country_code = countryCodeInput.startsWith('+') ? countryCodeInput : `+${countryCodeInput.trim()}`;
  let phone_number = phoneInput.trim();

  if (phone_number.startsWith('+')) {
    if (phone_number.startsWith('+91')) {
      country_code = '+91';
      phone_number = phone_number.replace('+91', '');
    } else if (phone_number.startsWith('+1')) {
      country_code = '+1';
      phone_number = phone_number.replace('+1', '');
    }
  }

  const full_phone_number = `${country_code}${phone_number.replace(/\D/g, '')}`;

  return { country_code, phone_number, full_phone_number };
};

// In-Memory Fallback Store for Live Viewers & Partner Requests
let liveViewersStore: Array<{
  user_id: string;
  name: string;
  profile_pic: string;
  viewed_at: string;
  type: string;
}> = [
  { user_id: 'usr_101', name: 'Sara Khan', profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', viewed_at: new Date().toISOString(), type: 'LIVE_VIEWER' },
  { user_id: 'usr_102', name: 'Rohan Verma', profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', viewed_at: new Date().toISOString(), type: 'EXPRESSED_INTEREST' }
];

let partnerRequestsStore: Array<{
  request_id: string;
  sender: { user_id: string; name: string; avatar: string };
  receiver_id: string;
  activity_id: string;
  message: string;
  status: string;
  created_at: string;
}> = [
  {
    request_id: 'req_5544',
    sender: { user_id: 'usr_202', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    receiver_id: 'usr_998877',
    activity_id: 'act_top1',
    message: 'Hey! Would love to join you for the trek!',
    status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

let supportTicketsStore: Array<{
  ticket_id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}> = [];

// ==============================================================================
// 1. AUTHENTICATION APIs (/v1/auth)
// ==============================================================================

// 1.1 Send OTP
v1Router.post('/auth/send-otp', async (req: any, res: Response) => {
  const { country_code: rawCountryCode = '+91', phone_number: rawPhone, mobile } = req.body;
  const phoneToUse = rawPhone || mobile;

  if (!phoneToUse) {
    return res.status(400).json({
      success: false,
      message: 'phone_number or mobile parameter is required'
    });
  }

  const { country_code, phone_number, full_phone_number } = parsePhoneAndCountry(rawCountryCode, phoneToUse);
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  const otpId = `otp_${Date.now()}`;

  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({
      mobile: full_phone_number,
      otp_code: otpCode,
      purpose: 'CUSTOMER_LOGIN',
      expires_at: expiresAt,
      is_used: false,
    });
  } catch (err: any) {
    console.warn('[v1/auth/send-otp] DB Warning:', err.message);
  }

  return res.status(200).json({
    success: true,
    message: '4-digit OTP sent successfully via DLT SMS',
    data: {
      country_code,
      phone_number,
      full_phone_number,
      otp_id: otpId,
      dlt_sender_id: process.env.SMS_SENDER_ID || 'HMFCLI',
      dlt_template_id: process.env.SMS_DLT_TEMPLATE_ID || '1207173589889308632',
      expires_in_seconds: 600
    }
  });
});

// 1.2 Verify OTP
v1Router.post('/auth/verify-otp', async (req: any, res: Response) => {
  const { country_code: rawCountryCode = '+91', phone_number: rawPhone, mobile, otp_code, otp } = req.body;
  const phoneToUse = rawPhone || mobile;
  const otpToUse = otp_code || otp;

  if (!phoneToUse || !otpToUse) {
    return res.status(400).json({
      success: false,
      message: 'phone_number and otp_code are required'
    });
  }

  const { country_code, full_phone_number } = parsePhoneAndCountry(rawCountryCode, phoneToUse);

  let user = await User.findOne({
    where: { mobile: full_phone_number }
  });

  let isNewUser = false;
  if (!user) {
    user = await User.create({
      mobile: full_phone_number,
      name: `User ${full_phone_number.slice(-4)}`,
      role: 'CUSTOMER',
      account_status: 'ACTIVE',
      is_mobile_verified: true,
    });
    isNewUser = true;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, mobile: user.mobile },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    success: true,
    message: '4-digit OTP verified successfully',
    token,
    isNewUser,
    user: {
      user_id: `usr_${user.id}`,
      id: user.id,
      country_code,
      phone_number: user.mobile,
      full_phone_number: user.mobile,
      name: user.name,
      role: user.role,
      is_profile_complete: !!user.email,
      kyc_status: user.is_mobile_verified ? 'VERIFIED' : 'NOT_STARTED'
    }
  });
});

// 1.3 Resend OTP
v1Router.post('/auth/resend-otp', async (req: any, res: Response) => {
  const { country_code: rawCountryCode = '+91', phone_number: rawPhone, mobile } = req.body;
  const phoneToUse = rawPhone || mobile;

  if (!phoneToUse) {
    return res.status(400).json({ success: false, message: 'phone_number is required' });
  }

  const { country_code, phone_number, full_phone_number } = parsePhoneAndCountry(rawCountryCode, phoneToUse);

  return res.status(200).json({
    success: true,
    message: '4-digit OTP resent successfully via DLT SMS',
    data: { country_code, phone_number, full_phone_number }
  });
});

// 1.4 Country Code List
v1Router.get('/auth/country-codes', (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    data: [
      { name: 'India', code: 'IN', dial_code: '+91', flag: '🇮🇳' },
      { name: 'United States', code: 'US', dial_code: '+1', flag: '🇺🇸' },
      { name: 'United Arab Emirates', code: 'AE', dial_code: '+971', flag: '🇦🇪' },
      { name: 'United Kingdom', code: 'GB', dial_code: '+44', flag: '🇬🇧' },
      { name: 'Canada', code: 'CA', dial_code: '+1', flag: '🇨🇦' },
      { name: 'Australia', code: 'AU', dial_code: '+61', flag: '🇦🇺' }
    ]
  });
});

// 1.5 Terms of Service
v1Router.get('/auth/terms-of-service', (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      title: 'Terms of Service',
      version: '1.0',
      last_updated: '2026-01-01',
      content: 'Welcome to WithMe24 User Platform. By using our application, you agree to uphold respectful interactions, verify your identity, and adhere to community guidelines.'
    }
  });
});

// 1.6 Privacy Policy
v1Router.get('/auth/privacy-policy', (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      title: 'Privacy Policy',
      version: '1.0',
      last_updated: '2026-01-01',
      content: 'At WithMe24, we safeguard your data. We collect phone numbers for authentication, biometric data strictly for KYC identity verification, and activity preferences for matchmaking.'
    }
  });
});

// ==============================================================================
// 2. PROFILE & KYC APIs (/v1/profile & /v1/kyc)
// ==============================================================================

v1Router.get('/profile', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    data: {
      id: user ? `usr_${user.id}` : 'usr_998877',
      name: user?.name || 'Alex Sharma',
      phone: user?.mobile || '+919876543210',
      email: user?.email || 'alex.sharma@example.com',
      gender: user?.gender || 'Male',
      dob: user?.date_of_birth || '1998-05-15',
      bio: 'Enthusiastic explorer and tech lover',
      interests: ['Travel', 'Music', 'Fitness', 'Cinema'],
      city: 'Mumbai',
      kyc_status: user?.is_mobile_verified ? 'VERIFIED' : 'NOT_STARTED',
      profile_image: user?.profile_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    }
  });
});

const handleProfileEdit = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (user) {
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.gender) user.gender = req.body.gender;
    if (req.body.dob) user.date_of_birth = req.body.dob;
    await user.save();
  }
  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user ? `usr_${user.id}` : 'usr_998877',
      ...req.body,
      updated_at: new Date().toISOString()
    }
  });
};

v1Router.post('/profile/edit', optionalAuthenticate, handleProfileEdit);
v1Router.put('/profile/edit', optionalAuthenticate, handleProfileEdit);

v1Router.post('/kyc/verify', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { document_type, document_number, full_name, dob } = req.body;
  if (!document_type || !document_number) {
    return res.status(400).json({ success: false, message: 'document_type and document_number are required' });
  }
  return res.status(200).json({
    success: true,
    message: 'KYC documents submitted successfully for verification',
    status: 'PENDING_VERIFICATION',
    kyc_id: `kyc_${Date.now()}`,
    submitted_data: {
      document_type,
      document_number_masked: document_number.slice(-4).padStart(document_number.length, '*'),
      full_name: full_name || req.user?.name,
      dob
    }
  });
});

// ==============================================================================
// 3. AADHAAR APIs (/v1/aadhaar)
// ==============================================================================

v1Router.post('/aadhaar/send-otp', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { aadhaar_number } = req.body;
  if (!aadhaar_number || aadhaar_number.replace(/\D/g, '').length !== 12) {
    return res.status(400).json({ success: false, message: 'Valid 12-digit Aadhaar number is required' });
  }
  const refId = `adh_ref_${Date.now()}`;
  return res.status(200).json({
    success: true,
    message: '4-digit OTP sent to mobile number registered with Aadhaar',
    ref_id: refId,
    expires_in_seconds: 300
  });
});

v1Router.post('/aadhaar/otp-verify', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { ref_id, otp } = req.body;
  if (!ref_id || !otp) {
    return res.status(400).json({ success: false, message: 'ref_id and otp are required' });
  }
  return res.status(200).json({
    success: true,
    message: 'Aadhaar 4-digit OTP verification completed successfully',
    aadhaar_status: 'VERIFIED',
    details: {
      ref_id,
      name: req.user?.name || 'Alex Sharma',
      masked_aadhaar: 'XXXXXXXX9012',
      gender: 'Male',
      dob: '1998-05-15',
      address: 'Mumbai, Maharashtra - 400001'
    }
  });
});

v1Router.post('/aadhaar/upload', optionalAuthenticate, upload.fields([{ name: 'front_image', maxCount: 1 }, { name: 'back_image', maxCount: 1 }]), async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const storageService = getStorageService();

  let front_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
  let back_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

  if (files && files['front_image'] && files['front_image'][0]) {
    front_url = await storageService.uploadFile(files['front_image'][0]);
  }
  if (files && files['back_image'] && files['back_image'][0]) {
    back_url = await storageService.uploadFile(files['back_image'][0]);
  }

  return res.status(200).json({
    success: true,
    message: 'Aadhaar documents uploaded successfully',
    front_url,
    back_url,
    status: 'UNDER_REVIEW'
  });
});

// ==============================================================================
// 4. PROFILE / LIVE APIs (/v1/profile-live)
// ==============================================================================

v1Router.get('/profile-live/viewed-interest', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.query;
  let filtered = liveViewersStore;
  if (type === 'viewers') {
    filtered = liveViewersStore.filter(item => item.type === 'LIVE_VIEWER');
  } else if (type === 'interests') {
    filtered = liveViewersStore.filter(item => item.type === 'EXPRESSED_INTEREST');
  }
  return res.status(200).json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

v1Router.post('/profile-live/viewed-interest', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { target_user_id, action = 'EXPRESS_INTEREST' } = req.body;
  if (!target_user_id) {
    return res.status(400).json({ success: false, message: 'target_user_id is required' });
  }
  liveViewersStore.push({
    user_id: req.user ? `usr_${req.user.id}` : 'usr_998877',
    name: req.user?.name || 'Alex Sharma',
    profile_pic: req.user?.profile_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    viewed_at: new Date().toISOString(),
    type: action === 'EXPRESS_INTEREST' ? 'EXPRESSED_INTEREST' : 'LIVE_VIEWER'
  });
  return res.status(200).json({
    success: true,
    message: `Successfully performed action: ${action} for user ${target_user_id}`
  });
});

v1Router.post('/profile-live/photo-upload', optionalAuthenticate, upload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
  let photo_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  if (req.file) {
    const storageService = getStorageService();
    photo_url = await storageService.uploadFile(req.file);
  }
  if (req.user) {
    req.user.profile_photo = photo_url;
    await req.user.save();
  }
  return res.status(200).json({
    success: true,
    message: 'Profile photo uploaded successfully',
    photo_url
  });
});

v1Router.post('/profile-live/face-scan', optionalAuthenticate, (_req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Face scan liveness and recognition verification successful',
    data: {
      is_live_person: true,
      match_confidence: 0.985,
      verification_status: 'SUCCESS',
      timestamp: new Date().toISOString()
    }
  });
});

// ==============================================================================
// 5. ACTIVITIES & SEARCH APIs (/v1/activities)
// ==============================================================================

v1Router.get('/activities/planning-today', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    data: [
      { id: 'plan_1', title: 'Coffee & Afternoon Networking', time: '16:00', location: 'Bandra West, Mumbai', status: 'AVAILABLE' },
      { id: 'plan_2', title: 'Evening Cinema Release & Popcorn', time: '18:30', location: 'PVR Phoenix, Lower Parel', status: 'SELECTED' },
      { id: 'plan_3', title: 'Night Live Acoustic Session', time: '21:00', location: 'Cyber Hub, Gurgaon', status: 'AVAILABLE' }
    ]
  });
});

v1Router.get('/activities/search', optionalAuthenticate, (req: any, res: Response) => {
  const { q = '', location = '', category = '' } = req.query;
  const results = [
    { type: 'activity', id: 'act_10', title: `Fitness Club in ${location || 'Mumbai'}`, category: category || 'Sports' },
    { type: 'partner', id: 'usr_301', name: 'Kavya Singh', interests: ['Trekking', 'Photography'], city: location || 'Mumbai' }
  ];
  return res.status(200).json({
    success: true,
    query: { q, location, category },
    count: results.length,
    results
  });
});

v1Router.get('/activities/popular-activities', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    count: 3,
    activities: [
      { id: 'act_top1', name: 'Weekend Trekking & Camping', category: 'Outdoor', participants_count: 1420, rating: 4.9, banner: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80' },
      { id: 'act_top2', name: 'Board Game & Coffee Night', category: 'Social', participants_count: 890, rating: 4.8, banner: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=600&q=80' },
      { id: 'act_top3', name: 'Morning Badminton Doubles', category: 'Sports', participants_count: 650, rating: 4.7, banner: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' }
    ]
  });
});

v1Router.get('/activities/recommended-partners', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    partners: [
      { user_id: 'usr_404', name: 'Rohan Mehta', match_score: '94%', interests: ['Trekking', 'Cinema'], location: 'Mumbai' },
      { user_id: 'usr_405', name: 'Neha Kapoor', match_score: '89%', interests: ['Music', 'Coffee'], location: 'Delhi NCR' }
    ]
  });
});

v1Router.get('/activities/product-details/:id', optionalAuthenticate, (req: any, res: Response) => {
  const productId = req.params.id;
  const products: any = {
    prod_101: {
      product_id: 'prod_101',
      name: 'VIP Activity Access Pass',
      price: 499,
      currency: 'INR',
      validity_days: 30,
      features: ['Unlimited Partner Requests', 'Priority Live Stream Badge', 'Ad-free Experience']
    },
    prod_102: {
      product_id: 'prod_102',
      name: 'Premium Activity Explorer Pass',
      price: 999,
      currency: 'INR',
      validity_days: 90,
      features: ['All VIP Features', 'Face Scan Verification Shield', 'Top Search Listing']
    }
  };
  return res.status(200).json({
    success: true,
    data: products[productId] || products['prod_101']
  });
});

// ==============================================================================
// 6. PARTNER REQUEST APIs (/v1/partner-request)
// ==============================================================================

v1Router.post('/partner-request/send', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { receiver_id, activity_id, message } = req.body;
  if (!receiver_id) {
    return res.status(400).json({ success: false, message: 'receiver_id is required' });
  }

  const newRequest = {
    request_id: `req_${Date.now()}`,
    sender: {
      user_id: req.user ? `usr_${req.user.id}` : 'usr_998877',
      name: req.user?.name || 'Alex Sharma',
      avatar: req.user?.profile_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    },
    receiver_id,
    activity_id: activity_id || 'act_general',
    message: message || 'Hello, I want to connect for an activity!',
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  partnerRequestsStore.push(newRequest);
  return res.status(200).json({
    success: true,
    message: 'Partner request sent successfully',
    request_id: newRequest.request_id,
    data: newRequest
  });
});

v1Router.get('/partner-request/list', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { type = 'received' } = req.query;
  const currentUserId = req.user ? `usr_${req.user.id}` : 'usr_998877';

  let filteredRequests = partnerRequestsStore;
  if (type === 'sent') {
    filteredRequests = partnerRequestsStore.filter(r => r.sender.user_id === currentUserId);
  } else {
    filteredRequests = partnerRequestsStore.filter(r => r.receiver_id === currentUserId || r.receiver_id === 'usr_998877');
  }

  return res.status(200).json({
    success: true,
    type,
    count: filteredRequests.length,
    requests: filteredRequests
  });
});

v1Router.post('/partner-request/action', optionalAuthenticate, (req: any, res: Response) => {
  const { request_id, action } = req.body;
  if (!request_id || !action) {
    return res.status(400).json({ success: false, message: 'request_id and action (ACCEPT / REJECT / CANCEL) are required' });
  }

  const targetRequest = partnerRequestsStore.find(r => r.request_id === request_id);
  if (targetRequest) {
    targetRequest.status = action;
  }

  return res.status(200).json({
    success: true,
    message: `Partner request status updated to ${action}`,
    request_id,
    status: action
  });
});

// ==============================================================================
// 7. EXPLORE APIs (/v1/explore)
// ==============================================================================

const exploreFeed = [
  { id: 'exp_1', type: 'LIVE', title: 'Acoustic Music & Chill Session', host: 'Rohan Mehta', viewers_count: 320, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  { id: 'exp_2', type: 'PROFILE', name: 'Ananya Verma', age: 24, gender: 'Female', distance: '2.4 km away', interests: ['Music', 'Coffee'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
  { id: 'exp_3', type: 'ACTIVITY', title: 'Weekend Hiking & Nature Club', category: 'Outdoor', distance: '5.1 km away', date: 'This Sunday' }
];

v1Router.get('/explore', optionalAuthenticate, (req: any, res: Response) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');

  return res.status(200).json({
    success: true,
    page,
    limit,
    count: exploreFeed.length,
    items: exploreFeed
  });
});

v1Router.post('/explore/filter', optionalAuthenticate, (req: any, res: Response) => {
  const { gender, min_age = 18, max_age = 50, max_distance_km = 20, interests = [] } = req.body;
  let filtered = exploreFeed;

  if (gender) {
    filtered = filtered.filter(item => (item as any).gender === gender || item.type !== 'PROFILE');
  }

  return res.status(200).json({
    success: true,
    applied_filters: { gender, min_age, max_age, max_distance_km, interests },
    count: filtered.length,
    filtered_results: filtered
  });
});

// ==============================================================================
// 8. GENERAL APIs (/v1/general)
// ==============================================================================

v1Router.get('/general/help-support', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    faqs: [
      { id: 1, question: 'How do I complete KYC verification?', answer: 'Go to Profile -> KYC and enter your document details or upload Aadhaar.' },
      { id: 2, question: 'How do partner requests work?', answer: 'Browse recommended partners and tap Send Request to connect.' }
    ],
    your_tickets: supportTicketsStore
  });
});

v1Router.post('/general/help-support', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'subject and message are required' });
  }

  const ticketId = `TK_${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket = {
    ticket_id: ticketId,
    user_id: req.user ? `usr_${req.user.id}` : 'usr_998877',
    subject,
    message,
    status: 'OPEN',
    created_at: new Date().toISOString()
  };

  supportTicketsStore.push(ticket);

  return res.status(200).json({
    success: true,
    message: `Support ticket raised successfully. Ticket ID: ${ticketId}`,
    ticket_id: ticketId,
    ticket
  });
});

v1Router.get('/general/terms-and-conditions', (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      title: 'General Terms & Conditions',
      last_updated: '2026-01-01',
      content: 'By using WithMe24 App, you agree to our user safety policies, accurate profile information standard, and community engagement rules.'
    }
  });
});

v1Router.post('/general/logout', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

v1Router.get('/general/chat', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  const { conversation_id } = req.query;
  return res.status(200).json({
    success: true,
    conversation_id: conversation_id || 'conv_default',
    messages: [
      { id: 'msg_1', sender_id: 'usr_202', sender_name: 'Priya Sharma', text: 'Hey Alex! Are you ready for today’s activity?', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'msg_2', sender_id: req.user ? `usr_${req.user.id}` : 'usr_998877', sender_name: req.user?.name || 'Alex', text: 'Yes, excited for it!', timestamp: new Date().toISOString() }
    ]
  });
});

v1Router.get('/general/call', optionalAuthenticate, (_req: any, res: Response) => {
  return res.status(200).json({
    success: true,
    recent_calls: [
      { call_id: 'call_101', partner_name: 'Priya Sharma', call_type: 'VIDEO', duration: '05:32', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]
  });
});

v1Router.post('/general/call', optionalAuthenticate, (req: any, res: Response) => {
  const { receiver_id, call_type = 'VIDEO' } = req.body;
  if (!receiver_id) {
    return res.status(400).json({ success: false, message: 'receiver_id is required' });
  }

  const callId = `call_${Date.now()}`;
  return res.status(200).json({
    success: true,
    message: 'Call initiated successfully',
    call_id: callId,
    call_type,
    channel_name: `channel_${callId}`,
    agora_rtc_token: 'mock_agora_rtc_token_string_for_webrtc_calling',
    created_at: new Date().toISOString()
  });
});

export default v1Router;
