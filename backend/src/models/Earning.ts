import { Model, DataTypes, Sequelize } from 'sequelize';

export class Earning extends Model {
  public id!: number;
  public wallet_id!: number;
  public booking_id!: number | null;
  public amount!: number;
  public status!: 'PENDING' | 'SETTLED' | 'CANCELLED';
  public type!: 'CREDIT' | 'DEBIT';
  public description!: string | null;
  public readonly created_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        wallet_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'companion_wallets',
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
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'SETTLED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        type: {
          type: DataTypes.ENUM('CREDIT', 'DEBIT'),
          allowNull: false,
          defaultValue: 'CREDIT',
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'earnings',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
