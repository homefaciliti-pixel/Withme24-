import { Model, DataTypes, Sequelize } from 'sequelize';

export class Booking extends Model {
  public id!: number;
  public booking_number!: string;
  public customer_id!: number;
  public companion_id!: number;
  public activity_id!: number;
  public availability_id!: number;
  public booking_date!: string;
  public start_time!: string;
  public end_time!: string;
  public duration!: number; // Hours
  public base_price!: number;
  public platform_fee!: number;
  public tax!: number;
  public discount!: number;
  public total_amount!: number;
  public status!: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED';
  public payment_status!: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  public cancellation_reason!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public companion?: any;
  public customer?: any;
  public activity?: any;
  public commission?: any;
  public review?: any;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        booking_number: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
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
        companion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'companion_profiles',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        activity_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'activities',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        availability_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'availability',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        booking_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.STRING(5),
          allowNull: false,
        },
        end_time: {
          type: DataTypes.STRING(5),
          allowNull: false,
        },
        duration: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
        },
        base_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        platform_fee: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        tax: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        discount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
        total_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'PAYMENT_PENDING',
            'CONFIRMED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
            'EXPIRED',
            'DISPUTED'
          ),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        payment_status: {
          type: DataTypes.ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        cancellation_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'bookings',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
