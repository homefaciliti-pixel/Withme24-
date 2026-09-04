import { Sequelize } from 'sequelize';
import databaseConfig = require('../config/database');
import { User } from './User';
import { Session } from './Session';
import { OTP } from './OTP';
import { City } from './City';
import { Activity } from './Activity';
import { CompanionProfile } from './CompanionProfile';
import { CompanionActivity } from './CompanionActivity';
import { Availability } from './Availability';
import { KYCVerification } from './KYCVerification';
import { Booking } from './Booking';
import { Payment } from './Payment';
import { Transaction } from './Transaction';
import { Refund } from './Refund';
import { Commission } from './Commission';
import { Wallet } from './Wallet';
import { Earning } from './Earning';
import { Payout } from './Payout';
import { Review } from './Review';
import { Report } from './Report';
import { Block } from './Block';
import { Notification } from './Notification';
import { NotificationPreference } from './NotificationPreference';
import { NotificationTemplate } from './NotificationTemplate';
import { ModerationCase } from './ModerationCase';
import { ModerationAction } from './ModerationAction';
import { ContentFlag } from './ContentFlag';
import { EmergencyContact } from './EmergencyContact';
import { AuditLog } from './AuditLog';
import { SystemSetting } from './SystemSetting';

const env = process.env.NODE_ENV || 'development';
// @ts-ignore
const config = databaseConfig[env];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable]!, config)
  : new Sequelize(config.database, config.username, config.password, config);

const models = {
  User,
  Session,
  OTP,
  City,
  Activity,
  CompanionProfile,
  CompanionActivity,
  Availability,
  KYCVerification,
  Booking,
  Payment,
  Transaction,
  Refund,
  Commission,
  Wallet,
  Earning,
  Payout,
  Review,
  Report,
  Block,
  Notification,
  NotificationPreference,
  NotificationTemplate,
  ModerationCase,
  ModerationAction,
  ContentFlag,
  EmergencyContact,
  AuditLog,
  SystemSetting,
};

// Initialize models
Object.values(models).forEach((model: any) => {
  if (typeof model.initialize === 'function') {
    model.initialize(sequelize);
  }
});

// Setup relationships
// 1. User Associations
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CompanionProfile, { foreignKey: 'user_id', as: 'companion_profile' });
CompanionProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(KYCVerification, { foreignKey: 'user_id', as: 'kyc_verifications' });
KYCVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customer_bookings' });
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
City.hasMany(User, { foreignKey: 'city_id', as: 'users' });

// 2. CompanionProfile Associations
CompanionProfile.hasMany(CompanionActivity, { foreignKey: 'companion_id', as: 'companion_activities' });
CompanionActivity.belongsTo(CompanionProfile, { foreignKey: 'companion_id', as: 'companion' });

CompanionProfile.hasMany(Availability, { foreignKey: 'companion_id', as: 'availabilities' });
Availability.belongsTo(CompanionProfile, { foreignKey: 'companion_id', as: 'companion' });

CompanionProfile.hasMany(Booking, { foreignKey: 'companion_id', as: 'bookings' });
Booking.belongsTo(CompanionProfile, { foreignKey: 'companion_id', as: 'companion' });

CompanionProfile.hasOne(Wallet, { foreignKey: 'companion_id', as: 'wallet' });
Wallet.belongsTo(CompanionProfile, { foreignKey: 'companion_id', as: 'companion' });

// 3. CompanionActivity Associations
CompanionActivity.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });
Activity.hasMany(CompanionActivity, { foreignKey: 'activity_id', as: 'companion_activities' });

// 4. Booking Associations
Booking.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });
Booking.belongsTo(Availability, { foreignKey: 'availability_id', as: 'availability' });
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Booking.hasOne(Commission, { foreignKey: 'booking_id', as: 'commission' });
Booking.hasOne(Refund, { foreignKey: 'booking_id', as: 'refund' });
Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });

// 5. Payment Associations
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Payment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Payment.hasMany(Transaction, { foreignKey: 'payment_id', as: 'transactions' });

// 6. Transaction Associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Transaction.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

// 7. Refund Associations
Refund.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

// 8. Commission Associations
Commission.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// 9. Wallet, Earning & Payout Associations
Wallet.hasMany(Earning, { foreignKey: 'wallet_id', as: 'earnings' });
Earning.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

Earning.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Wallet.hasMany(Payout, { foreignKey: 'wallet_id', as: 'payouts' });
Payout.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

// 10. Review Associations
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Review.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Review.belongsTo(CompanionProfile, { foreignKey: 'companion_id', as: 'companion' });

// 11. Report & Block Associations
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reported_user_id', as: 'reported_user' });
Report.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Block.belongsTo(User, { foreignKey: 'blocker_id', as: 'blocker' });
Block.belongsTo(User, { foreignKey: 'blocked_id', as: 'blocked' });

// 12. Notification Associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
NotificationPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 13. Moderation & Audit Associations
ModerationCase.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ModerationCase.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });
ModerationCase.belongsTo(User, { foreignKey: 'assigned_to', as: 'moderator' });
ModerationCase.hasMany(ModerationAction, { foreignKey: 'case_id', as: 'actions' });

ModerationAction.belongsTo(ModerationCase, { foreignKey: 'case_id', as: 'case' });
ModerationAction.belongsTo(User, { foreignKey: 'performed_by', as: 'admin' });

ContentFlag.belongsTo(User, { foreignKey: 'flagged_by', as: 'flagger' });

AuditLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

export {
  sequelize,
  Sequelize,
  User,
  Session,
  OTP,
  City,
  Activity,
  CompanionProfile,
  CompanionActivity,
  Availability,
  KYCVerification,
  Booking,
  Payment,
  Transaction,
  Refund,
  Commission,
  Wallet,
  Earning,
  Payout,
  Review,
  Report,
  Block,
  Notification,
  NotificationPreference,
  NotificationTemplate,
  ModerationCase,
  ModerationAction,
  ContentFlag,
  EmergencyContact,
  AuditLog,
  SystemSetting,
};
