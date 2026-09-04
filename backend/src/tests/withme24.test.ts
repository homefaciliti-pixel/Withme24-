// Mock models for out-of-the-box test reliability
jest.mock('../models', () => {
  const mockSequelize = {
    transaction: jest.fn((callback) => {
      console.log("DEBUG: mock transaction called!");
      const result = callback({ LOCK: { UPDATE: 'UPDATE' } });
      console.log("DEBUG: mock transaction result promise:", result);
      return result;
    }),
  };
  return {
    sequelize: mockSequelize,
    Sequelize: {},
    __esModule: true,
    User: {
      findByPk: jest.fn(),
    },
    CompanionProfile: {
      findByPk: jest.fn(),
    },
    CompanionActivity: {
      findOne: jest.fn(),
    },
    Availability: {
      findOne: jest.fn(),
      update: jest.fn(),
    },
    Booking: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Commission: {
      create: jest.fn(),
    },
  };
});

import { BookingService } from '../services/booking';
import { sequelize, User, CompanionProfile, Availability, CompanionActivity } from '../models';

describe('WithMe24 Core Business Logic Verification', () => {
  beforeEach(() => {
    (sequelize.transaction as jest.Mock).mockImplementation((callback) => {
      return callback({ LOCK: { UPDATE: 'UPDATE' } });
    });
  });

  test('Should fail booking if Customer is not 18+ verified', async () => {
    const mockUser = { id: 1, is_18_plus_verified: false, account_status: 'ACTIVE' };
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      BookingService.createBooking({
        customerId: 1,
        companionId: 2,
        activityId: 1,
        availabilityId: 10,
      })
    ).rejects.toThrow('CUSTOMER_NOT_18_PLUS');
  });

  test('Should fail booking if Companion is not verified', async () => {
    const mockCustomer = { id: 1, is_18_plus_verified: true, account_status: 'ACTIVE' };
    const mockCompanion = { id: 2, verification_status: 'PENDING', user: { account_status: 'ACTIVE' } };

    (User.findByPk as jest.Mock).mockResolvedValue(mockCustomer);
    (CompanionProfile.findByPk as jest.Mock).mockResolvedValue(mockCompanion);

    await expect(
      BookingService.createBooking({
        customerId: 1,
        companionId: 2,
        activityId: 1,
        availabilityId: 10,
      })
    ).rejects.toThrow('COMPANION_NOT_VERIFIED');
  });

  test('Should prevent double booking if slot is already booked', async () => {
    const mockCustomer = { id: 1, is_18_plus_verified: true, account_status: 'ACTIVE' };
    const mockCompanion = { id: 2, verification_status: 'VERIFIED', user: { account_status: 'ACTIVE' } };
    
    // Simulate that the slot is not found because it is already booked
    (User.findByPk as jest.Mock).mockResolvedValue(mockCustomer);
    (CompanionProfile.findByPk as jest.Mock).mockResolvedValue(mockCompanion);
    (CompanionActivity.findOne as jest.Mock).mockResolvedValue({ price_per_hour: 500 });
    (Availability.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      BookingService.createBooking({
        customerId: 1,
        companionId: 2,
        activityId: 1,
        availabilityId: 10,
      })
    ).rejects.toThrow('SLOT_NOT_AVAILABLE');
  });
});
