import { Model, DataTypes, Sequelize } from 'sequelize';

export class Payout extends Model {
  public id!: number;
  public wallet_id!: number;
  public amount!: number;
  public bank_reference!: string | null;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';
  public requested_at!: Date;
  public processed_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public wallet?: any;

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
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        bank_reference: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUCCESS', 'FAILED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        requested_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        processed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'payouts',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
