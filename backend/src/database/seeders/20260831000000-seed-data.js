'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Seed Cities
    await queryInterface.bulkInsert('cities', [
      { name: 'Jaipur', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Delhi', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Mumbai', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Bangalore', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Pune', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Hyderabad', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Chandigarh', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Udaipur', is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    const cities = await queryInterface.sequelize.query(
      `SELECT id, name FROM cities;`
    );
    const cityMap = {};
    cities[0].forEach(c => { cityMap[c.name] = c.id; });

    // 2. Seed Activities
    await queryInterface.bulkInsert('activities', [
      {
        name: 'Coffee & Conversation',
        description: 'Meet in a quiet cafe for warm coffee and friendly talks.',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'City Walk',
        description: 'Explore historical sites, parks, and pathways together.',
        image_url: 'https://images.unsplash.com/photo-1517089596392-db9a5e8c8532?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Shopping Companion',
        description: 'Get a second opinion on fashion and navigate local markets.',
        image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Movie / Entertainment',
        description: 'Watch the latest releases in a cinema or attend local theatre shows.',
        image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Events',
        description: 'Attend art gallery openings, books launches, or stand-up shows.',
        image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sports & Fitness',
        description: 'A companion for morning badminton matches, golf, jogging, or gym sessions.',
        image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Hobbies & Activities',
        description: 'Join standard hobby classes like pottery, culinary, or painting sessions.',
        image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Explore the City',
        description: 'Discover tourist attractions, street food hubs, and hidden gems.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const activities = await queryInterface.sequelize.query(
      `SELECT id, name FROM activities;`
    );
    const activityMap = {};
    activities[0].forEach(a => { activityMap[a.name] = a.id; });

    // 3. Seed Emergency Contacts
    await queryInterface.bulkInsert('emergency_contacts', [
      { name: 'National Emergency Number', contact_number: '112', description: 'All-in-one emergency services response in India', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Police Helpline', contact_number: '100', description: 'Direct line to police dispatch', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Women Helpline', contact_number: '1091', description: 'Assistance and protection helpline for women', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'WithMe24 Safety Hotline', contact_number: '+91-9999999999', description: 'Immediate platform mediation support', is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // 4. Seed System Settings
    await queryInterface.bulkInsert('system_settings', [
      { key: 'platform_commission_percentage', value: '25', description: 'Platform booking cut percentage', created_at: new Date(), updated_at: new Date() },
      { key: 'minimum_booking_duration', value: '1', description: 'Minimum booking duration in hours', created_at: new Date(), updated_at: new Date() },
      { key: 'otp_validity_seconds', value: '300', description: 'Validity duration of mobile verification OTP', created_at: new Date(), updated_at: new Date() }
    ]);

    // 5. Seed Notification Templates
    await queryInterface.bulkInsert('notification_templates', [
      {
        template_key: 'otp_sent',
        channel: 'SMS',
        title: 'WithMe24 Verification OTP',
        message: 'Your verification OTP for WithMe24 is {{otp_code}}. Valid for 5 minutes. Do not share this OTP.',
        variables: '["otp_code"]',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        template_key: 'booking_created',
        channel: 'IN_APP',
        title: 'New Booking Request',
        message: 'Hello {{companion_name}}, you have a new booking request for {{activity_name}} on {{booking_date}} at {{start_time}}.',
        variables: '["companion_name","activity_name","booking_date","start_time"]',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        template_key: 'booking_confirmed',
        channel: 'IN_APP',
        title: 'Booking Confirmed!',
        message: 'Congratulations {{customer_name}}, your booking #{{booking_number}} with {{companion_name}} is confirmed.',
        variables: '["customer_name","booking_number","companion_name"]',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 6. Seed Demo Users (including admins and companions)
    await queryInterface.bulkInsert('users', [
      // Admins
      {
        name: 'Amit Patel',
        email: 'admin@withme24.com',
        mobile: '+919876543210',
        date_of_birth: '1985-05-15',
        gender: 'Male',
        city_id: cityMap['Delhi'],
        role: 'ADMIN',
        profile_photo: 'https://randomuser.me/api/portraits/men/1.jpg',
        is_18_plus_verified: true,
        is_mobile_verified: true,
        email_verified: true,
        is_demo: true,
        account_status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Companions
      {
        name: 'Aisha Sharma',
        email: 'aisha@withme24.com',
        mobile: '+919999999991',
        date_of_birth: '1998-04-10',
        gender: 'Female',
        city_id: cityMap['Mumbai'],
        role: 'COMPANION',
        profile_photo: 'https://randomuser.me/api/portraits/women/10.jpg',
        is_18_plus_verified: true,
        is_mobile_verified: true,
        email_verified: true,
        is_demo: true,
        account_status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@withme24.com',
        mobile: '+919999999992',
        date_of_birth: '1996-08-22',
        gender: 'Male',
        city_id: cityMap['Bangalore'],
        role: 'COMPANION',
        profile_photo: 'https://randomuser.me/api/portraits/men/11.jpg',
        is_18_plus_verified: true,
        is_mobile_verified: true,
        email_verified: true,
        is_demo: true,
        account_status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pooja Patel',
        email: 'pooja@withme24.com',
        mobile: '+919999999993',
        date_of_birth: '1999-12-05',
        gender: 'Female',
        city_id: cityMap['Jaipur'],
        role: 'COMPANION',
        profile_photo: 'https://randomuser.me/api/portraits/women/12.jpg',
        is_18_plus_verified: true,
        is_mobile_verified: true,
        email_verified: true,
        is_demo: true,
        account_status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@withme24.com',
        mobile: '+919999999994',
        date_of_birth: '1995-10-18',
        gender: 'Male',
        city_id: cityMap['Jaipur'],
        role: 'COMPANION',
        profile_photo: 'https://randomuser.me/api/portraits/men/12.jpg',
        is_18_plus_verified: true,
        is_mobile_verified: true,
        email_verified: true,
        is_demo: true,
        account_status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const users = await queryInterface.sequelize.query(
      `SELECT id, name, role FROM users;`
    );
    const userMap = {};
    users[0].forEach(u => { userMap[u.name] = u.id; });

    // 7. Seed Companion Profiles
    await queryInterface.bulkInsert('companion_profiles', [
      {
        user_id: userMap['Aisha Sharma'],
        bio: 'Hello! I am a software engineer and avid reader who loves exploring cafes and sharing thoughts on books and tech.',
        experience: '2 years as host',
        response_rate: 98,
        verification_status: 'VERIFIED',
        rating: 4.85,
        total_reviews: 12,
        total_bookings: 18,
        is_available: true,
        profile_visibility: 'PUBLIC',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userMap['Rohan Mehta'],
        bio: 'Fitness enthusiast and photographer. I can guide you around Bangalore, show you great visual spots, or run/workout together.',
        experience: '1 year hosting',
        response_rate: 95,
        verification_status: 'VERIFIED',
        rating: 4.75,
        total_reviews: 8,
        total_bookings: 12,
        is_available: true,
        profile_visibility: 'PUBLIC',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userMap['Pooja Patel'],
        bio: 'Local arts teacher. I love street shopping, teaching pottery, and visiting galleries in Jaipur. Happy to show you around!',
        experience: '3 years host',
        response_rate: 100,
        verification_status: 'VERIFIED',
        rating: 4.95,
        total_reviews: 20,
        total_bookings: 25,
        is_available: true,
        profile_visibility: 'PUBLIC',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userMap['Vikram Singh'],
        bio: 'Explorer and food historian. I know all the local gems and traditional food hubs in Jaipur. Let’s do a city walk!',
        experience: '5 years tour enthusiast',
        response_rate: 92,
        verification_status: 'VERIFIED',
        rating: 4.60,
        total_reviews: 15,
        total_bookings: 22,
        is_available: true,
        profile_visibility: 'PUBLIC',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const companions = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM companion_profiles;`
    );
    const companionMap = {};
    // Map user_id to companion_profile_id
    companions[0].forEach(c => { companionMap[c.user_id] = c.id; });

    // 8. Seed Companion Activities & Pricing
    await queryInterface.bulkInsert('companion_activities', [
      // Aisha's Activities
      { companion_id: companionMap[userMap['Aisha Sharma']], activity_id: activityMap['Coffee & Conversation'], price_per_hour: 400.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Aisha Sharma']], activity_id: activityMap['Explore the City'], price_per_hour: 600.00, created_at: new Date(), updated_at: new Date() },
      
      // Rohan's Activities
      { companion_id: companionMap[userMap['Rohan Mehta']], activity_id: activityMap['Sports & Fitness'], price_per_hour: 500.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Rohan Mehta']], activity_id: activityMap['City Walk'], price_per_hour: 450.00, created_at: new Date(), updated_at: new Date() },
      
      // Pooja's Activities
      { companion_id: companionMap[userMap['Pooja Patel']], activity_id: activityMap['Shopping Companion'], price_per_hour: 350.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Pooja Patel']], activity_id: activityMap['Hobbies & Activities'], price_per_hour: 500.00, created_at: new Date(), updated_at: new Date() },
      
      // Vikram's Activities
      { companion_id: companionMap[userMap['Vikram Singh']], activity_id: activityMap['Explore the City'], price_per_hour: 550.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Vikram Singh']], activity_id: activityMap['City Walk'], price_per_hour: 400.00, created_at: new Date(), updated_at: new Date() }
    ]);

    // 9. Seed Companion Availability
    const today = new Date();
    const formatDate = (daysAhead) => {
      const d = new Date();
      d.setDate(today.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    await queryInterface.bulkInsert('availability', [
      // Aisha's Availability
      { companion_id: companionMap[userMap['Aisha Sharma']], date: formatDate(1), start_time: '10:00', end_time: '12:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Aisha Sharma']], date: formatDate(1), start_time: '14:00', end_time: '16:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Aisha Sharma']], date: formatDate(2), start_time: '09:00', end_time: '11:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      
      // Rohan's Availability
      { companion_id: companionMap[userMap['Rohan Mehta']], date: formatDate(1), start_time: '07:00', end_time: '09:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Rohan Mehta']], date: formatDate(2), start_time: '16:00', end_time: '18:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      
      // Pooja's Availability
      { companion_id: companionMap[userMap['Pooja Patel']], date: formatDate(1), start_time: '11:00', end_time: '13:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Pooja Patel']], date: formatDate(2), start_time: '15:00', end_time: '17:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      
      // Vikram's Availability
      { companion_id: companionMap[userMap['Vikram Singh']], date: formatDate(1), start_time: '10:00', end_time: '13:00', is_booked: false, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Vikram Singh']], date: formatDate(2), start_time: '14:00', end_time: '17:00', is_booked: false, created_at: new Date(), updated_at: new Date() }
    ]);

    // 10. Seed Wallets
    await queryInterface.bulkInsert('companion_wallets', [
      { companion_id: companionMap[userMap['Aisha Sharma']], total_earnings: 2400.00, available_balance: 1800.00, pending_balance: 600.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Rohan Mehta']], total_earnings: 1500.00, available_balance: 1500.00, pending_balance: 0.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Pooja Patel']], total_earnings: 3200.00, available_balance: 3200.00, pending_balance: 0.00, created_at: new Date(), updated_at: new Date() },
      { companion_id: companionMap[userMap['Vikram Singh']], total_earnings: 4500.00, available_balance: 3500.00, pending_balance: 1000.00, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('companion_wallets', null, {});
    await queryInterface.bulkDelete('availability', null, {});
    await queryInterface.bulkDelete('companion_activities', null, {});
    await queryInterface.bulkDelete('companion_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('notification_templates', null, {});
    await queryInterface.bulkDelete('system_settings', null, {});
    await queryInterface.bulkDelete('emergency_contacts', null, {});
    await queryInterface.bulkDelete('activities', null, {});
    await queryInterface.bulkDelete('cities', null, {});
  }
};
