import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
  declare public id: number;
  declare public name: string | null;
  declare public email: string | null;
  declare public mobile: string;
  declare public date_of_birth: string | null;
  declare public gender: string | null;
  declare public city_id: number | null;
  declare public role: 'CUSTOMER' | 'COMPANION' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'MODERATOR' | 'FINANCE';
  declare public profile_photo: string | null;
  declare public is_18_plus_verified: boolean;
  declare public is_mobile_verified: boolean;
  declare public email_verified: boolean;
  declare public is_demo: boolean;
  declare public account_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';
  declare public last_login_at: Date | null;
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
        name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        mobile: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        date_of_birth: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        gender: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        city_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM(
            'CUSTOMER',
            'COMPANION',
            'ADMIN',
            'SUPER_ADMIN',
            'SUPPORT',
            'MODERATOR',
            'FINANCE'
          ),
          allowNull: false,
          defaultValue: 'CUSTOMER',
        },
        profile_photo: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        is_18_plus_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_mobile_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_demo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        account_status: {
          type: DataTypes.ENUM(
            'ACTIVE',
            'INACTIVE',
            'SUSPENDED',
            'BANNED',
            'PENDING'
          ),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
