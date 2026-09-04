import { Model, DataTypes, Sequelize } from 'sequelize';

export class Session extends Model {
  declare public id: number;
  declare public user_id: number;
  declare public refresh_token_hash: string;
  declare public device: string | null;
  declare public ip_address: string | null;
  declare public user_agent: string | null;
  declare public expires_at: Date;
  declare public readonly created_at: Date;
  declare public last_used_at: Date;
  declare public user?: any;

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
        refresh_token_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        device: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        last_used_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'user_sessions',
        underscored: true,
        timestamps: true,
        updatedAt: 'last_used_at',
      }
    );
  }
}
