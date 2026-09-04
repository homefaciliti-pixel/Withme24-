'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. cities
    await queryInterface.createTable('cities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 2. users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: true },
      email: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      mobile: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      gender: { type: Sequelize.STRING(20), allowNull: true },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'cities', key: 'id' },
        onDelete: 'SET NULL'
      },
      role: {
        type: Sequelize.ENUM('CUSTOMER', 'COMPANION', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'MODERATOR', 'FINANCE'),
        allowNull: false,
        defaultValue: 'CUSTOMER'
      },
      profile_photo: { type: Sequelize.STRING(255), allowNull: true },
      is_18_plus_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_mobile_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_demo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      account_status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. user_sessions
    await queryInterface.createTable('user_sessions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      refresh_token_hash: { type: Sequelize.STRING(255), allowNull: false },
      device: { type: Sequelize.STRING(100), allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      last_used_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 4. otp_verifications
    await queryInterface.createTable('otp_verifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      mobile: { type: Sequelize.STRING(20), allowNull: false },
      otp_hash: { type: Sequelize.STRING(255), allowNull: false },
      attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      resend_cooldown_until: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 5. activities
    await queryInterface.createTable('activities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      image_url: { type: Sequelize.STRING(255), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 6. companion_profiles
    await queryInterface.createTable('companion_profiles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      bio: { type: Sequelize.TEXT, allowNull: true },
      experience: { type: Sequelize.STRING(255), allowNull: true },
      response_rate: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      verification_status: {
        type: Sequelize.ENUM('NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'NOT_STARTED'
      },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0.00 },
      total_reviews: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_bookings: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      profile_visibility: { type: Sequelize.ENUM('PUBLIC', 'PRIVATE'), allowNull: false, defaultValue: 'PRIVATE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 7. companion_activities
    await queryInterface.createTable('companion_activities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      companion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'activities', key: 'id' },
        onDelete: 'CASCADE'
      },
      price_per_hour: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 8. availability
    await queryInterface.createTable('availability', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      companion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time: { type: Sequelize.STRING(5), allowNull: false },
      end_time: { type: Sequelize.STRING(5), allowNull: false },
      is_booked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 9. kyc_verifications
    await queryInterface.createTable('kyc_verifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      document_type: { type: Sequelize.STRING(50), allowNull: false },
      document_status: {
        type: Sequelize.ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      document_front_url: { type: Sequelize.STRING(255), allowNull: false },
      document_back_url: { type: Sequelize.STRING(255), allowNull: true },
      selfie_url: { type: Sequelize.STRING(255), allowNull: false },
      verification_reference: { type: Sequelize.STRING(100), allowNull: true },
      submitted_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 10. bookings
    await queryInterface.createTable('bookings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      booking_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      companion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'activities', key: 'id' },
        onDelete: 'RESTRICT'
      },
      availability_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'availability', key: 'id' },
        onDelete: 'RESTRICT'
      },
      booking_date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time: { type: Sequelize.STRING(5), allowNull: false },
      end_time: { type: Sequelize.STRING(5), allowNull: false },
      duration: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
      base_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      platform_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tax: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'PAYMENT_PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      payment_status: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      cancellation_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 11. payments
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      order_id: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      transaction_id: { type: Sequelize.STRING(100), allowNull: true },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'INR' },
      payment_provider: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'mock' },
      payment_method: { type: Sequelize.STRING(50), allowNull: true },
      payment_status: {
        type: Sequelize.ENUM('CREATED', 'PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'CREATED'
      },
      signature_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      gateway_response: { type: Sequelize.TEXT, allowNull: true },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 12. transactions
    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'SET NULL'
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'payments', key: 'id' },
        onDelete: 'SET NULL'
      },
      transaction_type: {
        type: Sequelize.ENUM('PAYMENT', 'REFUND', 'COMMISSION', 'PAYOUT', 'ADJUSTMENT'),
        allowNull: false
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'INR' },
      status: {
        type: Sequelize.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      reference: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 13. refunds
    await queryInterface.createTable('refunds', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'payments', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: true },
      refund_reference: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      processed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 14. commissions
    await queryInterface.createTable('commissions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      percentage: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 25.00 },
      gross_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      platform_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      companion_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 15. companion_wallets (wallets)
    await queryInterface.createTable('companion_wallets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      companion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'companion_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      total_earnings: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      available_balance: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      pending_balance: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 16. earnings
    await queryInterface.createTable('earnings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_wallets', key: 'id' },
        onDelete: 'CASCADE'
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'SET NULL'
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'SETTLED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      type: {
        type: Sequelize.ENUM('CREDIT', 'DEBIT'),
        allowNull: false,
        defaultValue: 'CREDIT'
      },
      description: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 17. payouts
    await queryInterface.createTable('payouts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_wallets', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      bank_reference: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUCCESS', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      requested_at: { type: Sequelize.DATE, allowNull: false },
      processed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 18. reviews
    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      companion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companion_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      reply: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 19. reports
    await queryInterface.createTable('reports', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      reporter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      reported_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'SET NULL'
      },
      reason: {
        type: Sequelize.ENUM('HARASSMENT', 'UNSAFE_BEHAVIOUR', 'FRAUD', 'FAKE_PROFILE', 'PROHIBITED_SERVICE', 'THREAT', 'ABUSE', 'SCAM', 'OTHER'),
        allowNull: false
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: {
        type: Sequelize.ENUM('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'OPEN'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      action_taken: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 20. blocks
    await queryInterface.createTable('blocks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      blocker_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      blocked_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 21. notifications
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: { type: Sequelize.STRING(150), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      channel: {
        type: Sequelize.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
        allowNull: false,
        defaultValue: 'IN_APP'
      },
      status: {
        type: Sequelize.ENUM('UNREAD', 'READ'),
        allowNull: false,
        defaultValue: 'UNREAD'
      },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 22. notification_preferences
    await queryInterface.createTable('notification_preferences', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      channel: {
        type: Sequelize.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
        allowNull: false
      },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 23. notification_templates
    await queryInterface.createTable('notification_templates', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      template_key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      channel: {
        type: Sequelize.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
        allowNull: false
      },
      title: { type: Sequelize.STRING(150), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      variables: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 24. moderation_cases
    await queryInterface.createTable('moderation_cases', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      report_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'reports', key: 'id' },
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'),
        allowNull: false,
        defaultValue: 'OPEN'
      },
      severity: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'MEDIUM'
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      internal_notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 25. moderation_actions
    await queryInterface.createTable('moderation_actions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      case_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'moderation_cases', key: 'id' },
        onDelete: 'CASCADE'
      },
      action_type: {
        type: Sequelize.ENUM('WARN', 'SUSPEND', 'BAN', 'RESTORE', 'CONTENT_REMOVAL'),
        allowNull: false
      },
      reason: { type: Sequelize.TEXT, allowNull: false },
      duration_days: { type: Sequelize.INTEGER, allowNull: true },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT'
      },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 26. content_flags
    await queryInterface.createTable('content_flags', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      entity_type: {
        type: Sequelize.ENUM('PROFILE', 'REVIEW', 'ACTIVITY', 'MESSAGE'),
        allowNull: false
      },
      entity_id: { type: Sequelize.INTEGER, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: false },
      flagged_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 27. emergency_contacts
    await queryInterface.createTable('emergency_contacts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      contact_number: { type: Sequelize.STRING(20), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 28. audit_logs
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      action: { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(50), allowNull: false },
      entity_id: { type: Sequelize.INTEGER, allowNull: true },
      old_value: { type: Sequelize.TEXT, allowNull: true },
      new_value: { type: Sequelize.TEXT, allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 29. system_settings
    await queryInterface.createTable('system_settings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      value: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse order to respect foreign key constraints
    await queryInterface.dropTable('system_settings');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.dropTable('content_flags');
    await queryInterface.dropTable('moderation_actions');
    await queryInterface.dropTable('moderation_cases');
    await queryInterface.dropTable('notification_templates');
    await queryInterface.dropTable('notification_preferences');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('blocks');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('payouts');
    await queryInterface.dropTable('earnings');
    await queryInterface.dropTable('companion_wallets');
    await queryInterface.dropTable('commissions');
    await queryInterface.dropTable('refunds');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('kyc_verifications');
    await queryInterface.dropTable('availability');
    await queryInterface.dropTable('companion_activities');
    await queryInterface.dropTable('companion_profiles');
    await queryInterface.dropTable('activities');
    await queryInterface.dropTable('otp_verifications');
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('cities');
  }
};
