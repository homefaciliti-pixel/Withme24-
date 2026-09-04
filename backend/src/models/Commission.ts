import { Model, DataTypes, Sequelize } from 'sequelize';

export class Commission extends Model {
  public id!: number;
  public booking_id!: number;
  public percentage!: number;
  public gross_amount!: number;
  public platform_amount!: number;
  public companion_amount!: number;
  public readonly created_at!: Date;

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
        percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 25.00,
        },
        gross_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        platform_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        companion_amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'commissions',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
