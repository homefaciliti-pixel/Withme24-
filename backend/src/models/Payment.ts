import { Model, DataTypes, Sequelize } from 'sequelize';

export class Payment extends Model {
  public id!: number;
  public booking_id!: number;
  public customer_id!: number;
  public order_id!: string;
  public transaction_id!: string | null;
  public amount!: number;
  public currency!: string;
  public payment_provider!: string; // e.g. "razorpay", "mock"
  public payment_method!: string | null; // e.g. "card", "upi", "netbanking"
  public payment_status!: 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CANCELLED';
  public signature_verified!: boolean;
  public gateway_response!: string | null; // JSON Stringified response
  public paid_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        booking_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'bookings',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        order_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        transaction_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING(10),
          allowNull: false,
          defaultValue: 'INR',
        },
        payment_provider: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'mock',
        },
        payment_method: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        payment_status: {
          type: DataTypes.ENUM(
            'CREATED',
            'PENDING',
            'AUTHORIZED',
            'SUCCESS',
            'FAILED',
            'REFUNDED',
            'PARTIALLY_REFUNDED',
            'CANCELLED'
          ),
          allowNull: false,
          defaultValue: 'CREATED',
        },
        signature_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        gateway_response: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        paid_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'payments',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
