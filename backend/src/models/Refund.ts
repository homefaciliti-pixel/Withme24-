import { Model, DataTypes, Sequelize } from 'sequelize';

export class Refund extends Model {
  public id!: number;
  public booking_id!: number;
  public payment_id!: number;
  public amount!: number;
  public reason!: string | null;
  public refund_reference!: string | null;
  public status!: 'PENDING' | 'SUCCESS' | 'FAILED';
  public processed_at!: Date | null;
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
        payment_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'payments',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        refund_reference: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        processed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'refunds',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
