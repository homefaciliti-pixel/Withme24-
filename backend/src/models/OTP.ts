import { Model, DataTypes, Sequelize } from 'sequelize';

export class OTP extends Model {
  declare public id: number;
  declare public mobile: string;
  declare public otp_hash: string;
  declare public attempts: number;
  declare public resend_cooldown_until: Date | null;
  declare public expires_at: Date;
  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        mobile: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        otp_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        attempts: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        resend_cooldown_until: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'otp_verifications',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
