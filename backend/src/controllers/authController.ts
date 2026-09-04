import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, OTP, Session, NotificationPreference, CompanionProfile } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { NotificationService } from '../services/notification';

// Helpers to sign tokens
const generateAccessToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'supersecret_withme24_access_token_key_12345',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export class AuthController {
  /**
   * POST /api/auth/send-otp
   */
  public static async sendOtp(req: Request, res: Response) {
    const { mobile } = req.body;

    try {
      const otpCode = process.env.OTP_PROVIDER === 'mock' ? (process.env.MOCK_OTP || '123456') : Math.floor(100000 + Math.random() * 900000).toString();
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(otpCode, salt);
      const expiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10) * 1000);

      // Check for existing OTP record to enforce cooldown
      const existing = await OTP.findOne({ where: { mobile } });
      if (existing && existing.resend_cooldown_until && new Date() < existing.resend_cooldown_until) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP code.',
          error: { code: 'OTP_COOLDOWN' },
        });
      }

      const cooldown = new Date(Date.now() + 60 * 1000); // 1 minute resend cooldown

      if (existing) {
        await existing.update({
          otp_hash: otpHash,
          attempts: 0,
          resend_cooldown_until: cooldown,
          expires_at: expiry,
        });
      } else {
        await OTP.create({
          mobile,
          otp_hash: otpHash,
          attempts: 0,
          resend_cooldown_until: cooldown,
          expires_at: expiry,
        });
      }

      // Send SMS via DLT Gateway / NotificationService
      await NotificationService.sendSmsGateway(mobile, `Your OTP is ${otpCode}`, otpCode);

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        data: (process.env.OTP_PROVIDER === 'mock' || process.env.NODE_ENV === 'development') ? { mockOtp: otpCode } : {},
      });
    } catch (error) {
      console.error('Send OTP Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  public static async verifyOtp(req: Request, res: Response) {
    const { mobile, otp, device, user_agent } = req.body;

    try {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'OTP code is required',
          error: { code: 'OTP_REQUIRED' },
        });
      }

      const otpRecord = await OTP.findOne({ where: { mobile } });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'No OTP requested for this mobile number',
          error: { code: 'NO_OTP_REQUEST' },
        });
      }

      // Check Expiry
      if (new Date() > otpRecord.expires_at) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired, please request a new one',
          error: { code: 'OTP_EXPIRED' },
        });
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum OTP verification attempts exceeded',
          error: { code: 'MAX_ATTEMPTS_EXCEEDED' },
        });
      }

      // Check Match safely
      const matches = otpRecord.otp_hash ? await bcrypt.compare(String(otp), otpRecord.otp_hash) : false;
      if (!matches) {
        await otpRecord.increment('attempts', { by: 1 });
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP code entered',
          error: { code: 'INVALID_OTP' },
        });
      }

      // Success - Clear OTP verification row
      await otpRecord.destroy();

      // Find or Create User
      let user = await User.findOne({ where: { mobile } });
      let isNewUser = false;

      const requestedRole = req.body.role === 'COMPANION' ? 'COMPANION' : 'CUSTOMER';

      if (user) {
        if (requestedRole !== user.role) {
          user.role = requestedRole;
          await user.save();
        }
        if (requestedRole === 'COMPANION') {
          await CompanionProfile.findOrCreate({
            where: { user_id: user.id },
            defaults: {
              user_id: user.id,
              bio: 'Verified Social Host & Companion.',
              experience: 'Social Companion',
              rating: 5.0,
              total_reviews: 0,
              verification_status: 'PENDING',
              profile_visibility: 'PUBLIC',
            },
          });
        }
      } else {
        isNewUser = true;
        user = await User.create({
          mobile,
          is_mobile_verified: true,
          role: requestedRole,
          account_status: 'ACTIVE',
        });

        if (requestedRole === 'COMPANION') {
          await CompanionProfile.findOrCreate({
            where: { user_id: user.id },
            defaults: {
              user_id: user.id,
              bio: 'Verified Social Host & Companion.',
              experience: 'Social Companion',
              rating: 5.0,
              total_reviews: 0,
              verification_status: 'PENDING',
              profile_visibility: 'PUBLIC',
            },
          });
        }

        // Initialize default notification preferences
        await NotificationPreference.bulkCreate([
          { user_id: user.id, channel: 'IN_APP', enabled: true },
          { user_id: user.id, channel: 'SMS', enabled: true },
          { user_id: user.id, channel: 'EMAIL', enabled: true },
        ]);
      }

      // Generate Tokens
      const accessToken = generateAccessToken(user.id, user.role);
      const rawRefreshToken = generateRefreshToken();
      const rfHash = hashToken(rawRefreshToken);

      // Save Session
      const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await Session.create({
        user_id: user.id,
        refresh_token_hash: rfHash,
        device: device || 'Web Browser',
        ip_address: req.ip || '127.0.0.1',
        user_agent: user_agent || req.headers['user-agent'] || null,
        expires_at: sessionExpiry,
      });

      // Update last login
      await user.update({ last_login_at: new Date() });

      // Build DTO
      const userDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profile_photo: user.profile_photo,
        is_18_plus_verified: user.is_18_plus_verified,
      };

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          accessToken,
          refreshToken: rawRefreshToken,
          user: userDto,
          isNewUser,
        },
      });
    } catch (error) {
      console.error('Verify OTP Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/refresh-token
   */
  public static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: { code: 'REFRESH_TOKEN_REQUIRED' },
      });
    }

    try {
      const rfHash = hashToken(refreshToken);
      const session = await Session.findOne({
        where: { refresh_token_hash: rfHash },
        include: [{ model: User, as: 'user' }],
      });

      if (!session || new Date() > session.expires_at) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session. Please login again.',
          error: { code: 'INVALID_SESSION' },
        });
      }

      const user = session.user;
      if (user.account_status === 'BANNED' || user.account_status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: `Your account is ${user.account_status.toLowerCase()}`,
          error: { code: 'ACCOUNT_LOCKED' },
        });
      }

      // Rotate Refresh Token (create new, delete old)
      const newAccessToken = generateAccessToken(user.id, user.role);
      const newRawRefreshToken = generateRefreshToken();
      const newRfHash = hashToken(newRawRefreshToken);

      await session.update({
        refresh_token_hash: newRfHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // sliding expiry
      });

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRawRefreshToken,
        },
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/logout
   */
  public static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required for logout' });
    }

    try {
      const rfHash = hashToken(refreshToken);
      await Session.destroy({ where: { refresh_token_hash: rfHash } });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully from session',
      });
    } catch (error) {
      console.error('Logout Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/auth/me
   */
  public static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const u = req.user;
    const userDto = {
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      date_of_birth: u.date_of_birth,
      gender: u.gender,
      city_id: u.city_id,
      role: u.role,
      profile_photo: u.profile_photo,
      is_18_plus_verified: u.is_18_plus_verified,
      is_mobile_verified: u.is_mobile_verified,
      email_verified: u.email_verified,
      account_status: u.account_status,
      last_login_at: u.last_login_at,
    };

    return res.status(200).json({
      success: true,
      data: userDto,
    });
  }

  /**
   * GET /api/auth/sessions
   */
  public static async getSessions(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
      const sessions = await Session.findAll({
        where: { user_id: req.user.id },
        attributes: ['id', 'device', 'ip_address', 'user_agent', 'last_used_at', 'created_at'],
        order: [['last_used_at', 'DESC']],
      });

      return res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/sessions/logout-all
   */
  public static async logoutAllSessions(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
      // Clear all sessions except current token session if they want, or simple clear all sessions
      await Session.destroy({ where: { user_id: req.user.id } });
      return res.status(200).json({ success: true, message: 'Logged out of all active sessions' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/users/profile
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { name, email, date_of_birth, gender, city_id, profile_photo, role } = req.body;

    const allowedRole = (role === 'COMPANION' || role === 'CUSTOMER') ? role : user.role;

    try {
      await user.update({
        name: name !== undefined ? name : user.name,
        email: email !== undefined ? email : user.email,
        date_of_birth: date_of_birth !== undefined ? date_of_birth : user.date_of_birth,
        gender: gender !== undefined ? gender : user.gender,
        city_id: city_id ? parseInt(city_id, 10) : user.city_id,
        profile_photo: profile_photo !== undefined ? profile_photo : user.profile_photo,
        role: allowedRole,
      });

      if (allowedRole === 'COMPANION') {
        const { CompanionProfile } = require('../models');
        await CompanionProfile.findOrCreate({
          where: { user_id: user.id },
          defaults: {
            user_id: user.id,
            bio: 'Verified Social Host & Companion.',
            experience: 'Social Companion',
            hourly_rate: 500,
            rating: 5.0,
            total_reviews: 0,
            verification_status: 'PENDING',
            profile_visibility: 'PUBLIC',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile details updated successfully',
        data: user,
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
