import { Model, DataTypes, Sequelize } from 'sequelize';

export class Transaction extends Model {
  public id!: number;
  public user_id!: number;
  public booking_id!: number | null;
  public payment_id!: number | null;
  public transaction_type!: 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'PAYOUT' | 'ADJUSTMENT';
  public amount!: number;
  public currency!: string;
  public status!: 'PENDING' | 'SUCCESS' | 'FAILED';
  public reference!: string | null;
  public readonly created_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        booking_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'bookings',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        payment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'payments',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        transaction_type: {
          type: DataTypes.ENUM('PAYMENT', 'REFUND', 'COMMISSION', 'PAYOUT', 'ADJUSTMENT'),
          allowNull: false,
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
        status: {
          type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        reference: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'transactions',
        underscored: true,
        timestamps: true,
        updatedAt: false, // Transaction records are immutable log entries
      }
    );
  }
}
