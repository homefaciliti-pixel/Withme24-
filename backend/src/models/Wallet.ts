import { Model, DataTypes, Sequelize } from 'sequelize';

export class Wallet extends Model {
  public id!: number;
  public companion_id!: number;
  public total_earnings!: number;
  public available_balance!: number;
  public pending_balance!: number;
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
        companion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'companion_profiles',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        total_earnings: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
        available_balance: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
        pending_balance: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
      },
      {
        sequelize,
        tableName: 'companion_wallets',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
